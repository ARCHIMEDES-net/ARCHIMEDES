-- Classify and harden the authenticated SECURITY DEFINER functions from #106.
-- This migration changes function definitions/grants only; it does not mutate data.

-- These legacy activation entry points are not used by the application and were
-- already unavailable to authenticated users. Drop the wrapper before its target.
drop function if exists public.activate_municipality_with_admin(uuid, uuid, text, text, boolean);
drop function if exists public.activate_customer_with_admin(uuid, uuid, text, text, boolean);

-- No application, policy, trigger or function calls this legacy mutation RPC.
drop function if exists public.set_featured_best_practice_post(uuid);

-- Canonical platform-admin helper. SECURITY DEFINER is required to avoid RLS
-- recursion while policies inspect the protected platform_admins table.
create or replace function public.is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.platform_admins admin
    where admin.user_id = (select auth.uid())
  );
$$;

-- Compatibility name used by legacy RLS and Storage policies. The implementation
-- no longer needs elevated privileges because it delegates to the canonical helper.
create or replace function public.is_admin()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select public.is_platform_admin();
$$;

-- Organization and school helpers remain SECURITY DEFINER to avoid recursion in
-- policies on organization_members and profiles, but all identifiers are qualified.
create or replace function public.is_org_admin_member(org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.organization_members member
    where member.organization_id = org_id
      and member.user_id = (select auth.uid())
      and member.role_in_org = 'organization_admin'
      and member.status = 'active'
  );
$$;

create or replace function public.is_school_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles profile
    where profile.id = (select auth.uid())
      and profile.role = 'school_admin'
      and profile.is_active = true
  );
$$;

create or replace function public.my_school_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select profile.school_id
  from public.profiles profile
  where profile.id = (select auth.uid())
  limit 1;
$$;

-- The current activation RPC is intentionally called with the platform admin's
-- JWT and enforces public.is_admin() internally. Its body already qualifies all
-- relations, so an empty search path is safe and preserves the existing signature.
alter function public.activate_customer_with_admin_v2(
  uuid,
  uuid,
  text,
  text,
  text,
  timestamptz,
  timestamptz,
  text,
  text,
  boolean,
  boolean
) set search_path = '';

revoke all on function public.is_platform_admin() from public, anon, authenticated;
grant execute on function public.is_platform_admin() to authenticated, service_role;

revoke all on function public.is_admin() from public, anon, authenticated;
grant execute on function public.is_admin() to authenticated, service_role;

revoke all on function public.is_org_admin_member(uuid) from public, anon, authenticated;
grant execute on function public.is_org_admin_member(uuid) to authenticated, service_role;

revoke all on function public.is_school_admin() from public, anon, authenticated;
grant execute on function public.is_school_admin() to authenticated, service_role;

revoke all on function public.my_school_id() from public, anon, authenticated;
grant execute on function public.my_school_id() to authenticated, service_role;

revoke all on function public.activate_customer_with_admin_v2(
  uuid,
  uuid,
  text,
  text,
  text,
  timestamptz,
  timestamptz,
  text,
  text,
  boolean,
  boolean
) from public, anon;
grant execute on function public.activate_customer_with_admin_v2(
  uuid,
  uuid,
  text,
  text,
  text,
  timestamptz,
  timestamptz,
  text,
  text,
  boolean,
  boolean
) to authenticated, service_role;

comment on function public.is_admin() is
  'SECURITY INVOKER compatibility wrapper for RLS and Storage policies; delegates to is_platform_admin().';
comment on function public.is_platform_admin() is
  'SECURITY DEFINER RLS helper scoped to auth.uid(); authenticated execution is intentional.';
comment on function public.is_org_admin_member(uuid) is
  'SECURITY DEFINER RLS helper scoped to auth.uid() and one organization; authenticated execution is intentional.';
comment on function public.is_school_admin() is
  'SECURITY DEFINER profiles RLS helper scoped to auth.uid(); authenticated execution is intentional.';
comment on function public.my_school_id() is
  'SECURITY DEFINER profiles RLS helper scoped to auth.uid(); authenticated execution is intentional.';
