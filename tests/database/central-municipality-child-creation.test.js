import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const repositoryRoot = process.cwd();
const migration = fs.readFileSync(
  path.join(
    repositoryRoot,
    "supabase/migrations/20260809114000_create_municipality_child_organization.sql"
  ),
  "utf8"
);
const normalizedMigration = migration.replace(/\s+/g, " ").toLowerCase();
const api = fs.readFileSync(
  path.join(repositoryRoot, "pages/api/admin/create-municipality-organization.js"),
  "utf8"
);
const page = fs.readFileSync(
  path.join(repositoryRoot, "pages/portal/admin/obce/[id]/nova-organizace.js"),
  "utf8"
);
const detail = fs.readFileSync(
  path.join(repositoryRoot, "pages/portal/admin/obce/[id].js"),
  "utf8"
);

describe("central municipality child organization creation", () => {
  it("requires a platform administrator in both API and database layers", () => {
    expect(api.indexOf("requirePlatformAdmin(")).toBeLessThan(
      api.indexOf("consumeAuthenticatedRateLimit(")
    );
    expect(normalizedMigration).toContain("not public.is_platform_admin()");
  });

  it("locks the municipality before duplicate checks and insertion", () => {
    const parentLock = normalizedMigration.indexOf(
      "from public.organizations organization where organization.id = p_municipality_id for update"
    );
    const duplicateCheck = normalizedMigration.indexOf(
      "and organization.license_status in ('pending_approval', 'active', 'suspended')"
    );
    const organizationInsert = normalizedMigration.indexOf(
      "insert into public.organizations ("
    );

    expect(parentLock).toBeGreaterThan(-1);
    expect(duplicateCheck).toBeGreaterThan(parentLock);
    expect(organizationInsert).toBeGreaterThan(duplicateCheck);
  });

  it("checks the active parent licence and accepted child types", () => {
    expect(normalizedMigration).toContain("clean_type not in ('school', 'association')");
    expect(normalizedMigration).toContain("municipality.org_type not in ('municipality', 'obec')");
    expect(normalizedMigration).toContain("municipality.license_status <> 'active'");
    expect(normalizedMigration).toContain("municipality.license_valid_until < now()");
  });

  it("creates the organization and association activity in one RPC without access inheritance", () => {
    expect(normalizedMigration).toContain("insert into public.organizations (");
    expect(normalizedMigration).toContain("insert into public.organization_activities (");
    expect(normalizedMigration).toContain("parent_organization_id");
    expect(normalizedMigration).not.toContain("insert into public.organization_members");
    expect(normalizedMigration).not.toContain("update public.profiles");
    expect(normalizedMigration).not.toContain("auth.users");
  });

  it("exposes only the guarded RPC to authenticated users", () => {
    expect(normalizedMigration).toContain("security invoker set search_path = ''");
    expect(normalizedMigration).toContain("from public, anon, authenticated, service_role;");
    expect(normalizedMigration).toContain("to authenticated;");
    expect(api).toContain('"create_municipality_child_organization"');
    expect(api).not.toContain('.from("organizations").insert');
  });

  it("offers the operation only inside the platform-admin municipality detail", () => {
    expect(page).toContain("<RequirePlatformAdmin>");
    expect(page).toContain('fetch("/api/admin/create-municipality-organization"');
    expect(page).toContain("samostatný tenant");
    expect(detail).toContain(`/portal/admin/obce/${"${organizationId}"}/nova-organizace`);
  });
});
