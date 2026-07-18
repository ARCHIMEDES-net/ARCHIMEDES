import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const ORGANIZATION_LABELS = {
  school: "Škola",
  municipality: "Obec nebo město",
  other: "Jiná organizace",
};

const VARIANT_LABELS = {
  optimal: "OPTIMAL",
  "optimal-plus": "OPTIMAL+",
  premium: "PREMIUM",
};

const TIMEFRAME_LABELS = {
  "this-year": "Ještě letos",
  "next-year": "V příštím roce",
  later: "Později",
};

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const body = req.body || {};
    if (body.company) return res.status(200).json({ ok: true });

    const organizationType = String(body.organizationType || "").trim();
    const organization = String(body.organization || "").trim();
    const place = String(body.place || "").trim();
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const phone = String(body.phone || "").trim();
    const variant = String(body.variant || "").trim();
    const timeframe = String(body.timeframe || "").trim();
    const message = String(body.message || "").trim();

    if (!ORGANIZATION_LABELS[organizationType]) return res.status(400).json({ error: "Vyberte, za koho poptáváte." });
    if (organization.length < 2) return res.status(400).json({ error: "Vyplňte název školy nebo organizace." });
    if (place.length < 2) return res.status(400).json({ error: "Vyplňte místo plánované realizace." });
    if (name.length < 2) return res.status(400).json({ error: "Vyplňte jméno a příjmení." });
    if (!isValidEmail(email)) return res.status(400).json({ error: "Vyplňte platný e-mail." });
    if (phone.length < 6) return res.status(400).json({ error: "Vyplňte platný telefon." });

    const createdAt = new Date().toISOString();
    const variantLabel = VARIANT_LABELS[variant] || "Zatím nevybrána";
    const timeframeLabel = TIMEFRAME_LABELS[timeframe] || "Zatím neurčen";
    const note = [
      "Poptávka venkovní učebny ARCHIMEDES",
      `Poptávající: ${ORGANIZATION_LABELS[organizationType]}`,
      `Místo realizace: ${place}`,
      `Varianta: ${variantLabel}`,
      `Termín: ${timeframeLabel}`,
      "",
      "Zpráva:",
      message || "-",
      "",
      "Zdroj: archimedeslive.com/poptavka-ucebny",
    ].join("\n");

    const { data, error } = await supabase
      .from("leads")
      .insert([{
        created_at: createdAt,
        type: "classroom",
        organization,
        contact_name: name,
        email,
        phone,
        note,
        status: "new",
      }])
      .select("id")
      .single();

    if (error) {
      console.error("classroom inquiry DB error:", error);
      return res.status(500).json({ error: "Poptávku se nepodařilo uložit." });
    }

    const smtpPort = Number(process.env.SMTP_PORT);
    if (!process.env.SMTP_HOST || !smtpPort || !process.env.SMTP_USER || !process.env.SMTP_PASS || !process.env.MAIL_FROM) {
      console.error("classroom inquiry SMTP config missing");
      return res.status(500).json({ error: "Poptávka je uložená, ale oznámení se nepodařilo odeslat. Ozveme se vám i tak." });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: smtpPort,
      secure: true,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });

    const inquiryRecipient = "antonin.koplik@archimedeslive.com";

    await Promise.all([
      transporter.sendMail({
        from: process.env.MAIL_FROM,
        to: inquiryRecipient,
        replyTo: email,
        subject: `Poptávka venkovní učebny – ${organization}`,
        text: [
          "Nová poptávka venkovní učebny ARCHIMEDES",
          "",
          `ID: ${data?.id || "-"}`,
          `Poptávající: ${ORGANIZATION_LABELS[organizationType]}`,
          `Organizace: ${organization}`,
          `Místo realizace: ${place}`,
          `Kontaktní osoba: ${name}`,
          `E-mail: ${email}`,
          `Telefon: ${phone}`,
          `Varianta: ${variantLabel}`,
          `Termín: ${timeframeLabel}`,
          "",
          "Zpráva:",
          message || "-",
          "",
          `Datum: ${createdAt}`,
        ].join("\n"),
      }),
      transporter.sendMail({
        from: process.env.MAIL_FROM,
        to: email,
        replyTo: inquiryRecipient,
        subject: "Potvrzení přijetí poptávky venkovní učebny ARCHIMEDES",
        text: [
          `Dobrý den${name ? `, ${name}` : ""},`,
          "",
          "děkujeme za váš zájem o venkovní učebnu ARCHIMEDES.",
          "Vaši nezávaznou poptávku jsme v pořádku přijali a ozveme se vám s dalším postupem.",
          "",
          `Organizace: ${organization}`,
          `Místo realizace: ${place}`,
          `Preferovaná varianta: ${variantLabel}`,
          `Předpokládaný termín: ${timeframeLabel}`,
          "",
          "S pozdravem",
          "tým ARCHIMEDES",
        ].join("\n"),
      }),
    ]);

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("classroom inquiry API error:", error);
    return res.status(500).json({ error: "Poptávku se nepodařilo odeslat." });
  }
}
