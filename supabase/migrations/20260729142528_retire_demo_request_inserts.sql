-- Demo onboarding has been retired. Keep the historical table for records and
-- backups, but remove the legacy public write path that bypassed the retired API.
drop policy if exists "allow_insert_demo_requests" on public.demo_requests;

revoke insert on table public.demo_requests from anon, authenticated;
