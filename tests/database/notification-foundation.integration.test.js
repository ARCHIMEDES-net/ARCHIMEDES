import fs from "node:fs";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const migration = fs.readFileSync(
  path.join(
    process.cwd(),
    "supabase/migrations/20260816055119_add_notification_foundation.sql"
  ),
  "utf8"
);
const queueMigration = fs.readFileSync(
  path.join(
    process.cwd(),
    "supabase/migrations/20260816055153_add_notification_enqueue_rpc.sql"
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
    create table public.notification_preferences (
      profile_id uuid not null,
      activity_code text not null,
      enabled boolean not null default true,
      unique (profile_id, activity_code)
    );
    create table public.user_interests (
      user_id uuid not null,
      interest_slug text not null,
      primary key (user_id, interest_slug)
    );
    create table public.broadcast_sessions (
      id uuid primary key,
      event_id uuid references public.events(id),
      starts_at timestamptz,
      is_published boolean not null default false
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
  await database.exec(queueMigration);
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
              notifications_enabled, notification_delivery_policy, reminder_minutes
       from public.broadcast_sessions where id = $1`,
      [sessionId]
    );

    expect(result.rows[0]).toMatchObject({
      recipient_group_codes: [],
      recipient_groups_configured: false,
      notifications_enabled: false,
      notification_delivery_policy: "in_app_only",
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

  it("atomically enqueues each notification and delivery only once", async () => {
    const profileId = "44444444-4444-4444-8444-444444444444";
    const eventId = "55555555-5555-4555-8555-555555555555";
    await database.query("insert into public.profiles (id) values ($1)", [profileId]);
    await database.query("insert into public.events (id) values ($1)", [eventId]);

    const candidates = JSON.stringify([
      {
        profile_id: profileId,
        event_id: eventId,
        kind: "event_reminder",
        title: "Za 30 minut vysíláme",
        body: "Připomenutí",
        target_path: `/portal/udalost/${eventId}`,
        available_at: "2026-08-15T10:00:00.000Z",
        dedupe_key: `event-reminder:${eventId}:${profileId}:30`,
        email_enabled: true,
        push_enabled: false,
      },
    ]);

    const first = await database.query(
      "select * from public.enqueue_notification_candidates($1::jsonb)",
      [candidates]
    );
    const replay = await database.query(
      "select * from public.enqueue_notification_candidates($1::jsonb)",
      [candidates]
    );

    expect(first.rows[0]).toMatchObject({
      notifications_inserted: 1,
      deliveries_inserted: 1,
    });
    expect(replay.rows[0]).toMatchObject({
      notifications_inserted: 0,
      deliveries_inserted: 0,
    });
  });
});
