import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const SITE_URL = "https://www.archimedeslive.com";
const REDIRECT_TO = `${SITE_URL}/login`;

function generateJoinCode() {
  const part = Math.random().toString(16).slice(2, 10).toUpperCase();
  return `ORG-${part}`;
}

function normalizeOrgType(value) {
  const allowedTypes = [
    "school",
    "municipality",
    "senior_club",
    "association",
    "community_center",
    "diaspora",
    "partner",
  ];

  const clean = String(value || "").trim();
  return allowedTypes.includes(clean) ? clean : "school";
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { organizationName, email, orgType } = req.body || {};

    const cleanOrganizationName = String(organizationName || "").trim();
    const cleanEmail = String(email || "").trim().toLowerCase();
    const cleanOrgType = normalizeOrgType(orgType);

    if (!cleanOrganizationName) {
      return res.status(400).json({ error: "Vyplňte název organizace." });
    }

    if (!cleanEmail) {
      return res.status(400).json({ error: "Vyplňte e-mail." });
    }

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail);
    if (!emailOk) {
      return res.status(400).json({ error: "Zadejte platný e-mail." });
    }

    let joinCode = generateJoinCode();

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

    const { data: invitedUser, error: inviteError } =
      await supabaseAdmin.auth.admin.inviteUserByEmail(cleanEmail, {
        redirectTo: REDIRECT_TO,
        data: {
          full_name: cleanOrganizationName,
        },
      });

    if (inviteError) {
      return res.status(400).json({ error: inviteError.message });
    }

    const invitedUserId = invitedUser?.user?.id;

    if (!invitedUserId) {
      return res
        .status(500)
        .json({ error: "Nepodařilo se získat ID uživatele." });
    }

    const { data: existingMembership } = await supabaseAdmin
      .from("organization_members")
      .select("organization_id")
      .eq("user_id", invitedUserId)
      .eq("status", "active")
      .maybeSingle();

    if (existingMembership?.organization_id) {
      return res.status(400).json({
        error: "Tento uživatel už je přiřazen k aktivní organizaci.",
      });
    }

    const { data: organization, error: orgError } = await supabaseAdmin
      .from("organizations")
      .insert({
        name: cleanOrganizationName,
        org_type: cleanOrgType,
        join_code: joinCode,
        status: "active",
        license_status: "trial",
        license_valid_until: new Date(
          Date.now() + 14 * 24 * 60 * 60 * 1000
        ).toISOString(),
      })
      .select("id, name, join_code, license_status, license_valid_until")
      .single();

    if (orgError) {
      return res.status(400).json({ error: orgError.message });
    }

    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .upsert(
        {
          id: invitedUserId,
          email: cleanEmail,
          full_name: cleanOrganizationName,
          is_active: true,
          must_set_password: true,
        },
        { onConflict: "id" }
      );

    if (profileError) {
      return res.status(400).json({ error: profileError.message });
    }

    const { error: membershipError } = await supabaseAdmin
      .from("organization_members")
      .insert({
        organization_id: organization.id,
        user_id: invitedUserId,
        role_in_org: "organization_admin",
        status: "active",
      });

    if (membershipError) {
      return res.status(400).json({ error: membershipError.message });
    }

    const { error: accessRequestError } = await supabaseAdmin
      .from("access_requests")
      .insert({
        contact_name: cleanOrganizationName,
        organization: cleanOrganizationName,
        email: cleanEmail,
        license_type: cleanOrgType,
        status: "approved",
        organization_id: organization.id,
        admin_invited_email: cleanEmail,
      });

    if (accessRequestError) {
      // neblokuje demo, jen evidenci
      console.error("access_requests insert error:", accessRequestError.message);
    }

    return res.status(200).json({
      success: true,
      message: "Demo bylo spuštěno.",
      organizationId: organization.id,
      organizationName: organization.name,
      joinCode: organization.join_code,
      licenseStatus: organization.license_status,
      licenseValidUntil: organization.license_valid_until,
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message || "Serverová chyba.",
    });
  }
}
