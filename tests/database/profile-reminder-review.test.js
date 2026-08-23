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
const repairMigration = fs.readFileSync(
  path.join(
    process.cwd(),
    "supabase/migrations/20260823084402_audit_signed_in_password_flag_repair.sql"
  ),
  "utf8"
);
const identityRepairMigration = fs.readFileSync(
  path.join(
    process.cwd(),
    "supabase/migrations/20260823085501_audit_profile_full_name_repair.sql"
  ),
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

  it("repairs only a verified signed-in password flag without sending email", () => {
    expect(repairMigration).toContain("repair_signed_in_profile_password_flag");
    expect(repairMigration).toContain("auth_user.last_sign_in_at is not null");
    expect(repairMigration).toContain("set must_set_password = false");
    expect(repairMigration).toContain("resolution_action = 'repaired_password_flag'");
    expect(repairMigration).toContain("revoke all on function public.repair_signed_in_profile_password_flag");
    expect(repairMigration).toContain("to service_role");
    expect(adminPage).toContain("REPAIR_SIGNED_IN_PASSWORD_FLAG");
    expect(adminPage).toContain("Žádný e-mail se neposlal");
  });

  it("repairs one duplicate full name with an immutable server-only audit", () => {
    expect(identityRepairMigration).toContain("profile_identity_corrections_audit");
    expect(identityRepairMigration).toContain("repair_profile_full_name");
    expect(identityRepairMigration).toContain("auth_user.last_sign_in_at is not null");
    expect(identityRepairMigration).toContain("update public.profiles");
    expect(identityRepairMigration).toContain("update auth.users");
    expect(identityRepairMigration).toContain("revoke update, delete, truncate");
    expect(identityRepairMigration).toContain("to service_role");
    expect(adminPage).toContain("REPAIR_ONE_PROFILE_NAME");
  });
});
