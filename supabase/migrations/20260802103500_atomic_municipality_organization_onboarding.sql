-- #117: Atomically create one municipality-invited school or association.
-- Applying this migration creates only a guarded RPC function and grants.
-- It does not modify existing rows by itself.

create or replace function public.complete_municipality_organization_onboarding(
  p_invite_id uuid,
  p_user_id uuid,
  p_is_new_account boolean,
  p_email text,
  p_full_name text,
  p_name text,
  p_org_type text,
  p_address text,
  p_legal_identifier text default null,
  p_phone text default null,
  p_activity_code text default null,
  p_activity_custom_text text default null
)
returns table (
  organization_id uuid,
  organization_name text,
  organization_type text,
  registration_number text,
  join_code text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  invite_row public.municipality_organization_invites%rowtype;
  municipality_row public.organizations%rowtype;
  created_organization public.organizations%rowtype;
  normalized_email text := lower(trim(coalesce(p_email, '')));
  normalized_name text := trim(coalesce(p_name, ''));
  normalized_type text := lower(trim(coalesce(p_org_type, '')));
  duplicate_exists boolean;
begin
  if p_invite_id is null or p_user_id is null then
    raise exception 'Invite and user are required';
  end if;

  if normalized_type not in ('school', 'association') then
    raise exception 'Invalid organization type';
  end if;

  if normalized_email = '' or normalized_name = '' then
    raise exception 'Organization name and e-mail are required';
  end if;

  select invite.*
  into invite_row
  from public.municipality_organization_invites invite
  where invite.id = p_invite_id
  for update;

  if not found then
    raise exception 'Municipality invite not found';
  end if;

  if invite_row.status <> 'pending' then
    raise exception 'Municipality invite is not pending';
  end if;

  if invite_row.expires_at < now() then
    raise exception 'Municipality invite has expired';
  end if;

  if invite_row.organization_type <> normalized_type then
    raise exception 'Municipality invite has a different organization type';
  end if;

  if invite_row.invited_email is not null
     and lower(trim(invite_row.invited_email)) <> normalized_email then
    raise exception 'Municipality invite is intended for another e-mail';
  end if;

  select municipality.*
  into municipality_row
  from public.organizations municipality
  where municipality.id = invite_row.municipality_id
    and municipality.org_type in ('municipality', 'obec')
  for share;

  if not found
     or municipality_row.status <> 'active'
     or municipality_row.license_status <> 'active'
     or (
       municipality_row.license_valid_until is not null
       and municipality_row.license_valid_until < current_date
     ) then
    raise exception 'Municipality program is not active';
  end if;

  -- Serialize duplicate checks for the same municipality, organization type and name.
  perform pg_advisory_xact_lock(
    hashtextextended(
      municipality_row.id::text || ':' || normalized_type || ':' || lower(normalized_name),
      0
    )
  );

  select exists (
    select 1
    from public.organizations existing
    where existing.parent_organization_id = municipality_row.id
      and (
        (normalized_type = 'school' and existing.org_type = 'school')
        or
        (normalized_type = 'association' and existing.org_type in ('association', 'spolek'))
      )
      and lower(existing.name) = lower(normalized_name)
  )
  into duplicate_exists;

  if duplicate_exists then
    raise exception 'Organization already exists under this municipality';
  end if;

  insert into public.organizations (
    name,
    org_type,
    status,
    parent_organization_id,
    legal_identifier,
    registered_address,
    primary_activity_code,
    primary_activity_custom_text,
    contact_name,
    contact_email,
    contact_phone
  )
  values (
    normalized_name,
    normalized_type,
    'active',
    municipality_row.id,
    nullif(trim(coalesce(p_legal_identifier, '')), ''),
    trim(coalesce(p_address, '')),
    case when normalized_type = 'association' then nullif(trim(coalesce(p_activity_code, '')), '') else null end,
    case when normalized_type = 'association' then nullif(trim(coalesce(p_activity_custom_text, '')), '') else null end,
    trim(coalesce(p_full_name, '')),
    normalized_email,
    nullif(trim(coalesce(p_phone, '')), '')
  )
  returning * into created_organization;

  if normalized_type = 'association' then
    if p_activity_code is null or trim(p_activity_code) = '' then
      raise exception 'Association activity is required';
    end if;

    insert into public.organization_activities (
      organization_id,
      activity_code,
      custom_text
    )
    values (
      created_organization.id,
      trim(p_activity_code),
      nullif(trim(coalesce(p_activity_custom_text, '')), '')
    );
  end if;

  insert into public.organization_members (
    organization_id,
    user_id,
    role_in_org,
    status
  )
  values (
    created_organization.id,
    p_user_id,
    'organization_admin',
    'active'
  );

  insert into public.profiles (
    id,
    email,
    full_name,
    is_active,
    must_set_password,
    active_organization_id
  )
  values (
    p_user_id,
    normalized_email,
    trim(coalesce(p_full_name, '')),
    true,
    p_is_new_account,
    created_organization.id
  )
  on conflict (id) do update
  set active_organization_id = excluded.active_organization_id;

  update public.municipality_organization_invites invite
  set
    status = 'used',
    used_at = now(),
    used_organization_id = created_organization.id
  where invite.id = invite_row.id
    and invite.status = 'pending';

  if not found then
    raise exception 'Municipality invite was used concurrently';
  end if;

  return query
  select
    created_organization.id,
    created_organization.name,
    created_organization.org_type,
    created_organization.registration_number,
    created_organization.join_code;
end;
$$;

revoke all on function public.complete_municipality_organization_onboarding(
  uuid, uuid, boolean, text, text, text, text, text, text, text, text, text
) from public, anon, authenticated;

grant execute on function public.complete_municipality_organization_onboarding(
  uuid, uuid, boolean, text, text, text, text, text, text, text, text, text
) to service_role;
