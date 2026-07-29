
import { createClient } from "@supabase/supabase-js";
import { consumePublicRateLimit } from "../../lib/server/publicRateLimit";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const allowed = await consumePublicRateLimit({
      supabaseAdmin,
      req,
      route: "make-lead-webhook",
      limit: 20,
      windowSeconds: 60 * 60,
    });
    if (!allowed) {
      res.setHeader("Retry-After", "3600");
      return res.status(429).json({
        ok: false,
        error: "Too many requests",
      });
    }

    const webhookUrl =
      process.env.MAKE_LEAD_WEBHOOK_URL ||
      process.env.MAKE_WEBHOOK_URL ||
      "";

    if (!webhookUrl) {
      throw new Error("Make webhook URL missing");
    }

    const parsedWebhookUrl = new URL(webhookUrl);
    if (parsedWebhookUrl.protocol !== "https:") {
      throw new Error("Make webhook URL must use HTTPS");
    }

    const payload = req.body;

    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      return res.status(400).json({
        ok: false,
        error: "Invalid payload",
      });
    }

    const serializedPayload = JSON.stringify(payload);
    if (
      Object.keys(payload).length > 50 ||
      Buffer.byteLength(serializedPayload, "utf8") > 32 * 1024
    ) {
      return res.status(413).json({
        ok: false,
        error: "Payload too large",
      });
    }

    // Honeypot ochrana – bot typicky vyplní skryté pole
    if (payload.company) {
      return res.status(200).json({ ok: true });
    }

    const email =
      typeof payload.email === "string" ? payload.email.trim() : "";
    const name =
      typeof payload.name === "string"
        ? payload.name.trim()
        : typeof payload.contact_name === "string"
        ? payload.contact_name.trim()
        : "";

    if (
      !email ||
      email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      return res.status(400).json({
        ok: false,
        error: "Invalid email",
      });
    }

    if (!name || name.length < 2 || name.length > 120) {
      return res.status(400).json({
        ok: false,
        error: "Invalid name",
      });
    }

    const cleanPayload = { ...payload };
    delete cleanPayload.company;
    cleanPayload.email = email;
    if (typeof payload.name === "string") {
      cleanPayload.name = name;
    } else {
      cleanPayload.contact_name = name;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);
    let r;
    try {
      r = await fetch(parsedWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleanPayload),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }

    if (!r.ok) {
      console.error("Make webhook failed", {
        status: r.status,
        statusText: r.statusText,
      });

      return res.status(502).json({
        ok: false,
        error: "Make webhook failed",
      });
    }

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error("make-lead error", e);
    return res.status(500).json({
      ok: false,
      error: "Server error",
    });
  }
}
