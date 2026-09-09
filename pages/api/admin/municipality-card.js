import { createClient } from "@supabase/supabase-js";
import { getBearerToken, requirePlatformAdmin } from "../../../lib/server/platformAdminApi";
import { consumeAuthenticatedRateLimit } from "../../../lib/server/authenticatedRateLimit";

const adminClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    const admin = await requirePlatformAdmin(req, res, adminClient);
    if (!admin) return;
    const body = req.body || {};
    if (body.organizationId && !UUID.test(body.organizationId)) {
      return res.status(400).json({ error: "Neplatné ID obce." });
    }
    const fields = { name: 160, legalIdentifier: 20, address: 300, contactName: 120, contactEmail: 254, contactPhone: 32, eligibilityReference: 500 };
    for (const [field, length] of Object.entries(fields)) {
      if (body[field] != null && (typeof body[field] !== "string" || body[field].length > length)) {
        return res.status(400).json({ error: "Zkontrolujte délku a formát zadaných údajů." });
      }
    }
    const allowed = await consumeAuthenticatedRateLimit({
      supabaseAdmin: adminClient, req, route: "admin-municipality-card", userId: admin.id,
      resourceId: admin.id, limit: 20, windowSeconds: 600,
    });
    if (!allowed) {
      res.setHeader("Retry-After", "600");
      return res.status(429).json({ error: "Příliš mnoho pokusů. Zkuste to prosím později." });
    }
    const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
      auth: { persistSession: false },
      global: { headers: { Authorization: `Bearer ${getBearerToken(req)}` } },
    });
    const { data, error } = await client.rpc("save_classroom_municipality_card", {
      p_organization_id: body.organizationId || null,
      p_name: body.name || "", p_legal_identifier: body.legalIdentifier || null,
      p_address: body.address || null, p_contact_name: body.contactName || null,
      p_contact_email: body.contactEmail || null, p_contact_phone: body.contactPhone || null,
      p_classroom_verified: body.classroomVerified === true,
      p_eligibility_reference: body.eligibilityReference || null,
      p_activate_license: body.activateLicense === true,
    });
    if (error?.code === "23505") {
      return res.status(409).json({
        error: "Obec se shodným názvem nebo IČO již evidujeme. Zkontrolujte existující kartu; nová obec nebyla založena.",
        existingId: UUID.test(error.details || "") ? error.details : null,
      });
    }
    if (error?.code === "22023") return res.status(400).json({ error: "Vyplňte název, ověřte formát údajů a při zakládání potvrďte učebnu ARCHIMEDES." });
    if (error?.code === "P0002") return res.status(404).json({ error: "Obec nebyla nalezena." });
    if (error?.code === "42501") return res.status(403).json({ error: "Tuto akci může provést pouze správce platformy." });
    if (error || !data?.[0]?.id) throw error || new Error("Missing municipality result");
    const { data: confirmed, error: readError } = await client.from("organizations")
      .select("id,registration_number").eq("id", data[0].id).single();
    if (readError || confirmed?.registration_number !== data[0].registration_number) throw readError || new Error("Read-back failed");
    return res.status(body.organizationId ? 200 : 201).json({ ok: true, municipality: data[0] });
  } catch (error) {
    console.error("municipality-card error", error?.code || "unknown");
    return res.status(500).json({ error: "Kartu obce se nepodařilo uložit. Obnovte přehled a ověřte, zda již existuje." });
  }
}
