import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const MAX_REGISTRATION_NUMBER_RETRIES = 3;

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      registrationNumber,
      name,
      contactName,
      email,
      phone,
      activityCode,
      customText,
    } = req.body || {};

    const cleanRegistrationNumber = String(registrationNumber || "").trim();
    const cleanName = String(name || "").trim();
    const cleanContactName = String(contactName || "").trim();
    const cleanEmail = String(email || "").trim().toLowerCase();
    const cleanPhone = String(phone || "").trim();
    const cleanActivityCode = String(activityCode || "").trim();
    const cleanCustomText = String(customText || "").trim();

    if (!cleanRegistrationNumber) {
      return res.status(400).json({ error: "Vyplňte prosím registrační číslo obce." });
    }

    if (!cleanName) {
      return res.status(400).json({ error: "Vyplňte prosím název spolku." });
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
    // položky určené pro osobní odběr upozornění (/pridat-se-k-organizaci),
    // ne pro vlastní činnost spolku.
    if (!activity || !activity.is_active || activity.section !== "spolky") {
      return res.status(400).json({ error: "Neplatná činnost spolku." });
    }

    const { data: obec, error: obecError } = await supabaseAdmin
      .from("organizations")
      .select("id, license_status")
      .eq("registration_number", cleanRegistrationNumber)
      .eq("org_type", "obec")
      .maybeSingle();

    if (obecError) {
      console.error("obec lookup error:", obecError);
      return res.status(500).json({ error: "Nepodařilo se ověřit registrační číslo obce." });
    }

    if (!obec || obec.license_status !== "active") {
      return res.status(404).json({
        error: "Obec s tímto registračním číslem neexistuje nebo zatím není aktivní.",
      });
    }

    const orgInsertPayload = {
      name: cleanName,
      org_type: "spolek",
      status: "active",
      parent_organization_id: obec.id,
      primary_activity_code: cleanActivityCode,
      primary_activity_custom_text: cleanActivityCode === "jine" ? cleanCustomText : null,
      contact_name: cleanContactName,
      contact_email: cleanEmail,
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
      console.error("organization_activities insert error:", activityLinkError);
    }

    return res.status(200).json({
      ok: true,
      organization: spolek,
    });
  } catch (err) {
    console.error("registrace-spolku API error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
