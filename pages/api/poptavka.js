import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

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
      message
    } = req.body;

    if (!selectedOption) {
      return res.status(400).json({ error: "Vyberte typ poptávky." });
    }

    if (!name || !email) {
      return res.status(400).json({ error: "Vyplňte jméno a email." });
    }

    const createdAt = new Date().toISOString();

    // -----------------------------
    // 1️⃣ Uložení do databáze
    // -----------------------------

    const { data, error } = await supabase
      .from("leads")
      .insert([
        {
          created_at: createdAt,
          type: selectedOption,
          organization: place || null,
          contact_name: name,
          email: email,
          phone: phone || null,
          note: `
Zájem: ${selectedLabel || selectedOption}

Zpráva:
${message || "-"}

Zdroj: web archimedeslive.com/poptavka
          `,
          status: "new"
        }
      ])
      .select("id")
      .single();

    if (error) {
      console.error("DB error:", error);
      return res.status(500).json({ error: "Chyba při ukládání poptávky." });
    }

    const leadId = data?.id || "-";

    // -----------------------------
    // 2️⃣ Odeslání emailu
    // -----------------------------

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: process.env.MAIL_TO,
      replyTo: email,
      subject: `Nová poptávka ARCHIMEDES Live`,
      text: `
Přišla nová poptávka z webu ARCHIMEDES Live

ID: ${leadId}

Typ zájmu:
${selectedLabel || selectedOption}

Jméno:
${name}

Město / obec / škola:
${place || "-"}

Email:
${email}

Telefon:
${phone || "-"}

Zpráva:
${message || "-"}

Datum:
${createdAt}
      `
    });

    return res.status(200).json({
      ok: true,
      message: "Poptávka byla odeslána."
    });

  } catch (err) {

    console.error("API error:", err);

    return res.status(500).json({
      error: "Serverová chyba."
    });

  }

}
