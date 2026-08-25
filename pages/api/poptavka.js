import { createClient } from "@supabase/supabase-js";
import { sendRegistrationEmail } from "../../lib/server/registrationEmailProvider";
import { consumePublicRateLimit } from "../../lib/server/publicRateLimit";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

function within(value, max) {
  return String(value || "").trim().slice(0, max);
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const allowed = await consumePublicRateLimit({
      supabaseAdmin: supabase,
      req,
      route: "public-inquiry",
      limit: 10,
      windowSeconds: 60 * 60,
    });
    if (!allowed) {
      res.setHeader("Retry-After", "3600");
      return res.status(429).json({
        error: "Bylo odesláno příliš mnoho poptávek. Zkuste to prosím později.",
      });
    }

    const {
      selectedOption,
      selectedLabel,
      name,
      place,
      email,
      phone,
      message,
      company,
    } = req.body || {};

    if (company) {
      return res.status(200).json({
      ok: true,
      emailSent,
      message: emailSent
        ? "Poptávka byla odeslána."
        : "Poptávka byla uložena. Ozveme se vám i bez e-mailového oznámení.",
    });
    }

    const cleanSelectedOption = within(selectedOption, 80);
    const cleanSelectedLabel = within(selectedLabel, 120);
    const cleanName = within(name, 120);
    const cleanPlace = within(place, 180);
    const cleanEmail = within(email, 254).toLowerCase();
    const cleanPhone = within(phone, 40);
    const cleanMessage = within(message, 4000);

    if (!cleanSelectedOption) {
      return res.status(400).json({ error: "Vyberte typ poptávky." });
    }
    if (cleanName.length < 2) {
      return res.status(400).json({ error: "Vyplňte jméno." });
    }
    if (!isValidEmail(cleanEmail)) {
      return res.status(400).json({ error: "Vyplňte platný email." });
    }

    const createdAt = new Date().toISOString();
    const note = [
      `Zájem: ${cleanSelectedLabel || cleanSelectedOption}`,
      "",
      "Zpráva:",
      cleanMessage || "-",
      "",
      "Zdroj: web archimedeslive.com/poptavka",
    ].join("\n");

    const { data, error } = await supabase
      .from("leads")
      .insert([
        {
          created_at: createdAt,
          type: cleanSelectedOption,
          organization: cleanPlace || null,
          contact_name: cleanName,
          email: cleanEmail,
          phone: cleanPhone || null,
          note,
          status: "new",
        },
      ])
      .select("id")
      .single();

    if (error) {
      console.error("DB error:", error);
      return res.status(500).json({ error: "Chyba při ukládání poptávky." });
    }

    const inquiryRecipient = String(process.env.MAIL_TO || "").trim();
    let emailSent = false;

    if (!inquiryRecipient) {
      console.error("public inquiry recipient missing");
    } else {
      try {
        const receipt = await sendRegistrationEmail({
          to: inquiryRecipient,
          replyTo: cleanEmail,
          subject: "Nová poptávka ARCHIMEDES Live",
          text: [
            "Přišla nová poptávka z webu ARCHIMEDES Live",
            "",
            `ID: ${data?.id || "-"}`,
            `Typ zájmu: ${cleanSelectedLabel || cleanSelectedOption}`,
            `Jméno: ${cleanName}`,
            `Město / obec / škola: ${cleanPlace || "-"}`,
            `Email: ${cleanEmail}`,
            `Telefon: ${cleanPhone || "-"}`,
            "",
            "Zpráva:",
            cleanMessage || "-",
            "",
            `Datum: ${createdAt}`,
          ].join("\n"),
          idempotencyKey: `public-inquiry:${data.id}:team`,
        });
        emailSent = true;
        console.info("public inquiry delivered to provider", {
          leadId: data.id,
          provider: receipt.provider,
          messageId: receipt.messageId,
        });
      } catch (emailError) {
        console.error("public inquiry email failed", {
          leadId: data.id,
          code: emailError?.code || "unknown",
          deliveryOutcome: emailError?.deliveryOutcome || "unknown",
        });
      }
    }

    return res.status(200).json({ ok: true, message: "Poptávka byla odeslána." });
  } catch (err) {
    console.error("API error:", err);
    return res.status(500).json({ error: "Serverová chyba." });
  }
}
