import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const patchPath = path.join(
  process.cwd(),
  "patches/116-atomic-membership-status-ui.patch"
);
const pagePath = path.join(process.cwd(), "pages/portal/uzivatele.js");

const patch = fs.readFileSync(patchPath, "utf8");
const page = fs.readFileSync(pagePath, "utf8");
const normalizedPatch = patch.toLowerCase();

describe("atomic membership status UI patch", () => {
  it("replaces the two-step client mutation with one guarded RPC", () => {
    expect(patch).toContain('"set_organization_membership_status"');
    expect(patch).toContain("target_organization_id: organizationId");
    expect(patch).toContain("target_user_id: row.id");
    expect(patch).toContain("new_status: nextStatus");
    expect(patch).not.toContain('.update({ status: nextStatus })');
    expect(patch).not.toContain('.update({ is_active: !row.is_active })');
  });

  it("does not delete or modify Auth accounts, passwords, emails, schools, or municipalities", () => {
    expect(normalizedPatch).not.toContain("delete(");
    expect(normalizedPatch).not.toContain("auth.admin");
    expect(normalizedPatch).not.toContain("auth.users");
    expect(normalizedPatch).not.toContain("password");
    expect(normalizedPatch).not.toContain("email:");
    expect(normalizedPatch).not.toContain("organizations").not;
  });

  it("changes only toggleActive and preserves invite and organization-loading flows", () => {
    expect(patch).toContain("async function toggleActive(row)");
    expect(patch).not.toContain("handleCreateUser");
    expect(patch).not.toContain("resolveUserManagementOrganizationContext");
    expect(page).toContain('fetch("/api/invite-user"');
    expect(page).toContain("resolveUserManagementOrganizationContext");
  });
});
