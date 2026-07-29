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

function normalizeSection(value = "") {
  const raw = String(value || "").toLowerCase().trim();
  return raw === "contests" ? "contests" : raw === "community" ? "community" : "";
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

    const allowed = await consumeAuthenticatedRateLimit({
      supabaseAdmin,
      req,
      route: "portal-posts-create",
      userId: admin.id,
      limit: 30,
      windowSeconds: 10 * 60,
    });

    if (!allowed) {
      res.setHeader("Retry-After", "600");
      return res.status(429).json({
        error: "Příspěvky byly vytvářeny příliš často. Zkuste to prosím později.",
      });
    }

    const section = normalizeSection(req.body?.section);
    const title = String(req.body?.title || "").trim();
    const content = String(req.body?.content || "").trim();
    const is_published = req.body?.is_published === true;
    const image_path = cleanOptionalPath(req.body?.image_path);
    const attachment_path = cleanOptionalPath(req.body?.attachment_path);
    const attachment_name = req.body?.attachment_name
      ? String(req.body.attachment_name).trim()
      : null;

    if (!section) return res.status(400).json({ error: "Neplatná sekce." });
    if (title.length < 1 || title.length > 200) {
      return res.status(400).json({ error: "Nadpis musí mít nejvýše 200 znaků." });
    }
    if (content.length < 1 || content.length > 50000) {
      return res.status(400).json({ error: "Text příspěvku musí mít nejvýše 50 000 znaků." });
    }
    if (attachment_name && attachment_name.length > 255) {
      return res.status(400).json({ error: "Název přílohy je příliš dlouhý." });
    }

    const { error: insertError } = await supabaseAdmin.from("portal_posts").insert({
      section,
      title,
      content,
      image_path,
      attachment_path,
      attachment_name,
      is_published,
      created_by: admin.id,
    });

    if (insertError) {
      console.error("portal-posts-create insert error:", insertError);
      return res.status(500).json({ error: "Nepodařilo se uložit příspěvek." });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("portal-posts-create error:", err);
    return res.status(500).json({ error: "Neočekávaná chyba při ukládání příspěvku." });
  }
}
