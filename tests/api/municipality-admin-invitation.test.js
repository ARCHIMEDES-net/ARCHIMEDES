import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";
import {
  CUSTOMER_ONBOARDING_AUDIT_EMAIL,
  customerOnboardingAuditCopyMessage,
} from "../../lib/server/customerOnboarding";

const repositoryRoot = process.cwd();

describe("legacy municipality administrator invitation", () => {
  it("builds a separate audit copy without the activation secret", () => {
    const setupUrl =
      "https://example.test/auth/verify?token=secret-token&type=invite";
    const message = customerOnboardingAuditCopyMessage({
      email: "ict@ouzleby.cz",
      fullName: "Petr Vašíček",
      organizationName: "Obec Žleby",
      registrationNumber: "5651",
      licensePlanLabel: "12 měsíců zdarma pro obec s učebnou ARCHIMEDES",
      licenseValidUntil: "2027-07-30T23:59:59.999Z",
      setupUrl,
    });

    expect(CUSTOMER_ONBOARDING_AUDIT_EMAIL).toBe(
      "zuzana.novotna@archimedeslive.com"
    );
    expect(message.subject).toContain("Obec Žleby");
    expect(message.text).toContain("ict@ouzleby.cz");
    expect(message.text).toContain("Aktivační odkaz a token");
    expect(message.text).not.toContain(setupUrl);
    expect(message.html).not.toContain("secret-token");
  });

  it("locks the delivery audit to the service role and forbids deletion", () => {
    const migration = fs.readFileSync(
      path.join(
        repositoryRoot,
        "supabase/migrations/20260819213000_add_municipality_admin_invitation_audit.sql"
      ),
      "utf8"
    );

    expect(migration).toContain(
      "create table if not exists public.municipality_admin_invitation_attempts"
    );
    expect(migration).toContain("idempotency_key uuid not null unique");
    expect(migration).toContain(
      "alter table public.municipality_admin_invitation_attempts enable row level security"
    );
    expect(migration).toContain("to service_role");
    expect(migration).toContain("revoke delete, truncate, references, trigger");
  });
});
