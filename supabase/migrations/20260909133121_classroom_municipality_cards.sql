alter table public.organizations
  add column classroom_eligibility_reference text,
  add column license_activation_basis text,
  add column school_izo text;
create unique index organizations_school_izo_unique on public.organizations(school_izo)
  where school_izo is not null;
alter table public.organizations add constraint school_izo_format
  check (school_izo is null or (org_type = 'school' and school_izo ~ '^[0-9]{9}$'));

-- Admin-only basic municipality cards. Licence starts once, on creation.
-- CLI generation was attempted but its download was unavailable in this runtime.
create table public.municipality_card_changes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  actor_id uuid not null references auth.users(id),
  changed_at timestamptz not null default now(),
  action text not null check (action in ('created', 'updated', 'activated')),
  previous_values jsonb,
  current_values jsonb not null
);
alter table public.municipality_card_changes enable row level security;
revoke all on public.municipality_card_changes from public, anon, authenticated, service_role;
grant select, insert on public.municipality_card_changes to authenticated;
grant select on public.municipality_card_changes to service_role;
create policy municipality_card_admin_read on public.municipality_card_changes
  for select to authenticated using (public.is_platform_admin());
create policy municipality_card_admin_insert on public.municipality_card_changes
  for insert to authenticated with check (
    public.is_platform_admin() and actor_id = (select auth.uid())
  );

create function public.save_classroom_municipality_card(
  p_organization_id uuid,
  p_name text,
  p_legal_identifier text,
  p_address text,
  p_contact_name text,
  p_contact_email text,
  p_contact_phone text,
  p_classroom_verified boolean,
  p_eligibility_reference text,
  p_activate_license boolean default false
)
returns table (id uuid, registration_number text)
language plpgsql security invoker set search_path = ''
as $$
declare
  target public.organizations%rowtype;
  before_values jsonb;
  conflict_id uuid;
  clean_name text := btrim(coalesce(p_name, ''));
  clean_ico text := nullif(regexp_replace(coalesce(p_legal_identifier, ''), '[[:space:]]', '', 'g'), '');
  clean_address text := nullif(btrim(coalesce(p_address, '')), '');
  clean_contact text := nullif(btrim(coalesce(p_contact_name, '')), '');
  clean_email text := nullif(lower(btrim(coalesce(p_contact_email, ''))), '');
  clean_phone text := nullif(btrim(coalesce(p_contact_phone, '')), '');
  starts_at timestamptz := date_trunc('day', now() at time zone 'Europe/Prague') at time zone 'Europe/Prague';
begin
  if (select auth.uid()) is null or not public.is_platform_admin() then
    raise exception using errcode = '42501', message = 'Platform admin required';
  end if;
  if char_length(clean_name) not between 2 and 160
    or (clean_ico is not null and clean_ico !~ '^[0-9]{8}$')
    or char_length(clean_address) > 300
    or char_length(clean_contact) > 120
    or char_length(clean_email) > 254
    or (clean_email is not null and clean_email !~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$')
    or char_length(clean_phone) > 32 then
    raise exception using errcode = '22023', message = 'Invalid municipality details';
  end if;
  if (p_organization_id is null or p_activate_license) and (p_classroom_verified is distinct from true
    or char_length(btrim(coalesce(p_eligibility_reference, ''))) not between 5 and 500) then
    raise exception using errcode = '22023', message = 'Classroom eligibility must be confirmed';
  end if;

  -- Same name-lock convention as create_pending_customer; includes accents.
  perform pg_advisory_xact_lock(hashtextextended('municipality:' || public.unaccent(lower(clean_name)), 0));
  if clean_ico is not null then
    perform pg_advisory_xact_lock(hashtextextended('municipality-ico:' || clean_ico, 0));
  end if;

  if p_organization_id is not null then
    select o.* into target from public.organizations o
      where o.id = p_organization_id and o.org_type in ('municipality', 'obec')
        and o.parent_organization_id is null for update;
    if not found then
      raise exception using errcode = 'P0002', message = 'Municipality not found';
    end if;
    before_values := to_jsonb(target);
    if p_activate_license and (target.license_started_at is not null or target.activated_at is not null or target.license_status='active') then
      raise exception using errcode='22023',message='An existing licence cannot be renewed through the basic card';
    end if;
  end if;

  select o.id into conflict_id from public.organizations o
    where o.org_type in ('municipality', 'obec')
      and (p_organization_id is null or o.id <> p_organization_id)
      and (
        public.unaccent(lower(btrim(o.name))) = public.unaccent(lower(clean_name))
        or (clean_ico is not null and (
          regexp_replace(coalesce(o.legal_identifier, ''), '[^0-9]', '', 'g') = clean_ico
          or regexp_replace(coalesce(o.ico, ''), '[^0-9]', '', 'g') = clean_ico
        ))
      ) order by o.created_at limit 1;
  if conflict_id is not null then
    raise exception using errcode = '23505', message = 'Municipality already exists', detail = conflict_id::text;
  end if;

  if p_organization_id is null then
    insert into public.organizations (
      name, org_type, status, license_status, legal_identifier, ico, registered_address,
      contact_name, contact_email, contact_phone, license_plan,
      license_started_at, license_valid_until, contract_status, billing_status,
      activated_at, activated_by, classroom_eligibility_verified_at, classroom_eligibility_verified_by,
      classroom_eligibility_reference, license_activation_basis
    ) values (
      clean_name, 'municipality', 'active', 'active', clean_ico, clean_ico, clean_address,
      clean_contact, clean_email, clean_phone, 'classroom_free_12m',
      starts_at,
      ((starts_at at time zone 'Europe/Prague' + interval '1 year') at time zone 'Europe/Prague') - interval '1 microsecond',
      'pending', 'not_applicable', now(), (select auth.uid()), now(), (select auth.uid()),
      btrim(p_eligibility_reference), 'internal_classroom_free_access_program'
    ) returning * into target;
  else
    -- Updating a card must never activate, renew, or otherwise change a licence.
    update public.organizations o set
      name = clean_name, legal_identifier = clean_ico, ico = clean_ico, registered_address = clean_address,
      contact_name = clean_contact, contact_email = clean_email, contact_phone = clean_phone
    where o.id = p_organization_id returning * into target;
    if p_activate_license then
      update public.organizations o set status='active',license_status='active',license_plan='classroom_free_12m',
        license_started_at=starts_at,
        license_valid_until=((starts_at at time zone 'Europe/Prague' + interval '1 year') at time zone 'Europe/Prague') - interval '1 microsecond',
        billing_status='not_applicable',activated_at=now(),activated_by=(select auth.uid()),
        classroom_eligibility_verified_at=now(),classroom_eligibility_verified_by=(select auth.uid()),
        classroom_eligibility_reference=btrim(p_eligibility_reference),license_activation_basis='internal_classroom_free_access_program'
      where o.id=p_organization_id returning * into target;
    end if;
  end if;

  insert into public.municipality_card_changes(organization_id, actor_id, action, previous_values, current_values)
    values (target.id, (select auth.uid()), case when p_organization_id is null then 'created' when p_activate_license then 'activated' else 'updated' end,
      before_values, to_jsonb(target));
  return query select target.id, target.registration_number;
end;
$$;
revoke all on function public.save_classroom_municipality_card(uuid,text,text,text,text,text,text,boolean,text,boolean)
  from public, anon, authenticated, service_role;
grant execute on function public.save_classroom_municipality_card(uuid,text,text,text,text,text,text,boolean,text,boolean)
  to authenticated;

-- Use unambiguous character classes for child contact validation.
-- #145: Only a platform administrator may create a school or association
-- under a municipality. The organization and an optional association activity
-- are created in one PostgreSQL transaction. No membership or inherited access
-- is created by this operation.

create or replace function public.create_municipality_child_organization(
  p_municipality_id uuid,
  p_name text,
  p_org_type text,
  p_legal_identifier text,
  p_address text,
  p_contact_name text,
  p_contact_email text,
  p_contact_phone text,
  p_primary_activity_code text,
  p_primary_activity_custom_text text
)
returns table (
  organization_id uuid,
  organization_name text,
  organization_type text,
  parent_organization_id uuid,
  registration_number text
)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  municipality public.organizations%rowtype;
  conflicting_id uuid;
  created_organization public.organizations%rowtype;
  clean_name text := btrim(coalesce(p_name, ''));
  clean_type text := btrim(coalesce(p_org_type, ''));
  clean_legal_identifier text := nullif(regexp_replace(coalesce(p_legal_identifier, ''), '[[:space:]]', '', 'g'), '');
  clean_address text := btrim(coalesce(p_address, ''));
  clean_contact_name text := btrim(coalesce(p_contact_name, ''));
  clean_contact_email text := lower(btrim(coalesce(p_contact_email, '')));
  clean_contact_phone text := nullif(btrim(coalesce(p_contact_phone, '')), '');
  clean_activity_code text := nullif(btrim(coalesce(p_primary_activity_code, '')), '');
  clean_activity_custom_text text := nullif(btrim(coalesce(p_primary_activity_custom_text, '')), '');
begin
  if (select auth.uid()) is null or not public.is_platform_admin() then
    raise exception 'Tuto akci může provést pouze platformový administrátor.';
  end if;

  if p_municipality_id is null then
    raise exception 'Obec je povinná.';
  end if;

  if clean_type not in ('school', 'association') then
    raise exception 'Lze založit pouze školu nebo spolek.';
  end if;

  if char_length(clean_name) < 2 or char_length(clean_name) > 160 then
    raise exception 'Název musí mít 2 až 160 znaků.';
  end if;

  if char_length(clean_address) < 2 or char_length(clean_address) > 300 then
    raise exception 'Adresa musí mít 2 až 300 znaků.';
  end if;

  if (clean_type <> 'school' or clean_contact_name <> '')
     and (char_length(clean_contact_name) < 2 or char_length(clean_contact_name) > 120) then
    raise exception 'Kontaktní osoba musí mít 2 až 120 znaků.';
  end if;

  if (clean_type <> 'school' or clean_contact_email <> '') and (char_length(clean_contact_email) > 254
     or clean_contact_email !~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$') then
    raise exception 'Kontaktní e-mail nemá platný formát.';
  end if;

  if clean_contact_phone is not null
     and (char_length(clean_contact_phone) < 6 or char_length(clean_contact_phone) > 32) then
    raise exception 'Telefon musí mít 6 až 32 znaků.';
  end if;

  if clean_legal_identifier is not null and clean_legal_identifier !~ '^[0-9]{8}$' then
    raise exception 'IČO musí obsahovat přesně 8 číslic.';
  end if;

  if clean_type = 'school' then
    clean_activity_code := null;
    clean_activity_custom_text := null;
  else
    if clean_activity_code is null or not exists (
      select 1
      from public.activity_categories activity
      where activity.code = clean_activity_code
        and activity.section = 'spolky'
        and activity.is_active
    ) then
      raise exception 'Vyberte platnou činnost spolku.';
    end if;

    if clean_activity_code = 'jine' and clean_activity_custom_text is null then
      raise exception 'U činnosti Jiné je povinný vlastní popis.';
    end if;

    if clean_activity_custom_text is not null
       and char_length(clean_activity_custom_text) > 500 then
      raise exception 'Popis činnosti může mít nejvýše 500 znaků.';
    end if;
  end if;

  -- The parent row is the first and common lock for every child creation in
  -- one municipality. It also serializes the count-based association number
  -- trigger and makes duplicate checks deterministic.
  select organization.*
  into municipality
  from public.organizations organization
  where organization.id = p_municipality_id
  for update;

  if not found or municipality.org_type not in ('municipality', 'obec')
     or municipality.parent_organization_id is not null then
    raise exception 'Obec nebyla nalezena.';
  end if;

  if municipality.status is distinct from 'active'
     or municipality.license_status is distinct from 'active'
     or (municipality.license_valid_until is not null
         and municipality.license_valid_until < now()) then
    raise exception 'Organizaci lze připojit pouze pod aktivní licenci obce.';
  end if;

  if exists (
    select 1
    from public.organizations organization
    where organization.parent_organization_id = municipality.id
      and organization.org_type = clean_type
      and lower(btrim(organization.name)) = lower(clean_name)
  ) then
    raise exception using errcode = '23505', message = 'organization already exists under municipality';
  end if;

  select organization.id
  into conflicting_id
  from public.organizations organization
  where (
      organization.org_type = clean_type
      or (clean_type = 'association' and organization.org_type = 'spolek')
    )
    and organization.license_status in ('pending_approval', 'active', 'suspended')
    and (
      (
        clean_legal_identifier is not null
        and regexp_replace(coalesce(organization.legal_identifier, ''), '[^0-9]', '', 'g') =
            clean_legal_identifier
        and (
          clean_type <> 'school'
          or lower(btrim(organization.name)) = lower(clean_name)
        )
      )
      or (
        lower(btrim(organization.name)) = lower(clean_name)
        and lower(btrim(coalesce(organization.registered_address, ''))) =
            lower(clean_address)
      )
    )
  limit 1;

  if conflicting_id is not null then
    raise exception using errcode = '23505', message = 'organization already exists';
  end if;

  insert into public.organizations (
    name,
    org_type,
    status,
    license_status,
    parent_organization_id,
    legal_identifier,
    registered_address,
    primary_activity_code,
    primary_activity_custom_text,
    contact_name,
    contact_email,
    contact_phone,
    activated_at,
    activated_by
  ) values (
    clean_name,
    clean_type,
    'active',
    'pending_approval',
    municipality.id,
    clean_legal_identifier,
    clean_address,
    clean_activity_code,
    case when clean_activity_code = 'jine' then clean_activity_custom_text else null end,
    nullif(clean_contact_name, ''),
    nullif(clean_contact_email, ''),
    clean_contact_phone,
    now(),
    (select auth.uid())
  )
  returning * into created_organization;

  if clean_type = 'association' then
    insert into public.organization_activities (
      organization_id,
      activity_code,
      custom_text
    ) values (
      created_organization.id,
      clean_activity_code,
      case when clean_activity_code = 'jine' then clean_activity_custom_text else null end
    );
  end if;

  return query
  select
    created_organization.id,
    created_organization.name,
    created_organization.org_type,
    created_organization.parent_organization_id,
    created_organization.registration_number;
end;
$$;

comment on function public.create_municipality_child_organization(
  uuid, text, text, text, text, text, text, text, text, text
) is
  'Atomically creates one independent school or association tenant under an active municipality. Platform admins only.';

revoke all on function public.create_municipality_child_organization(
  uuid, text, text, text, text, text, text, text, text, text
) from public, anon, authenticated, service_role;
grant execute on function public.create_municipality_child_organization(
  uuid, text, text, text, text, text, text, text, text, text
) to authenticated;

create or replace function public.generate_school_registration_number()
returns trigger language plpgsql set search_path = '' as $$
declare parent_reg text; next_no integer;
begin
  if new.org_type = 'school' and new.parent_organization_id is not null and new.registration_number is null then
    select o.registration_number into parent_reg from public.organizations o
      where o.id=new.parent_organization_id and o.org_type in ('municipality','obec') for update;
    if parent_reg is null then raise exception 'nadřazená obec nemá platné registration_number'; end if;
    select coalesce(max((substring(o.registration_number from '-SK-([0-9]+)$'))::integer),0)+1
      into next_no from public.organizations o where o.parent_organization_id=new.parent_organization_id
      and o.org_type='school' and o.registration_number like parent_reg || '-SK-%';
    new.registration_number := parent_reg || '-SK-' || lpad(next_no::text,greatest(2,length(next_no::text)),'0');
  end if;
  return new;
end; $$;
revoke all on function public.generate_school_registration_number() from public, anon, authenticated;
do $$ begin
  if not exists(select 1 from pg_trigger where tgrelid='public.organizations'::regclass
      and tgfoid='public.generate_school_registration_number()'::regprocedure and not tgisinternal) then
    create trigger trg_generate_school_registration_number before insert or update of parent_organization_id, org_type, registration_number on public.organizations
      for each row execute function public.generate_school_registration_number();
  end if;
end; $$;

create function public.prepare_classroom_school(
  p_municipality_id uuid,p_name text,p_legal_identifier text,p_izo text,p_address text,
  p_contact_name text,p_contact_email text,p_contact_phone text
) returns table(organization_id uuid,organization_name text,organization_type text,parent_organization_id uuid,registration_number text)
language plpgsql security invoker set search_path = '' as $$
declare child record; conflict_id uuid; clean_izo text := nullif(btrim(coalesce(p_izo,'')),'');
begin
  if (select auth.uid()) is null or not public.is_platform_admin() then
    raise exception using errcode='42501', message='Platform admin required';
  end if;
  if clean_izo is not null and clean_izo !~ '^[0-9]{9}$' then
    raise exception using errcode='22023', message='Invalid IZO';
  end if;
  perform pg_advisory_xact_lock(hashtextextended('school:' || public.unaccent(lower(btrim(p_name))),0));
  if clean_izo is not null then
    perform pg_advisory_xact_lock(hashtextextended('school-izo:' || clean_izo,0));
  end if;
  select o.id into conflict_id from public.organizations o where o.org_type='school' and (
    (clean_izo is not null and o.school_izo=clean_izo)
    or (public.unaccent(lower(btrim(o.name)))=public.unaccent(lower(btrim(p_name))) and (
      o.parent_organization_id=p_municipality_id
      or public.unaccent(lower(btrim(coalesce(o.registered_address,''))))=public.unaccent(lower(btrim(p_address)))
      or (nullif(btrim(p_legal_identifier),'') is not null and (
        regexp_replace(coalesce(o.legal_identifier,''),'[^0-9]','','g')=btrim(p_legal_identifier)
        or regexp_replace(coalesce(o.ico,''),'[^0-9]','','g')=btrim(p_legal_identifier)
      ))
    ))
  ) limit 1;
  if conflict_id is not null then
    raise exception using errcode='23505',message='School already exists',detail=conflict_id::text;
  end if;
  select * into child from public.create_municipality_child_organization(
    p_municipality_id,p_name,'school',p_legal_identifier,p_address,p_contact_name,p_contact_email,p_contact_phone,null,null);
  update public.organizations o set school_izo=clean_izo where o.id=child.organization_id;
  insert into public.municipality_card_changes(organization_id,actor_id,action,current_values)
    select o.id,(select auth.uid()),'created',to_jsonb(o) from public.organizations o where o.id=child.organization_id;
  return query select child.organization_id,child.organization_name,child.organization_type,child.parent_organization_id,child.registration_number;
end; $$;
revoke all on function public.prepare_classroom_school(uuid,text,text,text,text,text,text,text) from public,anon,authenticated,service_role;
grant execute on function public.prepare_classroom_school(uuid,text,text,text,text,text,text,text) to authenticated;

create table if not exists public.school_member_invitation_attempts (
  id uuid primary key default gen_random_uuid(),
  idempotency_key uuid not null unique,
  organization_id uuid not null references public.organizations(id) on delete restrict,
  user_id uuid references auth.users(id) on delete restrict,
  membership_id uuid references public.organization_members(id) on delete restrict,
  initiated_by uuid not null references auth.users(id) on delete restrict,
  recipient_email text not null,
  recipient_full_name text not null,
  role_in_org text not null check (role_in_org in ('organization_admin','member')),
  status text not null check (
    status in (
      'preparing',
      'sending',
      'sent',
      'sent_copy_failed',
      'failed',
      'delivery_unknown',
      'rolled_back',
      'cleanup_required'
    )
  ),
  prepared_user_id uuid,
  prepared_membership_id uuid,
  account_created boolean not null default false,
  client_sent_at timestamptz,
  audit_copy_sent_at timestamptz,
  error_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (recipient_email = lower(btrim(recipient_email))),
  check (length(recipient_email) between 3 and 254),
  check (length(btrim(recipient_full_name)) between 2 and 120)
);

comment on table public.school_member_invitation_attempts is
  'Idempotent delivery audit for administrator and teacher invitations to child schools.';

create index if not exists school_member_invitation_org_idx
  on public.school_member_invitation_attempts (organization_id, created_at desc);

create unique index if not exists school_member_invitation_open_idx
  on public.school_member_invitation_attempts (organization_id, recipient_email)
  where status in ('preparing', 'sending', 'delivery_unknown');

alter table public.school_member_invitation_attempts enable row level security;

revoke all on table public.school_member_invitation_attempts
  from public, anon, authenticated;
grant select, insert, update on table public.school_member_invitation_attempts
  to service_role;
revoke delete, truncate, references, trigger
  on table public.school_member_invitation_attempts from service_role;
