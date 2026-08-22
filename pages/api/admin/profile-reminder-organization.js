import { createClient } from "@supabase/supabase-js";
import { consumeAuthenticatedRateLimit } from "../../../lib/server/authenticatedRateLimit";
import { requirePlatformAdmin } from "../../../lib/server/platformAdminApi";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    const platformAdmin = await requirePlatformAdmin(req, res, supabaseAdmin);
    if (!platformAdmin) return;
    const organizationId = String(req.body?.organizationId || "").trim();
    const reason = String(req.body?.reason || "").trim();
    const enabled = req.body?.enabled === true;
    const confirmation = enabled ? "ENABLE_PROFILE_EMAILS" : "DISABLE_PROFILE_EMAILS";
    if (!UUID_PATTERN.test(organizationId) || reason.length < 20 || reason.length > 1000) {
      return res.status(400).json({ error: "Neplatná organizace nebo nedostatečný důvod kontroly." });
    }
    if (req.body?.confirmation !== confirmation) {
      return res.status(400).json({ error: "Chybí přesné potvrzení změny nastavení organizace." });
    }
    const allowed = await consumeAuthenticatedRateLimit({
      supabaseAdmin,
      req,
      route: "admin-profile-reminder-organization",
      userId: platformAdmin.id,
      resourceId: organizationId,
      limit: 10,
      windowSeconds: 60 * 60,
    });
    if (!allowed) {
      res.setHeader("Retry-After", "3600");
      return res.status(429).json({ error: "Příliš mnoho změn nastavení této organizace." });
    }
    const { data, error } = await supabaseAdmin.rpc(
      "set_profile_reminder_organization_enabled",
      {
        p_organization_id: organizationId,
        p_enabled: enabled,
        p_changed_by: platformAdmin.id,
        p_reason: reason,
      }
    );
    if (error) throw error;
    return res.status(200).json({ ok: data === true, enabled, emailSent: false });
  } catch (error) {
    console.error("profile-reminder-organization error:", error);
    return res.status(500).json({ error: "Nastavení organizace se nepodařilo bezpečně změnit." });
  }
}
