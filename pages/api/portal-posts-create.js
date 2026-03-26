// pages/api/portal-posts-create.js
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;

const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error(
    "Chybí SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY nebo SUPABASE_SERVICE_ROLE_KEY."
  );
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

function getAccessToken(req) {
  const authHeader = req.headers.authorization || "";
  if (authHeader.toLowerCase().startsWith("bearer ")) {
    return authHeader.slice(7).trim();
  }
  return "";
}

function normalizeSection(value = "") {
  const raw = String(value || "").toLowerCase().trim();
  return raw === "contests" ? "contests" : raw === "community" ? "community" : "";
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const accessToken = getAccessToken(req);
    if (!accessToken) {
      return res.status(401).json({ error: "Chybí přístupový token." });
    }

    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    });

    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser();

    if (userError || !user) {
      return res.status(401).json({ error: "Nepodařilo se ověřit přihlášeného uživatele." });
    }

    const { data: isAdminResult, error: isAdminError } = await userClient.rpc("is_admin");
    if (isAdminError) {
      return res.status(403).json({ error: "Nepodařilo se ověřit admin oprávnění." });
    }

    if (!isAdminResult) {
      return res.status(403).json({ error: "Tato akce je dostupná jen správcům portálu." });
    }

    const section = normalizeSection(req.body?.section);
    const title = String(req.body?.title || "").trim();
    const content = String(req.body?.content || "").trim();
    const is_published = !!req.body?.is_published;
    const image_path = req.body?.image_path ? String(req.body.image_path).trim() : null;
    const attachment_path = req.body?.attachment_path
      ? String(req.body.attachment_path).trim()
      : null;
    const attachment_name = req.body?.attachment_name
      ? String(req.body.attachment_name).trim()
      : null;

    if (!section) {
      return res.status(400).json({ error: "Neplatná sekce." });
    }

    if (!title) {
      return res.status(400).json({ error: "Vyplňte nadpis." });
    }

    if (!content) {
      return res.status(400).json({ error: "Vyplňte text příspěvku." });
    }

    const { error: insertError } = await supabaseAdmin.from("portal_posts").insert({
      section,
      title,
      content,
      image_path,
      attachment_path,
      attachment_name,
      is_published,
      created_by: user.id,
    });

    if (insertError) {
      return res.status(500).json({ error: insertError.message || "Nepodařilo se uložit příspěvek." });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({
      error: err?.message || "Neočekávaná chyba při ukládání příspěvku.",
    });
  }
}
