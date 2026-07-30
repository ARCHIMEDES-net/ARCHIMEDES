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
            lower(coalesce(o.license_status, '')) = 'active'
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
