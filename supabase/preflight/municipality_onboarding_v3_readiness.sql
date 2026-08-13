-- Read-only readiness report for the hardened municipality onboarding.
-- It returns aggregate counts only and never changes production data.

begin transaction read only;

select
  count(*) as duplicate_profile_email_groups
from (
  select lower(btrim(email))
  from public.profiles
  where nullif(btrim(email), '') is not null
  group by lower(btrim(email))
  having count(*) > 1
) duplicates;

select
  count(*) as duplicate_membership_pairs
from (
  select organization_id, user_id
  from public.organization_members
  group by organization_id, user_id
  having count(*) > 1
) duplicates;

select
  count(*) as duplicate_top_level_ico_groups
from (
  select regexp_replace(coalesce(legal_identifier, ico, ''), '[^0-9]', '', 'g') as normalized_ico
  from public.organizations
  where parent_organization_id is null
    and org_type in ('municipality', 'obec')
    and license_status in ('pending_approval', 'active', 'suspended')
    and nullif(
      regexp_replace(coalesce(legal_identifier, ico, ''), '[^0-9]', '', 'g'),
      ''
    ) is not null
  group by normalized_ico
  having count(*) > 1
) duplicates;

select
  count(*) as duplicate_municipality_name_address_groups
from (
  select
    lower(btrim(name)) as normalized_name,
    lower(btrim(coalesce(registered_address, ''))) as normalized_address
  from public.organizations
  where parent_organization_id is null
    and org_type in ('municipality', 'obec')
    and license_status in ('pending_approval', 'active', 'suspended')
  group by normalized_name, normalized_address
  having count(*) > 1
) duplicates;

select
  count(*) as invalid_platform_admin_identities
from public.platform_admins platform_admin
left join auth.users auth_user on auth_user.id = platform_admin.user_id
left join public.profiles profile on profile.id = platform_admin.user_id
where auth_user.id is null
   or profile.id is null
   or profile.is_active is false
   or platform_admin.role not in ('admin', 'super_admin')
   or lower(btrim(auth_user.email)) is distinct from lower(btrim(profile.email));

select
  count(*) filter (where auth_user.id is null) as historical_platform_admin_orphans,
  count(*) filter (
    where auth_user.id is not null
      and (profile.id is null or profile.is_active is not true)
  ) as platform_admins_without_active_profile
from public.platform_admins platform_admin
left join auth.users auth_user on auth_user.id = platform_admin.user_id
left join public.profiles profile on profile.id = platform_admin.user_id;

rollback;
