alter table public.profile_completion_reminder_attempts
  drop constraint if exists profile_completion_reminder_attempts_status_check;

alter table public.profile_completion_reminder_attempts
  add constraint profile_completion_reminder_attempts_status_check
    check (status in ('sending', 'sent', 'failed', 'delivery_unknown'));

comment on constraint profile_completion_reminder_attempts_status_check
  on public.profile_completion_reminder_attempts is
  'Failed is reserved for a confirmed pre-delivery failure that may be retried; delivery_unknown always requires manual review.';
