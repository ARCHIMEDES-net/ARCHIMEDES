-- One audited and idempotent onboarding transaction for top-level customers.
-- Auth link generation and email delivery remain external side effects; a newly
-- created Auth user is compensatingly removed by the API if this RPC fails.

-- Canonical platform authorization must resolve the current database identity,
-- not just trust the subject of a previously issued JWT. Replacing this helper
-- hardens every policy/RPC that delegates to is_platform_admin()/is_admin().
create or replace function public.is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from auth.users auth_user
    join public.platform_admins platform_admin
      on platform_admin.user_id = auth_user.id
     and platform_admin.role in ('admin', 'super_admin')
    join public.profiles profile
      on profile.id = auth_user.id
     and profile.is_active = true
    where auth_user.id = (select auth.uid())
  );
$$;

comment on function public.is_platform_admin() is
  'Current platform-admin authorization: live Auth user, allowed platform role and active profile are all required.';

-- Existing production orphans remain available for explicit investigation.
-- NOT VALID skips historical validation but enforces the relationship for every
-- future insert/update and prevents deletion of a currently referenced Auth user.
do $$
begin
  if not exists (
    select 1
    from pg_catalog.pg_constraint constraint_row
    where constraint_row.conrelid = 'public.platform_admins'::regclass
      and constraint_row.conname = 'platform_admins_user_id_auth_fkey'
  ) then
    alter table public.platform_admins
      add constraint platform_admins_user_id_auth_fkey
      foreign key (user_id) references auth.users(id)
      on delete restrict
      not valid;
  end if;
end;
$$;

-- The live broadcast RPC previously had its own platform_admins lookup. Keep
-- its member-access branch intact, but route the privileged branch through the
-- canonical current-identity check as well.
create or replace function public.get_portal_broadcast_sessions(p_event_ids uuid[])
returns table(
  id uuid,
  event_id uuid,
  status text,
  viewer_url text,
  recording_url text,
  recording_status text,
  starts_at timestamptz,
  ended_at timestamptz,
  access_mode text,
  is_published boolean,
  moderator_name text,
  guest_1_name text,
  guest_2_name text,
  guest_3_name text,
  guest_4_name text,
  guest_5_name text,
  has_external_meeting boolean
)
language sql
stable
security definer
set search_path = ''
as $$
  with viewer_access as (
    select public.is_platform_admin() as is_platform_admin,
    exists (
      select 1
      from public.profiles profile
      join public.organization_members member
        on member.user_id = profile.id
       and member.organization_id = profile.active_organization_id
       and lower(coalesce(member.status, '')) = 'active'
      join public.organizations organization
        on organization.id = profile.active_organization_id
      left join public.organizations parent
        on parent.id = organization.parent_organization_id
      where profile.id = (select auth.uid())
        and coalesce(profile.is_active, true) = true
        and lower(coalesce(organization.status, '')) = 'active'
        and (
          (
            (organization.parent_organization_id is null or organization.license_plan is not null)
            and lower(coalesce(organization.license_status, '')) = 'active'
            and (organization.license_valid_until is null or organization.license_valid_until >= now())
          )
          or (
            lower(coalesce(parent.org_type, '')) in ('municipality', 'obec')
            and lower(coalesce(parent.status, '')) = 'active'
            and lower(coalesce(parent.license_status, '')) = 'active'
            and (parent.license_valid_until is null or parent.license_valid_until >= now())
          )
        )
    ) as has_program_access
  )
  select
    session.id,
    session.event_id,
    session.status,
    case when session.external_meeting_id is null then session.viewer_url else null end,
    case when session.recording_status = 'published' then session.recording_url else null end,
    session.recording_status,
    session.starts_at,
    session.ended_at,
    session.access_mode,
    session.is_published,
    session.moderator_name,
    session.guest_1_name,
    session.guest_2_name,
    session.guest_3_name,
    session.guest_4_name,
    session.guest_5_name,
    (session.external_meeting_id is not null)
  from public.broadcast_sessions session
  join public.events event on event.id = session.event_id
  cross join viewer_access access
  where (select auth.uid()) is not null
    and (access.is_platform_admin or access.has_program_access)
    and session.event_id = any(coalesce(p_event_ids, array[]::uuid[]))
    and session.is_published = true
    and event.is_published = true;
$$;

-- Apply the same current-identity rule to the archive RPC's privileged branch.
-- Every member-access predicate remains logically equivalent to production;
-- only the privileged lookup delegates to the hardened shared helper.
create or replace function public.get_portal_archive_events()
returns table (
  id uuid,
  title text,
  starts_at timestamptz,
  category text,
  audience_groups text[],
  audience text,
  worksheet_url text,
  is_published boolean,
  poster_url text,
  stream_url text,
  recording_url text,
  recording_status text
)
language sql
stable
security definer
set search_path = ''
as $$
  with identity as (
    select
      (select auth.uid()) as user_id,
      public.is_platform_admin() as is_platform_admin,
      profile.active_organization_id,
      coalesce(profile.is_active, true) as profile_active
    from public.profiles profile
    where profile.id = (select auth.uid())
  ), access as (
    select
      identity.user_id,
      (
        identity.is_platform_admin
        or (
          identity.profile_active
          and identity.active_organization_id is not null
          and exists (
            select 1
            from public.organization_members member
            join public.organizations organization
              on organization.id = member.organization_id
            where member.user_id = identity.user_id
              and member.organization_id = identity.active_organization_id
              and member.status = 'active'
              and organization.status = 'active'
              and (
                (
                  (organization.parent_organization_id is null or organization.license_plan is not null)
                  and organization.license_status = 'active'
                  and (organization.license_valid_until is null or organization.license_valid_until >= now())
                )
                or exists (
                  select 1
                  from public.organizations parent
                  where parent.id = organization.parent_organization_id
                    and lower(parent.org_type) in ('municipality', 'obec')
                    and parent.status = 'active'
                    and parent.license_status = 'active'
                    and (parent.license_valid_until is null or parent.license_valid_until >= now())
                )
              )
          )
        )
      ) as allowed
    from identity
  )
  select
    event.id,
    event.title,
    event.starts_at,
    event.category,
    event.audience_groups,
    event.audience,
    event.worksheet_url,
    event.is_published,
    event.poster_url,
    event.stream_url,
    case
      when session.recording_status = 'published' then session.recording_url
      else null
    end as recording_url,
    session.recording_status
  from public.events event
  cross join access
  left join lateral (
    select broadcast.recording_url, broadcast.recording_status
    from public.broadcast_sessions broadcast
    where broadcast.event_id = event.id
      and broadcast.is_published = true
    order by broadcast.created_at desc
    limit 1
  ) session on true
  where access.allowed = true
    and event.is_published = true
    and event.starts_at < now()
  order by event.starts_at desc;
$$;

create table public.organization_onboarding_runs (
  id uuid primary key default gen_random_uuid(),
  idempotency_key uuid not null unique,
  organization_id uuid not null unique
    references public.organizations(id) on delete restrict,
  performed_by uuid not null references auth.users(id) on delete restrict,
  local_admin_user_id uuid not null references auth.users(id) on delete restrict,
  local_admin_email text not null,
  local_admin_full_name text not null,
  contact_name text,
  contact_email text,
  central_admin_user_ids uuid[] not null default '{}',
  license_plan text not null,
  license_started_at timestamptz not null,
  license_valid_until timestamptz,
  contract_status text not null,
  billing_status text not null,
  classroom_eligibility_verified boolean not null default false,
  email_status text not null default 'pending',
  email_attempted_at timestamptz,
  email_error_code text,
  email_attempt_count integer not null default 0,
  email_resolution_action text,
  email_resolution_reason text,
  email_resolved_by uuid references auth.users(id) on delete restrict,
  email_resolved_at timestamptz,
  completed_at timestamptz not null default now(),
  constraint organization_onboarding_runs_email_status_check
    check (email_status in ('pending', 'sending', 'sent', 'failed', 'delivery_unknown')),
  constraint organization_onboarding_runs_contract_status_check
    check (contract_status = 'accepted'),
  constraint organization_onboarding_runs_billing_status_check
    check (billing_status in ('pending', 'paid', 'not_applicable')),
  constraint organization_onboarding_runs_email_resolution_check
    check (
      email_resolution_action is null
      or email_resolution_action in ('resolved_without_resend', 'confirmed_not_delivered')
    ),
  constraint organization_onboarding_runs_local_admin_email_check
    check (
      char_length(local_admin_email) <= 254
      and local_admin_email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    )
);

create table public.organization_onboarding_email_attempts (
  id uuid primary key default gen_random_uuid(),
  onboarding_run_id uuid not null
    references public.organization_onboarding_runs(id) on delete restrict,
  attempt_number integer not null check (attempt_number > 0),
  previous_attempt_id uuid
    references public.organization_onboarding_email_attempts(id) on delete restrict,
  status text not null,
  initiated_by uuid not null references auth.users(id) on delete restrict,
  initiation_reason text not null,
  claimed_at timestamptz not null default now(),
  completed_at timestamptz,
  completed_by uuid references auth.users(id) on delete restrict,
  error_code text,
  resolution_action text,
  resolution_reason text,
  resolved_by uuid references auth.users(id) on delete restrict,
  resolved_at timestamptz,
  constraint organization_onboarding_email_attempts_run_number_key
    unique (onboarding_run_id, attempt_number),
  constraint organization_onboarding_email_attempts_status_check
    check (status in ('sending', 'sent', 'failed', 'delivery_unknown')),
  constraint organization_onboarding_email_attempts_resolution_check
    check (
      resolution_action is null
      or resolution_action in ('resolved_without_resend', 'confirmed_not_delivered')
    ),
  constraint organization_onboarding_email_attempts_reason_check
    check (char_length(btrim(initiation_reason)) between 3 and 500),
  constraint organization_onboarding_email_attempts_resolution_reason_check
    check (
      resolution_reason is null
      or char_length(btrim(resolution_reason)) between 3 and 500
    )
);

create unique index organization_onboarding_email_attempts_one_sending_idx
on public.organization_onboarding_email_attempts (onboarding_run_id)
where status = 'sending';

create table public.organization_onboarding_auth_preparations (
  id uuid primary key default gen_random_uuid(),
  idempotency_key uuid not null unique,
  organization_id uuid not null references public.organizations(id) on delete restrict,
  local_admin_email text not null,
  local_admin_full_name text not null,
  auth_user_id uuid,
  status text not null default 'preparing',
  preparation_attempt integer not null default 1 check (preparation_attempt > 0),
  created_by uuid not null references auth.users(id) on delete restrict,
  recovered_by uuid references auth.users(id) on delete restrict,
  recovered_at timestamptz,
  recovery_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint organization_onboarding_auth_preparations_status_check
    check (status in (
      'preparing', 'auth_created', 'recovered', 'committed', 'rolled_back',
      'cleanup_required'
    )),
  constraint organization_onboarding_auth_preparations_email_check
    check (
      char_length(local_admin_email) <= 254
      and local_admin_email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    )
);

comment on table public.organization_onboarding_runs is
  'Immutable audit identity and delivery state for one completed top-level customer onboarding.';
comment on column public.organization_onboarding_runs.performed_by is
  'Authenticated platform administrator who executed the onboarding transaction.';
comment on column public.organization_onboarding_runs.central_admin_user_ids is
  'Configured platform-admin UUIDs added as organization administrators; names are never hardcoded.';

alter table public.organization_onboarding_runs enable row level security;
alter table public.organization_onboarding_email_attempts enable row level security;
alter table public.organization_onboarding_auth_preparations enable row level security;

-- Audit rows are never exposed directly through the Data API. The server API
-- authenticates the platform administrator, then uses its service-role client
-- for the exact reads and Auth-preparation writes traced in the application.
-- SECURITY DEFINER RPCs write delivery audit rows as their owner and therefore
-- do not require table grants for the calling authenticated role.
revoke all on table public.organization_onboarding_runs
  from public, anon, authenticated, service_role;
grant select on table public.organization_onboarding_runs to service_role;

revoke all on table public.organization_onboarding_email_attempts
  from public, anon, authenticated, service_role;
grant select on table public.organization_onboarding_email_attempts to service_role;

revoke all on table public.organization_onboarding_auth_preparations
  from public, anon, authenticated, service_role;
grant select, insert, update
  on table public.organization_onboarding_auth_preparations
  to service_role;

create or replace function public.onboard_customer_v3(
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
#variable_conflict use_column
declare
  customer public.organizations%rowtype;
  existing_run public.organization_onboarding_runs%rowtype;
  created_run public.organization_onboarding_runs%rowtype;
  clean_email text := lower(btrim(coalesce(p_local_admin_email, '')));
  clean_full_name text := btrim(coalesce(p_local_admin_full_name, ''));
  clean_identifier text;
  configured_admin_user_ids uuid[];
  admin_user_ids uuid[];
  effective_start timestamptz := p_license_started_at;
  effective_classroom_eligibility boolean :=
    coalesce(p_classroom_eligibility_verified, false);
begin
  if (select auth.uid()) is null or not public.is_platform_admin() then
    raise exception using errcode = '42501',
      message = 'Tuto akci může provést pouze platformový administrátor.';
  end if;

  if p_idempotency_key is null or p_organization_id is null
     or p_local_admin_user_id is null or p_license_started_at is null then
    raise exception 'Chybí povinná identita onboardingu.';
  end if;

  if char_length(clean_full_name) < 2 or char_length(clean_full_name) > 120
     or char_length(clean_email) > 254
     or clean_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then
    raise exception 'Lokální správce nemá platné jméno nebo e-mail.';
  end if;

  if p_license_plan not in ('paid_monthly', 'paid_annual', 'classroom_free_12m') then
    raise exception 'Vyberte platný režim licence.';
  end if;
  if p_contract_status <> 'accepted' then
    raise exception 'Před aktivací musí být potvrzena smlouva.';
  end if;
  if p_billing_status not in ('pending', 'paid', 'not_applicable') then
    raise exception 'Neplatný stav fakturace.';
  end if;
  if p_license_plan = 'classroom_free_12m'
     and (p_billing_status <> 'not_applicable'
          or not effective_classroom_eligibility) then
    raise exception 'Bezplatná licence vyžaduje ověřenou učebnu a fakturaci bez úhrady.';
  end if;
  if p_license_plan in ('paid_annual', 'classroom_free_12m')
     and p_license_valid_until is null then
    raise exception 'U roční a bezplatné licence je povinné datum konce.';
  end if;
  if p_license_valid_until is not null
     and p_license_valid_until <= effective_start then
    raise exception 'Datum konce licence musí být později než datum začátku.';
  end if;

  select coalesce(array_agg(distinct admin_id order by admin_id), '{}')
  into configured_admin_user_ids
  from unnest(coalesce(p_central_admin_user_ids, '{}')) admin_id;

  -- A repeated transport request with the same key is a read-only replay.
  select run.*
  into existing_run
  from public.organization_onboarding_runs run
  where run.idempotency_key = p_idempotency_key;

  if found then
    if existing_run.organization_id <> p_organization_id
       or existing_run.local_admin_user_id <> p_local_admin_user_id
       or lower(btrim(existing_run.local_admin_email)) <> clean_email
       or existing_run.local_admin_full_name <> clean_full_name
       or existing_run.central_admin_user_ids <> configured_admin_user_ids
       or existing_run.license_plan <> p_license_plan
       or existing_run.license_started_at <> effective_start
       or existing_run.license_valid_until is distinct from p_license_valid_until
       or existing_run.contract_status <> p_contract_status
       or existing_run.billing_status <> p_billing_status
       or existing_run.classroom_eligibility_verified <>
          effective_classroom_eligibility then
      raise exception using errcode = '23505',
        message = 'Idempotency key already belongs to different onboarding parameters.';
    end if;

    return query select
      existing_run.id,
      existing_run.organization_id,
      (
        select organization.registration_number
        from public.organizations organization
        where organization.id = existing_run.organization_id
      ),
      true,
      existing_run.email_status;
    return;
  end if;

  perform pg_advisory_xact_lock(hashtextextended('customer-onboarding:' || p_organization_id::text, 0));

  select organization.*
  into customer
  from public.organizations organization
  where organization.id = p_organization_id
    and organization.org_type in ('municipality', 'obec', 'school', 'association', 'spolek')
    and organization.parent_organization_id is null
  for update;

  if not found then
    raise exception 'Zákazník nebyl nalezen.';
  end if;

  -- A new request key can safely replay only the same completed onboarding.
  select run.*
  into existing_run
  from public.organization_onboarding_runs run
  where run.organization_id = customer.id;

  if found then
    if existing_run.local_admin_user_id <> p_local_admin_user_id
       or lower(btrim(existing_run.local_admin_email)) <> clean_email
       or existing_run.local_admin_full_name <> clean_full_name
       or existing_run.central_admin_user_ids <> configured_admin_user_ids
       or existing_run.license_plan <> p_license_plan
       or existing_run.license_started_at <> effective_start
       or existing_run.license_valid_until is distinct from p_license_valid_until
       or existing_run.contract_status <> p_contract_status
       or existing_run.billing_status <> p_billing_status
       or existing_run.classroom_eligibility_verified <>
          effective_classroom_eligibility then
      raise exception using errcode = '23505',
        message = 'Organization already onboarded with different parameters.';
    end if;

    return query select
      existing_run.id,
      existing_run.organization_id,
      customer.registration_number,
      true,
      existing_run.email_status;
    return;
  end if;

  if customer.status = 'active' or customer.license_status = 'active' then
    raise exception using errcode = '23505',
      message = 'Active legacy customer requires manual onboarding reconciliation.';
  end if;

  if p_license_plan = 'classroom_free_12m'
     and customer.org_type not in ('municipality', 'obec') then
    raise exception 'Bezplatná licence s učebnou je určena pouze obci.';
  end if;

  clean_identifier := nullif(
    regexp_replace(coalesce(customer.legal_identifier, customer.ico, ''), '[^0-9]', '', 'g'),
    ''
  );

  if clean_identifier is not null then
    perform pg_advisory_xact_lock(hashtextextended('customer-ico:' || clean_identifier, 0));
  end if;
  perform pg_advisory_xact_lock(
    hashtextextended(
      'customer-name-address:' || lower(btrim(customer.name)) || ':' ||
      lower(btrim(coalesce(customer.registered_address, ''))),
      0
    )
  );

  if exists (
    select 1
    from public.organizations conflict
    where conflict.id <> customer.id
      and conflict.parent_organization_id is null
      and (
        conflict.org_type = customer.org_type
        or (customer.org_type in ('municipality', 'obec') and conflict.org_type in ('municipality', 'obec'))
        or (customer.org_type in ('association', 'spolek') and conflict.org_type in ('association', 'spolek'))
      )
      and conflict.license_status in ('pending_approval', 'active', 'suspended')
      and (
        (
          clean_identifier is not null
          and regexp_replace(coalesce(conflict.legal_identifier, conflict.ico, ''), '[^0-9]', '', 'g') = clean_identifier
        )
        or (
          lower(btrim(conflict.name)) = lower(btrim(customer.name))
          and lower(btrim(coalesce(conflict.registered_address, ''))) =
              lower(btrim(coalesce(customer.registered_address, '')))
        )
      )
  ) then
    raise exception using errcode = '23505',
      message = 'Duplicate organization or legal identifier exists.';
  end if;

  if not exists (
    select 1
    from auth.users auth_user
    where auth_user.id = p_local_admin_user_id
      and lower(btrim(auth_user.email)) = clean_email
  ) then
    raise exception 'Lokální správce nemá odpovídající Auth účet.';
  end if;

  if exists (
    select 1
    from public.profiles profile
    where lower(btrim(profile.email)) = clean_email
      and profile.id <> p_local_admin_user_id
  ) then
    raise exception using errcode = '23505',
      message = 'Duplicate profile email exists.';
  end if;

  if exists (
    select 1
    from public.profiles profile
    where profile.id = p_local_admin_user_id
      and nullif(lower(btrim(profile.email)), '') is distinct from clean_email
  ) then
    raise exception using errcode = '23505',
      message = 'Local administrator profile belongs to another email.';
  end if;

  select coalesce(array_agg(distinct admin_id order by admin_id), '{}')
  into admin_user_ids
  from unnest(
    array_append(configured_admin_user_ids, p_local_admin_user_id)
  ) admin_id;

  if customer.org_type in ('municipality', 'obec') then
    if cardinality(configured_admin_user_ids) = 0 then
      raise exception 'Obec nemá nakonfigurované centrální správce.';
    end if;

    if (
      select count(distinct platform_admin.user_id)
      from public.platform_admins platform_admin
      join public.profiles profile
        on profile.id = platform_admin.user_id
       and profile.is_active = true
      join auth.users auth_user
        on auth_user.id = platform_admin.user_id
       and lower(btrim(auth_user.email)) = lower(btrim(profile.email))
      where platform_admin.user_id = any(configured_admin_user_ids)
    ) <> cardinality(configured_admin_user_ids) then
      raise exception 'Některý centrální správce nemá platný Auth účet, aktivní profil nebo platformové oprávnění.';
    end if;
  elsif cardinality(configured_admin_user_ids) <> 0 then
    raise exception 'Centrální obecní správce nelze přidat k jinému typu zákazníka.';
  end if;

  if exists (
    select 1
    from public.organization_members member
    where member.organization_id = customer.id
      and member.user_id = any(admin_user_ids)
      and (member.role_in_org <> 'organization_admin' or member.status <> 'active')
  ) then
    raise exception using errcode = '23505',
      message = 'Conflicting organization membership exists.';
  end if;

  insert into public.profiles (
    id,
    email,
    full_name,
    is_active,
    must_set_password,
    user_type,
    active_organization_id
  ) values (
    p_local_admin_user_id,
    clean_email,
    clean_full_name,
    true,
    coalesce(p_local_admin_must_set_password, false),
    'organization',
    customer.id
  )
  on conflict (id) do update set
    full_name = case
      when nullif(btrim(public.profiles.full_name), '') is null then excluded.full_name
      else public.profiles.full_name
    end,
    is_active = true,
    must_set_password = public.profiles.must_set_password or excluded.must_set_password,
    user_type = coalesce(public.profiles.user_type, excluded.user_type),
    active_organization_id = coalesce(public.profiles.active_organization_id, excluded.active_organization_id);

  insert into public.organization_members (
    organization_id,
    user_id,
    role_in_org,
    status
  )
  select customer.id, admin_id, 'organization_admin', 'active'
  from unnest(admin_user_ids) admin_id
  on conflict (organization_id, user_id) do nothing;

  update public.organizations
  set
    license_status = 'active',
    status = 'active',
    license_plan = p_license_plan,
    license_started_at = effective_start,
    license_valid_until = p_license_valid_until,
    contract_status = p_contract_status,
    billing_status = p_billing_status,
    activated_at = now(),
    activated_by = (select auth.uid()),
    classroom_eligibility_verified_at = case
      when p_license_plan = 'classroom_free_12m' then now() else null
    end,
    classroom_eligibility_verified_by = case
      when p_license_plan = 'classroom_free_12m' then (select auth.uid()) else null
    end
  where id = customer.id;

  insert into public.organization_onboarding_runs (
    idempotency_key,
    organization_id,
    performed_by,
    local_admin_user_id,
    local_admin_email,
    local_admin_full_name,
    contact_name,
    contact_email,
    central_admin_user_ids,
    license_plan,
    license_started_at,
    license_valid_until,
    contract_status,
    billing_status,
    classroom_eligibility_verified
  ) values (
    p_idempotency_key,
    customer.id,
    (select auth.uid()),
    p_local_admin_user_id,
    clean_email,
    clean_full_name,
    customer.contact_name,
    customer.contact_email,
    configured_admin_user_ids,
    p_license_plan,
    effective_start,
    p_license_valid_until,
    p_contract_status,
    p_billing_status,
    effective_classroom_eligibility
  )
  returning * into created_run;

  return query select
    created_run.id,
    customer.id,
    customer.registration_number,
    false,
    created_run.email_status;
end;
$$;

comment on function public.onboard_customer_v3(
  uuid, uuid, uuid, text, text, uuid[], text, timestamptz, timestamptz,
  text, text, boolean, boolean
) is
  'Audited and idempotent activation, profile preservation, and local/configured-central admin membership assignment. Platform admins only.';

revoke all on function public.onboard_customer_v3(
  uuid, uuid, uuid, text, text, uuid[], text, timestamptz, timestamptz,
  text, text, boolean, boolean
) from public, anon, authenticated, service_role;
grant execute on function public.onboard_customer_v3(
  uuid, uuid, uuid, text, text, uuid[], text, timestamptz, timestamptz,
  text, text, boolean, boolean
) to authenticated;

create or replace function public.claim_onboarding_email_attempt(
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
declare
  onboarding_run public.organization_onboarding_runs%rowtype;
  previous_attempt public.organization_onboarding_email_attempts%rowtype;
  created_attempt public.organization_onboarding_email_attempts%rowtype;
  clean_reason text := btrim(coalesce(p_reason, ''));
begin
  if (select auth.uid()) is null or not public.is_platform_admin() then
    raise exception using errcode = '42501',
      message = 'Tuto akci může provést pouze platný aktivní správce platformy.';
  end if;
  if char_length(clean_reason) < 3 or char_length(clean_reason) > 500 then
    raise exception 'Důvod e-mailového pokusu musí mít 3 až 500 znaků.';
  end if;

  select run.*
  into onboarding_run
  from public.organization_onboarding_runs run
  where run.id = p_onboarding_run_id
  for update;

  if not found then
    raise exception 'Onboardingový audit nebyl nalezen.';
  end if;

  select attempt.*
  into previous_attempt
  from public.organization_onboarding_email_attempts attempt
  where attempt.onboarding_run_id = onboarding_run.id
  order by attempt.attempt_number desc
  limit 1
  for update;

  if onboarding_run.email_status = 'sending' then
    return query select
      previous_attempt.id,
      previous_attempt.attempt_number,
      false,
      onboarding_run.email_status;
    return;
  end if;
  if onboarding_run.email_status = 'sent'
     or onboarding_run.email_resolution_action = 'resolved_without_resend' then
    return query select
      previous_attempt.id,
      previous_attempt.attempt_number,
      false,
      onboarding_run.email_status;
    return;
  end if;

  if onboarding_run.email_status = 'pending' and p_action <> 'initial_delivery' then
    raise exception 'První e-mailový pokus vyžaduje akci initial_delivery.';
  elsif onboarding_run.email_status = 'failed' and p_action <> 'retry_failed' then
    raise exception 'Neúspěšný e-mail lze opakovat pouze řízenou akcí retry_failed.';
  elsif onboarding_run.email_status = 'delivery_unknown' then
    if p_action <> 'confirm_not_delivered_and_retry' then
      raise exception 'Neznámé doručení vyžaduje ruční potvrzení nedoručení.';
    end if;
    if previous_attempt.id is null or previous_attempt.resolved_at is not null then
      raise exception 'Neznámý e-mailový pokus už byl vyřešen nebo chybí.';
    end if;

    update public.organization_onboarding_email_attempts
    set
      resolution_action = 'confirmed_not_delivered',
      resolution_reason = clean_reason,
      resolved_by = (select auth.uid()),
      resolved_at = now()
    where id = previous_attempt.id;

    update public.organization_onboarding_runs
    set
      email_resolution_action = 'confirmed_not_delivered',
      email_resolution_reason = clean_reason,
      email_resolved_by = (select auth.uid()),
      email_resolved_at = now()
    where id = onboarding_run.id;
  end if;

  insert into public.organization_onboarding_email_attempts (
    onboarding_run_id,
    attempt_number,
    previous_attempt_id,
    status,
    initiated_by,
    initiation_reason
  ) values (
    onboarding_run.id,
    coalesce(previous_attempt.attempt_number, 0) + 1,
    previous_attempt.id,
    'sending',
    (select auth.uid()),
    clean_reason
  )
  returning * into created_attempt;

  update public.organization_onboarding_runs
  set
    email_status = 'sending',
    email_attempted_at = created_attempt.claimed_at,
    email_error_code = null,
    email_attempt_count = created_attempt.attempt_number,
    email_resolution_action = null,
    email_resolution_reason = null,
    email_resolved_by = null,
    email_resolved_at = null
  where id = onboarding_run.id;

  return query select
    created_attempt.id,
    created_attempt.attempt_number,
    true,
    'sending'::text;
end;
$$;

create or replace function public.complete_onboarding_email_attempt(
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
declare
  email_attempt public.organization_onboarding_email_attempts%rowtype;
begin
  if (select auth.uid()) is null or not public.is_platform_admin() then
    raise exception using errcode = '42501',
      message = 'Tuto akci může provést pouze platný aktivní správce platformy.';
  end if;
  if p_outcome not in ('sent', 'failed', 'delivery_unknown') then
    raise exception 'Neplatný výsledek e-mailového pokusu.';
  end if;

  select attempt.*
  into email_attempt
  from public.organization_onboarding_email_attempts attempt
  where attempt.id = p_attempt_id
  for update;

  if not found then
    raise exception 'E-mailový pokus nebyl nalezen.';
  end if;

  perform 1
  from public.organization_onboarding_runs run
  where run.id = email_attempt.onboarding_run_id
  for update;

  if email_attempt.status <> 'sending' then
    return query select
      email_attempt.onboarding_run_id,
      email_attempt.attempt_number,
      email_attempt.status,
      false;
    return;
  end if;

  update public.organization_onboarding_email_attempts
  set
    status = p_outcome,
    completed_at = now(),
    completed_by = (select auth.uid()),
    error_code = nullif(btrim(coalesce(p_error_code, '')), '')
  where id = email_attempt.id;

  update public.organization_onboarding_runs
  set
    email_status = p_outcome,
    email_attempted_at = now(),
    email_error_code = nullif(btrim(coalesce(p_error_code, '')), '')
  where id = email_attempt.onboarding_run_id;

  return query select
    email_attempt.onboarding_run_id,
    email_attempt.attempt_number,
    p_outcome,
    true;
end;
$$;

create or replace function public.mark_stale_onboarding_email_attempt(
  p_onboarding_run_id uuid
)
returns table (
  onboarding_run_id uuid,
  email_status text,
  transitioned boolean
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  onboarding_run public.organization_onboarding_runs%rowtype;
  email_attempt public.organization_onboarding_email_attempts%rowtype;
begin
  if (select auth.uid()) is null or not public.is_platform_admin() then
    raise exception using errcode = '42501',
      message = 'Tuto akci může provést pouze platný aktivní správce platformy.';
  end if;

  select run.*
  into onboarding_run
  from public.organization_onboarding_runs run
  where run.id = p_onboarding_run_id
  for update;

  if not found then
    raise exception 'Onboardingový audit nebyl nalezen.';
  end if;

  if onboarding_run.email_status <> 'sending'
     or onboarding_run.email_attempted_at > now() - interval '15 minutes' then
    return query select onboarding_run.id, onboarding_run.email_status, false;
    return;
  end if;

  select attempt.*
  into email_attempt
  from public.organization_onboarding_email_attempts attempt
  where attempt.onboarding_run_id = onboarding_run.id
    and attempt.status = 'sending'
  order by attempt.attempt_number desc
  limit 1
  for update;

  if email_attempt.id is null then
    raise exception 'Stav sending nemá odpovídající auditovaný pokus.';
  end if;

  update public.organization_onboarding_email_attempts
  set
    status = 'delivery_unknown',
    completed_at = now(),
    completed_by = (select auth.uid()),
    error_code = 'sending_timeout_manual_review'
  where id = email_attempt.id;

  update public.organization_onboarding_runs
  set
    email_status = 'delivery_unknown',
    email_attempted_at = now(),
    email_error_code = 'sending_timeout_manual_review'
  where id = onboarding_run.id;

  return query select onboarding_run.id, 'delivery_unknown'::text, true;
end;
$$;

create or replace function public.resolve_onboarding_email_without_resend(
  p_onboarding_run_id uuid,
  p_reason text
)
returns table (
  onboarding_run_id uuid,
  email_status text,
  resolved boolean
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  onboarding_run public.organization_onboarding_runs%rowtype;
  email_attempt public.organization_onboarding_email_attempts%rowtype;
  clean_reason text := btrim(coalesce(p_reason, ''));
begin
  if (select auth.uid()) is null or not public.is_platform_admin() then
    raise exception using errcode = '42501',
      message = 'Tuto akci může provést pouze platný aktivní správce platformy.';
  end if;
  if char_length(clean_reason) < 3 or char_length(clean_reason) > 500 then
    raise exception 'Důvod ručního vyřešení musí mít 3 až 500 znaků.';
  end if;

  select run.*
  into onboarding_run
  from public.organization_onboarding_runs run
  where run.id = p_onboarding_run_id
  for update;

  if not found then
    raise exception 'Onboardingový audit nebyl nalezen.';
  end if;
  if onboarding_run.email_status <> 'delivery_unknown' then
    raise exception 'Bez opakování lze ručně vyřešit pouze neznámé doručení.';
  end if;
  if onboarding_run.email_resolution_action = 'resolved_without_resend' then
    return query select onboarding_run.id, onboarding_run.email_status, false;
    return;
  end if;

  select attempt.*
  into email_attempt
  from public.organization_onboarding_email_attempts attempt
  where attempt.onboarding_run_id = onboarding_run.id
  order by attempt.attempt_number desc
  limit 1
  for update;

  if email_attempt.id is null or email_attempt.status <> 'delivery_unknown'
     or email_attempt.resolved_at is not null then
    raise exception 'Neznámý e-mailový pokus už byl vyřešen nebo chybí.';
  end if;

  update public.organization_onboarding_email_attempts
  set
    resolution_action = 'resolved_without_resend',
    resolution_reason = clean_reason,
    resolved_by = (select auth.uid()),
    resolved_at = now()
  where id = email_attempt.id;

  update public.organization_onboarding_runs
  set
    email_resolution_action = 'resolved_without_resend',
    email_resolution_reason = clean_reason,
    email_resolved_by = (select auth.uid()),
    email_resolved_at = now()
  where id = onboarding_run.id;

  return query select onboarding_run.id, onboarding_run.email_status, true;
end;
$$;

comment on table public.organization_onboarding_email_attempts is
  'Append-only delivery attempts with actor, reason, ordering and manual resolution linkage.';
comment on table public.organization_onboarding_auth_preparations is
  'Audit of Auth accounts prepared by an idempotent onboarding before the main DB transaction.';

revoke all on function public.claim_onboarding_email_attempt(uuid, text, text)
  from public, anon, authenticated, service_role;
revoke all on function public.complete_onboarding_email_attempt(uuid, text, text)
  from public, anon, authenticated, service_role;
revoke all on function public.mark_stale_onboarding_email_attempt(uuid)
  from public, anon, authenticated, service_role;
revoke all on function public.resolve_onboarding_email_without_resend(uuid, text)
  from public, anon, authenticated, service_role;

grant execute on function public.claim_onboarding_email_attempt(uuid, text, text)
  to authenticated;
grant execute on function public.complete_onboarding_email_attempt(uuid, text, text)
  to authenticated;
grant execute on function public.mark_stale_onboarding_email_attempt(uuid)
  to authenticated;
grant execute on function public.resolve_onboarding_email_without_resend(uuid, text)
  to authenticated;
