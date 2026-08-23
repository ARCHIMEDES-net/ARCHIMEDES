create or replace function public.guard_ambiguous_profile_reminder_followup()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if new.previous_attempt_id is null then
    return new;
  end if;

  if not exists (
    select 1
    from public.profile_completion_reminder_attempts source_attempt
    where source_attempt.id = new.previous_attempt_id
      and source_attempt.profile_id = new.profile_id
      and lower(btrim(source_attempt.recipient_email)) =
          lower(btrim(new.recipient_email))
  ) then
    raise exception 'A follow-up must preserve the reviewed source profile and recipient.';
  end if;

  if not exists (
    select 1
    from public.profiles target_profile
    where target_profile.id = new.profile_id
      and target_profile.is_active is true
      and lower(btrim(coalesce(target_profile.email, ''))) =
          lower(btrim(new.recipient_email))
  ) then
    raise exception 'The active profile no longer matches the reviewed recipient.';
  end if;

  if exists (
    select 1
    from public.profiles target_profile
    join public.organization_members target_membership
      on target_membership.user_id = target_profile.id
     and target_membership.status = 'active'
    join public.organization_members peer_membership
      on peer_membership.organization_id = target_membership.organization_id
     and peer_membership.status = 'active'
     and peer_membership.user_id <> target_profile.id
    join public.organizations organization
      on organization.id = target_membership.organization_id
     and organization.status = 'active'
     and coalesce(organization.is_test, false) is false
    join public.profiles peer_profile
      on peer_profile.id = peer_membership.user_id
     and peer_profile.is_active is true
    where target_profile.id = new.profile_id
      and (
        lower(btrim(coalesce(peer_profile.email, ''))) =
          lower(btrim(coalesce(target_profile.email, '')))
        or (
          nullif(btrim(target_profile.full_name), '') is not null
          and lower(btrim(coalesce(peer_profile.full_name, ''))) =
              lower(btrim(target_profile.full_name))
        )
      )
  ) then
    raise exception 'The reviewed profile still has an ambiguous peer identity; no follow-up may be created.';
  end if;

  return new;
end;
$$;

revoke all on function public.guard_ambiguous_profile_reminder_followup()
  from public, anon, authenticated;

drop trigger if exists guard_ambiguous_profile_reminder_followup
  on public.profile_completion_reminder_attempts;
create trigger guard_ambiguous_profile_reminder_followup
before insert on public.profile_completion_reminder_attempts
for each row
when (new.previous_attempt_id is not null)
execute function public.guard_ambiguous_profile_reminder_followup();

comment on function public.guard_ambiguous_profile_reminder_followup() is
  'Fail-closed database guard: linked profile-reminder follow-ups preserve the reviewed target and cannot be created while an active peer in the same real organization has the same email or full name.';
