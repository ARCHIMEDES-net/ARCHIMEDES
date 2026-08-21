import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const migration = fs.readFileSync(
  path.join(
    process.cwd(),
    "supabase/migrations/20260819230000_add_registration_email_provider_receipts.sql"
  ),
  "utf8"
);
const reminderFailureMigration = fs.readFileSync(
  path.join(
    process.cwd(),
    "supabase/migrations/20260820090000_allow_retryable_profile_reminder_failures.sql"
  ),
  "utf8"
);

describe("registration email provider audit", () => {
  it("stores client and safe-copy provider receipts for every registration flow", () => {
    for (const table of [
      "municipality_admin_invitation_attempts",
      "organization_onboarding_email_attempts",
      "customer_order_acceptances",
      "profile_completion_reminder_attempts",
    ]) {
      expect(migration).toContain(`alter table public.${table}`);
    }
    expect(migration).toContain("client_provider_message_id");
    expect(migration).toContain("audit_copy_provider_message_id");
    expect(migration).toContain("email_provider is null or email_provider = 'resend'");
  });

  it("only adds the narrow service-role write needed by the RPC-owned onboarding audit", () => {
    expect(migration).toContain("grant update (");
    expect(migration).toContain(
      ") on public.organization_onboarding_email_attempts to service_role"
    );
    expect(migration).not.toContain("grant delete");
  });

  it("allows retry only after a confirmed pre-delivery reminder failure", () => {
    expect(reminderFailureMigration).toContain(
      "check (status in ('sending', 'sent', 'failed', 'delivery_unknown'))"
    );
    expect(reminderFailureMigration).toContain(
      "delivery_unknown always requires manual review"
    );
  });
});
