import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";
import { consumePublicRateLimit } from "../../lib/server/publicRateLimit";
import {
  cleanupNewRegistrant,
  RegistrantError,
  resolveOrganizationRegistrant,
} from "../../lib/server/organizationRegistrant";
import {
  MunicipalityInviteError,
  resolveMunicipalityInvite,
} from "../../lib/server/municipalityOrganizationInvite";
import { getServerSiteUrl } from "../../lib/server/siteUrl";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function mapAtomicOnboardingError(error) {
  const message = String(error?.message || "");
  if (error?.code === "23505" || message.includes("already exists")) {
    return new MunicipalityInviteError(
      "Tuto školu už evidujeme. Kvůli zachování účtů a historie ji nepřipojujte podruhé; kontaktujte nás a existující školu bezpečně propojíme s obcí.",
      409
    );
  }
  if (message.includes("not pending") || message.includes("used concurrently")) {
    return new MunicipalityInviteError(
      "Pozvánku mezitím použil někdo jiný. Organizace nebyla připojena.",
      409
    );
  }
  return error;
}

async function sendRegistrationEmail({
  email,
  fullName,
  schoolName,
  setupUrl,
  siteUrl,
}) {
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

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  });

  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to: email,
    subject: "ARCHIMEDES Live – škola byla zaregistrována",
    text: `Dobrý den ${fullName},\n\nškola ${schoolName} byla zaregistrována do ARCHIMEDES Live.\n${
      setupUrl ? `\nNastavte si heslo: ${setupUrl}\n` : ""
    }\nPřihlášení: ${siteUrl}/login\n`,
    html: `<div style="font-family:Segoe UI,Arial,sans-serif;color:#0f172a;line-height:1.6">
      <p>Dobrý den ${escapeHtml(fullName)},</p>
      <p>škola <strong>${escapeHtml(schoolName)}</strong> byla zaregistrována do ARCHIMEDES Live.</p>
      ${
        setupUrl
          ? `<p><a href="${escapeHtml(setupUrl)}" style="display:inline-block;padding:12px 18px;border-radius:10px;background:#1d4ed8;color:white;text-decoration:none;font-weight:700">Nastavit heslo</a></p>`
          : ""
      }
      <p><a href="${escapeHtml(siteUrl)}/login">Přihlášení do portálu</a></p>
    </div>`,
  });
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  let registrant = null;
  let onboardingCommitted = false;
  try {
    const siteUrl = getServerSiteUrl();
    const rateLimitAllowed = await consumePublicRateLimit({
      supabaseAdmin,
      req,
      route: "school-registration",
      limit: 20,
      windowSeconds: 60 * 60,
    });
    if (!rateLimitAllowed) {
      res.setHeader("Retry-After", "3600");
      return res.status(429).json({
        error: "Bylo provedeno příliš mnoho pokusů o registraci. Zkuste to prosím později.",
      });
    }

    const { inviteToken, name, address, legalIdentifier, contactName, email, phone } = req.body || {};
    const cleanName = String(name || "").trim();
    const cleanAddress = String(address || "").trim();
    const cleanLegalIdentifier = String(legalIdentifier || "").replace(/\s+/g, "").trim();
    const cleanContactName = String(contactName || "").trim();
    const cleanEmail = String(email || "").trim().toLowerCase();
    const cleanPhone = String(phone || "").trim();

    if (!cleanName || cleanName.length > 160) {
      return res.status(400).json({ error: "Název školy je povinný a může mít nejvýše 160 znaků." });
    }
    if (!cleanAddress || cleanAddress.length > 300) {
      return res.status(400).json({ error: "Adresa školy je povinná a může mít nejvýše 300 znaků." });
    }
    if (cleanLegalIdentifier && !/^\d{8}$/.test(cleanLegalIdentifier)) {
      return res.status(400).json({ error: "IČO musí obsahovat přesně 8 číslic." });
    }
    if (cleanContactName.length < 2 || cleanContactName.length > 120) {
      return res.status(400).json({ error: "Kontaktní osoba musí mít 2 až 120 znaků." });
    }
    if (cleanEmail.length > 254 || !isValidEmail(cleanEmail)) {
      return res.status(400).json({ error: "Zadejte platný e-mail." });
    }
    if (cleanPhone.length < 6 || cleanPhone.length > 32) {
      return res.status(400).json({ error: "Telefon musí mít 6 až 32 znaků." });
    }

    const { invite } = await resolveMunicipalityInvite({
      supabaseAdmin,
      rawToken: inviteToken,
      organizationType: "school",
      email: cleanEmail,
    });

    registrant = await resolveOrganizationRegistrant({
      supabaseAdmin,
      req,
      email: cleanEmail,
      fullName: cleanContactName,
      redirectTo: `${siteUrl}/nastavit-heslo`,
    });

    const { data: onboardingRows, error: onboardingError } =
      await supabaseAdmin.rpc("complete_municipality_organization_onboarding", {
        p_invite_id: invite.id,
        p_user_id: registrant.userId,
        p_is_new_account: registrant.isNewAccount,
        p_email: registrant.email,
        p_full_name: registrant.fullName,
        p_name: cleanName,
        p_org_type: "school",
        p_address: cleanAddress,
        p_legal_identifier: cleanLegalIdentifier || null,
        p_phone: cleanPhone,
        p_activity_code: null,
        p_activity_custom_text: null,
      });

    if (onboardingError) throw mapAtomicOnboardingError(onboardingError);
    onboardingCommitted = true;
    const onboarding = onboardingRows?.[0];
    if (!onboarding?.organization_id) {
      throw new Error("Atomický onboarding školy nevrátil organizaci.");
    }

    const school = {
      id: onboarding.organization_id,
      name: onboarding.organization_name,
      join_code: onboarding.join_code,
    };

    let emailSent = false;
    try {
      await sendRegistrationEmail({
        email: registrant.email,
        fullName: registrant.fullName,
        schoolName: school.name,
        setupUrl: registrant.setupUrl,
        siteUrl,
      });
      emailSent = true;
    } catch (emailError) {
      console.error("school registration email error:", emailError);
    }

    return res.status(200).json({
      ok: true,
      organization: school,
      existingAccount: !registrant.isNewAccount,
      emailSent,
    });
  } catch (error) {
    if (!onboardingCommitted) {
      await cleanupNewRegistrant(supabaseAdmin, registrant, {
        route: "school-registration",
        reason: error?.message || "unknown",
      });
    }

    console.error("registrace-skoly error:", error);
    const expectedError =
      error instanceof RegistrantError ||
      error instanceof MunicipalityInviteError;
    const status = expectedError ? error.status : 500;
    return res.status(status).json({
      error: expectedError
        ? error.message
        : "Registraci školy se nepodařilo dokončit.",
    });
  }
}
