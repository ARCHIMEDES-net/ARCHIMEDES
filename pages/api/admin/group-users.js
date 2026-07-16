import { createClient } from "@supabase/supabase-js";
import { getEmailGroups } from "../../../lib/server/emailGroups";
import { requirePlatformAdmin } from "../../../lib/server/platformAdminApi";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const admin = await requirePlatformAdmin(req, res, supabaseAdmin);
    if (!admin) return;

    const { group } = req.query;

    if (!group || Array.isArray(group)) {
      return res.status(400).json({ error: "Chybí skupina." });
    }

    const groups = await getEmailGroups(supabaseAdmin);
    const selectedGroup = groups.find((item) => item.slug === group);

    if (!selectedGroup) {
      return res.status(404).json({ error: "Skupina nebyla nalezena." });
    }

    return res.status(200).json({
      group,
      count: selectedGroup.count,
      users: selectedGroup.users,
    });
  } catch (err) {
    console.error("group-users error:", err);
    return res.status(500).json({ error: "Nepodařilo se načíst příjemce." });
  }
}
