-- Portal users must access broadcast session data only through
-- public.get_portal_broadcast_sessions(uuid[]).
--
-- The RPC exposes a narrow, reviewed contract and hides provider/internal data.
-- Administrative and backend access through postgres/service_role is unchanged.

revoke select on table public.broadcast_sessions from anon, authenticated;
