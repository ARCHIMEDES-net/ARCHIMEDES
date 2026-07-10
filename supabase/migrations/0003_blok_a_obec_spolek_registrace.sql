-- Blok A — DB migrace, krok 3: registrace obce (org_type='obec') a
-- self-registrace spolku (org_type='spolek') pod ní.
--
-- Kontext: zadání "ARCHIMEDES Live — Krok 1+2" (10.7.2026). Jediný produkt =
-- obecní licence, žádná zkušební lhůta. /zadost zakládá obec rovnou se
-- stavem pending_approval, Zuzana ji ručně aktivuje, spolky se pak
-- self-registrují pod registračním číslem aktivní obce.
--
-- Ověřeno přímo v produkční DB (execute_sql, ne odhadem z kódu) před psaním
-- téhle migrace: na organizations.org_type existují DVĚ překrývající se
-- CHECK constraints (organizations_org_type_check a
-- organizations_type_allowed) se stejným účelem, patrně vzniklé postupně.
-- Rozšiřuju OBĚ, abych se nespoléhal na to, která z nich je "ta platná" —
-- konsolidaci na jednu nechávám mimo rozsah, ať tahle migrace nemění nic
-- navíc.
--
-- Spuštění: Supabase Dashboard -> SQL Editor -> vlož a spusť. Návaznost na
-- 0001 (parent_organization_id, registration_number sloupce) a 0002
-- (activity_categories, organization_activities) — spusťte po nich.

-- 1) org_type: přidat 'obec' a 'spolek' vedle stávajících hodnot.
--
-- Poznámka k pojmenování: pages/api/create-organization.js a
-- pages/api/admin/create-organization-from-request.js už dnes používají
-- anglické org_type hodnoty 'municipality' a 'association' pro koncepčně
-- stejné věci (obec, spolek) — ale jde o jinou, samostatnou cestu vzniku
-- organizace (ruční admin akce nad access_requests / self-service
-- create-organization), která v produkci zatím nemá žádný řádek (všech 11
-- organizací je dnes 'school'). Tahle migrace ji NEMĚNÍ ani nekonsoliduje
-- s 'obec'/'spolek' — zadání výslovně žádá literální české hodnoty pro
-- novou cestu (/zadost, /registrace-spolku), takže od teď v DB souběžně
-- existují 'municipality'/'association' (stará, nepoužívaná cesta) a
-- 'obec'/'spolek' (nová cesta popsaná níže). Sjednocení je samostatné
-- rozhodnutí mimo rozsah tohoto zadání.
alter table organizations drop constraint if exists organizations_org_type_check;
alter table organizations add constraint organizations_org_type_check
  check (org_type = any (array[
    'municipality', 'school', 'senior_club', 'association', 'partner',
    'community_center', 'obec', 'spolek'
  ]));

alter table organizations drop constraint if exists organizations_type_allowed;
alter table organizations add constraint organizations_type_allowed
  check (org_type = any (array[
    'school', 'municipality', 'senior_club', 'association',
    'community_center', 'diaspora', 'partner', 'obec', 'spolek'
  ]));

-- 2) Nové sloupce na organizations.
--
-- primary_activity_code/primary_activity_custom_text: zjednodušuje dotaz
-- pro budoucí krok 4 (filtrace pro svazová vysílání) a umožňuje triggeru
-- níže dopočítat registrační číslo spolku v jednom kroku bez závislosti na
-- souběžném insertu do organization_activities (viz doporučení v zadání,
-- bod 4.3). Zápis do organization_activities zůstává zachován kvůli
-- konzistenci a budoucímu rozšíření na víc činností.
--
-- contact_name/contact_email/contact_phone: nejsou v DB modelu ze zadání
-- (bod 4) výslovně jmenované, ale bod 5.3 vyžaduje sběr kontaktní osoby,
-- e-mailu a telefonu při self-registraci spolku a nikde jinde v datovém
-- modelu pro ně není rozumné místo — access_requests.address je NOT NULL a
-- tvarovaná pro žádost obce (adresa úřadu, počet obyvatel), ne pro spolek.
-- Stejné sloupce se využijí i pro obec, aby admin aktivační obrazovka
-- (mimo rozsah téhle migrace, viz backend) měla koho kontaktovat před
-- schválením.
alter table organizations
  add column if not exists primary_activity_code text references activity_categories(code),
  add column if not exists primary_activity_custom_text text,
  add column if not exists contact_name text,
  add column if not exists contact_email text,
  add column if not exists contact_phone text;

-- 3) Registrační číslo obce — neprozrazující sekvence (bod 4.2).
-- Interní sekvence je čistě administrativní, nikdy se nezobrazuje.
create sequence if not exists obec_registration_seq start 1;

create or replace function generate_obec_registration_number()
returns trigger
language plpgsql
as $$
begin
  if new.org_type = 'obec' and new.registration_number is null then
    -- 4001 je nesoudělné s 10000 (4001 je prvočíslo) => bijekce modulo
    -- 10000, takže žádné dvě obce nedostanou stejné číslo a z čísla nejde
    -- odvodit pořadí založení.
    new.registration_number :=
      lpad(
        (((nextval('obec_registration_seq') * 4001 + 777) % 10000))::text,
        4, '0'
      );
  end if;
  return new;
end;
$$;

drop trigger if exists trg_generate_obec_registration_number on organizations;
create trigger trg_generate_obec_registration_number
  before insert on organizations
  for each row execute function generate_obec_registration_number();

-- 4) Registrační číslo spolku — composite (bod 4.3):
-- {registration_number obce}-{sort_order činnosti, 2 místa}-{pořadí spolku
-- v rámci téže obce a činnosti, 2 místa}. Čitelné, ale neprozrazuje nic nad
-- rámec toho, co je stejně veřejné (číslo obce, kterou si spolek sám
-- zvolil, a jeho vlastní pořadí v rámci jedné činnosti).
--
-- Race condition: čtení počtu existujících spolků a insert nejsou atomické
-- vůči jiné souběžné registraci ve stejné obci+činnosti. Duplicitě brání
-- UNIQUE (registration_number) na organizations (existuje už z bloku A);
-- při kolizi insert selže a API vrstva (pages/api/registrace-spolku.js) to
-- řeší krátkým retry loopem, stejně jako dnešní generateUniqueJoinCode() v
-- pages/api/create-organization.js.
create or replace function generate_spolek_registration_number()
returns trigger
language plpgsql
as $$
declare
  parent_reg text;
  activity_sort int;
  existing_count int;
begin
  if new.org_type = 'spolek' and new.registration_number is null then
    if new.parent_organization_id is null then
      raise exception 'spolek musí mít parent_organization_id';
    end if;

    if new.primary_activity_code is null then
      raise exception 'spolek musí mít primary_activity_code';
    end if;

    select registration_number into parent_reg
    from organizations
    where id = new.parent_organization_id;

    if parent_reg is null then
      raise exception 'rodičovská obec nemá registration_number';
    end if;

    select sort_order into activity_sort
    from activity_categories
    where code = new.primary_activity_code;

    if activity_sort is null then
      raise exception 'neznámý kód činnosti: %', new.primary_activity_code;
    end if;

    select count(*) into existing_count
    from organizations
    where parent_organization_id = new.parent_organization_id
      and primary_activity_code = new.primary_activity_code
      and org_type = 'spolek';

    new.registration_number :=
      parent_reg
      || '-' || lpad(activity_sort::text, 2, '0')
      || '-' || lpad((existing_count + 1)::text, 2, '0');
  end if;
  return new;
end;
$$;

drop trigger if exists trg_generate_spolek_registration_number on organizations;
create trigger trg_generate_spolek_registration_number
  before insert on organizations
  for each row execute function generate_spolek_registration_number();

-- 5) CHECK: 'jine' vyžaduje vyplněný custom_text (bod 4.3).
alter table organizations drop constraint if exists organizations_primary_activity_jine_requires_text;
alter table organizations add constraint organizations_primary_activity_jine_requires_text
  check (
    primary_activity_code is distinct from 'jine'
    or (primary_activity_custom_text is not null and btrim(primary_activity_custom_text) <> '')
  );

-- 6) organization_activities: nejvýše jedna činnost na spolek (bod 4.3).
-- Stávající PK (organization_id, activity_code) unikátnost napříč org
-- nevynucuje — přidávám samostatný UNIQUE(organization_id).
alter table organization_activities drop constraint if exists organization_activities_one_per_org;
alter table organization_activities add constraint organization_activities_one_per_org
  unique (organization_id);

-- 7) license_status výchozí hodnota (bod 4.4): 'trial' neodpovídá
-- obchodnímu rozhodnutí o zrušení zkušební lhůty. Ověřeno: nic v
-- aplikačním kódu na výchozí hodnotu 'trial' aktivně nespoléhá —
-- create-organization.js a create-organization-from-request.js (jediná
-- dvě místa, co dnes organizations insertují) license_status vůbec
-- nenastavují, spoléhají na sloupcový default. resolveLicenseMode()
-- (lib/licenseMode.js) navíc 'trial' stejně nepovažuje za platný stav
-- (VALID_MODES = active/suspended/pending_approval) a normalizuje ho na
-- 'inactive' — takže změna defaultu na 'pending_approval' chování
-- stávajících cest nemění, jen mění popisek stavu, který se beztak
-- portálově chová jako "není aktivní".
alter table organizations alter column license_status set default 'pending_approval';
