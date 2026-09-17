import { createClient } from "@supabase/supabase-js";
import { requirePlatformAdmin } from "../../../lib/server/platformAdminApi";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "GET") { res.setHeader("Allow", "GET"); return res.status(405).json({ error: "Nepovolená metoda." }); }
  try {
    const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
    if (!await requirePlatformAdmin(req, res, client)) return;
    const rows = [];
    for (let offset = 0; ; offset += 500) {
      const { data, error } = await client.from("organizations")
        .select("id,name,org_type,status,parent_organization_id,is_system,license_plan,license_started_at,license_valid_until,license_status,billing_status")
        .order("id").range(offset, offset + 499);
      if (error) throw error;
      rows.push(...(data || []));
      if (!data || data.length < 500) break;
    }
    const names = new Map(rows.map(row => [row.id, row.name]));
    return res.status(200).json({ organizations: rows.map(row => ({ ...row, parent_name: names.get(row.parent_organization_id) || "" })) });
  } catch (_error) {
    return res.status(500).json({ error: "Seznam organizací se nepodařilo načíst. Zkuste jej obnovit." });
  }
}
