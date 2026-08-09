import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";

const migrationPath = path.join(
  process.cwd(),
  "supabase/migrations/20260809102826_restore_direct_organization_isolation_20260809100250.sql"
);
const sql = fs.readFileSync(migrationPath, "utf8").replace(/\s+/g, " ").toLowerCase();

function functionBody(name) {
  return sql.match(
    new RegExp(`create or replace function public\\.${name}\\([\\s\\S]*?\\$\\$;`)
  )?.[0];
}

describe("direct organization isolation restoration", () => {
  it("keeps platform administrators globally authorized", () => {
    expect(sql).toContain("public.is_platform_admin()");
  });

  it("allows administration only through an active direct admin membership", () => {
    const body = functionBody("can_administer_organization");

    expect(body).toBeTruthy();
    expect(body).toContain("direct_admin.organization_id = target_org_id");
    expect(body).toContain("direct_admin.user_id = (select auth.uid())");
    expect(body).toContain("direct_admin.role_in_org = 'organization_admin'");
    expect(body).toContain("direct_admin.status = 'active'");
    expect(body).not.toContain("parent_organization_id");
    expect(body).not.toContain("municipality_admin");
  });

  it("allows organization visibility only through active direct membership", () => {
    const body = functionBody("can_view_organization");

    expect(body).toBeTruthy();
    expect(body).toContain("member.organization_id = target_org_id");
    expect(body).toContain("member.user_id = (select auth.uid())");
    expect(body).toContain("member.status = 'active'");
    expect(body).not.toContain("parent_organization_id");
  });

  it("returns only direct memberships from the organization RPC", () => {
    const body = functionBody("get_my_organizations");

    expect(body).toBeTruthy();
    expect(body).toContain("member.user_id = (select auth.uid())");
    expect(body).toContain("member.status = 'active'");
    expect(body).not.toContain("child.parent_organization_id = municipality.id");
    expect(body).not.toContain("municipality_admin.role_in_org");
  });

  it("preserves parent-license inheritance without granting parent access", () => {
    const body = functionBody("get_my_organizations");

    expect(body).toContain("parent.id = organization.parent_organization_id");
    expect(body).toContain("parent.license_status = 'active'");
    expect(body).toContain("parent.license_valid_until");
  });

  it("uses hardened security-definer configuration and scoped grants", () => {
    expect(sql.match(/set search_path = ''/g)).toHaveLength(3);
    expect(sql).toContain(
      "revoke all on function public.can_administer_organization(uuid) from public, anon"
    );
    expect(sql).toContain(
      "grant execute on function public.can_administer_organization(uuid) to authenticated, service_role"
    );
  });
});
