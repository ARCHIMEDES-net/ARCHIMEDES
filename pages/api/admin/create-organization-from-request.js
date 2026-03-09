import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function mapLicenseTypeToOrgType(value) {
  const v = String(value || "").toLowerCase().trim();

  if (["skola", "škola", "school"].includes(v)) return "school";
  if (["obec", "mesto", "město", "municipality"].includes(v)) return "municipality";
  if (["senior", "senior-klub", "senior klub"].includes(v)) return "senior_club";
  if (["spolek", "association"].includes(v)) return "association";
  if (["partner"].includes(v)) return "partner";

  return "community_center";
}

function makeJoinCode() {
  return "ORG-" + Math.random().toString(36).substring(2, 8).toUpperCase();
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { requestId, organizationName, licenseType } = req.body || {};

    if (!requestId) {
      return res.status(400).json({ error: "Chybí requestId." });
    }

    if (!organizationName || !String(organizationName).trim()) {
      return res.status(400).json({ error: "Chybí název organizace." });
    }

    const trimmedName = String(organizationName).trim();

    const { data: existingRequest, error: requestError } = await supabaseAdmin
      .from("access_requests")
      .select("id, organization_id")
      .eq("id", requestId)
      .single();

    if (requestError) {
      throw requestError;
    }

    if (!existingRequest) {
      return res.status(404).json({ error: "Žádost nebyla nalezena." });
    }

    if (existingRequest.organization_id) {
      return res.status(400).json({ error: "Organizace už byla z této žádosti vytvořena." });
    }

    let joinCode = makeJoinCode();

    for (let i = 0; i < 5; i += 1) {
      const { data: existingOrg } = await supabaseAdmin
        .from("organizations")
        .select("id")
        .eq("join_code", joinCode)
        .maybeSingle();

      if (!existingOrg) break;
      joinCode = makeJoinCode();
    }

    const { data: organization, error: orgError } = await supabaseAdmin
      .from("organizations")
      .insert([
        {
          name: trimmedName,
          org_type: mapLicenseTypeToOrgType(licenseType),
          status: "active",
          join_code: joinCode,
        },
      ])
      .select()
      .single();

    if (orgError) {
      throw orgError;
    }

    const { error: requestUpdateError } = await supabaseAdmin
      .from("access_requests")
      .update({
        organization_id: organization.id,
      })
      .eq("id", requestId);

    if (requestUpdateError) {
      throw requestUpdateError;
    }

    return res.status(200).json({
      success: true,
      organization,
    });
  } catch (err) {
    console.error("create-organization-from-request error:", err);
    return res.status(500).json({
      error: err?.message || "Nepodařilo se vytvořit organizaci.",
    });
  }
}
