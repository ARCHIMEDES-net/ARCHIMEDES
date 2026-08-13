alter table public.broadcast_sessions
  add column if not exists manual_recipient_emails text[] not null default '{}'::text[];

alter table public.broadcast_sessions
  drop constraint if exists broadcast_sessions_manual_recipient_emails_limit;

alter table public.broadcast_sessions
  add constraint broadcast_sessions_manual_recipient_emails_limit
  check (cardinality(manual_recipient_emails) <= 200);

comment on column public.broadcast_sessions.manual_recipient_emails is
  'Ručně přidaní příjemci pozvánky pro konkrétní vysílání. Slouží pouze platformovým administrátorům a nejsou součástí veřejných RPC.';
