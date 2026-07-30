-- Člen organizace nesmí přímým SELECTem získat celý řádek organizations
-- včetně join_code, registration_number a kontaktních údajů. Čtení pro
-- portál proto vede přes omezenou SECURITY DEFINER funkci; přímý SELECT
-- zůstává platformovým adminům a service_role.

create or replace function public.get_my_organizations(
  requested_ids uuid[] default null
)
returns table (
  id uuid,
  name text,
  org_type text,
  status text,
  parent_organization_id uuid,
  license_status text,
  license_valid_until timestamptz,
  join_code text,
  registration_number text,
  is_system boolean,
  role_in_org text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    child.id,
    child.name,
    child.org_type,
    child.status,
    child.parent_organization_id,
    coalesce(parent.license_status, child.license_status) as license_status,
    coalesce(parent.license_valid_until, child.license_valid_until) as license_valid_until,
    case
      when member.role_in_org = 'organization_admin' or is_admin()
        then child.join_code
      else null
    end as join_code,
    case
      when member.role_in_org = 'organization_admin' or is_admin()
        then child.registration_number
      else null
    end as registration_number,
    child.is_system,
    member.role_in_org
  from organization_members member
  join organizations child on child.id = member.organization_id
  left join organizations parent on parent.id = child.parent_organization_id
  where member.user_id = auth.uid()
    and member.status = 'active'
    and (requested_ids is null or child.id = any(requested_ids));
$$;

revoke all on function public.get_my_organizations(uuid[]) from public;
revoke all on function public.get_my_organizations(uuid[]) from anon;
grant execute on function public.get_my_organizations(uuid[]) to authenticated;

drop policy if exists organizations_direct_select_platform_admin
  on public.organizations;

create policy organizations_direct_select_platform_admin
  on public.organizations
  as restrictive
  for select
  to authenticated
  using (is_admin());
