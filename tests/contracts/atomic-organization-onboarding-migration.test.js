import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const migrationPath = path.join(
  process.cwd(),
  "supabase/migrations/20260802103500_atomic_municipality_organization_onboarding.sql"
);
const migration = fs.readFileSync(migrationPath, "utf8");
const normalized = migration.toLowerCase();

describe("atomic municipality organization onboarding migration", () => {
  it("locks and consumes one pending invite inside the transaction", () => {
    expect(migration).toContain("for update;");
    expect(migration).toContain("invite_row.status <> 'pending'");
    expect(migration).toContain("invite.status = 'pending'");
    expect(migration).toContain("used_organization_id = created_organization.id");
    expect(migration).toContain("Municipality invite was used concurrently");
  });

  it("creates organization, optional activity, membership and profile context atomically", () => {
    expect(migration).toContain("insert into public.organizations");
    expect(migration).toContain("insert into public.organization_activities");
    expect(migration).toContain("insert into public.organization_members");
    expect(migration).toContain("insert into public.profiles");
    expect(migration).toContain("on conflict (id) do update");
    expect(migration).toContain("set active_organization_id = excluded.active_organization_id");
  });

  it("preserves existing profile identity and credentials", () => {
    const conflictBlock = migration.split("on conflict (id) do update")[1] || "";
    expect(conflictBlock).toContain("set active_organization_id = excluded.active_organization_id");
    expect(conflictBlock).not.toContain("email =");
    expect(conflictBlock).not.toContain("full_name =");
    expect(conflictBlock).not.toContain("is_active =");
    expect(conflictBlock).not.toContain("must_set_password =");
    expect(normalized).not.toContain("auth.users");
    expect(normalized).not.toContain("encrypted_password");
    expect(normalized).not.toContain("password_hash");
    expect(normalized).not.toContain("updateuserbyid");
    expect(normalized).not.toContain("generate_link");
  });

  it("does not delete or rewrite existing organizations, memberships or profiles", () => {
    expect(normalized).not.toContain("delete from");
    expect(normalized).not.toContain("truncate ");
    expect(normalized).not.toContain("drop table");
    expect(normalized).not.toContain("update public.organizations");
    expect(normalized).not.toContain("update public.organization_members");
    expect(normalized).not.toContain("update public.profiles");
  });

  it("serializes duplicate checks under one municipality", () => {
    expect(migration).toContain("pg_advisory_xact_lock");
    expect(migration).toContain("existing.parent_organization_id = municipality_row.id");
    expect(migration).toContain("lower(existing.name) = lower(normalized_name)");
    expect(migration).toContain("Organization already exists under this municipality");
  });

  it("is callable only by the service role", () => {
    expect(migration).toContain("from public, anon, authenticated");
    expect(migration).toContain("to service_role");
  });
});
