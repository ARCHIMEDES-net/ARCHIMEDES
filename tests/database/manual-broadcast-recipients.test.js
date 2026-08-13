import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const migrationPath = path.join(
  process.cwd(),
  "supabase/migrations/20260813105516_add_manual_broadcast_recipients.sql"
);
const sql = fs.readFileSync(migrationPath, "utf8").toLowerCase();

describe("manual broadcast recipients migration", () => {
  it("stores a bounded list on each broadcast session", () => {
    expect(sql).toContain("alter table public.broadcast_sessions");
    expect(sql).toContain("manual_recipient_emails text[] not null default '{}'::text[]");
    expect(sql).toContain("cardinality(manual_recipient_emails) <= 200");
  });

  it("does not alter the attendee-facing broadcast RPC", () => {
    expect(sql).not.toContain("get_portal_broadcast_sessions");
  });
});
