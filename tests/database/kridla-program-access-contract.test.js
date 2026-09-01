import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";

const migration = fs.readFileSync(
  path.join(
    process.cwd(),
    "supabase/migrations/20260901132340_add_kridla_program_access.sql"
  ),
  "utf8"
);

describe("Křídla restricted program access", () => {
  it("adds explicit foundation and child-home organization types", () => {
    expect(migration).toContain("'foundation'::text");
    expect(migration).toContain("'child_home'::text");
  });

  it("uses a private, size-limited storage bucket", () => {
    expect(migration).toContain("'program-materials'");
    expect(migration).toContain("false,\n  26214400");
    expect(migration).toContain("program_materials_select");
    expect(migration).toContain("public.has_access_program(resource.program_id)");
  });

  it("keeps authorization server-side and revokes anonymous execution", () => {
    expect(migration).toContain("security definer");
    expect(migration).toContain(
      "revoke all on function public.has_access_program(uuid) from public, anon"
    );
    expect(migration).toContain("member.user_id = (select auth.uid())");
    expect(migration).toContain("get_access_program_organizations");
    expect(migration).not.toContain("drop policy if exists orgs_select");
  });

  it("seeds only the verified foundation and memorandum homes", () => {
    expect(migration).toContain("'21999481'");
    expect(migration).toContain("'47813571'");
    expect(migration).toContain("'62330268'");
    expect(migration).toContain("'47811927'");
    expect(migration).toContain("'kridla-pro-budoucnost'");
  });
});
