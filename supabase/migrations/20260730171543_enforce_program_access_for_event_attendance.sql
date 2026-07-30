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
  and exists (
    select 1
    from public.events e
    where e.id = event_attendees.event_id
      and e.is_published = true
  )
);
