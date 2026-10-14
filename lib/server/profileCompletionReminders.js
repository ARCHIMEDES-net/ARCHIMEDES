import { getServerSiteUrl } from "./siteUrl";
import {
  registrationEmailWasDefinitelyNotSent,
  sendRegistrationEmail,
} from "./registrationEmailProvider";

const DAY_MS = 24 * 60 * 60 * 1000;
export const PROFILE_REMINDER_AUDIT_EMAIL = "zuzana.novotna@archimedeslive.com";
export const PROFILE_REMINDER_DELAYS_DAYS = Object.freeze([2, 5]);
// Limited backfill: no more than twelve registration reminders per UTC day, across cron retries.
// After the first follow-up, allow at least three whole days before the final reminder.
export const PROFILE_REMINDER_DAILY_LIMIT = 12;
const MAX_PROFILES_TO_SCAN = 10000;
const PROFILE_PAGE_SIZE = 200;
export const FEATURED_REMINDER_LIMIT = 4;

const FEATURED_SUBJECTS = Object.freeze([
  ["wellbeing", /wellbeing|duševní|psychick|emoční|mental health/i],
  ["creative", /tvořiv|díln|workshop|vyrábění|výtvarn/i],
  ["english", /angličtin|spooky britain|english|anglick/i],
  ["zoo", /zoo praha|zoolog|gaviál|lachtan/i],
]);

export function selectFeaturedProgrammes(events = []) {
  // Spread across subjects rather than blindly taking four chronological neighbours.
  // When a category is unavailable, fill only with other real published future events.
  const ordered = [...events].sort((a,b) => new Date(a.starts_at) - new Date(b.starts_at));
  const selection = [];
  const used = new Set();
  const add = (item) => {
    if (!item?.id || used.has(item.id)) return false;
    selection.push(item);
    used.add(item.id);
    return true;
  };
  for (const [,pattern] of FEATURED_SUBJECTS) {
    const item = ordered.find((entry) => !used.has(entry.id) && pattern.test(entry.title || ""));
    if (item) add(item);
  }
  for (const item of ordered) {
    if (selection.length >= FEATURED_REMINDER_LIMIT) break;
    add(item);
  }
  return selection.slice(0,FEATURED_REMINDER_LIMIT)
    .sort((a,b) => new Date(a.starts_at) - new Date(b.starts_at));
}

function isRealSchool(organization) {
  return organization?.org_type === "school" &&
    organization.status === "active" &&
    organization.is_test !== true &&
    organization.profile_reminders_enabled === true &&
    !/(^|\s)test(ovací)?(\s|$)|archimedes|zuzana novotná/i.test(organization.name || "");
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
  const selected = events.slice(0, FEATURED_REMINDER_LIMIT);
  const text = [
    "Na co se také například můžete těšit:",
    ...selected.map((event) =>
      `• ${event.title} – ${formatBroadcastDate(event.starts_at)}\n  ${event.url}`),
  ].join("\n");

  const card = (event) => `<td width="50%" valign="top" style="width:50%;padding:7px;vertical-align:top">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0"
      style="width:100%;border:1px solid #e2e9ed;border-radius:10px;border-collapse:separate;background:#ffffff">
      <tr><td style="padding:10px;text-align:center">
        ${event.poster ? `<a href="${escapeHtml(event.url)}"><img src="${escapeHtml(event.poster)}"
          alt="${escapeHtml(event.title)}" width="140"
          style="width:140px;max-width:100%;height:auto;display:block;margin:auto;border:0;border-radius:6px"></a>` : ""}
      </td></tr>
      <tr><td style="padding:4px 10px 12px;vertical-align:top">
        <a href="${escapeHtml(event.url)}" style="font-size:14px;line-height:1.35;color:#07566a;font-weight:700;text-decoration:underline">${escapeHtml(event.title)}</a>
        <p style="font-size:13px;color:#344b54;margin:7px 0 0">${escapeHtml(formatBroadcastDate(event.starts_at))}</p>
      </td></tr>
    </table></td>`;
  const rows = [];
  for (let i = 0; i < selected.length; i += 2) {
    rows.push(`<tr>${card(selected[i])}${selected[i+1] ? card(selected[i+1]) : '<td width="50%" style="width:50%"></td>'}</tr>`);
  }
  const html = `<div style="padding-top:14px;margin-top:16px;border-top:1px solid #e0e8ec">
    <p style="font-weight:700;color:#17363e">Na co se také například můžete těšit:</p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%;border-collapse:collapse">${rows.join("")}</table>
  </div>`;
  const continuation = "Jde jen o malou ukázku našeho programu. Další vysílání a vzdělávací obsah najdete přímo na platformě ARCHIMEDES Live.";
  return { text: text + "\n\n" + continuation, html: html + "<p style=\"color:#344b54\">" + escapeHtml(continuation) + "</p>" };
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
  const trustedPosterPrefix = `${String(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/, "")}/storage/v1/object/public/posters/`;
  const eligible = (data || []).filter((row) => {
    const groups = row.audience_groups || [];
    return groups.some((item) => ["Učitelé", "I. stupeň", "II. stupeň"].includes(item)) &&
      /^[0-9a-f-]{36}$/i.test(row.id) && row.title && row.starts_at &&
      trustedPosterPrefix.startsWith("https://") &&
      String(row.poster_url || "").startsWith(trustedPosterPrefix);
  });
  return selectFeaturedProgrammes(eligible).map((row) => ({
    title: row.title, starts_at: row.starts_at,
    url: `https://www.archimedeslive.com/portal/udalost/${row.id}`,
    poster: row.poster_url,
  }));
}

async function allPendingProfiles(supabaseAdmin, firstCutoff) {
  const rows = [];
  for (let offset = 0; offset < MAX_PROFILES_TO_SCAN; offset += PROFILE_PAGE_SIZE) {
    const { data, error } = await supabaseAdmin.from("profiles")
      .select("id,email,full_name,role,email_notifications_enabled,must_set_password,profile_completed_at,created_at,is_active")
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

export function buildProfileReminderMessage({ fullName, reason, passwordUrl, profileUrl, step, purpose, featuredEvents = [], organizationName = "" }) {
  const greeting = fullName ? `Dobrý den, ${fullName},` : "Dobrý den,";
  const htmlGreeting = escapeHtml(greeting);
  const school = String(organizationName || "").trim();
  const schoolText = school ? " (" + school + ")" : "";
  const schoolHtml = school ? " (<strong>" + escapeHtml(school) + "</strong>)" : "";
  const introText = "Jak Vás možná již informovalo vedení školy, Vaše škola" + schoolText + " se zapojila do vzdělávací platformy ARCHIMEDES Live. Proto Vám byl vytvořen přístup.\n\nNa platformě můžete využívat živá vzdělávací vysílání, záznamy pořadů a pracovní listy při výuce.";
  const introHtml = "<p>Jak Vás možná již informovalo vedení školy, Vaše škola" + schoolHtml + " se zapojila do vzdělávací platformy <strong>ARCHIMEDES Live</strong>. Proto Vám byl vytvořen přístup.</p><p>Na platformě můžete využívat živá vzdělávací vysílání, záznamy pořadů a pracovní listy při výuce.</p>";
  const safetyText = "Pokud si nejste jistí, zda je Vaše škola do programu zapojena, ověřte si to u jejího vedení. Své heslo nikomu neposílejte e-mailem.";
  const safetyHtml = "<p style=\"font-size:13px;color:#566a70\">" + escapeHtml(safetyText) + "</p>";
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
    ? "nastavte si vlastní heslo"
    : "";
  const profileText = reason.includes("profile")
    ? "doplňte svůj profil a vyberte témata, která Vás zajímají"
    : "";
  const instruction = [passwordText, profileText].filter(Boolean).join(" a ");
  const subject =
    step === 1
      ? "Vaše škola v ARCHIMEDES Live – dokončete svůj přístup"
      : "Připomenutí: dokončete přístup do ARCHIMEDES Live";

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
    text: `${greeting}\n\n${introText}\n\nPro dokončení svého přístupu prosím ${instruction}.\n\n${textLinks.join("\n")}\n\n${highlights.text}\n\nPokud jste vše mezitím dokončili, tuto zprávu můžete ignorovat.\n\n${safetyText}\n\nTým ARCHIMEDES Live\nwww.archimedeslive.com`,
    html: `<p>${htmlGreeting}</p>${introHtml}<p><strong>Pro dokončení svého přístupu prosím ${escapeHtml(instruction)}.</strong></p>${htmlLinks.join("")}${highlights.html}<p>Pokud jste vše mezitím dokončili, tuto zprávu můžete ignorovat.</p>${safetyHtml}<p>Tým <strong>ARCHIMEDES Live</strong><br><a href="https://www.archimedeslive.com/">www.archimedeslive.com</a></p>`,
  };
}

export function auditCopyMessage({ recipientEmail, fullName, reason, step, purpose }) {
  const originalSubject = purpose === "approved_fresh_access"
    ? "Nový aktuální odkaz pro přístup do ARCHIMEDES Live"
    : purpose === "approved_profile_reminder"
      ? "Dokončete prosím svůj profil v ARCHIMEDES Live"
      : step === 1
        ? "Vaše škola v ARCHIMEDES Live – dokončete svůj přístup"
        : "Připomenutí: dokončete přístup do ARCHIMEDES Live";
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
  { attemptId, profile, step, reason, purpose, featuredEvents = [], organizationName = "" }
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

  const email = buildProfileReminderMessage({
    fullName: profile.full_name,
    reason,
    passwordUrl,
    profileUrl: `${siteUrl}/portal/muj-profil`,
    step,
    purpose,
    featuredEvents,
    organizationName,
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
  // A frequent cron is inexpensive while the reviewed organization rollout is paused.
  // Do not read hundreds of profiles or generate any auth links without organization opt-in.
  const { data: enabledSchools, error: schoolGateError } = await supabaseAdmin
    .from("organizations")
    .select("id,name,org_type,status,is_test,profile_reminders_enabled")
    .eq("org_type", "school")
    .eq("status", "active")
    .or("is_test.eq.false,is_test.is.null")
    .eq("profile_reminders_enabled", true)
    .limit(2);
  if (schoolGateError) throw schoolGateError;
  if (!(enabledSchools || []).some(isRealSchool)) {
    return { preview, candidates: 0, sent: 0, manualReview: 0, paused: true,
      note: "No explicitly approved school is enabled for reminder delivery." };
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
  // When the daily cap is reached, leave the queue untouched until the next day.
  if (!preview && remaining === 0) {
    return { preview, candidates: 0, dailyLimit: PROFILE_REMINDER_DAILY_LIMIT,
      remainingToday: 0, sent: 0, manualReview: 0, dailyLimitReached: true };
  }
  const firstCutoff = new Date(now - PROFILE_REMINDER_DELAYS_DAYS[0] * DAY_MS).toISOString();
  const profiles = await allPendingProfiles(supabaseAdmin, firstCutoff);
  const profileIds = profiles.map((profile) => profile.id);
  if (!profileIds.length) return { preview, candidates: 0, sent: 0, manualReview: 0 };

  const [attemptRows, membershipRows, adminRows, policyRows, organizationRows,
    invitationRows, peersRows, channelRows] = await Promise.all([
    supabaseAdmin.from("profile_completion_reminder_attempts")
      .select("profile_id,reminder_step,status,client_delivery_status,created_at,sent_at")
      .limit(1000),
    supabaseAdmin.from("organization_members").select("user_id,organization_id,status"),
    supabaseAdmin.from("platform_admins").select("user_id"),
    supabaseAdmin.from("profile_reminder_account_policies")
      .select("profile_id,policy_kind,primary_profile_id"),
    supabaseAdmin.from("organizations")
      .select("id,name,org_type,status,is_test,profile_reminders_enabled")
      .eq("org_type", "school").eq("status", "active")
      .or("is_test.eq.false,is_test.is.null")
      .eq("profile_reminders_enabled", true),
    supabaseAdmin.from("school_member_invitation_attempts")
      .select("user_id,organization_id,recipient_email,client_provider_message_id,created_at,status")
      .eq("status", "sent"),
    supabaseAdmin.from("profiles").select("id,email,full_name,is_active"),
    supabaseAdmin.from("notification_channel_preferences").select("profile_id,email_enabled"),
  ]);
  const results = [attemptRows,membershipRows,adminRows,policyRows,
    organizationRows,invitationRows,peersRows,channelRows];
  for (const response of results) if (response.error) throw response.error;

  const deliveredIds = await deliveredInvitationIds(supabaseAdmin, invitationRows.data || []);
  const organizations = new Map((organizationRows.data || [])
    .filter(isRealSchool).map((org) => [org.id, org]));
  const admins = new Set((adminRows.data || []).map((row) => row.user_id));
  const policies = new Map((policyRows.data || []).map((row) => [row.profile_id, row]));
  const disabledEmailChannels = new Set((channelRows.data || []).filter((row) => row.email_enabled === false).map((row) => row.profile_id));
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
      admins.has(profile.id) || policies.has(profile.id) ||
      profile.email_notifications_enabled === false || disabledEmailChannels.has(profile.id)) { skipped.policy++; continue; }
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
    if (reason) candidates.push({ profile, step, reason, organizationName: organizations.get(invite.organization_id)?.name || "" });
  }

  const result = {
    preview, candidates: candidates.length, dailyLimit: PROFILE_REMINDER_DAILY_LIMIT,
    remainingToday: remaining, skipped, sent: 0, copySent: 0,
    copyFailed: 0, manualReview: 0,
  };
  if (preview || remaining === 0) return result;

  // Do not synthesize or attach flyers: load up to four real, published programme posters.
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
        organizationName: candidate.organizationName,
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
