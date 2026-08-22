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
    when p.must_set_password is true and p.profile_completed_at is null
      then 'password_and_profile'
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

  update public.profile_completion_reminder_attempts
  set status = case when status = 'sending' then 'delivery_unknown' else status end,
      resolution_action = 'confirmed_not_delivered_retry',
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

revoke all on function public.claim_profile_reminder_followup(uuid, uuid, text)
  from public, anon, authenticated;
grant execute on function public.claim_profile_reminder_followup(uuid, uuid, text)
  to service_role;

comment on function public.claim_profile_reminder_followup(uuid, uuid, text) is
  'Atomically records a human-confirmed non-delivery, rejects closed cases and records the profile requirement that the follow-up actually sends.';
