# Pre-baseline migration archive

These files preserve the repository history that existed before the production
schema baseline captured on 2026-07-30.

They are intentionally outside `supabase/migrations` because the legacy chain
starts from an already-populated application schema and cannot initialize a
clean Supabase database. The production baseline contains their final `public`
schema effects. The Storage authorization change, which lives outside `public`,
is reissued as a post-baseline migration. Replaying the archived files
themselves would attempt to apply the same changes twice or in the wrong order.

Do not move these files back into the active migration directory and do not
apply them to production. Use them only as audit evidence while reconciling the
production migration ledger described in issue #81.
