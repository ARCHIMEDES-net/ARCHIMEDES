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
                  o.license_status = 'active'
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

revoke all on function public.get_portal_archive_events() from public;
grant execute on function public.get_portal_archive_events() to authenticated, service_role;
