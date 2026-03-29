// pages/api/create-organization.js
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const RESERVED_ORGANIZATION_NAMES = ["ARCHIMEDES DEMO SKOLA"];

function generateJoinCode() {
  const part = Math.random().toString(16).slice(2, 10).toUpperCase();
  return `ORG-${part}`;
}

function normalizeText(value = "") {
  return String(value).trim();
}

function normalizeName(value = "") {
  return normalizeText(value).toLowerCase();
}

function getBearerToken(req) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || typeof authHeader !== "string") return null;

  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : null;
}

async function generateUniqueJoinCode() {
  for (let i = 0; i < 10; i += 1) {
    const joinCode = generateJoinCode();

    const { data, error } = await supabaseAdmin
      .from("organizations")
      .select("id")
      .eq("join_code", joinCode);

    if (error) {
      throw new Error(
        `Nepodařilo se ověřit unikátnost kódu organizace: ${error.message}`
      );
    }

    if (!data || data.length === 0) {
      return joinCode;
    }
  }

  throw new Error("Nepodařilo se vygenerovat unikátní kód organizace.");
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const token = getBearerToken(req);

    if (!token) {
      return res.status(401).json({ error: "Chybí autorizace uživatele." });
    }

    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      return res
        .status(401)
        .json({ error: "Neplatné nebo expirované přihlášení." });
    }

    const { organizationName, orgType } = req.body || {};

    const cleanUserId = normalizeText(user.id || "");
    const cleanOrganizationName = normalizeText(organizationName || "");
    const cleanOrgType = normalizeText(orgType || "");

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
      return res
        .status(401)
        .json({ error: "Nepodařilo se ověřit uživatele." });
    }

    if (!cleanOrganizationName) {
      return res.status(400).json({ error: "Vyplňte název organizace." });
    }

    if (
      RESERVED_ORGANIZATION_NAMES.map(normalizeName).includes(
        normalizeName(cleanOrganizationName)
      )
    ) {
      return res.status(400).json({
        error:
          "Tento název organizace je rezervovaný systémem a nelze jej použít.",
      });
    }

    if (!allowedTypes.includes(cleanOrgType)) {
      return res.status(400).json({ error: "Neplatný typ organizace." });
    }

    const { data: existingMemberships, error: membershipCheckError } =
      await supabaseAdmin
        .from("organization_members")
        .select("id, organization_id")
        .eq("user_id", cleanUserId)
        .eq("status", "active");

    if (membershipCheckError) {
      return res.status(400).json({ error: membershipCheckError.message });
    }

    if ((existingMemberships || []).length > 1) {
      return res.status(400).json({
        error:
          "Uživatel má více aktivních členství. Nejprve je potřeba odstranit duplicity.",
      });
    }

    if (existingMemberships?.[0]?.organization_id) {
      return res.status(400).json({
        error: "Uživatel už je přiřazen k aktivní organizaci.",
      });
    }

    const { data: existingOrganizations, error: nameCheckError } =
      await supabaseAdmin
        .from("organizations")
        .select("id, name")
        .eq("name", cleanOrganizationName);

    if (nameCheckError) {
      return res.status(400).json({ error: nameCheckError.message });
    }

    if ((existingOrganizations || []).length > 0) {
      return res.status(400).json({
        error: "Organizace s tímto názvem už existuje.",
      });
    }

    const joinCode = await generateUniqueJoinCode();

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

    let profileSyncWarning = "";

    const { error: profileUpdateError } = await supabaseAdmin
      .from("profiles")
      .update({
        active_organization_id: organization.id,
        user_type: "organization",
      })
      .eq("id", cleanUserId);

    if (profileUpdateError) {
      console.error("create-organization profile sync warning:", profileUpdateError);
      profileSyncWarning =
        "Organizace byla vytvořena, ale nepodařilo se plně synchronizovat profil.";
    }

    return res.status(200).json({
      success: true,
      organizationId: organization.id,
      organizationName: organization.name,
      orgType: organization.org_type,
      joinCode: organization.join_code,
      ...(profileSyncWarning ? { profileSyncWarning } : {}),
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message || "Serverová chyba.",
    });
  }
}
