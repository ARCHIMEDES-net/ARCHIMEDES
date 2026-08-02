import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const archivePath = path.join(process.cwd(), "pages/portal/archiv.js");
const source = fs.readFileSync(archivePath, "utf8");

describe("archive active organization context", () => {
  it("uses the centralized inherited organization resolver", () => {
    expect(source).toContain(
      'import { resolveActiveOrganizationContext } from "../../lib/activeOrganizationContext";'
    );
    expect(source).toContain(
      "const context = await resolveActiveOrganizationContext("
    );
    expect(source).toContain("setIsOrgAdmin(!!context?.isOrganizationAdmin)");
    expect(source).toContain("context.organizationId");
    expect(source).toContain("context.organization");
  });

  it("does not fall back to a direct membership authorization query", () => {
    expect(source).not.toContain('.from("organization_members")');
    expect(source).not.toContain("membership?.role_in_org");
  });

  it("keeps archive data access separate from issue 114", () => {
    expect(source).toContain('.from("events")');
    expect(source).toContain("attachPortalBroadcastSessions");
  });
});
