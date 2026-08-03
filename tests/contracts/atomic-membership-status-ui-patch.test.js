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
const addedLines = patch
  .split("\n")
  .filter((line) => line.startsWith("+") && !line.startsWith("+++"))
  .map((line) => line.slice(1))
  .join("\n");
const normalizedAddedLines = addedLines.toLowerCase();

describe("atomic membership status UI patch", () => {
  it("replaces the two-step client mutation with one guarded RPC", () => {
    expect(addedLines).toContain('"set_organization_membership_status"');
    expect(addedLines).toContain("target_organization_id: organizationId");
    expect(addedLines).toContain("target_user_id: row.id");
    expect(addedLines).toContain("new_status: nextStatus");
    expect(addedLines).not.toContain('.update({ status: nextStatus })');
    expect(addedLines).not.toContain('.update({ is_active: !row.is_active })');
  });

  it("does not delete or modify Auth accounts, passwords, emails, schools, or municipalities", () => {
    expect(normalizedAddedLines).not.toContain("delete(");
    expect(normalizedAddedLines).not.toContain("auth.admin");
    expect(normalizedAddedLines).not.toContain("auth.users");
    expect(normalizedAddedLines).not.toContain("password");
    expect(normalizedAddedLines).not.toContain("email:");
    expect(normalizedAddedLines).not.toContain("update public.organizations");
    expect(normalizedAddedLines).not.toContain("delete from public.organizations");
  });

  it("changes only toggleActive and preserves invite and organization-loading flows", () => {
    expect(patch).toContain("async function toggleActive(row)");
    expect(patch).not.toContain("handleCreateUser");
    expect(patch).not.toContain("resolveUserManagementOrganizationContext");
    expect(page).toContain('fetch("/api/invite-user"');
    expect(page).toContain("resolveUserManagementOrganizationContext");
  });
});
