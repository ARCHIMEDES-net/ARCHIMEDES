import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const migrationPath = path.join(
  process.cwd(),
  "supabase/migrations/20260816055119_add_notification_foundation.sql"
);
const sql = fs.readFileSync(migrationPath, "utf8").toLowerCase();

describe("notification foundation migration", () => {
  it("persists recipient targeting without enabling automated sending", () => {
    expect(sql).toContain("recipient_group_codes text[] not null default '{}'::text[]");
    expect(sql).toContain("recipient_groups_configured boolean not null default false");
    expect(sql).toContain("notifications_enabled boolean not null default false");
  });

  it("creates preference, reminder, push, inbox and delivery tables", () => {
    for (const table of [
      "notification_channel_preferences",
      "event_reminder_subscriptions",
      "push_subscriptions",
      "user_notifications",
      "notification_deliveries",
    ]) {
      expect(sql).toContain(`create table if not exists public.${table}`);
      expect(sql).toContain(`alter table public.${table} enable row level security`);
    }
  });

  it("keeps the delivery ledger inaccessible to browser roles", () => {
    expect(sql).toContain(
      "revoke all on table public.notification_deliveries from anon, authenticated"
    );
    expect(sql).not.toContain("create policy notification_deliveries_");
  });

  it("uses idempotency keys and a bounded retry count", () => {
    expect(sql).toContain("unique (dedupe_key)");
    expect(sql).toContain("attempt_count between 0 and 20");
  });
});
