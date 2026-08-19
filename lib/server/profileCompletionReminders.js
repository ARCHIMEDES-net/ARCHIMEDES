import nodemailer from "nodemailer";
import { getServerSiteUrl } from "./siteUrl";

const DAY_MS = 24 * 60 * 60 * 1000;
export const PROFILE_REMINDER_AUDIT_EMAIL = "zuzana.novotna@archimedeslive.com";
export const PROFILE_REMINDER_DELAYS_DAYS = Object.freeze([2, 7]);

function requiredEnvironment(name) {
  const value = String(process.env[name] || "").trim();
  if (!value) throw new Error(`Missing env: ${name}`);
  return value;
}

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

  const byStep = new Map(attempts.map((attempt) => [attempt.reminder_step, attempt]));
  const first = byStep.get(1);
  const second = byStep.get(2);

  if (!first) {
    return now - createdAt >= PROFILE_REMINDER_DELAYS_DAYS[0] * DAY_MS ? 1 : null;
  }
  if (first.status === "failed") return 1;
  if (first.status !== "sent" || second) return second?.status === "failed" ? 2 : null;

  return now - createdAt >= PROFILE_REMINDER_DELAYS_DAYS[1] * DAY_MS ? 2 : null;
}

function transport() {
  const port = Number(process.env.SMTP_PORT || 587);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("Invalid SMTP_PORT");
  }

  return nodemailer.createTransport({
    host: requiredEnvironment("SMTP_HOST"),
    port,
    secure: port === 465,
    auth: {
      user: requiredEnvironment("SMTP_USER"),
      pass: requiredEnvironment("SMTP_PASS"),
    },
  });
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
  if (insertError?.code !== "23505") throw insertError;

  const { data: retried, error: retryError } = await supabaseAdmin
    .from("profile_completion_reminder_attempts")
    .update(payload)
    .eq("profile_id", candidate.profile.id)
    .eq("reminder_step", candidate.step)
    .eq("status", "failed")
    .select("id")
    .maybeSingle();
  if (retryError) throw retryError;
  return retried?.id || null;
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
        .select("profile_id, reminder_step, status")
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

  const siteUrl = getServerSiteUrl();
  const mailer = transport();
  const result = { preview: false, candidates: candidates.length, sent: 0, copySent: 0, copyFailed: 0, manualReview: 0 };

  for (const candidate of candidates) {
    const attemptId = await claimAttempt(supabaseAdmin, candidate);
    if (!attemptId) continue;

    let passwordUrl = "";
    try {
      if (candidate.reason.includes("password")) {
        passwordUrl = await recoveryLink(supabaseAdmin, candidate.profile.email, siteUrl);
      }
    } catch {
      await supabaseAdmin
        .from("profile_completion_reminder_attempts")
        .update({ status: "failed", error_code: "setup_link_generation_failed", updated_at: new Date().toISOString() })
        .eq("id", attemptId)
        .eq("status", "sending");
      continue;
    }

    const email = message({
      fullName: candidate.profile.full_name,
      reason: candidate.reason,
      passwordUrl,
      profileUrl: `${siteUrl}/portal/muj-profil`,
      step: candidate.step,
    });

    try {
      await mailer.sendMail({
        from: requiredEnvironment("MAIL_FROM"),
        to: candidate.profile.email,
        ...email,
      });
    } catch {
      await supabaseAdmin
        .from("profile_completion_reminder_attempts")
        .update({ status: "delivery_unknown", error_code: "smtp_delivery_unknown", updated_at: new Date().toISOString() })
        .eq("id", attemptId)
        .eq("status", "sending");
      result.manualReview += 1;
      continue;
    }

    try {
      const auditEmail = auditCopyMessage({
        recipientEmail: candidate.profile.email,
        fullName: candidate.profile.full_name,
        reason: candidate.reason,
        step: candidate.step,
      });
      await mailer.sendMail({
        from: requiredEnvironment("MAIL_FROM"),
        to: PROFILE_REMINDER_AUDIT_EMAIL,
        ...auditEmail,
      });
      result.copySent += 1;
    } catch {
      result.copyFailed += 1;
      result.manualReview += 1;
    }

    const { error: completeError } = await supabaseAdmin
      .from("profile_completion_reminder_attempts")
      .update({ status: "sent", sent_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq("id", attemptId)
      .eq("status", "sending");
    if (completeError) {
      result.manualReview += 1;
      continue;
    }
    result.sent += 1;
  }

  return result;
}
