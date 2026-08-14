import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";

const repositoryRoot = process.cwd();
const migrationPath =
  "supabase/migrations/20260731132626_secure_archive_member_access.sql";
const hardeningMigrationPath =
  "supabase/migrations/20260811145828_restrict_anonymous_archive_function.sql";
const sql = fs
  .readFileSync(path.join(repositoryRoot, migrationPath), "utf8")
  .replace(/\s+/g, " ")
  .trim()
  .toLowerCase();
const hardeningSql = fs
  .readFileSync(path.join(repositoryRoot, hardeningMigrationPath), "utf8")
  .replace(/\s+/g, " ")
  .trim()
  .toLowerCase();

describe("archive access authorization", () => {
  it("removes the authenticated-user blanket read policy", () => {
    expect(sql).toContain(
      "drop policy if exists archive_select on public.archive_items"
    );
    expect(sql).not.toContain("or (auth.uid() is not null)");
  });

  it("requires active licensed organization membership for member content", () => {
    expect(sql).toContain("create or replace function public.has_active_licensed_membership()")
    expect(sql).toContain("member.status = 'active'");
    expect(sql).toContain("organization.status = 'active'");
    expect(sql).toContain("organization.license_status = 'active'");
    expect(sql).toContain("parent.license_status = 'active'");
  });

  it("preserves platform-admin and public access", () => {
    expect(sql).toContain("public.is_platform_admin()");
    expect(sql).toContain("item.visibility = 'public'");
  });

  it("supports optional organization scoping", () => {
    expect(sql).toContain("create table if not exists public.archive_item_organizations");
    expect(sql).toContain("public.can_view_organization(scope.organization_id)");
    expect(sql).toContain("not exists ( select 1 from public.archive_item_organizations scope");
  });

  it("allows only platform admins to change archive organization mappings", () => {
    expect(sql).toContain("create policy archive_item_organizations_write");
    expect(sql).toContain("using (public.is_platform_admin())");
    expect(sql).toContain("with check (public.is_platform_admin())");
  });

  it("keeps public archive reads without exposing the privileged helper to anon", () => {
    expect(hardeningSql).toContain(
      "revoke execute on function public.can_view_archive_item(uuid) from public, anon"
    );
    expect(hardeningSql).toContain("create policy archive_select_public");
    expect(hardeningSql).toContain("to anon, authenticated using (visibility = 'public')");
  });

  it("preserves licensed archive access for authenticated users", () => {
    expect(hardeningSql).toContain(
      "grant execute on function public.can_view_archive_item(uuid) to authenticated, service_role"
    );
    expect(hardeningSql).toContain("create policy archive_select_licensed");
    expect(hardeningSql).toContain(
      "to authenticated using (public.can_view_archive_item(id))"
    );
  });

  it("uses an empty search path for the privileged archive helper", () => {
    expect(hardeningSql).toContain(
      "alter function public.can_view_archive_item(uuid) set search_path = ''"
    );
  });

});
