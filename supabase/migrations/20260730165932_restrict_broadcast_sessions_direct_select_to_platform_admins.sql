drop policy if exists broadcast_sessions_select_published_or_admin
  on public.broadcast_sessions;

comment on table public.broadcast_sessions is
  'Direct authenticated access is restricted by RLS to platform admins. Portal attendee pages use get_portal_broadcast_sessions(uuid[]).';
