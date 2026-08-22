import { getServerSiteUrl } from "./siteUrl";
import {
  registrationEmailWasDefinitelyNotSent,
  sendRegistrationEmail,
} from "./registrationEmailProvider";

const DAY_MS = 24 * 60 * 60 * 1000;
export const PROFILE_REMINDER_AUDIT_EMAIL = "zuzana.novotna@archimedeslive.com";
export const PROFILE_REMINDER_DELAYS_DAYS = Object.freeze([2, 7]);

function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || ""));
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function reminderReason(profile) {
  const password = profile.must_set_password === true;
  const profileMissing = !profile.profile_completed_at;
  if (password && profileMissing) return "password_and_profile";
  if (password) return "password";
  if (profileMissing) return "profile";
  return null;
}

export function nextReminderStep({ profile, attempts = [], now = Date.now() }) {
  if (!reminderReason(profile) || profile.is_active === false || !validEmail(profile.email)) {
    return null;
  }

  const createdAt = new Date(profile.created_at).getTime();
  if (!Number.isFinite(createdAt)) return null;

  const firstAttempts = attempts.filter((attempt) => attempt.reminder_step === 1);
  const secondAttempts = attempts.filter((attempt) => attempt.reminder_step === 2);

  if (!firstAttempts.length) {
    return now - createdAt >= PROFILE_REMINDER_DELAYS_DAYS[0] * DAY_MS ? 1 : null;
  }
  const firstWasDelivered = firstAttempts.some(
    (attempt) =>
      attempt.status === "sent" && attempt.client_delivery_status === "delivered"
  );
  if (!firstWasDelivered || secondAttempts.length) return null;

  return now - createdAt >= PROFILE_REMINDER_DELAYS_DAYS[1] * DAY_MS ? 2 : null;
}

async function recoveryLink(supabaseAdmin, email, siteUrl) {
  const { data, error } = await supabaseAdmin.auth.admin.generateLink({
    type: "recovery",
    email,
    options: { redirectTo: `${siteUrl}/nastavit-heslo` },
  });
  if (error || !data?.properties?.action_link) {
    throw new Error("Recovery link generation failed");
  }
  return data.properties.action_link;
}

function message({ fullName, reason, passwordUrl, profileUrl, step }) {
  const greeting = fullName ? `Dobrý den, ${fullName},` : "Dobrý den,";
  const htmlGreeting = escapeHtml(greeting);
  const passwordText = reason.includes("password")
    ? "pro dokončení přístupu si nastavte vlastní heslo"
    : "";
  const profileText = reason.includes("profile")
    ? "doplňte svůj profil a vyberte témata, o která máte zájem"
    : "";
  const instruction = [passwordText, profileText].filter(Boolean).join(" a ");
  const subject =
    step === 1
      ? "Dokončete svůj přístup do ARCHIMEDES Live"
      : "Připomenutí: dokončete svůj přístup do ARCHIMEDES Live";

  const textLinks = [
    passwordUrl ? `Nastavit heslo: ${passwordUrl}` : "",
    profileText ? `Doplnit profil: ${profileUrl}` : "",
  ].filter(Boolean);
  const htmlLinks = [
    passwordUrl
      ? `<p><a href="${escapeHtml(passwordUrl)}" style="display:inline-block;padding:12px 18px;background:#0f2744;color:#fff;text-decoration:none;border-radius:10px;font-weight:700">Nastavit heslo</a></p>`
      : "",
    profileText
      ? `<p><a href="${escapeHtml(profileUrl)}" style="color:#0f2744;font-weight:700">Doplnit můj profil</a></p>`
      : "",
  ].filter(Boolean);

  return {
    subject,
    text: `${greeting}\n\naby vám ARCHIMEDES Live správně fungoval, ${instruction}.\n\n${textLinks.join("\n")}\n\nPokud jste tyto kroky mezitím dokončili, tuto zprávu ignorujte.\n\nTým ARCHIMEDES Live`,
    html: `<p>${htmlGreeting}</p><p>Aby vám ARCHIMEDES Live správně fungoval, ${escapeHtml(instruction)}.</p>${htmlLinks.join("")}<p>Pokud jste tyto kroky mezitím dokončili, tuto zprávu ignorujte.</p><p>Tým ARCHIMEDES Live</p>`,
  };
}

export function auditCopyMessage({ recipientEmail, fullName, reason, step }) {
  const originalSubject =
    step === 1
      ? "Dokončete svůj přístup do ARCHIMEDES Live"
      : "Připomenutí: dokončete svůj přístup do ARCHIMEDES Live";
  const reasonText = reason === "password_and_profile"
    ? "nastavení vlastního hesla a dokončení profilu"
    : reason === "password"
      ? "nastavení vlastního hesla"
      : "dokončení profilu";

  return {
    subject: `Kopie upozornění: ${originalSubject}`,
    text: [
      "Automatická kopie upozornění ARCHIMEDES Live.",
      "",
      `Příjemce: ${recipientEmail}`,
      `Jméno: ${fullName || "neuvedeno"}`,
      `Důvod: ${reasonText}`,
      "",
      "Jednorázový odkaz pro nastavení hesla ani osobní odkaz do profilu nejsou z bezpečnostních důvodů součástí této kopie.",
    ].join("\n"),
  };
}

async function claimAttempt(supabaseAdmin, candidate) {
  const payload = {
    profile_id: candidate.profile.id,
    reminder_step: candidate.step,
    reason: candidate.reason,
    recipient_email: candidate.profile.email.toLowerCase(),
    status: "sending",
    claimed_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    error_code: null,
  };

  const { data: inserted, error: insertError } = await supabaseAdmin
    .from("profile_completion_reminder_attempts")
    .insert(payload)
    .select("id")
    .maybeSingle();
  if (!insertError && inserted?.id) return inserted.id;
  if (insertError?.code === "23505") return null;
  throw insertError;
}

export async function sendClaimedProfileReminder(
  supabaseAdmin,
  { attemptId, profile, step, reason }
) {
  let siteUrl;
  try {
    siteUrl = getServerSiteUrl();
  } catch {
    await supabaseAdmin
      .from("profile_completion_reminder_attempts")
      .update({ status: "failed", error_code: "site_url_configuration_failed", updated_at: new Date().toISOString() })
      .eq("id", attemptId)
      .eq("status", "sending");
    return { sent: false, copySent: false, manualReview: false };
  }
  let passwordUrl = "";
  try {
    if (reason.includes("password")) {
      passwordUrl = await recoveryLink(supabaseAdmin, profile.email, siteUrl);
    }
  } catch {
    await supabaseAdmin
      .from("profile_completion_reminder_attempts")
      .update({ status: "failed", error_code: "setup_link_generation_failed", updated_at: new Date().toISOString() })
      .eq("id", attemptId)
      .eq("status", "sending");
    return { sent: false, copySent: false, manualReview: false };
  }

  const email = message({
    fullName: profile.full_name,
    reason,
    passwordUrl,
    profileUrl: `${siteUrl}/portal/muj-profil`,
    step,
  });

  try {
    const clientReceipt = await sendRegistrationEmail({
      to: profile.email,
      ...email,
      idempotencyKey: `profile-completion-reminder:${attemptId}:client`,
    });
    const { error: receiptError } = await supabaseAdmin
      .from("profile_completion_reminder_attempts")
      .update({
        email_provider: clientReceipt.provider,
        client_provider_message_id: clientReceipt.messageId,
        client_delivery_status: "accepted",
        client_delivery_updated_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", attemptId)
      .eq("status", "sending");
    if (receiptError) throw receiptError;
  } catch (emailError) {
    const definitelyNotSent = registrationEmailWasDefinitelyNotSent(emailError);
    await supabaseAdmin
      .from("profile_completion_reminder_attempts")
      .update({
        status: definitelyNotSent ? "failed" : "delivery_unknown",
        error_code: definitelyNotSent
          ? emailError.code
          : "registration_email_delivery_unknown",
        updated_at: new Date().toISOString(),
      })
      .eq("id", attemptId)
      .eq("status", "sending");
    return { sent: false, copySent: false, manualReview: !definitelyNotSent };
  }

  let auditCopyFailed = false;
  try {
    const auditEmail = auditCopyMessage({
      recipientEmail: profile.email,
      fullName: profile.full_name,
      reason,
      step,
    });
    const auditCopyReceipt = await sendRegistrationEmail({
      to: PROFILE_REMINDER_AUDIT_EMAIL,
      ...auditEmail,
      idempotencyKey: `profile-completion-reminder:${attemptId}:audit`,
    });
    const { error: auditReceiptError } = await supabaseAdmin
      .from("profile_completion_reminder_attempts")
      .update({
        audit_copy_provider_message_id: auditCopyReceipt.messageId,
        audit_copy_sent_at: new Date().toISOString(),
        audit_copy_delivery_status: "accepted",
        audit_copy_delivery_updated_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", attemptId)
      .eq("status", "sending");
    if (auditReceiptError) throw auditReceiptError;
  } catch {
    auditCopyFailed = true;
  }

  const { error: completeError } = await supabaseAdmin
    .from("profile_completion_reminder_attempts")
    .update({
      status: "sent",
      sent_at: new Date().toISOString(),
      error_code: auditCopyFailed ? "audit_copy_provider_failed" : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", attemptId)
    .eq("status", "sending");

  return {
    sent: !completeError,
    copySent: !auditCopyFailed,
    manualReview: auditCopyFailed || Boolean(completeError),
  };
}

export async function processProfileCompletionReminders(
  supabaseAdmin,
  { preview = false, now = Date.now() } = {}
) {
  const firstCutoff = new Date(now - PROFILE_REMINDER_DELAYS_DAYS[0] * DAY_MS).toISOString();
  const { data: profiles, error: profilesError } = await supabaseAdmin
    .from("profiles")
    .select("id, email, full_name, must_set_password, profile_completed_at, created_at, is_active")
    .eq("is_active", true)
    .lte("created_at", firstCutoff)
    .or("must_set_password.eq.true,profile_completed_at.is.null")
    .limit(200);
  if (profilesError) throw profilesError;

  const profileIds = (profiles || []).map((profile) => profile.id);
  let attempts = [];
  let audienceProfileIds = new Set();
  if (profileIds.length) {
    const [attemptRows, membershipRows, platformAdminRows] = await Promise.all([
      supabaseAdmin
        .from("profile_completion_reminder_attempts")
        .select("profile_id, reminder_step, status, client_delivery_status, created_at")
        .in("profile_id", profileIds),
      supabaseAdmin
        .from("organization_members")
        .select("user_id, organization_id")
        .in("user_id", profileIds)
        .eq("status", "active"),
      supabaseAdmin.from("platform_admins").select("user_id").in("user_id", profileIds),
    ]);
    if (attemptRows.error) throw attemptRows.error;
    if (membershipRows.error) throw membershipRows.error;
    if (platformAdminRows.error) throw platformAdminRows.error;
    attempts = attemptRows.data || [];

    const platformAdminIds = new Set(
      (platformAdminRows.data || []).map((row) => row.user_id)
    );
    const organizationIds = [
      ...new Set((membershipRows.data || []).map((row) => row.organization_id)),
    ];
    let realOrganizationIds = new Set();
    if (organizationIds.length) {
      const { data: organizations, error: organizationsError } = await supabaseAdmin
        .from("organizations")
        .select("id")
        .in("id", organizationIds)
        .eq("status", "active")
        .or("is_test.eq.false,is_test.is.null");
      if (organizationsError) throw organizationsError;
      realOrganizationIds = new Set((organizations || []).map((row) => row.id));
    }
    audienceProfileIds = new Set(
      (membershipRows.data || [])
        .filter(
          (row) =>
            realOrganizationIds.has(row.organization_id) &&
            !platformAdminIds.has(row.user_id)
        )
        .map((row) => row.user_id)
    );
  }

  const candidates = (profiles || []).filter((profile) => audienceProfileIds.has(profile.id)).flatMap((profile) => {
    const profileAttempts = attempts.filter((attempt) => attempt.profile_id === profile.id);
    const step = nextReminderStep({ profile, attempts: profileAttempts, now });
    const reason = reminderReason(profile);
    return step && reason ? [{ profile, step, reason }] : [];
  });

  if (preview) {
    return {
      preview: true,
      candidates: candidates.length,
      password: candidates.filter((item) => item.reason.includes("password")).length,
      profile: candidates.filter((item) => item.reason.includes("profile")).length,
      sent: 0,
      manualReview: 0,
    };
  }

  const result = { preview: false, candidates: candidates.length, sent: 0, copySent: 0, copyFailed: 0, manualReview: 0 };

  for (const candidate of candidates) {
    const attemptId = await claimAttempt(supabaseAdmin, candidate);
    if (!attemptId) continue;

    const outcome = await sendClaimedProfileReminder(supabaseAdmin, {
      attemptId,
      profile: candidate.profile,
      step: candidate.step,
      reason: candidate.reason,
    });
    if (outcome.sent) result.sent += 1;
    if (outcome.copySent) result.copySent += 1;
    else if (outcome.sent) result.copyFailed += 1;
    if (outcome.manualReview) result.manualReview += 1;
  }

  return result;
}
