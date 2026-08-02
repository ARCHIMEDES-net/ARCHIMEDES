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
  it("targets the current direct-membership implementation", () => {
    expect(dashboard).toContain(
      'import { fetchMyOrganization } from "../../lib/myOrganizations";'
    );
    expect(dashboard).toContain(
      '.from("organization_members")\n              .select("organization_id, status, role_in_org")'
    );
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
