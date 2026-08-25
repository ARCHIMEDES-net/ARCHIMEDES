import crypto from "crypto";

const MAX_CLOCK_SKEW_SECONDS = 5 * 60;
const EVENT_STATUS = Object.freeze({
  "email.sent": "accepted",
  "email.delivered": "delivered",
  "email.delivery_delayed": "delayed",
  "email.bounced": "bounced",
  "email.failed": "failed",
  "email.suppressed": "suppressed",
  "email.complained": "complained",
});

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(String(left || ""));
  const rightBuffer = Buffer.from(String(right || ""));
  return (
    leftBuffer.length === rightBuffer.length &&
    crypto.timingSafeEqual(leftBuffer, rightBuffer)
  );
}

export function verifyResendWebhook({ rawBody, headers, secret, now = Date.now() }) {
  const eventId = String(headers?.["svix-id"] || "").trim();
  const timestampText = String(headers?.["svix-timestamp"] || "").trim();
  const signatureHeader = String(headers?.["svix-signature"] || "").trim();
  const timestamp = Number(timestampText);
  const secretText = String(secret || "").trim();

  if (!eventId || !Number.isInteger(timestamp) || !signatureHeader || !secretText) {
    return null;
  }
  if (Math.abs(Math.floor(now / 1000) - timestamp) > MAX_CLOCK_SKEW_SECONDS) {
    return null;
  }

  if (!secretText.startsWith("whsec_")) return null;
  const encodedSecret = secretText.slice("whsec_".length);
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(encodedSecret)) return null;
  let secretBuffer;
  try {
    secretBuffer = Buffer.from(encodedSecret, "base64");
  } catch {
    return null;
  }
  if (!secretBuffer.length) return null;

  const expected = crypto
    .createHmac("sha256", secretBuffer)
    .update(`${eventId}.${timestampText}.${rawBody}`)
    .digest("base64");
  const signatures = signatureHeader
    .split(" ")
    .map((item) => item.split(","))
    .filter(([version, value]) => version === "v1" && value)
    .map(([, value]) => value);

  return signatures.some((signature) => safeEqual(signature, expected))
    ? { eventId, timestamp }
    : null;
}

function boundedText(value, maxLength) {
  const text = String(value || "").trim();
  return text ? text.slice(0, maxLength) : null;
}

export function normalizeResendWebhook(payload, verified) {
  const eventType = String(payload?.type || "").trim();
  const deliveryStatus = EVENT_STATUS[eventType];
  const providerMessageId = String(payload?.data?.email_id || "").trim();
  const occurredAt = new Date(payload?.created_at || verified.timestamp * 1000);

  if (
    !deliveryStatus ||
    !providerMessageId ||
    providerMessageId.length > 500 ||
    !Number.isFinite(occurredAt.getTime())
  ) {
    return null;
  }

  const recipient = Array.isArray(payload?.data?.to) ? payload.data.to[0] : null;
  const failureReason =
    eventType === "email.bounced"
      ? payload?.data?.bounce?.message
      : eventType === "email.failed"
        ? payload?.data?.failed?.reason
        : null;

  return {
    event_id: verified.eventId,
    provider: "resend",
    provider_message_id: providerMessageId,
    event_type: eventType,
    delivery_status: deliveryStatus,
    occurred_at: occurredAt.toISOString(),
    recipient_email: boundedText(recipient, 320),
    email_subject: boundedText(payload?.data?.subject, 500),
    failure_reason: boundedText(failureReason, 2000),
  };
}
