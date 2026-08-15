-- Preview integration trigger for PR #176; no runtime effect.
-- Atomically create in-app notifications and future channel deliveries.
-- The RPC is server-only and does not send anything to an external provider.

alter table public.broadcast_sessions
  add column if not exists notification_delivery_policy text not null default 'in_app_only';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'broadcast_sessions_notification_delivery_policy_valid'
      and conrelid = 'public.broadcast_sessions'::regclass
  ) then
    alter table public.broadcast_sessions
      add constraint broadcast_sessions_notification_delivery_policy_valid
      check (
        notification_delivery_policy in ('in_app_only', 'in_app_and_push', 'archimedes_all')
      );
  end if;
end
$$;

comment on column public.broadcast_sessions.notification_delivery_policy is
  'Fail-closed channel ownership. in_app_only avoids duplicate WebMeeting e-mails by default.';

create index if not exists broadcast_sessions_notification_generation_idx
  on public.broadcast_sessions(starts_at, event_id)
  where notifications_enabled = true and is_published = true;
create index if not exists notification_preferences_activity_code_idx
  on public.notification_preferences(activity_code, profile_id);
create index if not exists user_interests_interest_slug_idx
  on public.user_interests(interest_slug, user_id);

create or replace function public.enqueue_notification_candidates(p_candidates jsonb)
returns table(notifications_inserted integer, deliveries_inserted integer)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_notifications_inserted integer := 0;
  v_deliveries_inserted integer := 0;
begin
  if jsonb_typeof(coalesce(p_candidates, '[]'::jsonb)) <> 'array' then
    raise exception 'p_candidates must be a JSON array';
  end if;

  if jsonb_array_length(coalesce(p_candidates, '[]'::jsonb)) > 2000 then
    raise exception 'p_candidates exceeds the limit of 2000 rows';
  end if;

  with candidates as (
    select *
    from jsonb_to_recordset(coalesce(p_candidates, '[]'::jsonb)) as candidate(
      profile_id uuid,
      event_id uuid,
      kind text,
      title text,
      body text,
      target_path text,
      available_at timestamptz,
      dedupe_key text,
      email_enabled boolean,
      push_enabled boolean
    )
  )
  insert into public.user_notifications (
    profile_id,
    event_id,
    kind,
    title,
    body,
    target_path,
    available_at,
    dedupe_key
  )
  select
    profile_id,
    event_id,
    kind,
    title,
    coalesce(body, ''),
    target_path,
    coalesce(available_at, now()),
    dedupe_key
  from candidates
  on conflict (dedupe_key) do nothing;

  get diagnostics v_notifications_inserted = row_count;

  with candidates as (
    select *
    from jsonb_to_recordset(coalesce(p_candidates, '[]'::jsonb)) as candidate(
      profile_id uuid,
      event_id uuid,
      kind text,
      title text,
      body text,
      target_path text,
      available_at timestamptz,
      dedupe_key text,
      email_enabled boolean,
      push_enabled boolean
    )
  ), requested_deliveries as (
    select
      notification.id as notification_id,
      candidate.event_id,
      candidate.profile_id,
      channel.name as channel,
      coalesce(candidate.available_at, now()) as scheduled_for,
      candidate.dedupe_key || ':' || channel.name as dedupe_key
    from candidates candidate
    join public.user_notifications notification
      on notification.dedupe_key = candidate.dedupe_key
     and notification.profile_id = candidate.profile_id
    cross join lateral (
      values
        ('email'::text, coalesce(candidate.email_enabled, false)),
        ('push'::text, coalesce(candidate.push_enabled, false))
    ) as channel(name, enabled)
    where channel.enabled
  )
  insert into public.notification_deliveries (
    notification_id,
    event_id,
    profile_id,
    channel,
    status,
    scheduled_for,
    dedupe_key
  )
  select
    notification_id,
    event_id,
    profile_id,
    channel,
    'queued',
    scheduled_for,
    dedupe_key
  from requested_deliveries
  on conflict (dedupe_key) do nothing;

  get diagnostics v_deliveries_inserted = row_count;

  return query select v_notifications_inserted, v_deliveries_inserted;
end;
$$;

revoke all on function public.enqueue_notification_candidates(jsonb)
  from public, anon, authenticated, service_role;
grant execute on function public.enqueue_notification_candidates(jsonb)
  to service_role;

comment on function public.enqueue_notification_candidates(jsonb) is
  'Server-only idempotent queue preparation. Creates no external side effects.';
