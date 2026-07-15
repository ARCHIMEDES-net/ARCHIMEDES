import { createClient } from "@supabase/supabase-js";
import { getEmailGroups } from "../../../lib/server/emailGroups";
import { requirePlatformAdmin } from "../../../lib/server/platformAdminApi";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const admin = await requirePlatformAdmin(req, res, supabaseAdmin);
    if (!admin) return;

    const requestedGroups = Array.isArray(req.body?.groups)
      ? [...new Set(req.body.groups.map((item) => String(item || "").trim()).filter(Boolean))]
      : [];

    if (requestedGroups.length === 0) {
      return res.status(400).json({ error: "Vyberte alespoň jednu skupinu zájmu." });
    }

    const groups = await getEmailGroups(supabaseAdmin);
    const groupsBySlug = new Map(groups.map((group) => [group.slug, group]));
    const unknownGroups = requestedGroups.filter((slug) => !groupsBySlug.has(slug));

    if (unknownGroups.length > 0) {
      return res.status(400).json({ error: "Výběr obsahuje neplatnou skupinu zájmu." });
    }

    const recipientsByEmail = new Map();

    for (const slug of requestedGroups) {
      for (const user of groupsBySlug.get(slug).users) {
        const normalizedEmail = String(user.email || "").trim().toLowerCase();
        if (!normalizedEmail || recipientsByEmail.has(normalizedEmail)) continue;
        recipientsByEmail.set(normalizedEmail, { email: user.email.trim() });
      }
    }

    const users = [...recipientsByEmail.values()].sort((a, b) =>
      a.email.localeCompare(b.email, "cs")
    );

    return res.status(200).json({ groups: requestedGroups, count: users.length, users });
  } catch (error) {
    console.error("broadcast-recipients error:", error);
    return res.status(500).json({ error: "Nepodařilo se vytvořit seznam příjemců." });
  }
}
