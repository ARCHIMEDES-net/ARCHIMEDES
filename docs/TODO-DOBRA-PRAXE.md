# Dobrá praxe – návrat funkce na aktuální architekturu

> **Backlog, nikoli schválená implementační instrukce.** Před zahájením je
> nutné nové produktové rozhodnutí a ověření proti aktuálnímu `main`.

Původní PR #2 vznikl proti zastaralé větvi a nelze jej bezpečně sloučit do současného `main`.

## Co zachovat
- org admin může vytvořit a spravovat vlastní čekající příspěvek
- platformový admin schvaluje, zamítá a vybírá featured příspěvek
- přihlášení uživatelé čtou schválený feed
- veřejnost vidí pouze featured příspěvek
- fotografie jsou omezené počtem i typem

## Co před novou implementací ověřit
- zda produkt stále potřebuje veřejnou featured sekci
- zda je bucket `dobra-praxe` vytvořený a správně chráněný
- zda současné role `organization_admin` a `platform_admin` pokrývají celý workflow
- zda se funkce nemá začlenit do nového portálu obcí místo původních URL

## Technické východisko
Databázové tabulky a RLS z migrace `0007_blok_a_dobra_praxe.sql` jsou v produkci. Nová UI implementace musí vzniknout z aktuálního `main` a nesmí znovu spouštět migraci 0007.
