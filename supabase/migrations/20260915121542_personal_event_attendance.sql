-- Attendance belongs to a person; administrator browsing never represents a school.
alter table public.event_attendees alter column organization_id drop not null;
alter table public.event_attendees add column historical_organization_id uuid;
drop index public.event_attendees_active_event_organization_key;
-- Preserve original context and keep every historical row.
update public.event_attendees a
set historical_organization_id = a.organization_id, organization_id = null
where a.excluded_admin_context or exists (
  select 1 from public.platform_admins pa
  where pa.user_id = a.user_id and pa.role in ('admin', 'super_admin')
);
with ranked as (
  select id, row_number() over (partition by event_id, user_id order by created_at, id) as n
  from public.event_attendees
)
update public.event_attendees a set excluded_admin_context = (ranked.n > 1)
from ranked where ranked.id = a.id;
create unique index event_attendees_active_event_user_key
  on public.event_attendees(event_id, user_id) where not excluded_admin_context;
drop policy event_attendees_block_platform_admin_insert on public.event_attendees;
create policy event_attendees_personal_insert_guard
on public.event_attendees as restrictive for insert to authenticated
with check (
  user_id = auth.uid() and not excluded_admin_context and historical_organization_id is null
  and ((public.is_admin() and organization_id is null)
       or (not public.is_admin() and organization_id is not null))
);
-- Ordinary users keep the existing membership, publication and license checks.
create policy event_attendees_admin_personal_insert
on public.event_attendees for insert to authenticated
with check (
  public.is_admin() and user_id = auth.uid() and organization_id is null
  and exists (select 1 from public.profiles p where p.id = auth.uid() and coalesce(p.is_active, true))
  and exists (select 1 from public.events e where e.id = event_id and e.is_published)
);
drop policy event_attendees_select on public.event_attendees;
create policy event_attendees_select on public.event_attendees
for select to authenticated using (public.is_admin() or user_id = auth.uid());
comment on column public.event_attendees.excluded_admin_context is
  'Historical duplicate confirmation retained for audit; excluded from personal attendance counts.';
comment on column public.event_attendees.historical_organization_id is
  'Original administrator browsing context before conversion to personal attendance.';
