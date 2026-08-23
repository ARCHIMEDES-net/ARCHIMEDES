import { createClient } from "@supabase/supabase-js";
import { consumeAuthenticatedRateLimit } from "../../../lib/server/authenticatedRateLimit";
import { requirePlatformAdmin } from "../../../lib/server/platformAdminApi";
import { reminderReason } from "../../../lib/server/profileCompletionReminders";

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

function normalized(value) {
  return String(value || "").trim().toLocaleLowerCase("cs-CZ");
}

function looksInternalOrganization(name) {
  return /(^|\s)test(ovací)?(\s|$)|archimedes|zuzana novotná/i.test(String(name || ""));
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const platformAdmin = await requirePlatformAdmin(req, res, supabaseAdmin);
    if (!platformAdmin) return;
    const allowed = await consumeAuthenticatedRateLimit({
      supabaseAdmin,
      req,
      route: "admin-profile-reminder-cases",
      userId: platformAdmin.id,
      resourceId: "unresolved",
      limit: 60,
      windowSeconds: 60 * 60,
    });
    if (!allowed) {
      res.setHeader("Retry-After", "3600");
      return res.status(429).json({ error: "Příliš mnoho načtení kontrolní fronty." });
    }

    const { data: attempts, error: attemptsError } = await supabaseAdmin
      .from("profile_completion_reminder_attempts")
      .select("id, profile_id, reminder_step, reason, recipient_email, status, error_code, claimed_at, created_at, client_provider_message_id, client_delivery_status")
      .in("status", ["failed", "delivery_unknown", "sending"])
      .is("resolution_action", null)
      .order("created_at", { ascending: true });
    if (attemptsError) throw attemptsError;
    const profileIds = [...new Set((attempts || []).map((row) => row.profile_id))];
    if (!profileIds.length) return res.status(200).json({ cases: [] });

    const [profileRows, membershipRows, platformAdminRows] = await Promise.all([
      supabaseAdmin
        .from("profiles")
        .select("id, email, full_name, must_set_password, profile_completed_at, is_active")
        .in("id", profileIds),
      supabaseAdmin
        .from("organization_members")
        .select("user_id, organization_id")
        .in("user_id", profileIds)
        .eq("status", "active"),
      supabaseAdmin.from("platform_admins").select("user_id").in("user_id", profileIds),
    ]);
    if (profileRows.error) throw profileRows.error;
    if (membershipRows.error) throw membershipRows.error;
    if (platformAdminRows.error) throw platformAdminRows.error;

    const organizationIds = [...new Set((membershipRows.data || []).map((row) => row.organization_id))];
    let organizations = [];
    let peerMemberships = [];
    if (organizationIds.length) {
      const [organizationRows, peerMembershipRows] = await Promise.all([
        supabaseAdmin
          .from("organizations")
          .select("id, name, status, is_test, profile_reminders_enabled")
          .in("id", organizationIds),
        supabaseAdmin
          .from("organization_members")
          .select("user_id, organization_id")
          .in("organization_id", organizationIds)
          .eq("status", "active"),
      ]);
      if (organizationRows.error) throw organizationRows.error;
      if (peerMembershipRows.error) throw peerMembershipRows.error;
      organizations = organizationRows.data || [];
      peerMemberships = peerMembershipRows.data || [];
    }
    const peerIds = [...new Set(peerMemberships.map((row) => row.user_id))];
    let peers = [];
    if (peerIds.length) {
      const peerRows = await supabaseAdmin
        .from("profiles")
        .select("id, email, full_name")
        .in("id", peerIds);
      if (peerRows.error) throw peerRows.error;
      peers = peerRows.data || [];
    }

    const profilesById = new Map((profileRows.data || []).map((row) => [row.id, row]));
    const organizationsById = new Map(organizations.map((row) => [row.id, row]));
    const peersById = new Map(peers.map((row) => [row.id, row]));
    const platformAdminIds = new Set((platformAdminRows.data || []).map((row) => row.user_id));
    const authStates = new Map(
      await Promise.all(
        profileIds.map(async (profileId) => {
          const { data, error } = await supabaseAdmin.auth.admin.getUserById(profileId);
          if (error || !data?.user) return [profileId, { missing: true, lastSignInAt: null }];
          return [profileId, { missing: false, lastSignInAt: data.user.last_sign_in_at || null }];
        })
      )
    );

    const cases = (attempts || []).map((attempt) => {
      const profile = profilesById.get(attempt.profile_id) || null;
      const auth = authStates.get(attempt.profile_id) || { missing: true, lastSignInAt: null };
      const memberships = (membershipRows.data || []).filter((row) => row.user_id === attempt.profile_id);
      const caseOrganizations = memberships
        .map((row) => organizationsById.get(row.organization_id))
        .filter(Boolean);
      const peerProfileIds = new Set(
        peerMemberships
          .filter((row) => memberships.some((item) => item.organization_id === row.organization_id))
          .map((row) => row.user_id)
      );
      const duplicateEmail = profile
        ? [...peerProfileIds].some((peerId) => {
            const peer = peersById.get(peerId);
            return peer && peer.id !== profile.id &&
              normalized(peer.email) === normalized(profile.email);
          })
        : true;
      const duplicateName = profile
        ? [...peerProfileIds].some((peerId) => {
            const peer = peersById.get(peerId);
            return peer && peer.id !== profile.id && normalized(profile.full_name) &&
              normalized(peer.full_name) === normalized(profile.full_name);
          })
        : true;
      const duplicate = duplicateEmail || duplicateName;
      const internal = platformAdminIds.has(attempt.profile_id) || caseOrganizations.some(
        (organization) => organization.is_test === true || looksInternalOrganization(organization.name)
      );
      const activeRealOrganizations = caseOrganizations.filter(
        (organization) => organization.status === "active" && organization.is_test !== true && !looksInternalOrganization(organization.name)
      );
      const organizationApproved = activeRealOrganizations.some(
        (organization) => organization.profile_reminders_enabled === true
      );
      const currentReason = profile ? reminderReason(profile) : null;
      let category = "close_without_email";
      if (internal) category = "internal_no_email";
      else if (!profile || auth.missing || !activeRealOrganizations.length || duplicate) category = "identity_review";
      else if (auth.lastSignInAt && profile.must_set_password === true) category = "repair_password_flag";
      else if (!auth.lastSignInAt && currentReason?.includes("password")) category = "fresh_access_candidate";
      else if (auth.lastSignInAt && currentReason === "profile") category = "profile_reminder_candidate";

      return {
        ...attempt,
        profile,
        lastSignInAt: auth.lastSignInAt,
        authUserMissing: auth.missing,
        organizations: caseOrganizations,
        duplicateIdentity: duplicate,
        duplicateEmail,
        duplicateName,
        identityNameRepairAllowed:
          Boolean(profile) &&
          !auth.missing &&
          Boolean(auth.lastSignInAt) &&
          activeRealOrganizations.length > 0 &&
          duplicateName &&
          !duplicateEmail,
        organizationApproved,
        currentReason,
        category,
        emailActionAllowed:
          organizationApproved &&
          (category === "fresh_access_candidate" || category === "profile_reminder_candidate"),
      };
    });

    return res.status(200).json({ cases });
  } catch (error) {
    console.error("profile-reminder-cases error:", error);
    return res.status(500).json({ error: "Kontrolní frontu se nepodařilo bezpečně načíst." });
  }
}
