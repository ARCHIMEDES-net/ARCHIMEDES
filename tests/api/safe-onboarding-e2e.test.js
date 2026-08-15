import { describe, expect, it } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

const read = (path) => readFileSync(resolve(process.cwd(), path), "utf8");

describe("safe production onboarding E2E contracts", () => {
  it("uses an application confirmation dialog instead of window.confirm for activation", () => {
    const page = read("pages/portal/admin/obce.js");
    expect(page).toContain('role="dialog"');
    expect(page).toContain("Potvrdit a aktivovat");
    expect(page).not.toContain("Dokončit onboarding: ${typeLabel");
  });

  it("requires an expiring server-side run and exact allowlisted identity", () => {
    const route = read("pages/api/admin/onboarding-test-runs.js");
    const guards = read("lib/server/onboardingTestRuns.js");
    const orderRoute = read("pages/api/zadost-o-pristup.js");
    const activationRoute = read("pages/api/admin/activate-municipality.js");

    expect(guards).toContain("ONBOARDING_E2E_EMAIL_ALLOWLIST");
    expect(route).toContain("findAuthUserByEmail");
    expect(orderRoute).toContain('testRun.status !== "prepared"');
    expect(orderRoute).toContain("testRun.expected_organization_name !== cleanOrganization");
    expect(activationRoute).toContain('testRun.status !== "submitted"');
    expect(activationRoute).toContain("testRun.allowed_email !== localAdminEmail");
  });

  it("keeps cleanup service-only and guarded against cross-customer deletion", () => {
    const migration = read(
      "supabase/migrations/20260815073958_add_safe_onboarding_e2e_runs.sql"
    );
    expect(migration).toContain("is_test = true");
    expect(migration).toContain("test_run_id = test_run.id");
    expect(migration).toContain("Test local administrator has non-test memberships");
    expect(migration).toContain(
      "revoke all on function public.cleanup_onboarding_test_run_service_v1"
    );
    expect(migration).toContain("to service_role");
  });

  it("verifies delivery before cleanup and always attempts emergency cleanup", () => {
    const runner = read("scripts/run-production-onboarding-e2e.mjs");
    expect(runner).toContain('verified.acceptance?.status !== "sent"');
    expect(runner).toContain('verified.onboarding?.email_status !== "sent"');
    expect(runner).toContain("finally");
    expect(runner).toContain("Emergency cleanup failed");
  });
});
