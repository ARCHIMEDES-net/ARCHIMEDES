-- Municipality administrators inherit administration access to direct child organizations.
-- Platform administrators retain global access. School/organization administrators remain scoped.

create or replace function public.can_administer_organization(target_org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_platform_admin()
    or exists (
      select 1
      from public.organization_members direct_admin
      where direct_admin.organization_id = target_org_id
        and direct_admin.user_id = auth.uid()
        and direct_admin.role_in_org = 'organization_admin'
        and direct_admin.status = 'active'
    )
    or exists (
      select 1
      from public.organizations target
      join public.organizations municipality
        on municipality.id = target.parent_organization_id
      join public.organization_members municipality_admin
        on municipality_admin.organization_id = municipality.id
      where target.id = target_org_id
        and lower(municipality.org_type) in ('municipality', 'obec')
        and municipality_admin.user_id = auth.uid()
        and municipality_admin.role_in_org = 'organization_admin'
        and municipality_admin.status = 'active'
    );
$$;

create or replace function public.can_view_organization(target_org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.can_administer_organization(target_org_id)
    or exists (
      select 1
      from public.organization_members member
      where member.organization_id = target_org_id
        and member.user_id = auth.uid()
        and member.status = 'active'
    );
$$;

revoke execute on function public.can_administer_organization(uuid)
  from public, anon, authenticated;
revoke execute on function public.can_view_organization(uuid)
  from public, anon, authenticated;
grant execute on function public.can_administer_organization(uuid)
  to authenticated, service_role;
grant execute on function public.can_view_organization(uuid)
  to authenticated, service_role;

drop policy if exists org_members_select on public.organization_members;
create policy org_members_select
on public.organization_members
for select
to authenticated
using (
  user_id = auth.uid()
  or public.can_administer_organization(organization_id)
);

drop policy if exists org_members_write on public.organization_members;
create policy org_members_write
on public.organization_members
for insert
to authenticated
with check (public.can_administer_organization(organization_id));

drop policy if exists org_members_update on public.organization_members;
create policy org_members_update
on public.organization_members
for update
to authenticated
using (public.can_administer_organization(organization_id))
with check (public.can_administer_organization(organization_id));

drop policy if exists org_members_delete on public.organization_members;
create policy org_members_delete
on public.organization_members
for delete
to authenticated
using (public.can_administer_organization(organization_id));

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
      and public.can_view_organization(target_member.organization_id)
  )
);

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
set search_path = public
as $$
  with accessible as (
    select
      member.organization_id,
      member.role_in_org,
      1 as priority
    from public.organization_members member
    where member.user_id = auth.uid()
      and member.status = 'active'

    union all

    select
      child.id,
      'organization_admin'::text as role_in_org,
      2 as priority
    from public.organization_members municipality_admin
    join public.organizations municipality
      on municipality.id = municipality_admin.organization_id
    join public.organizations child
      on child.parent_organization_id = municipality.id
    where municipality_admin.user_id = auth.uid()
      and municipality_admin.role_in_org = 'organization_admin'
      and municipality_admin.status = 'active'
      and lower(municipality.org_type) in ('municipality', 'obec')

    union all

    select
      organization.id,
      'organization_admin'::text as role_in_org,
      3 as priority
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
    child.id,
    child.name,
    child.org_type,
    child.status,
    child.parent_organization_id,
    case
      when child.status <> 'active' then 'inactive'
      when child.license_status = 'active'
        and (child.license_valid_until is null or child.license_valid_until >= now())
        then 'active'
      when parent.status = 'active'
        and lower(parent.org_type) in ('municipality', 'obec')
        and parent.license_status = 'active'
        and (parent.license_valid_until is null or parent.license_valid_until >= now())
        then 'active'
      when child.license_status = 'suspended' or parent.license_status = 'suspended'
        then 'suspended'
      when child.license_status = 'pending_approval' or parent.license_status = 'pending_approval'
        then 'pending_approval'
      else 'inactive'
    end as license_status,
    case
      when child.license_status = 'active'
        and (child.license_valid_until is null or child.license_valid_until >= now())
        then child.license_valid_until
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
        then child.join_code
      else null
    end as join_code,
    case
      when deduplicated.role_in_org = 'organization_admin'
        or public.is_platform_admin()
        then child.registration_number
      else null
    end as registration_number,
    child.is_system,
    deduplicated.role_in_org
  from deduplicated
  join public.organizations child
    on child.id = deduplicated.organization_id
  left join public.organizations parent
    on parent.id = child.parent_organization_id
  where requested_ids is null
    or child.id = any(requested_ids);
$$;

revoke all on function public.get_my_organizations(uuid[])
  from public, anon;
grant execute on function public.get_my_organizations(uuid[])
  to authenticated, service_role;
