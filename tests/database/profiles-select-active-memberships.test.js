import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";

const migrationPath = path.join(
  process.cwd(),
  "supabase/migrations/20260731123000_harden_profiles_select_active_memberships.sql"
);

const sql = fs.readFileSync(migrationPath, "utf8").replace(/\s+/g, " ").toLowerCase();

describe("profiles_select active-membership boundary", () => {
  it("keeps self and platform-admin profile reads", () => {
    expect(sql).toContain("id = auth.uid()");
    expect(sql).toContain("public.is_platform_admin()");
  });

  it("requires active target and viewer memberships", () => {
    expect(sql).toContain("target_member.status = 'active'");
    expect(sql).toContain("viewer_member.status = 'active'");
  });

  it("replaces the existing profiles_select policy", () => {
    expect(sql).toContain("drop policy if exists profiles_select on public.profiles");
    expect(sql).toContain("create policy profiles_select on public.profiles for select to authenticated");
  });
});
