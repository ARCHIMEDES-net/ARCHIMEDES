import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

describe("auditované písemné přijetí objednávky", () => {
  const api = read("pages/api/admin/activate-municipality.js");
  const mail = read("lib/server/customerOnboarding.js");
  const portal = read("pages/portal/admin/obce.js");
  const migration = read(
    "supabase/migrations/20260815124500_add_written_order_acceptance_audit.sql"
  );

  it("odděluje právní potvrzení objednateli od přístupu lokálního správce", () => {
    expect(api).toContain("ensureWrittenOrderAcceptance");
    expect(api).toContain("customer.terms_accepted_at");
    expect(api.indexOf("await ensureWrittenOrderAcceptance")).toBeLessThan(
      api.indexOf("resolveLocalAdministrator({", api.indexOf("await ensureWrittenOrderAcceptance"))
    );
    expect(mail).toContain("sendWrittenOrderAcceptanceEmail");
    expect(mail).toContain("sendCustomerOnboardingEmail");
    expect(mail).toContain("písemně přijímá závaznou objednávku");
  });

  it("neaktivuje webovou objednávku při neznámém doručení", () => {
    expect(api).toContain('status: "delivery_unknown"');
    expect(api).toContain("Obec nebyla aktivována; e-mail automaticky neopakujte");
    expect(api).toContain('["sending", "delivery_unknown"]');
  });

  it("váže přijetí na přesný smluvní snapshot", () => {
    for (const field of [
      "recipient_email",
      "license_plan",
      "license_started_at",
      "license_valid_until",
      "billing_status",
      "legal_document_version",
    ]) {
      expect(api).toContain(field);
      expect(migration).toContain(field);
    }
    expect(migration).toContain("organization_id uuid not null unique");
    expect(migration).toContain("acceptance_reference uuid not null unique");
    expect(migration).toContain("customer_order_acceptances_performed_by_idx");
  });

  it("v administraci vysvětluje automatické pořadí Zuzaně", () => {
    expect(portal).toContain("systém nejprve odešle objednateli auditované písemné přijetí");
    expect(portal).toContain("teprve po úspěšném odeslání aktivuje zákazníka");
  });
});
