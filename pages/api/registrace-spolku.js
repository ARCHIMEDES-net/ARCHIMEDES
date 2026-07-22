import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";
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
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const MAX_REGISTRATION_NUMBER_RETRIES = 3;
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.archimedeslive.com";

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

async function sendRegistrationEmail({ email, fullName, organizationName, setupUrl }) {
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
    subject: "ARCHIMEDES Live – spolek byl zaregistrován",
    text: `Dobrý den ${fullName},\n\nspolek ${organizationName} byl zaregistrován.\n${
      setupUrl ? `\nNastavte si heslo: ${setupUrl}\n` : ""
    }\nPřihlášení: ${SITE_URL}/login\n`,
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  let registrant = null;
  let spolekId = null;

  try {
    const {
      inviteToken,
      name,
      address,
      legalIdentifier,
      contactName,
      email,
      phone,
      activityCode,
      customText,
    } = req.body || {};

    const cleanName = String(name || "").trim();
    const cleanAddress = String(address || "").trim();
    const cleanLegalIdentifier = String(legalIdentifier || "").replace(/\s+/g, "").trim();
    const cleanContactName = String(contactName || "").trim();
    const cleanEmail = String(email || "").trim().toLowerCase();
    const cleanPhone = String(phone || "").trim();
    const cleanActivityCode = String(activityCode || "").trim();
    const cleanCustomText = String(customText || "").trim();

    if (!cleanName) {
      return res.status(400).json({ error: "Vyplňte prosím název spolku." });
    }

    if (!cleanAddress) {
      return res.status(400).json({ error: "Vyplňte prosím sídlo spolku." });
    }

    if (cleanLegalIdentifier && !/^\d{8}$/.test(cleanLegalIdentifier)) {
      return res.status(400).json({ error: "IČO musí obsahovat přesně 8 číslic." });
    }

    if (!cleanContactName) {
      return res.status(400).json({ error: "Vyplňte prosím kontaktní osobu." });
    }

    if (!isValidEmail(cleanEmail)) {
      return res.status(400).json({ error: "Zadejte prosím platný e-mail." });
    }

    if (!cleanPhone || cleanPhone.length < 6) {
      return res.status(400).json({ error: "Vyplňte prosím platný telefon." });
    }

    if (!cleanActivityCode) {
      return res.status(400).json({ error: "Vyberte prosím činnost spolku." });
    }

    if (cleanActivityCode === "jine" && !cleanCustomText) {
      return res.status(400).json({
        error: "U činnosti „Jiné“ prosím vyplňte, o jakou činnost jde.",
      });
    }

    const { data: activity, error: activityError } = await supabaseAdmin
      .from("activity_categories")
      .select("code, is_active, section")
      .eq("code", cleanActivityCode)
      .maybeSingle();

    if (activityError) {
      console.error("activity_categories lookup error:", activityError);
      return res.status(500).json({ error: "Nepodařilo se ověřit činnost." });
    }

    // section='spolky' omezuje výběr na původní číselník (17 položek) —
    // od Kroku 3 activity_categories obsahuje i školní/tematické/klubové
    // položky určené pro osobní preference uživatele, ne pro vlastní
    // činnost spolku.
    if (!activity || !activity.is_active || activity.section !== "spolky") {
      return res.status(400).json({ error: "Neplatná činnost spolku." });
    }

    const { invite, municipality: obec } = await resolveMunicipalityInvite({
      supabaseAdmin,
      rawToken: inviteToken,
      organizationType: "association",
      email: cleanEmail,
    });

    const { data: duplicateUnderMunicipality, error: duplicateUnderMunicipalityError } =
      await supabaseAdmin
        .from("organizations")
        .select("id")
        .eq("parent_organization_id", obec.id)
        .in("org_type", ["association", "spolek"])
        .ilike("name", cleanName)
        .limit(1);

    if (duplicateUnderMunicipalityError) throw duplicateUnderMunicipalityError;

    const { data: duplicate, error: duplicateError } = await supabaseAdmin.rpc(
      "find_conflicting_customer",
      {
        p_org_type: "association",
        p_email: cleanEmail,
        p_name: cleanName,
        p_legal_identifier: cleanLegalIdentifier || null,
        p_address: cleanAddress,
      }
    );

    if (duplicateError) throw duplicateError;
    if (duplicateUnderMunicipality?.length || duplicate?.length) {
      return res.status(409).json({
        error: "Tento spolek už evidujeme. Kvůli zachování účtů a historie ho neregistrujte podruhé; kontaktujte nás a existující spolek bezpečně propojíme s obcí.",
      });
    }

    registrant = await resolveOrganizationRegistrant({
      supabaseAdmin,
      req,
      email: cleanEmail,
      fullName: cleanContactName,
      redirectTo: `${SITE_URL}/nastavit-heslo`,
    });

    const orgInsertPayload = {
      name: cleanName,
      org_type: "association",
      status: "active",
      parent_organization_id: obec.id,
      legal_identifier: cleanLegalIdentifier || null,
      registered_address: cleanAddress,
      primary_activity_code: cleanActivityCode,
      primary_activity_custom_text: cleanActivityCode === "jine" ? cleanCustomText : null,
      contact_name: registrant.fullName,
      contact_email: registrant.email,
      contact_phone: cleanPhone,
    };

    let spolek = null;
    let lastInsertError = null;

    for (let attempt = 0; attempt < MAX_REGISTRATION_NUMBER_RETRIES; attempt += 1) {
      const { data: insertedOrg, error: insertError } = await supabaseAdmin
        .from("organizations")
        .insert([orgInsertPayload])
        .select("id, name, registration_number")
        .single();

      if (!insertError) {
        spolek = insertedOrg;
        lastInsertError = null;
        break;
      }

      lastInsertError = insertError;

      // Souběžná registrace ve stejné obci+činnosti může kolidovat na
      // UNIQUE(registration_number) — zkusíme insert zopakovat, trigger
      // dopočítá pořadí znovu s aktuálním stavem.
      if (insertError.code !== "23505") {
        break;
      }
    }

    if (!spolek) {
      console.error("Spolek creation error:", lastInsertError);
      return res.status(500).json({ error: "Nepodařilo se zaregistrovat spolek." });
    }
    spolekId = spolek.id;

    const { error: activityLinkError } = await supabaseAdmin
      .from("organization_activities")
      .insert([
        {
          organization_id: spolek.id,
          activity_code: cleanActivityCode,
          custom_text: cleanActivityCode === "jine" ? cleanCustomText : null,
        },
      ]);

    if (activityLinkError) {
      throw activityLinkError;
    }

    const { error: membershipError } = await supabaseAdmin
      .from("organization_members")
      .upsert(
        {
          organization_id: spolek.id,
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
        active_organization_id: spolek.id,
      },
      { onConflict: "id" }
    );

    if (profileError) throw profileError;

    await consumeMunicipalityInvite({
      supabaseAdmin,
      inviteId: invite.id,
      organizationId: spolek.id,
    });

    let emailSent = false;
    try {
      await sendRegistrationEmail({
        email: registrant.email,
        fullName: registrant.fullName,
        organizationName: spolek.name,
        setupUrl: registrant.setupUrl,
      });
      emailSent = true;
    } catch (emailError) {
      console.error("association registration email error:", emailError);
    }

    return res.status(200).json({
      ok: true,
      organization: spolek,
      existingAccount: !registrant.isNewAccount,
      emailSent,
    });
  } catch (err) {
    if (spolekId) {
      await supabaseAdmin.from("organizations").delete().eq("id", spolekId);
    }
    await cleanupNewRegistrant(supabaseAdmin, registrant);
    console.error("registrace-spolku API error:", err);
    const expectedError =
      err instanceof RegistrantError ||
      err instanceof MunicipalityInviteError;
    const status = expectedError ? err.status : 500;
    return res.status(status).json({
      error: expectedError
        ? err.message
        : "Registraci spolku se nepodařilo dokončit.",
    });
  }
}
