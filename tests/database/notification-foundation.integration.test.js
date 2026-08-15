import fs from "node:fs";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const migration = fs.readFileSync(
  path.join(
    process.cwd(),
    "supabase/migrations/20260815174036_add_notification_foundation.sql"
  ),
  "utf8"
);

const database = new PGlite();

beforeAll(async () => {
  await database.exec(`
    create role anon nologin;
    create role authenticated nologin;
    create role service_role nologin bypassrls;

    create schema auth;
    create function auth.uid()
    returns uuid
    language sql
    stable
    as $$
      select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
    $$;

    create table public.profiles (
      id uuid primary key
    );
    create table public.events (
      id uuid primary key
    );
    create table public.broadcast_sessions (
      id uuid primary key,
      event_id uuid references public.events(id)
    );
    create function public.set_updated_at()
    returns trigger
    language plpgsql
    as $$
    begin
      new.updated_at = now();
      return new;
    end;
    $$;
  `);

  await database.exec(migration);
});

afterAll(async () => {
  await database.close();
});

describe("notification foundation database integration", () => {
  it("applies with fail-closed broadcast defaults", async () => {
    const eventId = "11111111-1111-4111-8111-111111111111";
    const sessionId = "22222222-2222-4222-8222-222222222222";
    await database.query("insert into public.events (id) values ($1)", [eventId]);
    await database.query(
      "insert into public.broadcast_sessions (id, event_id) values ($1, $2)",
      [sessionId, eventId]
    );

    const result = await database.query(
      `select recipient_group_codes, recipient_groups_configured,
              notifications_enabled, reminder_minutes
       from public.broadcast_sessions where id = $1`,
      [sessionId]
    );

    expect(result.rows[0]).toMatchObject({
      recipient_group_codes: [],
      recipient_groups_configured: false,
      notifications_enabled: false,
      reminder_minutes: [1440, 30],
    });
  });

  it("rejects unsafe push endpoints", async () => {
    const profileId = "33333333-3333-4333-8333-333333333333";
    await database.query("insert into public.profiles (id) values ($1)", [profileId]);

    await expect(
      database.query(
        `insert into public.push_subscriptions
          (profile_id, endpoint, p256dh_key, auth_key)
         values ($1, 'http://unsafe.example.test', 'key', 'auth')`,
        [profileId]
      )
    ).rejects.toThrow();
  });

  it("enforces unique delivery idempotency keys", async () => {
    await database.query(
      `insert into public.notification_deliveries
        (recipient_email, channel, scheduled_for, dedupe_key)
       values ('test@example.test', 'email', now(), 'same-delivery')`
    );

    await expect(
      database.query(
        `insert into public.notification_deliveries
          (recipient_email, channel, scheduled_for, dedupe_key)
         values ('other@example.test', 'email', now(), 'same-delivery')`
      )
    ).rejects.toThrow();
  });
});
