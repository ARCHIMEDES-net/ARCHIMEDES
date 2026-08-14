import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const migration = fs
  .readFileSync(
    path.join(
      process.cwd(),
      "supabase/migrations/20260814050346_add_service_onboarding_entrypoint.sql"
    ),
    "utf8"
  )
  .replace(/\s+/g, " ")
  .toLowerCase();

describe("service onboarding entrypoint database contract", () => {
  const signatures = [
    "public.onboard_customer_service_v1(",
    "public.claim_onboarding_email_attempt_service_v1(",
    "public.complete_onboarding_email_attempt_service_v1(",
  ];

  it.each(signatures)("keeps %s service-role-only", (signature) => {
    const functionStart = migration.indexOf(`create or replace function ${signature}`);
    expect(functionStart).toBeGreaterThanOrEqual(0);
    const functionBody = migration.slice(functionStart);
    expect(functionBody).toContain("security definer set search_path = ''");
    expect(functionBody).toContain("auth.jwt() ->> 'role'");
    expect(functionBody).toContain("<> 'service_role'");
  });

  it("validates a live platform-admin actor before binding auth.uid", () => {
    const actorValidation = migration.indexOf("platform_admin.role in ('admin', 'super_admin')");
    const bindActor = migration.indexOf(
      "set_config('request.jwt.claim.sub', p_performed_by::text, true)"
    );

    expect(actorValidation).toBeGreaterThanOrEqual(0);
    expect(bindActor).toBeGreaterThan(actorValidation);
    expect(migration).toContain("profile.is_active = true");
    expect(migration).toContain("lower(btrim(profile.email)) = lower(btrim(auth_user.email))");
  });

  it("delegates to the audited functions instead of duplicating mutations", () => {
    expect(migration).toContain("from public.onboard_customer_v3(");
    expect(migration).toContain("from public.claim_onboarding_email_attempt(");
    expect(migration).toContain("from public.complete_onboarding_email_attempt(");
    expect(migration).not.toMatch(/insert into public\./);
    expect(migration).not.toMatch(/update public\./);
    expect(migration).not.toMatch(/delete from public\./);
  });

  it.each(signatures)("revokes %s broadly and grants only service_role", (signature) => {
    const revoke = migration.indexOf(`revoke all on function ${signature}`);
    const grant = migration.indexOf(`grant execute on function ${signature}`, revoke);
    expect(revoke).toBeGreaterThanOrEqual(0);
    expect(grant).toBeGreaterThan(revoke);
    expect(migration.slice(revoke, grant)).toContain(
      "from public, anon, authenticated, service_role"
    );
    expect(migration.slice(grant, grant + 350)).toContain("to service_role");
  });
});
