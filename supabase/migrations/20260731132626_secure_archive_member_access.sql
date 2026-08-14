-- Secure archive access by active licensed organization membership.
-- Platform administrators retain global access.
-- Empty organization mapping means all active licensed members may view the item.
-- One or more mappings restrict the item to those organizations and municipality-admin inheritance.

create table if not exists public.archive_item_organizations (
  archive_item_id uuid not null references public.archive_items(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (archive_item_id, organization_id)
);

alter table public.archive_item_organizations enable row level security;

create index if not exists archive_item_organizations_organization_idx
  on public.archive_item_organizations (organization_id, archive_item_id);

create or replace function public.has_active_licensed_membership()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_members member
    join public.organizations organization
      on organization.id = member.organization_id
    left join public.organizations parent
      on parent.id = organization.parent_organization_id
    where member.user_id = auth.uid()
      and member.status = 'active'
      and organization.status = 'active'
      and (
        (
          organization.license_status = 'active'
          and (
            organization.license_valid_until is null
            or organization.license_valid_until >= now()
          )
        )
        or (
          parent.status = 'active'
          and lower(parent.org_type) in ('municipality', 'obec')
          and parent.license_status = 'active'
          and (
            parent.license_valid_until is null
            or parent.license_valid_until >= now()
          )
        )
      )
  );
$$;

create or replace function public.can_view_archive_item(target_archive_item_id uuid)
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
      from public.archive_items item
      where item.id = target_archive_item_id
        and item.visibility = 'public'
    )
    or (
      auth.uid() is not null
      and public.has_active_licensed_membership()
      and (
        not exists (
          select 1
          from public.archive_item_organizations scope
          where scope.archive_item_id = target_archive_item_id
        )
        or exists (
          select 1
          from public.archive_item_organizations scope
          where scope.archive_item_id = target_archive_item_id
            and public.can_view_organization(scope.organization_id)
        )
      )
    );
$$;

revoke execute on function public.has_active_licensed_membership()
  from public, anon, authenticated;
grant execute on function public.has_active_licensed_membership()
  to authenticated, service_role;

revoke execute on function public.can_view_archive_item(uuid)
  from public, anon, authenticated;
grant execute on function public.can_view_archive_item(uuid)
  to anon, authenticated, service_role;

revoke all on table public.archive_item_organizations
  from public, anon, authenticated;
grant select, insert, update, delete on table public.archive_item_organizations
  to authenticated, service_role;

drop policy if exists archive_item_organizations_select
  on public.archive_item_organizations;
create policy archive_item_organizations_select
  on public.archive_item_organizations
  for select
  to authenticated
  using (
    public.is_platform_admin()
    or public.can_administer_organization(organization_id)
  );

drop policy if exists archive_item_organizations_write
  on public.archive_item_organizations;
create policy archive_item_organizations_write
  on public.archive_item_organizations
  for all
  to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

drop policy if exists archive_select on public.archive_items;
create policy archive_select
  on public.archive_items
  for select
  to anon, authenticated
  using (public.can_view_archive_item(id));
