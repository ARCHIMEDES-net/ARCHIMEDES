import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const dashboardPath = path.join(root, "pages/portal/index.js");
const patchPath = path.join(
  root,
  "docs/implementation/121-dashboard-inherited-context.patch"
);

const dashboard = fs.readFileSync(dashboardPath, "utf8");
const patch = fs.readFileSync(patchPath, "utf8");

describe("issue 121 dashboard patch contract", () => {
  it("uses the applied inherited dashboard context", () => {
    expect(dashboard).toContain(
      'import { resolveDashboardOrganizationContext } from "../../lib/dashboardOrganizationContext";'
    );
    expect(dashboard).toContain(
      "const organizationContext = await resolveDashboardOrganizationContext({"
    );
    expect(dashboard).toContain("organizationContext.organizationId");
    expect(dashboard).toContain("organizationContext.organization");
    expect(dashboard).toContain("organizationContext.roleInOrg");
    expect(dashboard).not.toContain(
      'import { fetchMyOrganization } from "../../lib/myOrganizations";'
    );
    expect(dashboard).not.toContain('.from("organization_members")');
  });

  it("uses the tested dashboard context resolver", () => {
    expect(patch).toContain(
      'import { resolveDashboardOrganizationContext } from "../../lib/dashboardOrganizationContext";'
    );
    expect(patch).toContain(
      "const organizationContext = await resolveDashboardOrganizationContext({"
    );
    expect(patch).toContain(
      "const roleInOrg = organizationContext.roleInOrg || \"\";"
    );
  });

  it("does not change event, poster, or broadcast-session queries", () => {
    expect(patch).not.toContain('from("events")');
    expect(patch).not.toContain("stream_url");
    expect(patch).not.toContain("poster_path");
    expect(patch).not.toContain("broadcast_sessions");
  });
});
