-- Jeden program, jedna cena: samostatným zákazníkem může být obec, škola
-- nebo spolek. Škola/spolek pod obcí nadále může čerpat přístup obce.
-- Jde o rozšiřující, zpětně kompatibilní krok: nové záznamy používají
-- kanonické hodnoty, ale po dobu nasazení zůstávají platné i historické
-- hodnoty 'obec' a 'spolek'. Jejich datové dočištění patří až do
-- samostatné následné migrace po ověření nové verze aplikace.

alter table public.organizations
  add column if not exists legal_identifier text,
  add column if not exists registered_address text;

-- Registrační číslo obce se dál generuje automaticky. Samostatná škola
-- ani spolek je nepotřebují; škola používá svůj chráněný join_code.
create or replace function public.generate_obec_registration_number()
returns trigger
language plpgsql
as $$
begin
  if new.org_type in ('municipality', 'obec') and new.registration_number is null then
    new.registration_number :=
      lpad((((nextval('obec_registration_seq') * 4001 + 777) % 10000))::text, 4, '0');
  end if;
  return new;
end;
$$;

-- Číslo spolku se generuje jen u spolku zapojeného pod obcí. Samostatný
-- spolek má parent_organization_id NULL a vlastní stav předplatného.
create or replace function public.generate_spolek_registration_number()
returns trigger
language plpgsql
as $$
declare
  parent_reg text;
  activity_sort int;
  existing_count int;
begin
  if new.org_type in ('association', 'spolek')
     and new.parent_organization_id is not null
     and new.registration_number is null then
    if new.primary_activity_code is null then
      raise exception 'spolek zapojený pod obcí musí mít primary_activity_code';
    end if;

    select registration_number into parent_reg
    from public.organizations
    where id = new.parent_organization_id
      and org_type in ('municipality', 'obec');

    if parent_reg is null then
      raise exception 'nadřazená obec nemá platné registration_number';
    end if;

    select sort_order into activity_sort
    from public.activity_categories
    where code = new.primary_activity_code;

    if activity_sort is null then
      raise exception 'neznámý kód činnosti: %', new.primary_activity_code;
    end if;

    select count(*) into existing_count
    from public.organizations
    where parent_organization_id = new.parent_organization_id
      and primary_activity_code = new.primary_activity_code
      and org_type in ('association', 'spolek');

    new.registration_number :=
      parent_reg
      || '-' || lpad(activity_sort::text, 2, '0')
      || '-' || lpad((existing_count + 1)::text, 2, '0');
  end if;
  return new;
end;
$$;

-- Generická kontrola duplicit. Samotný e-mail ani samotný název
-- nejsou identita organizace: jedna osoba může spravovat více subjektů
-- a stejný název mohou mít subjekty na různých adresách.
create or replace function public.find_conflicting_customer(
  p_org_type text,
  p_email text,
  p_name text,
  p_legal_identifier text default null,
  p_address text default null
)
returns table (id uuid, license_status text)
language sql
stable
set search_path = public
as $$
  select o.id, o.license_status
  from public.organizations o
  where (
      o.org_type = p_org_type
      or (p_org_type = 'municipality' and o.org_type = 'obec')
      or (p_org_type = 'association' and o.org_type = 'spolek')
    )
    and o.license_status in ('pending_approval', 'active', 'suspended')
    and (
      (
        p_legal_identifier is not null
        and btrim(p_legal_identifier) <> ''
        and regexp_replace(coalesce(o.legal_identifier, ''), '[^0-9]', '', 'g') =
            regexp_replace(p_legal_identifier, '[^0-9]', '', 'g')
        and (
          p_org_type <> 'school'
          or unaccent(lower(btrim(o.name))) = unaccent(lower(btrim(p_name)))
        )
      )
      or (
        unaccent(lower(btrim(o.name))) = unaccent(lower(btrim(p_name)))
        and p_address is not null
        and btrim(p_address) <> ''
        and (
          unaccent(lower(btrim(coalesce(o.registered_address, '')))) =
              unaccent(lower(btrim(p_address)))
          or exists (
            select 1
            from public.access_requests request
            where request.organization_id = o.id
              and unaccent(lower(btrim(request.address))) =
                  unaccent(lower(btrim(p_address)))
          )
        )
      )
    )
  limit 1;
$$;

revoke all on function public.find_conflicting_customer(text, text, text, text, text)
  from public, anon, authenticated;
grant execute on function public.find_conflicting_customer(text, text, text, text, text)
  to service_role;

revoke all on function public.find_conflicting_obec(text, text)
  from public, anon, authenticated;

-- Atomická rezervace čekajícího zákazníka brání souběžnému dvojímu
-- odeslání. Funkce je dostupná jen service_role používané serverovým API.
create or replace function public.create_pending_customer(
  p_name text,
  p_org_type text,
  p_legal_identifier text,
  p_address text,
  p_contact_name text,
  p_contact_email text,
  p_contact_phone text
)
returns table (id uuid, registration_number text)
language plpgsql
security definer
set search_path = public
as $$
declare
  conflicting_id uuid;
begin
  if p_org_type not in ('municipality', 'school', 'association') then
    raise exception 'neplatný typ zákazníka';
  end if;

  perform pg_advisory_xact_lock(
    hashtextextended(
      p_org_type || ':' || unaccent(lower(btrim(p_name))),
      0
    )
  );

  select conflict.id into conflicting_id
  from public.find_conflicting_customer(
    p_org_type,
    p_contact_email,
    p_name,
    p_legal_identifier,
    p_address
  ) conflict
  limit 1;

  if conflicting_id is not null then
    raise exception using errcode = '23505', message = 'customer already exists';
  end if;

  return query
  insert into public.organizations (
    name,
    org_type,
    status,
    license_status,
    legal_identifier,
    registered_address,
    contact_name,
    contact_email,
    contact_phone
  ) values (
    btrim(p_name),
    p_org_type,
    'inactive',
    'pending_approval',
    nullif(btrim(p_legal_identifier), ''),
    btrim(p_address),
    btrim(p_contact_name),
    lower(btrim(p_contact_email)),
    nullif(btrim(p_contact_phone), '')
  )
  returning organizations.id, organizations.registration_number;
end;
$$;

revoke all on function public.create_pending_customer(text, text, text, text, text, text, text)
  from public, anon, authenticated;
grant execute on function public.create_pending_customer(text, text, text, text, text, text, text)
  to service_role;

-- Aktivace je společná pro obec, samostatnou školu i samostatný spolek.
create or replace function public.activate_customer_with_admin(
  p_organization_id uuid,
  p_user_id uuid,
  p_email text,
  p_full_name text,
  p_must_set_password boolean default false
)
returns table (organization_id uuid, registration_number text)
language plpgsql
security definer
set search_path = public
as $$
declare
  customer public.organizations%rowtype;
begin
  if not public.is_admin() then
    raise exception 'Tuto akci může provést pouze správce platformy.';
  end if;

  select * into customer
  from public.organizations
  where id = p_organization_id
    and org_type in ('municipality', 'obec', 'school', 'association', 'spolek')
    and parent_organization_id is null
  for update;

  if not found then
    raise exception 'Zákazník nebyl nalezen.';
  end if;

  insert into public.profiles (
    id, email, full_name, is_active, must_set_password, active_organization_id
  ) values (
    p_user_id, lower(trim(p_email)), trim(p_full_name), true,
    p_must_set_password, customer.id
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = excluded.full_name,
    is_active = true,
    must_set_password = case
      when p_must_set_password then true else profiles.must_set_password
    end,
    active_organization_id = customer.id;

  insert into public.organization_members (
    organization_id, user_id, role_in_org, status
  ) values (
    customer.id, p_user_id, 'organization_admin', 'active'
  )
  on conflict (user_id, organization_id) do update set
    role_in_org = 'organization_admin',
    status = 'active';

  update public.organizations
  set license_status = 'active', status = 'active'
  where id = customer.id;

  return query select customer.id, customer.registration_number;
end;
$$;

revoke all on function public.activate_customer_with_admin(uuid, uuid, text, text, boolean)
  from public, anon;
grant execute on function public.activate_customer_with_admin(uuid, uuid, text, text, boolean)
  to authenticated;

-- Zpětná kompatibilita pro starší serverovou cestu aktivace obce.
create or replace function public.activate_municipality_with_admin(
  p_organization_id uuid,
  p_user_id uuid,
  p_email text,
  p_full_name text,
  p_must_set_password boolean default false
)
returns table (organization_id uuid, registration_number text)
language sql
security definer
set search_path = public
as $$
  select * from public.activate_customer_with_admin(
    p_organization_id,
    p_user_id,
    p_email,
    p_full_name,
    p_must_set_password
  );
$$;

-- Efektivní přístup je vlastní aktivní předplatné NEBO aktivní
-- předplatné nadřazené obce. Stav organizace však musí být aktivní;
-- rodičovská obec tím nikdy nezískává právo spravovat data dítěte.
create or replace function public.get_my_organizations(
  requested_ids uuid[] default null
)
returns table (
  id uuid,
  name text,
  org_type text,
  status text,
  parent_organization_id uuid,
  license_status text,
  license_valid_until timestamptz,
  join_code text,
  registration_number text,
  is_system boolean,
  role_in_org text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    child.id,
    child.name,
    child.org_type,
    child.status,
    child.parent_organization_id,
    case
      when child.status <> 'active' then 'inactive'
      when child.license_status = 'active'
        and (child.license_valid_until is null or child.license_valid_until >= now())
        then 'active'
      when parent.status = 'active'
        and parent.org_type in ('municipality', 'obec')
        and parent.license_status = 'active'
        and (parent.license_valid_until is null or parent.license_valid_until >= now())
        then 'active'
      when child.license_status = 'suspended' or parent.license_status = 'suspended'
        then 'suspended'
      when child.license_status = 'pending_approval' or parent.license_status = 'pending_approval'
        then 'pending_approval'
      else 'inactive'
    end as license_status,
    case
      when child.license_status = 'active'
        and (child.license_valid_until is null or child.license_valid_until >= now())
        then child.license_valid_until
      when parent.status = 'active'
        and parent.org_type in ('municipality', 'obec')
        and parent.license_status = 'active'
        and (parent.license_valid_until is null or parent.license_valid_until >= now())
        then parent.license_valid_until
      else null
    end as license_valid_until,
    case
      when member.role_in_org = 'organization_admin' or is_admin()
        then child.join_code
      else null
    end as join_code,
    case
      when member.role_in_org = 'organization_admin' or is_admin()
        then child.registration_number
      else null
    end as registration_number,
    child.is_system,
    member.role_in_org
  from public.organization_members member
  join public.organizations child on child.id = member.organization_id
  left join public.organizations parent on parent.id = child.parent_organization_id
  where member.user_id = auth.uid()
    and member.status = 'active'
    and (requested_ids is null or child.id = any(requested_ids));
$$;

revoke all on function public.get_my_organizations(uuid[]) from public, anon;
grant execute on function public.get_my_organizations(uuid[]) to authenticated;
