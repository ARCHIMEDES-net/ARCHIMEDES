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

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const accessToken = getAccessToken(req);
    if (!accessToken) {
      return res.status(401).json({ error: "Chybí autorizace." });
    }

    const supabaseUser = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    });

    const {
      data: { user },
      error: userError,
    } = await supabaseUser.auth.getUser();

    if (userError || !user) {
      return res.status(401).json({ error: "Nepodařilo se ověřit přihlášeného uživatele." });
    }

    const { data: isAdminResult, error: isAdminError } = await supabaseUser.rpc("is_admin");
    if (isAdminError) {
      return res.status(403).json({ error: "Nepodařilo se ověřit admin oprávnění." });
    }

    if (!isAdminResult) {
      return res.status(403).json({ error: "Tato akce je dostupná jen správcům portálu." });
    }

    const { id, title, content, is_published, image_path } = req.body || {};

    if (!id) {
      return res.status(400).json({ error: "Chybí ID příspěvku." });
    }

    if (!String(title || "").trim()) {
      return res.status(400).json({ error: "Vyplňte nadpis." });
    }

    if (!String(content || "").trim()) {
      return res.status(400).json({ error: "Vyplňte text příspěvku." });
    }

    const payload = {
      title: String(title).trim(),
      content: String(content).trim(),
      is_published: !!is_published,
      image_path: image_path ? String(image_path).trim() : null,
    };

    const { error } = await supabaseAdmin
      .from("portal_posts")
      .update(payload)
      .eq("id", id);

    if (error) {
      return res.status(500).json({
        error: error.message || "Nepodařilo se upravit příspěvek.",
      });
    }

    return res.status(200).json({ success: true });
  } catch (e) {
    return res.status(500).json({
      error: e?.message || "Nepodařilo se upravit příspěvek.",
    });
  }
}
