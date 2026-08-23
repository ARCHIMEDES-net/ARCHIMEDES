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
  reminderReason: vi.fn(),
  sendClaimedProfileReminder: vi.fn(),
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
vi.mock("../../lib/server/profileCompletionReminders", () => ({
  reminderReason: dependencies.reminderReason,
  sendClaimedProfileReminder: dependencies.sendClaimedProfileReminder,
}));

import retryProfileReminder from "../../pages/api/admin/retry-profile-reminder";

const sourceAttemptId = "00000000-0000-4000-8000-000000000001";
const primaryProfileId = "00000000-0000-4000-8000-000000000002";
const secondaryProfileId = "00000000-0000-4000-8000-000000000003";
const unrelatedProfileId = "00000000-0000-4000-8000-000000000004";
const organizationId = "00000000-0000-4000-8000-000000000005";
const followupAttemptId = "00000000-0000-4000-8000-000000000006";

function queryResult(result) {
  const query = {};
  for (const method of ["select", "in", "or", "eq", "maybeSingle"]) {
    query[method] = vi.fn(() => query);
  }
  query.then = (resolve) => Promise.resolve(result).then(resolve);
  return query;
}

function queueSuccessfulReview(accountPolicies) {
  const responses = [
    {
      data: {
        id: sourceAttemptId,
        profile_id: primaryProfileId,
        reminder_step: 1,
        recipient_email: "school@example.com",
        status: "delivery_unknown",
      },
      error: null,
    },
    {
      data: {
        id: primaryProfileId,
        email: "school@example.com",
        full_name: "Ludmila Pleskačová",
        must_set_password: false,
        profile_completed_at: null,
        created_at: "2026-04-21T07:54:18.000Z",
        is_active: true,
      },
      error: null,
    },
    { data: null, error: null },
    { data: [{ organization_id: organizationId }], error: null },
    {
      data: [{ id: organizationId, name: "Ověřená škola" }],
      error: null,
    },
    {
      data: [
        { user_id: primaryProfileId },
        { user_id: secondaryProfileId },
      ],
      error: null,
    },
    {
      data: [
        {
          id: primaryProfileId,
          email: "school@example.com",
          full_name: "Ludmila Pleskačová",
        },
        {
          id: secondaryProfileId,
          email: "personal@example.com",
          full_name: "Ludmila Pleskačová",
        },
      ],
      error: null,
    },
    { data: accountPolicies, error: null },
  ];
  for (const response of responses) {
    dependencies.supabaseAdmin.from.mockReturnValueOnce(queryResult(response));
  }
}

function approvedProfileRequest() {
  return {
    method: "POST",
    body: {
      sourceAttemptId,
      resolutionReason:
        "Primární školní profil i sekundární osobní adresa byly jednotlivě ověřeny.",
      action: "approved_profile_reminder",
      confirmation: "SEND_ONE_PROFILE_EMAIL",
    },
  };
}

beforeEach(() => {
  dependencies.supabaseAdmin.from.mockReset();
  dependencies.supabaseAdmin.rpc.mockReset();
  dependencies.supabaseAdmin.auth.admin.getUserById.mockReset();
  dependencies.requirePlatformAdmin.mockReset();
  dependencies.consumeAuthenticatedRateLimit.mockReset();
  dependencies.reminderReason.mockReset();
  dependencies.sendClaimedProfileReminder.mockReset();

  dependencies.requirePlatformAdmin.mockResolvedValue({ id: "admin-1" });
  dependencies.consumeAuthenticatedRateLimit.mockResolvedValue(true);
  dependencies.reminderReason.mockReturnValue("profile");
  dependencies.supabaseAdmin.auth.admin.getUserById.mockResolvedValue({
    data: { user: { last_sign_in_at: "2026-04-21T08:00:00.000Z" } },
    error: null,
  });
});

describe("profile reminder retry identity review", () => {
  it("allows the reviewed primary profile when its duplicate peer is audited as secondary no-email", async () => {
    queueSuccessfulReview([
      {
        profile_id: secondaryProfileId,
        primary_profile_id: primaryProfileId,
        policy_kind: "secondary_no_email",
      },
    ]);
    dependencies.supabaseAdmin.rpc.mockResolvedValue({
      data: [{ attempt_id: followupAttemptId, claimed: true }],
      error: null,
    });
    dependencies.supabaseAdmin.from.mockReturnValueOnce(
      queryResult({ data: { reason: "profile" }, error: null })
    );
    dependencies.sendClaimedProfileReminder.mockResolvedValue({ sent: true, copySent: true });

    const { res } = await invoke(retryProfileReminder, approvedProfileRequest());

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(expect.objectContaining({
      ok: true,
      providerAccepted: true,
      auditCopyAccepted: true,
    }));
    expect(dependencies.supabaseAdmin.rpc).toHaveBeenCalledWith(
      "claim_approved_profile_reminder_followup",
      expect.objectContaining({
        p_source_attempt_id: sourceAttemptId,
        p_action: "approved_profile_reminder",
      })
    );
  });

  it("still rejects an ambiguous peer without the exact primary-secondary audit link", async () => {
    queueSuccessfulReview([
      {
        profile_id: secondaryProfileId,
        primary_profile_id: unrelatedProfileId,
        policy_kind: "secondary_no_email",
      },
    ]);

    const { res } = await invoke(retryProfileReminder, approvedProfileRequest());

    expect(res.statusCode).toBe(409);
    expect(res.body.error).toContain("jednoznačnou vazbu");
    expect(dependencies.supabaseAdmin.rpc).not.toHaveBeenCalled();
    expect(dependencies.sendClaimedProfileReminder).not.toHaveBeenCalled();
  });

  it("never sends when the selected target profile itself is classified as secondary no-email", async () => {
    queueSuccessfulReview([
      {
        profile_id: primaryProfileId,
        primary_profile_id: unrelatedProfileId,
        policy_kind: "secondary_no_email",
      },
    ]);

    const { res } = await invoke(retryProfileReminder, approvedProfileRequest());

    expect(res.statusCode).toBe(409);
    expect(dependencies.supabaseAdmin.rpc).not.toHaveBeenCalled();
    expect(dependencies.sendClaimedProfileReminder).not.toHaveBeenCalled();
  });
});
