-- Allow the server-only automation route to reuse the audited v3 onboarding
-- transaction without weakening its authenticated platform-admin entrypoint.
-- These wrappers are callable only with the service-role JWT. They validate a
-- live platform administrator, temporarily bind auth.uid() to that actor for
-- the current transaction and delegate to the already-audited functions.

create or replace function public.onboard_customer_service_v1(
  p_performed_by uuid,
  p_idempotency_key uuid,
  p_organization_id uuid,
  p_local_admin_user_id uuid,
  p_local_admin_email text,
  p_local_admin_full_name text,
  p_central_admin_user_ids uuid[],
  p_license_plan text,
  p_license_started_at timestamptz,
  p_license_valid_until timestamptz,
  p_contract_status text,
  p_billing_status text,
  p_classroom_eligibility_verified boolean default false,
  p_local_admin_must_set_password boolean default false
)
returns table (
  onboarding_run_id uuid,
  organization_id uuid,
  registration_number text,
  replayed boolean,
  email_status text
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if coalesce((select auth.jwt() ->> 'role'), '') <> 'service_role' then
    raise exception using errcode = '42501',
      message = 'Service onboarding requires the service role.';
  end if;

  if p_performed_by is null or not exists (
    select 1
    from auth.users auth_user
    join public.platform_admins platform_admin
      on platform_admin.user_id = auth_user.id
     and platform_admin.role in ('admin', 'super_admin')
    join public.profiles profile
      on profile.id = auth_user.id
     and profile.is_active = true
     and lower(btrim(profile.email)) = lower(btrim(auth_user.email))
    where auth_user.id = p_performed_by
  ) then
    raise exception using errcode = '42501',
      message = 'Service onboarding actor is not a live platform administrator.';
  end if;

  perform set_config('request.jwt.claim.sub', p_performed_by::text, true);

  return query
  select *
  from public.onboard_customer_v3(
    p_idempotency_key,
    p_organization_id,
    p_local_admin_user_id,
    p_local_admin_email,
    p_local_admin_full_name,
    p_central_admin_user_ids,
    p_license_plan,
    p_license_started_at,
    p_license_valid_until,
    p_contract_status,
    p_billing_status,
    p_classroom_eligibility_verified,
    p_local_admin_must_set_password
  );
end;
$$;

create or replace function public.claim_onboarding_email_attempt_service_v1(
  p_performed_by uuid,
  p_onboarding_run_id uuid,
  p_action text,
  p_reason text
)
returns table (
  attempt_id uuid,
  attempt_number integer,
  claimed boolean,
  email_status text
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if coalesce((select auth.jwt() ->> 'role'), '') <> 'service_role' then
    raise exception using errcode = '42501',
      message = 'Service email delivery requires the service role.';
  end if;

  if p_performed_by is null or not exists (
    select 1
    from auth.users auth_user
    join public.platform_admins platform_admin
      on platform_admin.user_id = auth_user.id
     and platform_admin.role in ('admin', 'super_admin')
    join public.profiles profile
      on profile.id = auth_user.id
     and profile.is_active = true
     and lower(btrim(profile.email)) = lower(btrim(auth_user.email))
    where auth_user.id = p_performed_by
  ) then
    raise exception using errcode = '42501',
      message = 'Service email actor is not a live platform administrator.';
  end if;

  perform set_config('request.jwt.claim.sub', p_performed_by::text, true);

  return query
  select *
  from public.claim_onboarding_email_attempt(
    p_onboarding_run_id,
    p_action,
    p_reason
  );
end;
$$;

create or replace function public.complete_onboarding_email_attempt_service_v1(
  p_performed_by uuid,
  p_attempt_id uuid,
  p_outcome text,
  p_error_code text default null
)
returns table (
  onboarding_run_id uuid,
  attempt_number integer,
  email_status text,
  completed boolean
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if coalesce((select auth.jwt() ->> 'role'), '') <> 'service_role' then
    raise exception using errcode = '42501',
      message = 'Service email completion requires the service role.';
  end if;

  if p_performed_by is null or not exists (
    select 1
    from auth.users auth_user
    join public.platform_admins platform_admin
      on platform_admin.user_id = auth_user.id
     and platform_admin.role in ('admin', 'super_admin')
    join public.profiles profile
      on profile.id = auth_user.id
     and profile.is_active = true
     and lower(btrim(profile.email)) = lower(btrim(auth_user.email))
    where auth_user.id = p_performed_by
  ) then
    raise exception using errcode = '42501',
      message = 'Service email actor is not a live platform administrator.';
  end if;

  perform set_config('request.jwt.claim.sub', p_performed_by::text, true);

  return query
  select *
  from public.complete_onboarding_email_attempt(
    p_attempt_id,
    p_outcome,
    p_error_code
  );
end;
$$;

comment on function public.onboard_customer_service_v1(
  uuid, uuid, uuid, uuid, text, text, uuid[], text, timestamptz,
  timestamptz, text, text, boolean, boolean
) is
  'Service-role-only wrapper around onboard_customer_v3 with an explicitly validated live platform-admin audit actor.';

revoke all on function public.onboard_customer_service_v1(
  uuid, uuid, uuid, uuid, text, text, uuid[], text, timestamptz,
  timestamptz, text, text, boolean, boolean
) from public, anon, authenticated, service_role;
grant execute on function public.onboard_customer_service_v1(
  uuid, uuid, uuid, uuid, text, text, uuid[], text, timestamptz,
  timestamptz, text, text, boolean, boolean
) to service_role;

revoke all on function public.claim_onboarding_email_attempt_service_v1(
  uuid, uuid, text, text
) from public, anon, authenticated, service_role;
grant execute on function public.claim_onboarding_email_attempt_service_v1(
  uuid, uuid, text, text
) to service_role;

revoke all on function public.complete_onboarding_email_attempt_service_v1(
  uuid, uuid, text, text
) from public, anon, authenticated, service_role;
grant execute on function public.complete_onboarding_email_attempt_service_v1(
  uuid, uuid, text, text
) to service_role;
