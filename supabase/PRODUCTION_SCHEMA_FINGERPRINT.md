# Production schema fingerprint

> Historical baseline evidence captured on 2026-07-30. This is not a current
> fingerprint of the live schema. See `MIGRATION_STATUS.md` and the production
> migration ledger for the current migration state.

Captured read-only from Supabase project `gipikahmjlcynkqexxmz` on 2026-07-30.

This file records both the original catalog inventory and the completed
schema-only baseline verification. It is not a migration.

## Current public schema inventory

| Object kind | Count | Fingerprint |
|---|---:|---|
| Tables | 44 | `3613edc0c77e3b1361c7f7d7e1f4a89e` |
| Views | 1 | `55d01893c58d8d55b4491ea1f968d787` |
| Functions | 27 | `6ae7361b212b6069591bc8705435ba0b` |
| RLS policies | 94 | `128a9eaf5cf28355804af6146c32f3e7` |

Additional inventory observed during the same audit:

- sequences: 1
- application triggers: 9

The original query that generated the four MD5 values above was not committed,
so those hashes cannot be independently reproduced. The counts were reproduced.
The function count includes four functions owned by the `unaccent` extension;
`pg_dump` correctly excludes those extension-owned objects and exports 23
application functions.

## Reproducible baseline fingerprint

GitHub Actions run
[`30543283033`](https://github.com/ARCHIMEDES-net/ARCHIMEDES/actions/runs/30543283033)
captured production read-only, replayed the active migration chain in a clean
local Supabase stack, and dumped the replayed `public` schema with the same
Supabase CLI version.

| Artifact | SHA-256 |
|---|---|
| Production `public` schema | `5e9c54c4cf69fd46ccd36a94b4d8846461bb909faffdb5c11c9df3a40ad93da3` |
| Replayed `public` schema | `5e9c54c4cf69fd46ccd36a94b4d8846461bb909faffdb5c11c9df3a40ad93da3` |

The unified diff is empty (0 bytes). The dump contains 44 tables, 1 view,
1 sequence, 23 application functions, 94 RLS policies, and 9 application
triggers. No top-level `COPY` or `INSERT INTO` data statements, connection
strings, private-key markers, or JWT-like values were found.

## Acceptance rule

After any baseline change, repeat the `baseline-verify` workflow operation. The
production and replayed dumps must have identical SHA-256 values and an empty
diff before migration history repair is attempted.

A mismatch means the baseline is incomplete or the production schema changed after capture. In that case, regenerate the dump and fingerprint before proceeding.
