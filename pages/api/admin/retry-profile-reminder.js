import { createClient } from "@supabase/supabase-js";
import { consumeAuthenticatedRateLimit } from "../../../lib/server/authenticatedRateLimit";
import { requirePlatformAdmin } from "../../../lib/server/platformAdminApi";
import {
  reminderReason,
  sendClaimedProfileReminder,
} from "../../../lib/server/profileCompletionReminders";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

function normalized(value) {
  return String(value || "").trim().toLocaleLowerCase("cs-CZ");
}

async function assertUnambiguousRealMembership(profile) {
  const { data: memberships, error: membershipError } = await supabaseAdmin
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", profile.id)
    .eq("status", "active");
  if (membershipError) throw membershipError;
  const organizationIds = [...new Set((memberships || []).map((row) => row.organization_id))];
  if (!organizationIds.length) return false;

  const { data: organizations, error: organizationError } = await supabaseAdmin
    .from("organizations")
    .select("id")
    .in("id", organizationIds)
    .eq("status", "active")
    .or("is_test.eq.false,is_test.is.null");
  if (organizationError) throw organizationError;
  const realIds = (organizations || []).map((row) => row.id);
  if (!realIds.length) return false;

  const { data: peerMemberships, error: peerMembershipError } = await supabaseAdmin
    .from("organization_members")
    .select("user_id")
    .in("organization_id", realIds)
    .eq("status", "active");
  if (peerMembershipError) throw peerMembershipError;
  const peerIds = [...new Set((peerMemberships || []).map((row) => row.user_id))];
  const { data: peers, error: peersError } = await supabaseAdmin
    .from("profiles")
    .select("id, email, full_name")
    .in("id", peerIds);
  if (peersError) throw peersError;

  return !(peers || []).some(
    (peer) =>
      peer.id !== profile.id &&
      (normalized(peer.email) === normalized(profile.email) ||
        (normalized(profile.full_name) &&
          normalized(peer.full_name) === normalized(profile.full_name)))
  );
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const platformAdmin = await requirePlatformAdmin(req, res, supabaseAdmin);
    if (!platformAdmin) return;

    const sourceAttemptId = String(req.body?.sourceAttemptId || "").trim();
    const resolutionReason = String(req.body?.resolutionReason || "").trim();
    if (!UUID_PATTERN.test(sourceAttemptId)) {
      return res.status(400).json({ error: "Neplatné ID původního pokusu." });
    }
    if (req.body?.confirmation !== "CONFIRMED_NOT_DELIVERED") {
      return res.status(400).json({
        error: "Chybí výslovné potvrzení, že původní e-mail nebyl doručen.",
      });
    }
    if (resolutionReason.length < 20 || resolutionReason.length > 1000) {
      return res.status(400).json({ error: "Uveďte konkrétní důvod v délce 20 až 1000 znaků." });
    }

    const allowed = await consumeAuthenticatedRateLimit({
      supabaseAdmin,
      req,
      route: "admin-retry-profile-reminder",
      userId: platformAdmin.id,
      resourceId: sourceAttemptId,
      limit: 3,
      windowSeconds: 60 * 60,
    });
    if (!allowed) {
      res.setHeader("Retry-After", "3600");
      return res.status(429).json({ error: "Příliš mnoho pokusů. Zkontrolujte audit." });
    }

    const { data: source, error: sourceError } = await supabaseAdmin
      .from("profile_completion_reminder_attempts")
      .select("id, profile_id, reminder_step, recipient_email, status")
      .eq("id", sourceAttemptId)
      .maybeSingle();
    if (sourceError) throw sourceError;
    if (!source) return res.status(404).json({ error: "Původní pokus nebyl nalezen." });

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("id, email, full_name, must_set_password, profile_completed_at, created_at, is_active")
      .eq("id", source.profile_id)
      .maybeSingle();
    if (profileError) throw profileError;
    if (!profile || profile.is_active !== true || normalized(profile.email) !== normalized(source.recipient_email)) {
      return res.status(409).json({ error: "Účet nebo jeho e-mail se změnil. Je nutná nová kontrola." });
    }

    const currentReason = reminderReason(profile);
    if (!currentReason) {
      return res.status(409).json({ error: "Uživatel už dokončil požadované kroky." });
    }
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.getUserById(profile.id);
    if (authError || !authData?.user) throw authError || new Error("Auth user missing");
    if (authData.user.last_sign_in_at && profile.must_set_password === true) {
      return res.status(409).json({
        error: "Uživatel se již přihlásil, ale profil stále požaduje heslo. Nejprve opravte nekonzistentní příznak.",
      });
    }
    if (!(await assertUnambiguousRealMembership(profile))) {
      return res.status(409).json({
        error: "Účet nemá jednoznačnou vazbu na reálnou organizaci nebo má možnou duplicitu.",
      });
    }

    const { data: claimRows, error: claimError } = await supabaseAdmin.rpc(
      "claim_profile_reminder_followup",
      {
        p_source_attempt_id: sourceAttemptId,
        p_initiated_by: platformAdmin.id,
        p_reason: resolutionReason,
      }
    );
    if (claimError) throw claimError;
    const claim = claimRows?.[0];
    if (!claim?.claimed) {
      return res.status(409).json({
        error: "Navazující pokus už existuje. E-mail nebyl znovu odeslán.",
        attemptId: claim?.attempt_id || null,
      });
    }

    const outcome = await sendClaimedProfileReminder(supabaseAdmin, {
      attemptId: claim.attempt_id,
      profile,
      step: source.reminder_step,
      reason: currentReason,
    });
    return res.status(outcome.sent ? 200 : 502).json({
      ok: outcome.sent,
      attemptId: claim.attempt_id,
      providerAccepted: outcome.sent,
      auditCopyAccepted: outcome.copySent,
      deliveryVerified: false,
      message: outcome.sent
        ? "Provider e-mail přijal. Skutečné doručení musí potvrdit webhook."
        : "E-mail nebyl bezpečně potvrzen jako odeslaný. Zkontrolujte audit a nic neopakujte.",
    });
  } catch (error) {
    console.error("retry-profile-reminder error:", error);
    return res.status(500).json({ error: "Navazující pokus se nepodařilo bezpečně dokončit." });
  }
}

