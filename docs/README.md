# Řídicí dokumentace ARCHIMEDES Live

Stav indexu: **14. srpna 2026**

Tento soubor určuje, které dokumenty jsou živé provozní zdroje a které jsou
jen datované audity, historické plány nebo backlog. Samotný dokument ani audit
neopravňuje k produkčnímu zápisu, odeslání e-mailu, migraci nebo deploymentu.

## Pořadí autority

Při rozporu má přednost:

1. ověřený aktuální stav produkce a výslovné aktuální rozhodnutí vlastníka;
2. produkční migration ledger `supabase/production-migration-ledger.json`;
3. níže označené živé provozní dokumenty na `main`;
4. nejnovější datovaný read-only audit;
5. historické audity, plány, návrhy a backlog.

Historický dokument zůstává platným dokladem stavu k uvedenému datu, ale
nesmí přepsat novější provozní pravidlo.

## Živé provozní dokumenty

| Oblast | Zdroj | Rozsah |
| --- | --- | --- |
| Onboarding obcí | `docs/MUNICIPALITY-ONBOARDING.md` | Role, idempotence, e-mailový audit a serverová automatizace |
| Zákazníci a licence | `docs/UNIFIED-CUSTOMER-ACCESS.md` | Datový a produktový model obcí, škol a spolků |
| Migrační stav | `supabase/MIGRATION_STATUS.md` | Aktuální nasazené migrace a neměnné podmínky |
| Srovnání ledgeru | `supabase/MIGRATION_RECONCILIATION_RUNBOOK.md` | Bezpečný postup při budoucím rozporu ledgeru |
| Zálohy a obnova | `docs/BACKUP-AND-RECOVERY.md` | Automatické zálohy a incidentní obnova |
| Leady | `docs/LEAD-PROCESSING.md` | Produkční zpracování žádostí bez Make |
| WebMeeting | `docs/WEBMEETING-INTEGRATION.md` | Technický model, tajemství a integrační hranice |
| Veřejný web | `docs/PUBLIC-WEB-CONTENT-RULES.md` | Doložitelnost tvrzení a pravidla partnerů |
| Privilegované DB funkce | `supabase/SECURITY_DEFINER_CLASSIFICATION.md` | Schválené role a granty funkcí |

## Datované důkazy, nikoli aktuální instrukce

- `docs/PRODUCTION-AUDIT-2026-08-14.md` je poslední úplný read-only audit.
- `docs/ARCHIMEDES_LIVE_AUDIT_2026-07-31.md` a
  `docs/security/FINAL_SECURITY_AUDIT_2026-07-29.md` jsou historické snímky.
- `supabase/PRODUCTION_SCHEMA_FINGERPRINT.md` dokládá baseline z 30. července;
  není otisk dnešního schématu.
- `supabase/PRODUCTION_SCHEMA_BASELINE_PLAN.md` je dokončený historický plán.

## Návrhy a backlog

- `docs/TODO-DOBRA-PRAXE.md` je backlog. Nespouští implementaci bez nového
  produktového rozhodnutí.
- `docs/security/SUPABASE-LEAKED-PASSWORD-PROTECTION.md` je specializovaný
  bezpečnostní postup; před použitím se musí ověřit aktuální stav projektu.

## Projektová Knihovna

Knihovna obsahuje obchodní, právní, obsahové i provozní podklady. Aktuálním
řídicím dokumentem onboardingu je pouze soubor
`01-ARCHIMEDES_Live_onboarding_ridici_dokument.md` v projektové složce
onboardingu. Starší kopie patří do archivu. Právní balíček je pracovní návrh a
nelze jej považovat za právně schválený ani za technický zdroj pravdy, dokud
neprojde právní a provozní revizí.

## Povinná údržba

- Živý dokument aktualizovat ve stejném PR jako změnu chování.
- Datovaný audit nikdy tiše nepřepisovat na dnešní stav; vytvořit nový audit.
- Každé tvrzení rozlišit na `v kódu`, `sloučeno`, `nasazeno`, `aplikováno v DB`
  a `ověřeno`.
- Nový zdroj pravdy přidat do tohoto indexu a starý výslovně přeřadit do
  historie nebo archivu.
