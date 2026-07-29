import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";
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
      return res.status(200).json({ ok: true, message: "Poptávka byla odeslána." });
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

    const smtpPort = Number(process.env.SMTP_PORT);
    if (
      !process.env.SMTP_HOST ||
      !smtpPort ||
      !process.env.SMTP_USER ||
      !process.env.SMTP_PASS ||
      !process.env.MAIL_FROM ||
      !process.env.MAIL_TO
    ) {
      console.error("SMTP config missing");
      return res.status(500).json({ error: "E-mailová služba není správně nastavena." });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 20_000,
    });

    await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: process.env.MAIL_TO,
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
    });

    return res.status(200).json({ ok: true, message: "Poptávka byla odeslána." });
  } catch (err) {
    console.error("API error:", err);
    return res.status(500).json({ error: "Serverová chyba." });
  }
}
