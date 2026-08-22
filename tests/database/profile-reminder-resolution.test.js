import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const migration = fs.readFileSync(
  path.join(
    process.cwd(),
    "supabase/migrations/20260822094500_audit_profile_reminder_resolution.sql"
  ),
  "utf8"
);

const followupMigration = fs.readFileSync(
  path.join(
    process.cwd(),
    "supabase/migrations/20260822101500_index_profile_reminder_resolved_by.sql"
  ),
  "utf8"
);

describe("audited profile reminder resolution migration", () => {
  it("preserves old attempts and links at most one explicit follow-up", () => {
    expect(migration).toContain("previous_attempt_id uuid");
    expect(migration).toContain("confirmed_not_delivered_retry");
    expect(migration).toContain("profile_completion_reminder_followup_unique_idx");
    expect(migration).toContain("return query select existing_attempt_id, false");
    expect(migration).not.toMatch(/delete\s+from\s+public\.profile_completion_reminder_attempts/i);
  });

  it("stores idempotent provider events without customer-visible content", () => {
    expect(migration).toContain("create table public.registration_email_webhook_events");
    expect(migration).toContain("event_id text primary key");
    expect(migration).toContain("provider_message_id text not null");
    expect(migration).not.toContain("raw_payload");
    expect(migration).not.toContain("grant delete");
  });

  it("keeps manual retry server-only and requires an administrator reason", () => {
    expect(migration).toContain("length(btrim(p_reason)) not between 20 and 1000");
    expect(migration).toContain("grant execute on function public.claim_profile_reminder_followup");
    expect(migration).toContain("to service_role");
    expect(migration).toContain("from public, anon, authenticated");
  });

  it("indexes the resolution actor foreign key", () => {
    expect(followupMigration).toContain(
      "create index if not exists profile_completion_reminder_resolved_by_idx"
    );
    expect(followupMigration).toContain("on public.profile_completion_reminder_attempts (resolved_by)");
  });
});
