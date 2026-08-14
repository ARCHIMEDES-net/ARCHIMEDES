import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const migration = fs
  .readFileSync(
    path.join(
      process.cwd(),
      "supabase/migrations/20260809133946_harden_security_definer_functions_20260809130000.sql"
    ),
    "utf8"
  )
  .replace(/\s+/g, " ")
  .toLowerCase();

describe("authenticated SECURITY DEFINER classification", () => {
  it("removes only the three verified obsolete mutation RPCs", () => {
    expect(migration).toContain(
      "drop function if exists public.activate_municipality_with_admin(uuid, uuid, text, text, boolean)"
    );
    expect(migration).toContain(
      "drop function if exists public.activate_customer_with_admin(uuid, uuid, text, text, boolean)"
    );
    expect(migration).toContain(
      "drop function if exists public.set_featured_best_practice_post(uuid)"
    );
    expect(migration).not.toContain("drop function if exists public.activate_customer_with_admin_v2");
  });

  it("makes the legacy is_admin name an invoker wrapper", () => {
    expect(migration).toMatch(
      /create or replace function public\.is_admin\(\)[\s\S]*?security invoker set search_path = ''[\s\S]*?select public\.is_platform_admin\(\)/
    );
  });

  it.each([
    "is_platform_admin()",
    "is_org_admin_member(org_id uuid)",
    "is_school_admin()",
    "my_school_id()",
  ])("keeps required RLS helper %s scoped and search-path hardened", (signature) => {
    const escaped = signature.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    expect(migration).toMatch(
      new RegExp(
        `create or replace function public\\.${escaped}[\\s\\S]*?security definer set search_path = ''`
      )
    );
  });

  it("keeps the current activation RPC and hardens its search path", () => {
    expect(migration).toContain("alter function public.activate_customer_with_admin_v2(");
    expect(migration).toContain(") set search_path = ''");
    expect(migration).toContain(
      "grant execute on function public.activate_customer_with_admin_v2("
    );
  });

  it("preserves authenticated RLS helper grants and blocks anon", () => {
    for (const signature of [
      "public.is_platform_admin()",
      "public.is_admin()",
      "public.is_org_admin_member(uuid)",
      "public.is_school_admin()",
      "public.my_school_id()",
    ]) {
      expect(migration).toContain(`revoke all on function ${signature} from public, anon, authenticated`);
      expect(migration).toContain(`grant execute on function ${signature} to authenticated, service_role`);
    }
  });

  it("contains no application data mutations", () => {
    expect(migration).not.toMatch(/insert into public\./);
    expect(migration).not.toMatch(/update public\./);
    expect(migration).not.toMatch(/delete from public\./);
  });
});
