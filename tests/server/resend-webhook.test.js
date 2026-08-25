import crypto from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  normalizeResendWebhook,
  verifyResendWebhook,
} from "../../lib/server/resendWebhook";

const now = Date.UTC(2026, 7, 22, 8, 0, 0);
const timestamp = Math.floor(now / 1000);
const secretBytes = Buffer.from("safe-test-webhook-secret");
const secret = `whsec_${secretBytes.toString("base64")}`;

function signed(rawBody, overrides = {}) {
  const eventId = overrides.eventId || "evt_test_1";
  const usedTimestamp = overrides.timestamp || timestamp;
  const signature = crypto
    .createHmac("sha256", secretBytes)
    .update(`${eventId}.${usedTimestamp}.${rawBody}`)
    .digest("base64");
  return {
    "svix-id": eventId,
    "svix-timestamp": String(usedTimestamp),
    "svix-signature": `v1,${signature}`,
  };
}

describe("Resend registration webhook", () => {
  it("verifies the exact raw body and normalizes delivery evidence", () => {
    const rawBody = JSON.stringify({
      type: "email.delivered",
      created_at: "2026-08-22T08:00:00.000Z",
      data: { email_id: "email_123" },
    });
    const verified = verifyResendWebhook({
      rawBody,
      headers: signed(rawBody),
      secret,
      now,
    });
    expect(verified).toEqual({ eventId: "evt_test_1", timestamp });
    expect(normalizeResendWebhook(JSON.parse(rawBody), verified)).toEqual({
      event_id: "evt_test_1",
      provider: "resend",
      provider_message_id: "email_123",
      event_type: "email.delivered",
      delivery_status: "delivered",
      occurred_at: "2026-08-22T08:00:00.000Z",
      recipient_email: null,
      email_subject: null,
      failure_reason: null,
    });
  });

  it("captures bounded diagnostic context for failed delivery alerts", () => {
    const rawBody = JSON.stringify({
      type: "email.bounced",
      created_at: "2026-08-22T08:00:00.000Z",
      data: {
        email_id: "email_bounced_1",
        to: ["person@example.com"],
        subject: "Pozvánka do ARCHIMEDES Live",
        bounce: { message: "Recipient address does not exist." },
      },
    });
    const verified = verifyResendWebhook({
      rawBody,
      headers: signed(rawBody, { eventId: "evt_bounced_1" }),
      secret,
      now,
    });

    expect(normalizeResendWebhook(JSON.parse(rawBody), verified)).toMatchObject({
      event_id: "evt_bounced_1",
      delivery_status: "bounced",
      recipient_email: "person@example.com",
      email_subject: "Pozvánka do ARCHIMEDES Live",
      failure_reason: "Recipient address does not exist.",
    });
  });

  it("rejects tampering and stale replay attempts", () => {
    const rawBody = JSON.stringify({ type: "email.bounced", data: { email_id: "email_1" } });
    expect(
      verifyResendWebhook({ rawBody: `${rawBody} `, headers: signed(rawBody), secret, now })
    ).toBeNull();
    expect(
      verifyResendWebhook({
        rawBody,
        headers: signed(rawBody, { timestamp: timestamp - 301 }),
        secret,
        now,
      })
    ).toBeNull();
  });

  it("ignores event types that cannot establish a delivery state", () => {
    expect(
      normalizeResendWebhook(
        { type: "email.opened", data: { email_id: "email_1" } },
        { eventId: "evt_2", timestamp }
      )
    ).toBeNull();
  });
});

