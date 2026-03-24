// pages/api/start-order.js
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

      // Jistota, že objednatel je opravdu členem školy i v případě,
      // že admin je jiný účet a onboarding probíhal přes více kroků.
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
          onboarding_status,
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

    const subject = `🟢 START – ${schoolNameRaw} (IČO: ${icoRaw})`;

    await sendMailLogged(transporter, {
      label: "start_internal_notification",
      from: process.env.MAIL_FROM,
      to: process.env.MAIL_TO,
      subject,
      html: `
        <h2>Nová objednávka – ARCHIMEDES START</h2>

        <p><strong>Škola:</strong> ${schoolName}</p>
        <p><strong>IČO:</strong> ${ico}</p>

        <hr/>

        <p><strong>Kontakt:</strong> ${contactName}</p>
        <p><strong>Funkce:</strong> ${role}</p>
        <p><strong>Email objednatele:</strong> ${email}</p>
        <p><strong>Admin email (portál):</strong> ${adminEmail}</p>
        <p><strong>Telefon:</strong> ${phone}</p>

        <hr/>

        <p><strong>Adresa:</strong><br/>
        ${street}<br/>
        ${city} ${zip}
        </p>

        <p><strong>Poznámka:</strong><br/>${note}</p>

        <hr/>

        <p><strong>Souhlasy:</strong></p>
        <ul>
          <li>VOP: ano</li>
          <li>DPA: ano</li>
          <li>Pravidla záznamů: ano</li>
          <li>Oprávnění jednat za organizaci: ano</li>
          <li>Objednání START s povinností úhrady: ano</li>
        </ul>

        <hr/>

        <p><strong>Serverem ověřený přihlášený uživatel:</strong> ${safeAuthUserPresent}</p>
        <p><strong>Přihlášený uživatel:</strong> ${safeCurrentUserEmail}</p>
        <p><strong>Režim objednávky:</strong> ${safeOnboardingMode}</p>
        <p><strong>Vyřešená organizace:</strong> ${safeResolvedOrganizationName}</p>
        <p><strong>Ordering source:</strong> ${safeOrderingSource}</p>
        <p><strong>Admin source:</strong> ${safeAdminSource}</p>
        <p><strong>Invite odeslán objednateli:</strong> ${safeOrderingInviteSent}</p>
        <p><strong>Invite odeslán adminovi:</strong> ${safeAdminInviteSent}</p>
        <p><strong>Role objednatele:</strong> ${safeOrderingUserRole}</p>
        <p><strong>Objednatel = admin:</strong> ${samePerson ? "ano" : "ne"}</p>
        <p><strong>active_organization_id nastaven objednateli:</strong> ${safeActiveOrgOrdering}</p>
        <p><strong>active_organization_id nastaven adminovi:</strong> ${safeActiveOrgAdmin}</p>
        <p><strong>Kód organizace:</strong> ${safeJoinCode}</p>
        <p><strong>Onboarding stav:</strong> ${safeOnboardingStatus}</p>
        <p><strong>Onboarding chyba:</strong> ${safeOnboardingError}</p>
        <p><strong>Právní verze:</strong> ${escapeHtml(LEGAL_VERSION)}</p>
        <p><strong>Odesláno:</strong> ${escapeHtml(now)}</p>
        <p><strong>IP:</strong> ${escapeHtml(clientIp || "-")}</p>
      `,
    });

    await sendMailLogged(transporter, {
      label: "start_confirmation_orderer",
      from: process.env.MAIL_FROM,
      to: emailRaw,
      subject: "Potvrzení objednávky – ARCHIMEDES Live",
      html: `
        <h2>Děkujeme za objednávku</h2>

        <p>Vaše objednávka balíčku <strong>START</strong> byla přijata.</p>

        <p><strong>Škola / organizace:</strong> ${schoolName}</p>
        <p><strong>Objednatel:</strong> ${contactName}</p>
        <p><strong>Administrátor programu:</strong> ${adminEmail}</p>
        <p><strong>Období:</strong> duben–září 2026</p>
        <p><strong>Cena:</strong> 4 990 Kč bez DPH</p>

        ${
          onboardingStatus === "completed"
            ? `
        <p><strong>Kód organizace:</strong> ${safeJoinCode}</p>
        <p>
          Škola byla založena nebo spárována a váš uživatelský přístup byl přiřazen do organizace jako
          <strong> ${safeOrderingUserRole}</strong>.
        </p>
        ${
          orderingInviteSent
            ? `
        <p>
          Na váš e-mail byl současně odeslán systémový e-mail pro nastavení hesla.
          Po jeho dokončení se můžete přihlásit zde:
          <br/>
          <a href="${SITE_URL}/login">${SITE_URL}/login</a>
        </p>
        `
            : `
        <p>
          Váš přístup je připraven. Přihlásit se můžete zde:
          <br/>
          <a href="${SITE_URL}/login">${SITE_URL}/login</a>
        </p>
        `
        }
        `
            : `
        <p>
          Objednávku jsme přijali, ale dokončení přístupu ještě vyžaduje naši kontrolu.
        </p>
        `
        }

        ${
          emailRaw !== adminEmailRaw
            ? `
        <p>
          Administrátor školy obdrží samostatný e-mail s informací o přístupu.
        </p>
        `
            : `
        <p>
          Jste zároveň veden/a jako administrátor školy.
        </p>
        `
        }

        <p>
          V nejbližším kroku vám zašleme fakturační podklady a další organizační informace.
        </p>

        <p>
          Důležité dokumenty:
          <br/>
          <a href="${SITE_URL}/vop">${SITE_URL}/vop</a><br/>
          <a href="${SITE_URL}/dpa">${SITE_URL}/dpa</a><br/>
          <a href="${SITE_URL}/pravidla-zaznamu">${SITE_URL}/pravidla-zaznamu</a><br/>
          <a href="${SITE_URL}/ochrana-osobnich-udaju">${SITE_URL}/ochrana-osobnich-udaju</a>
        </p>

        <p>S pozdravem,<br/>
        <strong>ARCHIMEDES Live</strong><br/>
        EduVision s.r.o.</p>
      `,
    });

    if (onboardingStatus === "completed" && !samePerson) {
      if (adminInviteSent) {
        await sendMailLogged(transporter, {
          label: "start_admin_invited",
          from: process.env.MAIL_FROM,
          to: adminEmailRaw,
          subject: "Administrátorský přístup – ARCHIMEDES Live",
          html: `
            <h2>Byl vám vytvořen administrátorský přístup</h2>

            <p>Pro školu <strong>${schoolName}</strong> jsme připravili administrátorský přístup do ARCHIMEDES Live.</p>

            <p><strong>Vaše role:</strong> administrátor školy</p>
            <p><strong>E-mail administrátora:</strong> ${adminEmail}</p>
            <p><strong>Kód organizace:</strong> ${safeJoinCode}</p>

            <p>
              Na váš e-mail byl současně odeslán systémový e-mail pro nastavení hesla.
              Po dokončení aktivace se přihlásíte zde:
              <br/>
              <a href="${SITE_URL}/login">${SITE_URL}/login</a>
            </p>

            <p>
              Po přihlášení můžete spravovat přístup školy a přidávat další kolegy.
            </p>

            <p>S pozdravem,<br/>
            <strong>ARCHIMEDES Live</strong><br/>
            EduVision s.r.o.</p>
          `,
        });
      } else {
        await sendMailLogged(transporter, {
          label: "start_admin_existing",
          from: process.env.MAIL_FROM,
          to: adminEmailRaw,
          subject: "Administrátorský přístup – ARCHIMEDES Live",
          html: `
            <h2>Administrátorský přístup je připraven</h2>

            <p>Pro školu <strong>${schoolName}</strong> je váš administrátorský přístup do ARCHIMEDES Live připraven.</p>

            <p><strong>Vaše role:</strong> administrátor školy</p>
            <p><strong>E-mail administrátora:</strong> ${adminEmail}</p>
            <p><strong>Kód organizace:</strong> ${safeJoinCode}</p>

            <p>
              Přihlaste se do portálu zde:
              <br/>
              <a href="${SITE_URL}/login">${SITE_URL}/login</a>
            </p>

            <p>
              Po přihlášení můžete spravovat přístup školy a případně přidávat další kolegy.
            </p>

            <p>S pozdravem,<br/>
            <strong>ARCHIMEDES Live</strong><br/>
            EduVision s.r.o.</p>
          `,
        });
      }
    }

    if (onboardingStatus === "failed" && emailRaw !== adminEmailRaw) {
      await sendMailLogged(transporter, {
        label: "start_admin_pending",
        from: process.env.MAIL_FROM,
        to: adminEmailRaw,
        subject: "Objednávka START přijata – přístup dokončujeme",
        html: `
          <h2>Objednávka START byla přijata</h2>

          <p>Pro školu <strong>${schoolName}</strong> jsme přijali objednávku programu ARCHIMEDES Live.</p>

          <p><strong>E-mail administrátora:</strong> ${adminEmail}</p>

          <p>
            Přístup administrátora právě dokončujeme. Jakmile bude připraven,
            obdržíte další pokyny e-mailem.
          </p>

          <p>S pozdravem,<br/>
          <strong>ARCHIMEDES Live</strong><br/>
          EduVision s.r.o.</p>
        `,
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
