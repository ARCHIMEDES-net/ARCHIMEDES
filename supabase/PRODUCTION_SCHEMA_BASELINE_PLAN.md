# Plán vytvoření baseline produkčního schématu

Tento dokument navazuje na issue #81. Produkční databáze je zdrojem pravdy pro aktuální schéma, ale repozitář neobsahuje úplnou počáteční migraci.

## Ověřený stav

Pokus o vytvoření čisté Supabase development branch selhal na první repozitářové migraci:

```text
relation "public.organizations" does not exist
```

První migrace tedy předpokládá již existující aplikační schéma. Aktuální produkční inventář obsahuje:

- 44 tabulek ve schématu `public`;
- 1 view;
- 1 sekvenci;
- 27 funkcí;
- 94 RLS politik;
- 9 aplikačních triggerů.

## Výsledek implementace 2026-07-30

Baseline je uložená jako první aktivní migrace
`20260730080347_production_public_schema_baseline.sql`. Následuje samostatná
migrace `20260730123543_reapply_storage_authorization.sql`, protože aplikační
Storage politiky a konfigurace bucketů leží mimo schéma `public`. Původních 22
souborů zůstává beze změny v
`supabase/migration_history/pre_baseline_2026-07-30` jako auditní historie a na
čisté databázi se již přímo nespouští.

Ručně spuštěný GitHub Actions běh
[`30543283033`](https://github.com/ARCHIMEDES-net/ARCHIMEDES/actions/runs/30543283033)
ověřil následující postup:

1. nový schema-only dump produkčního `public` schématu;
2. vytvoření čistého lokálního Supabase stacku;
3. přehrání všech aktivních migrací od začátku do konce;
4. nový schema-only dump lokální databáze;
5. byte-for-byte porovnání obou dumpů.

Oba soubory mají SHA-256
`5e9c54c4cf69fd46ccd36a94b4d8846461bb909faffdb5c11c9df3a40ad93da3`
a výsledný `schema.diff` má 0 bajtů.

První úplný replay odhalil čtyři nadbytečná výchozí oprávnění
`REFERENCES`, `TRIGGER`, `TRUNCATE` a `MAINTAIN` pro role `anon` a
`authenticated` na tabulkách `api_rate_limits` a
`municipality_organization_invites`. Produkce je nemá. Baseline proto obsahuje
explicitní `REVOKE ALL` pro tyto dvě role a tabulky; opakovaný replay potvrdil
nulový rozdíl.

Produkční databáze byla při všech krocích pouze čtena. Nebyl spuštěn
`db push`, změna ledgeru ani jiný zápis do produkce.

## Cíl

Vytvořit reprodukovatelný baseline snapshot schématu, ze kterého lze založit čistou databázi a následně bezpečně přehrát všechny pozdější migrace.

Baseline nesmí obsahovat uživatelská ani provozní data.

## Povinný postup

1. Zastavit slučování nových databázových migrací.
2. Ověřit obnovitelný produkční backup.
3. Ručně spustit workflow `Supabase backup and recovery test` na pracovní
   větvi s volbou `operation=schema-export`. Workflow použije existující
   chráněný secret `SUPABASE_DB_URL` a vytvoří jednodenní schema-only artefakt.
4. Exportovat minimálně schémata potřebná pro aplikaci a její vazby; systémová schémata Supabase nereplikovat ručně, pokud je vytváří nový Supabase projekt automaticky.
5. Zachovat kompatibilní prolog a vlastníky vestavěných Supabase rolí tam, kde
   určují přesnou bezpečnostní paritu, a odstranit případné nedeterministické
   nebo prostředí odhalující příkazy.
6. Uložit baseline jako první timestamp migraci v samostatné větvi.
7. Označit dosavadní historické migrace tak, aby se na čisté databázi nespouštěly před baseline.
8. Vytvořit nový izolovaný Supabase stack nebo development branch.
9. Ověřit, že celý migrační řetězec projde od čisté databáze.
10. Porovnat výsledné schéma s produkčním schema-only dumpem.
11. Rozdíl musí být vysvětlený řádek po řádku; nejasné rozdíly blokují merge.
12. Teprve potom provést řízenou opravu produkčního migration ledgeru podporovaným `supabase migration repair`.

## Co baseline musí zachytit

- tabulky, sloupce, typy, výchozí hodnoty a identity;
- primární, unikátní, cizí a check constraints;
- indexy;
- view;
- sekvence;
- funkce včetně `SECURITY DEFINER`, volatility a `search_path`;
- triggery;
- RLS enable/force stav;
- RLS politiky a jejich role;
- potřebná grants/revokes;
- závislosti na rozšířeních používaných aplikačním schématem.

## Co se nesmí udělat

- nevytvářet baseline ručním opisem pouze části schématu;
- nepouštět schema export automaticky při `push` události z pracovní větve;
- nepouštět současné migrace proti čisté produkční kopii bez baseline;
- neprovádět `db push` proti produkci;
- neměnit produkční ledger ručními SQL příkazy;
- nemíchat baseline a nové aplikační změny do jednoho PR;
- neslučovat PR #94 před nasazením a ověřením jeho RPC.

## Akceptační kritéria

Baseline je hotový pouze tehdy, když:

- čistý izolovaný Supabase stack nebo development branch vznikne bez chyby;
- všechny migrace projdou;
- `npm run check:migrations` projde;
- výsledný schema diff proti produkci je prázdný nebo plně zdokumentovaný;
- bezpečnostní testy, lint a produkční build projdou;
- issue #81 obsahuje export ledgeru, mapovací tabulku a výsledky dry-runu.
