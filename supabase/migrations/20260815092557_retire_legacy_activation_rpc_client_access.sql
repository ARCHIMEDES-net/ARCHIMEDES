begin;

-- This legacy activation path predates the audited written-order acceptance
-- required by the current onboarding flow. Keep it available only to trusted
-- server-side service code so authenticated clients cannot bypass that audit.
revoke execute on function public.activate_customer_with_admin_v2(
  uuid,
  uuid,
  text,
  text,
  text,
  timestamp with time zone,
  timestamp with time zone,
  text,
  text,
  boolean,
  boolean
) from public, anon, authenticated;

grant execute on function public.activate_customer_with_admin_v2(
  uuid,
  uuid,
  text,
  text,
  text,
  timestamp with time zone,
  timestamp with time zone,
  text,
  text,
  boolean,
  boolean
) to service_role;

commit;
