import { createClient } from "@supabase/supabase-js";
import {
  normalizeResendWebhook,
  verifyResendWebhook,
} from "../../../lib/server/resendWebhook";

export const config = { api: { bodyParser: false } };

async function readRawBody(req) {
  const chunks = [];
  let length = 0;
  for await (const chunk of req) {
    length += chunk.length;
    if (length > 256 * 1024) throw new Error("Webhook body is too large");
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString("utf8");
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const rawBody = await readRawBody(req);
    const verified = verifyResendWebhook({
      rawBody,
      headers: req.headers,
      secret: process.env.RESEND_WEBHOOK_SECRET,
    });
    if (!verified) {
      return res.status(401).json({ ok: false, error: "Invalid webhook signature" });
    }

    const payload = JSON.parse(rawBody);
    const event = normalizeResendWebhook(payload, verified);
    if (!event) {
      return res.status(200).json({ ok: true, ignored: true });
    }

    const supabaseAdmin = createClient(
      process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { persistSession: false, autoRefreshToken: false } }
    );
    const { error } = await supabaseAdmin
      .from("registration_email_webhook_events")
      .insert(event);
    if (error && error.code !== "23505") throw error;

    if (!error && ["failed", "bounced"].includes(event.delivery_status)) {
      console.error(JSON.stringify({
        level: "error",
        msg: "Resend email delivery incident",
        route: "/api/webhooks/resend-registration-email",
        deliveryStatus: event.delivery_status,
        providerMessageId: event.provider_message_id,
        eventId: event.event_id,
      }));
    }

    return res.status(200).json({ ok: true, replayed: error?.code === "23505" });
  } catch (error) {
    console.error("resend-registration-email webhook error:", error);
    return res.status(500).json({ ok: false, error: "Webhook processing failed" });
  }
}

