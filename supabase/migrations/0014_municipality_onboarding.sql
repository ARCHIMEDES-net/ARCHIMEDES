-- Dokonceni onboardingu obce: obchodni metadata licence a bezpecne
-- jednorazove pozvanky skol/spolku. Migrace je aditivni a nemeni
-- existujici ucty, clenstvi ani licence.

alter table public.organizations
  add column if not exists requested_license_plan text,
  add column if not exists terms_accepted_at timestamptz,
  add column if not exists terms_version text,
  add column if not exists license_plan text,
  add column if not exists license_started_at timestamptz,
  add column if not exists contract_status text not null default 'pending',
  add column if not exists billing_status text not null default 'pending',
  add column if not exists activated_at timestamptz,
  add column if not exists activated_by uuid references auth.users(id) on delete set null,
  add column if not exists classroom_eligibility_verified_at timestamptz,
  add column if not exists classroom_eligibility_verified_by uuid references auth.users(id) on delete set null;

alter table public.organizations
  drop constraint if exists organizations_requested_license_plan_allowed,
  add constraint organizations_requested_license_plan_allowed
    check (
      requested_license_plan is null
      or requested_license_plan in ('paid_monthly', 'paid_annual', 'classroom_free_12m')
    );

alter table public.organizations
  drop constraint if exists organizations_license_plan_allowed,
  add constraint organizations_license_plan_allowed
    check (
      license_plan is null
      or license_plan in ('paid_monthly', 'paid_annual', 'classroom_free_12m')
    );

alter table public.organizations
  drop constraint if exists organizations_contract_status_allowed,
  add constraint organizations_contract_status_allowed
    check (contract_status in ('pending', 'accepted', 'cancelled'));

alter table public.organizations
  drop constraint if exists organizations_billing_status_allowed,
  add constraint organizations_billing_status_allowed
    check (billing_status in ('pending', 'paid', 'not_applicable', 'overdue'));

create table if not exists public.municipality_organization_invites (
  id uuid primary key default gen_random_uuid(),
  municipality_id uuid not null references public.organizations(id) on delete cascade,
  organization_type text not null
    check (organization_type in ('school', 'association')),
  invited_email text,
  token_hash text not null unique,
  status text not null default 'pending'
    check (status in ('pending', 'used', 'revoked', 'expired')),
  expires_at timestamptz not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  used_at timestamptz,
  used_organization_id uuid references public.organizations(id) on delete set null
);

create index if not exists municipality_organization_invites_municipality_idx
  on public.municipality_organization_invites (municipality_id, created_at desc);

create index if not exists municipality_organization_invites_pending_idx
  on public.municipality_organization_invites (token_hash, expires_at)
  where status = 'pending';

alter table public.municipality_organization_invites enable row level security;

-- Tabulku obsluhuji pouze serverova API se service_role. Spravce obce se
-- overuje v API podle skutecneho bearer tokenu a organization_members.
revoke all on public.municipality_organization_invites
  from public, anon, authenticated;
grant select, insert, update, delete
  on public.municipality_organization_invites to service_role;

create or replace function public.activate_customer_with_admin_v2(
  p_organization_id uuid,
  p_user_id uuid,
  p_email text,
  p_full_name text,
  p_license_plan text,
  p_license_started_at timestamptz,
  p_license_valid_until timestamptz,
  p_contract_status text,
  p_billing_status text,
  p_classroom_eligibility_verified boolean default false,
  p_must_set_password boolean default false
)
returns table (
  organization_id uuid,
  registration_number text,
  license_plan text,
  license_valid_until timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  customer public.organizations%rowtype;
  effective_start timestamptz;
begin
  if not public.is_admin() then
    raise exception 'Tuto akci muze provest pouze spravce platformy.';
  end if;

  if p_license_plan not in ('paid_monthly', 'paid_annual', 'classroom_free_12m') then
    raise exception 'Vyberte platny rezim licence.';
  end if;

  if p_contract_status <> 'accepted' then
    raise exception 'Pred aktivaci musi byt potvrzena smlouva.';
  end if;

  if p_billing_status not in ('pending', 'paid', 'not_applicable') then
    raise exception 'Neplatny stav fakturace.';
  end if;

  if p_license_plan = 'classroom_free_12m'
     and p_billing_status <> 'not_applicable' then
    raise exception 'Bezplatna licence musi mit fakturaci bez uhrady.';
  end if;

  if p_license_plan = 'classroom_free_12m'
     and not p_classroom_eligibility_verified then
    raise exception 'Pred bezplatnou aktivaci overte ucebnu ARCHIMEDES.';
  end if;

  if p_license_plan in ('paid_annual', 'classroom_free_12m')
     and p_license_valid_until is null then
    raise exception 'U rocni a bezplatne licence je povinne datum konce.';
  end if;

  effective_start := coalesce(p_license_started_at, now());

  if p_license_valid_until is not null
     and p_license_valid_until <= effective_start then
    raise exception 'Datum konce licence musi byt pozdeji nez datum zacatku.';
  end if;

  select * into customer
  from public.organizations
  where id = p_organization_id
    and org_type in ('municipality', 'obec', 'school', 'association', 'spolek')
    and parent_organization_id is null
  for update;

  if not found then
    raise exception 'Zakaznik nebyl nalezen.';
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
  set
    license_status = 'active',
    status = 'active',
    license_plan = p_license_plan,
    license_started_at = effective_start,
    license_valid_until = p_license_valid_until,
    contract_status = p_contract_status,
    billing_status = p_billing_status,
    activated_at = now(),
    activated_by = auth.uid(),
    classroom_eligibility_verified_at = case
      when p_license_plan = 'classroom_free_12m' then now() else null
    end,
    classroom_eligibility_verified_by = case
      when p_license_plan = 'classroom_free_12m' then auth.uid() else null
    end
  where id = customer.id;

  return query
  select
    customer.id,
    customer.registration_number,
    p_license_plan,
    p_license_valid_until;
end;
$$;

revoke all on function public.activate_customer_with_admin_v2(
  uuid, uuid, text, text, text, timestamptz, timestamptz, text, text, boolean, boolean
) from public, anon;

grant execute on function public.activate_customer_with_admin_v2(
  uuid, uuid, text, text, text, timestamptz, timestamptz, text, text, boolean, boolean
) to authenticated;


-- Sdileny databazovy rate limit pro verejne serverove formulare.
create table if not exists public.api_rate_limits (
  route text not null,
  key_hash text not null,
  window_started_at timestamptz not null default now(),
  request_count integer not null default 0 check (request_count >= 0),
  primary key (route, key_hash)
);

alter table public.api_rate_limits enable row level security;
revoke all on public.api_rate_limits from public, anon, authenticated;
grant select, insert, update, delete on public.api_rate_limits to service_role;

create or replace function public.consume_api_rate_limit(
  p_route text,
  p_key_hash text,
  p_limit integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  current_row public.api_rate_limits%rowtype;
begin
  if p_route is null or btrim(p_route) = ''
     or p_key_hash is null or btrim(p_key_hash) = ''
     or p_limit < 1
     or p_window_seconds < 1 then
    raise exception 'Neplatne parametry rate limitu.';
  end if;

  perform pg_advisory_xact_lock(
    hashtextextended(p_route || ':' || p_key_hash, 0)
  );

  select * into current_row
  from public.api_rate_limits
  where route = p_route and key_hash = p_key_hash
  for update;

  if not found
     or current_row.window_started_at
       <= now() - make_interval(secs => p_window_seconds) then
    insert into public.api_rate_limits (
      route, key_hash, window_started_at, request_count
    ) values (
      p_route, p_key_hash, now(), 1
    )
    on conflict (route, key_hash) do update set
      window_started_at = excluded.window_started_at,
      request_count = 1;
    return true;
  end if;

  if current_row.request_count >= p_limit then
    return false;
  end if;

  update public.api_rate_limits
  set request_count = request_count + 1
  where route = p_route and key_hash = p_key_hash;

  return true;
end;
$$;

revoke all on function public.consume_api_rate_limit(text, text, integer, integer)
  from public, anon, authenticated;
grant execute on function public.consume_api_rate_limit(text, text, integer, integer)
  to service_role;
