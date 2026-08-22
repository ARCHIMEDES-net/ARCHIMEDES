-- Preview history marker.
--
-- The index migration was first applied to the isolated PR Preview database
-- through the Supabase API, which assigned version 20260822080351. The actual,
-- idempotent migration remains 20260822101500 so clean databases apply it only
-- after the resolution columns exist.

