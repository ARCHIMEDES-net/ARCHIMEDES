import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { invitationMessage, sendInvitationBatch } from "../../lib/server/broadcastInvitationEmail";
const update = vi.fn();
const db = { from: () => ({ update: (value) => { update(value); return { eq: async () => ({ error: null }) }; } }) };
beforeEach(() => { vi.stubEnv("RESEND_API_KEY", "test"); vi.stubEnv("REGISTRATION_EMAIL_FROM", "test@example.com"); vi.clearAllMocks(); });
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });
const batch = () => ({ id: "batch-id", first_attempt_at: new Date().toISOString(), payload: [{ to: ["a@example.com"], text: "fixed" }] });
it("links to the platform event, with Czech timezone and no direct meeting access", () => {
  const message = invitationMessage({ id: "event-id", title: "Test", starts_at: "2026-09-25T08:00:00Z" });
  expect(message.text).toContain("https://www.archimedeslive.com/portal/udalost/event-id");
  expect(message.text).toContain("10:00");
  expect(message.text).toContain("Zúčastním se");
});
it("uses an immutable batch and the same idempotency key on retry", async () => {
  const fetch = vi.fn(async () => ({ ok: true, json: async () => ({ data: [{ id: "email-id" }] }) })); vi.stubGlobal("fetch", fetch);
  const b = batch(); await sendInvitationBatch(db, b); await sendInvitationBatch(db, b);
  expect(fetch.mock.calls[0][1].body).toEqual(fetch.mock.calls[1][1].body);
  expect(fetch.mock.calls[0][1].headers).toEqual(fetch.mock.calls[1][1].headers);
  expect(fetch.mock.calls[0][0]).toBe("https://api.resend.com/emails/batch");
  expect(update).toHaveBeenCalledWith(expect.objectContaining({ provider_message_ids: ["email-id"] }));
});
it("never repeats an ambiguous batch beyond the idempotency window", async () => {
  const fetch = vi.fn(); vi.stubGlobal("fetch", fetch);
  await expect(sendInvitationBatch(db, { ...batch(), first_attempt_at: new Date(Date.now()-24*3600000).toISOString() })).rejects.toThrow("ověření");
  expect(fetch).not.toHaveBeenCalled();
});
it.each([429, 500, 200])("does not mark rejected or incomplete provider response %i as accepted", async (status) => {
  vi.stubGlobal("fetch", vi.fn(async () => ({ ok: status === 200, status, json: async () => ({ data: [] }) })));
  await expect(sendInvitationBatch(db, batch())).rejects.toThrow();
  expect(update).not.toHaveBeenCalled();
});
