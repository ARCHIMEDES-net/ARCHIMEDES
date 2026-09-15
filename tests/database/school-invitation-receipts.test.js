import fs from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { it, expect } from "vitest";

it("stores school email receipts without losing existing attempts or RLS", async () => {
  const db = new PGlite();
  try {
    await db.exec("create table public.school_member_invitation_attempts (id integer primary key, status text); alter table public.school_member_invitation_attempts enable row level security; insert into public.school_member_invitation_attempts values (1, 'sending');");
    const sql = fs.readFileSync("supabase/migrations/20260915060940_school_member_invitation_receipts.sql", "utf8");
    await db.exec(sql);
    await db.exec(sql);
    await db.exec("update public.school_member_invitation_attempts set email_provider='resend', client_provider_message_id='client-1', audit_copy_provider_message_id='copy-1' where id=1;");
    expect((await db.query("select * from public.school_member_invitation_attempts")).rows).toEqual([
      {id:1,status:"sending",email_provider:"resend",client_provider_message_id:"client-1",audit_copy_provider_message_id:"copy-1"},
    ]);
    expect((await db.query("select relrowsecurity from pg_class where oid='public.school_member_invitation_attempts'::regclass")).rows[0].relrowsecurity).toBe(true);
  } finally { await db.close(); }
});
