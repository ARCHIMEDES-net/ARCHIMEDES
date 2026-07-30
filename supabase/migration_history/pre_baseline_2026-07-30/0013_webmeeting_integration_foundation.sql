-- Technické propojení broadcast_sessions s externím poskytovatelem vysílání.
-- Vstupní URL diváka je unikátní a generuje se až po ověření uživatele;
-- do viewer_url se proto neukládá společný veřejný odkaz.

alter table public.broadcast_sessions
  add column if not exists external_meeting_id text,
  add column if not exists provider_status text,
  add column if not exists last_synced_at timestamptz,
  add column if not exists last_provider_error text;

create unique index if not exists broadcast_sessions_platform_external_meeting_uidx
  on public.broadcast_sessions (platform, external_meeting_id)
  where external_meeting_id is not null;

comment on column public.broadcast_sessions.external_meeting_id is
  'ID místnosti u poskytovatele vysílání; není to vstupní URL.';
comment on column public.broadcast_sessions.last_provider_error is
  'Poslední technická chyba synchronizace bez API tajemství a osobních údajů.';

create table if not exists public.broadcast_participants (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.broadcast_sessions(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  organization_id uuid references public.organizations(id) on delete set null,
  provider_participant_id text not null,
  join_requested_at timestamptz not null default now(),
  presence_data jsonb,
  last_presence_sync_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (session_id, user_id),
  unique (session_id, provider_participant_id)
);

alter table public.broadcast_participants enable row level security;

comment on table public.broadcast_participants is
  'Serverová vazba účastníka ARCHIMEDES Live na technické ID WebMeetingu pro docházku. Bez klientských RLS policies.';
