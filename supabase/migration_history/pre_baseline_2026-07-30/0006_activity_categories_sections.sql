-- Krok 3 — rozšíření číselníku zájmů o 4 vizuální sekce.
--
-- Kontext: activity_categories dosud obsahoval jen 17 položek pro spolky
-- (migrace 0002). Krok 3 přidává tři další sekce (škola, témata, kluby a
-- programy) pro osobní odběr upozornění (notification_preferences) —
-- stávající spolková sekce se nemění, jen se pojmenovává 'spolky'.
--
-- sort_order u stávajících 17 položek se NEMĚNÍ — používá ho
-- generate_spolek_registration_number() (migrace 0003) jako dvoumístný
-- kód činnosti v registračním čísle spolku (např. 2780-02-01). Nové
-- položky dostávají sort_order 18+ jen pro pořadí v UI; API
-- registrace-spolku.js je navíc omezeno na section='spolky' (viz kód),
-- takže ani teoreticky nemůžou kolidovat s existujícím číslováním.
--
-- Vyřešené kolize (dle zadání, bod 3): 'Smart City klub' se do sekce
-- Kluby a programy NEpřidává (duplicitní se 'smart_city'/'Chytrá obec' ve
-- spolkové sekci). 'Kultura a umění' zůstává jen ve spolkové sekci.

alter table activity_categories add column if not exists section text;

update activity_categories set section = 'spolky' where section is null;

alter table activity_categories alter column section set not null;
alter table activity_categories alter column section set default 'spolky';

alter table activity_categories drop constraint if exists activity_categories_section_check;
alter table activity_categories add constraint activity_categories_section_check
  check (section = any (array['skola', 'temata', 'kluby', 'spolky']));

insert into activity_categories (code, label, sort_order, section) values
  ('skola_1_stupen', '1. stupeň ZŠ', 18, 'skola'),
  ('skola_2_stupen', '2. stupeň ZŠ', 19, 'skola'),
  ('ucitele', 'Učitelé', 20, 'skola'),
  ('karierni_poradenstvi', 'Kariérní poradenství', 21, 'skola'),
  ('veda_a_objevy', 'Věda a objevy', 22, 'temata'),
  ('priroda_a_ekologie', 'Příroda a ekologie', 23, 'temata'),
  ('historie_a_archeologie', 'Historie a archeologie', 24, 'temata'),
  ('wellbeing', 'Wellbeing', 25, 'temata'),
  ('svet_v_souvislostech', 'Svět v souvislostech', 26, 'temata'),
  ('anglictina', 'Vysílání v angličtině', 27, 'temata'),
  ('ctenarsky_klub', 'Čtenářský klub', 28, 'kluby'),
  ('filmovy_klub', 'Filmový klub', 29, 'kluby')
on conflict (code) do update set
  label = excluded.label,
  sort_order = excluded.sort_order,
  section = excluded.section;
