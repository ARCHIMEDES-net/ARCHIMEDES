grant select on table public.broadcast_sessions to authenticated;

comment on table public.broadcast_sessions is
  'Direct authenticated SELECT temporarily restored for the existing platform-admin client workflow. Portal attendee pages must continue using get_portal_broadcast_sessions(uuid[]).';
