import { createClient } from "@supabase/supabase-js";
import { resolveOrganizationAccess } from "../../lib/server/organizationAccess";
import { consumePublicRateLimit } from "../../lib/server/publicRateLimit";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.archimedeslive.com";
const REDIRECT_TO = `${SITE_URL}/nastavit-heslo`;

function getBearerToken(req) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || typeof authHeader !== "string") return null;

  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : null;
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
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

    if (!isValidEmail(cleanEmail) || cleanEmail.length > 254) {
      return res.status(400).json({ error: "Zadejte platný e-mail." });
    }

    if (cleanFullName.length < 2 || cleanFullName.length > 120) {
      return res.status(400).json({
        error: "Jméno musí mít 2 až 120 znaků.",
      });
    }

    if (!cleanInviterUserId) {
      return res.status(401).json({ error: "Nepodařilo se ověřit uživatele." });
    }

    const { data: inviterProfile, error: inviterProfileError } =
      await supabaseAdmin
        .from("profiles")
        .select("active_organization_id")
        .eq("id", cleanInviterUserId)
        .maybeSingle();

    if (inviterProfileError) {
      throw inviterProfileError;
    }

    const organizationId = inviterProfile?.active_organization_id || null;

    if (!organizationId) {
      return res.status(403).json({ error: "Chybí aktivní škola uživatele." });
    }

    const inviterAccess = await resolveOrganizationAccess({
      supabaseAdmin,
      userId: cleanInviterUserId,
      organizationId,
      requireAdmin: true,
    });

    if (!inviterAccess) {
      return res.status(403).json({
        error: "Tuto akci může provádět pouze administrátor organizace.",
      });
    }

    const { data: organization, error: organizationError } = await supabaseAdmin
      .from("organizations")
      .select("org_type, status")
      .eq("id", organizationId)
      .maybeSingle();

    if (organizationError) {
      throw organizationError;
    }

    if (!organization || organization.org_type !== "school" || organization.status !== "active") {
      return res.status(403).json({
        error: "Jednotlivé uživatele lze zvát pouze do aktivní školy.",
      });
    }

    const rateLimitAllowed = await consumePublicRateLimit({
      supabaseAdmin,
      req,
      route: `invite-user:${cleanInviterUserId}:${organizationId}`,
      limit: 20,
      windowSeconds: 60 * 60,
    });

    if (!rateLimitAllowed) {
      res.setHeader("Retry-After", "3600");
      return res.status(429).json({
        error: "Bylo odesláno příliš mnoho pozvánek. Zkuste to prosím později.",
      });
    }

    const { data: invitedUser, error: inviteError } =
      await supabaseAdmin.auth.admin.inviteUserByEmail(cleanEmail, {
        redirectTo: REDIRECT_TO,
        data: {
          full_name: cleanFullName,
        },
      });

    if (inviteError) {
      if (/already|registered|exists/i.test(inviteError.message || "")) {
        return res.status(409).json({
          error: "Účet s tímto e-mailem už existuje.",
        });
      }
      throw inviteError;
    }

    const invitedUserId = invitedUser?.user?.id;

    if (!invitedUserId) {
      return res
        .status(500)
        .json({ error: "Nepodařilo se získat ID pozvaného uživatele." });
    }

    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .upsert(
        {
          id: invitedUserId,
          email: cleanEmail,
          full_name: cleanFullName,
          is_active: true,
          must_set_password: true,
          active_organization_id: organizationId,
        },
        { onConflict: "id" }
      );

    if (profileError) {
      throw profileError;
    }

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
      throw membershipError;
    }

    return res.status(200).json({
      success: true,
      message: "Pozvánka byla odeslána a uživatel byl přiřazen do organizace.",
    });
  } catch (err) {
    console.error("invite-user error:", err);
    return res.status(500).json({ error: "Pozvánku se nepodařilo dokončit." });
  }
}
