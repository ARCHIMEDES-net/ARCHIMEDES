# Bezpečný onboarding obcí a dalších hlavních zákazníků

## Rozdělení rolí

- `organizations.contact_*` eviduje obchodní nebo provozní kontaktní osobu.
  Tento kontakt automaticky nezískává účet ani oprávnění.
- Lokální správce je samostatně potvrzená osoba s aktivním členstvím
  `organization_admin` v konkrétní organizaci.
- Centrální správci jsou existující platformoví administrátoři. Jejich jména,
  e-maily ani UUID nejsou v aplikaci zapsány napevno.

Admin formulář vyžaduje samostatné jméno a e-mail lokálního správce. Pokud je
kontaktní osoba zároveň správcem, musí to administrátor výslovně potvrdit
zaškrtávacím polem; teprve potom se údaje zkopírují.

## Serverová konfigurace centrálních správců

Pro prostředí, ve kterém se onboarding obcí provádí, je povinná serverová
proměnná:

```text
MUNICIPALITY_CENTRAL_ADMIN_USER_IDS=<auth-uuid-1>,<auth-uuid-2>
```

Aktuální provozní konfigurace má obsahovat schválená Auth UUID centrálních
správců. Do repozitáře se jejich identita ani skutečné hodnoty nezapisují. Při
každém onboardingu server ověří, že každý UUID:

1. existuje v Supabase Auth;
2. má aktivní a e-mailem konzistentní profil;
3. existuje v `platform_admins`.
4. má v `platform_admins` roli `admin` nebo `super_admin`.

Chybějící, neplatná nebo osiřelá konfigurace onboarding zastaví před
databázovou transakcí.

Registrační, aktivační a profilové dokončovací e-maily používají jednotný
serverový provider. Pro každé produkční prostředí jsou povinné:

```text
RESEND_API_KEY=<server-only API klíč>
REGISTRATION_EMAIL_FROM=ARCHIMEDES Live <registrace@ověřená-odesílací-doména>
REGISTRATION_EMAIL_REPLY_TO=<volitelný kontaktní e-mail podpory>
```

Odesílací doména musí být u providera ověřená. Klíč se nikdy neposílá do
prohlížeče. Zbylé SMTP proměnné mohou dočasně zůstat pouze pro nesouvisející
formuláře poptávek; onboarding je nepoužívá.

Pro serverovou automatizaci bez ovládání prohlížeče jsou navíc povinné dvě
citlivé produkční proměnné:

```text
ONBOARDING_AUTOMATION_SECRET=<náhodné tajemství, nejméně 32 znaků>
ONBOARDING_AUTOMATION_ADMIN_USER_ID=<Auth UUID živého platformového správce>
```

Tajemství se nesmí zapisovat do repozitáře, URL, JSON požadavku ani chatu. UUID
aktéra se při každém požadavku znovu ověřuje proti živému Auth účtu, aktivnímu
profilu a roli `admin` nebo `super_admin` v `platform_admins`.

Před nastavením proměnné se oba identifikátory ověří read-only dotazem, do
kterého operátor vloží stejné dvě hodnoty jako do konfigurace:

```sql
with configured(user_id) as (
  values ('<auth-uuid-1>'::uuid), ('<auth-uuid-2>'::uuid)
)
select
  configured.user_id,
  auth_user.email as auth_email,
  profile.email as profile_email,
  profile.is_active,
  platform_admin.user_id is not null as is_platform_admin
from configured
left join auth.users auth_user on auth_user.id = configured.user_id
left join public.profiles profile on profile.id = configured.user_id
left join public.platform_admins platform_admin
  on platform_admin.user_id = configured.user_id;
```

Výsledek musí mít právě dva řádky, shodné neprázdné e-maily, aktivní profily a
`is_platform_admin = true`. Dotaz nic nemění.

## Jednotný proces

1. Platformový správce otevře jeden onboardingový formulář a zkontroluje
   licenci, smlouvu, fakturaci a samostatnou identitu lokálního správce.
2. API ověří platformového správce, rate limit a nakonfigurované centrální
   správce.
3. Existující Auth účet a profil lokálního správce se zachovají. Nový účet
   vznikne pouze tehdy, když neexistuje Auth účet ani profil se stejným
   normalizovaným e-mailem.
4. RPC `onboard_customer_v3` pod zámky znovu ověří duplicity organizace, IČO,
   uživatele a členství. V jedné PostgreSQL transakci připraví profil, všechna
   správcovská členství, licenci a auditní řádek.
5. Nový účet dostane přes aplikační SMTP jedinou zprávu obsahující odkaz pro
   nastavení hesla i onboardingové informace. Existující účet dostane stejný
   typ zprávy s odkazem na přihlášení. Supabase pozvánku samostatně neposíláme.
6. Každý pokus se samostatně zapíše do
   `organization_onboarding_email_attempts` s číslem, vykonavatelem, důvodem a
   vazbou na předchozí pokus. Souhrnný stav je `pending`, `sending`, `sent`,
   bezpečně opakovatelný `failed` nebo ručně ověřovaný `delivery_unknown`.

### Doplnění správce starší aktivní obce

Samostatná obrazovka pro přidání správce k již aktivní obci používá stejnou
přípravu Auth účtu a stejnou aplikační SMTP šablonu. Nepoužívá Supabase
`inviteUserByEmail`. Každý požadavek má UUID idempotency key a vlastní záznam v
`municipality_admin_invitation_attempts`; při nejasném výsledku SMTP se zpráva
automaticky neposílá podruhé. Po klientské zprávě se Zuzaně odešle samostatná
bezpečná kopie s identitou klienta, licencí a platností, ale bez aktivačního
odkazu a tokenu. Tato cesta nemění licenci, smlouvu, fakturaci ani stav obce.

## Provozní rychlá cesta pro každou kartu

Jedna kompletní karta se zpracovává jako jediný celek. Operátor nemá znovu
studovat architekturu ani provádět ruční zakládání po jednotlivých obrazovkách.

1. Z karty připravit normalizovaný návrh: název obce, IČO, registrační číslo,
   kontakt, samostatný lokální správce, jeho pracovní e-mail, licence a seznam
   organizací.
2. Jedním read-only preflightem zkontrolovat shodu podle názvu, IČO, e-mailu,
   Auth účtu, profilu, členství a organizací. U škol kontrolovat i možnou
   existenci bez vazby na obec. Městskou část nezaměnit za samostatné statutární
   město.
3. Výsledek rozdělit na `nové`, `existující beze změny`, `konflikt` a
   `chybějící údaj`. Při konfliktu se nezapisuje nic.
4. Předložit jediný souhrn k finálnímu potvrzení: cílová obec, kontaktní osoba,
   lokální správce, přesný pracovní e-mail, licence a plán změn existujících
   organizací.
5. Po výslovném potvrzení poslat jeden idempotentní požadavek přes serverovou
   automatizaci. Nepoužívat ovládání administrace v prohlížeči jako hlavní
   transport.
6. Za dokončené považovat až stav databázového auditu a e-mailu `sent`.
   `delivery_unknown` se nikdy automaticky neopakuje.

Pro více karet lze preflight provést dávkově, zápis však zůstává samostatně
idempotentní pro každou obec. Finální schválení může být dávkové jen tehdy,
obsahuje-li jednoznačný seznam obcí, správců a cílových e-mailů.

## Serverová automatizace bez prohlížeče

Endpoint `POST /api/admin/automation/activate-municipality` provádí stejný
auditovaný proces jako administrační formulář. Nepřijímá uživatelskou session;
vyžaduje samostatné silné tajemství výhradně v hlavičce `Authorization: Bearer`
a nakonfigurovaného živého platformového správce jako auditního aktéra.

Požadavek má stejné onboardingové parametry jako formulář a navíc povinné pole
`approvalReference` v délce 10–200 znaků. Toto pole odkazuje na konkrétní
finální schválení a zapisuje se do důvodu prvního e-mailového pokusu. Endpoint
neumožňuje ruční uzavírání ani opakování nejednoznačného e-mailového auditu.

Serverová cesta používá tři úzké wrappery s příponou `_service_v1`. Ty jsou
spustitelné pouze rolí `service_role`, ověří živého auditního správce a teprve
potom delegují na existující `onboard_customer_v3` a e-mailové RPC. Běžná cesta
pro přihlášeného platformového správce a její granty se nemění.

Důvěryhodný operátor může schválený JSON provést bez prohlížeče:

```text
node scripts/onboard-municipality.mjs approved-request.json
```

Spouštěcí prostředí musí mít tajemství v
`ONBOARDING_AUTOMATION_SECRET` a buď přesnou
`ONBOARDING_AUTOMATION_URL`, nebo bezpečné `NEXT_PUBLIC_SITE_URL`. Skript
nepřijímá tajemství v souboru ani argumentu, vyžaduje HTTPS, používá časový limit
a vrací strojově čitelný auditní výsledek.

## Izolovaný produkční E2E test

Automatický test používá stejné veřejné objednávkové API, stejné písemné
přijetí a stejný onboarding jako skutečný zákazník. Testovací režim lze
připravit jen platformovým správcem nebo stávající serverovou automatizací a
vyžaduje serverovou proměnnou:

```text
ONBOARDING_E2E_EMAIL_ALLOWLIST=<vyhrazená testovací adresa>
```

Adresa nesmí patřit existujícímu Auth účtu, profilu ani zákazníkovi. Každý běh
má UUID, přesný název `TEST – E2E onboarding <uuid>`, dvouhodinovou expiraci a
stavový audit. Veřejná objednávka se jako test označí pouze tehdy, když UUID,
název, e-mail, stav a expirace přesně odpovídají serverovému záznamu. Parametr
v URL sám testovací oprávnění nevytváří.

Produkční běh se spouští jen z důvěryhodného prostředí:

```text
ONBOARDING_E2E_SITE_URL=https://www.archimedeslive.com \
ONBOARDING_E2E_EMAIL=<vyhrazená testovací adresa> \
npm run test:onboarding:production
```

`ONBOARDING_AUTOMATION_SECRET` se předává pouze proměnnou prostředí. Skript
ověří potvrzení o doručení, stav písemného přijetí `sent`, jediný pokus,
aktivaci a onboardingový e-mail `sent`. V bloku `finally` vždy spustí cleanup.

Cleanup nejprve ověří `is_test`, `test_run_id`, přesný název a allowlistovaný
e-mail. Pokud testovací správce patří do jiné organizace, úklid se zastaví.
Databázová část odstraní pouze ID navázaná na běh a Auth účet maže samostatně
přes Supabase Admin API. Při chybě Auth mazání zůstane stav `cleanup_pending`,
takže lze bezpečně zopakovat pouze nedokončenou část. Skutečný zákazník bez
`is_test = true` nemůže být tímto postupem odstraněn.

## Schválená struktura zprávy

Zpráva má předmět „ARCHIMEDES Live – přístup správce pro [organizace]“ a
obsahuje roli lokálního správce, variantu a platnost licence, registrační číslo
obce, jediný odkaz pro nastavení hesla nebo přihlášení a odkaz na další správu
organizace. Neobsahuje interní technické formulace ani další samostatnou
pozvánku. Při neočekávaném přijetí vyzývá příjemce, aby odkaz nepoužil.

## Idempotence, rollback a e-mail

- Formulář vytváří UUID `idempotencyKey`. Stejný požadavek lze bezpečně
  zopakovat; RPC vrátí existující auditní běh. Stejný klíč s jiným správcem,
  sadou centrálních správců nebo licenčními parametry je odmítnut jako konflikt.
- Úspěšný onboarding je zároveň unikátní pro `organization_id`, takže nový
  transportní klíč nevytvoří další členství ani další aktivaci.
- Databázová chyba vrátí zpět profil, členství, licenci i auditní řádek.
- Pokud byl před chybou vytvořen nový Auth účet, API odstraní pouze tento nový
  účet a výsledek kompenzace kontroluje. Existující Auth účet se nemaže ani se
  mu nemění e-mail nebo heslo.
- Před vytvořením Auth účtu vzniká auditní příprava. Nový Auth účet nese pouze
  serverová metadata s onboardingovým klíčem a organizací. Po pádu mezi
  `generateLink` a databázovým RPC lze převzít jen účet se shodným klíčem a
  organizací; cizí osiřelý účet zůstane blokující a nikdy se automaticky nemaže.
- E-mail nelze zahrnout do PostgreSQL transakce. Posílá se proto až po commitu.
  Každé odeslání má stabilní providerový `Idempotency-Key`; přijatá zpráva se
  uloží s providerovým `messageId`. Chyba před odesláním se uloží jako `failed`.
  Timeout nebo nejasný výsledek se konzervativně uloží jako `delivery_unknown`
  a automaticky se neopakuje.
- Před odesláním databázové RPC pod řádkovým zámkem vytvoří právě jeden pokus
  `sending`; unikátní částečný index a zámek brání dvojkliku a souběžnému
  odeslání.
- Klientská zpráva a bezpečná kopie Zuzaně jsou dvě oddělená providerová
  odeslání s různými idempotentními klíči. Kopie nikdy neobsahuje aktivační,
  recovery ani osobní profilový odkaz. Selhání kopie nezmění úspěšně přijatou
  klientskou zprávu na nedoručenou a vede k ruční kontrole kopie.
- `sending` starší než 15 minut se při načtení auditu převede na
  `delivery_unknown`, nikdy se automaticky znovu neodešle.
- `failed` lze po reloadu bezpečně opakovat z auditního panelu. U
  `delivery_unknown` musí správce uvést důvod a buď stav uzavřít bez dalšího
  odeslání, nebo potvrdit nedoručení a vytvořit navazující pokus. Obě volby
  zapisují vykonavatele a čas.
- Pokud audit už eviduje `sent`, idempotentní opakování další e-mail neodešle.

## Matice skutečných volajících a oprávnění

Serverový `supabaseAdmin` vzniká ze `SUPABASE_SERVICE_ROLE_KEY`, a proto volá
Data API jako `service_role`. `authenticatedClient` vzniká z anon klíče, ale
vždy nese `Authorization: Bearer <uživatelský JWT>`; PostgREST proto použije
roli `authenticated`. Prohlížečový klient v `lib/supabaseClient.js` rovněž
používá anon klíč, ale uvedené portálové RPC je dostupné až s přihlášenou
session, tedy jako `authenticated`.

| Objekt | Operace | Konkrétní volající | Supabase klient | Skutečná DB role / výsledný grant |
| --- | --- | --- | --- | --- |
| `organization_onboarding_runs` | `SELECT` | `loadEmailState()` a kontrola `previousOnboarding` v `pages/api/admin/activate-municipality.js` | `supabaseAdmin` | `service_role`: povoleno |
| `organization_onboarding_runs` | `INSERT`, `UPDATE` | `onboard_customer_v3()` a e-mailová RPC uvnitř PostgreSQL | žádný Data API klient; tělo `SECURITY DEFINER` | volající je `authenticated`, zápis probíhá jako vlastník funkce; tabulkový grant volajícímu není udělen |
| `organization_onboarding_runs` | `DELETE` | žádný | žádný | nikomu z `PUBLIC`, `anon`, `authenticated`, `service_role` |
| `organization_onboarding_email_attempts` | `SELECT` | `loadEmailState()` v `pages/api/admin/activate-municipality.js` | `supabaseAdmin` | `service_role`: povoleno |
| `organization_onboarding_email_attempts` | `INSERT`, stavové `UPDATE` | `claim_onboarding_email_attempt()`, `complete_onboarding_email_attempt()`, `mark_stale_onboarding_email_attempt()`, `resolve_onboarding_email_without_resend()` | žádný Data API klient; tělo `SECURITY DEFINER` | volající je `authenticated`, zápis probíhá jako vlastník funkce; tabulkový grant volajícímu není udělen |
| `organization_onboarding_email_attempts` | `UPDATE` pouze providerových potvrzení | `deliverOnboardingEmail()` po přijetí zprávy providerem | `supabaseAdmin` | `service_role`: sloupcově omezeno na `email_provider`, obě providerová ID a čas bezpečné kopie |
| `organization_onboarding_email_attempts` | `DELETE` | žádný | žádný | nikomu z `PUBLIC`, `anon`, `authenticated`, `service_role` |
| `organization_onboarding_auth_preparations` | `SELECT` | `loadAuthPreparation()` a návratové `.select()` v `lib/server/customerOnboarding.js` | `supabaseAdmin` | `service_role`: povoleno |
| `organization_onboarding_auth_preparations` | `INSERT` | `claimAuthPreparation()` a obnova účtu podle Auth metadata v `resolveLocalAdministrator()` | `supabaseAdmin` | `service_role`: povoleno |
| `organization_onboarding_auth_preparations` | `UPDATE` | `claimAuthPreparation()`, `updateAuthPreparationStatus()` a auditovaná obnova v `resolveLocalAdministrator()` | `supabaseAdmin` | `service_role`: povoleno |
| `organization_onboarding_auth_preparations` | `DELETE` | žádný | žádný | nikomu z `PUBLIC`, `anon`, `authenticated`, `service_role` |
| `municipality_admin_invitation_attempts` | `SELECT`, `INSERT`, `UPDATE` | `pages/api/admin/invite-municipality-admin.js` | `supabaseAdmin` | pouze `service_role` |
| `municipality_admin_invitation_attempts` | `DELETE` | žádný | žádný | nikomu z `PUBLIC`, `anon`, `authenticated`, `service_role` |
| `onboard_customer_v3(...)` | `EXECUTE` | `handler()` v `pages/api/admin/activate-municipality.js` | `authenticatedClient` | pouze `authenticated` |
| `claim_onboarding_email_attempt(...)` | `EXECUTE` | `deliverOnboardingEmail()` ve stejném API souboru; první pokus, `failed` retry i potvrzené nedoručení | `authenticatedClient` | pouze `authenticated` |
| `complete_onboarding_email_attempt(...)` | `EXECUTE` | `completeEmailAttempt()` ve stejném API souboru; výsledky `sent`, `failed`, `delivery_unknown` | `authenticatedClient` | pouze `authenticated` |
| `mark_stale_onboarding_email_attempt(...)` | `EXECUTE` | `handler()` při `GET` auditu ve stejném API souboru; převzetí starého `sending` | `authenticatedClient` | pouze `authenticated` |
| `resolve_onboarding_email_without_resend(...)` | `EXECUTE` | `handler()` pro akci `resolve_without_resend` ve stejném API souboru | `authenticatedClient` | pouze `authenticated` |
| `onboard_customer_service_v1(...)` | `EXECUTE` | serverová automatizační cesta po ověření silného Bearer tajemství a živého auditního správce | `supabaseAdmin` | pouze `service_role`; deleguje na `onboard_customer_v3(...)` |
| `claim_onboarding_email_attempt_service_v1(...)` | `EXECUTE` | první e-mailový pokus serverové automatizace | `supabaseAdmin` | pouze `service_role`; deleguje na auditované e-mailové RPC |
| `complete_onboarding_email_attempt_service_v1(...)` | `EXECUTE` | dokončení prvního e-mailového pokusu serverové automatizace | `supabaseAdmin` | pouze `service_role`; deleguje na auditované e-mailové RPC |

Žádná z auditních tabulek nemá policy ani tabulkový grant pro `PUBLIC`, `anon`
nebo `authenticated`. `service_role` nemá na těchto tabulkách `DELETE`,
`TRUNCATE`, `REFERENCES` ani `TRIGGER`. Tabulky používají UUID generovaná
`gen_random_uuid()`, nikoli sekvence nebo identity, takže není potřeba žádný
sekvenční grant.

Migrace u tří existujících funkcí zachovává produkčního vlastníka `postgres`,
signatury, návratové typy, `STABLE SECURITY DEFINER`, prázdný `search_path` a
produkční ACL: `EXECUTE` pro `authenticated` a `service_role`, bez přístupu pro
`PUBLIC` a `anon`. `is_platform_admin()` zpřísňuje živou identitu. Obě portálová
RPC měla v produkci vlastní lookup pouze v `platform_admins`, takže jejich
platform-admin větev nyní deleguje na společný helper; členská větev a všechny
datové filtry zůstávají stejné. ACL se v migraci těchto tří funkcí vůbec nemění.

Serverové auditní API nejprve volá `requirePlatformAdmin()` a teprve potom čte
audit přes `service_role`. Do klienta serializuje pouze e-mail a jméno lokálního
správce, veřejný stav, počet pokusů, důvody, časy a číselnou návaznost pokusů.
Nevrací interní UUID běhu, organizace, uživatelů nebo pokusů, UUID aktérů,
interní chybové kódy ani licenční snapshot používaný jen serverem.

## Kontroly před nasazením

1. Spustit read-only report duplicit profilových e-mailů, IČO, názvu + adresy
   a členství; zjištěné konflikty ručně vyřešit, nemazat ani neslučovat
   automaticky.
2. Nastavit oba centrální Auth UUID ve všech cílových prostředích a ověřit
   jejich `platform_admins` i profily.
3. Upravit a schválit jednu českou onboardingovou šablonu; tato implementace
   odesílá text přes aplikační SMTP a používá jednorázový Supabase odkaz.
4. Migraci nejprve přehrát v prázdné lokální databázi nebo izolované Supabase
   větvi a provést transakční test zakončený rollbackem. Repozitář obsahuje
   embedded PostgreSQL integrační test, který migraci skutečně spustí a ověří
   úspěch, idempotentní replay, změněný replay, duplicitní IČO a rollback po
   vynucené chybě auditního zápisu; izolovaná Supabase větev ještě ověří shodu
   s úplným cílovým schématem a rozšířeními.
5. Ověřit nový i existující účet, konflikt IČO, konflikt členství, souběžné
   opakování stejného klíče, selhání SMTP a kompenzační odstranění nového Auth
   účtu.
6. Teprve poté samostatně schválit migraci, aplikaci a produkční konfiguraci.
7. Automatizační tajemství nastavit pouze v cílovém serverovém a důvěryhodném
   spouštěcím prostředí. Ověřit, že chybějící nebo chybné tajemství vrací
   `401/503` a nevytváří Auth účet, databázový běh ani e-mailový pokus.

Pořadí budoucího nasazení je: read-only preflight a schválení orphanů;
izolovaný test migrace; databázová migrace; ověření nových tabulek/RPC a grantů;
nastavení serverových proměnných; aplikace; smoke test s testovací schránkou.
Nasazení aplikace před migrací není kompatibilní.

Aktualizace Next.js, PostCSS, nanoid a brace-expansion nejsou součástí tohoto
onboardingu. Mají být řešeny v samostatném dependency PR s vlastním buildem,
regresní sadou a kontrolou advisories.

Žádný krok v tomto dokumentu neopravňuje k zápisu do produkční databáze,
odeslání skutečného e-mailu ani deploymentu.

## Ověřený provozní stav 14. srpna 2026

- Produkční onboarding v3 a serverová automatizační cesta jsou nasazené.
- V auditu jsou čtyři dokončené onboardingy se stavem e-mailu `sent`:
  Albrechtičky, Bučovice, Louny a Ostrava – Radvanice a Bartovice.
- Všech osm obecních organizací bylo při read-only kontrole aktivních, mělo
  vyplněné registrační, kontaktní a licenční údaje a oba centrální správce.
- Nebyly nalezeny duplicitní názvy organizací, IČO, profilové e-maily, členství
  ani dvojice název školy + město.
- Otevřené historické datové nálezy nejsou oprávněním k automatické změně;
  souhrn a rozhodovací body jsou v
  `docs/PRODUCTION-AUDIT-2026-08-14.md`.
