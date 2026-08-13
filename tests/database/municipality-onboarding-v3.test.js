import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";

const migrationPath = path.join(
  process.cwd(),
  "supabase/migrations/20260813154650_harden_municipality_onboarding.sql"
);
const source = fs.readFileSync(migrationPath, "utf8");
const normalized = source.replace(/\s+/g, " ").trim().toLowerCase();
const functionBody = normalized.slice(normalized.indexOf("create or replace function public.onboard_customer_v3"));

describe("municipality onboarding v3 database contract", () => {
  it("records the actor, distinct contact snapshot, local admin and configured central admins", () => {
    expect(normalized).toContain("create table public.organization_onboarding_runs");
    expect(normalized).toContain("performed_by uuid not null references auth.users(id)");
    expect(normalized).toContain("local_admin_user_id uuid not null references auth.users(id)");
    expect(normalized).toContain("contact_name text");
    expect(normalized).toContain("contact_email text");
    expect(normalized).toContain("central_admin_user_ids uuid[] not null");
    expect(normalized).toContain("contract_status text not null");
    expect(normalized).toContain("billing_status text not null");
    expect(normalized).toContain(
      "classroom_eligibility_verified boolean not null default false"
    );
    expect(functionBody).toContain("performed_by,");
    expect(functionBody).toContain("(select auth.uid())");
    expect(normalized).toContain("'delivery_unknown'");
  });

  it("serializes duplicate checks and rejects duplicate IČO, organization and profile identity", () => {
    expect(functionBody).toContain("pg_advisory_xact_lock");
    expect(functionBody).toContain("for update");
    expect(functionBody).toContain("customer-ico:");
    expect(functionBody).toContain("duplicate organization or legal identifier exists");
    expect(functionBody).toContain("duplicate profile email exists");
    expect(functionBody).toContain("conflicting organization membership exists");
  });

  it("performs profile, membership, activation and audit writes inside one RPC transaction", () => {
    const profileInsert = functionBody.indexOf("insert into public.profiles");
    const membershipInsert = functionBody.indexOf("insert into public.organization_members");
    const activationUpdate = functionBody.indexOf("update public.organizations");
    const auditInsert = functionBody.indexOf("insert into public.organization_onboarding_runs");

    expect(profileInsert).toBeGreaterThan(0);
    expect(membershipInsert).toBeGreaterThan(profileInsert);
    expect(activationUpdate).toBeGreaterThan(membershipInsert);
    expect(auditInsert).toBeGreaterThan(activationUpdate);
    expect(functionBody).not.toContain("delete from public.organizations");
    expect(functionBody).not.toContain("delete from public.profiles");
    expect(functionBody).not.toContain("update auth.users");
  });

  it("revalidates configured central administrators inside the transaction", () => {
    expect(functionBody).toContain("from public.platform_admins platform_admin");
    expect(functionBody).toContain("join public.profiles profile");
    expect(functionBody).toContain("profile.is_active = true");
    expect(functionBody).toContain("join auth.users auth_user");
    expect(functionBody).toContain(
      "lower(btrim(auth_user.email)) = lower(btrim(profile.email))"
    );
  });

  it("is idempotent by request key and organization without duplicating memberships", () => {
    expect(normalized).toContain("idempotency_key uuid not null unique");
    expect(normalized).toContain("organization_id uuid not null unique");
    expect(functionBody).toContain("where run.idempotency_key = p_idempotency_key");
    expect(functionBody).toContain("where run.organization_id = customer.id");
    expect(functionBody).toContain(
      "existing_run.central_admin_user_ids <> configured_admin_user_ids"
    );
    expect(functionBody).toContain(
      "existing_run.license_valid_until is distinct from p_license_valid_until"
    );
    expect(functionBody).toContain(
      "existing_run.classroom_eligibility_verified <> effective_classroom_eligibility"
    );
    expect(functionBody).toContain("on conflict (organization_id, user_id) do nothing");
    expect(functionBody).toContain(
      "array_agg(distinct admin_id order by admin_id)"
    );
  });

  it("keeps the privileged function narrowly granted and internally authorized", () => {
    expect(functionBody).toContain("security definer set search_path = ''");
    expect(functionBody).toContain("not public.is_platform_admin()");
    expect(normalized).toMatch(
      /revoke all on function public\.onboard_customer_v3[\s\S]*?from public, anon, authenticated, service_role/
    );
    expect(normalized).toMatch(
      /grant execute on function public\.onboard_customer_v3[\s\S]*?to authenticated;/
    );
  });

  it("requires a live Auth user, an allowed platform role and an active profile", () => {
    expect(normalized).toMatch(
      /create or replace function public\.is_platform_admin\(\)[\s\S]*?from auth\.users auth_user[\s\S]*?join public\.platform_admins platform_admin[\s\S]*?platform_admin\.role in \('admin', 'super_admin'\)[\s\S]*?join public\.profiles profile[\s\S]*?profile\.is_active = true/
    );
    expect(normalized).toContain("select public.is_platform_admin() as is_platform_admin");
    expect(normalized).toMatch(
      /create or replace function public\.get_portal_archive_events\(\)[\s\S]*?public\.is_platform_admin\(\)/
    );
  });

  it("preserves existing portal RPC ACL while hardening only their admin branch", () => {
    expect(normalized).not.toMatch(
      /revoke .*function public\.get_portal_broadcast_sessions/
    );
    expect(normalized).not.toMatch(
      /grant .*function public\.get_portal_broadcast_sessions/
    );
    expect(normalized).not.toMatch(
      /revoke .*function public\.get_portal_archive_events/
    );
    expect(normalized).not.toMatch(
      /grant .*function public\.get_portal_archive_events/
    );
    expect(normalized).toMatch(
      /create or replace function public\.get_portal_broadcast_sessions[\s\S]*?select public\.is_platform_admin\(\) as is_platform_admin/
    );
    expect(normalized).toMatch(
      /create or replace function public\.get_portal_archive_events[\s\S]*?public\.is_platform_admin\(\) as is_platform_admin[\s\S]*?coalesce\(profile\.is_active, true\) as profile_active/
    );
  });

  it("prevents new platform-admin orphans without validating or deleting historical rows", () => {
    expect(normalized).toContain("platform_admins_user_id_auth_fkey");
    expect(normalized).toContain("foreign key (user_id) references auth.users(id) on delete restrict not valid");
    expect(normalized).not.toContain("delete from public.platform_admins");
    expect(normalized).not.toContain("validate constraint platform_admins_user_id_auth_fkey");
  });

  it("uses an audited atomically claimed email-attempt state machine", () => {
    expect(normalized).toContain("create table public.organization_onboarding_email_attempts");
    expect(normalized).toContain("attempt_number integer not null");
    expect(normalized).toContain("previous_attempt_id uuid");
    expect(normalized).toContain("initiated_by uuid not null references auth.users(id)");
    expect(normalized).toContain("resolution_reason text");
    expect(normalized).toContain("for update");
    expect(normalized).toContain("organization_onboarding_email_attempts_one_sending_idx");
    for (const functionName of [
      "claim_onboarding_email_attempt",
      "complete_onboarding_email_attempt",
      "mark_stale_onboarding_email_attempt",
      "resolve_onboarding_email_without_resend",
    ]) {
      expect(normalized).toContain(`create or replace function public.${functionName}`);
      expect(normalized).toMatch(
        new RegExp(
          `create or replace function public\\.${functionName}[\\s\\S]*?not public\\.is_platform_admin\\(\\)`
        )
      );
    }
  });

  it("audits Auth preparation without making an unowned account cleanup-eligible", () => {
    expect(normalized).toContain("create table public.organization_onboarding_auth_preparations");
    expect(normalized).toContain("idempotency_key uuid not null unique");
    expect(normalized).toContain("recovery_reason text");
  });

  it("keeps audit tables out of direct Data API access", () => {
    for (const table of [
      "organization_onboarding_runs",
      "organization_onboarding_email_attempts",
      "organization_onboarding_auth_preparations",
    ]) {
      expect(normalized).toContain(
        `revoke all on table public.${table} from public, anon, authenticated, service_role`
      );
      expect(normalized).not.toContain(`create policy ${table}_select_platform_admin`);
      expect(normalized).not.toContain(`grant all on table public.${table}`);
    }
    expect(normalized).toContain(
      "grant select on table public.organization_onboarding_runs to service_role"
    );
    expect(normalized).toContain(
      "grant select on table public.organization_onboarding_email_attempts to service_role"
    );
    expect(normalized).toContain(
      "grant select, insert, update on table public.organization_onboarding_auth_preparations to service_role"
    );
  });

  it("grants each new state-changing RPC only to authenticated", () => {
    for (const functionName of [
      "claim_onboarding_email_attempt",
      "complete_onboarding_email_attempt",
      "mark_stale_onboarding_email_attempt",
      "resolve_onboarding_email_without_resend",
    ]) {
      expect(normalized).toMatch(
        new RegExp(
          `grant execute on function public\\.${functionName}[\\s\\S]*?to authenticated;`
        )
      );
    }
    expect(normalized).not.toMatch(/grant execute[\s\S]*?to authenticated, service_role/);
  });
});
