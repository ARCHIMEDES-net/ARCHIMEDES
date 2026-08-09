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
  clean_legal_identifier text := nullif(regexp_replace(coalesce(p_legal_identifier, ''), '\s', '', 'g'), '');
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

  if char_length(clean_contact_name) < 2 or char_length(clean_contact_name) > 120 then
    raise exception 'Kontaktní osoba musí mít 2 až 120 znaků.';
  end if;

  if char_length(clean_contact_email) > 254
     or clean_contact_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then
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

  if municipality.status <> 'active'
     or municipality.license_status <> 'active'
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
    clean_contact_name,
    clean_contact_email,
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
