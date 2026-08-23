import fs from "node:fs";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { PGlite } from "@electric-sql/pglite";

const profileId = "00000000-0000-4000-8000-000000000001";
const adminId = "00000000-0000-4000-8000-000000000002";
const sourceId = "00000000-0000-4000-8000-000000000003";
const organizationId = "00000000-0000-4000-8000-000000000010";
const blockedProfileId = "00000000-0000-4000-8000-000000000011";
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
      full_name text,
      must_set_password boolean not null default false,
      profile_completed_at timestamptz,
      is_active boolean not null default true
    );
    create table public.platform_admins(
      user_id uuid primary key references public.profiles(id),
      role text not null
    );
    create table public.organizations(
      id uuid primary key,
      name text not null,
      status text,
      is_test boolean not null default false
    );
    create table public.organization_members(
      organization_id uuid not null references public.organizations(id),
      user_id uuid not null references public.profiles(id),
      status text not null,
      unique (organization_id, user_id)
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
        "supabase/migrations/20260823090553_guard_ambiguous_profile_reminder_followups.sql"
      ),
      "utf8"
    )
  );
  await database.exec(
    fs.readFileSync(
      path.join(
        process.cwd(),
        "supabase/migrations/20260822105235_fail_closed_profile_reminder_review.sql"
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
    `insert into public.profiles(id, email, full_name, must_set_password, profile_completed_at)
     values ($1, 'user@example.com', 'Ověřený uživatel', true, null),
            ($2, 'admin@example.com', 'Správce platformy', false, now())`,
    [profileId, adminId]
  );
  await database.query(
    `insert into public.platform_admins(user_id, role) values ($1, 'super_admin')`,
    [adminId]
  );
  await database.query(
    `insert into public.organizations(id, name, status, profile_reminders_enabled)
     values ($1, 'Ověřená obec', 'active', true)`,
    [organizationId]
  );
  await database.query(
    `insert into public.organization_members(organization_id, user_id, status)
     values ($1, $2, 'active')`,
    [organizationId, profileId]
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
      `select * from public.claim_approved_profile_reminder_followup($1, $2, $3, $4)`,
      [sourceId, adminId, "Účet byl jednotlivě ověřen pro dokončení profilu.", "approved_profile_reminder"]
    );
    expect(first.rows[0].claimed).toBe(true);
    const followupId = first.rows[0].attempt_id;

    const replay = await database.query(
      `select * from public.claim_approved_profile_reminder_followup($1, $2, $3, $4)`,
      [sourceId, adminId, "Opakované volání stejného schváleného případu.", "approved_profile_reminder"]
    );
    expect(replay.rows[0]).toEqual({ attempt_id: followupId, claimed: false });

    const rows = await database.query(
      `select id, previous_attempt_id, resolution_action, reason
       from public.profile_completion_reminder_attempts order by created_at, id`
    );
    expect(rows.rows).toHaveLength(2);
    expect(rows.rows.find((row) => row.id === sourceId).resolution_action).toBe(
      "approved_profile_reminder"
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
      database.query(`select * from public.claim_approved_profile_reminder_followup($1, $2, $3, $4)`, [
        resolvedSourceId,
        adminId,
        "Uzavřený případ se už nesmí znovu otevřít k odeslání.",
        "approved_profile_reminder",
      ])
    ).rejects.toThrow("already been resolved");
  });

  it("rolls back the whole claim when an active peer still has the same identity", async () => {
    const ambiguousProfileId = "00000000-0000-4000-8000-000000000020";
    const ambiguousPeerId = "00000000-0000-4000-8000-000000000021";
    const ambiguousSourceId = "00000000-0000-4000-8000-000000000022";
    await database.query(
      `insert into public.profiles(id, email, full_name, must_set_password, profile_completed_at)
       values ($1, 'work@example.com', 'Stejná osoba', false, null),
              ($2, 'personal@example.com', 'Stejná osoba', false, null)`,
      [ambiguousProfileId, ambiguousPeerId]
    );
    await database.query(
      `insert into public.organization_members(organization_id, user_id, status)
       values ($1, $2, 'active'), ($1, $3, 'active')`,
      [organizationId, ambiguousProfileId, ambiguousPeerId]
    );
    await database.query(
      `insert into public.profile_completion_reminder_attempts
       (id, profile_id, reminder_step, reason, recipient_email, status)
       values ($1, $2, 1, 'profile', 'work@example.com', 'delivery_unknown')`,
      [ambiguousSourceId, ambiguousProfileId]
    );

    await expect(
      database.query(`select * from public.claim_approved_profile_reminder_followup($1, $2, $3, $4)`, [
        ambiguousSourceId,
        adminId,
        "Dvojice účtů zatím nemá bezpečně rozlišenou identitu.",
        "approved_profile_reminder",
      ])
    ).rejects.toThrow("ambiguous peer identity");

    const source = await database.query(
      `select resolution_action from public.profile_completion_reminder_attempts where id = $1`,
      [ambiguousSourceId]
    );
    expect(source.rows[0].resolution_action).toBeNull();
    const linked = await database.query(
      `select count(*)::int as count from public.profile_completion_reminder_attempts where previous_attempt_id = $1`,
      [ambiguousSourceId]
    );
    expect(linked.rows[0].count).toBe(0);
  });

  it("fails closed when the organization is not explicitly enabled", async () => {
    const blockedSourceId = "00000000-0000-4000-8000-000000000005";
    await database.query(
      `insert into public.profiles(id, email, must_set_password, profile_completed_at)
       values ($1, 'blocked@example.com', false, null)`,
      [blockedProfileId]
    );
    await database.query(
      `insert into public.organization_members(organization_id, user_id, status)
       values ($2, $1, 'active')`,
      [blockedProfileId, organizationId]
    );
    await database.query(
      `insert into public.profile_completion_reminder_attempts
       (id, profile_id, reminder_step, reason, recipient_email, status)
       values ($2, $1, 1, 'profile', 'blocked@example.com', 'delivery_unknown')`,
      [blockedProfileId, blockedSourceId]
    );
    await database.query(
      `update public.organizations set profile_reminders_enabled = false where id = $1`,
      [organizationId]
    );
    await expect(
      database.query(`select * from public.claim_approved_profile_reminder_followup($1, $2, $3, $4)`, [
        blockedSourceId,
        adminId,
        "Organizace zatím nemá dokončené individuální schválení.",
        "approved_profile_reminder",
      ])
    ).rejects.toThrow("not been explicitly approved");
  });
});
