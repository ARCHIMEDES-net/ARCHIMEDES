import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";

const migrationPath = path.join(
  process.cwd(),
  "supabase/migrations/20260731131500_municipality_admin_child_access.sql"
);
const sql = fs.readFileSync(migrationPath, "utf8").replace(/\s+/g, " ").toLowerCase();

describe("municipality administrator child-organization access", () => {
  it("keeps platform administrators globally authorized", () => {
    expect(sql).toContain("public.is_platform_admin()");
  });

  it("requires an active organization_admin membership on the parent municipality", () => {
    expect(sql).toContain("target.parent_organization_id");
    expect(sql).toContain("lower(municipality.org_type) in ('municipality', 'obec')");
    expect(sql).toContain("municipality_admin.role_in_org = 'organization_admin'");
    expect(sql).toContain("municipality_admin.status = 'active'");
  });

  it("does not grant inherited access to ordinary members", () => {
    const inheritedAccessBlock = sql.match(
      /join public\.organization_members municipality_admin[\s\S]*?and municipality_admin\.status = 'active'/
    )?.[0];

    expect(inheritedAccessBlock).toBeTruthy();
    expect(inheritedAccessBlock).toContain(
      "municipality_admin.role_in_org = 'organization_admin'"
    );
  });

  it("uses one central helper for organization-member administration policies", () => {
    for (const policy of [
      "org_members_write",
      "org_members_update",
      "org_members_delete",
    ]) {
      expect(sql).toContain(`create policy ${policy}`);
    }
    expect(sql).toContain("public.can_administer_organization(organization_id)");
  });

  it("adds child organizations to the scoped organization RPC", () => {
    expect(sql).toContain("create or replace function public.get_my_organizations");
    expect(sql).toContain("child.parent_organization_id = municipality.id");
    expect(sql).toContain("'organization_admin'::text as role_in_org");
  });

  it("keeps helper functions unavailable to anonymous users", () => {
    expect(sql).toContain(
      "revoke execute on function public.can_administer_organization(uuid) from public, anon, authenticated"
    );
    expect(sql).toContain(
      "grant execute on function public.can_administer_organization(uuid) to authenticated, service_role"
    );
  });
});
