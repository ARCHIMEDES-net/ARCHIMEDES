-- Preserve mistaken administrator confirmations without counting them as school interest.
alter table public.event_attendees
  add column excluded_admin_context boolean not null default false;

update public.event_attendees a
set excluded_admin_context = true
where exists (
  select 1 from public.platform_admins pa
  where pa.user_id = a.user_id and pa.role in ('admin', 'super_admin')
);

-- An excluded historical row must not prevent a genuine member from registering.
alter table public.event_attendees
  drop constraint event_attendees_event_id_organization_id_key;
create unique index event_attendees_active_event_organization_key
  on public.event_attendees(event_id, organization_id)
  where not excluded_admin_context;

-- Restrictive policies are AND-ed with existing membership/license/publication checks.
create policy event_attendees_block_platform_admin_insert
on public.event_attendees as restrictive for insert to authenticated
with check (not public.is_admin() and not excluded_admin_context);

-- Also fixes counts and own-attendance checks in already-open older clients.
create policy event_attendees_hide_excluded
on public.event_attendees as restrictive for select to authenticated
using (not excluded_admin_context);

comment on column public.event_attendees.excluded_admin_context is
  'Historical confirmation made in platform-admin browsing context; retained for audit, excluded from attendance and does not reserve the organization.';
