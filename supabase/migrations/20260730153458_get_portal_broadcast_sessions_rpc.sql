-- Phase 1 of the controlled rollout for GitHub issue #73.
--
-- This migration adds only the narrow attendee RPC. It intentionally leaves
-- the existing broadcast_sessions grants and RLS policies unchanged until the
-- separate compatibility window and production smoke tests have succeeded.

begin;

-- A security-invoker view cannot safely replace direct table access here:
-- after revoking authenticated SELECT on broadcast_sessions, the invoker would
-- also lose the underlying privileges required by the view. Use a narrowly
-- scoped SECURITY DEFINER RPC instead, with a fixed search_path and an explicit
-- return contract.
create or replace function public.get_portal_broadcast_sessions(
  p_event_ids uuid[]
)
returns table (
  id uuid,
  event_id uuid,
  status text,
  viewer_url text,
  recording_url text,
  recording_status text,
  starts_at timestamptz,
  ended_at timestamptz,
  access_mode text,
  is_published boolean,
  moderator_name text,
  guest_1_name text,
  guest_2_name text,
  guest_3_name text,
  guest_4_name text,
  guest_5_name text,
  has_external_meeting boolean
)
language sql
stable
security definer
set search_path = ''
as $$
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
  join public.events as event on event.id = session.event_id
  where auth.uid() is not null
    and session.event_id = any(coalesce(p_event_ids, array[]::uuid[]))
    and session.is_published = true
    and event.is_published = true;
$$;

comment on function public.get_portal_broadcast_sessions(uuid[]) is
  'Minimal attendee-visible broadcast-session RPC. Excludes host/moderator join URLs, provider state, provider errors, internal notes and external meeting identifiers.';

revoke all on function public.get_portal_broadcast_sessions(uuid[]) from public;
revoke all on function public.get_portal_broadcast_sessions(uuid[]) from anon;
grant execute on function public.get_portal_broadcast_sessions(uuid[]) to authenticated;
grant execute on function public.get_portal_broadcast_sessions(uuid[]) to service_role;

commit;

-- Required rollout order:
-- 1. Apply this RPC without changing broadcast_sessions grants or policies.
-- 2. Update attendee-facing portal queries to call the RPC through
--    lib/portalBroadcastSessions.js.
-- 3. Verify calendar, event detail, archive and join flow with a normal user.
-- 4. Verify admin WebMeeting workflows still use the base table via server-side
--    service-role/admin paths.
-- 5. Only then remove the authenticated published-row SELECT policy and direct
--    SELECT grant from the base table. Keep platform-admin/service-role access.
--
-- Verification queries:
-- select routine_name, security_type
-- from information_schema.routines
-- where routine_schema = 'public'
--   and routine_name = 'get_portal_broadcast_sessions';
--
-- select grantee, privilege_type
-- from information_schema.routine_privileges
-- where specific_schema = 'public'
--   and routine_name = 'get_portal_broadcast_sessions'
-- order by grantee, privilege_type;
