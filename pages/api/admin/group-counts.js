import { createClient } from "@supabase/supabase-js";
import { consumeAuthenticatedRateLimit } from "../../../lib/server/authenticatedRateLimit";
import { getEmailGroups } from "../../../lib/server/emailGroups";
import { requirePlatformAdmin } from "../../../lib/server/platformAdminApi";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const admin = await requirePlatformAdmin(req, res, supabaseAdmin);
    if (!admin) return;

    const allowed = await consumeAuthenticatedRateLimit({
      supabaseAdmin,
      req,
      route: "admin-group-counts",
      userId: admin.id,
      limit: 60,
      windowSeconds: 10 * 60,
    });

    if (!allowed) {
      res.setHeader("Retry-After", "600");
      return res.status(429).json({
        error: "Přehled skupin byl načten příliš mnohokrát. Zkuste to prosím později.",
      });
    }

    const groups = await getEmailGroups(supabaseAdmin);

    return res.status(200).json(
      groups.map(({ slug, label, section, sort_order, count }) => ({
        slug,
        label,
        section,
        sort_order,
        count,
      }))
    );
  } catch (err) {
    console.error("group-counts error:", err);
    return res.status(500).json({ error: "Nepodařilo se načíst e-mailové skupiny." });
  }
}
