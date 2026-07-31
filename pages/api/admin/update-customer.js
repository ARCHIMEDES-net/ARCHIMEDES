import { createClient } from "@supabase/supabase-js";
import { requirePlatformAdmin } from "../../../lib/server/platformAdminApi";
import { consumeAuthenticatedRateLimit } from "../../../lib/server/authenticatedRateLimit";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const LICENSE_PLANS = ["paid_monthly", "paid_annual", "classroom_free_12m"];
const BILLING_STATUSES = ["pending", "paid", "not_applicable"];
const CONTRACT_STATUSES = ["pending", "accepted"];

function cleanText(value, maxLength) {
  const clean = String(value || "").trim();
  if (clean.length > maxLength) throw new Error("VALIDATION_TEXT_TOO_LONG");
  return clean || null;
}

function parseDate(value, required = false, endOfDay = false) {
  const clean = String(value || "").trim();
  if (!clean) {
    if (required) throw new Error("VALIDATION_END_DATE_REQUIRED");
    return null;
  }

  const date = new Date(
    /^\d{4}-\d{2}-\d{2}$/.test(clean)
      ? `${clean}T${endOfDay ? "23:59:59.999" : "00:00:00.000"}Z`
      : clean
  );
  if (Number.isNaN(date.getTime())) throw new Error("VALIDATION_DATE_INVALID");
  return date.toISOString();
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const admin = await requirePlatformAdmin(req, res, supabaseAdmin);
    if (!admin) return;

    const organizationId = String(req.body?.organizationId || "").trim();
    if (!UUID_PATTERN.test(organizationId)) {
      return res.status(400).json({ error: "ID organizace nemá platný formát." });
    }

    const allowed = await consumeAuthenticatedRateLimit({
      supabaseAdmin,
      req,
      route: "admin-update-customer",
      userId: admin.id,
      resourceId: organizationId,
      limit: 20,
      windowSeconds: 10 * 60,
    });

    if (!allowed) {
      res.setHeader("Retry-After", "600");
      return res.status(429).json({ error: "Příliš mnoho změn. Zkuste to prosím později." });
    }

    const { data: organization, error: lookupError } = await supabaseAdmin
      .from("organizations")
      .select("id, org_type, parent_organization_id")
      .eq("id", organizationId)
      .maybeSingle();

    if (lookupError) throw lookupError;
    if (!organization || organization.parent_organization_id) {
      return res.status(404).json({ error: "Samostatný zákazník nebyl nalezen." });
    }

    let contactName;
    let contactEmail;
    let contactPhone;
    let registeredAddress;
    let licenseStartedAt;
    let licenseValidUntil;

    try {
      contactName = cleanText(req.body?.contactName, 120);
      contactEmail = cleanText(req.body?.contactEmail, 254)?.toLowerCase() || null;
      contactPhone = cleanText(req.body?.contactPhone, 60);
      registeredAddress = cleanText(req.body?.registeredAddress, 500);
    } catch (_) {
      return res.status(400).json({ error: "Některý zadaný text je příliš dlouhý." });
    }

    const licensePlan = String(req.body?.licensePlan || "").trim();
    const billingStatus = String(req.body?.billingStatus || "").trim();
    const contractStatus = String(req.body?.contractStatus || "").trim();

    if (contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
      return res.status(400).json({ error: "E-mail nemá platný formát." });
    }
    if (!LICENSE_PLANS.includes(licensePlan)) {
      return res.status(400).json({ error: "Vyberte platnou variantu licence." });
    }
    if (!BILLING_STATUSES.includes(billingStatus)) {
      return res.status(400).json({ error: "Vyberte platný stav fakturace." });
    }
    if (!CONTRACT_STATUSES.includes(contractStatus)) {
      return res.status(400).json({ error: "Vyberte platný stav smlouvy." });
    }
    if (licensePlan === "classroom_free_12m" && billingStatus !== "not_applicable") {
      return res.status(400).json({ error: "Bezplatná licence musí být bez úhrady." });
    }

    try {
      const needsEnd = ["paid_annual", "classroom_free_12m"].includes(licensePlan);
      licenseStartedAt = parseDate(req.body?.licenseStartedAt) || new Date().toISOString();
      licenseValidUntil = parseDate(req.body?.licenseValidUntil, needsEnd, true);
    } catch (validationError) {
      const message =
        validationError?.message === "VALIDATION_END_DATE_REQUIRED"
          ? "Vyplňte datum konce licence."
          : "Datum licence není platné.";
      return res.status(400).json({ error: message });
    }

    if (licenseValidUntil && new Date(licenseValidUntil) <= new Date(licenseStartedAt)) {
      return res.status(400).json({ error: "Konec licence musí být později než začátek." });
    }

    const { data: updated, error: updateError } = await supabaseAdmin
      .from("organizations")
      .update({
        contact_name: contactName,
        contact_email: contactEmail,
        contact_phone: contactPhone,
        registered_address: registeredAddress,
        license_plan: licensePlan,
        license_started_at: licenseStartedAt,
        license_valid_until: licenseValidUntil,
        billing_status: billingStatus,
        contract_status: contractStatus,
        license_status: "active",
        status: "active",
      })
      .eq("id", organizationId)
      .select("*")
      .single();

    if (updateError) throw updateError;

    return res.status(200).json({ ok: true, organization: updated });
  } catch (error) {
    console.error("update-customer error:", error);
    return res.status(500).json({ error: "Změny se nepodařilo uložit." });
  }
}
