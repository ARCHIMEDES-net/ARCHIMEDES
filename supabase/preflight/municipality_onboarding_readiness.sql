-- Read-only kontrola pred 0014_municipality_onboarding.sql.
-- Skript nic nemeni a lze jej spustit opakovane.

select
  now() as checked_at,
  current_database() as database_name,
  current_setting('server_version') as postgres_version;

select
  count(*) filter (
    where org_type in ('municipality', 'obec')
      and parent_organization_id is null
  ) as municipalities,
  count(*) filter (
    where org_type = 'school'
  ) as schools,
  count(*) filter (
    where org_type in ('association', 'spolek')
  ) as associations,
  count(*) filter (
    where license_status = 'active'
  ) as active_licenses,
  count(*) filter (
    where license_status = 'pending_approval'
  ) as pending_licenses
from public.organizations;

-- Referencni pocty pro porovnani pred a po migraci. Vystup neobsahuje
-- osobni udaje; 0014 nesmi zadny z techto existujicich zaznamu zmenit.
select
  (select count(*) from public.organizations) as organizations_total,
  (select count(*) from public.organization_members) as memberships_total,
  (select count(*) from public.profiles) as profiles_total,
  (select count(*) from public.orders_start) as orders_total,
  (
    select count(*)
    from public.orders_start
    where organization_id is not null
  ) as orders_linked_to_organization;

select
  org_type,
  status,
  license_status,
  count(*) as organization_count
from public.organizations
group by org_type, status, license_status
order by org_type, status, license_status;

-- Aktivni casove omezena licence, ktera je uz po platnosti.
select id, name, org_type, license_status, license_valid_until
from public.organizations
where license_status = 'active'
  and license_valid_until is not null
  and license_valid_until < now()
order by license_valid_until;

-- Top-level zakaznik musi mit nejvyse jedno aktivni clenstvi daneho spravce
-- v ramci organizace; vypis odhali duplicity pred atomickym upsertem.
select organization_id, user_id, count(*) as duplicate_count
from public.organization_members
group by organization_id, user_id
having count(*) > 1;

-- Kontrola povinnych objektu, na ktere 0014 navazuje.
select
  to_regclass('public.organizations') is not null as organizations_exists,
  to_regclass('public.organization_members') is not null as organization_members_exists,
  to_regclass('public.profiles') is not null as profiles_exists,
  to_regprocedure(
    'public.is_admin()'
  ) is not null as is_admin_exists,
  to_regprocedure(
    'public.get_my_organizations(uuid[])'
  ) is not null as get_my_organizations_exists,
  to_regprocedure(
    'public.activate_customer_with_admin(uuid,uuid,text,text,boolean)'
  ) is not null as previous_activation_exists;

-- Informace, zda uz byla 0014 aplikovana. Pred prvnim spustenim jsou
-- sloupce/tabulky/funkce ocekavane false.
select
  exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'organizations'
      and column_name = 'license_plan'
  ) as license_plan_column_exists,
  to_regclass('public.municipality_organization_invites') is not null
    as invite_table_exists,
  to_regclass('public.api_rate_limits') is not null
    as rate_limit_table_exists,
  to_regprocedure(
    'public.activate_customer_with_admin_v2(uuid,uuid,text,text,text,timestamptz,timestamptz,text,text,boolean,boolean)'
  ) is not null as activation_v2_exists,
  to_regprocedure(
    'public.consume_api_rate_limit(text,text,integer,integer)'
  ) is not null as rate_limit_function_exists;

-- Nemenny systemovy subjekt musi zustat zachovan.
select id, name, org_type, status, license_status, is_system
from public.organizations
where id = '339612be-8577-4cce-8ef4-e77a4bc0b442'::uuid;
