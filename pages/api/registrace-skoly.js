import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";
import { consumePublicRateLimit } from "../../lib/server/publicRateLimit";
import {
  cleanupNewRegistrant,
  RegistrantError,
  resolveOrganizationRegistrant,
} from "../../lib/server/organizationRegistrant";
import {
  consumeMunicipalityInvite,
  MunicipalityInviteError,
  resolveMunicipalityInvite,
} from "../../lib/server/municipalityOrganizationInvite";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.archimedeslive.com";

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

async function sendRegistrationEmail({ email, fullName, schoolName, setupUrl }) {
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
  });

  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to: email,
    subject: "ARCHIMEDES Live – škola byla zaregistrována",
    text: `Dobrý den ${fullName},\n\nškola ${schoolName} byla zaregistrována do ARCHIMEDES Live.\n${
      setupUrl ? `\nNastavte si heslo: ${setupUrl}\n` : ""
    }\nPřihlášení: ${SITE_URL}/login\n`,
    html: `<div style="font-family:Segoe UI,Arial,sans-serif;color:#0f172a;line-height:1.6">
      <p>Dobrý den ${escapeHtml(fullName)},</p>
      <p>škola <strong>${escapeHtml(schoolName)}</strong> byla zaregistrována do ARCHIMEDES Live.</p>
      ${
        setupUrl
          ? `<p><a href="${escapeHtml(setupUrl)}" style="display:inline-block;padding:12px 18px;border-radius:10px;background:#1d4ed8;color:white;text-decoration:none;font-weight:700">Nastavit heslo</a></p>`
          : ""
      }
      <p><a href="${escapeHtml(SITE_URL)}/login">Přihlášení do portálu</a></p>
    </div>`,
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  let registrant = null;
  let schoolId = null;

  try {
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

    if (!cleanName) return res.status(400).json({ error: "Vyplňte název školy." });
    if (!cleanAddress) return res.status(400).json({ error: "Vyplňte adresu školy." });
    if (cleanLegalIdentifier && !/^\d{8}$/.test(cleanLegalIdentifier)) {
      return res.status(400).json({ error: "IČO musí obsahovat přesně 8 číslic." });
    }
    if (cleanContactName.length < 2) {
      return res.status(400).json({ error: "Vyplňte kontaktní osobu." });
    }
    if (!isValidEmail(cleanEmail)) {
      return res.status(400).json({ error: "Zadejte platný e-mail." });
    }
    if (cleanPhone.length < 6) {
      return res.status(400).json({ error: "Vyplňte platný telefon." });
    }

    const { invite, municipality } = await resolveMunicipalityInvite({
      supabaseAdmin,
      rawToken: inviteToken,
      organizationType: "school",
      email: cleanEmail,
    });

    const { data: duplicateUnderMunicipality, error: duplicateUnderMunicipalityError } =
      await supabaseAdmin
        .from("organizations")
        .select("id")
        .eq("parent_organization_id", municipality.id)
        .eq("org_type", "school")
        .ilike("name", cleanName)
        .limit(1);

    if (duplicateUnderMunicipalityError) throw duplicateUnderMunicipalityError;

    const { data: duplicate, error: duplicateError } = await supabaseAdmin.rpc(
      "find_conflicting_customer",
      {
        p_org_type: "school",
        p_email: cleanEmail,
        p_name: cleanName,
        p_legal_identifier: cleanLegalIdentifier || null,
        p_address: cleanAddress,
      }
    );

    if (duplicateError) throw duplicateError;
    if (duplicateUnderMunicipality?.length || duplicate?.length) {
      return res.status(409).json({
        error: "Tuto školu už evidujeme. Kvůli zachování účtů a historie ji nepřipojujte podruhé; kontaktujte nás a existující školu bezpečně propojíme s obcí.",
      });
    }

    registrant = await resolveOrganizationRegistrant({
      supabaseAdmin,
      req,
      email: cleanEmail,
      fullName: cleanContactName,
      redirectTo: `${SITE_URL}/nastavit-heslo`,
    });

    const { data: school, error: schoolError } = await supabaseAdmin
      .from("organizations")
      .insert({
        name: cleanName,
        org_type: "school",
        status: "active",
        parent_organization_id: municipality.id,
        legal_identifier: cleanLegalIdentifier || null,
        registered_address: cleanAddress,
        contact_name: registrant.fullName,
        contact_email: registrant.email,
        contact_phone: cleanPhone,
      })
      .select("id, name, join_code")
      .single();

    if (schoolError) throw schoolError;
    schoolId = school.id;

    const { error: membershipError } = await supabaseAdmin
      .from("organization_members")
      .upsert(
        {
          organization_id: school.id,
          user_id: registrant.userId,
          role_in_org: "organization_admin",
          status: "active",
        },
        { onConflict: "user_id,organization_id" }
      );

    if (membershipError) throw membershipError;

    const { error: profileError } = await supabaseAdmin.from("profiles").upsert(
      {
        id: registrant.userId,
        email: registrant.email,
        full_name: registrant.fullName,
        is_active: true,
        must_set_password: registrant.isNewAccount,
        active_organization_id: school.id,
      },
      { onConflict: "id" }
    );

    if (profileError) throw profileError;

    await consumeMunicipalityInvite({
      supabaseAdmin,
      inviteId: invite.id,
      organizationId: school.id,
    });

    let emailSent = false;
    try {
      await sendRegistrationEmail({
        email: registrant.email,
        fullName: registrant.fullName,
        schoolName: school.name,
        setupUrl: registrant.setupUrl,
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
    if (schoolId) {
      await supabaseAdmin.from("organizations").delete().eq("id", schoolId);
    }
    await cleanupNewRegistrant(supabaseAdmin, registrant);

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
