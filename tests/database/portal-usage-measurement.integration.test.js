import fs from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { describe, expect, it } from "vitest";

const migration = fs.readFileSync(
  "supabase/migrations/20261123112123_portal_usage_measurement.sql",
  "utf8"
);

const admin = "00000000-0000-4000-8000-000000000001";
const teacher = "00000000-0000-4000-8000-000000000002";
const senior = "00000000-0000-4000-8000-000000000003";
const dormant = "00000000-0000-4000-8000-000000000004";
const school = "00000000-0000-4000-8000-000000000010";
const pastEvent = "00000000-0000-4000-8000-000000000020";
const futureEvent = "00000000-0000-4000-8000-000000000021";

async function setup() {
  const db = new PGlite();
  await db.exec(`
    create role anon; create role authenticated; create role service_role;
    create schema auth;
    create table auth.users(id uuid primary key, last_sign_in_at timestamptz);
    insert into auth.users values
      ('${admin}', now()), ('${teacher}', now()), ('${senior}', now()), ('${dormant}', null);
    create table public.platform_admins(user_id uuid, role text);
    insert into public.platform_admins values ('${admin}', 'super_admin');
    create table public.organizations(id uuid primary key);
    insert into public.organizations values ('${school}');
    create table public.events(id uuid primary key, title text, starts_at timestamptz);
    insert into public.events values
      ('${pastEvent}', 'Wellbeing', now() - interval '2 days'),
      ('${futureEvent}', 'Zoo Praha', now() + interval '2 days');
    create table public.broadcast_sessions(id uuid primary key default gen_random_uuid(),
      event_id uuid, starts_at timestamptz, external_meeting_id text, last_synced_at timestamptz);
    insert into public.broadcast_sessions(event_id, starts_at, external_meeting_id) values
      ('${pastEvent}', now() - interval '2 days', '123'),
      ('${futureEvent}', now() + interval '2 days', null);
    create table public.event_attendees(event_id uuid, user_id uuid, excluded_admin_context boolean);
    insert into public.event_attendees values
      ('${pastEvent}', '${teacher}', false), ('${pastEvent}', '${admin}', true);
  `);
  await db.exec(migration);
  return db;
}

describe("portal usage measurement", () => {
  it("records each activity at most once per user and day", async () => {
    const db = await setup();
    try {
      const first = await db.query(
        `select public.record_portal_usage('${teacher}', '${school}', 'portal_visit') as ok`
      );
      const again = await db.query(
        `select public.record_portal_usage('${teacher}', '${school}', 'portal_visit') as ok`
      );
      expect(first.rows[0].ok).toBe(true);
      expect(again.rows[0].ok).toBe(false);

      await db.query(
        `select public.record_portal_usage('${teacher}', '${school}', 'broadcast_join', '${pastEvent}')`
      );
      await db.query(
        `select public.record_portal_usage('${teacher}', '${school}', 'broadcast_join', '${pastEvent}')`
      );
      const rows = await db.query("select kind from public.portal_usage_log order by kind");
      expect(rows.rows.map((row) => row.kind)).toEqual(["broadcast_join", "portal_visit"]);

      await expect(
        db.query(`select public.record_portal_usage('${teacher}', null, 'broadcast_join', null)`)
      ).rejects.toThrow(/portal_usage_log_event_matches_kind/);
      await expect(
        db.query(`select public.record_portal_usage('${teacher}', null, 'something', null)`)
      ).rejects.toThrow(/check/);
    } finally {
      await db.close();
    }
  });

  it("summarizes usage without platform admins and only for past broadcasts", async () => {
    const db = await setup();
    try {
      await db.exec(`
        insert into public.portal_usage_log(user_id, organization_id, kind, event_id, activity_day) values
          ('${teacher}', '${school}', 'portal_visit', null, (now() at time zone 'Europe/Prague')::date),
          ('${teacher}', '${school}', 'portal_visit', null, (now() at time zone 'Europe/Prague')::date - 10),
          ('${senior}', null, 'portal_visit', null, (now() at time zone 'Europe/Prague')::date - 20),
          ('${senior}', null, 'portal_visit', null, (now() at time zone 'Europe/Prague')::date - 40),
          ('${admin}', null, 'portal_visit', null, (now() at time zone 'Europe/Prague')::date),
          ('${teacher}', '${school}', 'broadcast_join', '${pastEvent}', (now() at time zone 'Europe/Prague')::date - 2),
          ('${admin}', null, 'broadcast_join', '${pastEvent}', (now() at time zone 'Europe/Prague')::date - 2);
        update public.broadcast_sessions set presence_participant_count = 17 where event_id = '${pastEvent}';
      `);

      const result = await db.query("select public.get_portal_usage_stats(30) as stats");
      const stats = result.rows[0].stats;

      expect(stats.days).toBe(30);
      expect(stats.activeUsers).toBe(2);
      expect(stats.activeUsers7d).toBe(1);
      expect(stats.returningUsers).toBe(1);
      expect(stats.activeOrganizations).toBe(1);
      expect(stats.accounts).toEqual({ total: 3, neverSignedIn: 1 });
      expect(stats.broadcasts).toHaveLength(1);
      expect(stats.broadcasts[0]).toMatchObject({
        eventId: pastEvent,
        title: "Wellbeing",
        registered: 1,
        joinClicks: 1,
        joinOrganizations: 1,
        connectedDevices: 17,
        integratedRoom: true,
      });
    } finally {
      await db.close();
    }
  });

  it("keeps the log and functions closed to browser roles", async () => {
    const db = await setup();
    try {
      const grants = await db.query(`
        select
          has_table_privilege('authenticated', 'public.portal_usage_log', 'select') as auth_select,
          has_table_privilege('anon', 'public.portal_usage_log', 'insert') as anon_insert,
          has_function_privilege('authenticated', 'public.record_portal_usage(uuid, uuid, text, uuid)', 'execute') as auth_record,
          has_function_privilege('authenticated', 'public.get_portal_usage_stats(integer)', 'execute') as auth_stats,
          has_function_privilege('service_role', 'public.get_portal_usage_stats(integer)', 'execute') as service_stats
      `);
      expect(grants.rows[0]).toEqual({
        auth_select: false,
        anon_insert: false,
        auth_record: false,
        auth_stats: false,
        service_stats: true,
      });
    } finally {
      await db.close();
    }
  });
});
