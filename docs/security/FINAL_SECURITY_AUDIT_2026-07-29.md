# ARCHIMEDES Live – Final Security Audit Report

- **Datum:** 29. 7. 2026
- **Auditovaný commit:** `1a949be`
- **Stav:** dokončeno
- **Produkce:** `archimedeslive.com`
- **GitHub issue:** [#83](https://github.com/ARCHIMEDES-net/ARCHIMEDES/issues/83) – uzavřeno

## Executive Summary

Legacy lead-to-Make integrace byla kompletně odstraněna. Produkce je zdravá, všechny ověřovací kontroly uspěly a issue #83 byla uzavřena jako dokončená. Nezůstává žádná runtime závislost na proměnných `MAKE_LEAD_WEBHOOK_URL` ani `MAKE_WEBHOOK_URL`.

## Final verification

| Check | Result |
|---|---|
| `MAKE_LEAD_WEBHOOK_URL` references | None in current code, configuration, tests, documentation, or local environment files |
| `MAKE_WEBHOOK_URL` references | None |
| Production build | READY on current `main` (`1a949be`) |
| GitHub Actions | [Successful](https://github.com/ARCHIMEDES-net/ARCHIMEDES/actions/runs/30482323302) |
| Automated tests | 13 suites, 239 tests passed |
| Production dependencies | 0 known vulnerabilities |
| Lint | 0 errors; 54 existing warnings tracked by #79 |
| Legacy API | `/api/make-lead` returns 404 |
| Supabase trigger/function | No legacy Make trigger or delivery function remains |
| Make | Queue discarded; two legacy scenarios and webhooks retired |
| Runtime health | No error clusters detected |
| Lead workflows | Regression coverage remains green |

The Vercel variable deletion was owner-confirmed. A fresh production deployment built successfully after deletion, demonstrating that there is no remaining runtime dependency on either variable.

## Completed security work

The audit covered all API and admin routes, authentication and authorization, validation, rate limiting, cache behavior, security headers and CSP, service-role usage, RLS, RPC grants, storage and uploads, SMTP/email routes, WebMeeting, XSS, CSRF, SSRF, SQL injection, error disclosure, and secret handling.

Notable final changes:

- [PR #92](https://github.com/ARCHIMEDES-net/ARCHIMEDES/pull/92): removed the production Supabase lead webhook trigger.
- [PR #93](https://github.com/ARCHIMEDES-net/ARCHIMEDES/pull/93): removed `/api/make-lead`, added regression coverage, and documented Supabase plus SMTP as the authoritative workflow.
- Retired Make scenarios `4689298` and `4692900`.
- Discarded eight queued payloads without execution.
- Revoked both legacy webhook endpoints without altering unrelated scenarios.
- Preserved lead storage, onboarding, notifications, inquiries, and administrative processing.

## Remaining owner decisions

| Issue | Priority | Decision |
|---|---:|---|
| [#81](https://github.com/ARCHIMEDES-net/ARCHIMEDES/issues/81) | P1 | Reconcile production migration-ledger history with repository migrations |
| [#75](https://github.com/ARCHIMEDES-net/ARCHIMEDES/issues/75) | P1 | Enable Supabase leaked-password protection |
| [#73](https://github.com/ARCHIMEDES-net/ARCHIMEDES/issues/73) | P1 | Approve a minimal broadcast-session view for portal users |
| [#68](https://github.com/ARCHIMEDES-net/ARCHIMEDES/issues/68) | P2 | Approve CSP vendor allowlist and move the full policy from report-only to enforcement |
| [#74](https://github.com/ARCHIMEDES-net/ARCHIMEDES/issues/74) | P2 | Define direct-upload size and usage quotas |

## Remaining technical debt

- #76: relocate `unaccent` from the public schema in a controlled future migration; unchanged per decision.
- #79: resolve 54 lint warnings; engineering-quality backlog, not a security issue.
- Coverage is approximately 48% statements and 50% lines. Core server security helpers exceed 90%, but several onboarding, admin, broadcast, and WebMeeting handlers need deeper route-level tests.
- Supabase advisors still flag performance opportunities involving RLS initialization, permissive-policy consolidation, missing indexes, and unused indexes.
- Ten authenticated-callable `SECURITY DEFINER` functions should receive another explicit grants/intent review. These are warnings, not confirmed vulnerabilities.
- The full CSP remains report-only pending #68.

## Security maturity

ARCHIMEDES Live is now at a **defined, defense-in-depth maturity level—approximately 3/5**. Security controls are systematic, regression-tested, and integrated into CI. No open P0 security finding or known legacy Make exposure remains.

## Recommended next phase

1. Complete P1 decisions #81, #75 and #73.
2. Improve route-level integration coverage.
3. Reconcile migration governance.
4. Explicitly inventory privileged RPC grants.
5. Gradually move the full CSP into enforcement.
6. Then move the main engineering focus to performance, UX, mobile usability and municipality onboarding.
