import { beforeEach, expect, it, vi } from "vitest";
import { invoke } from "../helpers/http";
const deps = vi.hoisted(() => ({ resolve: vi.fn(), rpc: vi.fn(), send: vi.fn(), auth: vi.fn(), rate: vi.fn(), event: {}, session: {} }));
vi.mock("@supabase/supabase-js", () => ({ createClient: () => ({ rpc: deps.rpc, from: () => ({ select: () => ({ eq: () => ({ limit: async () => ({ data: [deps.session] }), maybeSingle: async () => ({ data: deps.event }) }) }) }) }) }));
vi.mock("../../lib/server/platformAdminApi", () => ({ requirePlatformAdmin: deps.auth }));
vi.mock("../../lib/server/authenticatedRateLimit", () => ({ consumeAuthenticatedRateLimit: deps.rate }));
vi.mock("../../lib/server/broadcastRecipientResolver", () => ({ resolveWebMeetingParticipants: deps.resolve }));
vi.mock("../../lib/server/registrationEmailProvider", () => ({ validateRegistrationEmailConfiguration: () => {} }));
vi.mock("../../lib/server/webmeetingClient", () => ({ webMeeting: new Proxy({}, { get: () => { throw new Error("Email invitation must not call WebMeeting"); } }) }));
import handler from "../../pages/api/admin/webmeeting/send-invitations";
beforeEach(() => {
  vi.clearAllMocks();
  deps.auth.mockResolvedValue({ id: "admin" }); deps.rate.mockResolvedValue(true);
  deps.event = { id: "event", title: "Event", is_published: true, starts_at: "2099-01-01T10:00:00Z" };
  deps.session = { external_meeting_id: null, status: "scheduled" };
  deps.rpc.mockResolvedValue({ data: { id: "batch", payload: [{ to: ["guest0@example.com"] }] } });
  deps.send.mockResolvedValue(100);
});
it.each([[409, 202], [1000, 202], [1001, 400]])("handles %i recipients without requiring a room or importing participants", async (count, expectedStatus) => {
  deps.resolve.mockResolvedValue(Array.from({ length: count }, (_, i) => ({ email: `guest${i}@example.com` })));
  const { res } = await invoke(handler, { method: "POST", body: { eventId: "event" } });
  expect(res.statusCode).toBe(expectedStatus);
  if (expectedStatus === 202) {
    expect(deps.rpc.mock.calls[0][1].p_emails).toHaveLength(count);
    expect(deps.send).not.toHaveBeenCalled();
    expect(res.body.queued).toBe(true);
  } else expect(deps.send).not.toHaveBeenCalled();
});
it("reads stored status without sending mail", async () => {
  deps.rpc.mockResolvedValue({ data: { state:"complete",accepted:409,pending:0 } });
  const { res } = await invoke(handler, { method:"GET",query:{eventId:"event"} });
  expect(res.body).toMatchObject({state:"complete",accepted:409,pending:0});
  expect(deps.resolve).not.toHaveBeenCalled();
});
it.each(["unpublished", "past", "cancelled", "unauthorized", "rate", "put"])("blocks %s requests before sending", async (kind) => {
  if (kind === "unpublished") deps.event.is_published = false;
  if (kind === "past") deps.event.starts_at = "2000-01-01";
  if (kind === "cancelled") deps.session.status = "cancelled";
  if (kind === "unauthorized") deps.auth.mockResolvedValue(null);
  if (kind === "rate") deps.rate.mockResolvedValue(false);
  await invoke(handler, { method: kind === "put" ? "PUT" : "POST", body: { eventId: "event" } });
  expect(deps.resolve).not.toHaveBeenCalled();
  expect(deps.send).not.toHaveBeenCalled();
});
