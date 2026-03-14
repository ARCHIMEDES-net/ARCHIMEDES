import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function buildLeadType(selectedOption) {
  const map = {
    program: "program",
    senior: "senior",
    ucebna: "ucebna",
    oboji: "oboji",
    navsteva: "navsteva",
  };
  return map[selectedOption] || "jine";
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
    } = req.body || {};

    const cleanSelectedOption = String(selectedOption || "").trim();
    const cleanSelectedLabel = String(selectedLabel || "").trim();
    const cleanName = String(name || "").trim();
    const cleanPlace = String(place || "").trim();
    const cleanEmail = String(email || "").trim();
    const cleanPhone = String(phone || "").trim();
    const cleanMessage = String(message || "").trim();

    if (!cleanSelectedOption) {
      return res.status(400).json({ error: "Vyberte, o co máte zájem." });
    }

    if (!cleanName || !cleanEmail) {
      return res.status(400).json({ error: "Vyplňte jméno a email." });
    }

    const createdAt = new Date().toISOString();
    const leadType = buildLeadType(cleanSelectedOption);

    const noteParts = [
      cleanSelectedLabel ? `Zájem: ${cleanSelectedLabel}` : "",
      cleanPlace ? `Město / obec / škola: ${cleanPlace}` : "",
      cleanPhone ? `Telefon: ${cleanPhone}` : "",
      cleanMessage ? `Zpráva: ${cleanMessage}` : "",
      `Zdroj: webový formulář /poptavka`,
    ].filter(Boolean);

    // 1) Uložení do databáze
    const { data: insertedLead, error: insertError } = await supabaseAdmin
      .from("leads")
      .insert([
        {
          created_at: createdAt,
          type: leadType,
          organization: cleanPlace || null,
          contact_name: cleanName,
          email: cleanEmail,
          phone: cleanPhone || null,
          note: noteParts.join("\n\n"),
          status: "new",
        },
      ])
      .select("id")
      .single();

    if (insertError) {
      console.error("Chyba při ukládání do leads:", insertError);
      return res.status(500).json({
        error: "Nepodařilo se uložit poptávku do databáze.",
      });
    }

    // 2) Odeslání emailu
    const smtpPort = Number(process.env.SMTP_PORT || 465);

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const safeLabel = escapeHtml(cleanSelectedLabel || cleanSelectedOption);
    const safeName = escapeHtml(cleanName);
    const safePlace = escapeHtml(cleanPlace || "—");
    const safeEmail = escapeHtml(cleanEmail);
    const safePhone = escapeHtml(cleanPhone || "—");
    const safeMessage = escapeHtml(cleanMessage || "—");
    const safeLeadType = escapeHtml(leadType);
    const safeLeadId = escapeHtml(insertedLead?.id || "—");
    const safeCreatedAt = escapeHtml(createdAt);

    await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: process.env.MAIL_TO,
      replyTo: cleanEmail,
      subject: `Nová poptávka ARCHIMEDES Live – ${cleanSelectedLabel || cleanSelectedOption}`,
      text: [
        "Přišla nová poptávka z webu ARCHIMEDES Live.",
        "",
        `ID leadu: ${insertedLead?.id || "—"}`,
        `Typ: ${leadType}`,
        `Zájem: ${cleanSelectedLabel || cleanSelectedOption}`,
        `Jméno: ${cleanName}`,
        `Město / obec / škola: ${cleanPlace || "—"}`,
        `Email: ${cleanEmail}`,
        `Telefon: ${cleanPhone || "—"}`,
        `Zpráva: ${cleanMessage || "—"}`,
        `Vytvořeno: ${createdAt}`,
      ].join("\n"),
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Nová poptávka z webu ARCHIMEDES Live</h2>
          <p><strong>ID leadu:</strong> ${safeLeadId}</p>
          <p><strong>Typ:</strong> ${safeLeadType}</p>
          <p><strong>Zájem:</strong> ${safeLabel}</p>
          <p><strong>Jméno:</strong> ${safeName}</p>
          <p><strong>Město / obec / škola:</strong> ${safePlace}</p>
          <p><strong>Email:</strong> ${safeEmail}</p>
          <p><strong>Telefon:</strong> ${safePhone}</p>
          <p><strong>Zpráva:</strong><br>${safeMessage.replace(/\n/g, "<br>")}</p>
          <p><strong>Vytvořeno:</strong> ${safeCreatedAt}</p>
        </div>
      `,
    });

    return res.status(200).json({
      ok: true,
      message: "Poptávka byla úspěšně odeslána.",
    });
  } catch (error) {
    console.error("Chyba API /api/poptavka:", error);
    return res.status(500).json({
      error: "Serverová chyba při odeslání poptávky.",
    });
  }
}
