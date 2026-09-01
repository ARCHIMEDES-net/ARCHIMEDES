-- Křídla pro budoucnost: generalized restricted program library and
-- organization hierarchy for foundations and children's homes.

alter table public.organizations
  drop constraint if exists organizations_org_type_check;
alter table public.organizations
  drop constraint if exists organizations_type_allowed;

alter table public.organizations
  add constraint organizations_org_type_check
  check (
    org_type = any (array[
      'municipality'::text,
      'school'::text,
      'senior_club'::text,
      'association'::text,
      'partner'::text,
      'community_center'::text,
      'diaspora'::text,
      'obec'::text,
      'spolek'::text,
      'foundation'::text,
      'child_home'::text
    ])
  );

alter table public.organizations
  add constraint organizations_type_allowed
  check (
    org_type = any (array[
      'municipality'::text,
      'school'::text,
      'senior_club'::text,
      'association'::text,
      'partner'::text,
      'community_center'::text,
      'diaspora'::text,
      'obec'::text,
      'spolek'::text,
      'foundation'::text,
      'child_home'::text
    ])
  );

create table if not exists public.access_programs (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  is_listed boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint access_programs_slug_format
    check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create table if not exists public.access_program_organizations (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.access_programs(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  program_role text not null default 'participant',
  status text not null default 'active',
  created_at timestamptz not null default now(),
  constraint access_program_organizations_unique unique (program_id, organization_id),
  constraint access_program_organizations_role_allowed
    check (program_role in ('owner', 'participant')),
  constraint access_program_organizations_status_allowed
    check (status in ('active', 'inactive'))
);

create table if not exists public.access_program_resources (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.access_programs(id) on delete cascade,
  title text not null,
  description text,
  storage_path text not null unique,
  original_file_name text not null,
  mime_type text not null,
  file_size bigint not null,
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint access_program_resources_file_size_positive check (file_size > 0),
  constraint access_program_resources_storage_path_safe
    check (storage_path !~ '(^|/)\.\.(/|$)')
);

create index if not exists idx_access_program_organizations_organization
  on public.access_program_organizations (organization_id, program_id)
  where status = 'active';
create index if not exists idx_access_program_resources_program
  on public.access_program_resources (program_id, sort_order, created_at)
  where is_published = true;

create or replace function public.has_access_program(target_program_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    (select auth.uid()) is not null
    and (
      public.is_platform_admin()
      or exists (
        select 1
        from public.access_program_organizations program_organization
        join public.organization_members member
          on member.organization_id = program_organization.organization_id
        join public.organizations organization
          on organization.id = program_organization.organization_id
        where program_organization.program_id = target_program_id
          and program_organization.status = 'active'
          and member.user_id = (select auth.uid())
          and member.status = 'active'
          and organization.status = 'active'
      )
    );
$$;

create or replace function public.can_administer_access_program(target_program_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    (select auth.uid()) is not null
    and (
      public.is_platform_admin()
      or exists (
        select 1
        from public.access_program_organizations program_organization
        join public.organization_members member
          on member.organization_id = program_organization.organization_id
        join public.organizations organization
          on organization.id = program_organization.organization_id
        where program_organization.program_id = target_program_id
          and program_organization.program_role = 'owner'
          and program_organization.status = 'active'
          and member.user_id = (select auth.uid())
          and member.role_in_org = 'organization_admin'
          and member.status = 'active'
          and organization.status = 'active'
      )
    );
$$;

revoke all on function public.has_access_program(uuid) from public, anon;
revoke all on function public.can_administer_access_program(uuid) from public, anon;
grant execute on function public.has_access_program(uuid) to authenticated, service_role;
grant execute on function public.can_administer_access_program(uuid) to authenticated, service_role;

create or replace function public.get_access_program_organizations(target_program_id uuid)
returns table(
  organization_id uuid,
  organization_name text,
  organization_type text,
  contact_name text,
  contact_email text,
  program_role text,
  status text
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    organization.id,
    organization.name,
    organization.org_type,
    organization.contact_name,
    organization.contact_email,
    program_organization.program_role,
    program_organization.status
  from public.access_program_organizations program_organization
  join public.organizations organization
    on organization.id = program_organization.organization_id
  where program_organization.program_id = target_program_id
    and public.can_administer_access_program(target_program_id)
  order by program_organization.program_role, organization.name;
$$;

revoke all on function public.get_access_program_organizations(uuid) from public, anon;
grant execute on function public.get_access_program_organizations(uuid)
  to authenticated, service_role;

alter table public.access_programs enable row level security;
alter table public.access_program_organizations enable row level security;
alter table public.access_program_resources enable row level security;

create policy access_programs_select
  on public.access_programs for select
  to authenticated
  using (is_listed or public.is_platform_admin());

create policy access_programs_write
  on public.access_programs for all
  to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

create policy access_program_organizations_select
  on public.access_program_organizations for select
  to authenticated
  using (
    public.can_administer_access_program(program_id)
    or exists (
      select 1
      from public.organization_members member
      where member.organization_id = access_program_organizations.organization_id
        and member.user_id = (select auth.uid())
        and member.status = 'active'
    )
  );

create policy access_program_organizations_write
  on public.access_program_organizations for all
  to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

create policy access_program_resources_select
  on public.access_program_resources for select
  to authenticated
  using (
    is_published
    and public.has_access_program(program_id)
  );

create policy access_program_resources_write
  on public.access_program_resources for all
  to authenticated
  using (public.can_administer_access_program(program_id))
  with check (public.can_administer_access_program(program_id));

revoke all on table public.access_programs from anon;
revoke all on table public.access_program_organizations from anon;
revoke all on table public.access_program_resources from anon;
grant select on table public.access_programs to authenticated;
grant select on table public.access_program_organizations to authenticated;
grant select, insert, update, delete on table public.access_program_resources to authenticated;
grant all on table public.access_programs to service_role;
grant all on table public.access_program_organizations to service_role;
grant all on table public.access_program_resources to service_role;

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'program-materials',
  'program-materials',
  false,
  26214400,
  array[
    'application/pdf',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ]
)
on conflict (id) do update
set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy program_materials_select
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'program-materials'
    and exists (
      select 1
      from public.access_program_resources resource
      where resource.storage_path = storage.objects.name
        and resource.is_published
        and public.has_access_program(resource.program_id)
    )
  );

create policy program_materials_insert
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'program-materials'
    and exists (
      select 1
      from public.access_programs program
      where program.slug = (storage.foldername(name))[1]
        and public.can_administer_access_program(program.id)
    )
  );

create policy program_materials_update
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'program-materials'
    and exists (
      select 1
      from public.access_programs program
      where program.slug = (storage.foldername(name))[1]
        and public.can_administer_access_program(program.id)
    )
  )
  with check (
    bucket_id = 'program-materials'
    and exists (
      select 1
      from public.access_programs program
      where program.slug = (storage.foldername(name))[1]
        and public.can_administer_access_program(program.id)
    )
  );

create policy program_materials_delete
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'program-materials'
    and exists (
      select 1
      from public.access_programs program
      where program.slug = (storage.foldername(name))[1]
        and public.can_administer_access_program(program.id)
    )
  );

-- Foundation administrators inherit administration of direct child homes,
-- just as municipality administrators inherit administration of their schools.
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
        and direct_admin.user_id = auth.uid()
        and direct_admin.role_in_org = 'organization_admin'
        and direct_admin.status = 'active'
    )
    or exists (
      select 1
      from public.organizations target
      join public.organizations parent
        on parent.id = target.parent_organization_id
      join public.organization_members parent_admin
        on parent_admin.organization_id = parent.id
      where target.id = target_org_id
        and lower(parent.org_type) in ('municipality', 'obec', 'foundation')
        and parent_admin.user_id = auth.uid()
        and parent_admin.role_in_org = 'organization_admin'
        and parent_admin.status = 'active'
    );
$$;

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
    select member.organization_id, member.role_in_org, 1 as priority
    from public.organization_members member
    where member.user_id = auth.uid()
      and member.status = 'active'

    union all

    select child.id, 'organization_admin'::text, 2
    from public.organization_members parent_admin
    join public.organizations parent
      on parent.id = parent_admin.organization_id
    join public.organizations child
      on child.parent_organization_id = parent.id
    where parent_admin.user_id = auth.uid()
      and parent_admin.role_in_org = 'organization_admin'
      and parent_admin.status = 'active'
      and lower(parent.org_type) in ('municipality', 'obec', 'foundation')

    union all

    select organization.id, 'organization_admin'::text, 3
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
        and lower(parent.org_type) in ('municipality', 'obec', 'foundation')
        and parent.license_status = 'active'
        and (parent.license_valid_until is null or parent.license_valid_until >= now())
        then 'active'
      when child.license_status = 'suspended' or parent.license_status = 'suspended'
        then 'suspended'
      when child.license_status = 'pending_approval' or parent.license_status = 'pending_approval'
        then 'pending_approval'
      else 'inactive'
    end,
    case
      when child.license_status = 'active'
        and (child.license_valid_until is null or child.license_valid_until >= now())
        then child.license_valid_until
      when parent.status = 'active'
        and lower(parent.org_type) in ('municipality', 'obec', 'foundation')
        and parent.license_status = 'active'
        and (parent.license_valid_until is null or parent.license_valid_until >= now())
        then parent.license_valid_until
      else null
    end,
    case when deduplicated.role_in_org = 'organization_admin' or public.is_platform_admin()
      then child.join_code else null end,
    case when deduplicated.role_in_org = 'organization_admin' or public.is_platform_admin()
      then child.registration_number else null end,
    child.is_system,
    deduplicated.role_in_org
  from deduplicated
  join public.organizations child on child.id = deduplicated.organization_id
  left join public.organizations parent on parent.id = child.parent_organization_id
  where requested_ids is null or child.id = any(requested_ids);
$$;

-- Seed the verified memorandum participants. No users are invited here.
insert into public.organizations (
  name, org_type, status, join_code, license_status, ico, legal_identifier,
  registered_address, contact_name, contact_email, contact_phone,
  contract_status, billing_status, activated_at
)
select
  'Nadační fond Křídla pro Budoucnost',
  'foundation',
  'active',
  upper(substr(md5(gen_random_uuid()::text), 1, 10)),
  'active',
  '21999481',
  '21999481',
  'Soukenická 877/9, 702 00 Ostrava',
  'Naďa Zímová a Mgr. Marcela Dytková',
  'kontakt@nfkridla.cz',
  null,
  'accepted',
  'not_applicable',
  now()
where not exists (
  select 1 from public.organizations
  where legal_identifier = '21999481' or ico = '21999481'
);

with foundation as (
  select id from public.organizations
  where legal_identifier = '21999481' or ico = '21999481'
  order by created_at
  limit 1
), homes(name, ico, address, contact_name, contact_email, contact_phone) as (
  values
    ('Střední škola, Dětský domov a Školní jídelna Velké Heraltice, příspěvková organizace', '47813571', 'Opavská 1, 747 75 Velké Heraltice', 'Mgr. Marie Hoftová', 'marie.hoftova@ddheraltice.cz', '+420 777 760 128'),
    ('Dětský domov Loreta a Školní jídelna, Fulnek, příspěvková organizace', '62330268', 'Kapucínská 281, 742 45 Fulnek', 'Mgr. Renáta Malinová', 'malinova@ddfulnek.cz', '+420 734 412 508'),
    ('Dětský domov a Školní jídelna, Melč 4, příspěvková organizace', '47811927', 'Melč 4, 747 84 Melč', 'Bc. Anna Jíšová, DiS.', 'anna.jisova@dd-melc.cz', '+420 606 424 451')
)
insert into public.organizations (
  name, org_type, status, join_code, license_status, ico, legal_identifier,
  registered_address, contact_name, contact_email, contact_phone,
  contract_status, billing_status, activated_at, parent_organization_id
)
select
  homes.name,
  'child_home',
  'active',
  upper(substr(md5(gen_random_uuid()::text), 1, 10)),
  'active',
  homes.ico,
  homes.ico,
  homes.address,
  homes.contact_name,
  homes.contact_email,
  homes.contact_phone,
  'accepted',
  'not_applicable',
  now(),
  foundation.id
from homes cross join foundation
where not exists (
  select 1 from public.organizations existing
  where existing.legal_identifier = homes.ico or existing.ico = homes.ico
);

insert into public.access_programs (slug, title, description, is_listed)
values (
  'kridla-pro-budoucnost',
  'Křídla pro budoucnost – dětské domovy',
  'Společné vzdělávací materiály pro Nadační fond Křídla pro Budoucnost a zapojené dětské domovy.',
  true
)
on conflict (slug) do update
set title = excluded.title,
    description = excluded.description,
    is_listed = excluded.is_listed,
    updated_at = now();

with program as (
  select id from public.access_programs where slug = 'kridla-pro-budoucnost'
), linked_organizations as (
  select id as organization_id,
    case when org_type = 'foundation' then 'owner' else 'participant' end as program_role
  from public.organizations
  where legal_identifier in ('21999481', '47813571', '62330268', '47811927')
     or ico in ('21999481', '47813571', '62330268', '47811927')
)
insert into public.access_program_organizations (
  program_id, organization_id, program_role, status
)
select program.id, linked_organizations.organization_id,
       linked_organizations.program_role, 'active'
from program cross join linked_organizations
on conflict (program_id, organization_id) do update
set program_role = excluded.program_role,
    status = excluded.status;
