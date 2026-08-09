import { createClient } from "@supabase/supabase-js";
import { consumeAuthenticatedRateLimit } from "../../../lib/server/authenticatedRateLimit";
import {
  getBearerToken,
  requirePlatformAdmin,
} from "../../../lib/server/platformAdminApi";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

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

function text(value, maxLength) {
  const clean = String(value || "").trim();
  if (clean.length > maxLength) throw new Error("VALIDATION_TEXT_TOO_LONG");
  return clean;
}

function safeRpcError(error) {
  const message = String(error?.message || "");

  if (error?.code === "23505" || /already exists/i.test(message)) {
    return {
      status: 409,
      message:
        "Tuto organizaci už evidujeme. Existující záznam nepřepisujte ani nezakládejte znovu.",
    };
  }
  if (/aktivní licenci obce/i.test(message)) {
    return { status: 409, message: "Obec nemá aktivní licenci." };
  }
  if (/obec nebyla nalezena/i.test(message)) {
    return { status: 404, message: "Obec nebyla nalezena." };
  }
  if (/platformový administrátor/i.test(message)) {
    return { status: 403, message: "Tuto akci může provést pouze platformový administrátor." };
  }
  if (
    /povinn|platn|znak|formát|ičo|telefon|školu|spolek|činnost/i.test(message)
  ) {
    return { status: 400, message: "Zkontrolujte údaje nové organizace." };
  }

  return { status: 500, message: "Organizaci se nepodařilo bezpečně založit." };
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const administrator = await requirePlatformAdmin(req, res, supabaseAdmin);
    if (!administrator) return;

    const token = getBearerToken(req);
    const municipalityId = String(req.body?.municipalityId || "").trim();
    const organizationType = String(req.body?.organizationType || "").trim();
    let name;
    let legalIdentifier;
    let address;
    let contactName;
    let contactEmail;
    let contactPhone;
    let activityCode;
    let activityCustomText;

    try {
      name = text(req.body?.name, 160);
      legalIdentifier = text(req.body?.legalIdentifier, 20);
      address = text(req.body?.address, 300);
      contactName = text(req.body?.contactName, 120);
      contactEmail = text(req.body?.contactEmail, 254).toLowerCase();
      contactPhone = text(req.body?.contactPhone, 32);
      activityCode = text(req.body?.activityCode, 64);
      activityCustomText = text(req.body?.activityCustomText, 500);
    } catch (_) {
      return res.status(400).json({ error: "Některý zadaný text je příliš dlouhý." });
    }

    if (!UUID_PATTERN.test(municipalityId)) {
      return res.status(400).json({ error: "ID obce nemá platný formát." });
    }
    if (!["school", "association"].includes(organizationType)) {
      return res.status(400).json({ error: "Vyberte školu nebo spolek." });
    }
    if (!name || name.length < 2 || !address || address.length < 2) {
      return res.status(400).json({ error: "Vyplňte název a adresu organizace." });
    }
    if (!contactName || contactName.length < 2) {
      return res.status(400).json({ error: "Vyplňte kontaktní osobu." });
    }
    if (!contactEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
      return res.status(400).json({ error: "Kontaktní e-mail nemá platný formát." });
    }
    if (legalIdentifier && !/^\d{8}$/.test(legalIdentifier.replace(/\s+/g, ""))) {
      return res.status(400).json({ error: "IČO musí obsahovat přesně 8 číslic." });
    }
    if (contactPhone && contactPhone.length < 6) {
      return res.status(400).json({ error: "Telefon musí mít alespoň 6 znaků." });
    }
    if (organizationType === "association" && !activityCode) {
      return res.status(400).json({ error: "Vyberte činnost spolku." });
    }
    if (
      organizationType === "association" &&
      activityCode === "jine" &&
      !activityCustomText
    ) {
      return res.status(400).json({ error: "Doplňte vlastní činnost spolku." });
    }

    const allowed = await consumeAuthenticatedRateLimit({
      supabaseAdmin,
      req,
      route: "admin-create-municipality-organization",
      userId: administrator.id,
      resourceId: municipalityId,
      limit: 10,
      windowSeconds: 60 * 60,
    });

    if (!allowed) {
      res.setHeader("Retry-After", "3600");
      return res.status(429).json({
        error: "Bylo provedeno příliš mnoho pokusů. Zkuste to prosím později.",
      });
    }

    const authenticatedClient = createAuthenticatedClient(token);
    const { data, error } = await authenticatedClient.rpc(
      "create_municipality_child_organization",
      {
        p_municipality_id: municipalityId,
        p_name: name,
        p_org_type: organizationType,
        p_legal_identifier: legalIdentifier?.replace(/\s+/g, "") || null,
        p_address: address,
        p_contact_name: contactName,
        p_contact_email: contactEmail,
        p_contact_phone: contactPhone || null,
        p_primary_activity_code:
          organizationType === "association" ? activityCode : null,
        p_primary_activity_custom_text:
          organizationType === "association" && activityCode === "jine"
            ? activityCustomText
            : null,
      }
    );

    if (error) {
      const safeError = safeRpcError(error);
      return res.status(safeError.status).json({ error: safeError.message });
    }

    const organization = data?.[0];
    if (!organization?.organization_id) {
      return res.status(500).json({
        error: "Organizace se nepodařilo bezpečně založit.",
      });
    }

    return res.status(201).json({ ok: true, organization });
  } catch (error) {
    console.error("create-municipality-organization error:", error);
    return res.status(500).json({
      error: "Organizaci se nepodařilo bezpečně založit.",
    });
  }
}
