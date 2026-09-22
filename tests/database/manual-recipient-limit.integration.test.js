import fs from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { expect, it } from "vitest";
it("migrates existing lists and enforces 1000 addresses in PostgreSQL", async () => {
  const db = new PGlite();
  try {
    await db.exec("CREATE TABLE public.broadcast_sessions (id int primary key);");
    await db.exec(fs.readFileSync("supabase/migrations/20260813105516_add_manual_broadcast_recipients.sql", "utf8"));
    await db.exec("INSERT INTO public.broadcast_sessions VALUES (1, ARRAY['existing@example.com']);");
    await db.exec(fs.readFileSync("supabase/migrations/20260922064933_increase_manual_broadcast_recipients_to_1000.sql", "utf8"));
    expect((await db.query("SELECT manual_recipient_emails FROM public.broadcast_sessions WHERE id = 1")).rows[0].manual_recipient_emails).toEqual(["existing@example.com"]);
    await db.exec("INSERT INTO public.broadcast_sessions VALUES (2, ARRAY(SELECT 'guest' || i || '@example.com' FROM generate_series(1,1000) i));");
    await expect(db.exec("INSERT INTO public.broadcast_sessions VALUES (3, ARRAY(SELECT 'guest' || i || '@example.com' FROM generate_series(1,1001) i));")).rejects.toThrow(/broadcast_sessions_manual_recipient_emails_limit/);
  } finally { await db.close(); }
});
