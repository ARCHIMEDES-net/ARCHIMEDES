import { getServerSiteUrl } from "./siteUrl";
import {
  registrationEmailWasDefinitelyNotSent,
  sendRegistrationEmail,
} from "./registrationEmailProvider";

const DAY_MS = 24 * 60 * 60 * 1000;
export const PROFILE_REMINDER_AUDIT_EMAIL = "zuzana.novotna@archimedeslive.com";
export const PROFILE_REMINDER_DELAYS_DAYS = Object.freeze([2, 7]);
// Limited backfill: no more than twelve registration reminders per UTC day, across cron retries.
export const PROFILE_REMINDER_DAILY_LIMIT = 12;
const MAX_PROFILES_TO_SCAN = 10000;
const PROFILE_PAGE_SIZE = 200;

function isRealSchool(organization) {
  return organization?.org_type === "school" &&
    organization.status === "active" &&
    organization.is_test !== true &&
    organization.profile_reminders_enabled === true &&
    !/(^|\\s)test(ovací)?(\\s|$)|archimedes|zuzana novotná/i.test(organization.name || "");
}

function sameIdentity(left, right) {
  const email = (value) => String(value || "").trim().toLocaleLowerCase("cs-CZ");
  return email(left.email) === email(right.email) ||
    (Boolean(email(left.full_name)) && email(left.full_name) === email(right.full_name));
}

function formatBroadcastDate(date) {
  return new Intl.DateTimeFormat("cs-CZ", {
    timeZone: "Europe/Prague", weekday: "short", day: "numeric",
    month: "numeric", hour: "2-digit", minute: "2-digit",
  }).format(new Date(date));
}

// These are service-onboarding examples, not a marketing mailing list. Only published
// future programmes, with a first-party poster URL and an actual event detail, qualify.
function featuredBroadcastBlock(events = []) {
  if (!events.length) return { text: "", html: "" };
  const safeEvents = events.slice(0, 2);
  const text = [
    "Na co se můžete těšit po dokončení registrace:",
    ...safeEvents.map((event) =>
      `• ${event.title} – ${formatBroadcastDate(event.starts_at)}\n  ${event.url}`),
  ].join("\n");
  const html = `<div style="padding-top:14px;margin-top:16px;border-top:1px solid #e0e8ec"><p style="font-weight:700">Na co se můžete těšit po dokončení registrace:</p>${safeEvents.map((event) =>
    `<table role="presentation" style="width:100%;margin:12px 0;border-collapse:collapse"><tr>${event.poster
      ? `<td style="width:92px;padding:0 12px 0 0;vertical-align:top"><a href="${escapeHtml(event.url)}"><img src="${escapeHtml(event.poster)}" alt="${escapeHtml(event.title)}" width="80" style="max-width:80px;height:auto;border-radius:6px;border:0"></a></td>`
      : ""}<td style="vertical-align:top"><a href="${escapeHtml(event.url)}" style="color:#07566a;font-weight:700">${escapeHtml(event.title)}</a><p style="margin:5px 0 0">${escapeHtml(formatBroadcastDate(event.starts_at))}</p></td></tr></table>`).join("")}</div>`;
  return { text, html };
}

async function publishedProgramHighlights(supabaseAdmin, now) {
  const { data, error } = await supabaseAdmin.from("events")
    .select("id,title,starts_at,poster_url,audience_groups")
    .eq("is_published", true)
    .eq("status", "planned")
    .gt("starts_at", new Date(now + 24 * DAY_MS).toISOString())
    .order("starts_at", { ascending: true })
    .limit(30);
  if (error) throw error;
  const trustedPosterPrefix = `${String(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\\/$/, "")}/storage/v1/object/public/posters/`;
  return (data || []).filter((row) => {
    const groups = row.audience_groups || [];
    return groups.some((item) => ["Učitelé", "I. stupeň", "II. stupeň"].includes(item)) &&
      /^[0-9a-f-]{36}$/i.test(row.id) && row.title && row.starts_at;
  }).slice(0, 2).map((row) => ({
    title: row.title, starts_at: row.starts_at,
    url: `https://www.archimedeslive.com/portal/udalost/${row.id}`,
    poster: trustedPosterPrefix.startsWith("https://") &&
      String(row.poster_url || "").startsWith(trustedPosterPrefix) ? row.poster_url : "",
  }));
}

async function allPendingProfiles(supabaseAdmin, firstCutoff) {
  const rows = [];
  for (let offset = 0; offset < MAX_PROFILES_TO_SCAN; offset += PROFILE_PAGE_SIZE) {
    const { data, error } = await supabaseAdmin.from("profiles")
      .select("id,email,full_name,role,must_set_password,profile_completed_at,created_at,is_active")
      .eq("is_active", true)
      .lte("created_at", firstCutoff)
      .or("must_set_password.eq.true,profile_completed_at.is.null")
      .order("created_at", { ascending: true })
      .order("id", { ascending: true })
      .range(offset, offset + PROFILE_PAGE_SIZE - 1);
    if (error) throw error;
    rows.push(...(data || []));
    if (!data || data.length < PROFILE_PAGE_SIZE) return rows;
  }
  throw new Error("Too many incomplete profiles; aborting rather than silently skipping accounts.");
}

async function deliveredInvitationIds(supabaseAdmin, invitedRows) {
  const ids = [...new Set(invitedRows.map((row) => row.client_provider_message_id).filter(Boolean))];
  const latest = new Map();
  for (let offset = 0; offset < ids.length; offset += 75) {
    const { data, error } = await supabaseAdmin.from("registration_email_webhook_events")
      .select("provider_message_id,delivery_status,occurred_at,received_at")
      .in("provider_message_id", ids.slice(offset, offset + 75))
      .order("occurred_at", { ascending: false })
      .limit(800);
    if (error) throw error;
    for (const event of data || []) {
      if (!latest.has(event.provider_message_id)) latest.set(event.provider_message_id, event.delivery_status);
    }
  }
  return new Set([...latest].filter(([, status]) => status === "delivered").map(([id]) => id));
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

  const firstSentAt = Math.max(...firstAttempts
    .filter((item) => item.status === "sent")
    .map((item) => new Date(item.sent_at || item.created_at).getTime())
    .filter(Number.isFinite));
  // Historical backfill must not send step 1 and step 2 on consecutive days.
  return Number.isFinite(firstSentAt) &&
    now - firstSentAt >= (PROFILE_REMINDER_DELAYS_DAYS[1] - PROFILE_REMINDER_DELAYS_DAYS[0]) * DAY_MS &&
    now - createdAt >= PROFILE_REMINDER_DELAYS_DAYS[1] * DAY_MS ? 2 : null;
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

function message({ fullName, reason, passwordUrl, profileUrl, step, purpose, featuredEvents = [] }) {
  const greeting = fullName ? `Dobrý den, ${fullName},` : "Dobrý den,";
  const htmlGreeting = escapeHtml(greeting);
  if (purpose === "approved_fresh_access") {
    return {
      subject: "Nový aktuální odkaz pro přístup do ARCHIMEDES Live",
      text: `${greeting}\n\npo kontrole vašeho účtu posíláme nový aktuální odkaz pro nastavení hesla:\n\nNastavit heslo: ${passwordUrl}\n\nPoužijte prosím pouze tento nejnovější odkaz. Starší odkazy pro nastavení přístupu už nepoužívejte. Po přihlášení můžete doplnit svůj profil.\n\nTým ARCHIMEDES Live`,
      html: `<p>${htmlGreeting}</p><p>Po kontrole vašeho účtu posíláme nový aktuální odkaz pro nastavení hesla:</p><p><a href="${escapeHtml(passwordUrl)}" style="display:inline-block;padding:12px 18px;background:#0f2744;color:#fff;text-decoration:none;border-radius:10px;font-weight:700">Nastavit heslo</a></p><p>Použijte prosím pouze tento nejnovější odkaz. Starší odkazy pro nastavení přístupu už nepoužívejte. Po přihlášení můžete doplnit svůj profil.</p><p>Tým ARCHIMEDES Live</p>`,
    };
  }
  if (purpose === "approved_profile_reminder") {
    return {
      subject: "Dokončete prosím svůj profil v ARCHIMEDES Live",
      text: `${greeting}\n\npo kontrole vašeho účtu zbývá doplnit profil a vybrat témata, o která máte zájem.\n\nDoplnit profil: ${profileUrl}\n\nPokud jste profil mezitím dokončili, tuto zprávu ignorujte.\n\nTým ARCHIMEDES Live`,
      html: `<p>${htmlGreeting}</p><p>Po kontrole vašeho účtu zbývá doplnit profil a vybrat témata, o která máte zájem.</p><p><a href="${escapeHtml(profileUrl)}" style="color:#0f2744;font-weight:700">Doplnit můj profil</a></p><p>Pokud jste profil mezitím dokončili, tuto zprávu ignorujte.</p><p>Tým ARCHIMEDES Live</p>`,
    };
  }
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
  const highlights = featuredBroadcastBlock(featuredEvents);
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
    text: `${greeting}\n\naby vám ARCHIMEDES Live správně fungoval, ${instruction}.\n\n${textLinks.join("\n")}\n\n${highlights.text}\n\nPokud jste tyto kroky mezitím dokončili, tuto zprávu ignorujte.\n\nTým ARCHIMEDES Live`,
    html: `<p>${htmlGreeting}</p><p>Aby vám ARCHIMEDES Live správně fungoval, ${escapeHtml(instruction)}.</p>${htmlLinks.join("")}${highlights.html}<p>Pokud jste tyto kroky mezitím dokončili, tuto zprávu ignorujte.</p><p>Tým ARCHIMEDES Live</p>`,
  };
}

export function auditCopyMessage({ recipientEmail, fullName, reason, step, purpose }) {
  const originalSubject = purpose === "approved_fresh_access"
    ? "Nový aktuální odkaz pro přístup do ARCHIMEDES Live"
    : purpose === "approved_profile_reminder"
      ? "Dokončete prosím svůj profil v ARCHIMEDES Live"
      : step === 1
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
      `Schválený účel: ${purpose || "automatické připomenutí"}`,
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
  { attemptId, profile, step, reason, purpose, featuredEvents = [] }
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
    purpose,
    featuredEvents,
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
      purpose,
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
  const profiles = await allPendingProfiles(supabaseAdmin, firstCutoff);
  const profileIds = profiles.map((profile) => profile.id);
  if (!profileIds.length) return { preview, candidates: 0, sent: 0, manualReview: 0 };

  const [attemptRows, membershipRows, adminRows, policyRows, organizationRows,
    invitationRows, peersRows] = await Promise.all([
    supabaseAdmin.from("profile_completion_reminder_attempts")
      .select("profile_id,reminder_step,status,client_delivery_status,created_at,sent_at")
      .limit(1000),
    supabaseAdmin.from("organization_members").select("user_id,organization_id,status"),
    supabaseAdmin.from("platform_admins").select("user_id"),
    supabaseAdmin.from("profile_reminder_account_policies")
      .select("profile_id,policy_kind,primary_profile_id"),
    supabaseAdmin.from("organizations")
      .select("id,name,org_type,status,is_test,profile_reminders_enabled")
      .eq("org_type", "school").eq("status", "active"),
    supabaseAdmin.from("school_member_invitation_attempts")
      .select("user_id,organization_id,recipient_email,client_provider_message_id,created_at,status")
      .eq("status", "sent"),
    supabaseAdmin.from("profiles").select("id,email,full_name,is_active"),
  ]);
  const results = [attemptRows,membershipRows,adminRows,policyRows,
    organizationRows,invitationRows,peersRows];
  for (const response of results) if (response.error) throw response.error;

  const deliveredIds = await deliveredInvitationIds(supabaseAdmin, invitationRows.data || []);
  const organizations = new Map((organizationRows.data || [])
    .filter(isRealSchool).map((org) => [org.id, org]));
  const admins = new Set((adminRows.data || []).map((row) => row.user_id));
  const policies = new Map((policyRows.data || []).map((row) => [row.profile_id, row]));
  const peerProfiles = new Map((peersRows.data || []).map((row) => [row.id, row]));
  const orgUsers = new Map();
  const activeMemberships = new Map();
  for (const row of membershipRows.data || []) {
    if (row.status !== "active") continue;
    if (!orgUsers.has(row.organization_id)) orgUsers.set(row.organization_id, []);
    orgUsers.get(row.organization_id).push(row.user_id);
    if (!activeMemberships.has(row.user_id)) activeMemberships.set(row.user_id, new Set());
    activeMemberships.get(row.user_id).add(row.organization_id);
  }
  const invitationByUser = new Map();
  for (const row of invitationRows.data || []) {
    if (!invitationByUser.has(row.user_id) ||
      new Date(row.created_at) > new Date(invitationByUser.get(row.user_id).created_at)) {
      invitationByUser.set(row.user_id, row);
    }
  }
  const attemptsByProfile = new Map();
  for (const row of attemptRows.data || []) {
    if (!attemptsByProfile.has(row.profile_id)) attemptsByProfile.set(row.profile_id, []);
    attemptsByProfile.get(row.profile_id).push(row);
  }
  const candidates = [];
  const skipped = { withoutDeliveredInvitation: 0, ambiguousIdentity: 0, disabledOrganization: 0,
    policy: 0, noDueStep: 0 };
  for (const profile of profiles) {
    if (!["teacher", "school_admin"].includes(profile.role) ||
      admins.has(profile.id) || policies.has(profile.id)) { skipped.policy++; continue; }
    const linkedOrgs = [...activeMemberships.get(profile.id) || []].filter((id) => organizations.has(id));
    if (!linkedOrgs.length) { skipped.disabledOrganization++; continue; }
    const invite = invitationByUser.get(profile.id);
    if (!invite || !linkedOrgs.includes(invite.organization_id) ||
      String(invite.recipient_email || "").trim().toLowerCase() !== String(profile.email || "").trim().toLowerCase() ||
      !deliveredIds.has(invite.client_provider_message_id)) {
      skipped.withoutDeliveredInvitation++; continue;
    }
    const duplicate = linkedOrgs.some((orgId) => (orgUsers.get(orgId) || []).some((peerId) => {
      if (peerId === profile.id) return false;
      const peer = peerProfiles.get(peerId);
      const reviewedSecondary = policies.get(peerId);
      return peer?.is_active === true &&
        !(reviewedSecondary?.policy_kind === "secondary_no_email" &&
          reviewedSecondary.primary_profile_id === profile.id) &&
        sameIdentity(profile, peer);
    }));
    if (duplicate) { skipped.ambiguousIdentity++; continue; }
    const step = nextReminderStep({
      profile, attempts: attemptsByProfile.get(profile.id) || [], now,
    });
    if (!step) { skipped.noDueStep++; continue; }
    const reason = reminderReason(profile);
    if (reason) candidates.push({ profile, step, reason });
  }

  const dateKey = new Date(now).toISOString().slice(0, 10);
  const startDayUtc = `${dateKey}T00:00:00.000Z`;
  const endDayUtc = new Date(Date.parse(startDayUtc) + DAY_MS).toISOString();
  const { count, error: quotaError } = await supabaseAdmin
    .from("profile_completion_reminder_attempts")
    .select("id", { count: "exact", head: true })
    .gte("created_at", startDayUtc).lt("created_at", endDayUtc)
    .is("previous_attempt_id", null);
  if (quotaError) throw quotaError;
  const remaining = Math.max(0, PROFILE_REMINDER_DAILY_LIMIT - (count || 0));
  const result = {
    preview, candidates: candidates.length, dailyLimit: PROFILE_REMINDER_DAILY_LIMIT,
    remainingToday: remaining, skipped, sent: 0, copySent: 0,
    copyFailed: 0, manualReview: 0,
  };
  if (preview || remaining === 0) return result;

  // Do not synthesize or attach flyers: load two real, published programme posters.
  const featuredEvents = await publishedProgramHighlights(supabaseAdmin, now);
  for (const candidate of candidates.slice(0, remaining)) {
    try {
      // Guard against a stale password flag on an account that has already signed in.
      const { data, error } = await supabaseAdmin.auth.admin.getUserById(candidate.profile.id);
      if (error || !data?.user || (candidate.reason.includes("password") && data.user.last_sign_in_at)) {
        result.manualReview++; continue;
      }
      const attemptId = await claimAttempt(supabaseAdmin, candidate);
      if (!attemptId) continue;
      const outcome = await sendClaimedProfileReminder(supabaseAdmin, {
        attemptId, profile: candidate.profile, step: candidate.step,
        reason: candidate.reason, featuredEvents,
      });
      if (outcome.sent) result.sent++;
      if (outcome.copySent) result.copySent++;
      else if (outcome.sent) result.copyFailed++;
      if (outcome.manualReview) result.manualReview++;
    } catch (error) {
      // One ambiguous account must never stop processing other valid accounts.
      console.error("Profile reminder individual attempt requires review", {
        errorCode: error?.code || "unknown",
      });
      result.manualReview++;
    }
  }
  return result;
}
