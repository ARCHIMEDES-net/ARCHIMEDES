import { createClient } from "@supabase/supabase-js";
import { consumeAuthenticatedRateLimit } from "../../../lib/server/authenticatedRateLimit";
import { requirePlatformAdmin } from "../../../lib/server/platformAdminApi";
import { getServerSiteUrl } from "../../../lib/server/siteUrl";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  let invitedUserId = null;
  let profileCreated = false;
  let membershipCreated = false;
  let organizationId = "";

  try {
    const platformAdmin = await requirePlatformAdmin(req, res, supabaseAdmin);
    if (!platformAdmin) return;

    organizationId = String(req.body?.organizationId || "").trim();
    const cleanEmail = String(req.body?.email || "").trim().toLowerCase();
    const cleanFullName = String(req.body?.fullName || "").trim();

    if (!UUID_PATTERN.test(organizationId)) {
      return res.status(400).json({ error: "ID obce nemá platný formát." });
    }
    if (!isValidEmail(cleanEmail) || cleanEmail.length > 254) {
      return res.status(400).json({ error: "Zadejte platný pracovní e-mail." });
    }
    if (cleanFullName.length < 2 || cleanFullName.length > 120) {
      return res.status(400).json({ error: "Jméno musí mít 2 až 120 znaků." });
    }

    const allowed = await consumeAuthenticatedRateLimit({
      supabaseAdmin,
      req,
      route: "admin-invite-municipality-admin",
      userId: platformAdmin.id,
      resourceId: organizationId,
      limit: 10,
      windowSeconds: 60 * 60,
    });

    if (!allowed) {
      res.setHeader("Retry-After", "3600");
      return res.status(429).json({
        error: "Bylo provedeno příliš mnoho pokusů. Zkuste to prosím později.",
      });
    }

    const { data: municipality, error: municipalityError } = await supabaseAdmin
      .from("organizations")
      .select("id, name, org_type, status, parent_organization_id")
      .eq("id", organizationId)
      .maybeSingle();

    if (municipalityError) throw municipalityError;
    if (
      !municipality ||
      !["municipality", "obec"].includes(municipality.org_type) ||
      municipality.parent_organization_id
    ) {
      return res.status(404).json({ error: "Obec nebyla nalezena." });
    }
    if (municipality.status !== "active") {
      return res.status(409).json({
        error: "Správce lze přidat pouze k aktivní obci.",
      });
    }

    const { data: matchingProfiles, error: profileLookupError } =
      await supabaseAdmin
        .from("profiles")
        .select("id, email")
        .ilike("email", cleanEmail)
        .limit(2);

    if (profileLookupError) throw profileLookupError;
    if ((matchingProfiles || []).length > 1) {
      return res.status(409).json({
        error: "Pro tento e-mail existuje více profilů. Je nutná kontrola účtů.",
      });
    }

    let userId = matchingProfiles?.[0]?.id || null;
    let invitationSent = false;

    if (userId) {
      const { data: authUser, error: authUserError } =
        await supabaseAdmin.auth.admin.getUserById(userId);
      if (authUserError || !authUser?.user) {
        return res.status(409).json({
          error: "Profil existuje, ale Auth účet se nepodařilo ověřit.",
        });
      }

      const { data: existingMembership, error: existingMembershipError } =
        await supabaseAdmin
          .from("organization_members")
          .select("id, role_in_org, status")
          .eq("organization_id", organizationId)
          .eq("user_id", userId)
          .maybeSingle();

      if (existingMembershipError) throw existingMembershipError;
      if (existingMembership) {
        return res.status(409).json({
          error:
            existingMembership.role_in_org === "organization_admin" &&
            existingMembership.status === "active"
              ? "Tento uživatel už je aktivním správcem obce."
              : "Uživatel už má u obce jiné členství. Je nutná kontrola.",
        });
      }
    } else {
      const { data: invited, error: inviteError } =
        await supabaseAdmin.auth.admin.inviteUserByEmail(cleanEmail, {
          redirectTo: `${getServerSiteUrl()}/nastavit-heslo`,
          data: { full_name: cleanFullName },
        });

      if (inviteError) {
        if (/already|registered|exists/i.test(inviteError.message || "")) {
          return res.status(409).json({
            error:
              "Auth účet s tímto e-mailem už existuje bez odpovídajícího profilu. Je nutná kontrola.",
          });
        }
        throw inviteError;
      }

      userId = invited?.user?.id || null;
      invitedUserId = userId;
      invitationSent = true;

      if (!userId) {
        throw new Error("Pozvánka nevrátila ID uživatele.");
      }

      profileCreated = true;
      const { error: profileError } = await supabaseAdmin
        .from("profiles")
        .upsert(
          {
            id: userId,
            email: cleanEmail,
            full_name: cleanFullName,
            is_active: true,
            must_set_password: true,
            user_type: "organization",
            active_organization_id: organizationId,
          },
          { onConflict: "id" }
        );

      if (profileError) throw profileError;
    }

    const { data: membership, error: membershipError } = await supabaseAdmin
      .from("organization_members")
      .insert({
        organization_id: organizationId,
        user_id: userId,
        role_in_org: "organization_admin",
        status: "active",
      })
      .select("id")
      .single();

    if (membershipError) {
      if (membershipError.code === "23505" && !invitedUserId) {
        return res.status(409).json({
          error: "Členství už mezitím vzniklo. Obnovte detail obce.",
        });
      }
      throw membershipError;
    }
    membershipCreated = true;

    return res.status(200).json({
      ok: true,
      organizationId,
      userId,
      membershipId: membership.id,
      invitationSent,
      message: invitationSent
        ? "Pozvánka byla odeslána a správce byl přidán k obci."
        : "Existující uživatel byl přidán jako správce obce.",
    });
  } catch (error) {
    if (invitedUserId) {
      try {
        if (membershipCreated) {
          await supabaseAdmin
            .from("organization_members")
            .delete()
            .eq("organization_id", organizationId)
            .eq("user_id", invitedUserId);
        }
        if (profileCreated) {
          await supabaseAdmin.from("profiles").delete().eq("id", invitedUserId);
        }
        await supabaseAdmin.auth.admin.deleteUser(invitedUserId);
      } catch (_) {
        console.error("invite-municipality-admin rollback failed");
      }
    }

    console.error("invite-municipality-admin error:", error);
    return res.status(500).json({
      error: "Správce obce se nepodařilo bezpečně přidat.",
    });
  }
}
