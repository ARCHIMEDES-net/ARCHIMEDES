# Stav migrací ARCHIMEDES Live

Zdroj pravdy: živý projekt `ARCHIMEDESLive` (`gipikahmjlcynkqexxmz`) a
aktuální pracovní větev. Produkční databáze se nemění pouhým přidáním
souborů do tohoto adresáře.

## V produkci potvrzeno

- `0001` – hierarchie organizací a registrační číslo
- `0002` – číselník činností a osobní preference
- bezpečnost `user_interests` / `announcements`
- registrace obce a spolku
- `0004` – uzamčení backup tabulek
- `0005` – kontrola duplicit obce
- `0006` – sekce číselníku zájmů
- `0007` – Dobrá praxe; v repozitáři rekonstruováno ze
  `schema_migrations.statements`, v produkci již aplikováno
- `0008_protect_organization_registration_codes.sql`
  - v produkci aplikováno jako verze `20260715201159`
  - bezpečné RPC `get_my_organizations`
  - efektivní licence školy/spolku se čte z rodičovské obce
  - kódy vidí jen správce organizace nebo platformový admin
  - přímý klientský SELECT celé tabulky `organizations` je omezen na
    platformové adminy
- `0009_remove_demo_membership_role.sql`
  - v produkci aplikováno jako verze `20260715201218`
  - před změnou se zastaví, pokud existuje jakékoli demo členství
  - odstraní staré překrývající se CHECK constrainty s `demo_viewer`
  - povolí už jen role `organization_admin` a `member`
- `0010_atomic_municipality_activation.sql`
  - v produkci aplikováno jako verze `20260715201241`
  - profil, členství správce a stav obce mění v jedné DB transakci
  - kontroluje platformového admina uvnitř `SECURITY DEFINER` funkce
  - existující Auth účet, UUID a heslo nijak nemění

- `0014_municipality_onboarding.sql`
  - v produkci transakčně aplikováno 22. 7. 2026;
  - před aplikací potvrzen aktuální šifrovaný a obnovou prověřený bod obnovy;
  - po aplikaci read-only ověřeno všech 11 nových sloupců, 4 omezení,
    obě tabulky, RLS, obě funkce a přístupová práva;
  - kontrola proběhla v transakci `READ ONLY` zakončené `ROLLBACK`;
  - obchodní metadata licence, přesná platnost a audit aktivace;
  - samostatné ověření nároku obce s učebnou na 12 měsíců zdarma;
  - jednorázové hashované pozvánky školy/spolku pod obec;
  - databázový rate limit veřejné objednávky a registrací;
  - nová aktivační funkce `activate_customer_with_admin_v2`.
- `0015_fix_activation_variable_conflict.sql`
  - v produkci transakčně aplikováno a ověřeno 22. 7. 2026;
  - opravuje nejednoznačný odkaz `organization_id` ve funkci
    `activate_customer_with_admin_v2`;
  - před a po aplikaci se shodovaly souhrnné počty organizací, členství,
    profilů a objednávek;
  - testovací obec zůstala neaktivní a připravená k opakování aktivace.
- `20260729184710_retire_legacy_lead_make_webhook.sql`
  - v produkci aplikováno 29. 7. 2026 po úspěšném CI a Vercel deploymentu;
  - odstraněn pouze trigger `public.leads.new_lead_notification`;
  - tabulka `leads`, RLS, všech 33 existujících záznamů, 13 sloupců,
    spravovaná funkce `supabase_functions.http_request` i auditní historie
    webhooku zůstaly beze změny.
- Databázové objekty pozvánek z `0014` zůstávají kvůli auditní historii,
  ale aplikační vytváření a spotřebování pozvánek je od srpna 2026 vyřazeno.
  Nové školy a spolky zakládá pouze centrální tým ARCHIMEDES; obecní správce
  může už jen zobrazit a zrušit zbývající starší pozvánky.

## Stav nasazení

### Produkční baseline

- Aktivní řetězec začíná schema-only baseline migrací
  `20260730080347_production_public_schema_baseline.sql`.
- Po baseline následuje
  `20260730123543_reapply_storage_authorization.sql`, která zachovává aplikační
  Storage politiky a limity bucketů mimo schéma `public`.
- Dosavadních 22 neúplných historických souborů je zachováno v
  `supabase/migration_history/pre_baseline_2026-07-30` a není součástí
  aktivního replaye.
- GitHub Actions run
  [`30543283033`](https://github.com/ARCHIMEDES-net/ARCHIMEDES/actions/runs/30543283033)
  vytvořil čistou lokální Supabase databázi, přehrál celý aktivní řetězec a
  potvrdil nulový byte-for-byte schema diff vůči novému read-only produkčnímu
  exportu.
- Oba schema-only dumpy mají SHA-256
  `5e9c54c4cf69fd46ccd36a94b4d8846461bb909faffdb5c11c9df3a40ad93da3`.
- Produkční migration ledger nebyl změněn. Jeho řízené srovnání zůstává
  samostatným krokem podle issue #81 a vyžaduje výslovné schválení.

1. Předmigrační `supabase/preflight/legacy_migration_readiness.sql` byl
   spuštěn read-only a jeho výstup zkontrolován.
2. Databázové migrace `0008`, `0009` a `0010` byly aplikovány v tomto
   pořadí a po každé byly ověřeny vzniklé objekty.
3. Preflight byl po migracích zopakován; počty organizací, členství a
   příjemců zůstaly beze změny.
4. Migrace `0014` byla po potvrzení bodu obnovy aplikována v jediné
   transakci a následně samostatně ověřena read-only kontrolou.
5. Aplikační PR č. 39 zůstává nesloučený; před jeho nasazením následuje
   řízený test onboardingu a negativních scénářů.

## Neměnné migrační podmínky

- nemažou se ani znovu nevytvářejí Auth účty;
- zachovávají se UUID, e-maily a hesla všech existujících uživatelů;
- zachovává se všech 10 vazeb `orders_start.organization_id`;
- zůstává interní `Testovací škola ARCHIMEDES`, UUID
  `339612be-8577-4cce-8ef4-e77a4bc0b442`, `is_system = true`;
- Louny, Ostrava a Luže jsou obchodně potvrzené platící školy;
- placená/darovaná licence není runtime oprávnění a nesmí rozdělit uživatele;
- žádná preference zájmu nevytváří členství v organizaci;
- veřejný kód spolku nezakládá další osobní účty; správce spolku upravuje
  vlastní preference až ve svém přihlášeném profilu;
- samostatné připojení člena k organizaci zůstává výjimkou pouze pro učitele
  školy přes školní kód;
- nový uživatel se nemůže sám označit jako `individual`; existující legacy
  individuální profily se tím nemažou ani nemění;
- při více aktivních členstvích se organizace nikdy nevybírá náhodně;
- původní `/welcome` není produktový onboarding; pouze přesměruje na
  servisní `/nastaveni-pristupu` pro volbu organizace nebo řešení účtu bez
  členství;
- školní návod a školní kód se v portálu zobrazují jen správci školy, nikdy
  správci obce nebo spolku;
- Google Meet URL je odkaz pro živé vysílání, nikdy archivní záznam;
- ze starého `events.stream_url` lze do archivu převzít jen prokazatelný
  YouTube odkaz; ostatní záznamy se doplní ručně do `recording_url`;
- nový `broadcast_sessions.recording_url` se uživatelům ukáže až se stavem
  `recording_status = 'published'`;
- demo se neobnovuje.

Ruční přiřazení škol pod obce přijde až po schválení konkrétní mapy
`škola -> obec`. Bez této mapy se `parent_organization_id` hromadně nemění.

Před ručním převodem starých archivů se spustí pouze read-only report
`supabase/preflight/archive_recording_classification.sql`. Report nic
nepřepisuje; rozděluje odkazy na skutečné YouTube záznamy, Meet odkazy,
jiné odkazy k posouzení a chybějící záznamy.

## Produkční izolace organizací 2026-08-09

- PR #138 byl sloučen do `main` jako commit
  `e3fb8c52a7f22f91ca97ca249160fac5280c004f`.
- Migrace obnovující přímou tenant izolaci byla aplikována do projektu
  `gipikahmjlcynkqexxmz` přes Supabase migration API jako verze
  `20260809102826` a název
  `restore_direct_organization_isolation_20260809100250`.
- Soubor v aktivním migračním řetězci používá stejnou produkční verzi a název;
  původní timestamp `20260809100250` zůstává v názvu jako auditní vazba na
  testovaný SQL soubor z PR #138.
- Před a po aplikaci zůstaly beze změny souhrnné počty: 14 organizací,
  59 členství a 85 profilů. Migrace neprovedla žádný přepis aplikačních dat.
- Read-only kontrola potvrdila přímá oprávnění bez děděného přístupu správce
  obce do dítěte, prázdný `search_path` a odebrané `EXECUTE` pro `PUBLIC`
  a `anon` u všech tří nahrazených funkcí.

## Atomická změna stavu členství 2026-08-09

- PR #140 byl sloučen do `main` jako commit
  `5d6a902aa1f5a4ba1fc35a372422044a87793dbd` a uzavřel issue #116.
- Migrace byla aplikována do projektu `gipikahmjlcynkqexxmz` přes Supabase
  migration API jako verze `20260809104931` a název
  `fix_116_atomic_membership_status_20260809103704`.
- Soubor v aktivním migračním řetězci používá stejnou produkční verzi a název;
  původní timestamp `20260809103704` zůstává v názvu jako auditní vazba na
  testovaný SQL soubor z PR #140.
- Před a po aplikaci zůstaly beze změny souhrnné počty: 14 organizací,
  59 členství a 85 profilů. Migrace neprovedla žádný přepis aplikačních dat.
- Read-only kontrola potvrdila prázdný `search_path`, `EXECUTE` pouze pro
  `authenticated`, odebrané přímé `UPDATE` pro `authenticated` a zachované
  přímé `UPDATE` pro důvěryhodný `service_role`.

## Ochrana neveřejných URL událostí 2026-08-09

- PR #142 byl sloučen do `main` jako commit
  `0f33b70bfaeceb95c70f41cc145e35bd19cef4a2` a uzavřel issue #118.
- Migrace byla aplikována do projektu `gipikahmjlcynkqexxmz` přes Supabase
  migration API jako verze `20260809110727` a název
  `protect_public_event_urls_20260809105645`.
- Soubor v aktivním migračním řetězci používá stejnou produkční verzi a název;
  původní timestamp `20260809105645` zůstává v názvu jako auditní vazba na
  testovaný SQL soubor z PR #142.
- Před a po aplikaci zůstalo beze změny 31 událostí, z toho 28 publikovaných,
  i agregované počty všech URL polí. Migrace nepřepisovala aplikační data.
- Veřejný program používá úzké `SECURITY INVOKER` RPC a anonymní role má na
  tabulce `events` pouze sloupcový `SELECT` osmi veřejných polí. Produkční
  negativní test potvrdil odmítnutí `stream_url`, `SELECT *` i všech zápisů;
  Security a Performance Advisor nemají pro novou funkci žádné zjištění.

## Centrální zakládání organizací pod obcí 2026-08-09

- PR #146 byl sloučen do `main` jako commit
  `99db328e4e5b5344ffd185a65b23d1d700455aa1` a uzavřel issue #145.
- Migrace byla aplikována do projektu `gipikahmjlcynkqexxmz` přes Supabase
  migration API jako verze `20260809114658` a název
  `create_municipality_child_organization_20260809114000`.
- Soubor v aktivním migračním řetězci používá stejnou produkční verzi a název;
  původní timestamp `20260809114000` zůstává v názvu jako auditní vazba na
  SQL otestované v datově prázdné vývojové větvi.
- Před a po aplikaci zůstaly beze změny souhrnné počty: 14 organizací,
  2 organizace s rodičem, 59 členství, 85 profilů a 0 vazeb činností.
  Migrace nepřepisovala aplikační data.
- Produkční kontrola potvrdila `SECURITY INVOKER`, prázdný `search_path`,
  `EXECUTE` pouze pro `authenticated` a nulová nová zjištění Security i
  Performance Advisoru pro novou RPC.

## Expirace zděděné licence dítěte 2026-08-09

- PR #148 byl sloučen do `main` jako commit
  `1a5526aa6e0cf69dde1f4dfb58060e81fa910738` a uzavřel issue #120.
- Migrace byla aplikována do projektu `gipikahmjlcynkqexxmz` přes Supabase
  migration API jako verze `20260809120503` a název
  `require_explicit_child_license_plan_20260809115500`.
- Soubor v aktivním migračním řetězci používá stejnou produkční verzi a název;
  původní timestamp `20260809115500` zůstává v názvu jako auditní vazba na
  SQL otestované v datově prázdné vývojové větvi.
- Dítě bez vlastního `license_plan` používá pouze platnou licenci nadřazené
  obce. Dítě s explicitním plánem zůstává samostatně licencované a organizace
  bez rodiče zachovávají dosavadní licenční chování.
- Před a po aplikaci zůstaly beze změny souhrnné počty: 14 organizací,
  2 organizace s rodičem, 59 členství a 85 profilů. V okamžiku nasazení měly
  obě rodičovské obce platnou licenci, takže žádné dítě neztratilo přístup.
- Produkční kontrola potvrdila stejnou podmínku v seznamu organizací, účasti,
  vysílání, archivu i členském přístupu, prázdný `search_path` všech čtyř RPC
  a odebrané `EXECUTE` pro `anon`. Celkové počty Advisor nálezů zůstaly beze
  změny: 31 bezpečnostních a 110 výkonových historických zjištění.
