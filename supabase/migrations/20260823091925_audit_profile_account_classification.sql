create table public.profile_reminder_account_policies (
  profile_id uuid primary key references public.profiles(id) on delete restrict,
  policy_kind text not null check (policy_kind in ('shared_classroom', 'secondary_no_email')),
  primary_profile_id uuid references public.profiles(id) on delete restrict,
  source_attempt_id uuid not null unique
    references public.profile_completion_reminder_attempts(id) on delete restrict,
  reason text not null check (length(btrim(reason)) between 20 and 1000),
  set_by uuid not null references public.profiles(id) on delete restrict,
  set_at timestamptz not null default now(),
  check (
    (policy_kind = 'shared_classroom' and primary_profile_id is null)
    or
    (policy_kind = 'secondary_no_email' and primary_profile_id is not null and primary_profile_id <> profile_id)
  )
);

create index profile_reminder_account_policies_primary_idx
  on public.profile_reminder_account_policies (primary_profile_id)
  where primary_profile_id is not null;

create index profile_reminder_account_policies_set_by_idx
  on public.profile_reminder_account_policies (set_by);

alter table public.profile_reminder_account_policies enable row level security;
revoke all on table public.profile_reminder_account_policies
  from public, anon, authenticated;
grant select, insert on table public.profile_reminder_account_policies
  to service_role;
revoke update, delete, truncate, references, trigger
  on table public.profile_reminder_account_policies from service_role;

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
          'repaired_password_flag',
          'secondary_account_no_email'
        )
        and length(btrim(resolution_reason)) between 20 and 1000
        and resolved_at is not null
        and resolved_by is not null
      )
    );

create or replace function public.classify_shared_classroom_profile(
  p_source_attempt_id uuid,
  p_initiated_by uuid,
  p_corrected_full_name text,
  p_reason text
)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  source_attempt public.profile_completion_reminder_attempts%rowtype;
  target_profile public.profiles%rowtype;
  corrected_name text := btrim(p_corrected_full_name);
begin
  if p_reason is null or length(btrim(p_reason)) not between 20 and 1000 then
    raise exception 'A specific classification reason of 20 to 1000 characters is required.';
  end if;
  if corrected_name is null or length(corrected_name) not between 2 and 120 then
    raise exception 'The verified classroom display name must contain 2 to 120 characters.';
  end if;
  if not exists (
    select 1 from public.platform_admins
    where user_id = p_initiated_by and role in ('admin', 'super_admin')
  ) then
    raise exception 'Only an active platform administrator may classify a shared classroom account.';
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
    raise exception 'Only failed or unresolved attempts may be classified.';
  end if;
  if source_attempt.status = 'sending'
     and source_attempt.claimed_at > now() - interval '15 minutes' then
    raise exception 'The source attempt is still inside the sending safety window.';
  end if;
  if exists (
    select 1 from public.profile_completion_reminder_attempts followup
    where followup.previous_attempt_id = source_attempt.id
  ) then
    raise exception 'A linked follow-up already exists for the source attempt.';
  end if;

  select * into target_profile
  from public.profiles
  where id = source_attempt.profile_id
  for update;
  if not found
     or target_profile.is_active is not true
     or target_profile.must_set_password is not true
     or lower(btrim(coalesce(target_profile.email, ''))) <>
        lower(btrim(source_attempt.recipient_email)) then
    raise exception 'The active profile is not an unused password-setup account for the reviewed recipient.';
  end if;
  if exists (
    select 1 from auth.users auth_user
    where auth_user.id = target_profile.id
      and auth_user.last_sign_in_at is not null
  ) then
    raise exception 'A shared classroom classification is limited to an account that has never signed in.';
  end if;
  if exists (
    select 1 from public.profile_reminder_account_policies policy
    where policy.profile_id = target_profile.id
  ) then
    raise exception 'The account already has an audited reminder policy.';
  end if;
  if lower(btrim(coalesce(target_profile.full_name, ''))) = lower(corrected_name) then
    raise exception 'The classroom display name already matches the verified value.';
  end if;
  if not exists (
    select 1
    from public.organization_members target_membership
    join public.organizations organization
      on organization.id = target_membership.organization_id
    join public.organization_members peer_membership
      on peer_membership.organization_id = target_membership.organization_id
     and peer_membership.status = 'active'
     and peer_membership.user_id <> target_profile.id
    join public.profiles peer_profile
      on peer_profile.id = peer_membership.user_id
     and peer_profile.is_active is true
    where target_membership.user_id = target_profile.id
      and target_membership.status = 'active'
      and organization.status = 'active'
      and coalesce(organization.is_test, false) is false
      and lower(btrim(coalesce(peer_profile.full_name, ''))) =
          lower(btrim(coalesce(target_profile.full_name, '')))
  ) then
    raise exception 'The current classroom identity is not duplicated by an active peer in a real organization.';
  end if;
  if exists (
    select 1
    from public.organization_members target_membership
    join public.organization_members peer_membership
      on peer_membership.organization_id = target_membership.organization_id
     and peer_membership.status = 'active'
     and peer_membership.user_id <> target_profile.id
    join public.profiles peer_profile
      on peer_profile.id = peer_membership.user_id
     and peer_profile.is_active is true
    where target_membership.user_id = target_profile.id
      and target_membership.status = 'active'
      and lower(btrim(coalesce(peer_profile.full_name, ''))) = lower(corrected_name)
  ) then
    raise exception 'The classroom display name would create another duplicate identity.';
  end if;

  update public.profiles
  set full_name = corrected_name
  where id = target_profile.id;

  update auth.users
  set raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb)
        || jsonb_build_object('full_name', corrected_name),
      updated_at = now()
  where id = target_profile.id;
  if not found then
    raise exception 'The Auth identity disappeared during classroom classification.';
  end if;

  insert into public.profile_identity_corrections_audit (
    profile_id, source_attempt_id, previous_full_name,
    corrected_full_name, reason, changed_by
  ) values (
    target_profile.id, source_attempt.id, btrim(target_profile.full_name),
    corrected_name, btrim(p_reason), p_initiated_by
  );

  insert into public.profile_reminder_account_policies (
    profile_id, policy_kind, source_attempt_id, reason, set_by
  ) values (
    target_profile.id, 'shared_classroom', source_attempt.id,
    btrim(p_reason), p_initiated_by
  );

  return true;
end;
$$;

revoke all on function public.classify_shared_classroom_profile(uuid, uuid, text, text)
  from public, anon, authenticated;
grant execute on function public.classify_shared_classroom_profile(uuid, uuid, text, text)
  to service_role;

create or replace function public.mark_secondary_profile_no_email(
  p_source_attempt_id uuid,
  p_primary_profile_id uuid,
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
  secondary_profile public.profiles%rowtype;
  primary_profile public.profiles%rowtype;
begin
  if p_reason is null or length(btrim(p_reason)) not between 20 and 1000 then
    raise exception 'A specific account decision reason of 20 to 1000 characters is required.';
  end if;
  if not exists (
    select 1 from public.platform_admins
    where user_id = p_initiated_by and role in ('admin', 'super_admin')
  ) then
    raise exception 'Only an active platform administrator may mark a secondary account.';
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
    raise exception 'Only failed or unresolved attempts may be resolved.';
  end if;
  if source_attempt.status = 'sending'
     and source_attempt.claimed_at > now() - interval '15 minutes' then
    raise exception 'The source attempt is still inside the sending safety window.';
  end if;
  if exists (
    select 1 from public.profile_completion_reminder_attempts followup
    where followup.previous_attempt_id = source_attempt.id
  ) then
    raise exception 'A linked follow-up already exists for the source attempt.';
  end if;

  select * into secondary_profile
  from public.profiles
  where id = source_attempt.profile_id
  for update;
  select * into primary_profile
  from public.profiles
  where id = p_primary_profile_id
  for update;
  if secondary_profile.id is null
     or primary_profile.id is null
     or secondary_profile.id = primary_profile.id
     or secondary_profile.is_active is not true
     or primary_profile.is_active is not true
     or secondary_profile.must_set_password is true
     or secondary_profile.profile_completed_at is not null
     or lower(btrim(coalesce(secondary_profile.email, ''))) <>
        lower(btrim(source_attempt.recipient_email))
     or lower(btrim(coalesce(secondary_profile.email, ''))) =
        lower(btrim(coalesce(primary_profile.email, '')))
     or nullif(btrim(secondary_profile.full_name), '') is null
     or lower(btrim(secondary_profile.full_name)) <>
        lower(btrim(coalesce(primary_profile.full_name, ''))) then
    raise exception 'The reviewed accounts do not form a valid same-person primary/secondary pair.';
  end if;
  if not exists (
    select 1 from auth.users secondary_auth
    where secondary_auth.id = secondary_profile.id
      and secondary_auth.last_sign_in_at is not null
  ) or not exists (
    select 1 from auth.users primary_auth
    where primary_auth.id = primary_profile.id
      and primary_auth.last_sign_in_at is not null
  ) then
    raise exception 'Both accounts must have a verified previous sign-in.';
  end if;
  if exists (
    select 1 from public.profile_reminder_account_policies policy
    where policy.profile_id in (secondary_profile.id, primary_profile.id)
  ) then
    raise exception 'One of the accounts already has an audited reminder policy.';
  end if;
  if not exists (
    select 1
    from public.organization_members secondary_membership
    join public.organization_members primary_membership
      on primary_membership.organization_id = secondary_membership.organization_id
     and primary_membership.user_id = primary_profile.id
     and primary_membership.status = 'active'
    join public.organizations organization
      on organization.id = secondary_membership.organization_id
    where secondary_membership.user_id = secondary_profile.id
      and secondary_membership.status = 'active'
      and organization.status = 'active'
      and coalesce(organization.is_test, false) is false
  ) then
    raise exception 'The accounts do not share an active real organization.';
  end if;

  insert into public.profile_reminder_account_policies (
    profile_id, policy_kind, primary_profile_id,
    source_attempt_id, reason, set_by
  ) values (
    secondary_profile.id, 'secondary_no_email', primary_profile.id,
    source_attempt.id, btrim(p_reason), p_initiated_by
  );

  update public.profile_completion_reminder_attempts
  set status = case when status = 'sending' then 'delivery_unknown' else status end,
      resolution_action = 'secondary_account_no_email',
      resolution_reason = btrim(p_reason),
      resolved_at = now(),
      resolved_by = p_initiated_by,
      updated_at = now()
  where id = source_attempt.id;

  return true;
end;
$$;

revoke all on function public.mark_secondary_profile_no_email(uuid, uuid, uuid, text)
  from public, anon, authenticated;
grant execute on function public.mark_secondary_profile_no_email(uuid, uuid, uuid, text)
  to service_role;

comment on table public.profile_reminder_account_policies is
  'Immutable, server-only classification that suppresses automatic personal reminders for reviewed shared or secondary accounts.';
comment on function public.classify_shared_classroom_profile(uuid, uuid, text, text) is
  'Atomically assigns a verified functional display name and shared-classroom policy without resolving the source attempt or sending email.';
comment on function public.mark_secondary_profile_no_email(uuid, uuid, uuid, text) is
  'Atomically links a verified secondary account to its primary profile, resolves its old attempt without email, and suppresses future reminders.';

create or replace function public.guard_ambiguous_profile_reminder_followup()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if exists (
    select 1 from public.profile_reminder_account_policies policy
    where policy.profile_id = new.profile_id
      and policy.policy_kind = 'secondary_no_email'
  ) then
    raise exception 'The reviewed secondary account is permanently excluded from reminder email.';
  end if;

  if exists (
    select 1 from public.profile_reminder_account_policies policy
    where policy.profile_id = new.profile_id
      and policy.policy_kind = 'shared_classroom'
  ) and (
    new.previous_attempt_id is null
    or new.reason not in ('password', 'password_and_profile')
    or not exists (
      select 1
      from public.profile_completion_reminder_attempts source_attempt
      where source_attempt.id = new.previous_attempt_id
        and source_attempt.profile_id = new.profile_id
        and source_attempt.resolution_action = 'approved_fresh_access'
    )
  ) then
    raise exception 'A shared classroom account allows only one explicitly approved fresh-access email.';
  end if;

  if new.previous_attempt_id is not null and not exists (
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
      and not exists (
        select 1
        from public.profile_reminder_account_policies peer_policy
        where peer_policy.profile_id = peer_profile.id
          and peer_policy.policy_kind = 'secondary_no_email'
          and peer_policy.primary_profile_id = target_profile.id
      )
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
    raise exception 'The reviewed profile still has an ambiguous peer identity; no reminder email attempt may be created.';
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
execute function public.guard_ambiguous_profile_reminder_followup();
