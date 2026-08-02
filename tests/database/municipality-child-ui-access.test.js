import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (relativePath) =>
  fs.readFileSync(path.join(root, relativePath), "utf8");

const normalized = (relativePath) =>
  read(relativePath).replace(/\s+/g, " ").trim().toLowerCase();

describe("municipality child organization UI access", () => {
  it("allows accessible inherited organizations as active profile context", () => {
    const migration = normalized(
      "supabase/migrations/20260731135000_allow_accessible_active_organization.sql"
    );

    expect(migration).toContain(
      "not public.can_view_organization(new.active_organization_id)"
    );
    expect(migration).not.toContain(
      "the active organization must be an active membership"
    );
  });

  it("loads all accessible organizations in the portal header", () => {
    const header = read("components/PortalHeader.js");

    expect(header).toContain("await fetchMyOrganizations(supabase)");
    expect(header).toContain(
      "nextOrganizations.find(\n          (org) => org.id === nextActiveOrganizationId"
    );
    expect(header).toContain(
      "activeOrganization?.role_in_org === \"organization_admin\""
    );
    expect(header).not.toContain("membershipRows");
    expect(header).not.toContain(
      "fetchMyOrganizations(supabase, memberships.map"
    );
  });

  it("uses the RPC role when switching to an inherited organization", () => {
    const header = read("components/PortalHeader.js");

    expect(header).toContain(
      "const selectedOrganization = organizations.find((org) => org.id === organizationId)"
    );
    expect(header).toContain(
      "selectedOrganization.role_in_org === \"organization_admin\""
    );
    expect(header).not.toContain("const selectedMembership = await supabase");
  });

  it("authorizes the active portal context through the scoped organization RPC", () => {
    const requireAuth = read("components/RequireAuth.js");

    expect(requireAuth).toContain("fetchMyOrganization");
    expect(requireAuth).toContain("fetchMyOrganizations");
    expect(requireAuth).toContain(
      "activeOrganization?.role_in_org === \"organization_admin\""
    );
    expect(requireAuth).not.toContain(
      '.from("organization_members")'
    );
    expect(requireAuth).not.toContain(
      ".eq(\"organization_id\", profile.active_organization_id)"
    );
  });

  it.todo("uses scoped organization access on the portal dashboard");
  it.todo("uses scoped organization access on the user management page");
});
