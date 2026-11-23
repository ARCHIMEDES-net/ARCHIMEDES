import { createClient } from "@supabase/supabase-js";
import { consumeAuthenticatedRateLimit } from "../../../lib/server/authenticatedRateLimit";
import { getBearerToken } from "../../../lib/server/platformAdminApi";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

const KINDS = new Set(["portal_visit", "broadcast_join"]);
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Records at most one row per user, activity kind, day and broadcast.
// The endpoint never fails the user's action: the browser calls it in the background.
export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const kind = String(req.body?.kind || "").trim();
  const eventId = String(req.body?.eventId || "").trim();

  if (!KINDS.has(kind)) {
    return res.status(400).json({ error: "Neznámý druh aktivity." });
  }
  if (kind === "broadcast_join" && !UUID_PATTERN.test(eventId)) {
    return res.status(400).json({ error: "Chybí platné ID vysílání." });
  }

  const token = getBearerToken(req);
  if (!token) return res.status(401).json({ error: "Chybí přihlášení." });

  try {
    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      return res.status(401).json({ error: "Přihlášení vypršelo." });
    }

    const allowed = await consumeAuthenticatedRateLimit({
      supabaseAdmin,
      req,
      route: "portal-usage",
      userId: user.id,
      resourceId: kind,
      limit: 30,
      windowSeconds: 10 * 60,
    });
    if (!allowed) {
      res.setHeader("Retry-After", "600");
      return res.status(429).json({ error: "Příliš mnoho požadavků." });
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("active_organization_id")
      .eq("id", user.id)
      .maybeSingle();
    if (profileError) throw profileError;

    if (kind === "broadcast_join") {
      const { data: event, error: eventError } = await supabaseAdmin
        .from("events")
        .select("id")
        .eq("id", eventId)
        .maybeSingle();
      if (eventError) throw eventError;
      if (!event) return res.status(404).json({ error: "Vysílání nebylo nalezeno." });
    }

    const { data: recorded, error: recordError } = await supabaseAdmin.rpc(
      "record_portal_usage",
      {
        p_user_id: user.id,
        p_organization_id: profile?.active_organization_id || null,
        p_kind: kind,
        p_event_id: kind === "broadcast_join" ? eventId : null,
      }
    );
    if (recordError) throw recordError;

    return res.status(200).json({ ok: true, recorded: recorded === true });
  } catch (error) {
    console.error("portal usage record error:", error);
    return res.status(500).json({ error: "Aktivitu se nepodařilo zaznamenat." });
  }
}
