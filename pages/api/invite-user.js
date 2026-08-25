import { createClient } from "@supabase/supabase-js";
import { consumePublicRateLimit } from "../../lib/server/publicRateLimit";
import {
  sendOrganizationUserInvitation,
  sendOrganizationUserInvitationAuditCopy,
  validateOrganizationUserInvitationEmailConfiguration,
} from "../../lib/server/organizationUserInvitation";
import { registrationEmailWasDefinitelyNotSent } from "../../lib/server/registrationEmailProvider";

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

async function cleanupManagedInvitation({
  userId,
  email,
  organizationId,
  inviterUserId,
}) {
  if (!userId) return true;

  try {
    const { data, error } = await supabaseAdmin.auth.admin.getUserById(userId);
    const metadata = data?.user?.user_metadata || {};
    const safeToDelete =
      !error &&
      data?.user?.id === userId &&
      String(data.user.email || "").trim().toLowerCase() === email &&
      metadata.archimedes_user_invitation_managed === true &&
      metadata.archimedes_user_invitation_organization_id === organizationId &&
      metadata.archimedes_user_invitation_inviter_id === inviterUserId;

    if (!safeToDelete) {
      console.error("invite-user refused unsafe cleanup", { userId, organizationId });
      return false;
    }

    const { error: membershipError } = await supabaseAdmin
      .from("organization_members")
      .delete()
      .eq("organization_id", organizationId)
      .eq("user_id", userId);
    if (membershipError) throw membershipError;

    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .delete()
      .eq("id", userId);
    if (profileError) throw profileError;

    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (authError) throw authError;
    return true;
  } catch (error) {
    console.error("invite-user cleanup failed", {
      userId,
      organizationId,
      detail: error?.message || "unknown",
    });
    return false;
  }
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  let invitedUserId = null;
  let organizationId = "";
  let cleanEmail = "";
  let cleanInviterUserId = "";
  let deliveryMayHaveStarted = false;

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

    cleanEmail = String(email || "").trim().toLowerCase();
    const cleanFullName = String(fullName || "").trim();
    const cleanRole =
      role === "organization_admin" ? "organization_admin" : "member";
    cleanInviterUserId = String(user.id || "").trim();

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

    if (!inviterProfile?.active_organization_id) {
      return res.status(403).json({ error: "Chybí aktivní škola uživatele." });
    }

    const { data: inviterMembership, error: inviterMembershipError } =
      await supabaseAdmin
        .from("organization_members")
        .select("organization_id, role_in_org, status")
        .eq("user_id", cleanInviterUserId)
        .eq("organization_id", inviterProfile.active_organization_id)
        .eq("status", "active")
        .maybeSingle();

    if (inviterMembershipError) {
      throw inviterMembershipError;
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

    organizationId = inviterMembership.organization_id;

    const { data: organization, error: organizationError } = await supabaseAdmin
      .from("organizations")
      .select("name, org_type, status")
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

    validateOrganizationUserInvitationEmailConfiguration();

    const { data: linkData, error: linkError } =
      await supabaseAdmin.auth.admin.generateLink({
        type: "invite",
        email: cleanEmail,
        options: {
          redirectTo: REDIRECT_TO,
          data: {
            full_name: cleanFullName,
            archimedes_user_invitation_managed: true,
            archimedes_user_invitation_organization_id: organizationId,
            archimedes_user_invitation_inviter_id: cleanInviterUserId,
          },
        },
      });

    invitedUserId = linkData?.user?.id || null;
    const setupUrl = linkData?.properties?.action_link || "";

    if (linkError || !invitedUserId || !setupUrl) {
      if (/already|registered|exists/i.test(linkError?.message || "")) {
        return res.status(409).json({
          error: "Účet s tímto e-mailem už existuje.",
        });
      }
      throw linkError || new Error("Invitation link generation failed");
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

    const emailValues = {
      recipientEmail: cleanEmail,
      fullName: cleanFullName,
      organizationName: organization.name,
      roleLabel:
        cleanRole === "organization_admin"
          ? "Administrátor organizace"
          : "Člen organizace",
      setupUrl,
    };

    let clientReceipt;
    try {
      const clientDelivery = sendOrganizationUserInvitation(
        emailValues,
        `organization-user-invitation:${invitedUserId}:client`
      );
      deliveryMayHaveStarted = true;
      clientReceipt = await clientDelivery;
    } catch (emailError) {
      if (registrationEmailWasDefinitelyNotSent(emailError)) {
        deliveryMayHaveStarted = false;
        throw emailError;
      }

      console.error("invite-user delivery outcome unknown", {
        invitedUserId,
        organizationId,
        code: emailError?.code || "unknown",
      });
      return res.status(502).json({
        error:
          "Přístup byl připraven, ale výsledek odeslání není známý. Pozvánku znovu neposílejte a kontaktujte podporu.",
      });
    }

    let auditCopySent = true;
    try {
      const auditReceipt = await sendOrganizationUserInvitationAuditCopy(
        emailValues,
        `organization-user-invitation:${invitedUserId}:audit`
      );
      console.info("invite-user delivered to provider", {
        invitedUserId,
        organizationId,
        provider: clientReceipt.provider,
        clientMessageId: clientReceipt.messageId,
        auditMessageId: auditReceipt.messageId,
      });
    } catch (copyError) {
      auditCopySent = false;
      console.error("invite-user audit copy failed", {
        invitedUserId,
        organizationId,
        code: copyError?.code || "unknown",
      });
    }

    return res.status(200).json({
      success: true,
      auditCopySent,
      message: auditCopySent
        ? "Pozvánka byla odeslána a uživatel byl přiřazen do organizace."
        : "Pozvánka byla uživateli odeslána. Bezpečnou kopii Zuzaně se nepodařilo odeslat a je nutná kontrola.",
    });
  } catch (err) {
    let cleanupSucceeded = true;
    if (invitedUserId && !deliveryMayHaveStarted) {
      cleanupSucceeded = await cleanupManagedInvitation({
        userId: invitedUserId,
        email: cleanEmail,
        organizationId,
        inviterUserId: cleanInviterUserId,
      });
    }

    console.error("invite-user error:", {
      error: err,
      invitedUserId,
      organizationId,
      cleanupSucceeded,
    });
    return res.status(500).json({
      error: cleanupSucceeded
        ? "Pozvánku se nepodařilo dokončit. Zkuste to prosím později."
        : "Pozvánku se nepodařilo bezpečně dokončit. Pokus neopakujte a kontaktujte podporu.",
    });
  }
}
