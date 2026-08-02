import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const repoRoot = process.cwd();
const pagePath = path.join(repoRoot, "pages/portal/udalost/[id].js");
const patchPath = path.join(
  repoRoot,
  "docs/implementation/123-event-detail-inherited-license-context.patch"
);

function read(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

describe("event detail inherited license patch", () => {
  it("uses the applied inherited license context", () => {
    const page = read(pagePath);
    expect(page).toContain(
      'import { resolveEventDetailLicenseContext } from "../../../lib/eventDetailLicenseContext";'
    );
    expect(page).toContain("const licenseContext = await resolveEventDetailLicenseContext({");
    expect(page).toContain("setActiveOrganizationId(licenseContext.organizationId || \"\")");
    expect(page).toContain("const mode = licenseContext.licenseMode;");
    expect(page).not.toContain('from("organization_members")');
    expect(page).not.toContain('import { resolveLicenseMode } from "../../../lib/licenseMode";');
    expect(page).not.toContain('import { fetchMyOrganization } from "../../../lib/myOrganizations";');
  });

  it("uses only the dedicated event-detail license resolver", () => {
    const patch = read(patchPath);
    expect(patch).toContain("resolveEventDetailLicenseContext");
    expect(patch).toContain("licenseContext.organizationId");
    expect(patch).toContain("licenseContext.licenseMode");
    expect(patch).not.toContain("stream_url");
    expect(patch).not.toContain("poster_path");
    expect(patch).not.toContain("worksheet");
    expect(patch).not.toContain("attendance");
    expect(patch).not.toContain("WebMeeting");
  });

  it("does not change event loading or broadcast attachment", () => {
    const page = read(pagePath);
    expect(page).toContain('from("events")');
    expect(page).toContain("attachPortalBroadcastSession");
    expect(page).toContain("JoinBroadcastButton");
  });
});
