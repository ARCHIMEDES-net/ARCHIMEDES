import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const migrationPath = path.join(
  process.cwd(),
  "supabase/migrations/20260809104931_fix_116_atomic_membership_status_20260809103704.sql"
);
const pagePath = path.join(process.cwd(), "pages/portal/uzivatele.js");

const migration = fs.readFileSync(migrationPath, "utf8");
const normalizedMigration = migration.replace(/\s+/g, " ").toLowerCase();
const page = fs.readFileSync(pagePath, "utf8");
const toggleActive = page.match(
  /async function toggleActive\(row\) \{[\s\S]*?\n  \}/
)?.[0];

describe("atomic organization membership status", () => {
  it("authorizes through the direct-organization helper before and after locking", () => {
    expect(
      normalizedMigration.match(
        /public\.can_administer_organization\(target_organization_id\)/g
      )
    ).toHaveLength(2);
    expect(normalizedMigration).toContain("if (select auth.uid()) is null");
  });

  it("uses one consistent organization lock before the membership row lock", () => {
    const organizationLock = normalizedMigration.indexOf(
      "from public.organizations organization where organization.id = target_organization_id for update"
    );
    const membershipLock = normalizedMigration.indexOf(
      "from public.organization_members membership where membership.organization_id = target_organization_id and membership.user_id = target_user_id for update"
    );

    expect(organizationLock).toBeGreaterThan(-1);
    expect(membershipLock).toBeGreaterThan(organizationLock);
  });

  it("protects self-deactivation and the last active administrator", () => {
    expect(normalizedMigration).toContain(
      "target_user_id = (select auth.uid()) and new_status = 'inactive'"
    );
    expect(normalizedMigration).toContain(
      "administrator.user_id <> target_user_id"
    );
    expect(normalizedMigration).toContain(
      "posledního aktivního administrátora organizace nelze deaktivovat"
    );
  });

  it("changes only the selected membership and never the global profile", () => {
    expect(normalizedMigration.match(/update public\.organization_members/g)).toHaveLength(1);
    expect(normalizedMigration).not.toContain("update public.profiles");
    expect(normalizedMigration).not.toContain("auth.users");
    expect(normalizedMigration).not.toContain("delete from");
  });

  it("exposes only the guarded RPC to authenticated clients", () => {
    expect(normalizedMigration).toContain("set search_path = ''");
    expect(normalizedMigration).toContain(
      "from public, anon, authenticated, service_role"
    );
    expect(normalizedMigration).toContain("to authenticated;");
    expect(normalizedMigration).not.toContain("to authenticated, service_role");
    expect(normalizedMigration).toContain(
      "revoke update on table public.organization_members from authenticated"
    );
  });

  it("replaces the two-step browser mutation with one RPC call", () => {
    expect(toggleActive).toBeTruthy();
    expect(toggleActive).toContain('"set_organization_membership_status"');
    expect(toggleActive).toContain("target_organization_id: organizationId");
    expect(toggleActive).toContain("target_user_id: row.id");
    expect(toggleActive).toContain("new_status: nextStatus");
    expect(toggleActive).not.toContain('.from("organization_members")');
    expect(toggleActive).not.toContain('.from("profiles")');
  });
});
