import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";

const read = (relativePath) =>
  fs.readFileSync(path.join(process.cwd(), relativePath), "utf8");

describe("broadcast inherited organization access contract", () => {
  it("uses the shared organization access resolver", () => {
    const source = read("lib/server/broadcastAccess.js");

    expect(source).toContain(
      'import { resolveOrganizationAccess } from "./organizationAccess"'
    );
    expect(source).toContain("await resolveOrganizationAccess({");
    expect(source).toContain("organizationId: identity.organizationId");
    expect(source).not.toContain(
      '.from("organization_members")\n    .select("organization_id")'
    );
  });

  it("preserves license inheritance and join-window protections", () => {
    const source = read("lib/server/broadcastAccess.js");

    expect(source).toContain("hasActiveLicense(organization)");
    expect(source).toContain("organization.parent_organization_id");
    expect(source).toContain("Vstup se otevře 15 minut před začátkem vysílání.");
    expect(source).toContain("Živé vysílání už skončilo.");
  });
});
