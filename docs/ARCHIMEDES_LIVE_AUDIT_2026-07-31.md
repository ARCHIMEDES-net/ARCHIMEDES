# ARCHIMEDES Live — ověřený stav k 31. 7. 2026

> **Historický audit.** Dokument zachycuje stav k 31. 7. 2026 a není aktuálním
> zdrojem pravdy. Pro živá pravidla použijte `docs/README.md`; nejnovější úplný
> produkční snímek je `docs/PRODUCTION-AUDIT-2026-08-14.md`.

Audit vychází z tehdejší kontroly GitHub `main`, produkčního Vercelu,
produkčního Supabase schématu, dat, Security Advisors, otevřených issues a
runtime chyb.

## Celkový stav

- Produkční Next.js aplikace je nasazená z větve `main` na Vercelu.
- Produkční databáze `ARCHIMEDESLive` běží na PostgreSQL 17 a je `ACTIVE_HEALTHY`.
- Model obec → podřízené organizace je implementovaný přes `organizations.parent_organization_id`.
- Produkce obsahovala při auditu 12 aktivních škol, 1 aktivní obec a 1 aktivní spolek.
- Licence organizace i dědění licence nadřazené obce jsou implementované pro vysílání, registraci účasti a archiv.
- Produkce obsahovala 17 broadcast sessions, z toho 12 publikovaných a 11 publikovaných záznamů.
- WebMeeting má podepsanou komunikaci, kontrolu oprávnění a automatické bezpečnostní testy.
- CI spouští lint, testy a produkční build. Migrační historie má guardrails a ověřenou schema baseline.
- Zálohování, off-site kopie a test obnovy byly ověřeny.

## Dokončené zásadní změny 29.–30. 7. 2026

- bezpečnostní hardening veřejných, přihlašovacích a administrativních API;
- rate limiting, omezení vstupů, `no-store`, bezpečné chybové odpovědi;
- bezpečné SMTP timeouty a externí integrace;
- bezpečnostní HTTP hlavičky a safe JSON-LD;
- Next.js 15.5.22 a sharp 0.35.3 bez známých npm advisories při auditu;
- Vitest, API kontraktní testy a GitHub Actions CI;
- úzké RPC `get_portal_broadcast_sessions(uuid[])`;
- omezení přímého čtení `broadcast_sessions` na platformové administrátory;
- licenční kontrola vysílání, evidence účasti a archivu;
- vyřazení historické Make lead trasy a databázového webhook triggeru;
- produkční schema baseline a úspěšný byte-for-byte replay.

## Otevřené priority

### P1

1. Opravit produkční formulář `/api/poptavka-ucebny`: aplikace zapisovala `type = classroom`, ale databázový constraint hodnotu nepovoloval.
2. Odebrat anonymní `EXECUTE` na `get_portal_archive_events()` a ověřit grants SECURITY DEFINER RPC.

Obě P1 opravy byly aplikovány produkční migrací `20260731060923_fix_classroom_lead_and_archive_rpc_grants` a zapsány do repozitáře.

### Řízené technické dokončení

- #81: dokončit produkční migration-ledger repair v řízeném maintenance window;
- #75: ověřit a případně zapnout leaked-password protection;
- #76: přesunout extension `unaccent` z `public`;
- #74: definovat Storage kvóty;
- #68: dokončit CSP vendor allowlist a enforcement;
- #79: odstranit zbývající lint warnings;
- zkontrolovat a uklidit historické `backup_*` tabulky v `public`.

### Provozní rozšíření

- naplnit další obce a podřízené školy/spolky;
- provést end-to-end onboarding několika reálných obcí;
- ověřit běžným účtem dědění licence, registraci účasti, vstup do WebMeeting a archiv.

## Pravidlo pro další práci

Při každé další změně rozlišovat:

1. implementováno v kódu;
2. sloučeno do `main`;
3. nasazeno na Vercel;
4. aplikováno v produkčním Supabase;
5. ověřeno reálným nebo automatickým testem.

Dokončenou položku označit za hotovou až po splnění relevantních kroků výše.
