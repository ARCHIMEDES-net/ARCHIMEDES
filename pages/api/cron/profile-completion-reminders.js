import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import { processProfileCompletionReminders } from "../../../lib/server/profileCompletionReminders";

function bearerToken(req) {
  const match = String(req.headers?.authorization || "").match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : "";
}

function requiredEnvironment(name) {
  const value = String(process.env[name] || "").trim();
  if (!value) throw new Error(`Missing env: ${name}`);
  return value;
}

function secretsMatch(provided, expected) {
  if (!provided || !expected) return false;
  const providedDigest = crypto.createHash("sha256").update(provided).digest();
  const expectedDigest = crypto.createHash("sha256").update(expected).digest();
  return crypto.timingSafeEqual(providedDigest, expectedDigest);
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "GET" && req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const cronSecret = requiredEnvironment("CRON_SECRET");
    if (!secretsMatch(bearerToken(req), cronSecret)) {
      return res.status(401).json({ ok: false, error: "Unauthorized" });
    }

    const mode = String(req.query?.mode || "run").toLowerCase();
    if (!["preview", "run"].includes(mode)) {
      return res.status(400).json({ ok: false, error: "Invalid mode" });
    }

    const preview = mode === "preview";
    const enabled = process.env.PROFILE_COMPLETION_REMINDERS_ENABLED === "true";
    if (!preview && !enabled) {
      return res.status(200).json({
        ok: true,
        enabled: false,
        note: "Profile completion reminders are disabled.",
      });
    }

    const supabaseAdmin = createClient(
      requiredEnvironment("SUPABASE_URL"),
      requiredEnvironment("SUPABASE_SERVICE_ROLE_KEY"),
      { auth: { persistSession: false, autoRefreshToken: false } }
    );
    const result = await processProfileCompletionReminders(supabaseAdmin, { preview });
    return res.status(200).json({ ok: true, enabled, ...result });
  } catch (error) {
    console.error("profile-completion-reminders error:", error);
    return res.status(500).json({ ok: false, error: "Profile reminder processing failed" });
  }
}
