alter table public.profile_completion_reminder_attempts
  add column if not exists previous_attempt_id uuid,
  add column if not exists resolution_action text,
  add column if not exists resolution_reason text,
  add column if not exists resolved_at timestamptz,
  add column if not exists resolved_by uuid,
  add column if not exists client_delivery_status text not null default 'not_tracked',
  add column if not exists client_delivery_updated_at timestamptz,
  add column if not exists audit_copy_delivery_status text not null default 'not_tracked',
  add column if not exists audit_copy_delivery_updated_at timestamptz;

alter table public.profile_completion_reminder_attempts
  drop constraint if exists profile_completion_reminder_attemp_profile_id_reminder_step_key;

alter table public.profile_completion_reminder_attempts
  add constraint profile_completion_reminder_previous_attempt_fkey
    foreign key (previous_attempt_id)
    references public.profile_completion_reminder_attempts(id)
    on delete restrict,
  add constraint profile_completion_reminder_resolved_by_fkey
    foreign key (resolved_by)
    references public.profiles(id)
    on delete restrict,
  add constraint profile_completion_reminder_resolution_check
    check (
      (resolution_action is null and resolution_reason is null and resolved_at is null and resolved_by is null)
      or (
        resolution_action in ('resolved_without_resend', 'confirmed_not_delivered_retry')
        and length(btrim(resolution_reason)) between 20 and 1000
        and resolved_at is not null
        and resolved_by is not null
      )
    ),
  add constraint profile_completion_reminder_client_delivery_check
    check (client_delivery_status in (
      'not_tracked', 'accepted', 'delivered', 'delayed', 'bounced',
      'failed', 'suppressed', 'complained'
    )),
  add constraint profile_completion_reminder_audit_delivery_check
    check (audit_copy_delivery_status in (
      'not_tracked', 'accepted', 'delivered', 'delayed', 'bounced',
      'failed', 'suppressed', 'complained'
    ));

create unique index profile_completion_reminder_initial_unique_idx
  on public.profile_completion_reminder_attempts (profile_id, reminder_step)
  where previous_attempt_id is null;

create unique index profile_completion_reminder_followup_unique_idx
  on public.profile_completion_reminder_attempts (previous_attempt_id)
  where previous_attempt_id is not null;

comment on column public.profile_completion_reminder_attempts.previous_attempt_id is
  'Links an explicitly authorised follow-up to the immutable earlier attempt.';
comment on column public.profile_completion_reminder_attempts.client_delivery_status is
  'Latest verified Resend lifecycle state for the client message; delivered means accepted by the recipient mail server.';

create table public.registration_email_webhook_events (
  event_id text primary key,
  provider text not null default 'resend' check (provider = 'resend'),
  provider_message_id text not null check (length(provider_message_id) between 1 and 500),
  event_type text not null check (length(event_type) between 1 and 100),
  delivery_status text not null check (delivery_status in (
    'accepted', 'delivered', 'delayed', 'bounced',
    'failed', 'suppressed', 'complained'
  )),
  occurred_at timestamptz not null,
  received_at timestamptz not null default now()
);

create index registration_email_webhook_message_idx
  on public.registration_email_webhook_events (provider_message_id, occurred_at desc);

alter table public.registration_email_webhook_events enable row level security;
revoke all on table public.registration_email_webhook_events from public, anon, authenticated;
grant select, insert on table public.registration_email_webhook_events to service_role;
revoke update, delete, truncate, references, trigger
  on table public.registration_email_webhook_events from service_role;

create or replace function public.apply_registration_email_webhook_event()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  update public.profile_completion_reminder_attempts
  set client_delivery_status = new.delivery_status,
      client_delivery_updated_at = new.occurred_at,
      updated_at = now()
  where client_provider_message_id = new.provider_message_id
    and (client_delivery_updated_at is null or client_delivery_updated_at <= new.occurred_at);

  update public.profile_completion_reminder_attempts
  set audit_copy_delivery_status = new.delivery_status,
      audit_copy_delivery_updated_at = new.occurred_at,
      updated_at = now()
  where audit_copy_provider_message_id = new.provider_message_id
    and (audit_copy_delivery_updated_at is null or audit_copy_delivery_updated_at <= new.occurred_at);

  return new;
end;
$$;

revoke all on function public.apply_registration_email_webhook_event() from public, anon, authenticated;

create trigger registration_email_webhook_event_apply
after insert on public.registration_email_webhook_events
for each row execute function public.apply_registration_email_webhook_event();

create or replace function public.reconcile_profile_reminder_webhook_events()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  client_event public.registration_email_webhook_events%rowtype;
  audit_event public.registration_email_webhook_events%rowtype;
begin
  if new.client_provider_message_id is not null then
    select * into client_event
    from public.registration_email_webhook_events
    where provider_message_id = new.client_provider_message_id
    order by occurred_at desc, received_at desc
    limit 1;
    if found then
      new.client_delivery_status := client_event.delivery_status;
      new.client_delivery_updated_at := client_event.occurred_at;
    end if;
  end if;

  if new.audit_copy_provider_message_id is not null then
    select * into audit_event
    from public.registration_email_webhook_events
    where provider_message_id = new.audit_copy_provider_message_id
    order by occurred_at desc, received_at desc
    limit 1;
    if found then
      new.audit_copy_delivery_status := audit_event.delivery_status;
      new.audit_copy_delivery_updated_at := audit_event.occurred_at;
    end if;
  end if;
  return new;
end;
$$;

revoke all on function public.reconcile_profile_reminder_webhook_events()
  from public, anon, authenticated;

create trigger profile_reminder_webhook_reconcile
before insert or update of client_provider_message_id, audit_copy_provider_message_id
on public.profile_completion_reminder_attempts
for each row execute function public.reconcile_profile_reminder_webhook_events();

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
  'Atomically records a human-confirmed non-delivery and creates at most one linked follow-up. Returning claimed=false prevents delayed duplicate sends.';

create or replace function public.resolve_profile_reminder_without_resend(
  p_source_attempt_id uuid,
  p_initiated_by uuid,
  p_reason text
)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if p_reason is null or length(btrim(p_reason)) not between 20 and 1000 then
    raise exception 'A specific resolution reason of 20 to 1000 characters is required.';
  end if;
  if not exists (
    select 1 from public.platform_admins
    where user_id = p_initiated_by and role in ('admin', 'super_admin')
  ) then
    raise exception 'Only an active platform administrator may resolve an attempt.';
  end if;

  update public.profile_completion_reminder_attempts
  set status = case when status = 'sending' then 'delivery_unknown' else status end,
      resolution_action = 'resolved_without_resend',
      resolution_reason = btrim(p_reason),
      resolved_at = now(),
      resolved_by = p_initiated_by,
      updated_at = now()
  where id = p_source_attempt_id
    and status in ('failed', 'delivery_unknown', 'sending')
    and resolution_action is null
    and (status <> 'sending' or claimed_at <= now() - interval '15 minutes');

  return found;
end;
$$;

revoke all on function public.resolve_profile_reminder_without_resend(uuid, uuid, text)
  from public, anon, authenticated;
grant execute on function public.resolve_profile_reminder_without_resend(uuid, uuid, text)
  to service_role;
