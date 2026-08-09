import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const repositoryRoot = process.cwd();
const migration = fs.readFileSync(
  path.join(
    repositoryRoot,
    "supabase/migrations/20260809120503_require_explicit_child_license_plan_20260809115500.sql"
  ),
  "utf8"
);
const normalizedMigration = migration.replace(/\s+/g, " ").toLowerCase();

describe("child organization effective license", () => {
  it("updates every portal authorization surface", () => {
    expect(normalizedMigration).toContain(
      "create or replace function public.get_my_organizations"
    );
    expect(normalizedMigration).toContain("create policy event_attendees_insert");
    expect(normalizedMigration).toContain(
      "create or replace function public.get_portal_broadcast_sessions"
    );
    expect(normalizedMigration).toContain(
      "create or replace function public.get_portal_archive_events"
    );
    expect(normalizedMigration).toContain(
      "create or replace function public.has_active_licensed_membership"
    );
  });

  it("requires an explicit plan before a child license can override its parent", () => {
    const explicitLicenseChecks = normalizedMigration.match(
      /parent_organization_id is null\s+or [a-z.]+license_plan is not null/g
    );

    expect(explicitLicenseChecks).toHaveLength(6);
  });

  it("keeps standalone organizations and explicit child licenses independent", () => {
    expect(normalizedMigration).toContain("organization.parent_organization_id is null");
    expect(normalizedMigration).toContain("organization.license_plan is not null");
    expect(normalizedMigration).toContain("o.parent_organization_id is null");
    expect(normalizedMigration).toContain("o.license_plan is not null");
  });

  it("keeps municipality fallback and validates its active expiry", () => {
    const parentTypeChecks = normalizedMigration.match(
      /lower\([^)]*parent\.org_type[^)]*\) in \('municipality', 'obec'\)/g
    );
    const parentExpiryChecks = normalizedMigration.match(
      /parent\.license_valid_until is null or parent\.license_valid_until >= now\(\)/g
    );

    expect(parentTypeChecks?.length).toBeGreaterThanOrEqual(5);
    expect(parentExpiryChecks?.length).toBeGreaterThanOrEqual(6);
  });

  it("does not mutate organizations, memberships, profiles, or users", () => {
    expect(normalizedMigration).not.toMatch(/update public\.organizations/);
    expect(normalizedMigration).not.toMatch(/delete from public\.organizations/);
    expect(normalizedMigration).not.toMatch(/insert into public\.organizations/);
    expect(normalizedMigration).not.toMatch(/insert into public\.organization_members/);
    expect(normalizedMigration).not.toMatch(/update public\.profiles/);
    expect(normalizedMigration).not.toContain("auth.users");
  });

  it("uses fixed search paths and preserves restricted grants", () => {
    expect(normalizedMigration.match(/set search_path = ''/g)).toHaveLength(4);
    expect(normalizedMigration).toContain(
      "grant execute on function public.has_active_licensed_membership() to authenticated, service_role"
    );
  });
});
