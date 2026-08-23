create table public.profile_identity_corrections_audit (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete restrict,
  source_attempt_id uuid not null unique
    references public.profile_completion_reminder_attempts(id) on delete restrict,
  previous_full_name text not null,
  corrected_full_name text not null,
  reason text not null check (length(btrim(reason)) between 20 and 1000),
  changed_by uuid not null references public.profiles(id) on delete restrict,
  changed_at timestamptz not null default now(),
  check (length(btrim(previous_full_name)) between 2 and 120),
  check (length(btrim(corrected_full_name)) between 2 and 120),
  check (lower(btrim(previous_full_name)) <> lower(btrim(corrected_full_name)))
);

create index profile_identity_corrections_profile_idx
  on public.profile_identity_corrections_audit (profile_id, changed_at desc);

alter table public.profile_identity_corrections_audit enable row level security;
revoke all on table public.profile_identity_corrections_audit
  from public, anon, authenticated;
grant select, insert on table public.profile_identity_corrections_audit
  to service_role;
revoke update, delete, truncate, references, trigger
  on table public.profile_identity_corrections_audit from service_role;

create or replace function public.repair_profile_full_name(
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
    raise exception 'A specific identity repair reason of 20 to 1000 characters is required.';
  end if;
  if corrected_name is null or length(corrected_name) not between 2 and 120 then
    raise exception 'The corrected full name must contain 2 to 120 characters.';
  end if;
  if not exists (
    select 1 from public.platform_admins
    where user_id = p_initiated_by and role in ('admin', 'super_admin')
  ) then
    raise exception 'Only an active platform administrator may repair profile identity data.';
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

  select * into target_profile
  from public.profiles
  where id = source_attempt.profile_id
  for update;
  if not found
     or target_profile.is_active is not true
     or lower(btrim(coalesce(target_profile.email, ''))) <>
        lower(btrim(source_attempt.recipient_email)) then
    raise exception 'The active profile no longer matches the reviewed recipient.';
  end if;
  if target_profile.full_name is null
     or length(btrim(target_profile.full_name)) not between 2 and 120
     or lower(btrim(target_profile.full_name)) = lower(corrected_name) then
    raise exception 'The profile name is missing or already matches the corrected value.';
  end if;
  if not exists (
    select 1 from auth.users auth_user
    where auth_user.id = target_profile.id
      and auth_user.last_sign_in_at is not null
  ) then
    raise exception 'Only a verified signed-in account may use this identity repair.';
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
    join public.profiles peer_profile on peer_profile.id = peer_membership.user_id
    where target_membership.user_id = target_profile.id
      and target_membership.status = 'active'
      and organization.status = 'active'
      and coalesce(organization.is_test, false) is false
      and lower(btrim(coalesce(peer_profile.full_name, ''))) =
          lower(btrim(target_profile.full_name))
  ) then
    raise exception 'The current name is not duplicated by a peer in an active real organization.';
  end if;
  if exists (
    select 1
    from public.organization_members target_membership
    join public.organization_members peer_membership
      on peer_membership.organization_id = target_membership.organization_id
     and peer_membership.status = 'active'
     and peer_membership.user_id <> target_profile.id
    join public.profiles peer_profile on peer_profile.id = peer_membership.user_id
    where target_membership.user_id = target_profile.id
      and target_membership.status = 'active'
      and lower(btrim(coalesce(peer_profile.full_name, ''))) = lower(corrected_name)
  ) then
    raise exception 'The corrected name would create another duplicate identity.';
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
    raise exception 'The Auth identity disappeared during repair.';
  end if;

  insert into public.profile_identity_corrections_audit (
    profile_id, source_attempt_id, previous_full_name,
    corrected_full_name, reason, changed_by
  ) values (
    target_profile.id, source_attempt.id, btrim(target_profile.full_name),
    corrected_name, btrim(p_reason), p_initiated_by
  );

  return true;
end;
$$;

revoke all on function public.repair_profile_full_name(uuid, uuid, text, text)
  from public, anon, authenticated;
grant execute on function public.repair_profile_full_name(uuid, uuid, text, text)
  to service_role;

comment on function public.repair_profile_full_name(uuid, uuid, text, text) is
  'Atomically repairs a reviewed duplicate profile name in both profile and Auth metadata, records an immutable audit row, and sends no email.';
