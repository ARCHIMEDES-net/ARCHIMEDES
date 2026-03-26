import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ error: "Chybí autorizace." });
    }

    const supabaseUser = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        global: { headers: { Authorization: `Bearer ${token}` } },
      }
    );

    const { data: isAdmin } = await supabaseUser.rpc("is_admin");
    if (!isAdmin) {
      return res.status(403).json({ error: "Nemáte oprávnění." });
    }

    const { id, title, content, is_published } = req.body || {};

    if (!id || !title || !content) {
      return res.status(400).json({ error: "Chybí data." });
    }

    const { error } = await supabaseAdmin
      .from("portal_posts")
      .update({
        title,
        content,
        is_published,
      })
      .eq("id", id);

    if (error) throw error;

    return res.status(200).json({ success: true });
  } catch (e) {
    return res.status(500).json({
      error: e?.message || "Nepodařilo se upravit příspěvek.",
    });
  }
}
