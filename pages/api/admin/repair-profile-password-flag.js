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

    const sourceAttemptId = String(req.body?.sourceAttemptId || "").trim();
    const resolutionReason = String(req.body?.resolutionReason || "").trim();
    if (
      !UUID_PATTERN.test(sourceAttemptId) ||
      resolutionReason.length < 20 ||
      resolutionReason.length > 1000
    ) {
      return res.status(400).json({
        error: "Neplatné ID nebo nedostatečný důvod opravy.",
      });
    }
    if (req.body?.confirmation !== "REPAIR_SIGNED_IN_PASSWORD_FLAG") {
      return res.status(400).json({
        error: "Chybí přesné potvrzení opravy příznaku bez odeslání e-mailu.",
      });
    }

    const allowed = await consumeAuthenticatedRateLimit({
      supabaseAdmin,
      req,
      route: "admin-repair-profile-password-flag",
      userId: platformAdmin.id,
      resourceId: sourceAttemptId,
      limit: 5,
      windowSeconds: 60 * 60,
    });
    if (!allowed) {
      res.setHeader("Retry-After", "3600");
      return res.status(429).json({ error: "Příliš mnoho pokusů." });
    }

    const { data, error } = await supabaseAdmin.rpc(
      "repair_signed_in_profile_password_flag",
      {
        p_source_attempt_id: sourceAttemptId,
        p_initiated_by: platformAdmin.id,
        p_reason: resolutionReason,
      }
    );
    if (error) throw error;
    if (data !== true) {
      return res.status(409).json({
        error: "Příznak nelze opravit nebo už byl opraven.",
      });
    }

    return res.status(200).json({
      ok: true,
      passwordFlagRepaired: true,
      emailSent: false,
    });
  } catch (error) {
    console.error("repair-profile-password-flag error:", error);
    return res.status(500).json({
      error: "Příznak hesla se nepodařilo bezpečně opravit.",
    });
  }
}
