import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const migrationPath = path.join(
  process.cwd(),
  "supabase/migrations/20260802094500_atomic_organization_membership_status.sql"
);
const migration = fs.readFileSync(migrationPath, "utf8");
const normalized = migration.toLowerCase();

describe("atomic organization membership status migration", () => {
  it("creates a guarded RPC scoped to one membership", () => {
    expect(migration).toContain(
      "create or replace function public.set_organization_membership_status"
    );
    expect(migration).toContain(
      "public.can_administer_organization(target_organization_id)"
    );
    expect(migration).toContain("new_status not in ('active', 'inactive')");
    expect(migration).toContain("for update");
    expect(migration).toContain(
      "where membership.organization_id = target_organization_id"
    );
    expect(migration).toContain("and membership.user_id = target_user_id");
  });

  it("protects the last active administrator and self-deactivation", () => {
    expect(migration).toContain(
      "The last active organization administrator cannot be deactivated"
    );
    expect(migration).toContain(
      "Administrators cannot deactivate their own membership"
    );
    expect(migration).toContain("active_admin_count <= 1");
  });

  it("does not delete or mutate accounts, profiles, organizations, or credentials", () => {
    expect(normalized).not.toContain("delete from");
    expect(normalized).not.toContain("truncate ");
    expect(normalized).not.toContain("drop table");
    expect(normalized).not.toContain("update public.profiles");
    expect(normalized).not.toContain("update profiles");
    expect(normalized).not.toContain("auth.users");
    expect(normalized).not.toContain("password");
    expect(normalized).not.toContain("email");
    expect(normalized).not.toContain("update public.organizations");
    expect(normalized).not.toContain("insert into public.organization_members");
    expect(normalized).not.toContain("delete from public.organization_members");
  });

  it("does not contain a data migration outside the requested membership update", () => {
    const updates = normalized.match(/update public\.organization_members/g) || [];
    expect(updates).toHaveLength(1);
    expect(normalized).not.toContain("where true");
    expect(normalized).not.toContain("set status = 'inactive'");
    expect(normalized).not.toContain("set status = 'active'");
  });
});
