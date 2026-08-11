-- Public archive rows do not require a SECURITY DEFINER helper. Keep the
-- privileged helper available only to signed-in users whose licensed access
-- must be evaluated across RLS-protected membership and organization tables.

alter function public.can_view_archive_item(uuid) set search_path = '';

revoke execute on function public.can_view_archive_item(uuid)
  from public, anon;
grant execute on function public.can_view_archive_item(uuid)
  to authenticated, service_role;

drop policy if exists archive_select on public.archive_items;
drop policy if exists archive_select_public on public.archive_items;
drop policy if exists archive_select_licensed on public.archive_items;

create policy archive_select_public
  on public.archive_items
  for select
  to anon, authenticated
  using (visibility = 'public');

create policy archive_select_licensed
  on public.archive_items
  for select
  to authenticated
  using (public.can_view_archive_item(id));

comment on function public.can_view_archive_item(uuid) is
  'SECURITY DEFINER RLS helper for authenticated licensed archive access; anonymous access is handled directly by archive_select_public.';
