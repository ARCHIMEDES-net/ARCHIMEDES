-- Měření skutečného používání portálu ARCHIMEDES Live.
-- 1) Jeden řádek na uživatele a den, kdy otevřel přihlášený portál (portal_visit).
-- 2) Jeden řádek na uživatele, vysílání a den, kdy klikl na „Vstoupit do vysílání“ (broadcast_join).
-- 3) Počet zařízení připojených do místnosti WebMeetingu podle docházky z WebMeetingu.
-- Tabulka je pouze serverová: klienti k ní nemají přímý přístup.

create table public.portal_usage_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete set null,
  kind text not null check (kind in ('portal_visit', 'broadcast_join')),
  event_id uuid references public.events(id) on delete cascade,
  activity_day date not null default ((now() at time zone 'Europe/Prague')::date),
  first_seen_at timestamptz not null default now(),
  constraint portal_usage_log_event_matches_kind
    check ((kind = 'broadcast_join') = (event_id is not null))
);

create unique index portal_usage_log_once_per_day
  on public.portal_usage_log (user_id, kind, activity_day, event_id) nulls not distinct;
create index portal_usage_log_day_kind on public.portal_usage_log (activity_day, kind);
create index portal_usage_log_event on public.portal_usage_log (event_id) where event_id is not null;

alter table public.portal_usage_log enable row level security;
revoke all on public.portal_usage_log from public, anon, authenticated;
grant all on public.portal_usage_log to service_role;

comment on table public.portal_usage_log is
  'Server-only denní záznam používání portálu: nejvýše jeden řádek na uživatele, druh aktivity, den (Europe/Prague) a vysílání. Slouží jen pro souhrnné statistiky platformového admina.';

alter table public.broadcast_sessions
  add column presence_participant_count integer
    check (presence_participant_count is null or presence_participant_count >= 0);

comment on column public.broadcast_sessions.presence_participant_count is
  'Počet různých účastníků (zařízení), které WebMeeting vykázal v docházce místnosti při poslední synchronizaci výsledků. Jedno zařízení může sledovat celá třída.';

create function public.record_portal_usage(
  p_user_id uuid,
  p_organization_id uuid,
  p_kind text,
  p_event_id uuid default null
) returns boolean
language sql
security invoker
set search_path = ''
as $$
  with inserted as (
    insert into public.portal_usage_log (user_id, organization_id, kind, event_id)
    values (p_user_id, p_organization_id, p_kind, p_event_id)
    on conflict do nothing
    returning 1
  )
  select exists (select 1 from inserted);
$$;

revoke all on function public.record_portal_usage(uuid, uuid, text, uuid) from public, anon, authenticated;
grant execute on function public.record_portal_usage(uuid, uuid, text, uuid) to service_role;

create function public.get_portal_usage_stats(p_days integer default 30)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  with params as (
    select
      greatest(1, least(coalesce(p_days, 30), 365)) as days,
      (now() at time zone 'Europe/Prague')::date as today
  ),
  admins as (
    select user_id from public.platform_admins
  ),
  usage as (
    select l.*
    from public.portal_usage_log l, params p
    where l.activity_day > p.today - p.days
      and l.user_id not in (select user_id from admins)
  ),
  visits as (
    select * from usage where kind = 'portal_visit'
  ),
  broadcasts as (
    select
      e.id,
      e.title,
      coalesce(s.starts_at, e.starts_at) as starts_at,
      s.presence_participant_count,
      s.last_synced_at,
      (s.external_meeting_id is not null) as integrated_room,
      (
        select count(*) from public.event_attendees a
        where a.event_id = e.id and a.excluded_admin_context is not true
      ) as registered,
      (
        select count(distinct u.user_id) from usage u
        where u.kind = 'broadcast_join' and u.event_id = e.id
      ) as join_clicks,
      (
        select count(distinct u.organization_id) from usage u
        where u.kind = 'broadcast_join' and u.event_id = e.id and u.organization_id is not null
      ) as join_organizations
    from public.events e
    join public.broadcast_sessions s on s.event_id = e.id, params p
    where coalesce(s.starts_at, e.starts_at) >= (p.today - p.days)::timestamptz
      and coalesce(s.starts_at, e.starts_at) < now()
  )
  select jsonb_build_object(
    'days', (select days from params),
    'generatedAt', now(),
    'measuredSince', (select min(activity_day) from public.portal_usage_log),
    'activeUsers', (select count(distinct user_id) from visits),
    'activeUsers7d', (
      select count(distinct user_id) from visits, params p
      where activity_day > p.today - 7
    ),
    'activeOrganizations', (
      select count(distinct organization_id) from visits where organization_id is not null
    ),
    'returningUsers', (
      select count(*) from (
        select user_id from visits group by user_id having count(distinct activity_day) >= 2
      ) returning_users
    ),
    'daily', coalesce((
      select jsonb_agg(jsonb_build_object('day', day, 'users', users) order by day)
      from (
        select activity_day as day, count(distinct user_id) as users
        from visits group by activity_day
      ) d
    ), '[]'::jsonb),
    'accounts', (
      select jsonb_build_object(
        'total', count(*),
        'neverSignedIn', count(*) filter (where u.last_sign_in_at is null)
      )
      from auth.users u
      where u.id not in (select user_id from admins)
    ),
    'broadcasts', coalesce((
      select jsonb_agg(jsonb_build_object(
        'eventId', id,
        'title', title,
        'startsAt', starts_at,
        'registered', registered,
        'joinClicks', join_clicks,
        'joinOrganizations', join_organizations,
        'connectedDevices', presence_participant_count,
        'integratedRoom', integrated_room,
        'lastSyncedAt', last_synced_at
      ) order by starts_at desc)
      from broadcasts
    ), '[]'::jsonb)
  );
$$;

revoke all on function public.get_portal_usage_stats(integer) from public, anon, authenticated;
grant execute on function public.get_portal_usage_stats(integer) to service_role;

comment on function public.get_portal_usage_stats(integer) is
  'Souhrnné statistiky používání portálu bez osobních údajů. Volá jen serverové admin API po ověření platformového admina.';
