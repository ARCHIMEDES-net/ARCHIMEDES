import { createClient } from "@supabase/supabase-js";
import { requirePlatformAdmin } from "../../../lib/server/platformAdminApi";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.archimedeslive.com";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  let invitedUserId = null;

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

    const { error: profileError } = await supabaseAdmin.from("profiles").upsert(
      {
        id: userId,
        email: contactEmail,
        full_name: contactName,
        is_active: true,
        ...(invitationSent ? { must_set_password: true } : {}),
        active_organization_id: municipality.id,
      },
      { onConflict: "id" }
    );

    if (profileError) throw profileError;

    const { error: membershipError } = await supabaseAdmin
      .from("organization_members")
      .upsert(
        {
          organization_id: municipality.id,
          user_id: userId,
          role_in_org: "organization_admin",
          status: "active",
        },
        { onConflict: "user_id,organization_id" }
      );

    if (membershipError) throw membershipError;

    const { error: activationError } = await supabaseAdmin
      .from("organizations")
      .update({ license_status: "active", status: "active" })
      .eq("id", municipality.id)
      .eq("org_type", "obec");

    if (activationError) throw activationError;

    return res.status(200).json({
      ok: true,
      organizationId: municipality.id,
      registrationNumber: municipality.registration_number,
      invitationSent,
    });
  } catch (error) {
    if (invitedUserId) {
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
