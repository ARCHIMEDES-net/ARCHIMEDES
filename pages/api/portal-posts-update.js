import { createClient } from "@supabase/supabase-js";
import { consumeAuthenticatedRateLimit } from "../../lib/server/authenticatedRateLimit";
import { requirePlatformAdmin } from "../../lib/server/platformAdminApi";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Chybí konfigurace Supabase pro administrační API.");
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    String(value || "")
  );
}

function cleanOptionalPath(value) {
  if (value == null || value === "") return null;
  const clean = String(value).trim();
  if (!clean || clean.length > 500 || clean.includes("\0")) return null;
  return clean;
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const admin = await requirePlatformAdmin(req, res, supabaseAdmin);
    if (!admin) return;

    const { id, title, content, is_published, image_path } = req.body || {};
    if (!isUuid(id)) return res.status(400).json({ error: "Neplatné ID příspěvku." });

    const allowed = await consumeAuthenticatedRateLimit({
      supabaseAdmin,
      req,
      route: "portal-posts-update",
      userId: admin.id,
      resourceId: String(id),
      limit: 60,
      windowSeconds: 10 * 60,
    });

    if (!allowed) {
      res.setHeader("Retry-After", "600");
      return res.status(429).json({
        error: "Příspěvek byl upravován příliš často. Zkuste to prosím později.",
      });
    }

    const cleanTitle = String(title || "").trim();
    const cleanContent = String(content || "").trim();

    if (cleanTitle.length < 1 || cleanTitle.length > 200) {
      return res.status(400).json({ error: "Nadpis musí mít nejvýše 200 znaků." });
    }
    if (cleanContent.length < 1 || cleanContent.length > 50000) {
      return res.status(400).json({ error: "Text příspěvku musí mít nejvýše 50 000 znaků." });
    }

    const { data, error } = await supabaseAdmin
      .from("portal_posts")
      .update({
        title: cleanTitle,
        content: cleanContent,
        is_published: is_published === true,
        image_path: cleanOptionalPath(image_path),
      })
      .eq("id", id)
      .select("id")
      .maybeSingle();

    if (error) {
      console.error("portal-posts-update error:", error);
      return res.status(500).json({ error: "Nepodařilo se upravit příspěvek." });
    }
    if (!data) return res.status(404).json({ error: "Příspěvek nebyl nalezen." });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("portal-posts-update unexpected error:", error);
    return res.status(500).json({ error: "Nepodařilo se upravit příspěvek." });
  }
}
