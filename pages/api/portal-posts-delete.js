import { createClient } from "@supabase/supabase-js";
import { consumeAuthenticatedRateLimit } from "../../lib/server/authenticatedRateLimit";
import { requirePlatformAdmin } from "../../lib/server/platformAdminApi";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    String(value || "")
  );
}

function isSafeStoragePath(value) {
  if (!value || typeof value !== "string" || value.length > 500 || value.includes("\0")) {
    return false;
  }
  return !value.startsWith("/") && !value.split("/").includes("..");
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

    const { id } = req.body || {};
    if (!isUuid(id)) return res.status(400).json({ error: "Neplatné ID příspěvku." });

    const allowed = await consumeAuthenticatedRateLimit({
      supabaseAdmin,
      req,
      route: "portal-posts-delete",
      userId: admin.id,
      resourceId: String(id),
      limit: 20,
      windowSeconds: 10 * 60,
    });

    if (!allowed) {
      res.setHeader("Retry-After", "600");
      return res.status(429).json({
        error: "Příspěvky byly mazány příliš často. Zkuste to prosím později.",
      });
    }

    const { data: post, error: fetchError } = await supabaseAdmin
      .from("portal_posts")
      .select("image_path, attachment_path")
      .eq("id", id)
      .maybeSingle();

    if (fetchError) {
      console.error("portal-posts-delete fetch error:", fetchError);
      return res.status(500).json({ error: "Nepodařilo se načíst příspěvek." });
    }
    if (!post) return res.status(404).json({ error: "Příspěvek nebyl nalezen." });

    const { error: deleteError } = await supabaseAdmin
      .from("portal_posts")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("portal-posts-delete database error:", deleteError);
      return res.status(500).json({ error: "Nepodařilo se smazat příspěvek." });
    }

    const filesToDelete = [post.image_path, post.attachment_path].filter(isSafeStoragePath);
    if (filesToDelete.length > 0) {
      const { error: storageError } = await supabaseAdmin.storage
        .from("portal-posts")
        .remove(filesToDelete);
      if (storageError) {
        console.warn("portal-posts-delete storage cleanup failed:", storageError);
      }
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("portal-posts-delete unexpected error:", error);
    return res.status(500).json({ error: "Nepodařilo se smazat příspěvek." });
  }
}
