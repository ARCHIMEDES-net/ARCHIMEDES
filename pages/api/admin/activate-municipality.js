import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";
import { consumeAuthenticatedRateLimit } from "../../../lib/server/authenticatedRateLimit";
import { requirePlatformAdmin } from "../../../lib/server/platformAdminApi";
import { getServerSiteUrl } from "../../../lib/server/siteUrl";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

const LICENSE_LABELS = {
  paid_monthly: "Měsíční licence",
  paid_annual: "Roční licence",
  classroom_free_12m: "12 měsíců zdarma pro obec s učebnou ARCHIMEDES",
};
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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

function parseDate(value, required = false, endOfDay = false) {
  const clean = String(value || "").trim();
  if (!clean) {
    if (required) throw new Error("Vyplňte datum konce licence.");
    return null;
  }

  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(clean);
  const date = new Date(
    dateOnly
      ? `${clean}T${endOfDay ? "23:59:59.999" : "00:00:00.000"}Z`
      : clean
  );
  if (Number.isNaN(date.getTime())) throw new Error("Datum licence není platné.");
  return date.toISOString();
}

async function sendOnboardingEmail({
  email,
  fullName,
  organizationName,
  organizationType,
  registrationNumber,
  licensePlan,
  licenseValidUntil,
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

  const validUntilText = licenseValidUntil
    ? new Date(licenseValidUntil).toLocaleDateString("cs-CZ")
    : "do ukončení měsíční licence";
  const isMunicipality = ["municipality", "obec"].includes(organizationType);
  const nextStepUrl = isMunicipality
    ? `${siteUrl}/portal/organizace-obce`
    : organizationType === "school"
      ? `${siteUrl}/portal/uzivatele`
      : `${siteUrl}/portal/muj-profil`;
  const registrationLine = isMunicipality
    ? `Registrační číslo obce: ${registrationNumber || "bude doplněno v portálu"}\n`
    : "";
  const organizationInstruction = isMunicipality
    ? "\nRegistrační číslo identifikuje program obce. Pro bezpečné zapojení školy nebo spolku vytvořte v portálu jednorázovou pozvánku.\n"
    : "";

  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to: email,
    subject: "ARCHIMEDES Live – přístup byl aktivován",
    text: `Dobrý den ${fullName},

přístup pro ${organizationName} byl aktivován.

Varianta: ${LICENSE_LABELS[licensePlan] || licensePlan}
Platnost: ${validUntilText}
${registrationLine}
Přihlášení: ${siteUrl}/login
Další nastavení: ${nextStepUrl}
${organizationInstruction}
Tým ARCHIMEDES Live`,
  });
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  let invitedUserId = null;
  let activationCommitted = false;

  try {
    const admin = await requirePlatformAdmin(req, res, supabaseAdmin);
    if (!admin) return;
    const siteUrl = getServerSiteUrl();

    const organizationId = String(req.body?.organizationId || "").trim();
    const licensePlan = String(req.body?.licensePlan || "").trim();
    const contractStatus = String(req.body?.contractStatus || "").trim();
    const billingStatus = String(req.body?.billingStatus || "").trim();
    const classroomEligibilityVerified =
      req.body?.classroomEligibilityVerified === true;

    if (!UUID_PATTERN.test(organizationId)) {
      return res.status(400).json({ error: "ID organizace nemá platný formát." });
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
    if (licensePlan === "classroom_free_12m" && !classroomEligibilityVerified) {
      return res.status(400).json({
        error: "Před bezplatnou aktivací potvrďte ověření učebny ARCHIMEDES.",
      });
    }

    let licenseStartedAt;
    let licenseValidUntil;
    try {
      licenseStartedAt = parseDate(req.body?.licenseStartedAt) || new Date().toISOString();
      const needsEndDate = ["paid_annual", "classroom_free_12m"].includes(licensePlan);
      licenseValidUntil = parseDate(
        req.body?.licenseValidUntil,
        needsEndDate,
        true
      );
    } catch (validationError) {
      return res.status(400).json({ error: validationError.message });
    }

    if (licenseValidUntil && new Date(licenseValidUntil) <= new Date(licenseStartedAt)) {
      return res.status(400).json({
        error: "Datum konce licence musí být později než datum začátku.",
      });
    }

    const allowed = await consumeAuthenticatedRateLimit({
      supabaseAdmin,
      req,
      route: "admin-activate-customer",
      userId: admin.id,
      resourceId: organizationId,
      limit: 10,
      windowSeconds: 10 * 60,
    });

    if (!allowed) {
      res.setHeader("Retry-After", "600");
      return res.status(429).json({
        error: "Aktivace byla spuštěna příliš mnohokrát. Zkuste to prosím později.",
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

    if (
      !contactEmail ||
      contactEmail.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail) ||
      contactName.length < 2 ||
      contactName.length > 120
    ) {
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
          redirectTo: `${siteUrl}/nastavit-heslo`,
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
        p_classroom_eligibility_verified: classroomEligibilityVerified,
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
        organizationType: customer.org_type,
        registrationNumber:
          activated?.registration_number || customer.registration_number,
        licensePlan,
        licenseValidUntil,
        siteUrl,
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
    return res.status(500).json({ error: "Aktivaci zákazníka se nepodařilo dokončit." });
  }
}
