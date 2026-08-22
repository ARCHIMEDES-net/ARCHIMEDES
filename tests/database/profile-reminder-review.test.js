import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const migration = fs.readFileSync(
  path.join(
    process.cwd(),
    "supabase/migrations/20260822105235_fail_closed_profile_reminder_review.sql"
  ),
  "utf8"
);
const adminPage = fs.readFileSync(
  path.join(process.cwd(), "pages/portal/admin/upominky-profilu.js"),
  "utf8"
);

describe("fail-closed profile reminder review", () => {
  it("defaults every organization to no profile reminder email", () => {
    expect(migration).toContain("profile_reminders_enabled boolean not null default false");
    expect(migration).toContain("organization.profile_reminders_enabled is true");
  });

  it("keeps approval functions server-only and records every organization setting change", () => {
    expect(migration).toContain("profile_reminder_organization_settings_audit");
    expect(migration).toContain("revoke all on function public.claim_approved_profile_reminder_followup");
    expect(migration).toContain("to service_role");
  });

  it("uses truthful actions instead of treating unknown delivery as confirmed non-delivery", () => {
    expect(migration).toContain("approved_fresh_access");
    expect(migration).toContain("approved_profile_reminder");
    expect(migration).toContain("p_action text");
  });

  it("offers only individually confirmed case actions and no bulk send", () => {
    expect(adminPage).toContain("Žádná hromadná akce zde není");
    expect(adminPage).toContain("SEND_ONE_FRESH_ACCESS_EMAIL");
    expect(adminPage).toContain("SEND_ONE_PROFILE_EMAIL");
    expect(adminPage).not.toMatch(/hromadně odeslat|send all|bulk send/i);
  });
});
