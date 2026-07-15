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

## Připraveno, dosud neaplikováno

- `0008_protect_organization_registration_codes.sql`
  - bezpečné RPC `get_my_organizations`
  - efektivní licence školy/spolku se čte z rodičovské obce
  - kódy vidí jen správce organizace nebo platformový admin
  - přímý klientský SELECT celé tabulky `organizations` je omezen na
    platformové adminy
- `0009_remove_demo_membership_role.sql`
  - před změnou se zastaví, pokud existuje jakékoli demo členství
  - odstraní staré překrývající se CHECK constrainty s `demo_viewer`
  - povolí už jen role `organization_admin` a `member`

## Povinné pořadí nasazení

1. Spustit `supabase/preflight/legacy_migration_readiness.sql` read-only.
2. Uložit jeho výstup jako předmigrační protokol.
3. Aplikovat databázové migrace `0008` a následně `0009`.
4. Teprve potom nasadit aplikační kód používající `get_my_organizations`.
5. Preflight zopakovat a porovnat počty organizací, členství a příjemců.

## Neměnné migrační podmínky

- nemažou se ani znovu nevytvářejí Auth účty;
- zachovávají se UUID, e-maily a hesla všech existujících uživatelů;
- zachovává se všech 10 vazeb `orders_start.organization_id`;
- zůstává interní `Testovací škola ARCHIMEDES`, UUID
  `339612be-8577-4cce-8ef4-e77a4bc0b442`, `is_system = true`;
- Louny, Ostrava a Luže jsou obchodně potvrzené platící školy;
- placená/darovaná licence není runtime oprávnění a nesmí rozdělit uživatele;
- žádná preference zájmu nevytváří členství v organizaci;
- demo se neobnovuje.

Ruční přiřazení škol pod obce přijde až po schválení konkrétní mapy
`škola -> obec`. Bez této mapy se `parent_organization_id` hromadně nemění.
