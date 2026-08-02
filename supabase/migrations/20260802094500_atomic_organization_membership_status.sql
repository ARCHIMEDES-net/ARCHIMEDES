-- #116: Atomically change one organization membership status.
-- This migration does not modify existing data when applied.
-- It creates only a guarded RPC function and its execution grants.

create or replace function public.set_organization_membership_status(
  target_organization_id uuid,
  target_user_id uuid,
  new_status text
)
returns table (
  organization_id uuid,
  user_id uuid,
  role_in_org text,
  status text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_membership public.organization_members%rowtype;
  active_admin_count integer;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if target_organization_id is null or target_user_id is null then
    raise exception 'Organization and user are required';
  end if;

  if new_status not in ('active', 'inactive') then
    raise exception 'Invalid membership status';
  end if;

  if not public.can_administer_organization(target_organization_id) then
    raise exception 'Not authorized to administer this organization';
  end if;

  -- Self-deactivation is intentionally forbidden until an explicit product rule exists.
  if target_user_id = auth.uid() and new_status = 'inactive' then
    raise exception 'Administrators cannot deactivate their own membership';
  end if;

  select membership.*
  into current_membership
  from public.organization_members membership
  where membership.organization_id = target_organization_id
    and membership.user_id = target_user_id
  for update;

  if not found then
    raise exception 'Organization membership not found';
  end if;

  if current_membership.role_in_org = 'organization_admin'
     and current_membership.status = 'active'
     and new_status = 'inactive' then
    -- Lock all active administrators in this organization before counting.
    -- This prevents two concurrent requests from both believing another
    -- administrator will remain active and disabling the last two admins.
    perform 1
    from public.organization_members administrator
    where administrator.organization_id = target_organization_id
      and administrator.role_in_org = 'organization_admin'
      and administrator.status = 'active'
    for update;

    select count(*)
    into active_admin_count
    from public.organization_members administrator
    where administrator.organization_id = target_organization_id
      and administrator.role_in_org = 'organization_admin'
      and administrator.status = 'active';

    if active_admin_count <= 1 then
      raise exception 'The last active organization administrator cannot be deactivated';
    end if;
  end if;

  update public.organization_members membership
  set status = new_status
  where membership.organization_id = target_organization_id
    and membership.user_id = target_user_id;

  return query
  select
    membership.organization_id,
    membership.user_id,
    membership.role_in_org,
    membership.status
  from public.organization_members membership
  where membership.organization_id = target_organization_id
    and membership.user_id = target_user_id;
end;
$$;

revoke all on function public.set_organization_membership_status(uuid, uuid, text)
  from public, anon;
revoke execute on function public.set_organization_membership_status(uuid, uuid, text)
  from authenticated;
grant execute on function public.set_organization_membership_status(uuid, uuid, text)
  to authenticated, service_role;
