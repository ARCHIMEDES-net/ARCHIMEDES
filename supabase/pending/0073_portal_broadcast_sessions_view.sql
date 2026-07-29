-- Pending security change for GitHub issue #73.
--
-- This file is intentionally outside supabase/migrations while issue #81
-- (migration-history reconciliation) remains open. Do not apply it blindly.
-- Apply only together with the portal query changes and the verification steps
-- described below.

begin;

create or replace view public.portal_broadcast_sessions
with (security_invoker = true)
as
select
  session.id,
  session.event_id,
  session.status,
  session.viewer_url,
  case
    when session.recording_status = 'published' then session.recording_url
    else null
  end as recording_url,
  session.recording_status,
  session.starts_at,
  session.ended_at,
  session.access_mode,
  session.is_published,
  session.moderator_name,
  session.guest_1_name,
  session.guest_2_name,
  session.guest_3_name,
  session.guest_4_name,
  session.guest_5_name,
  (session.external_meeting_id is not null) as has_external_meeting
from public.broadcast_sessions as session
where session.is_published = true
  and exists (
    select 1
    from public.events as event
    where event.id = session.event_id
      and event.is_published = true
  );

comment on view public.portal_broadcast_sessions is
  'Minimal attendee-visible broadcast-session contract. Excludes host/moderator join URLs, provider state, provider errors, internal notes and external meeting identifiers.';

revoke all on public.portal_broadcast_sessions from public;
revoke all on public.portal_broadcast_sessions from anon;
grant select on public.portal_broadcast_sessions to authenticated;
grant select on public.portal_broadcast_sessions to service_role;

commit;

-- Important PostgREST note:
-- A view does not automatically inherit the base table foreign-key relationship
-- used by nested `events(..., broadcast_sessions(...))` selects. Attendee pages
-- must therefore load events first and then attach rows from this view by event_id.
-- The shared helper for that transition is lib/portalBroadcastSessions.js.
--
-- Required rollout order:
-- 1. Apply this view without changing broadcast_sessions grants or policies.
-- 2. Update attendee-facing portal queries to read this view through the helper.
-- 3. Verify calendar, event detail, archive and join flow with a normal user.
-- 4. Verify admin WebMeeting workflows still use the base table via server-side
--    service-role/admin paths.
-- 5. Only then remove the authenticated published-row SELECT policy from the
--    base table. Keep platform-admin/service-role access.
--
-- Verification queries:
-- select column_name
-- from information_schema.columns
-- where table_schema = 'public'
--   and table_name = 'portal_broadcast_sessions'
-- order by ordinal_position;
--
-- select grantee, privilege_type
-- from information_schema.role_table_grants
-- where table_schema = 'public'
--   and table_name = 'portal_broadcast_sessions'
-- order by grantee, privilege_type;
