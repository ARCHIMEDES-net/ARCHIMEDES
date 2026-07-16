import { createClient } from "@supabase/supabase-js";
import { requirePlatformAdmin } from "../../../lib/server/platformAdminApi";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.archimedeslive.com";

function createAuthenticatedClient(token) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: { persistSession: false },
      global: { headers: { Authorization: `Bearer ${token}` } },
    }
  );
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  let invitedUserId = null;
  let activationCommitted = false;

  try {
    const admin = await requirePlatformAdmin(req, res, supabaseAdmin);
    if (!admin) return;

    const organizationId = String(req.body?.organizationId || "").trim();
    if (!organizationId) {
      return res.status(400).json({ error: "Chybí ID obce." });
    }

    const { data: municipality, error: municipalityError } = await supabaseAdmin
      .from("organizations")
      .select(
        "id, name, org_type, status, license_status, contact_name, contact_email, registration_number"
      )
      .eq("id", organizationId)
      .maybeSingle();

    if (municipalityError) throw municipalityError;
    if (!municipality || municipality.org_type !== "obec") {
      return res.status(404).json({ error: "Obec nebyla nalezena." });
    }

    const contactEmail = String(municipality.contact_email || "").trim().toLowerCase();
    const contactName = String(municipality.contact_name || "").trim();

    if (!contactEmail || !contactName) {
      return res.status(409).json({
        error: "Obec nemá kompletní kontaktní osobu a nelze jí bezpečně vytvořit správce.",
      });
    }

    const { data: profiles, error: profileLookupError } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .ilike("email", contactEmail)
      .limit(1);

    if (profileLookupError) throw profileLookupError;

    let userId = profiles?.[0]?.id || null;
    let invitationSent = false;

    if (!userId) {
      const { data: invited, error: inviteError } =
        await supabaseAdmin.auth.admin.inviteUserByEmail(contactEmail, {
          redirectTo: `${SITE_URL}/nastavit-heslo`,
          data: { full_name: contactName },
        });

      if (inviteError) throw inviteError;
      userId = invited?.user?.id || null;
      invitedUserId = userId;
      invitationSent = true;
    }

    if (!userId) throw new Error("Nepodařilo se určit účet správce obce.");

    const token = String(req.headers.authorization || "").match(/^Bearer\s+(.+)$/i)?.[1];
    if (!token) return res.status(401).json({ error: "Chybí autorizace uživatele." });

    const authenticatedClient = createAuthenticatedClient(token);
    const { data: activationRows, error: activationError } = await authenticatedClient.rpc(
      "activate_municipality_with_admin",
      {
        p_organization_id: municipality.id,
        p_user_id: userId,
        p_email: contactEmail,
        p_full_name: contactName,
        p_must_set_password: invitationSent,
      }
    );

    if (activationError) throw activationError;
    activationCommitted = true;

    const activated = activationRows?.[0];

    return res.status(200).json({
      ok: true,
      organizationId: municipality.id,
      registrationNumber: activated?.registration_number || municipality.registration_number,
      invitationSent,
    });
  } catch (error) {
    if (invitedUserId && !activationCommitted) {
      try {
        await supabaseAdmin
          .from("organization_members")
          .delete()
          .eq("user_id", invitedUserId);
        await supabaseAdmin.from("profiles").delete().eq("id", invitedUserId);
      } catch (_) {
        // Zachováme původní chybu aktivace.
      }
      try {
        await supabaseAdmin.auth.admin.deleteUser(invitedUserId);
      } catch (_) {
        // Zachováme původní chybu aktivace.
      }
    }
    console.error("activate-municipality error:", error);
    return res.status(500).json({ error: "Aktivaci obce se nepodařilo dokončit." });
  }
}
