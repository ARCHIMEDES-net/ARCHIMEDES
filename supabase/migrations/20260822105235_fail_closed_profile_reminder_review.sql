alter table public.organizations
  add column if not exists profile_reminders_enabled boolean not null default false;

comment on column public.organizations.profile_reminders_enabled is
  'Fail-closed approval gate. Profile reminder emails may be sent only after an explicit platform-admin review enables this organization.';

create table if not exists public.profile_reminder_organization_settings_audit (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  enabled boolean not null,
  reason text not null check (length(btrim(reason)) between 20 and 1000),
  changed_by uuid not null references public.profiles(id) on delete restrict,
  changed_at timestamptz not null default now()
);

create index if not exists profile_reminder_org_settings_audit_org_idx
  on public.profile_reminder_organization_settings_audit (organization_id, changed_at desc);

alter table public.profile_reminder_organization_settings_audit enable row level security;
revoke all on table public.profile_reminder_organization_settings_audit
  from public, anon, authenticated;
grant select, insert on table public.profile_reminder_organization_settings_audit
  to service_role;
revoke update, delete, truncate, references, trigger
  on table public.profile_reminder_organization_settings_audit from service_role;

alter table public.profile_completion_reminder_attempts
  drop constraint if exists profile_completion_reminder_resolution_check;

alter table public.profile_completion_reminder_attempts
  add constraint profile_completion_reminder_resolution_check
    check (
      (resolution_action is null and resolution_reason is null and resolved_at is null and resolved_by is null)
      or (
        resolution_action in (
          'resolved_without_resend',
          'confirmed_not_delivered_retry',
          'approved_fresh_access',
          'approved_profile_reminder'
        )
        and length(btrim(resolution_reason)) between 20 and 1000
        and resolved_at is not null
        and resolved_by is not null
      )
    );

create or replace function public.set_profile_reminder_organization_enabled(
  p_organization_id uuid,
  p_enabled boolean,
  p_changed_by uuid,
  p_reason text
)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if p_reason is null or length(btrim(p_reason)) not between 20 and 1000 then
    raise exception 'A specific review reason of 20 to 1000 characters is required.';
  end if;
  if not exists (
    select 1 from public.platform_admins
    where user_id = p_changed_by and role in ('admin', 'super_admin')
  ) then
    raise exception 'Only an active platform administrator may change this setting.';
  end if;

  update public.organizations
  set profile_reminders_enabled = p_enabled
  where id = p_organization_id
    and status = 'active'
    and coalesce(is_test, false) is false;
  if not found then
    raise exception 'Only an active, non-test organization may be approved.';
  end if;

  insert into public.profile_reminder_organization_settings_audit (
    organization_id, enabled, reason, changed_by
  ) values (
    p_organization_id, p_enabled, btrim(p_reason), p_changed_by
  );
  return true;
end;
$$;

revoke all on function public.set_profile_reminder_organization_enabled(uuid, boolean, uuid, text)
  from public, anon, authenticated;
grant execute on function public.set_profile_reminder_organization_enabled(uuid, boolean, uuid, text)
  to service_role;

create or replace function public.claim_approved_profile_reminder_followup(
  p_source_attempt_id uuid,
  p_initiated_by uuid,
  p_reason text,
  p_action text
)
returns table (attempt_id uuid, claimed boolean)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  source_attempt public.profile_completion_reminder_attempts%rowtype;
  existing_attempt_id uuid;
  new_attempt_id uuid;
  current_reminder_reason text;
begin
  if p_reason is null or length(btrim(p_reason)) not between 20 and 1000 then
    raise exception 'A specific resolution reason of 20 to 1000 characters is required.';
  end if;
  if p_action not in ('approved_fresh_access', 'approved_profile_reminder') then
    raise exception 'Unsupported approved follow-up action.';
  end if;
  if not exists (
    select 1 from public.platform_admins
    where user_id = p_initiated_by and role in ('admin', 'super_admin')
  ) then
    raise exception 'Only an active platform administrator may authorise a follow-up.';
  end if;

  select * into source_attempt
  from public.profile_completion_reminder_attempts
  where id = p_source_attempt_id
  for update;
  if not found then
    raise exception 'Source reminder attempt was not found.';
  end if;

  select id into existing_attempt_id
  from public.profile_completion_reminder_attempts
  where previous_attempt_id = p_source_attempt_id;
  if existing_attempt_id is not null then
    return query select existing_attempt_id, false;
    return;
  end if;
  if source_attempt.resolution_action is not null then
    raise exception 'The source reminder attempt has already been resolved.';
  end if;
  if source_attempt.status not in ('failed', 'delivery_unknown', 'sending') then
    raise exception 'Only failed or unresolved attempts can be followed up.';
  end if;
  if source_attempt.status = 'sending'
     and source_attempt.claimed_at > now() - interval '15 minutes' then
    raise exception 'The source attempt is still inside the sending safety window.';
  end if;

  select case
    when p.must_set_password is true and p.profile_completed_at is null then 'password_and_profile'
    when p.must_set_password is true then 'password'
    when p.profile_completed_at is null then 'profile'
    else null
  end into current_reminder_reason
  from public.profiles p
  where p.id = source_attempt.profile_id
    and p.is_active is true
    and lower(btrim(coalesce(p.email, ''))) = lower(btrim(source_attempt.recipient_email));

  if current_reminder_reason is null then
    raise exception 'The profile no longer has a consistent reminder requirement.';
  end if;
  if p_action = 'approved_fresh_access'
     and current_reminder_reason not in ('password', 'password_and_profile') then
    raise exception 'Fresh access requires a current password setup requirement.';
  end if;
  if p_action = 'approved_profile_reminder'
     and current_reminder_reason <> 'profile' then
    raise exception 'Profile-only reminder requires a profile-only requirement.';
  end if;
  if not exists (
    select 1
    from public.organization_members membership
    join public.organizations organization on organization.id = membership.organization_id
    where membership.user_id = source_attempt.profile_id
      and membership.status = 'active'
      and organization.status = 'active'
      and coalesce(organization.is_test, false) is false
      and organization.profile_reminders_enabled is true
  ) then
    raise exception 'The organization has not been explicitly approved for profile reminders.';
  end if;

  update public.profile_completion_reminder_attempts
  set status = case when status = 'sending' then 'delivery_unknown' else status end,
      resolution_action = p_action,
      resolution_reason = btrim(p_reason),
      resolved_at = now(),
      resolved_by = p_initiated_by,
      updated_at = now()
  where id = p_source_attempt_id;

  insert into public.profile_completion_reminder_attempts (
    profile_id, reminder_step, reason, recipient_email, status,
    claimed_at, updated_at, previous_attempt_id
  ) values (
    source_attempt.profile_id, source_attempt.reminder_step, current_reminder_reason,
    source_attempt.recipient_email, 'sending', now(), now(), p_source_attempt_id
  ) returning id into new_attempt_id;

  return query select new_attempt_id, true;
end;
$$;

revoke all on function public.claim_approved_profile_reminder_followup(uuid, uuid, text, text)
  from public, anon, authenticated;
grant execute on function public.claim_approved_profile_reminder_followup(uuid, uuid, text, text)
  to service_role;

comment on function public.claim_approved_profile_reminder_followup(uuid, uuid, text, text) is
  'Atomically records the truthful, explicitly approved purpose and creates at most one linked follow-up after the organization is enabled.';

-- The legacy confirmed-non-delivery function remains available only for cases where
-- non-delivery is genuinely confirmed, but it now shares the fail-closed organization gate.
create or replace function public.claim_profile_reminder_followup(
  p_source_attempt_id uuid,
  p_initiated_by uuid,
  p_reason text
)
returns table (attempt_id uuid, claimed boolean)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  source_attempt public.profile_completion_reminder_attempts%rowtype;
  existing_attempt_id uuid;
  new_attempt_id uuid;
  current_reminder_reason text;
begin
  if p_reason is null or length(btrim(p_reason)) not between 20 and 1000 then
    raise exception 'A specific resolution reason of 20 to 1000 characters is required.';
  end if;
  if not exists (
    select 1 from public.platform_admins
    where user_id = p_initiated_by and role in ('admin', 'super_admin')
  ) then
    raise exception 'Only an active platform administrator may authorise a follow-up.';
  end if;
  select * into source_attempt
  from public.profile_completion_reminder_attempts
  where id = p_source_attempt_id
  for update;
  if not found then raise exception 'Source reminder attempt was not found.'; end if;
  select id into existing_attempt_id
  from public.profile_completion_reminder_attempts
  where previous_attempt_id = p_source_attempt_id;
  if existing_attempt_id is not null then
    return query select existing_attempt_id, false;
    return;
  end if;
  if source_attempt.resolution_action is not null then
    raise exception 'The source reminder attempt has already been resolved.';
  end if;
  if source_attempt.status not in ('failed', 'delivery_unknown', 'sending') then
    raise exception 'Only failed or unresolved attempts can be followed up.';
  end if;
  if source_attempt.status = 'sending'
     and source_attempt.claimed_at > now() - interval '15 minutes' then
    raise exception 'The source attempt is still inside the sending safety window.';
  end if;
  select case
    when p.must_set_password is true and p.profile_completed_at is null then 'password_and_profile'
    when p.must_set_password is true then 'password'
    when p.profile_completed_at is null then 'profile'
    else null
  end into current_reminder_reason
  from public.profiles p
  where p.id = source_attempt.profile_id
    and p.is_active is true
    and lower(btrim(coalesce(p.email, ''))) = lower(btrim(source_attempt.recipient_email));
  if current_reminder_reason is null then
    raise exception 'The profile no longer has a consistent reminder requirement.';
  end if;
  if not exists (
    select 1
    from public.organization_members membership
    join public.organizations organization on organization.id = membership.organization_id
    where membership.user_id = source_attempt.profile_id
      and membership.status = 'active'
      and organization.status = 'active'
      and coalesce(organization.is_test, false) is false
      and organization.profile_reminders_enabled is true
  ) then
    raise exception 'The organization has not been explicitly approved for profile reminders.';
  end if;
  update public.profile_completion_reminder_attempts
  set status = case when status = 'sending' then 'delivery_unknown' else status end,
      resolution_action = 'confirmed_not_delivered_retry',
      resolution_reason = btrim(p_reason), resolved_at = now(),
      resolved_by = p_initiated_by, updated_at = now()
  where id = p_source_attempt_id;
  insert into public.profile_completion_reminder_attempts (
    profile_id, reminder_step, reason, recipient_email, status,
    claimed_at, updated_at, previous_attempt_id
  ) values (
    source_attempt.profile_id, source_attempt.reminder_step, current_reminder_reason,
    source_attempt.recipient_email, 'sending', now(), now(), p_source_attempt_id
  ) returning id into new_attempt_id;
  return query select new_attempt_id, true;
end;
$$;

revoke all on function public.claim_profile_reminder_followup(uuid, uuid, text)
  from public, anon, authenticated;
grant execute on function public.claim_profile_reminder_followup(uuid, uuid, text)
  to service_role;
