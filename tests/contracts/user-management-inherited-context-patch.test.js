import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (relativePath) =>
  fs.readFileSync(path.join(root, relativePath), "utf8");

const patch = read("patches/122-user-management-inherited-context.patch");
const page = read("pages/portal/uzivatele.js");

describe("user management inherited context patch", () => {
  it("keeps the inherited organization context integration applied", () => {
    expect(page).toContain(
      'import { resolveUserManagementOrganizationContext } from "../../lib/userManagementOrganizationContext";'
    );
    expect(page).toContain(
      "const context = await resolveUserManagementOrganizationContext({"
    );
    expect(page).toContain("const organization = context.organization;");
    expect(page).toContain("const admin = context.isOrganizationAdmin;");

    expect(page).not.toContain(
      'import { fetchMyOrganization } from "../../lib/myOrganizations";'
    );
    expect(page).not.toContain("let membership = null;");
    expect(page).not.toContain(
      'const admin = membership.role_in_org === "organization_admin";'
    );

    expect(patch).toContain("resolveUserManagementOrganizationContext");
    expect(patch).not.toContain("toggleActive");
  });

  it("does not alter deactivation behavior owned by issue 116", () => {
    expect(page).toContain("async function toggleActive(row)");
    expect(page).toContain('.from("organization_members")');
    expect(page).toContain('.update({ status: nextStatus })');
    expect(page).toContain('.from("profiles")');
    expect(page).toContain('.update({ is_active: !row.is_active })');

    expect(patch).not.toContain("is_active: !row.is_active");
    expect(patch).not.toContain("nextStatus");
    expect(patch).not.toContain("updateMembershipError");
    expect(patch).not.toContain("updateProfileError");
  });

  it("preserves invite flow and school-only account management", () => {
    expect(page).toContain('fetch("/api/invite-user"');
    expect(page).toContain('if (organizationType !== "school")');
    expect(page).toContain("Samostatné účty jednotlivých členů jsou určené pouze školám");

    expect(patch).not.toContain("/api/invite-user");
    expect(patch).not.toContain("organizationType !== \"school\"");
    expect(patch).not.toContain("handleCreateUser");
  });

  it("does not mutate Auth accounts, passwords, memberships, or production data", () => {
    const normalized = patch.toLowerCase();

    expect(normalized).not.toContain("auth.admin");
    expect(normalized).not.toContain("updateuserbyid");
    expect(normalized).not.toContain("deleteuser");
    expect(normalized).not.toContain("createuser");
    expect(normalized).not.toContain("password:");
    expect(normalized).not.toContain(".insert(");
    expect(normalized).not.toContain(".upsert(");
    expect(normalized).not.toContain(".delete(");
  });
});
