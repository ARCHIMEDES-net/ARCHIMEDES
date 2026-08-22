-- Preview history marker.
--
-- The hardening migration was first applied to the isolated PR Preview database
-- through the Supabase API, which assigned version 20260822082908. The actual,
-- idempotent migration remains 20260822103500 so clean databases apply it only
-- after the audited follow-up function exists.

