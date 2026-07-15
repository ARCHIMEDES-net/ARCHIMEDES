-- ARCHIMEDES Live — read-only kontrola před převodem existujících organizací.
-- Skript obsahuje pouze SELECT/CTE. Nespouští žádnou změnu dat ani schématu.

-- 1) Základní počty a integrita vazby Start -> organizations.
select
  (select count(*) from public.organizations) as organizations_total,
  (select count(*) from public.orders_start) as orders_start_total,
  (select count(*) from public.orders_start where organization_id is null)
    as start_without_organization_id,
  (
    select count(*)
    from public.orders_start os
    left join public.organizations o on o.id = os.organization_id
    where os.organization_id is not null and o.id is null
  ) as start_with_missing_organization;

-- 2) Všechny Start organizace a interní škola musí zůstat dohledatelné.
select
  o.id,
  o.name,
  o.org_type,
  o.status,
  o.is_system,
  (os.id is not null) as has_start_order,
  coalesce(os.to_delete, false) as start_marked_to_delete,
  o.parent_organization_id
from public.organizations o
left join public.orders_start os on os.organization_id = o.id
order by o.is_system desc, o.name;

-- 3) Neměnná kotva interní školy ARCHIMEDES.
select
  case
    when count(*) = 1
      and bool_and(name = 'Testovací škola ARCHIMEDES')
      and bool_and(is_system)
    then 'OK'
    else 'FAIL'
  end as archimedes_system_school,
  count(*) as matching_rows
from public.organizations
where id = '339612be-8577-4cce-8ef4-e77a4bc0b442'::uuid;

-- 4) Tři obchodně potvrzené platící školy musejí existovat právě jednou.
with expected(name) as (
  values
    ('ZŠ a MŠ kpt. Otakara Jaroše Louny'::text),
    ('ZŠ Ostrava, s.r.o.'::text),
    ('Základní škola, Luže, okres Chrudim'::text)
)
select
  expected.name,
  count(o.id) as matching_organizations,
  case when count(o.id) = 1 then 'OK' else 'FAIL' end as result
from expected
left join public.organizations o on o.name = expected.name
group by expected.name
order by expected.name;

-- 5) Každé reálné členství musí ukazovat na Auth účet i profil.
-- Známý historický osiřelý řádek je inactive; vypisuje se zvlášť níže.
select
  count(*) filter (where au.id is null) as active_memberships_without_auth,
  count(*) filter (where p.id is null) as active_memberships_without_profile,
  count(*) as active_memberships_total
from public.organization_members om
left join auth.users au on au.id = om.user_id
left join public.profiles p on p.id = om.user_id
where om.status = 'active';

select
  om.user_id,
  om.organization_id,
  om.role_in_org,
  om.status,
  (au.id is not null) as has_auth,
  (p.id is not null) as has_profile
from public.organization_members om
left join auth.users au on au.id = om.user_id
left join public.profiles p on p.id = om.user_id
where au.id is null or p.id is null
order by om.status, om.created_at;

-- 6) Přehled počtu členství před a po ručním přiřazení rodičovských obcí.
select
  o.id,
  o.name,
  count(*) filter (where om.status = 'active') as active_memberships,
  count(*) filter (where om.status = 'inactive') as inactive_memberships,
  count(*) filter (
    where om.status = 'active' and om.role_in_org = 'organization_admin'
  ) as active_organization_admins,
  o.parent_organization_id
from public.organizations o
left join public.organization_members om on om.organization_id = o.id
group by o.id, o.name, o.parent_organization_id
order by o.name;

-- 7) Staré skupiny: počet skutečných příjemců a pokrytí mapováním.
with legacy_map(interest_slug, activity_code) as (
  values
    ('ucitele', 'ucitele'),
    ('druhy-stupen', 'skola_2_stupen'),
    ('prvni-stupen', 'skola_1_stupen'),
    ('rodice', 'rodice_deti'),
    ('seniori', 'seniori'),
    ('komunita', 'komunita'),
    ('karierni-poradenstvi', 'karierni_poradenstvi'),
    ('filmovy-klub', 'filmovy_klub'),
    ('wellbeing', 'wellbeing'),
    ('english-live', 'anglictina'),
    ('smart-city', 'smart_city'),
    ('ctenarsky-klub', 'ctenarsky_klub'),
    ('veda-a-objevy', 'veda_a_objevy'),
    ('svet-v-souvislostech', 'svet_v_souvislostech')
), recipients as (
  select distinct ui.user_id, ui.interest_slug, lower(trim(p.email)) as email
  from public.user_interests ui
  join public.profiles p on p.id = ui.user_id
  where nullif(trim(p.email), '') is not null
    and p.email_notifications_enabled is distinct from false
)
select
  r.interest_slug,
  count(distinct r.user_id) as profiles,
  count(distinct r.email) as unique_emails,
  lm.activity_code,
  case
    when lm.activity_code is not null then 'MAPPED'
    when r.interest_slug = 'zajmove-skupiny' then 'PRESERVED_AS_LEGACY'
    else 'FAIL_UNMAPPED'
  end as migration_status
from recipients r
left join legacy_map lm on lm.interest_slug = r.interest_slug
group by r.interest_slug, lm.activity_code
order by r.interest_slug;

-- 8) Platní platformoví admini. Zuzana i Antonín musejí být ve stejné
-- tabulce; práva se neurčují jménem, ale existencí stejného typu řádku.
select
  count(*) as platform_admin_rows,
  count(*) filter (where au.id is not null and p.id is not null)
    as valid_platform_admins,
  count(*) filter (where au.id is null or p.id is null)
    as orphan_platform_admin_rows
from public.platform_admins pa
left join auth.users au on au.id = pa.user_id
left join public.profiles p on p.id = pa.user_id;

-- 9) Demo bylo obchodně zrušeno. Před aplikací 0009 musí být výsledek 0.
select count(*) as demo_memberships_must_be_zero
from public.organization_members
where role_in_org = 'demo_viewer';

-- 10) Aktivace obce nesmí zanechat částečný stav. Po nasazení 0010 mají
-- být oba počty 0 (před spuštěním nového portálu dnes obce neexistují).
select
  count(*) filter (
    where o.status = 'active'
      and not exists (
        select 1
        from public.organization_members om
        where om.organization_id = o.id
          and om.role_in_org = 'organization_admin'
          and om.status = 'active'
      )
  ) as active_municipalities_without_active_admin,
  count(*) filter (
    where o.status <> 'active'
      and exists (
        select 1
        from public.organization_members om
        where om.organization_id = o.id
          and om.role_in_org = 'organization_admin'
          and om.status = 'active'
      )
  ) as inactive_municipalities_with_active_admin
from public.organizations o
where o.org_type = 'obec';

-- 11) Učitel se školním kódem je vždy member; správce musí vzniknout při
-- registraci školy. Aktivní škola bez aktivního správce vyžaduje ruční
-- opravu před spuštěním nové samoobslužné registrace učitelů.
select count(*) as active_schools_without_active_admin_must_be_zero
from public.organizations o
where o.org_type = 'school'
  and o.status = 'active'
  and not exists (
    select 1
    from public.organization_members om
    where om.organization_id = o.id
      and om.role_in_org = 'organization_admin'
      and om.status = 'active'
  );
