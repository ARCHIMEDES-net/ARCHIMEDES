-- The school invitation API already writes these provider receipts.
-- Keep the existing table privileges and RLS unchanged.
alter table public.school_member_invitation_attempts
  add column if not exists email_provider text,
  add column if not exists client_provider_message_id text,
  add column if not exists audit_copy_provider_message_id text;
