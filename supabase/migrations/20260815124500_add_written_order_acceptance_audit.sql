create table public.customer_order_acceptances (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null unique
    references public.organizations(id) on delete restrict,
  performed_by uuid not null references auth.users(id) on delete restrict,
  recipient_name text not null,
  recipient_email text not null,
  license_plan text not null,
  license_started_at timestamptz not null,
  license_valid_until timestamptz,
  billing_status text not null,
  legal_document_version text not null,
  acceptance_reference uuid not null unique,
  status text not null default 'pending',
  attempt_count integer not null default 0,
  attempted_at timestamptz,
  sent_at timestamptz,
  error_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint customer_order_acceptances_status_check
    check (status in ('pending', 'sending', 'sent', 'failed', 'delivery_unknown')),
  constraint customer_order_acceptances_license_plan_check
    check (license_plan in ('paid_monthly', 'paid_annual', 'classroom_free_12m')),
  constraint customer_order_acceptances_billing_status_check
    check (billing_status in ('pending', 'paid', 'not_applicable')),
  constraint customer_order_acceptances_email_check
    check (recipient_email = lower(btrim(recipient_email)) and position('@' in recipient_email) > 1),
  constraint customer_order_acceptances_attempt_count_check
    check (attempt_count >= 0)
);

comment on table public.customer_order_acceptances is
  'Audit písemného přijetí webové objednávky oddělený od onboardingového e-mailu lokálnímu správci.';
comment on column public.customer_order_acceptances.acceptance_reference is
  'Stabilní reference uvedená v právním potvrzení a použitá pro idempotenci.';

alter table public.customer_order_acceptances enable row level security;

revoke all on table public.customer_order_acceptances
  from public, anon, authenticated, service_role;
grant select, insert, update on table public.customer_order_acceptances
  to service_role;

create or replace function public.set_customer_order_acceptance_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

revoke all on function public.set_customer_order_acceptance_updated_at()
  from public, anon, authenticated;

create trigger set_customer_order_acceptance_updated_at
before update on public.customer_order_acceptances
for each row execute function public.set_customer_order_acceptance_updated_at();
