create table if not exists public.municipality_admin_invitation_attempts (
  id uuid primary key default gen_random_uuid(),
  idempotency_key uuid not null unique,
  organization_id uuid not null references public.organizations(id) on delete restrict,
  user_id uuid references auth.users(id) on delete restrict,
  membership_id uuid references public.organization_members(id) on delete restrict,
  initiated_by uuid not null references auth.users(id) on delete restrict,
  recipient_email text not null,
  recipient_full_name text not null,
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

comment on table public.municipality_admin_invitation_attempts is
  'Idempotent delivery audit for administrator invitations to already-active municipalities.';

create index if not exists municipality_admin_invitation_org_idx
  on public.municipality_admin_invitation_attempts (organization_id, created_at desc);

create unique index if not exists municipality_admin_invitation_open_idx
  on public.municipality_admin_invitation_attempts (organization_id, recipient_email)
  where status in ('preparing', 'sending', 'delivery_unknown');

alter table public.municipality_admin_invitation_attempts enable row level security;

revoke all on table public.municipality_admin_invitation_attempts
  from public, anon, authenticated;
grant select, insert, update on table public.municipality_admin_invitation_attempts
  to service_role;
revoke delete, truncate, references, trigger
  on table public.municipality_admin_invitation_attempts from service_role;
