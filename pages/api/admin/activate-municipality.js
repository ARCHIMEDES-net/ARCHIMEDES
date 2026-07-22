import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";
import { requirePlatformAdmin } from "../../../lib/server/platformAdminApi";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.archimedeslive.com";

const LICENSE_LABELS = {
  paid_monthly: "Měsíční licence",
  paid_annual: "Roční licence",
  classroom_free_12m: "12 měsíců zdarma pro obec s učebnou ARCHIMEDES",
};

function createAuthenticatedClient(token) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: { persistSession: false },
      global: { headers: { Authorization: `Bearer ${token}` } },
    }
  );
}

function parseDate(value, required = false) {
  const clean = String(value || "").trim();
  if (!clean) {
    if (required) throw new Error("Vyplňte datum konce licence.");
    return null;
  }

  const date = new Date(clean);
  if (Number.isNaN(date.getTime())) throw new Error("Datum licence není platné.");
  return date.toISOString();
}

async function sendOnboardingEmail({
  email,
  fullName,
  organizationName,
  registrationNumber,
  licensePlan,
  licenseValidUntil,
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
  });

  const validUntilText = licenseValidUntil
    ? new Date(licenseValidUntil).toLocaleDateString("cs-CZ")
    : "do ukončení měsíční licence";

  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to: email,
    subject: "ARCHIMEDES Live – přístup obce byl aktivován",
    text: `Dobrý den ${fullName},

přístup pro ${organizationName} byl aktivován.

Varianta: ${LICENSE_LABELS[licensePlan] || licensePlan}
Platnost: ${validUntilText}
Registrační číslo obce: ${registrationNumber || "bude doplněno v portálu"}

Přihlášení: ${SITE_URL}/login
Zapojení školy nebo spolku: ${SITE_URL}/portal/organizace-obce

Registrační číslo identifikuje program obce. Pro bezpečné zapojení školy nebo spolku vytvořte v portálu jednorázovou pozvánku.

Tým ARCHIMEDES Live`,
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  let invitedUserId = null;
  let activationCommitted = false;

  try {
    const admin = await requirePlatformAdmin(req, res, supabaseAdmin);
    if (!admin) return;

    const organizationId = String(req.body?.organizationId || "").trim();
    const licensePlan = String(req.body?.licensePlan || "").trim();
    const contractStatus = String(req.body?.contractStatus || "").trim();
    const billingStatus = String(req.body?.billingStatus || "").trim();

    if (!organizationId) {
      return res.status(400).json({ error: "Chybí ID organizace." });
    }
    if (!LICENSE_LABELS[licensePlan]) {
      return res.status(400).json({ error: "Vyberte variantu licence." });
    }
    if (contractStatus !== "accepted") {
      return res.status(400).json({ error: "Před aktivací potvrďte uzavření smlouvy." });
    }
    if (!["pending", "paid", "not_applicable"].includes(billingStatus)) {
      return res.status(400).json({ error: "Vyberte stav fakturace." });
    }
    if (licensePlan === "classroom_free_12m" && billingStatus !== "not_applicable") {
      return res.status(400).json({
        error: "Bezplatná licence musí mít stav fakturace „Bez úhrady“.",
      });
    }

    const licenseStartedAt = parseDate(req.body?.licenseStartedAt) || new Date().toISOString();
    const needsEndDate = ["paid_annual", "classroom_free_12m"].includes(licensePlan);
    const licenseValidUntil = parseDate(req.body?.licenseValidUntil, needsEndDate);

    if (licenseValidUntil && new Date(licenseValidUntil) <= new Date(licenseStartedAt)) {
      return res.status(400).json({
        error: "Datum konce licence musí být později než datum začátku.",
      });
    }

    const { data: customer, error: customerError } = await supabaseAdmin
      .from("organizations")
      .select(
        "id, name, org_type, status, license_status, parent_organization_id, contact_name, contact_email, registration_number"
      )
      .eq("id", organizationId)
      .maybeSingle();

    if (customerError) throw customerError;
    if (
      !customer ||
      !["municipality", "obec", "school", "association", "spolek"].includes(customer.org_type) ||
      customer.parent_organization_id
    ) {
      return res.status(404).json({ error: "Samostatný zákazník nebyl nalezen." });
    }

    const contactEmail = String(customer.contact_email || "").trim().toLowerCase();
    const contactName = String(customer.contact_name || "").trim();

    if (!contactEmail || !contactName) {
      return res.status(409).json({
        error: "Zákazník nemá kompletní kontaktní osobu a nelze mu bezpečně vytvořit správce.",
      });
    }

    const { data: profiles, error: profileLookupError } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .ilike("email", contactEmail)
      .limit(1);

    if (profileLookupError) throw profileLookupError;

    let userId = profiles?.[0]?.id || null;
    let invitationSent = false;

    if (!userId) {
      const { data: invited, error: inviteError } =
        await supabaseAdmin.auth.admin.inviteUserByEmail(contactEmail, {
          redirectTo: `${SITE_URL}/nastavit-heslo`,
          data: { full_name: contactName },
        });

      if (inviteError) throw inviteError;
      userId = invited?.user?.id || null;
      invitedUserId = userId;
      invitationSent = true;
    }

    if (!userId) throw new Error("Nepodařilo se určit účet správce organizace.");

    const token = String(req.headers.authorization || "").match(/^Bearer\s+(.+)$/i)?.[1];
    if (!token) return res.status(401).json({ error: "Chybí autorizace uživatele." });

    const authenticatedClient = createAuthenticatedClient(token);
    const { data: activationRows, error: activationError } = await authenticatedClient.rpc(
      "activate_customer_with_admin_v2",
      {
        p_organization_id: customer.id,
        p_user_id: userId,
        p_email: contactEmail,
        p_full_name: contactName,
        p_license_plan: licensePlan,
        p_license_started_at: licenseStartedAt,
        p_license_valid_until: licenseValidUntil,
        p_contract_status: contractStatus,
        p_billing_status: billingStatus,
        p_must_set_password: invitationSent,
      }
    );

    if (activationError) throw activationError;
    activationCommitted = true;

    const activated = activationRows?.[0];
    let onboardingEmailSent = false;

    try {
      await sendOnboardingEmail({
        email: contactEmail,
        fullName: contactName,
        organizationName: customer.name,
        registrationNumber:
          activated?.registration_number || customer.registration_number,
        licensePlan,
        licenseValidUntil,
      });
      onboardingEmailSent = true;
    } catch (emailError) {
      console.error("customer onboarding email error:", emailError);
    }

    return res.status(200).json({
      ok: true,
      organizationId: customer.id,
      registrationNumber:
        activated?.registration_number || customer.registration_number,
      organizationType: customer.org_type,
      licensePlan,
      licenseValidUntil,
      invitationSent,
      onboardingEmailSent,
    });
  } catch (error) {
    if (invitedUserId && !activationCommitted) {
      try {
        await supabaseAdmin
          .from("organization_members")
          .delete()
          .eq("user_id", invitedUserId);
        await supabaseAdmin.from("profiles").delete().eq("id", invitedUserId);
      } catch (_) {
        // Zachováme původní chybu aktivace.
      }
      try {
        await supabaseAdmin.auth.admin.deleteUser(invitedUserId);
      } catch (_) {
        // Zachováme původní chybu aktivace.
      }
    }
    console.error("activate-customer error:", error);
    return res.status(500).json({
      error: error?.message || "Aktivaci zákazníka se nepodařilo dokončit.",
    });
  }
}
