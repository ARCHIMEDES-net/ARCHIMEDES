-- ARCHIMEDES Live notification foundation.
--
-- This migration intentionally does not schedule or send any notification.
-- It only stores user choices, explicit event reminders, browser push
-- subscriptions, in-app notifications and an auditable delivery queue.

alter table public.broadcast_sessions
  add column if not exists recipient_group_codes text[] not null default '{}'::text[],
  add column if not exists recipient_groups_configured boolean not null default false,
  add column if not exists notifications_enabled boolean not null default false,
  add column if not exists reminder_minutes integer[] not null default '{1440,30}'::integer[];

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'broadcast_sessions_recipient_group_codes_limit'
      and conrelid = 'public.broadcast_sessions'::regclass
  ) then
    alter table public.broadcast_sessions
      add constraint broadcast_sessions_recipient_group_codes_limit
      check (
        cardinality(recipient_group_codes) <= 50
        and array_position(recipient_group_codes, null) is null
        and length(array_to_string(recipient_group_codes, '')) <= 5000
      );
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'broadcast_sessions_reminder_minutes_valid'
      and conrelid = 'public.broadcast_sessions'::regclass
  ) then
    alter table public.broadcast_sessions
      add constraint broadcast_sessions_reminder_minutes_valid
      check (
        cardinality(reminder_minutes) <= 8
        and array_position(reminder_minutes, null) is null
        and 0 < all(reminder_minutes)
        and 10080 >= all(reminder_minutes)
      );
  end if;
end
$$;

comment on column public.broadcast_sessions.recipient_group_codes is
  'Persisted interest-group codes selected for invitations and future reminders.';
comment on column public.broadcast_sessions.recipient_groups_configured is
  'Distinguishes a deliberate selection, including an empty one, from legacy sessions that need a suggestion.';
comment on column public.broadcast_sessions.notifications_enabled is
  'Fail-closed switch. Automated notification creation remains disabled until explicitly enabled.';
comment on column public.broadcast_sessions.reminder_minutes is
  'Reminder offsets before starts_at, in minutes. No delivery is performed by this migration.';

create table if not exists public.notification_channel_preferences (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  email_enabled boolean not null default true,
  push_enabled boolean not null default false,
  new_event_enabled boolean not null default true,
  day_before_enabled boolean not null default true,
  thirty_minutes_before_enabled boolean not null default true,
  schedule_changes_enabled boolean not null default true,
  recording_available_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.event_reminder_subscriptions (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (event_id, profile_id)
);

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  endpoint text not null,
  p256dh_key text not null,
  auth_key text not null,
  expiration_time timestamptz,
  user_agent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (endpoint),
  constraint push_subscriptions_endpoint_valid check (
    endpoint like 'https://%'
    and length(endpoint) <= 4096
  ),
  constraint push_subscriptions_keys_valid check (
    length(p256dh_key) between 1 and 1024
    and length(auth_key) between 1 and 1024
  ),
  constraint push_subscriptions_user_agent_valid check (
    user_agent is null or length(user_agent) <= 1000
  )
);

create table if not exists public.user_notifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  event_id uuid references public.events(id) on delete cascade,
  kind text not null,
  title text not null,
  body text not null default '',
  target_path text,
  available_at timestamptz not null default now(),
  read_at timestamptz,
  dedupe_key text not null,
  created_at timestamptz not null default now(),
  unique (dedupe_key),
  constraint user_notifications_kind_valid check (
    kind in (
      'new_event',
      'event_reminder',
      'schedule_changed',
      'event_cancelled',
      'recording_available',
      'system'
    )
  ),
  constraint user_notifications_target_path_safe check (
    target_path is null
    or (target_path like '/%' and target_path not like '//%')
  ),
  constraint user_notifications_content_bounded check (
    length(title) between 1 and 240
    and length(body) <= 4000
    and length(dedupe_key) between 1 and 500
  )
);

create table if not exists public.notification_deliveries (
  id uuid primary key default gen_random_uuid(),
  notification_id uuid references public.user_notifications(id) on delete cascade,
  event_id uuid references public.events(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete cascade,
  recipient_email text,
  channel text not null,
  status text not null default 'queued',
  scheduled_for timestamptz not null,
  attempt_count integer not null default 0,
  last_attempt_at timestamptz,
  sent_at timestamptz,
  provider_message_id text,
  last_error_code text,
  dedupe_key text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (dedupe_key),
  constraint notification_deliveries_channel_valid check (
    channel in ('email', 'push')
  ),
  constraint notification_deliveries_status_valid check (
    status in ('queued', 'processing', 'sent', 'failed', 'skipped', 'cancelled')
  ),
  constraint notification_deliveries_attempt_count_valid check (
    attempt_count between 0 and 20
  ),
  constraint notification_deliveries_metadata_bounded check (
    length(dedupe_key) between 1 and 500
    and (provider_message_id is null or length(provider_message_id) <= 500)
    and (last_error_code is null or length(last_error_code) <= 200)
  ),
  constraint notification_deliveries_email_safe check (
    recipient_email is null
    or (
      length(recipient_email) between 3 and 254
      and recipient_email like '%@%'
      and recipient_email not like '%' || chr(10) || '%'
      and recipient_email not like '%' || chr(13) || '%'
    )
  ),
  constraint notification_deliveries_recipient_valid check (
    (profile_id is not null and recipient_email is null)
    or (profile_id is null and recipient_email is not null)
  )
);

create index if not exists event_reminder_subscriptions_profile_id_idx
  on public.event_reminder_subscriptions(profile_id);
create index if not exists push_subscriptions_profile_id_idx
  on public.push_subscriptions(profile_id);
create index if not exists user_notifications_profile_available_idx
  on public.user_notifications(profile_id, available_at desc);
create index if not exists user_notifications_event_id_idx
  on public.user_notifications(event_id);
create index if not exists notification_deliveries_due_idx
  on public.notification_deliveries(status, scheduled_for)
  where status in ('queued', 'failed');
create index if not exists notification_deliveries_notification_id_idx
  on public.notification_deliveries(notification_id);
create index if not exists notification_deliveries_event_id_idx
  on public.notification_deliveries(event_id);
create index if not exists notification_deliveries_profile_id_idx
  on public.notification_deliveries(profile_id);

drop trigger if exists trg_notification_channel_preferences_updated_at
  on public.notification_channel_preferences;
create trigger trg_notification_channel_preferences_updated_at
  before update on public.notification_channel_preferences
  for each row execute function public.set_updated_at();

drop trigger if exists trg_event_reminder_subscriptions_updated_at
  on public.event_reminder_subscriptions;
create trigger trg_event_reminder_subscriptions_updated_at
  before update on public.event_reminder_subscriptions
  for each row execute function public.set_updated_at();

drop trigger if exists trg_push_subscriptions_updated_at
  on public.push_subscriptions;
create trigger trg_push_subscriptions_updated_at
  before update on public.push_subscriptions
  for each row execute function public.set_updated_at();

drop trigger if exists trg_notification_deliveries_updated_at
  on public.notification_deliveries;
create trigger trg_notification_deliveries_updated_at
  before update on public.notification_deliveries
  for each row execute function public.set_updated_at();

alter table public.notification_channel_preferences enable row level security;
alter table public.event_reminder_subscriptions enable row level security;
alter table public.push_subscriptions enable row level security;
alter table public.user_notifications enable row level security;
alter table public.notification_deliveries enable row level security;

drop policy if exists notification_channel_preferences_select_own
  on public.notification_channel_preferences;
create policy notification_channel_preferences_select_own
  on public.notification_channel_preferences for select
  to authenticated
  using (profile_id = (select auth.uid()));

drop policy if exists notification_channel_preferences_insert_own
  on public.notification_channel_preferences;
create policy notification_channel_preferences_insert_own
  on public.notification_channel_preferences for insert
  to authenticated
  with check (profile_id = (select auth.uid()));

drop policy if exists notification_channel_preferences_update_own
  on public.notification_channel_preferences;
create policy notification_channel_preferences_update_own
  on public.notification_channel_preferences for update
  to authenticated
  using (profile_id = (select auth.uid()))
  with check (profile_id = (select auth.uid()));

drop policy if exists event_reminder_subscriptions_select_own
  on public.event_reminder_subscriptions;
create policy event_reminder_subscriptions_select_own
  on public.event_reminder_subscriptions for select
  to authenticated
  using (profile_id = (select auth.uid()));

drop policy if exists event_reminder_subscriptions_insert_own
  on public.event_reminder_subscriptions;
create policy event_reminder_subscriptions_insert_own
  on public.event_reminder_subscriptions for insert
  to authenticated
  with check (profile_id = (select auth.uid()));

drop policy if exists event_reminder_subscriptions_update_own
  on public.event_reminder_subscriptions;
create policy event_reminder_subscriptions_update_own
  on public.event_reminder_subscriptions for update
  to authenticated
  using (profile_id = (select auth.uid()))
  with check (profile_id = (select auth.uid()));

drop policy if exists event_reminder_subscriptions_delete_own
  on public.event_reminder_subscriptions;
create policy event_reminder_subscriptions_delete_own
  on public.event_reminder_subscriptions for delete
  to authenticated
  using (profile_id = (select auth.uid()));

drop policy if exists push_subscriptions_select_own
  on public.push_subscriptions;
create policy push_subscriptions_select_own
  on public.push_subscriptions for select
  to authenticated
  using (profile_id = (select auth.uid()));

drop policy if exists push_subscriptions_insert_own
  on public.push_subscriptions;
create policy push_subscriptions_insert_own
  on public.push_subscriptions for insert
  to authenticated
  with check (profile_id = (select auth.uid()));

drop policy if exists push_subscriptions_update_own
  on public.push_subscriptions;
create policy push_subscriptions_update_own
  on public.push_subscriptions for update
  to authenticated
  using (profile_id = (select auth.uid()))
  with check (profile_id = (select auth.uid()));

drop policy if exists push_subscriptions_delete_own
  on public.push_subscriptions;
create policy push_subscriptions_delete_own
  on public.push_subscriptions for delete
  to authenticated
  using (profile_id = (select auth.uid()));

drop policy if exists user_notifications_select_own
  on public.user_notifications;
create policy user_notifications_select_own
  on public.user_notifications for select
  to authenticated
  using (
    profile_id = (select auth.uid())
    and available_at <= now()
  );

drop policy if exists user_notifications_update_own
  on public.user_notifications;
create policy user_notifications_update_own
  on public.user_notifications for update
  to authenticated
  using (profile_id = (select auth.uid()))
  with check (profile_id = (select auth.uid()));

revoke all on table public.notification_channel_preferences from anon, authenticated;
revoke all on table public.event_reminder_subscriptions from anon, authenticated;
revoke all on table public.push_subscriptions from anon, authenticated;
revoke all on table public.user_notifications from anon, authenticated;
revoke all on table public.notification_deliveries from anon, authenticated;

grant select, insert, update on table public.notification_channel_preferences to authenticated;
grant select, insert, update, delete on table public.event_reminder_subscriptions to authenticated;
grant select, insert, update, delete on table public.push_subscriptions to authenticated;
grant select on table public.user_notifications to authenticated;
grant update (read_at) on table public.user_notifications to authenticated;

grant all on table public.notification_channel_preferences to service_role;
grant all on table public.event_reminder_subscriptions to service_role;
grant all on table public.push_subscriptions to service_role;
grant all on table public.user_notifications to service_role;
grant all on table public.notification_deliveries to service_role;

comment on table public.notification_deliveries is
  'Server-only idempotent delivery queue and audit ledger. No client RLS policies by design.';
