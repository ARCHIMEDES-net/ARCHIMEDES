import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const SITE_URL = "https://www.archimedeslive.com";
const REDIRECT_TO = `${SITE_URL}/login`;

function getBearerToken(req) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || typeof authHeader !== "string") return null;

  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : null;
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
      return res.status(401).json({
        error: "Neplatné nebo expirované přihlášení.",
      });
    }

    const { email, fullName, role } = req.body || {};

    const cleanEmail = String(email || "").trim().toLowerCase();
    const cleanFullName = String(fullName || "").trim();
    const cleanRole =
      role === "organization_admin" ? "organization_admin" : "member";
    const cleanInviterUserId = String(user.id || "").trim();

    if (!cleanEmail) {
      return res.status(400).json({ error: "Vyplňte e-mail." });
    }

    if (!cleanFullName) {
      return res.status(400).json({ error: "Vyplňte jméno a příjmení." });
    }

    if (!cleanInviterUserId) {
      return res.status(401).json({ error: "Nepodařilo se ověřit uživatele." });
    }

    // 1) Najít organizaci a oprávnění skutečně přihlášeného uživatele
    const { data: inviterMembership, error: inviterMembershipError } =
      await supabaseAdmin
        .from("organization_members")
        .select("organization_id, role_in_org, status")
        .eq("user_id", cleanInviterUserId)
        .eq("status", "active")
        .maybeSingle();

    if (inviterMembershipError) {
      return res.status(400).json({ error: inviterMembershipError.message });
    }

    if (!inviterMembership) {
      return res.status(403).json({
        error: "Zvoucí uživatel není přiřazen k žádné aktivní organizaci.",
      });
    }

    if (inviterMembership.role_in_org !== "organization_admin") {
      return res.status(403).json({
        error: "Tuto akci může provádět pouze administrátor organizace.",
      });
    }

    const organizationId = inviterMembership.organization_id;

    // 2) Poslat pozvánku
    const { data: invitedUser, error: inviteError } =
      await supabaseAdmin.auth.admin.inviteUserByEmail(cleanEmail, {
        redirectTo: REDIRECT_TO,
        data: {
          full_name: cleanFullName,
        },
      });

    if (inviteError) {
      return res.status(400).json({ error: inviteError.message });
    }

    const invitedUserId = invitedUser?.user?.id;

    if (!invitedUserId) {
      return res
        .status(500)
        .json({ error: "Nepodařilo se získat ID pozvaného uživatele." });
    }

    // 3) Zkontrolovat, zda už uživatel není v jiné aktivní organizaci
    const { data: existingMemberships, error: membershipLookupError } =
      await supabaseAdmin
        .from("organization_members")
        .select("organization_id, status")
        .eq("user_id", invitedUserId)
        .eq("status", "active");

    if (membershipLookupError) {
      return res.status(400).json({ error: membershipLookupError.message });
    }

    const hasOtherActiveOrg = (existingMemberships || []).some(
      (m) => m.organization_id !== organizationId
    );

    if (hasOtherActiveOrg) {
      return res.status(400).json({
        error: "Uživatel už je přiřazen k jiné aktivní organizaci.",
      });
    }

    // 4) Profil
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .upsert(
        {
          id: invitedUserId,
          email: cleanEmail,
          full_name: cleanFullName,
          is_active: true,
          must_set_password: true,
        },
        { onConflict: "id" }
      );

    if (profileError) {
      return res.status(400).json({ error: profileError.message });
    }

    // 5) Členství v organizaci
    const { error: membershipError } = await supabaseAdmin
      .from("organization_members")
      .upsert(
        {
          organization_id: organizationId,
          user_id: invitedUserId,
          role_in_org: cleanRole,
          status: "active",
        },
        { onConflict: "user_id,organization_id" }
      );

    if (membershipError) {
      return res.status(400).json({ error: membershipError.message });
    }

    return res.status(200).json({
      success: true,
      message: "Pozvánka byla odeslána a uživatel byl přiřazen do organizace.",
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message || "Serverová chyba.",
    });
  }
}
