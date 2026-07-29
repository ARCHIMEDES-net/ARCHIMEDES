-- Issue #83: the Make scenario connected to this database webhook is
-- inactive and has no downstream actions. Lead persistence, onboarding,
-- administration, and SMTP notifications are handled by the application.
--
-- Keep Supabase's shared `supabase_functions.http_request` function and
-- hook history intact. Only the legacy lead delivery trigger is retired.
drop trigger if exists new_lead_notification on public.leads;
