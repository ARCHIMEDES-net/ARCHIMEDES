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
          'approved_profile_reminder',
          'repaired_password_flag'
        )
        and length(btrim(resolution_reason)) between 20 and 1000
        and resolved_at is not null
        and resolved_by is not null
      )
    );

create or replace function public.repair_signed_in_profile_password_flag(
  p_source_attempt_id uuid,
  p_initiated_by uuid,
  p_reason text
)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  source_attempt public.profile_completion_reminder_attempts%rowtype;
begin
  if p_reason is null or length(btrim(p_reason)) not between 20 and 1000 then
    raise exception 'A specific repair reason of 20 to 1000 characters is required.';
  end if;
  if not exists (
    select 1 from public.platform_admins
    where user_id = p_initiated_by and role in ('admin', 'super_admin')
  ) then
    raise exception 'Only an active platform administrator may repair this flag.';
  end if;

  select * into source_attempt
  from public.profile_completion_reminder_attempts
  where id = p_source_attempt_id
  for update;

  if not found then
    raise exception 'Source reminder attempt was not found.';
  end if;
  if source_attempt.resolution_action is not null then
    raise exception 'The source reminder attempt has already been resolved.';
  end if;
  if source_attempt.status not in ('failed', 'delivery_unknown', 'sending') then
    raise exception 'Only failed or unresolved attempts may be repaired.';
  end if;
  if source_attempt.status = 'sending'
     and source_attempt.claimed_at > now() - interval '15 minutes' then
    raise exception 'The source attempt is still inside the sending safety window.';
  end if;
  if not exists (
    select 1
    from public.profiles profile
    join auth.users auth_user on auth_user.id = profile.id
    where profile.id = source_attempt.profile_id
      and profile.is_active is true
      and profile.must_set_password is true
      and auth_user.last_sign_in_at is not null
      and lower(btrim(coalesce(profile.email, ''))) =
          lower(btrim(source_attempt.recipient_email))
  ) then
    raise exception 'The profile is not a signed-in account with an inconsistent password flag.';
  end if;
  if not exists (
    select 1
    from public.organization_members membership
    join public.organizations organization on organization.id = membership.organization_id
    where membership.user_id = source_attempt.profile_id
      and membership.status = 'active'
      and organization.status = 'active'
      and coalesce(organization.is_test, false) is false
  ) then
    raise exception 'The profile is not linked to an active real organization.';
  end if;

  update public.profiles
  set must_set_password = false
  where id = source_attempt.profile_id
    and must_set_password is true;

  if not found then
    raise exception 'The password flag was already repaired.';
  end if;

  update public.profile_completion_reminder_attempts
  set status = case when status = 'sending' then 'delivery_unknown' else status end,
      resolution_action = 'repaired_password_flag',
      resolution_reason = btrim(p_reason),
      resolved_at = now(),
      resolved_by = p_initiated_by,
      updated_at = now()
  where id = p_source_attempt_id;

  return true;
end;
$$;

revoke all on function public.repair_signed_in_profile_password_flag(uuid, uuid, text)
  from public, anon, authenticated;
grant execute on function public.repair_signed_in_profile_password_flag(uuid, uuid, text)
  to service_role;

comment on function public.repair_signed_in_profile_password_flag(uuid, uuid, text) is
  'Atomically clears an inconsistent password-setup flag for a verified signed-in account and resolves the old reminder attempt without sending email.';
