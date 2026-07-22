import crypto from "crypto";
import nodemailer from "nodemailer";
import { createClient } from "@supabase/supabase-js";
import { getBearerToken } from "../../../lib/server/platformAdminApi";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.archimedeslive.com";

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function isValidEmail(value) {
  return !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

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

async function sendInviteEmail({ email, municipalityName, organizationType, inviteUrl }) {
  const port = Number(process.env.SMTP_PORT);
  if (
    !process.env.SMTP_HOST ||
    !port ||
    !process.env.SMTP_USER ||
    !process.env.SMTP_PASS ||
    !process.env.MAIL_FROM
  ) {
    throw new Error("SMTP config missing");
  }

  const label = organizationType === "school" ? "školu" : "spolek";
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to: email,
    subject: `ARCHIMEDES Live – pozvánka obce ${municipalityName}`,
    text: `Dobrý den,

obec ${municipalityName} Vás zve k zapojení organizace do ARCHIMEDES Live.

Pro bezpečnou registraci ${label} otevřete tento jednorázový odkaz:
${inviteUrl}

Odkaz je platný 14 dní a lze jej použít pouze jednou.

Tým ARCHIMEDES Live`,
  });
}

export default async function handler(req, res) {
  const municipalityId = String(
    (req.method === "GET" ? req.query?.municipalityId : req.body?.municipalityId) || ""
  ).trim();

  if (!municipalityId) {
    return res.status(400).json({ error: "Chybí obec." });
  }

  const access = await requireMunicipalityAdmin(req, res, municipalityId);
  if (!access) return;

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

    return res.status(200).json({
      municipality: access.municipality,
      invites: invites || [],
      organizations: organizations || [],
    });
  }

  if (req.method === "PATCH") {
    const inviteId = String(req.body?.inviteId || "").trim();
    if (!inviteId) return res.status(400).json({ error: "Chybí pozvánka." });

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

  if (req.method !== "POST") {
    res.setHeader("Allow", "GET, POST, PATCH");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const organizationType = String(req.body?.organizationType || "").trim();
  const invitedEmail = String(req.body?.email || "").trim().toLowerCase();

  if (!["school", "association"].includes(organizationType)) {
    return res.status(400).json({ error: "Vyberte školu nebo spolek." });
  }
  if (!isValidEmail(invitedEmail)) {
    return res.status(400).json({ error: "Zadejte platný e-mail." });
  }

  const rawToken = crypto.randomBytes(32).toString("base64url");
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

  const { data: invite, error: insertError } = await supabaseAdmin
    .from("municipality_organization_invites")
    .insert({
      municipality_id: municipalityId,
      organization_type: organizationType,
      invited_email: invitedEmail || null,
      token_hash: tokenHash,
      expires_at: expiresAt,
      created_by: access.user.id,
    })
    .select("id, organization_type, invited_email, status, expires_at, created_at")
    .single();

  if (insertError) {
    return res.status(500).json({ error: "Pozvánku se nepodařilo vytvořit." });
  }

  const path =
    organizationType === "school" ? "/registrace-skoly" : "/registrace-spolku";
  const inviteUrl = `${SITE_URL}${path}?invite=${encodeURIComponent(rawToken)}`;
  let emailSent = false;

  if (invitedEmail) {
    try {
      await sendInviteEmail({
        email: invitedEmail,
        municipalityName: access.municipality.name,
        organizationType,
        inviteUrl,
      });
      emailSent = true;
    } catch (emailError) {
      console.error("municipality organization invite email error:", emailError);
    }
  }

  return res.status(200).json({ ok: true, invite, inviteUrl, emailSent });
}
