-- Child organizations without an explicit paid/free license plan inherit only
-- the parent municipality's effective license. An explicit child license plan
-- remains independent, and standalone organizations keep their current rules.

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
      when (
          organization.parent_organization_id is null
          or organization.license_plan is not null
        )
        and organization.license_status = 'active'
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
      when (
          organization.parent_organization_id is null
          or organization.license_plan is not null
        )
        and organization.license_status = 'active'
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

revoke all on function public.get_my_organizations(uuid[])
  from public, anon;
grant execute on function public.get_my_organizations(uuid[])
  to authenticated, service_role;

drop policy if exists event_attendees_insert on public.event_attendees;

create policy event_attendees_insert
on public.event_attendees
for insert
to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.profiles p
    join public.organization_members om
      on om.user_id = p.id
     and om.organization_id = p.active_organization_id
     and om.status = 'active'
    join public.organizations o
      on o.id = om.organization_id
    where p.id = auth.uid()
      and coalesce(p.is_active, true) = true
      and event_attendees.organization_id = p.active_organization_id
      and o.status = 'active'
      and (
        (
          (o.parent_organization_id is null or o.license_plan is not null)
          and o.license_status = 'active'
          and (o.license_valid_until is null or o.license_valid_until >= now())
        )
        or exists (
          select 1
          from public.organizations parent
          where parent.id = o.parent_organization_id
            and lower(parent.org_type) in ('municipality', 'obec')
            and parent.status = 'active'
            and parent.license_status = 'active'
            and (parent.license_valid_until is null or parent.license_valid_until >= now())
        )
      )
  )
  and exists (
    select 1
    from public.events e
    where e.id = event_attendees.event_id
      and e.is_published = true
  )
);

create or replace function public.get_portal_broadcast_sessions(p_event_ids uuid[])
returns table(
  id uuid,
  event_id uuid,
  status text,
  viewer_url text,
  recording_url text,
  recording_status text,
  starts_at timestamptz,
  ended_at timestamptz,
  access_mode text,
  is_published boolean,
  moderator_name text,
  guest_1_name text,
  guest_2_name text,
  guest_3_name text,
  guest_4_name text,
  guest_5_name text,
  has_external_meeting boolean
)
language sql
stable
security definer
set search_path = ''
as $$
  with viewer_access as (
    select exists (
      select 1
      from public.platform_admins pa
      where pa.user_id = auth.uid()
    ) as is_platform_admin,
    exists (
      select 1
      from public.profiles p
      join public.organization_members om
        on om.user_id = p.id
       and om.organization_id = p.active_organization_id
       and lower(coalesce(om.status, '')) = 'active'
      join public.organizations o
        on o.id = p.active_organization_id
      left join public.organizations parent
        on parent.id = o.parent_organization_id
      where p.id = auth.uid()
        and coalesce(p.is_active, true) = true
        and lower(coalesce(o.status, '')) = 'active'
        and (
          (
            (o.parent_organization_id is null or o.license_plan is not null)
            and lower(coalesce(o.license_status, '')) = 'active'
            and (o.license_valid_until is null or o.license_valid_until >= now())
          )
          or (
            lower(coalesce(parent.org_type, '')) in ('municipality', 'obec')
            and lower(coalesce(parent.status, '')) = 'active'
            and lower(coalesce(parent.license_status, '')) = 'active'
            and (parent.license_valid_until is null or parent.license_valid_until >= now())
          )
        )
    ) as has_program_access
  )
  select
    session.id,
    session.event_id,
    session.status,
    case
      when session.external_meeting_id is null then session.viewer_url
      else null
    end as viewer_url,
    case
      when session.recording_status = 'published' then session.recording_url
      else null
    end as recording_url,
    session.recording_status,
    session.starts_at,
    session.ended_at,
    session.access_mode,
    session.is_published,
    session.moderator_name,
    session.guest_1_name,
    session.guest_2_name,
    session.guest_3_name,
    session.guest_4_name,
    session.guest_5_name,
    (session.external_meeting_id is not null) as has_external_meeting
  from public.broadcast_sessions as session
  join public.events as event on event.id = session.event_id
  cross join viewer_access access
  where auth.uid() is not null
    and (access.is_platform_admin or access.has_program_access)
    and session.event_id = any(coalesce(p_event_ids, array[]::uuid[]))
    and session.is_published = true
    and event.is_published = true;
$$;

revoke all on function public.get_portal_broadcast_sessions(uuid[]) from public, anon;
grant execute on function public.get_portal_broadcast_sessions(uuid[]) to authenticated, service_role;

create or replace function public.get_portal_archive_events()
returns table (
  id uuid,
  title text,
  starts_at timestamptz,
  category text,
  audience_groups text[],
  audience text,
  worksheet_url text,
  is_published boolean,
  poster_url text,
  stream_url text,
  recording_url text,
  recording_status text
)
language sql
stable
security definer
set search_path = ''
as $$
  with identity as (
    select
      auth.uid() as user_id,
      exists (
        select 1
        from public.platform_admins pa
        where pa.user_id = auth.uid()
      ) as is_platform_admin,
      p.active_organization_id,
      coalesce(p.is_active, true) as profile_active
    from public.profiles p
    where p.id = auth.uid()
  ), access as (
    select
      i.user_id,
      i.is_platform_admin,
      (
        i.is_platform_admin
        or (
          i.profile_active
          and i.active_organization_id is not null
          and exists (
            select 1
            from public.organization_members om
            join public.organizations o on o.id = om.organization_id
            where om.user_id = i.user_id
              and om.organization_id = i.active_organization_id
              and om.status = 'active'
              and o.status = 'active'
              and (
                (
                  (o.parent_organization_id is null or o.license_plan is not null)
                  and o.license_status = 'active'
                  and (o.license_valid_until is null or o.license_valid_until >= now())
                )
                or exists (
                  select 1
                  from public.organizations parent
                  where parent.id = o.parent_organization_id
                    and lower(parent.org_type) in ('municipality', 'obec')
                    and parent.status = 'active'
                    and parent.license_status = 'active'
                    and (parent.license_valid_until is null or parent.license_valid_until >= now())
                )
              )
          )
        )
      ) as allowed
    from identity i
  )
  select
    e.id,
    e.title,
    e.starts_at,
    e.category,
    e.audience_groups,
    e.audience,
    e.worksheet_url,
    e.is_published,
    e.poster_url,
    e.stream_url,
    case
      when bs.recording_status = 'published' then bs.recording_url
      else null
    end as recording_url,
    bs.recording_status
  from public.events e
  cross join access a
  left join lateral (
    select s.recording_url, s.recording_status
    from public.broadcast_sessions s
    where s.event_id = e.id
      and s.is_published = true
    order by s.created_at desc
    limit 1
  ) bs on true
  where a.allowed = true
    and e.is_published = true
    and e.starts_at < now()
  order by e.starts_at desc;
$$;

revoke all on function public.get_portal_archive_events() from public, anon;
grant execute on function public.get_portal_archive_events() to authenticated, service_role;

create or replace function public.has_active_licensed_membership()
returns boolean
language sql
stable
security definer
set search_path = ''
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
          (
            organization.parent_organization_id is null
            or organization.license_plan is not null
          )
          and organization.license_status = 'active'
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

revoke execute on function public.has_active_licensed_membership()
  from public, anon, authenticated;
grant execute on function public.has_active_licensed_membership()
  to authenticated, service_role;
