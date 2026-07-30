# Runbook: srovnání produkčního migračního ledgeru

Tento postup řeší issue #81. Nemění aplikační data ani databázové schéma.
Je určený pouze pro řízené srovnání historie v `supabase_migrations.schema_migrations`
se soubory v `supabase/migrations`.

## Zákazy

- Nespouštět `supabase db push` proti produkci před dokončením dry-runu.
- Nepřejmenovávat již aplikované SQL soubory bez mapy jejich produkčních verzí.
- Nespouštět již aplikované SQL znovu jen proto, že verze v ledgeru nesouhlasí.
- Neměnit ledger ručním `insert`, `update` nebo `delete`.

## 1. Příprava údržbového okna

1. Zastavit všechny databázové deploymenty a slučování migračních PR.
2. Potvrdit aktuální obnovitelný bod a ověřit, že je možné vytvořit samostatnou obnovenou kopii.
3. Zaznamenat aktuální commit `main`, Supabase project ref a čas zahájení.

## 2. Zachycení zdrojů pravdy

Uložit jako auditní přílohy:

```bash
supabase migration list --linked
supabase db dump --linked --schema public --file production-schema.sql
find supabase/migrations -maxdepth 1 -type f -name '*.sql' | sort
npm run check:migrations
```

Dále read-only zachytit:

```sql
select version, name, statements
from supabase_migrations.schema_migrations
order by version;
```

Pokud produkční struktura tabulky nemá všechny uvedené sloupce, použít pouze existující
sloupce a tuto odchylku poznamenat.

## 3. Mapovací tabulka

Pro každý soubor v repozitáři vytvořit jeden řádek:

| Repository file | Repository version | Production ledger version | Applied change evidence | Action |
|---|---:|---:|---|---|
| příklad | 20260729141756 | 20260729151452 | shodný SQL / objekty / audit | repair only |

Povolené hodnoty `Action`:

- `none` – verze i změna souhlasí;
- `repair only` – změna je již v produkci, upravuje se jen historie podporovaným nástrojem;
- `pending migration` – změna v produkci není a musí projít samostatným deploymentem;
- `investigate` – důkaz není dostatečný, žádný zásah se neprovádí.

## 4. Dry-run na obnovené kopii

1. Obnovit produkční backup do odděleného Supabase projektu nebo izolované PostgreSQL kopie.
2. Propojit lokální CLI pouze s touto kopií.
3. Aplikovat zamýšlené příkazy `supabase migration repair`.
4. Spustit:

```bash
supabase migration list --linked
supabase db push --linked --dry-run
```

5. Dry-run musí skončit bez návrhu opakovat již aplikované změny.
6. Porovnat schema-only dump před a po opravě. Očekávaný rozdíl databázového schématu je nula.
7. Spustit aplikační testy a read-only bezpečnostní kontroly.

## 5. Produkční oprava

Produkční oprava je povolena pouze tehdy, když:

- existuje ověřený bod obnovy;
- mapovací tabulka nemá žádný řádek `investigate`;
- dry-run na obnovené kopii prošel;
- schema diff po opravě je prázdný;
- je schválen přesný seznam příkazů a očekávaný ledger po opravě.

Použít pouze Supabase-supported `migration repair/history` tooling. Po každém kroku znovu
spustit `supabase migration list --linked` a porovnat výsledek s mapovací tabulkou.

## 6. Ověření a uzavření

1. Ověřit, že produkční schema diff zůstal nulový.
2. Ověřit RLS, funkce a kritické počty read-only dotazy.
3. Aktualizovat `supabase/MIGRATION_STATUS.md` o finální mapu a datum opravy.
4. Přiložit auditní výstupy do issue #81.
5. Teprve potom povolit nové migrační PR a odblokovat závislé PR.
