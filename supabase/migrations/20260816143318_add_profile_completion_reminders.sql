alter table public.profiles
  add column if not exists profile_completed_at timestamptz;

comment on column public.profiles.profile_completed_at is
  'Time when the user explicitly saved the complete My profile form.';

update public.profiles profile
set profile_completed_at = coalesce(profile.updated_at, profile.created_at, now())
where profile.profile_completed_at is null
  and nullif(btrim(profile.full_name), '') is not null
  and exists (
    select 1
    from public.notification_preferences preference
    where preference.profile_id = profile.id
  );

create table if not exists public.profile_completion_reminder_attempts (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete restrict,
  reminder_step smallint not null check (reminder_step in (1, 2)),
  reason text not null check (reason in ('password', 'profile', 'password_and_profile')),
  recipient_email text not null,
  status text not null check (status in ('sending', 'sent', 'delivery_unknown')),
  claimed_at timestamptz not null default now(),
  sent_at timestamptz,
  error_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (profile_id, reminder_step)
);

comment on table public.profile_completion_reminder_attempts is
  'Immutable-target audit for at most two password/profile completion reminders per user.';

create index if not exists profile_completion_reminders_status_idx
  on public.profile_completion_reminder_attempts (status, claimed_at);

alter table public.profile_completion_reminder_attempts enable row level security;

revoke all on table public.profile_completion_reminder_attempts from public, anon, authenticated;
grant select, insert, update on table public.profile_completion_reminder_attempts to service_role;
revoke delete, truncate, references, trigger on table public.profile_completion_reminder_attempts from service_role;
