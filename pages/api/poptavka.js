import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
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

    // Honeypot ochrana – bot typicky vyplní skryté pole
    if (company) {
      return res.status(200).json({
        ok: true,
        message: "Poptávka byla odeslána.",
      });
    }

    const cleanSelectedOption = String(selectedOption || "").trim();
    const cleanSelectedLabel = String(selectedLabel || "").trim();
    const cleanName = String(name || "").trim();
    const cleanPlace = String(place || "").trim();
    const cleanEmail = String(email || "").trim().toLowerCase();
    const cleanPhone = String(phone || "").trim();
    const cleanMessage = String(message || "").trim();

    if (!cleanSelectedOption) {
      return res.status(400).json({ error: "Vyberte typ poptávky." });
    }

    if (!cleanName || cleanName.length < 2) {
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

    // 1) Uložení do databáze
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

    const leadId = data?.id || "-";

    // 2) Odeslání emailu
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = Number(process.env.SMTP_PORT);
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const mailFrom = process.env.MAIL_FROM;
    const mailTo = process.env.MAIL_TO;

    if (!smtpHost || !smtpPort || !smtpUser || !smtpPass || !mailFrom || !mailTo) {
      console.error("SMTP config missing");
      return res.status(500).json({ error: "E-mailová služba není správně nastavena." });
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: true,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    await transporter.sendMail({
      from: mailFrom,
      to: mailTo,
      replyTo: cleanEmail,
      subject: "Nová poptávka ARCHIMEDES Live",
      text: `
Přišla nová poptávka z webu ARCHIMEDES Live

ID: ${leadId}

Typ zájmu:
${cleanSelectedLabel || cleanSelectedOption}

Jméno:
${cleanName}

Město / obec / škola:
${cleanPlace || "-"}

Email:
${cleanEmail}

Telefon:
${cleanPhone || "-"}

Zpráva:
${cleanMessage || "-"}

Datum:
${createdAt}
      `.trim(),
    });

    return res.status(200).json({
      ok: true,
      message: "Poptávka byla odeslána.",
    });
  } catch (err) {
    console.error("API error:", err);

    return res.status(500).json({
      error: "Serverová chyba.",
    });
  }
}
