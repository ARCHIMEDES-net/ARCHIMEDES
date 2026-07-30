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

## Cíl

Vytvořit reprodukovatelný baseline snapshot schématu, ze kterého lze založit čistou databázi a následně bezpečně přehrát všechny pozdější migrace.

Baseline nesmí obsahovat uživatelská ani provozní data.

## Povinný postup

1. Zastavit slučování nových databázových migrací.
2. Ověřit obnovitelný produkční backup.
3. Exportovat schema-only dump podporovaným nástrojem Supabase CLI / `pg_dump`.
4. Exportovat minimálně schémata potřebná pro aplikaci a její vazby; systémová schémata Supabase nereplikovat ručně, pokud je vytváří nový Supabase projekt automaticky.
5. Odstranit z dumpu vlastníky, session-specific nastavení a nedeterministické příkazy.
6. Uložit baseline jako první timestamp migraci v samostatné větvi.
7. Označit dosavadní historické migrace tak, aby se na čisté databázi nespouštěly před baseline.
8. Vytvořit novou Supabase development branch.
9. Ověřit, že celý migrační řetězec projde od prázdné databáze.
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
- nepouštět současné migrace proti čisté produkční kopii bez baseline;
- neprovádět `db push` proti produkci;
- neměnit produkční ledger ručními SQL příkazy;
- nemíchat baseline a nové aplikační změny do jednoho PR;
- neslučovat PR #94 před nasazením a ověřením jeho RPC.

## Akceptační kritéria

Baseline je hotový pouze tehdy, když:

- čistá development branch vznikne bez chyby;
- všechny migrace projdou;
- `npm run check:migrations` projde;
- výsledný schema diff proti produkci je prázdný nebo plně zdokumentovaný;
- bezpečnostní testy, lint a produkční build projdou;
- issue #81 obsahuje export ledgeru, mapovací tabulku a výsledky dry-runu.
