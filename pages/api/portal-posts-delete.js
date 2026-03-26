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

    // ověření admina
    const { data: isAdmin, error: adminError } = await supabaseUser.rpc("is_admin");
    if (adminError) throw adminError;
    if (!isAdmin) {
      return res.status(403).json({ error: "Nemáte oprávnění." });
    }

    const { id } = req.body || {};
    if (!id) {
      return res.status(400).json({ error: "Chybí ID příspěvku." });
    }

    // 1) načíst příspěvek (kvůli souborům)
    const { data: post, error: fetchError } = await supabaseAdmin
      .from("portal_posts")
      .select("image_path, attachment_path")
      .eq("id", id)
      .single();

    if (fetchError) throw fetchError;

    const filesToDelete = [
      post?.image_path,
      post?.attachment_path,
    ].filter(Boolean);

    // 2) smazat z DB
    const { error: deleteError } = await supabaseAdmin
      .from("portal_posts")
      .delete()
      .eq("id", id);

    if (deleteError) throw deleteError;

    // 3) smazat soubory (neblokující)
    if (filesToDelete.length > 0) {
      try {
        await supabaseAdmin.storage
          .from("portal-posts")
          .remove(filesToDelete);
      } catch (e) {
        console.warn("Mazání souborů selhalo:", e);
      }
    }

    return res.status(200).json({ success: true });
  } catch (e) {
    return res.status(500).json({
      error: e?.message || "Nepodařilo se smazat příspěvek.",
    });
  }
}
