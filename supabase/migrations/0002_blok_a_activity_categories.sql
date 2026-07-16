-- Blok A — DB migrace, krok 2: číselník činností spolku + navazující tabulky
--
-- Obsah activity_categories přebírán přesně z ciselnik-cinnosti-spolku.docx
-- (verze 1, 8. 7. 2026, 17 položek). Schéma (code jako trvalý primární klíč,
-- ne uuid) i tabulky organization_activities / notification_preferences
-- odpovídají návrhu v tomtéž dokumentu.
--
-- Návaznost: spusťte 0001_blok_a_organizations_hierarchy.sql PŘED touhle
-- migrací — RLS níže používá is_org_admin(), která se definuje tam.
--
-- Spuštění: Supabase Dashboard -> SQL Editor -> vlož a spusť.
--
-- Předpoklad, který nemůžu ověřit odsud: RLS "jen is_platform_admin()"
-- ze zadání mapuju na existující funkci is_admin() (to je jediná funkce
-- pro platform admina, kterou appka reálně volá — pages/portal/index.js
-- a další volají supabase.rpc("is_admin")). Pokud je is_platform_admin()
-- ve skutečnosti jiná, samostatná DB funkce, opravte prosím níže
-- označená místa.

-- 2) Číselník činností spolku
create table if not exists activity_categories (
  code text primary key,
  label text not null,
  sort_order int not null,
  is_active boolean not null default true
);

insert into activity_categories (code, label, sort_order) values
  ('hasici', 'Požární ochrana', 1),
  ('sport', 'Sport a tělovýchova', 2),
  ('myslivost', 'Myslivost', 3),
  ('vcelarstvi', 'Včelařství', 4),
  ('zahradkari', 'Zahrádkáři a pěstitelé', 5),
  ('rybarstvi', 'Rybářství', 6),
  ('chovatelstvi', 'Chovatelství', 7),
  ('folklor', 'Folklor a tradice', 8),
  ('kultura', 'Kultura a umění', 9),
  ('seniori', 'Senioři', 10),
  ('rodice_deti', 'Rodiče a děti', 11),
  ('mladez', 'Děti a mládež', 12),
  ('socialni', 'Sociální a zdravotní', 13),
  ('duchovni', 'Duchovní společenství', 14),
  ('komunita', 'Okrašlovací a komunitní', 15),
  ('smart_city', 'Chytrá obec', 16),
  ('jine', 'Jiné', 17)
on conflict (code) do update set
  label = excluded.label,
  sort_order = excluded.sort_order;

alter table activity_categories enable row level security;

-- SELECT pro všechny přihlášené — jen číselník, nic citlivého.
create policy "activity_categories_select_authenticated"
  on activity_categories for select
  to authenticated
  using (true);

-- Zápis (insert/update/delete) jen pro platform admina. Viz poznámka o
-- is_admin()/is_platform_admin() nahoře.
create policy "activity_categories_write_admin"
  on activity_categories for all
  to authenticated
  using (is_admin())
  with check (is_admin());

-- 3) M:N vazba organizace <-> činnost. Umožňuje spolku zvolit víc než
-- jednu kategorii (min. jedna, podle dokumentu — vynuceno na úrovni
-- budoucího registračního formuláře, ne tady v DB).
create table if not exists organization_activities (
  organization_id uuid not null references organizations(id) on delete cascade,
  activity_code text not null references activity_categories(code),
  custom_text text, -- vyplněno jen když activity_code = 'jine'
  created_at timestamptz not null default now(),
  primary key (organization_id, activity_code)
);

alter table organization_activities enable row level security;

create policy "organization_activities_select"
  on organization_activities for select
  to authenticated
  using (is_org_admin(organization_id) or is_admin());

create policy "organization_activities_insert"
  on organization_activities for insert
  to authenticated
  with check (is_org_admin(organization_id) or is_admin());

create policy "organization_activities_update"
  on organization_activities for update
  to authenticated
  using (is_org_admin(organization_id) or is_admin())
  with check (is_org_admin(organization_id) or is_admin());

-- Zadání (bod 5) výslovně jmenuje jen SELECT/INSERT/UPDATE pro tuhle
-- tabulku — žádnou DELETE policy proto nepřidávám bez vyžádání. Pokud
-- bude potřeba spolku umožnit činnost odebrat (ne jen přepsat), přidejte
-- analogickou "for delete" policy se stejnou podmínkou.

-- 4) Osobní nastavení notifikací podle kategorie. Hlavní vypínač zůstává
-- profiles.email_notifications_enabled; tahle tabulka je jen jemnější
-- volba nad ním.
create table if not exists notification_preferences (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  activity_code text not null references activity_categories(code),
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  unique (profile_id, activity_code)
);

alter table notification_preferences enable row level security;

create policy "notification_preferences_select_own"
  on notification_preferences for select
  to authenticated
  using (profile_id = auth.uid());

create policy "notification_preferences_update_own"
  on notification_preferences for update
  to authenticated
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

-- Zadání (bod 5) jmenuje jen SELECT/UPDATE, ale bez INSERT by si
-- uživatel nemohl nikdy založit první řádek vlastní preference — tabulka
-- by pak byla z klienta nepoužitelná. Přidávám INSERT se stejnou
-- podmínkou (profile_id = auth.uid()); smažte tuhle policy, pokud má
-- zápis jít výhradně přes service-role API místo přímo z klienta.
create policy "notification_preferences_insert_own"
  on notification_preferences for insert
  to authenticated
  with check (profile_id = auth.uid());
