-- Anonymous users only need published public content. Remove authorization
-- helper calls from those public-read policies so helper EXECUTE can be scoped
-- to authenticated callers.
alter policy "events_select_published_or_admin"
  on public.events
  to public
  using (is_published = true);

alter policy "portal_posts_read_published"
  on public.portal_posts
  to public
  using (is_published = true);

drop policy if exists "portal_posts_admin_select" on public.portal_posts;
create policy "portal_posts_admin_select"
  on public.portal_posts for select
  to authenticated
  using (public.is_admin());

-- Broadcast session records include provider status and integration metadata.
-- They are consumed only by authenticated portal pages and the server-side join
-- endpoint, so do not expose them to the anonymous PostgREST role.
alter policy "broadcast_sessions_select_published_or_admin"
  on public.broadcast_sessions
  to authenticated
  using (
    public.is_admin()
    or exists (
      select 1
      from public.events event
      where event.id = broadcast_sessions.event_id
        and event.is_published = true
    )
  );

-- These policies all require auth.uid() or an admin/member helper to succeed.
-- Declaring them for PUBLIC needlessly invokes privileged helpers for anon.
alter policy "activity_categories_write_admin"
  on public.activity_categories to authenticated;
alter policy "announcements_write_admin"
  on public.announcements to authenticated;
alter policy "archive_write"
  on public.archive_items to authenticated;
alter policy "licenses_select"
  on public.licenses to authenticated;
alter policy "licenses_write"
  on public.licenses to authenticated;
alter policy "organization_activities_delete"
  on public.organization_activities to authenticated;
alter policy "organization_activities_select"
  on public.organization_activities to authenticated;
alter policy "organization_activities_update"
  on public.organization_activities to authenticated;
alter policy "organization_activities_write"
  on public.organization_activities to authenticated;
alter policy "org_members_delete"
  on public.organization_members to authenticated;
alter policy "org_members_update"
  on public.organization_members to authenticated;
alter policy "org_members_write"
  on public.organization_members to authenticated;
alter policy "orgs_select"
  on public.organizations to authenticated;
alter policy "orgs_write"
  on public.organizations to authenticated;
alter policy "resources_write"
  on public.resources to authenticated;
alter policy "user_interests_delete"
  on public.user_interests to authenticated;
alter policy "user_interests_select"
  on public.user_interests to authenticated;

-- Authorization helpers are legitimate RPCs for signed-in clients and are used
-- by authenticated RLS policies. They must not remain executable through the
-- default PUBLIC function grant.
revoke execute on function public.is_admin() from public, anon, authenticated;
revoke execute on function public.is_platform_admin() from public, anon, authenticated;
revoke execute on function public.is_org_admin(uuid) from public, anon, authenticated;
revoke execute on function public.is_org_admin_member(uuid) from public, anon, authenticated;
revoke execute on function public.is_school_admin() from public, anon, authenticated;
revoke execute on function public.my_school_id() from public, anon, authenticated;

grant execute on function public.is_admin() to authenticated, service_role;
grant execute on function public.is_platform_admin() to authenticated, service_role;
grant execute on function public.is_org_admin(uuid) to authenticated, service_role;
grant execute on function public.is_org_admin_member(uuid) to authenticated, service_role;
grant execute on function public.is_school_admin() to authenticated, service_role;
grant execute on function public.my_school_id() to authenticated, service_role;

-- Fix mutable function lookup paths. Trigger functions are invoked by their
-- triggers and have no reason to be callable as client RPCs.
alter function public.is_org_admin(uuid) set search_path = public;
alter function public.generate_join_code() set search_path = public;
alter function public.generate_obec_registration_number() set search_path = public;
alter function public.generate_spolek_registration_number() set search_path = public;
alter function public.marketplace_posts_tsv_update() set search_path = public;
alter function public.set_portal_posts_updated_at() set search_path = public;
alter function public.set_updated_at() set search_path = public;

revoke execute on function public.generate_join_code() from public, anon, authenticated;
revoke execute on function public.generate_obec_registration_number() from public, anon, authenticated;
revoke execute on function public.generate_spolek_registration_number() from public, anon, authenticated;
revoke execute on function public.marketplace_posts_tsv_update() from public, anon, authenticated;
revoke execute on function public.set_portal_posts_updated_at() from public, anon, authenticated;
revoke execute on function public.set_updated_at() from public, anon, authenticated;
