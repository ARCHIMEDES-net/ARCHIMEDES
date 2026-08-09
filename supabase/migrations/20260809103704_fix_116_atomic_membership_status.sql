-- #116: Change one organization membership status atomically.
-- Organization administrators may change only memberships in organizations
-- where they are active direct administrators. Global profile state is not
-- part of this operation.

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
set search_path = ''
as $$
declare
  current_membership public.organization_members%rowtype;
begin
  if (select auth.uid()) is null then
    raise exception 'Přihlášení je vyžadováno.';
  end if;

  if target_organization_id is null or target_user_id is null then
    raise exception 'Organizace a uživatel jsou povinné.';
  end if;

  if new_status not in ('active', 'inactive') then
    raise exception 'Neplatný stav členství.';
  end if;

  -- Reject unauthorized callers before acquiring a write lock. Authorization
  -- is checked again after the lock in case the caller waited behind another
  -- membership change in the same organization.
  if not public.can_administer_organization(target_organization_id) then
    raise exception 'Nemáte oprávnění spravovat tuto organizaci.';
  end if;

  -- Every call for one organization takes the same first lock. This keeps the
  -- last-administrator check deterministic and prevents lock-order deadlocks.
  perform 1
  from public.organizations organization
  where organization.id = target_organization_id
  for update;

  if not found then
    raise exception 'Organizace nebyla nalezena.';
  end if;

  if not public.can_administer_organization(target_organization_id) then
    raise exception 'Nemáte oprávnění spravovat tuto organizaci.';
  end if;

  if target_user_id = (select auth.uid()) and new_status = 'inactive' then
    raise exception 'Administrátor nemůže deaktivovat své vlastní členství.';
  end if;

  select membership.*
  into current_membership
  from public.organization_members membership
  where membership.organization_id = target_organization_id
    and membership.user_id = target_user_id
  for update;

  if not found then
    raise exception 'Členství organizace nebylo nalezeno.';
  end if;

  if current_membership.role_in_org = 'organization_admin'
     and current_membership.status = 'active'
     and new_status = 'inactive'
     and not exists (
       select 1
       from public.organization_members administrator
       where administrator.organization_id = target_organization_id
         and administrator.user_id <> target_user_id
         and administrator.role_in_org = 'organization_admin'
         and administrator.status = 'active'
     ) then
    raise exception 'Posledního aktivního administrátora organizace nelze deaktivovat.';
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

comment on function public.set_organization_membership_status(uuid, uuid, text) is
  'Atomically changes one direct organization membership without changing the global profile state.';

revoke all on function public.set_organization_membership_status(uuid, uuid, text)
  from public, anon, authenticated, service_role;
grant execute on function public.set_organization_membership_status(uuid, uuid, text)
  to authenticated;

-- Authenticated clients must use the guarded RPC. Trusted service-role flows
-- retain their existing direct table privileges for central administration.
revoke update on table public.organization_members from authenticated;
