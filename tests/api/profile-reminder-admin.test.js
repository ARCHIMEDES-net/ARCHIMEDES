import { beforeEach, describe, expect, it, vi } from "vitest";
import { invoke } from "../helpers/http";

const dependencies = vi.hoisted(() => ({
  supabaseAdmin: {
    from: vi.fn(),
    rpc: vi.fn(),
    auth: { admin: { getUserById: vi.fn() } },
  },
  requirePlatformAdmin: vi.fn(),
  consumeAuthenticatedRateLimit: vi.fn(),
}));

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => dependencies.supabaseAdmin),
}));
vi.mock("../../lib/server/platformAdminApi", () => ({
  requirePlatformAdmin: dependencies.requirePlatformAdmin,
}));
vi.mock("../../lib/server/authenticatedRateLimit", () => ({
  consumeAuthenticatedRateLimit: dependencies.consumeAuthenticatedRateLimit,
}));

import profileReminderCases from "../../pages/api/admin/profile-reminder-cases";
import profileReminderOrganization from "../../pages/api/admin/profile-reminder-organization";
import repairProfilePasswordFlag from "../../pages/api/admin/repair-profile-password-flag";

function queryResult(result) {
  const query = {};
  for (const method of ["select", "in", "is", "order", "eq", "maybeSingle"]) {
    query[method] = vi.fn(() => query);
  }
  query.then = (resolve) => Promise.resolve(result).then(resolve);
  return query;
}

beforeEach(() => {
  dependencies.supabaseAdmin.from.mockReset();
  dependencies.supabaseAdmin.rpc.mockReset();
  dependencies.supabaseAdmin.auth.admin.getUserById.mockReset();
  dependencies.requirePlatformAdmin.mockReset();
  dependencies.consumeAuthenticatedRateLimit.mockReset();
  dependencies.requirePlatformAdmin.mockResolvedValue({ id: "admin-1" });
  dependencies.consumeAuthenticatedRateLimit.mockResolvedValue(true);
});

describe("profile reminder admin review", () => {
  it("returns an empty fail-closed queue without additional data access", async () => {
    dependencies.supabaseAdmin.from.mockReturnValueOnce(queryResult({ data: [], error: null }));

    const { res } = await invoke(profileReminderCases, { method: "GET" });

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ cases: [] });
    expect(dependencies.supabaseAdmin.from).toHaveBeenCalledTimes(1);
  });

  it("classifies a signed-in incomplete profile but blocks email until organization approval", async () => {
    const profileId = "00000000-0000-4000-8000-000000000001";
    const peerId = "00000000-0000-4000-8000-000000000002";
    const organizationId = "00000000-0000-4000-8000-000000000003";
    const responses = [
      { data: [{ id: "attempt-1", profile_id: profileId, reminder_step: 1, recipient_email: "user@example.com", status: "delivery_unknown", client_delivery_status: "not_tracked" }], error: null },
      { data: [{ id: profileId, email: "user@example.com", full_name: "Ověřený uživatel", must_set_password: false, profile_completed_at: null, is_active: true }], error: null },
      { data: [{ user_id: profileId, organization_id: organizationId }], error: null },
      { data: [], error: null },
      { data: [{ id: organizationId, name: "Ověřená obec", status: "active", is_test: false, profile_reminders_enabled: false }], error: null },
      { data: [{ user_id: profileId, organization_id: organizationId }, { user_id: peerId, organization_id: organizationId }], error: null },
      { data: [{ id: profileId, email: "user@example.com", full_name: "Ověřený uživatel" }, { id: peerId, email: "peer@example.com", full_name: "Jiný uživatel" }], error: null },
    ];
    for (const response of responses) {
      dependencies.supabaseAdmin.from.mockReturnValueOnce(queryResult(response));
    }
    dependencies.supabaseAdmin.auth.admin.getUserById.mockResolvedValue({
      data: { user: { last_sign_in_at: "2026-08-20T08:00:00.000Z" } },
      error: null,
    });

    const { res } = await invoke(profileReminderCases, { method: "GET" });

    expect(res.statusCode).toBe(200);
    expect(res.body.cases[0]).toEqual(expect.objectContaining({
      category: "profile_reminder_candidate",
      organizationApproved: false,
      emailActionAllowed: false,
      duplicateIdentity: false,
    }));
  });

  it("changes only the audited organization gate and reports that no email was sent", async () => {
    dependencies.supabaseAdmin.rpc.mockResolvedValue({ data: true, error: null });

    const { res } = await invoke(profileReminderOrganization, {
      method: "POST",
      body: {
        organizationId: "00000000-0000-4000-8000-000000000003",
        enabled: true,
        reason: "Celá organizace byla jednotlivě ověřena správcem.",
        confirmation: "ENABLE_PROFILE_EMAILS",
      },
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ ok: true, enabled: true, emailSent: false });
    expect(dependencies.supabaseAdmin.rpc).toHaveBeenCalledWith(
      "set_profile_reminder_organization_enabled",
      expect.objectContaining({ p_enabled: true, p_changed_by: "admin-1" })
    );
  });

  it("rejects an organization change without the exact confirmation", async () => {
    const { res } = await invoke(profileReminderOrganization, {
      method: "POST",
      body: {
        organizationId: "00000000-0000-4000-8000-000000000003",
        enabled: true,
        reason: "Celá organizace byla jednotlivě ověřena správcem.",
        confirmation: "ANO",
      },
    });

    expect(res.statusCode).toBe(400);
    expect(dependencies.supabaseAdmin.rpc).not.toHaveBeenCalled();
  });

  it("repairs one signed-in password flag through the audited RPC without email", async () => {
    dependencies.supabaseAdmin.rpc.mockResolvedValue({ data: true, error: null });

    const { res } = await invoke(repairProfilePasswordFlag, {
      method: "POST",
      body: {
        sourceAttemptId: "00000000-0000-4000-8000-000000000001",
        resolutionReason: "Ověřený starosta se již přihlásil; chybný je pouze technický příznak hesla.",
        confirmation: "REPAIR_SIGNED_IN_PASSWORD_FLAG",
      },
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      ok: true,
      passwordFlagRepaired: true,
      emailSent: false,
    });
    expect(dependencies.supabaseAdmin.rpc).toHaveBeenCalledWith(
      "repair_signed_in_profile_password_flag",
      expect.objectContaining({ p_initiated_by: "admin-1" })
    );
  });

  it("does not repair a password flag without the exact confirmation", async () => {
    const { res } = await invoke(repairProfilePasswordFlag, {
      method: "POST",
      body: {
        sourceAttemptId: "00000000-0000-4000-8000-000000000001",
        resolutionReason: "Ověřený starosta se již přihlásil; chybný je pouze technický příznak hesla.",
        confirmation: "ANO",
      },
    });

    expect(res.statusCode).toBe(400);
    expect(dependencies.supabaseAdmin.rpc).not.toHaveBeenCalled();
  });
});
