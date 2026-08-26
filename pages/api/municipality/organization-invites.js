import { createClient } from "@supabase/supabase-js";
import { consumeAuthenticatedRateLimit } from "../../../lib/server/authenticatedRateLimit";
import { getBearerToken } from "../../../lib/server/platformAdminApi";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function requireMunicipalityAdmin(req, res, municipalityId) {
  const token = getBearerToken(req);
  if (!token) {
    res.status(401).json({ error: "Chybí přihlášení." });
    return null;
  }

  const {
    data: { user },
    error: userError,
  } = await supabaseAdmin.auth.getUser(token);

  if (userError || !user) {
    res.status(401).json({ error: "Přihlášení vypršelo." });
    return null;
  }

  const [{ data: membership, error: membershipError }, { data: municipality, error: municipalityError }] =
    await Promise.all([
      supabaseAdmin
        .from("organization_members")
        .select("role_in_org, status")
        .eq("organization_id", municipalityId)
        .eq("user_id", user.id)
        .eq("status", "active")
        .maybeSingle(),
      supabaseAdmin
        .from("organizations")
        .select("id, name, org_type, status, license_status, license_plan, license_started_at, license_valid_until, registration_number")
        .eq("id", municipalityId)
        .maybeSingle(),
    ]);

  if (membershipError || municipalityError) {
    res.status(500).json({ error: "Nepodařilo se ověřit oprávnění." });
    return null;
  }

  if (
    membership?.role_in_org !== "organization_admin" ||
    !municipality ||
    !["municipality", "obec"].includes(municipality.org_type)
  ) {
    res.status(403).json({ error: "Tuto akci může provést pouze správce obce." });
    return null;
  }

  const expired =
    municipality.license_valid_until &&
    new Date(municipality.license_valid_until) < new Date();

  if (
    municipality.status !== "active" ||
    municipality.license_status !== "active" ||
    expired
  ) {
    res.status(403).json({ error: "Program obce není aktivní." });
    return null;
  }

  return { user, municipality };
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "POST") {
    return res.status(410).json({
      error:
        "Vytváření registračních pozvánek bylo ukončeno. Organizace zakládá centrální tým ARCHIMEDES.",
    });
  }

  if (!["GET", "PATCH"].includes(req.method)) {
    res.setHeader("Allow", "GET, PATCH");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const municipalityId = String(
    (req.method === "GET" ? req.query?.municipalityId : req.body?.municipalityId) || ""
  ).trim();

  if (!UUID_PATTERN.test(municipalityId)) {
    return res.status(400).json({ error: "ID obce nemá platný formát." });
  }

  try {
    const access = await requireMunicipalityAdmin(req, res, municipalityId);
    if (!access) return;

    const limitConfig = { limit: 60, windowSeconds: 10 * 60, retryAfter: "600" };
    const allowed = await consumeAuthenticatedRateLimit({
      supabaseAdmin,
      req,
      route: `municipality-organization-invites:${req.method.toLowerCase()}`,
      userId: access.user.id,
      resourceId: municipalityId,
      limit: limitConfig.limit,
      windowSeconds: limitConfig.windowSeconds,
    });

    if (!allowed) {
      res.setHeader("Retry-After", limitConfig.retryAfter);
      return res.status(429).json({
        error: "Požadavek byl proveden příliš mnohokrát. Zkuste to prosím později.",
      });
    }

    if (req.method === "GET") {
      const [{ data: invites, error: inviteError }, { data: organizations, error: orgError }] =
        await Promise.all([
          supabaseAdmin
            .from("municipality_organization_invites")
            .select("id, organization_type, invited_email, status, expires_at, created_at, used_at, used_organization_id")
            .eq("municipality_id", municipalityId)
            .order("created_at", { ascending: false }),
          supabaseAdmin
            .from("organizations")
            .select("id, name, org_type, status, created_at")
            .eq("parent_organization_id", municipalityId)
            .in("org_type", ["school", "association", "spolek"])
            .order("created_at", { ascending: false }),
        ]);

      if (inviteError || orgError) {
        return res.status(500).json({ error: "Přehled organizací se nepodařilo načíst." });
      }

      const organizationRows = organizations || [];
      const schoolIds = organizationRows
        .filter((organization) => organization.org_type === "school")
        .map((organization) => organization.id);
      let membersByOrganization = new Map();

      if (schoolIds.length > 0) {
        const { data: memberships, error: membershipListError } = await supabaseAdmin
          .from("organization_members")
          .select("organization_id, user_id, role_in_org, status, created_at")
          .in("organization_id", schoolIds)
          .order("created_at", { ascending: true });

        if (membershipListError) {
          return res.status(500).json({ error: "Uživatele škol se nepodařilo načíst." });
        }

        const userIds = [...new Set((memberships || []).map((membership) => membership.user_id))];
        let profiles = [];
        let platformAdminIds = new Set();

        if (userIds.length > 0) {
          const [{ data: profileRows, error: profileError }, { data: adminRows, error: adminError }] =
            await Promise.all([
              supabaseAdmin
                .from("profiles")
                .select("id, full_name, email, is_active, must_set_password, profile_completed_at")
                .in("id", userIds),
              supabaseAdmin
                .from("platform_admins")
                .select("user_id")
                .in("user_id", userIds),
            ]);

          if (profileError || adminError) {
            return res.status(500).json({ error: "Profily uživatelů škol se nepodařilo načíst." });
          }

          profiles = profileRows || [];
          platformAdminIds = new Set((adminRows || []).map((row) => row.user_id));
        }

        const profilesById = new Map(profiles.map((profile) => [profile.id, profile]));
        membersByOrganization = (memberships || []).reduce((result, membership) => {
          if (platformAdminIds.has(membership.user_id)) return result;

          const profile = profilesById.get(membership.user_id);
          if (!profile) return result;

          const current = result.get(membership.organization_id) || [];
          current.push({
            id: membership.user_id,
            full_name: profile.full_name || "",
            email: profile.email || "",
            role_in_org: membership.role_in_org || "member",
            membership_status: membership.status || "inactive",
            is_active: profile.is_active !== false,
            must_set_password: profile.must_set_password === true,
            profile_completed: Boolean(profile.profile_completed_at),
          });
          result.set(membership.organization_id, current);
          return result;
        }, new Map());
      }

      const organizationsWithMembers = organizationRows.map((organization) => ({
        ...organization,
        members:
          organization.org_type === "school"
            ? (membersByOrganization.get(organization.id) || []).sort((a, b) =>
                String(a.full_name || a.email).localeCompare(
                  String(b.full_name || b.email),
                  "cs"
                )
              )
            : [],
      }));

      return res.status(200).json({
        municipality: access.municipality,
        invites: invites || [],
        organizations: organizationsWithMembers,
      });
    }

    if (req.method === "PATCH") {
      const inviteId = String(req.body?.inviteId || "").trim();
      if (!UUID_PATTERN.test(inviteId)) {
        return res.status(400).json({ error: "ID pozvánky nemá platný formát." });
      }

      const { data, error } = await supabaseAdmin
        .from("municipality_organization_invites")
        .update({ status: "revoked" })
        .eq("id", inviteId)
        .eq("municipality_id", municipalityId)
        .eq("status", "pending")
        .select("id")
        .maybeSingle();

      if (error) return res.status(500).json({ error: "Pozvánku se nepodařilo zrušit." });
      if (!data) return res.status(409).json({ error: "Pozvánka už není aktivní." });

      return res.status(200).json({ ok: true });
    }

  } catch (error) {
    console.error("municipality organization invites error:", error);
    return res.status(500).json({ error: "Požadavek se nepodařilo dokončit." });
  }
}
