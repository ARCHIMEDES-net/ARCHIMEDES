import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";

const SUPABASE_URL =
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;

const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error(
    "Chybí SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL nebo SUPABASE_SERVICE_ROLE_KEY."
  );
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const supabasePublic =
  SUPABASE_URL && SUPABASE_ANON_KEY
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.archimedeslive.com";
const REDIRECT_TO = `${SITE_URL}/nastavit-heslo`;
const DEMO_ORG_NAME = "ARCHIMEDES DEMO SKOLA";
const LEGAL_VERSION = "2026-03-start-v3";

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0].trim();
  }
  return req.socket?.remoteAddress || "";
}

function normalizeEmail(value = "") {
  return String(value).trim().toLowerCase();
}

function normalizeText(value = "") {
  return String(value).trim();
}

function isValidEmail(value = "") {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim());
}

function randomCodePart(length = 8) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let i = 0; i < length; i += 1) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function parseCookies(cookieHeader = "") {
  const result = {};
  if (!cookieHeader || typeof cookieHeader !== "string") return result;

  cookieHeader.split(";").forEach((part) => {
    const [rawKey, ...rawValueParts] = part.split("=");
    const key = String(rawKey || "").trim();
    const value = rawValueParts.join("=").trim();
    if (!key) return;
    result[key] = value;
  });

  return result;
}

function tryExtractTokenFromCookieValue(rawValue = "") {
  if (!rawValue) return "";

  let decoded = rawValue;
  try {
    decoded = decodeURIComponent(rawValue);
  } catch (_) {
    decoded = rawValue;
  }

  if (!decoded) return "";

  if (
    !decoded.startsWith("{") &&
    !decoded.startsWith("[") &&
    decoded.split(".").length === 3
  ) {
    return decoded;
  }

  try {
    const parsed = JSON.parse(decoded);

    if (typeof parsed === "string" && parsed.split(".").length === 3) {
      return parsed;
    }

    if (Array.isArray(parsed)) {
      const firstToken = parsed.find(
        (item) => typeof item === "string" && item.split(".").length === 3
      );
      return firstToken || "";
    }

    if (parsed && typeof parsed === "object") {
      if (
        typeof parsed.access_token === "string" &&
        parsed.access_token.split(".").length === 3
      ) {
        return parsed.access_token;
      }

      if (
        typeof parsed.currentSession?.access_token === "string" &&
        parsed.currentSession.access_token.split(".").length === 3
      ) {
        return parsed.currentSession.access_token;
      }
    }
  } catch (_) {
    return "";
  }

  return "";
}

function extractAccessTokenFromRequest(req) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
    const bearerToken = authHeader.slice(7).trim();
    if (bearerToken) return bearerToken;
  }

  const cookies = parseCookies(req.headers.cookie || "");

  if (cookies["sb-access-token"]) {
    const token = tryExtractTokenFromCookieValue(cookies["sb-access-token"]);
    if (token) return token;
  }

  const cookieKeys = Object.keys(cookies);
  for (const key of cookieKeys) {
    if (!/^sb-.*-auth-token(?:\.\d+)?$/.test(key)) continue;
    const token = tryExtractTokenFromCookieValue(cookies[key]);
    if (token) return token;
  }

  return "";
}

async function getAuthenticatedUserFromRequest(req) {
  const accessToken = extractAccessTokenFromRequest(req);
  if (!accessToken) return null;

  if (!supabasePublic) {
    console.error(
      "AUTH WARNING: Chybí NEXT_PUBLIC_SUPABASE_ANON_KEY, nelze ověřit access token."
    );
    return null;
  }

  const { data, error } = await supabasePublic.auth.getUser(accessToken);

  if (error) {
    console.error("AUTH TOKEN VERIFY ERROR:", error);
    return null;
  }

  const user = data?.user;
  if (!user?.id) return null;

  return {
    id: user.id,
    email: normalizeEmail(user.email || ""),
  };
}

async function generateUniqueJoinCode() {
  for (let i = 0; i < 10; i += 1) {
    const joinCode = `ORG-${randomCodePart(8)}`;
    const { data, error } = await supabase
      .from("organizations")
      .select("id")
      .eq("join_code", joinCode)
      .maybeSingle();

    if (error) {
      throw new Error(
        `Nepodařilo se ověřit unikátnost kódu organizace: ${error.message}`
      );
    }

    if (!data) {
      return joinCode;
    }
  }

  throw new Error("Nepodařilo se vygenerovat unikátní kód organizace.");
}

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

async function sendMailLogged(transporter, { label, ...message }) {
  try {
    const info = await transporter.sendMail(message);

    console.log("MAIL SENT:", {
      label,
      accepted: info?.accepted || [],
      rejected: info?.rejected || [],
      messageId: info?.messageId || "",
      response: info?.response || "",
    });

    return info;
  } catch (error) {
    console.error("MAIL ERROR:", {
      label,
      message: error?.message || "Neznámá chyba",
      stack: error?.stack || "",
    });
    throw error;
  }
}

async function getOrganizationByIco(ico) {
  if (!ico) return null;

  const { data, error } = await supabase
    .from("organizations")
    .select("id, name, ico, join_code")
    .eq("ico", ico);

  if (error) {
    throw new Error(
      `Nepodařilo se ověřit existenci organizace: ${error.message}`
    );
  }

  if (!data || data.length === 0) return null;

  if (data.length > 1) {
    throw new Error(
      "Pro zadané IČO existuje více organizací. Nejprve je potřeba odstranit duplicity."
    );
  }

  return data[0];
}

async function assertOrganizationNameAllowed(name) {
  const normalized = normalizeText(name);

  if (!normalized) {
    throw new Error("Název organizace je povinný.");
  }

  if (normalized === DEMO_ORG_NAME) {
    throw new Error("Tento název organizace je rezervovaný.");
  }
}

async function createOrganization({ name, ico }) {
  await assertOrganizationNameAllowed(name);

  const joinCode = await generateUniqueJoinCode();

  const { data, error } = await supabase
    .from("organizations")
    .insert([
      {
        name,
        org_type: "school",
        status: "active",
        join_code: joinCode,
        license_status: "active",
        ico,
      },
    ])
    .select("id, name, ico, join_code")
    .single();

  if (error || !data?.id) {
    throw new Error(
      `Nepodařilo se vytvořit organizaci: ${
        error?.message || "neznámá chyba"
      }`
    );
  }

  return data;
}

async function upsertProfile({
  userId,
  email,
  fullName,
  userType = "organization",
  mustSetPassword,
}) {
  const payload = {
    id: userId,
    email,
    full_name: fullName || null,
    user_type: userType,
    is_active: true,
  };

  if (typeof mustSetPassword === "boolean") {
    payload.must_set_password = mustSetPassword;
  }

  const { error } = await supabase
    .from("profiles")
    .upsert(payload, { onConflict: "id" });

  if (error) {
    throw new Error(
      `Nepodařilo se uložit profil uživatele: ${error.message}`
    );
  }
}

async function setActiveOrganization(userId, organizationId) {
  const { error } = await supabase
    .from("profiles")
    .update({ active_organization_id: organizationId })
    .eq("id", userId);

  if (error) {
    throw new Error(
      `Nepodařilo se nastavit aktivní organizaci uživatele: ${error.message}`
    );
  }
}

async function getUserActiveMemberships(userId) {
  const { data, error } = await supabase
    .from("organization_members")
    .select("id, organization_id, role_in_org, status")
    .eq("user_id", userId)
    .eq("status", "active");

  if (error) {
    throw new Error(
      `Nepodařilo se ověřit existující členství uživatele: ${error.message}`
    );
  }

  return data || [];
}

async function getOrganizationsByIds(ids = []) {
  const uniqueIds = [...new Set((ids || []).filter(Boolean))];
  if (!uniqueIds.length) return [];

  const { data, error } = await supabase
    .from("organizations")
    .select("id, name, ico")
    .in("id", uniqueIds);

  if (error) {
    throw new Error(
      `Nepodařilo se načíst organizace pro kontrolu členství: ${error.message}`
    );
  }

  return data || [];
}

async function assertNoConflictingRealOrgMemberships(
  userId,
  targetOrganizationId
) {
  const memberships = await getUserActiveMemberships(userId);

  const otherOrgIds = memberships
    .map((m) => m.organization_id)
    .filter((orgId) => orgId && orgId !== targetOrganizationId);

  if (!otherOrgIds.length) return;

  const orgs = await getOrganizationsByIds(otherOrgIds);

  const conflictingRealOrgs = orgs.filter(
    (org) => normalizeText(org.name) !== DEMO_ORG_NAME
  );

  if (conflictingRealOrgs.length > 0) {
    throw new Error(
      "Uživatel už je přiřazen k jiné aktivní organizaci mimo demo."
    );
  }
}

async function ensureMembership({
  organizationId,
  userId,
  roleInOrg = "organization_admin",
}) {
  const { data: existingRows, error: readError } = await supabase
    .from("organization_members")
    .select("id, role_in_org, status")
    .eq("organization_id", organizationId)
    .eq("user_id", userId);

  if (readError) {
    throw new Error(
      `Nepodařilo se načíst členství uživatele v organizaci: ${readError.message}`
    );
  }

  const existing = existingRows || [];

  if (existing.length > 1) {
    throw new Error(
      "Uživatel má v této organizaci více členství. Nejprve je potřeba odstranit duplicity."
    );
  }

  if (existing[0]?.id) {
    const { error: updateError } = await supabase
      .from("organization_members")
      .update({
        role_in_org: roleInOrg,
        status: "active",
      })
      .eq("id", existing[0].id);

    if (updateError) {
      throw new Error(
        `Nepodařilo se aktualizovat členství uživatele: ${updateError.message}`
      );
    }

    return existing[0].id;
  }

  const { data: inserted, error: insertError } = await supabase
    .from("organization_members")
    .insert({
      organization_id: organizationId,
      user_id: userId,
      role_in_org: roleInOrg,
      status: "active",
    })
    .select("id")
    .single();

  if (insertError) {
    throw new Error(
      `Nepodařilo se přiřadit uživatele do organizace: ${insertError.message}`
    );
  }

  return inserted?.id || null;
}

async function findAuthUserByEmail(email) {
  const target = normalizeEmail(email);
  let page = 1;
  const perPage = 200;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage,
    });

    if (error) {
      throw new Error(`Nepodařilo se načíst auth uživatele: ${error.message}`);
    }

    const users = data?.users || [];
    const found = users.find((u) => normalizeEmail(u.email || "") === target);

    if (found) return found;
    if (users.length < perPage) return null;

    page += 1;
  }
}

async function inviteUser({ email, fullName }) {
  const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
    redirectTo: REDIRECT_TO,
    data: {
      full_name: fullName,
    },
  });

  if (error) {
    throw new Error(`Nepodařilo se pozvat uživatele ${email}: ${error.message}`);
  }

  const userId = data?.user?.id;
  if (!userId) {
    throw new Error(`Nepodařilo se získat ID uživatele ${email}.`);
  }

  return userId;
}

async function resolveUserForEmail({
  targetEmail,
  fullName,
  authenticatedUser,
}) {
  const normalizedTargetEmail = normalizeEmail(targetEmail);

  if (
    authenticatedUser?.id &&
    normalizeEmail(authenticatedUser.email || "") === normalizedTargetEmail
  ) {
    return {
      userId: authenticatedUser.id,
      source: "authenticated_user",
      inviteSent: false,
      isNewUser: false,
      mustSetPassword: false,
    };
  }

  const existingAuthUser = await findAuthUserByEmail(normalizedTargetEmail);

  if (existingAuthUser?.id) {
    return {
      userId: existingAuthUser.id,
      source: "existing_auth_user",
      inviteSent: false,
      isNewUser: false,
      mustSetPassword: false,
    };
  }

  const invitedUserId = await inviteUser({
    email: normalizedTargetEmail,
    fullName,
  });

  return {
    userId: invitedUserId,
    source: "invited_new_user",
    inviteSent: true,
    isNewUser: true,
    mustSetPassword: true,
  };
}

function buildEmailLayout({
  preheader = "",
  eyebrow = "",
  title = "",
  intro = "",
  bodyHtml = "",
  noteHtml = "",
}) {
  const safePreheader = escapeHtml(preheader);
  const safeEyebrow = escapeHtml(eyebrow);
  const safeTitle = escapeHtml(title);
  const safeIntro = intro || "";
  const safeBodyHtml = bodyHtml || "";
  const safeNoteHtml = noteHtml || "";

  return `
    <!doctype html>
    <html lang="cs">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${safeTitle}</title>
      </head>
      <body style="margin:0;padding:0;background:#f4f6fb;font-family:Segoe UI,Arial,sans-serif;color:#0f172a;">
        <div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;">
          ${safePreheader}
        </div>

        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;background:#f4f6fb;">
          <tr>
            <td align="center" style="padding:32px 16px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;max-width:720px;">
                <tr>
                  <td style="padding:0 0 14px 4px;font-size:28px;line-height:1.1;font-weight:900;color:#0f172a;">
                    archimedes <span style="display:inline-block;padding:3px 8px;border-radius:8px;background:#ef4444;color:#ffffff;font-size:18px;vertical-align:middle;">live</span>
                  </td>
                </tr>

                <tr>
                  <td style="background:#ffffff;border:1px solid rgba(15,23,42,0.08);border-radius:26px;padding:34px 30px;box-shadow:0 12px 34px rgba(15,23,42,0.05);">
                    ${
                      safeEyebrow
                        ? `<div style="display:inline-flex;align-items:center;min-height:34px;padding:0 14px;border-radius:999px;background:#e9eef8;color:#223252;font-size:12px;font-weight:800;letter-spacing:0.04em;text-transform:uppercase;margin-bottom:18px;">${safeEyebrow}</div>`
                        : ""
                    }

                    <h1 style="margin:0;font-size:34px;line-height:1.08;letter-spacing:-0.03em;font-weight:900;color:#0f172a;">
                      ${safeTitle}
                    </h1>

                    ${
                      safeIntro
                        ? `<div style="margin-top:16px;font-size:17px;line-height:1.75;color:#475467;">${safeIntro}</div>`
                        : ""
                    }

                    <div style="margin-top:22px;font-size:16px;line-height:1.75;color:#334155;">
                      ${safeBodyHtml}
                    </div>

                    ${
                      safeNoteHtml
                        ? `<div style="margin-top:22px;padding:18px 20px;border-radius:18px;background:#f8fafc;border:1px solid rgba(15,23,42,0.08);font-size:15px;line-height:1.7;color:#475467;">${safeNoteHtml}</div>`
                        : ""
                    }

                    <div style="margin-top:28px;padding-top:20px;border-top:1px solid rgba(15,23,42,0.08);font-size:14px;line-height:1.7;color:#667085;">
                      <strong style="color:#0f172a;">Tým ARCHIMEDES Live</strong><br />
                      EduVision s.r.o.<br />
                      Purkyňova 649/127<br />
                      Medlánky<br />
                      612 00 Brno<br />
                      IČ: 17803039 DIČ: CZ17803039<br />
                      <a href="${escapeHtml(SITE_URL)}" style="color:#1d4ed8;text-decoration:none;">${escapeHtml(SITE_URL)}</a>
                    </div>
                  </td>
                </tr>

                <tr>
                  <td style="padding:14px 6px 0;font-size:12px;line-height:1.6;color:#94a3b8;text-align:center;">
                    Tento e-mail byl odeslán v souvislosti s objednávkou nebo přístupem do ARCHIMEDES Live.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

function buildInternalOrderHtml({
  schoolName,
  ico,
  street,
  city,
  zip,
  contactName,
  role,
  email,
  adminEmail,
  phone,
  note,
  safeAuthUserPresent,
  safeCurrentUserEmail,
  safeOnboardingMode,
  safeResolvedOrganizationName,
  safeOrderingSource,
  safeAdminSource,
  safeOrderingInviteSent,
  safeAdminInviteSent,
  safeOrderingUserRole,
  samePerson,
  safeActiveOrgOrdering,
  safeActiveOrgAdmin,
  safeJoinCode,
  safeOnboardingStatus,
  safeOnboardingError,
  now,
  clientIp,
}) {
  return `
    <h2 style="margin:0 0 16px;font-size:24px;line-height:1.2;color:#0f172a;">Nová objednávka – ARCHIMEDES START</h2>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin-top:8px;">
      <tr>
        <td style="padding:8px 0;font-weight:700;color:#0f172a;">Škola:</td>
        <td style="padding:8px 0;color:#334155;">${schoolName}</td>
      </tr>
      <tr>
        <td style="padding:8px 0;font-weight:700;color:#0f172a;">IČO:</td>
        <td style="padding:8px 0;color:#334155;">${ico}</td>
      </tr>
      <tr>
        <td style="padding:8px 0;font-weight:700;color:#0f172a;">Kontakt:</td>
        <td style="padding:8px 0;color:#334155;">${contactName}</td>
      </tr>
      <tr>
        <td style="padding:8px 0;font-weight:700;color:#0f172a;">Funkce:</td>
        <td style="padding:8px 0;color:#334155;">${role}</td>
      </tr>
      <tr>
        <td style="padding:8px 0;font-weight:700;color:#0f172a;">E-mail objednatele:</td>
        <td style="padding:8px 0;color:#334155;">${email}</td>
      </tr>
      <tr>
        <td style="padding:8px 0;font-weight:700;color:#0f172a;">E-mail admina:</td>
        <td style="padding:8px 0;color:#334155;">${adminEmail}</td>
      </tr>
      <tr>
        <td style="padding:8px 0;font-weight:700;color:#0f172a;">Telefon:</td>
        <td style="padding:8px 0;color:#334155;">${phone}</td>
      </tr>
      <tr>
        <td style="padding:8px 0;font-weight:700;color:#0f172a;vertical-align:top;">Adresa:</td>
        <td style="padding:8px 0;color:#334155;">${street}<br/>${city} ${zip}</td>
      </tr>
      <tr>
        <td style="padding:8px 0;font-weight:700;color:#0f172a;vertical-align:top;">Poznámka:</td>
        <td style="padding:8px 0;color:#334155;">${note}</td>
      </tr>
    </table>

    <div style="margin-top:24px;padding:18px 20px;border-radius:18px;background:#f8fafc;border:1px solid rgba(15,23,42,0.08);">
      <div style="font-size:14px;font-weight:900;color:#0f172a;margin-bottom:10px;">Technické shrnutí onboardingu</div>
      <div style="font-size:14px;line-height:1.7;color:#334155;">
        <strong>Serverem ověřený přihlášený uživatel:</strong> ${safeAuthUserPresent}<br/>
        <strong>Přihlášený uživatel:</strong> ${safeCurrentUserEmail}<br/>
        <strong>Režim objednávky:</strong> ${safeOnboardingMode}<br/>
        <strong>Vyřešená organizace:</strong> ${safeResolvedOrganizationName}<br/>
        <strong>Ordering source:</strong> ${safeOrderingSource}<br/>
        <strong>Admin source:</strong> ${safeAdminSource}<br/>
        <strong>Invite odeslán objednateli:</strong> ${safeOrderingInviteSent}<br/>
        <strong>Invite odeslán adminovi:</strong> ${safeAdminInviteSent}<br/>
        <strong>Role objednatele:</strong> ${safeOrderingUserRole}<br/>
        <strong>Objednatel = admin:</strong> ${samePerson ? "ano" : "ne"}<br/>
        <strong>active_organization_id nastaven objednateli:</strong> ${safeActiveOrgOrdering}<br/>
        <strong>active_organization_id nastaven adminovi:</strong> ${safeActiveOrgAdmin}<br/>
        <strong>Kód organizace:</strong> ${safeJoinCode}<br/>
        <strong>Onboarding stav:</strong> ${safeOnboardingStatus}<br/>
        <strong>Onboarding chyba:</strong> ${safeOnboardingError}<br/>
        <strong>Právní verze:</strong> ${escapeHtml(LEGAL_VERSION)}<br/>
        <strong>Odesláno:</strong> ${escapeHtml(now)}<br/>
        <strong>IP:</strong> ${escapeHtml(clientIp || "-")}
      </div>
    </div>

    <div style="margin-top:20px;padding:18px 20px;border-radius:18px;background:#eefaf0;border:1px solid #cfe8d3;color:#166534;font-size:15px;line-height:1.7;">
      <strong>Souhlasy:</strong><br/>
      VOP: ano<br/>
      DPA: ano<br/>
      Pravidla záznamů: ano<br/>
      Oprávnění jednat za organizaci: ano<br/>
      Objednání START s povinností úhrady: ano
    </div>
  `;
}

function buildOrdererEmailHtml({
  schoolName,
  contactName,
  ordererEmail,
  adminEmail,
  safeJoinCode,
  onboardingStatus,
  orderingNeedsActivation,
  ordererIsAdmin,
}) {
  const intro = `
    <p style="margin:0 0 12px;">Dobrý den${contactName ? ` ${contactName}` : ""},</p>
    <p style="margin:0;">vaši objednávku balíčku <strong>START</strong> jsme přijali.</p>
  `;

  const body = `
    <div style="padding:18px 20px;border-radius:18px;background:#f8fafc;border:1px solid rgba(15,23,42,0.08);">
      <div style="font-size:14px;font-weight:900;color:#0f172a;margin-bottom:10px;">Shrnutí objednávky</div>
      <div style="font-size:15px;line-height:1.7;color:#334155;">
        <strong>Škola / organizace:</strong> ${schoolName}<br/>
        <strong>Objednatel:</strong> ${contactName || "-"}<br/>
        <strong>E-mail objednatele:</strong> ${ordererEmail}<br/>
        <strong>Administrátor programu:</strong> ${adminEmail}<br/>
        <strong>Období:</strong> duben–září 2026<br/>
        <strong>Cena:</strong> 4 990 Kč bez DPH
        ${
          onboardingStatus === "completed"
            ? `<br/><strong>Kód organizace:</strong> ${safeJoinCode}`
            : ""
        }
      </div>
    </div>

    ${
      onboardingStatus === "completed"
        ? `
      <div style="margin-top:20px;padding:18px 20px;border-radius:18px;background:#eefaf0;border:1px solid #cfe8d3;color:#166534;">
        <strong>Objednávka byla úspěšně zpracována.</strong><br/>
        Škola byla připravena v systému ARCHIMEDES Live.
      </div>

      <div style="margin-top:20px;">
        ${
          orderingNeedsActivation
            ? `<p style="margin:0 0 12px;">Na váš e-mail byl odeslán také samostatný systémový e-mail pro nastavení přístupu.</p>`
            : `<p style="margin:0 0 12px;">Pokud už máte účet v ARCHIMEDES Live, škola byla přiřazena k vašemu stávajícímu přístupu.</p>`
        }

        ${
          ordererIsAdmin
            ? `<p style="margin:0;">Jste zároveň správcem programu. Další informace k přístupu jsme vám poslali samostatně.</p>`
            : `<p style="margin:0;">Správci programu byly odeslány samostatné informace k přístupu do portálu.</p>`
        }
      </div>
    `
        : `
      <div style="margin-top:20px;padding:18px 20px;border-radius:18px;background:#fff8e8;border:1px solid #f0dfaf;color:#6b4f00;">
        <strong>Objednávku jsme přijali, ale dokončení přístupu ještě vyžaduje naši krátkou kontrolu.</strong><br/>
        Navážeme na vás e-mailem a vše dokončíme.
      </div>
    `
    }
  `;

  const note = `
    V nejbližším kroku vám zašleme fakturu a navazující dokumenty.<br/><br/>
    Důležité dokumenty:<br/>
    <a href="${SITE_URL}/vop" style="color:#1d4ed8;text-decoration:none;">${SITE_URL}/vop</a><br/>
    <a href="${SITE_URL}/dpa" style="color:#1d4ed8;text-decoration:none;">${SITE_URL}/dpa</a><br/>
    <a href="${SITE_URL}/pravidla-zaznamu" style="color:#1d4ed8;text-decoration:none;">${SITE_URL}/pravidla-zaznamu</a><br/>
    <a href="${SITE_URL}/ochrana-osobnich-udaju" style="color:#1d4ed8;text-decoration:none;">${SITE_URL}/ochrana-osobnich-udaju</a>
  `;

  return buildEmailLayout({
    preheader: "Potvrzení objednávky START programu ARCHIMEDES Live.",
    eyebrow: "Potvrzení objednávky",
    title: "Objednávka START byla přijata",
    intro,
    bodyHtml: body,
    noteHtml: note,
  });
}

function buildAdminInvitedEmailHtml({
  schoolName,
  adminEmail,
  safeJoinCode,
}) {
  const intro = `
    <p style="margin:0 0 12px;">Dobrý den,</p>
    <p style="margin:0;">pro školu <strong>${schoolName}</strong> jsme pro vás připravili přístup do ARCHIMEDES Live.</p>
  `;

  const body = `
    <div style="padding:18px 20px;border-radius:18px;background:#f8fafc;border:1px solid rgba(15,23,42,0.08);">
      <div style="font-size:14px;font-weight:900;color:#0f172a;margin-bottom:10px;">Vaše role a údaje</div>
      <div style="font-size:15px;line-height:1.7;color:#334155;">
        <strong>Vaše role:</strong> administrátor školy<br/>
        <strong>E-mail administrátora:</strong> ${adminEmail}<br/>
        <strong>Kód organizace:</strong> ${safeJoinCode}
      </div>
    </div>

    <div style="margin-top:20px;padding:18px 20px;border-radius:18px;background:#eef6ff;border:1px solid rgba(37,99,235,0.12);color:#1f3b75;">
      <strong>Další krok:</strong><br/>
      Za chvíli vám přijde automatický systémový e-mail pro nastavení hesla. Pro dokončení přístupu použijte odkaz v e-mailu.
    </div>

    <div style="margin-top:20px;">
      <p style="margin:0 0 12px;">
        Po nastavení hesla se přihlásíte zde:<br/>
        <a href="${SITE_URL}/login" style="color:#1d4ed8;text-decoration:none;">${SITE_URL}/login</a>
      </p>

      <p style="margin:0;">
        Po přihlášení můžete spravovat přístup školy a přidávat další kolegy.
      </p>
    </div>
  `;

  const note = `
    Pokud by automatický systémový e-mail během několika minut nedorazil, zkontrolujte prosím složku Hromadné nebo Spam.
  `;

  return buildEmailLayout({
    preheader: "Dokončete nastavení přístupu do ARCHIMEDES Live.",
    eyebrow: "Přístup do školy",
    title: "Dokončete nastavení přístupu",
    intro,
    bodyHtml: body,
    noteHtml: note,
  });
}

function buildAdminExistingEmailHtml({
  schoolName,
  adminEmail,
  safeJoinCode,
}) {
  const intro = `
    <p style="margin:0 0 12px;">Dobrý den,</p>
    <p style="margin:0;">škola <strong>${schoolName}</strong> byla přiřazena k vašemu účtu v ARCHIMEDES Live.</p>
  `;

  const body = `
    <div style="padding:18px 20px;border-radius:18px;background:#f8fafc;border:1px solid rgba(15,23,42,0.08);">
      <div style="font-size:14px;font-weight:900;color:#0f172a;margin-bottom:10px;">Vaše role a údaje</div>
      <div style="font-size:15px;line-height:1.7;color:#334155;">
        <strong>Vaše role:</strong> administrátor školy<br/>
        <strong>E-mail administrátora:</strong> ${adminEmail}<br/>
        <strong>Kód organizace:</strong> ${safeJoinCode}
      </div>
    </div>

    <div style="margin-top:20px;">
      <p style="margin:0 0 12px;">
        Přihlaste se svým stávajícím účtem zde:<br/>
        <a href="${SITE_URL}/login" style="color:#1d4ed8;text-decoration:none;">${SITE_URL}/login</a>
      </p>

      <p style="margin:0 0 12px;">
        Pokud si heslo nepamatujete, použijte obnovu hesla na přihlašovací stránce.
      </p>

      <p style="margin:0;">
        Po přihlášení můžete spravovat přístup školy a případně přidávat další kolegy.
      </p>
    </div>
  `;

  return buildEmailLayout({
    preheader: "Přístup ke škole v ARCHIMEDES Live je připraven.",
    eyebrow: "Přístup do školy",
    title: "Přístup ke škole je připraven",
    intro,
    bodyHtml: body,
  });
}

function buildAdminPendingEmailHtml({
  schoolName,
  adminEmail,
}) {
  const intro = `
    <p style="margin:0 0 12px;">Dobrý den,</p>
    <p style="margin:0;">pro školu <strong>${schoolName}</strong> jsme přijali objednávku programu ARCHIMEDES Live.</p>
  `;

  const body = `
    <div style="padding:18px 20px;border-radius:18px;background:#f8fafc;border:1px solid rgba(15,23,42,0.08);">
      <div style="font-size:14px;font-weight:900;color:#0f172a;margin-bottom:10px;">Údaj správce programu</div>
      <div style="font-size:15px;line-height:1.7;color:#334155;">
        <strong>E-mail administrátora:</strong> ${adminEmail}
      </div>
    </div>

    <div style="margin-top:20px;padding:18px 20px;border-radius:18px;background:#fff8e8;border:1px solid #f0dfaf;color:#6b4f00;">
      <strong>Přístup administrátora právě dokončujeme.</strong><br/>
      Jakmile bude připraven, obdržíte další pokyny e-mailem.
    </div>
  `;

  return buildEmailLayout({
    preheader: "Objednávka START byla přijata, přístup administrátora dokončujeme.",
    eyebrow: "Objednávka START",
    title: "Přístup právě dokončujeme",
    intro,
    bodyHtml: body,
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  let orderId = null;
  let organizationId = null;
  let adminUserId = null;
  let orderingUserId = null;
  let joinCode = null;

  try {
    const data = req.body || {};

    const schoolNameRaw = normalizeText(data.schoolName);
    const icoRaw = normalizeText(data.ico);
    const streetRaw = normalizeText(data.street);
    const cityRaw = normalizeText(data.city);
    const zipRaw = normalizeText(data.zip);
    const contactNameRaw = normalizeText(data.contactName);
    const roleRaw = normalizeText(data.role);
    const emailRaw = normalizeEmail(data.email);
    const adminEmailRaw = normalizeEmail(data.adminEmail);
    const phoneRaw = normalizeText(data.phone);
    const noteRaw = normalizeText(data.note);

    if (
      !schoolNameRaw ||
      !icoRaw ||
      !streetRaw ||
      !cityRaw ||
      !zipRaw ||
      !contactNameRaw ||
      !roleRaw ||
      !emailRaw ||
      !adminEmailRaw
    ) {
      return res.status(400).json({
        error: "Prosím vyplňte všechny povinné údaje.",
      });
    }

    if (!isValidEmail(emailRaw) || !isValidEmail(adminEmailRaw)) {
      return res.status(400).json({
        error: "Prosím zadejte platné e-mailové adresy.",
      });
    }

    if (
      !data.agreeVop ||
      !data.agreeDpa ||
      !data.agreeRecordings ||
      !data.agreeAuthority ||
      !data.agreeContract
    ) {
      return res.status(400).json({
        error: "Pro odeslání objednávky je nutné potvrdit všechny souhlasy.",
      });
    }

    const authenticatedUser = await getAuthenticatedUserFromRequest(req);
    const authenticatedUserId = authenticatedUser?.id || null;
    const authenticatedUserEmail = normalizeEmail(authenticatedUser?.email || "");

    const clientIp = getClientIp(req);
    const userAgent = req.headers["user-agent"] || "";
    const now = new Date().toISOString();

    const { data: insertedOrder, error: dbError } = await supabase
      .from("orders_start")
      .insert([
        {
          school_name: schoolNameRaw,
          ico: icoRaw,
          street: streetRaw,
          city: cityRaw,
          zip: zipRaw,
          contact_name: contactNameRaw,
          role: roleRaw,
          email: emailRaw,
          admin_email: adminEmailRaw,
          phone: phoneRaw || null,
          note: noteRaw || null,
          agree_vop: !!data.agreeVop,
          agree_dpa: !!data.agreeDpa,
          agree_recordings: !!data.agreeRecordings,
          agree_authority: !!data.agreeAuthority,
          agree_contract: !!data.agreeContract,
          onboarding_status: "pending",
          legal_version: LEGAL_VERSION,
          ip_address: clientIp,
          user_agent: userAgent,
          submitted_at: now,
        },
      ])
      .select("id")
      .single();

    if (dbError || !insertedOrder?.id) {
      console.error("DB ERROR:", dbError);
      throw new Error("Chyba uložení do databáze");
    }

    orderId = insertedOrder.id;

    let onboardingStatus = "completed";
    let onboardingError = null;
    let onboardingMode = "homepage";
    let resolvedCurrentUserEmail = authenticatedUserEmail || "";
    let orderingUserRole = "";
    let orderingInviteSent = false;
    let adminInviteSent = false;
    let orderingSource = "";
    let adminSource = "";
    let resolvedOrganizationName = "";
    let activeOrganizationSetForOrdering = false;
    let activeOrganizationSetForAdmin = false;

    try {
      let organization = await getOrganizationByIco(icoRaw);

      if (!organization) {
        organization = await createOrganization({
          name: schoolNameRaw,
          ico: icoRaw,
        });
        onboardingMode = authenticatedUserId
          ? "demo_or_logged_new_school"
          : "homepage_new_school";
      } else {
        onboardingMode = authenticatedUserId
          ? "demo_or_logged_existing_school"
          : "homepage_existing_school";
      }

      organizationId = organization.id;
      joinCode = organization.join_code;
      resolvedOrganizationName = organization.name || schoolNameRaw;

      const orderingResolution = await resolveUserForEmail({
        targetEmail: emailRaw,
        fullName: contactNameRaw,
        authenticatedUser,
      });

      orderingUserId = orderingResolution.userId;
      orderingInviteSent = orderingResolution.inviteSent;
      orderingSource = orderingResolution.source;

      await assertNoConflictingRealOrgMemberships(orderingUserId, organizationId);

      await upsertProfile({
        userId: orderingUserId,
        email: emailRaw,
        fullName: contactNameRaw,
        userType: "organization",
        mustSetPassword: orderingResolution.mustSetPassword,
      });

      if (emailRaw === adminEmailRaw) {
        adminUserId = orderingUserId;
        adminInviteSent = orderingInviteSent;
        adminSource = orderingSource;
        orderingUserRole = "organization_admin";

        await ensureMembership({
          organizationId,
          userId: orderingUserId,
          roleInOrg: "organization_admin",
        });

        await setActiveOrganization(orderingUserId, organizationId);
        activeOrganizationSetForOrdering = true;
        activeOrganizationSetForAdmin = true;
      } else {
        orderingUserRole = "member";

        await ensureMembership({
          organizationId,
          userId: orderingUserId,
          roleInOrg: "member",
        });

        await setActiveOrganization(orderingUserId, organizationId);
        activeOrganizationSetForOrdering = true;

        const adminResolution = await resolveUserForEmail({
          targetEmail: adminEmailRaw,
          fullName: contactNameRaw,
          authenticatedUser,
        });

        adminUserId = adminResolution.userId;
        adminInviteSent = adminResolution.inviteSent;
        adminSource = adminResolution.source;

        await assertNoConflictingRealOrgMemberships(adminUserId, organizationId);

        await upsertProfile({
          userId: adminUserId,
          email: adminEmailRaw,
          fullName: contactNameRaw,
          userType: "organization",
          mustSetPassword: adminResolution.mustSetPassword,
        });

        await ensureMembership({
          organizationId,
          userId: adminUserId,
          roleInOrg: "organization_admin",
        });

        await setActiveOrganization(adminUserId, organizationId);
        activeOrganizationSetForAdmin = true;
      }

      await ensureMembership({
        organizationId,
        userId: orderingUserId,
        roleInOrg:
          orderingUserRole === "organization_admin"
            ? "organization_admin"
            : "member",
      });

      const { error: onboardingUpdateError } = await supabase
        .from("orders_start")
        .update({
          organization_id: organizationId,
          admin_user_id: adminUserId,
          onboarding_status: "completed",
          onboarding_error: null,
        })
        .eq("id", orderId);

      if (onboardingUpdateError) {
        throw new Error(
          `Nepodařilo se zapsat stav onboardingu: ${onboardingUpdateError.message}`
        );
      }
    } catch (onboardingErr) {
      onboardingStatus = "failed";
      onboardingError =
        onboardingErr?.message || "Neznámá chyba onboardingu.";

      console.error("ONBOARDING ERROR:", onboardingErr);

      const { error: updateOrderError } = await supabase
        .from("orders_start")
        .update({
          organization_id: organizationId,
          admin_user_id: adminUserId,
          onboarding_status: onboardingStatus,
          onboarding_error: onboardingError,
        })
        .eq("id", orderId);

      if (updateOrderError) {
        console.error("ORDER UPDATE ERROR:", updateOrderError);
      }
    }

    const transporter = createTransporter();

    const schoolName = escapeHtml(schoolNameRaw);
    const ico = escapeHtml(icoRaw);
    const street = escapeHtml(streetRaw);
    const city = escapeHtml(cityRaw);
    const zip = escapeHtml(zipRaw);
    const contactName = escapeHtml(contactNameRaw);
    const role = escapeHtml(roleRaw);
    const email = escapeHtml(emailRaw);
    const adminEmail = escapeHtml(adminEmailRaw);
    const phone = escapeHtml(phoneRaw || "-");
    const note = escapeHtml(noteRaw || "-");
    const safeJoinCode = escapeHtml(joinCode || "-");
    const safeOnboardingStatus = escapeHtml(onboardingStatus);
    const safeOnboardingError = escapeHtml(onboardingError || "-");
    const safeOnboardingMode = escapeHtml(onboardingMode);
    const safeCurrentUserEmail = escapeHtml(resolvedCurrentUserEmail || "-");
    const safeOrderingUserRole = escapeHtml(orderingUserRole || "-");
    const safeOrderingSource = escapeHtml(orderingSource || "-");
    const safeAdminSource = escapeHtml(adminSource || "-");
    const safeOrderingInviteSent = orderingInviteSent ? "ano" : "ne";
    const safeAdminInviteSent = adminInviteSent ? "ano" : "ne";
    const safeResolvedOrganizationName = escapeHtml(
      resolvedOrganizationName || schoolNameRaw
    );
    const safeAuthUserPresent = authenticatedUserId ? "ano" : "ne";
    const safeActiveOrgOrdering = activeOrganizationSetForOrdering ? "ano" : "ne";
    const safeActiveOrgAdmin = activeOrganizationSetForAdmin ? "ano" : "ne";
    const samePerson =
      orderingUserId && adminUserId && orderingUserId === adminUserId;

    const ordererIsAdmin = !!samePerson;
    const adminNeedsActivation = !!adminInviteSent;
    const adminHasExistingAccess = !adminInviteSent;
    const orderingNeedsActivation = !!orderingInviteSent;

    const subject = `🟢 START – ${schoolNameRaw} (IČO: ${icoRaw})`;

    await sendMailLogged(transporter, {
      label: "start_internal_notification",
      from: process.env.MAIL_FROM,
      to: process.env.MAIL_TO,
      subject,
      html: buildInternalOrderHtml({
        schoolName,
        ico,
        street,
        city,
        zip,
        contactName,
        role,
        email,
        adminEmail,
        phone,
        note,
        safeAuthUserPresent,
        safeCurrentUserEmail,
        safeOnboardingMode,
        safeResolvedOrganizationName,
        safeOrderingSource,
        safeAdminSource,
        safeOrderingInviteSent,
        safeAdminInviteSent,
        safeOrderingUserRole,
        samePerson,
        safeActiveOrgOrdering,
        safeActiveOrgAdmin,
        safeJoinCode,
        safeOnboardingStatus,
        safeOnboardingError,
        now,
        clientIp,
      }),
    });

    await sendMailLogged(transporter, {
      label: "start_confirmation_orderer",
      from: process.env.MAIL_FROM,
      to: emailRaw,
      subject: "Potvrzení objednávky – ARCHIMEDES Live",
      html: buildOrdererEmailHtml({
        schoolName,
        contactName,
        ordererEmail: email,
        adminEmail,
        safeJoinCode,
        onboardingStatus,
        orderingNeedsActivation,
        ordererIsAdmin,
      }),
    });

    if (onboardingStatus === "completed") {
      if (adminNeedsActivation) {
        await sendMailLogged(transporter, {
          label: "start_admin_invited",
          from: process.env.MAIL_FROM,
          to: adminEmailRaw,
          subject: "Dokončete nastavení přístupu – ARCHIMEDES Live",
          html: buildAdminInvitedEmailHtml({
            schoolName,
            adminEmail,
            safeJoinCode,
          }),
        });
      } else if (adminHasExistingAccess) {
        await sendMailLogged(transporter, {
          label: "start_admin_existing",
          from: process.env.MAIL_FROM,
          to: adminEmailRaw,
          subject: "Přístup ke škole – ARCHIMEDES Live",
          html: buildAdminExistingEmailHtml({
            schoolName,
            adminEmail,
            safeJoinCode,
          }),
        });
      }
    }

    if (onboardingStatus === "failed" && emailRaw !== adminEmailRaw) {
      await sendMailLogged(transporter, {
        label: "start_admin_pending",
        from: process.env.MAIL_FROM,
        to: adminEmailRaw,
        subject: "Objednávka START přijata – přístup dokončujeme",
        html: buildAdminPendingEmailHtml({
          schoolName,
          adminEmail,
        }),
      });
    }

    return res.status(200).json({
      success: true,
      onboardingStatus,
    });
  } catch (err) {
    console.error("SERVER ERROR:", err);

    return res.status(500).json({
      error: "Objednávku se nepodařilo odeslat. Zkuste to prosím znovu.",
    });
  }
}
