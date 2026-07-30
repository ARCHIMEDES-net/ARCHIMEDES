# Production schema fingerprint

Captured read-only from Supabase project `gipikahmjlcynkqexxmz` on 2026-07-30.

This file is a verification aid for the future schema-only baseline export. It is not a migration and must not be treated as sufficient replacement for `supabase db dump --schema-only`.

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

## Acceptance rule

After restoring the generated baseline into a clean Supabase development branch, recalculate the fingerprints using the same catalog query. Counts and fingerprints must match before migration history repair is attempted.

A mismatch means the baseline is incomplete or the production schema changed after capture. In that case, regenerate the dump and fingerprint before proceeding.
