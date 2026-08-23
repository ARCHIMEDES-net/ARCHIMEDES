create index if not exists profile_completion_reminder_resolved_by_idx
  on public.profile_completion_reminder_attempts (resolved_by)
  where resolved_by is not null;
