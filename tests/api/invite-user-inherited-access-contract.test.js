import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";

const source = fs.readFileSync(
  path.join(process.cwd(), "pages/api/invite-user.js"),
  "utf8"
);

describe("invite-user inherited organization access", () => {
  it("authorizes the active school through the shared organization access resolver", () => {
    expect(source).toContain(
      'import { resolveOrganizationAccess } from "../../lib/server/organizationAccess"'
    );
    expect(source).toContain("const inviterAccess = await resolveOrganizationAccess({");
    expect(source).toContain("organizationId,");
    expect(source).toContain("requireAdmin: true");
  });

  it("does not require a false direct membership in the active school", () => {
    expect(source).not.toContain("const { data: inviterMembership");
    expect(source).not.toContain("inviterMembership.role_in_org");
    expect(source).not.toContain("const organizationId = inviterMembership.organization_id");
  });

  it("keeps invitations restricted to active schools", () => {
    expect(source).toContain('organization.org_type !== "school"');
    expect(source).toContain('organization.status !== "active"');
  });
});
