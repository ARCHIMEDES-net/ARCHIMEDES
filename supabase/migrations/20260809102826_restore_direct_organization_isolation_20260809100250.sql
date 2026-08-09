-- Restore tenant isolation between municipalities and their child organizations.
-- A parent relationship may provide an effective license, but it must not grant
-- access to the child organization's members, profiles, join code, or settings.

create or replace function public.can_administer_organization(target_org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    public.is_platform_admin()
    or exists (
      select 1
      from public.organization_members direct_admin
      where direct_admin.organization_id = target_org_id
        and direct_admin.user_id = (select auth.uid())
        and direct_admin.role_in_org = 'organization_admin'
        and direct_admin.status = 'active'
    );
$$;

create or replace function public.can_view_organization(target_org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    public.is_platform_admin()
    or exists (
      select 1
      from public.organization_members member
      where member.organization_id = target_org_id
        and member.user_id = (select auth.uid())
        and member.status = 'active'
    );
$$;

comment on function public.can_administer_organization(uuid) is
  'True only for platform admins or active direct organization admins. Parent municipality relationships do not grant child administration.';

comment on function public.can_view_organization(uuid) is
  'True only for platform admins or users with an active direct membership. Parent municipality relationships provide license inheritance only.';

create or replace function public.get_my_organizations(requested_ids uuid[] default null::uuid[])
returns table(
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
set search_path = ''
as $$
  with accessible as (
    select
      member.organization_id,
      member.role_in_org,
      1 as priority
    from public.organization_members member
    where member.user_id = (select auth.uid())
      and member.status = 'active'

    union all

    select
      organization.id,
      'organization_admin'::text as role_in_org,
      2 as priority
    from public.organizations organization
    where public.is_platform_admin()
  ), deduplicated as (
    select distinct on (accessible.organization_id)
      accessible.organization_id,
      accessible.role_in_org
    from accessible
    order by accessible.organization_id, accessible.priority
  )
  select
    organization.id,
    organization.name,
    organization.org_type,
    organization.status,
    organization.parent_organization_id,
    case
      when organization.status <> 'active' then 'inactive'
      when organization.license_status = 'active'
        and (
          organization.license_valid_until is null
          or organization.license_valid_until >= now()
        )
        then 'active'
      when parent.status = 'active'
        and lower(parent.org_type) in ('municipality', 'obec')
        and parent.license_status = 'active'
        and (parent.license_valid_until is null or parent.license_valid_until >= now())
        then 'active'
      when organization.license_status = 'suspended'
        or parent.license_status = 'suspended'
        then 'suspended'
      when organization.license_status = 'pending_approval'
        or parent.license_status = 'pending_approval'
        then 'pending_approval'
      else 'inactive'
    end as license_status,
    case
      when organization.license_status = 'active'
        and (
          organization.license_valid_until is null
          or organization.license_valid_until >= now()
        )
        then organization.license_valid_until
      when parent.status = 'active'
        and lower(parent.org_type) in ('municipality', 'obec')
        and parent.license_status = 'active'
        and (parent.license_valid_until is null or parent.license_valid_until >= now())
        then parent.license_valid_until
      else null
    end as license_valid_until,
    case
      when deduplicated.role_in_org = 'organization_admin'
        or public.is_platform_admin()
        then organization.join_code
      else null
    end as join_code,
    case
      when deduplicated.role_in_org = 'organization_admin'
        or public.is_platform_admin()
        then organization.registration_number
      else null
    end as registration_number,
    organization.is_system,
    deduplicated.role_in_org
  from deduplicated
  join public.organizations organization
    on organization.id = deduplicated.organization_id
  left join public.organizations parent
    on parent.id = organization.parent_organization_id
  where requested_ids is null
    or organization.id = any(requested_ids);
$$;

revoke all on function public.can_administer_organization(uuid)
  from public, anon;
grant execute on function public.can_administer_organization(uuid)
  to authenticated, service_role;

revoke all on function public.can_view_organization(uuid)
  from public, anon;
grant execute on function public.can_view_organization(uuid)
  to authenticated, service_role;

revoke all on function public.get_my_organizations(uuid[])
  from public, anon;
grant execute on function public.get_my_organizations(uuid[])
  to authenticated, service_role;
