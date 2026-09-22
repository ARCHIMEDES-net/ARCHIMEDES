alter table public.broadcast_sessions
  drop constraint broadcast_sessions_manual_recipient_emails_limit,
  add constraint broadcast_sessions_manual_recipient_emails_limit
  check (cardinality(manual_recipient_emails) <= 1000);
