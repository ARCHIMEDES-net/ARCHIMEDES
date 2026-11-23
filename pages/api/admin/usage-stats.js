import { createClient } from "@supabase/supabase-js";
import { consumeAuthenticatedRateLimit } from "../../../lib/server/authenticatedRateLimit";
import { requirePlatformAdmin } from "../../../lib/server/platformAdminApi";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

const ALLOWED_DAYS = new Set([7, 30, 90]);

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const requestedDays = Number(req.query?.days || 30);
  const days = ALLOWED_DAYS.has(requestedDays) ? requestedDays : 30;

  try {
    const admin = await requirePlatformAdmin(req, res, supabaseAdmin);
    if (!admin) return;

    const allowed = await consumeAuthenticatedRateLimit({
      supabaseAdmin,
      req,
      route: "admin-usage-stats",
      userId: admin.id,
      limit: 60,
      windowSeconds: 10 * 60,
    });
    if (!allowed) {
      res.setHeader("Retry-After", "600");
      return res.status(429).json({ error: "Statistiky byly načteny příliš mnohokrát." });
    }

    const { data, error } = await supabaseAdmin.rpc("get_portal_usage_stats", {
      p_days: days,
    });
    if (error) throw error;

    return res.status(200).json({ stats: data || null });
  } catch (error) {
    console.error("admin usage stats error:", error);
    return res.status(500).json({ error: "Statistiky se nepodařilo načíst." });
  }
}
