create table public.onboarding_test_runs (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references auth.users(id) on delete restrict,
  allowed_email text not null,
  expected_organization_name text not null,
  status text not null default 'prepared',
  organization_id uuid unique references public.organizations(id) on delete set null,
  lead_id uuid unique references public.leads(id) on delete set null,
  local_admin_user_id uuid,
  expires_at timestamptz not null default (now() + interval '2 hours'),
  submitted_at timestamptz,
  activated_at timestamptz,
  cleanup_started_at timestamptz,
  cleanup_finished_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint onboarding_test_runs_email_check check (
    allowed_email = lower(btrim(allowed_email))
    and allowed_email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
  ),
  constraint onboarding_test_runs_name_check check (
    char_length(expected_organization_name) between 12 and 160
    and expected_organization_name like 'TEST – E2E onboarding %'
  ),
  constraint onboarding_test_runs_status_check check (
    status in (
      'prepared', 'submitted', 'activated', 'cleanup_pending', 'cleaned',
      'failed', 'expired'
    )
  )
);

alter table public.organizations
  add column is_test boolean not null default false,
  add column test_run_id uuid unique
    references public.onboarding_test_runs(id) on delete restrict;

alter table public.organizations
  add constraint organizations_test_marker_check check (
    (is_test = false and test_run_id is null)
    or (is_test = true and test_run_id is not null)
  );

create index onboarding_test_runs_status_expires_idx
  on public.onboarding_test_runs (status, expires_at);
create index onboarding_test_runs_created_by_idx
  on public.onboarding_test_runs (created_by);

alter table public.onboarding_test_runs enable row level security;
revoke all on table public.onboarding_test_runs
  from public, anon, authenticated, service_role;
grant select, insert, update on table public.onboarding_test_runs to service_role;

comment on table public.onboarding_test_runs is
  'Server-only registry for allowlisted, expiring production onboarding E2E runs.';
comment on column public.organizations.is_test is
  'Hard cleanup guard. Never set for a real customer.';

create or replace function public.cleanup_onboarding_test_run_service_v1(
  p_run_id uuid,
  p_performed_by uuid
)
returns table (
  local_admin_user_id uuid,
  deleted_organization_id uuid
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  test_run public.onboarding_test_runs%rowtype;
  test_org public.organizations%rowtype;
  v_onboarding_run_id uuid;
  onboarding_local_user_id uuid;
begin
  if not exists (
    select 1
    from public.platform_admins pa
    join public.profiles p on p.id = pa.user_id
    join auth.users u on u.id = pa.user_id
    where pa.user_id = p_performed_by
      and pa.role in ('admin', 'super_admin')
      and p.is_active = true
      and lower(btrim(p.email)) = lower(btrim(u.email))
  ) then
    raise exception 'Platform administrator validation failed';
  end if;

  select * into test_run
  from public.onboarding_test_runs
  where id = p_run_id
  for update;

  if test_run.id is null or test_run.status not in (
    'submitted', 'activated', 'cleanup_pending', 'failed', 'expired'
  ) then
    raise exception 'Test run is not cleanup eligible';
  end if;

  select * into test_org
  from public.organizations
  where id = test_run.organization_id
    and is_test = true
    and test_run_id = test_run.id
    and name = test_run.expected_organization_name
    and lower(btrim(contact_email)) = test_run.allowed_email
  for update;

  if test_org.id is null then
    raise exception 'Exact test organization validation failed';
  end if;

  select r.id, r.local_admin_user_id
    into v_onboarding_run_id, onboarding_local_user_id
  from public.organization_onboarding_runs r
  where r.organization_id = test_org.id;

  if onboarding_local_user_id is null then
    select p.auth_user_id into onboarding_local_user_id
    from public.organization_onboarding_auth_preparations p
    where p.organization_id = test_org.id
      and p.auth_user_id is not null
    order by p.created_at desc
    limit 1;
  end if;

  if onboarding_local_user_id is not null and exists (
    select 1 from public.organization_members m
    where m.user_id = onboarding_local_user_id
      and m.organization_id <> test_org.id
  ) then
    raise exception 'Test local administrator has non-test memberships';
  end if;

  update public.onboarding_test_runs as otr
  set status = 'cleanup_pending',
      cleanup_started_at = coalesce(otr.cleanup_started_at, now()),
      local_admin_user_id = coalesce(otr.local_admin_user_id, onboarding_local_user_id),
      updated_at = now()
  where id = test_run.id;

  delete from public.organization_onboarding_email_attempts
  where onboarding_run_id = v_onboarding_run_id;
  delete from public.customer_order_acceptances
  where organization_id = test_org.id;
  delete from public.organization_onboarding_auth_preparations
  where organization_id = test_org.id;
  delete from public.organization_onboarding_runs
  where organization_id = test_org.id;
  delete from public.access_requests
  where organization_id = test_org.id;
  delete from public.organization_members
  where organization_id = test_org.id;

  if onboarding_local_user_id is not null then
    delete from public.profiles
    where id = onboarding_local_user_id
      and lower(btrim(email)) = test_run.allowed_email;
  end if;

  delete from public.organizations
  where id = test_org.id
    and is_test = true
    and test_run_id = test_run.id;

  if test_run.lead_id is not null then
    delete from public.leads
    where id = test_run.lead_id
      and lower(btrim(email)) = test_run.allowed_email
      and organization = test_run.expected_organization_name;
  end if;

  return query select onboarding_local_user_id, test_org.id;
end;
$$;

revoke all on function public.cleanup_onboarding_test_run_service_v1(uuid, uuid)
  from public, anon, authenticated;
grant execute on function public.cleanup_onboarding_test_run_service_v1(uuid, uuid)
  to service_role;
