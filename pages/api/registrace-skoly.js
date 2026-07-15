import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";
import {
  cleanupNewRegistrant,
  RegistrantError,
  resolveOrganizationRegistrant,
} from "../../lib/server/organizationRegistrant";

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
    const { registrationNumber, name, contactName, email, phone } = req.body || {};
    const cleanRegistrationNumber = String(registrationNumber || "").trim();
    const cleanName = String(name || "").trim();
    const cleanContactName = String(contactName || "").trim();
    const cleanEmail = String(email || "").trim().toLowerCase();
    const cleanPhone = String(phone || "").trim();

    if (!cleanRegistrationNumber) {
      return res.status(400).json({ error: "Vyplňte registrační číslo obce." });
    }
    if (!cleanName) return res.status(400).json({ error: "Vyplňte název školy." });
    if (cleanContactName.length < 2) {
      return res.status(400).json({ error: "Vyplňte kontaktní osobu." });
    }
    if (!isValidEmail(cleanEmail)) {
      return res.status(400).json({ error: "Zadejte platný e-mail." });
    }
    if (cleanPhone.length < 6) {
      return res.status(400).json({ error: "Vyplňte platný telefon." });
    }

    const { data: municipality, error: municipalityError } = await supabaseAdmin
      .from("organizations")
      .select("id, status, license_status")
      .eq("registration_number", cleanRegistrationNumber)
      .eq("org_type", "obec")
      .maybeSingle();

    if (municipalityError) throw municipalityError;
    if (
      !municipality ||
      municipality.status !== "active" ||
      municipality.license_status !== "active"
    ) {
      return res.status(404).json({
        error: "Obec s tímto registračním číslem neexistuje nebo není aktivní.",
      });
    }

    const { data: duplicate, error: duplicateError } = await supabaseAdmin
      .from("organizations")
      .select("id")
      .eq("parent_organization_id", municipality.id)
      .eq("org_type", "school")
      .ilike("name", cleanName)
      .limit(1);

    if (duplicateError) throw duplicateError;
    if (duplicate?.length) {
      return res.status(409).json({ error: "Tato škola už je pod obcí zaregistrovaná." });
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
    const status = error instanceof RegistrantError ? error.status : 500;
    return res.status(status).json({
      error:
        error instanceof RegistrantError
          ? error.message
          : "Registraci školy se nepodařilo dokončit.",
    });
  }
}
