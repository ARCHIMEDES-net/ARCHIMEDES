import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function generateJoinCode() {
  const part = Math.random().toString(16).slice(2, 10).toUpperCase();
  return `ORG-${part}`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { userId, organizationName, orgType } = req.body || {};

    const cleanUserId = String(userId || "").trim();
    const cleanOrganizationName = String(organizationName || "").trim();
    const cleanOrgType = String(orgType || "").trim();

    const allowedTypes = [
      "school",
      "municipality",
      "senior_club",
      "association",
      "community_center",
      "diaspora",
      "partner",
    ];

    if (!cleanUserId) {
      return res.status(400).json({ error: "Chybí userId." });
    }

    if (!cleanOrganizationName) {
      return res.status(400).json({ error: "Vyplňte název organizace." });
    }

    if (!allowedTypes.includes(cleanOrgType)) {
      return res.status(400).json({ error: "Neplatný typ organizace." });
    }

    const { data: existingMembership, error: membershipCheckError } =
      await supabaseAdmin
        .from("organization_members")
        .select("organization_id")
        .eq("user_id", cleanUserId)
        .eq("status", "active")
        .maybeSingle();

    if (membershipCheckError) {
      return res.status(400).json({ error: membershipCheckError.message });
    }

    if (existingMembership?.organization_id) {
      return res.status(400).json({
        error: "Uživatel už je přiřazen k aktivní organizaci.",
      });
    }

    let joinCode = generateJoinCode();

    // jednoduchá ochrana proti kolizi kódu
    for (let i = 0; i < 5; i++) {
      const { data: existingCode, error: codeCheckError } = await supabaseAdmin
        .from("organizations")
        .select("id")
        .eq("join_code", joinCode)
        .maybeSingle();

      if (codeCheckError) {
        return res.status(400).json({ error: codeCheckError.message });
      }

      if (!existingCode) break;
      joinCode = generateJoinCode();
    }

    const { data: organization, error: orgError } = await supabaseAdmin
      .from("organizations")
      .insert({
        name: cleanOrganizationName,
        org_type: cleanOrgType,
        join_code: joinCode,
        status: "active",
      })
      .select("id, name, org_type, join_code")
      .single();

    if (orgError) {
      return res.status(400).json({ error: orgError.message });
    }

    const { error: membershipError } = await supabaseAdmin
      .from("organization_members")
      .insert({
        organization_id: organization.id,
        user_id: cleanUserId,
        role_in_org: "organization_admin",
        status: "active",
      });

    if (membershipError) {
      return res.status(400).json({ error: membershipError.message });
    }

    return res.status(200).json({
      success: true,
      organizationId: organization.id,
      organizationName: organization.name,
      orgType: organization.org_type,
      joinCode: organization.join_code,
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message || "Serverová chyba.",
    });
  }
}
