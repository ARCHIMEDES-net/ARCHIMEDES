# #121 — Dashboard inherited municipality context

Tento dokument je implementační checklist pro navazující stacked PR nad #115.

## Závislost

- základní oprávnění a `resolveActiveOrganizationContext()` musí být nejprve dokončeny v #115;
- tento krok nesmí být sloučen samostatně do `main` před #115.

## Povolený rozsah změny

Pouze `pages/portal/index.js`:

1. Pro `profile.active_organization_id` použít `resolveActiveOrganizationContext()`.
2. Název, typ, join code, licenci a `role_in_org` převzít z vrácené organizace.
3. Přímé aktivní členství použít pouze jako fallback, pokud aktivní kontext chybí nebo není dostupný.
4. Při fallbacku nevybrat cizí nebo neaktivní organizaci.
5. Zachovat režim jednotlivce a existující platform-admin chování.

## Výslovně mimo rozsah

- dotaz na `events`, `stream_url` a `broadcast_sessions` — #118;
- plakáty a stránka Vysílali jsme;
- Auth účty, hesla a členství;
- deaktivace uživatelů — #116;
- onboarding — #117.

## Povinné regresní scénáře

- správce obce → přímá podřízená škola: správný název, typ, join code, role a licence;
- správce školy → vlastní škola beze změny;
- běžný člen → žádné admin prvky;
- správce jiné obce → bez přístupu;
- neaktivní členství → bez přístupu;
- jednotlivec → původní dashboard;
- platform admin → původní chování.

## Podmínky před merge

- izolovaný diff pouze pro dashboard a jeho testy;
- zelený lint, testy, build a Preview;
- žádná změna produkčních dat;
- read-only ověření proti Křenovu a Žlebům po případném nasazení základu #115.
