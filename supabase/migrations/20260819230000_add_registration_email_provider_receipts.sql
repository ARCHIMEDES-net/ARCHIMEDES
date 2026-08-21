alter table public.municipality_admin_invitation_attempts
  add column if not exists email_provider text,
  add column if not exists client_provider_message_id text,
  add column if not exists audit_copy_provider_message_id text;

alter table public.organization_onboarding_email_attempts
  add column if not exists email_provider text,
  add column if not exists client_provider_message_id text,
  add column if not exists audit_copy_provider_message_id text,
  add column if not exists audit_copy_sent_at timestamptz;

alter table public.customer_order_acceptances
  add column if not exists email_provider text,
  add column if not exists client_provider_message_id text,
  add column if not exists audit_copy_provider_message_id text,
  add column if not exists audit_copy_sent_at timestamptz;

alter table public.profile_completion_reminder_attempts
  add column if not exists email_provider text,
  add column if not exists client_provider_message_id text,
  add column if not exists audit_copy_provider_message_id text,
  add column if not exists audit_copy_sent_at timestamptz;

alter table public.municipality_admin_invitation_attempts
  add constraint municipality_admin_invitation_email_provider_check
    check (email_provider is null or email_provider = 'resend'),
  add constraint municipality_admin_invitation_provider_ids_check
    check (
      (client_provider_message_id is null or length(client_provider_message_id) <= 500)
      and (audit_copy_provider_message_id is null or length(audit_copy_provider_message_id) <= 500)
    );

alter table public.organization_onboarding_email_attempts
  add constraint organization_onboarding_email_provider_check
    check (email_provider is null or email_provider = 'resend'),
  add constraint organization_onboarding_provider_ids_check
    check (
      (client_provider_message_id is null or length(client_provider_message_id) <= 500)
      and (audit_copy_provider_message_id is null or length(audit_copy_provider_message_id) <= 500)
    );

alter table public.customer_order_acceptances
  add constraint customer_order_acceptance_email_provider_check
    check (email_provider is null or email_provider = 'resend'),
  add constraint customer_order_acceptance_provider_ids_check
    check (
      (client_provider_message_id is null or length(client_provider_message_id) <= 500)
      and (audit_copy_provider_message_id is null or length(audit_copy_provider_message_id) <= 500)
    );

alter table public.profile_completion_reminder_attempts
  add constraint profile_completion_reminder_email_provider_check
    check (email_provider is null or email_provider = 'resend'),
  add constraint profile_completion_reminder_provider_ids_check
    check (
      (client_provider_message_id is null or length(client_provider_message_id) <= 500)
      and (audit_copy_provider_message_id is null or length(audit_copy_provider_message_id) <= 500)
    );

grant update (
  email_provider,
  client_provider_message_id,
  audit_copy_provider_message_id,
  audit_copy_sent_at
) on public.organization_onboarding_email_attempts to service_role;

comment on column public.organization_onboarding_email_attempts.client_provider_message_id is
  'Provider receipt for the token-bearing client email; used for delivery audit and reconciliation.';
comment on column public.organization_onboarding_email_attempts.audit_copy_provider_message_id is
  'Provider receipt for the separate token-free audit copy sent to Zuzana.';
