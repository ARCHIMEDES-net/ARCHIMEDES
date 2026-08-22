import fs from "node:fs";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { PGlite } from "@electric-sql/pglite";

const profileId = "00000000-0000-4000-8000-000000000001";
const adminId = "00000000-0000-4000-8000-000000000002";
const sourceId = "00000000-0000-4000-8000-000000000003";
let database;

beforeAll(async () => {
  database = new PGlite();
  await database.exec(`
    create role anon;
    create role authenticated;
    create role service_role;
    create table public.profiles(
      id uuid primary key,
      email text,
      must_set_password boolean not null default false,
      profile_completed_at timestamptz,
      is_active boolean not null default true
    );
    create table public.platform_admins(
      user_id uuid primary key references public.profiles(id),
      role text not null
    );
    create table public.profile_completion_reminder_attempts(
      id uuid primary key default gen_random_uuid(),
      profile_id uuid not null references public.profiles(id),
      reminder_step smallint not null,
      reason text not null,
      recipient_email text not null,
      status text not null,
      claimed_at timestamptz not null default now(),
      sent_at timestamptz,
      error_code text,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now(),
      email_provider text,
      client_provider_message_id text,
      audit_copy_provider_message_id text,
      audit_copy_sent_at timestamptz,
      constraint profile_completion_reminder_attemp_profile_id_reminder_step_key
        unique(profile_id, reminder_step)
    );
  `);
  await database.exec(
    fs.readFileSync(
      path.join(
        process.cwd(),
        "supabase/migrations/20260822094500_audit_profile_reminder_resolution.sql"
      ),
      "utf8"
    )
  );
  await database.exec(
    fs.readFileSync(
      path.join(
        process.cwd(),
        "supabase/migrations/20260822103500_harden_profile_reminder_followup.sql"
      ),
      "utf8"
    )
  );
  await database.query(
    `insert into public.profiles(id, email, must_set_password, profile_completed_at)
     values ($1, 'user@example.com', true, null), ($2, 'admin@example.com', false, now())`,
    [profileId, adminId]
  );
  await database.query(
    `insert into public.platform_admins(user_id, role) values ($1, 'super_admin')`,
    [adminId]
  );
  await database.query(
    `insert into public.profile_completion_reminder_attempts
      (id, profile_id, reminder_step, reason, recipient_email, status)
     values ($1, $2, 1, 'password_and_profile', 'user@example.com', 'delivery_unknown')`,
    [sourceId, profileId]
  );
});

afterAll(async () => database?.close());

describe("audited profile reminder resolution", () => {
  it("claims exactly one linked follow-up and preserves the source row", async () => {
    await database.query(
      `update public.profiles set must_set_password = false where id = $1`,
      [profileId]
    );
    const first = await database.query(
      `select * from public.claim_profile_reminder_followup($1, $2, $3)`,
      [sourceId, adminId, "Příjemce potvrdil, že původní zprávu nedostal."]
    );
    expect(first.rows[0].claimed).toBe(true);
    const followupId = first.rows[0].attempt_id;

    const replay = await database.query(
      `select * from public.claim_profile_reminder_followup($1, $2, $3)`,
      [sourceId, adminId, "Opakované volání stejného schváleného případu."]
    );
    expect(replay.rows[0]).toEqual({ attempt_id: followupId, claimed: false });

    const rows = await database.query(
      `select id, previous_attempt_id, resolution_action, reason
       from public.profile_completion_reminder_attempts order by created_at, id`
    );
    expect(rows.rows).toHaveLength(2);
    expect(rows.rows.find((row) => row.id === sourceId).resolution_action).toBe(
      "confirmed_not_delivered_retry"
    );
    expect(rows.rows.find((row) => row.id === followupId).previous_attempt_id).toBe(sourceId);
    expect(rows.rows.find((row) => row.id === followupId).reason).toBe("profile");
  });

  it("reconciles a webhook that arrives before the provider receipt is stored", async () => {
    const followup = await database.query(
      `select id from public.profile_completion_reminder_attempts where previous_attempt_id = $1`,
      [sourceId]
    );
    await database.query(
      `insert into public.registration_email_webhook_events
       (event_id, provider_message_id, event_type, delivery_status, occurred_at)
       values ('evt-before', 'email-before', 'email.delivered', 'delivered', now())`
    );
    await database.query(
      `update public.profile_completion_reminder_attempts
       set client_provider_message_id = 'email-before' where id = $1`,
      [followup.rows[0].id]
    );
    const state = await database.query(
      `select client_delivery_status from public.profile_completion_reminder_attempts where id = $1`,
      [followup.rows[0].id]
    );
    expect(state.rows[0].client_delivery_status).toBe("delivered");
  });

  it("does not reopen an attempt resolved without another email", async () => {
    const resolvedSourceId = "00000000-0000-4000-8000-000000000004";
    await database.query(
      `insert into public.profile_completion_reminder_attempts
       (id, profile_id, reminder_step, reason, recipient_email, status)
       values ($1, $2, 2, 'profile', 'user@example.com', 'delivery_unknown')`,
      [resolvedSourceId, profileId]
    );
    const resolved = await database.query(
      `select public.resolve_profile_reminder_without_resend($1, $2, $3) as resolved`,
      [resolvedSourceId, adminId, "Správce případ ověřil a uzavřel bez dalšího e-mailu."]
    );
    expect(resolved.rows[0].resolved).toBe(true);

    await expect(
      database.query(`select * from public.claim_profile_reminder_followup($1, $2, $3)`, [
        resolvedSourceId,
        adminId,
        "Uzavřený případ se už nesmí znovu otevřít k odeslání.",
      ])
    ).rejects.toThrow("already been resolved");
  });
});
