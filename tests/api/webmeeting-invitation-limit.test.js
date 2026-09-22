import { beforeEach, expect, it, vi } from "vitest";
import { invoke } from "../helpers/http";
const deps = vi.hoisted(() => ({ resolve: vi.fn(), import: vi.fn(), send: vi.fn() }));
vi.mock("@supabase/supabase-js", () => ({ createClient: () => ({ from: () => ({ select: () => ({ eq: () => ({ limit: async () => ({ data: [{ external_meeting_id: 42, status: "scheduled" }] }) }) }) }) }) }));
vi.mock("../../lib/server/platformAdminApi", () => ({ requirePlatformAdmin: async () => ({ id: "admin" }) }));
vi.mock("../../lib/server/authenticatedRateLimit", () => ({ consumeAuthenticatedRateLimit: async () => true }));
vi.mock("../../lib/server/broadcastRecipientResolver", () => ({ resolveWebMeetingParticipants: deps.resolve }));
vi.mock("../../lib/server/webmeetingClient", () => ({ WebMeetingApiError: class extends Error {}, webMeeting: { importParticipants: deps.import, sendInvitations: deps.send } }));
import handler from "../../pages/api/admin/webmeeting/send-invitations";
beforeEach(() => { vi.clearAllMocks(); });
it.each([[1000, 200], [1001, 400]])("handles %i invitation recipients", async (count, expectedStatus) => {
  deps.resolve.mockResolvedValue(Array.from({ length: count }, (_, i) => ({ number: "", firstname: "Guest", surname: "Test", email: `guest${i}@example.com` })));
  const { res } = await invoke(handler, { method: "POST", body: { eventId: "test" } });
  expect(res.statusCode).toBe(expectedStatus);
  if (expectedStatus === 200) {
    expect(deps.import.mock.calls[0][1]).toHaveLength(1000);
    expect(deps.send).toHaveBeenCalledWith(42, { mode: 0, filter: 1, body: "" });
    expect(res.body.count).toBe(1000);
  } else {
    expect(deps.import).not.toHaveBeenCalled();
    expect(deps.send).not.toHaveBeenCalled();
  }
});
