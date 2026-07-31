create index if not exists organizations_parent_organization_id_idx
  on public.organizations(parent_organization_id);

create index if not exists profiles_active_organization_id_idx
  on public.profiles(active_organization_id);

create index if not exists licenses_organization_id_idx
  on public.licenses(organization_id);

create index if not exists broadcast_sessions_event_id_idx
  on public.broadcast_sessions(event_id);

create index if not exists event_attendees_organization_id_idx
  on public.event_attendees(organization_id);

create index if not exists event_attendees_user_id_idx
  on public.event_attendees(user_id);
