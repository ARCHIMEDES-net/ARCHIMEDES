-- Restrict profile visibility to active organization relationships only.
-- Users can always read their own profile. Platform administrators retain
-- cross-organization visibility required for support and administration.

drop policy if exists profiles_select on public.profiles;

create policy profiles_select
on public.profiles
for select
to authenticated
using (
  id = auth.uid()
  or public.is_platform_admin()
  or exists (
    select 1
    from public.organization_members target_member
    where target_member.user_id = profiles.id
      and target_member.status = 'active'
      and target_member.organization_id in (
        select viewer_member.organization_id
        from public.organization_members viewer_member
        where viewer_member.user_id = auth.uid()
          and viewer_member.status = 'active'
      )
  )
);
