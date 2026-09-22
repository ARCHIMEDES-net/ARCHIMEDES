import fs from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { expect, it } from "vitest";

it("persists 1000 invitation recipients in separate batches, resumes unchanged, deduplicates and honors opt-outs", async () => {
  const db = new PGlite();
  const eventId = "00000000-0000-4000-8000-000000000001";
  const adminId = "00000000-0000-4000-8000-000000000002";
  try {
    await db.exec(`create role anon; create role authenticated; create role service_role bypassrls;
      create schema auth; create table auth.users(id uuid primary key);
      create table public.events(id uuid primary key);
      create table public.profiles(id uuid primary key,email text,is_active boolean,email_notifications_enabled boolean);
      create table public.notification_channel_preferences(profile_id uuid,email_enabled boolean);
      insert into auth.users values('${adminId}'); insert into events values('${eventId}');`);
    await db.exec(fs.readFileSync("supabase/migrations/20260922182021_separate_broadcast_email_invitations.sql", "utf8"));
    const emails = Array.from({ length: 1000 }, (_, i) => `guest${i}@example.com`);
    const prepare = async (addresses = emails, subject = "original") => (await db.query(
      "select prepare_broadcast_invitation_batch($1,$2,$3,$4) as batch", [eventId, addresses, JSON.stringify({ subject }), adminId]
    )).rows[0].batch;
    const first = await prepare();
    expect(first.payload).toHaveLength(100);
    expect(await prepare(emails, "changed")).toEqual(first);
    for (let i = 0; i < 10; i += 1) {
      const batch = await prepare();
      expect(batch.payload).toHaveLength(100);
      expect(new Set(batch.payload.map((m) => m.to[0])).size).toBe(100);
      await db.query("update broadcast_invitation_batches set accepted_at=now() where id=$1", [batch.id]);
    }
    expect(await prepare()).toEqual({ done: true, accepted: 1000, total: 1000 });
    expect((await db.query("select count(*)::int as n from broadcast_invitation_recipients")).rows[0].n).toBe(1000);
    await db.query("insert into profiles values($1,'optout@example.com',true,false)", [adminId]);
    expect(await prepare(["optout@example.com"])).toEqual({ done: true, accepted: 0, total: 1 });
    const next = await prepare([emails[0], "new@example.com", "new@example.com"]);
    expect(next.payload).toHaveLength(1);
    expect(next.payload[0].to).toEqual(["new@example.com"]);
    const access = (await db.query(`select
      has_table_privilege('anon','broadcast_invitation_batches','SELECT') as anon_read,
      has_table_privilege('authenticated','broadcast_invitation_recipients','SELECT') as member_read,
      has_function_privilege('authenticated','prepare_broadcast_invitation_batch(uuid,text[],jsonb,uuid)','EXECUTE') as member_execute,
      has_function_privilege('service_role','prepare_broadcast_invitation_batch(uuid,text[],jsonb,uuid)','EXECUTE') as service_execute;`)).rows[0];
    expect(access).toEqual({ anon_read: false, member_read: false, member_execute: false, service_execute: true });
  } finally { await db.close(); }
},20000);
