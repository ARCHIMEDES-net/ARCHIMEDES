-- MANUAL TEMPLATE ONLY. Do not add this file to the migration chain.
-- This repository copy contains no production identifiers, aborts unconditionally,
-- and ends with ROLLBACK. An accountable operator must prepare and review a
-- separate execution copy after approving the exact candidate identities.

begin transaction read write;

-- Safety fuse: the repository template must never reach the DELETE statement.
-- A separately approved execution copy must remove this block explicitly.
do $$
begin
  raise exception
    'Template only: prepare a separately approved execution copy before use.';
end;
$$;

create temporary table orphan_platform_admin_candidates (user_id uuid primary key)
on commit drop;

-- Replace these NULL placeholders only in the separately approved execution copy.
-- Keeping them NULL makes this template fail closed even if the safety fuse above
-- is removed accidentally.
insert into orphan_platform_admin_candidates (user_id) values
  (null::uuid),
  (null::uuid);

do $$
begin
  if exists (
    select 1
    from orphan_platform_admin_candidates candidate
    join auth.users auth_user on auth_user.id = candidate.user_id
  ) or exists (
    select 1
    from orphan_platform_admin_candidates candidate
    join public.profiles profile on profile.id = candidate.user_id
  ) or exists (
    select 1
    from orphan_platform_admin_candidates candidate
    join public.organization_members member on member.user_id = candidate.user_id
  ) or exists (
    select 1
    from orphan_platform_admin_candidates candidate
    join public.organizations organization on organization.activated_by = candidate.user_id
  ) or exists (
    select 1 from orphan_platform_admin_candidates candidate
    join public.admin_users row_ref on row_ref.user_id = candidate.user_id
  ) or exists (
    select 1 from orphan_platform_admin_candidates candidate
    join public.user_roles row_ref on row_ref.user_id = candidate.user_id
  ) or exists (
    select 1 from orphan_platform_admin_candidates candidate
    join public.archive_items row_ref on row_ref.created_by = candidate.user_id
  ) or exists (
    select 1 from orphan_platform_admin_candidates candidate
    join public.events row_ref on row_ref.created_by = candidate.user_id
  ) or exists (
    select 1 from orphan_platform_admin_candidates candidate
    join public.municipality_organization_invites row_ref
      on row_ref.created_by = candidate.user_id
  ) or exists (
    select 1 from orphan_platform_admin_candidates candidate
    join public.portal_posts row_ref on row_ref.created_by = candidate.user_id
  ) or exists (
    select 1 from orphan_platform_admin_candidates candidate
    join public.resources row_ref on row_ref.created_by = candidate.user_id
  ) or exists (
    select 1 from orphan_platform_admin_candidates candidate
    join public.broadcast_participants row_ref on row_ref.user_id = candidate.user_id
  ) or exists (
    select 1 from orphan_platform_admin_candidates candidate
    join public.event_attendees row_ref on row_ref.user_id = candidate.user_id
  ) or exists (
    select 1 from orphan_platform_admin_candidates candidate
    join public.user_audience_preferences row_ref on row_ref.user_id = candidate.user_id
  ) or exists (
    select 1 from orphan_platform_admin_candidates candidate
    join public.user_category_preferences row_ref on row_ref.user_id = candidate.user_id
  ) or exists (
    select 1 from orphan_platform_admin_candidates candidate
    join public.user_interests row_ref on row_ref.user_id = candidate.user_id
  ) then
    raise exception
      'Cleanup aborted: at least one candidate regained an identity or business reference.';
  end if;

  if (
    select count(*)
    from public.platform_admins platform_admin
    join orphan_platform_admin_candidates candidate
      on candidate.user_id = platform_admin.user_id
  ) <> 2 then
    raise exception
      'Cleanup aborted: the reviewed candidate set no longer matches production.';
  end if;
end;
$$;

delete from public.platform_admins platform_admin
using orphan_platform_admin_candidates candidate
where platform_admin.user_id = candidate.user_id
returning platform_admin.user_id, platform_admin.role, platform_admin.created_at;

-- Preview only. A separately approved execution copy may replace this with
-- COMMIT only after removing the safety fuse, supplying reviewed identifiers,
-- reviewing the returned rows, and recording the change ticket.
rollback;
