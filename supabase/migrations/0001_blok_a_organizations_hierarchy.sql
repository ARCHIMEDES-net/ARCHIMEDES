-- Blok A — DB migrace, krok 1: hierarchie organizací (obec -> škola/spolek)
--
-- Kontext: rozhodnutí 9. 7. 2026 — školy a spolky nemají vlastní stav
-- licence, dědí ho od obce (top-level organizace), pod kterou patří.
-- lib/licenseMode.js v aplikačním kódu už s parent_organization_id počítá
-- (defenzivně, v try/catch) — tahle migrace mu dá sloupec, který skutečně
-- existuje.
--
-- ROZSAH TÉTO MIGRACE: jen sloupce na organizations + funkce is_org_admin.
-- Bloky 2–4 ze zadání (activity_categories, organization_activities,
-- notification_preferences a jejich RLS) jsou ZÁMĚRNĚ VYNECHANÉ —
-- čekají na obsah číselníku činností spolku (ciselnik-cinnosti-spolku.docx),
-- který zatím není k dispozici. Přijdou v samostatné migraci
-- (0002_blok_a_activity_categories.sql), až obsah dorazí.
--
-- Spuštění: Supabase Dashboard -> SQL Editor -> vlož a spusť. Žádný krok
-- odsud nemá destruktivní efekt na existující data (jen přidává sloupce
-- a funkci, nic nemaže ani nepřepisuje).

-- 1a) parent_organization_id — škola/spolek pod obcí. NULL = top-level
-- organizace (typicky obec), vyplněno = dědí license_status z rodiče.
alter table organizations
  add column if not exists parent_organization_id uuid references organizations(id);

-- 1b) registration_number — registrační kód obce, kterým se spolek
-- self-registruje (viz /pro-organizace). Generuje se až při SCHVÁLENÍ
-- žádosti obce, ne při podání /zadost — tahle migrace jen připravuje
-- sloupec, generování a samotný self-registrační formulář jsou blok B/C
-- (samostatná session).
alter table organizations
  add column if not exists registration_number text unique;

-- Poznámka k pravidlu "license_status/license_valid_until má smysl jen
-- když parent_organization_id IS NULL": záměrně to NEVYNUCUJI jako CHECK
-- constraint. Aplikační kód (lib/licenseMode.js) tohle pravidlo už
-- respektuje při čtení (ignoruje vlastní license_status organizace, když
-- má parenta) a tvrdý DB constraint by mohl nečekaně shodit budoucí
-- insert/update, který sloupce nastavuje v jiném pořadí. Pokud chcete
-- constraint přidat později, dá se to udělat jako samostatný krok až bude
-- jasné, jak přesně bude self-registrační flow sloupce zapisovat.

-- 1c) is_org_admin(uuid) — chybělo v DB (ověřeno: v kódu aplikace se
-- volá jen is_admin(), bez parametru, pro platform admina). Potřeba pro
-- RLS na organization_activities a notification_preferences (blok 3–4,
-- přijde v navazující migraci) i pro budoucí self-registrační API.
-- Definice odpovídá stávající konvenci v organization_members
-- (role_in_org = 'organization_admin', status = 'active') — stejný vzor,
-- jaký už appka na klientu používá při kontrole členství.
create or replace function is_org_admin(org_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1
    from organization_members
    where organization_id = org_id
      and user_id = auth.uid()
      and role_in_org = 'organization_admin'
      and status = 'active'
  );
$$;
