import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";

const supabase = createClient(
  process.env.SUPABASE_URL,
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

function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0].trim();
  }
  return req.socket?.remoteAddress || "";
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const data = req.body || {};

    // VALIDACE POVINNÝCH POLÍ
    if (
      !data.schoolName ||
      !data.ico ||
      !data.street ||
      !data.city ||
      !data.zip ||
      !data.contactName ||
      !data.role ||
      !data.email
    ) {
      return res.status(400).json({
        error: "Prosím vyplňte všechny povinné údaje.",
      });
    }

    // VALIDACE SOUHLASŮ
    if (
      !data.agreeVop ||
      !data.agreeDpa ||
      !data.agreeRecordings ||
      !data.agreeAuthority ||
      !data.agreeContract
    ) {
      return res.status(400).json({
        error: "Pro odeslání objednávky je nutné potvrdit všechny souhlasy.",
      });
    }

    const clientIp = getClientIp(req);
    const userAgent = req.headers["user-agent"] || "";
    const now = new Date().toISOString();

    // ULOŽENÍ DO DB
    const { error: dbError } = await supabase.from("orders_start").insert([
      {
        school_name: data.schoolName,
        ico: data.ico,
        street: data.street,
        city: data.city,
        zip: data.zip,
        contact_name: data.contactName,
        role: data.role,
        email: data.email,
        phone: data.phone || null,
        note: data.note || null,

        agree_vop: !!data.agreeVop,
        agree_dpa: !!data.agreeDpa,
        agree_recordings: !!data.agreeRecordings,
        agree_authority: !!data.agreeAuthority,
        agree_contract: !!data.agreeContract,

        legal_version: "2026-03-start-v1",
        ip_address: clientIp,
        user_agent: userAgent,
        submitted_at: now,
      },
    ]);

    if (dbError) {
      console.error("DB ERROR:", dbError);
      throw new Error("Chyba uložení do databáze");
    }

    // SMTP
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const schoolName = escapeHtml(data.schoolName);
    const ico = escapeHtml(data.ico);
    const street = escapeHtml(data.street);
    const city = escapeHtml(data.city);
    const zip = escapeHtml(data.zip);
    const contactName = escapeHtml(data.contactName);
    const role = escapeHtml(data.role);
    const email = escapeHtml(data.email);
    const phone = escapeHtml(data.phone || "-");
    const note = escapeHtml(data.note || "-");

    const subject = `🟢 START – ${data.schoolName} (IČO: ${data.ico})`;

    // EMAIL INTERNÍ
    await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: process.env.MAIL_TO,
      subject,
      html: `
        <h2>Nová objednávka – ARCHIMEDES START</h2>

        <p><strong>Škola:</strong> ${schoolName}</p>
        <p><strong>IČO:</strong> ${ico}</p>

        <hr/>

        <p><strong>Kontakt:</strong> ${contactName}</p>
        <p><strong>Funkce:</strong> ${role}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Telefon:</strong> ${phone}</p>

        <hr/>

        <p><strong>Adresa:</strong><br/>
        ${street}<br/>
        ${city} ${zip}
        </p>

        <p><strong>Poznámka:</strong><br/>${note}</p>

        <hr/>

        <p><strong>Souhlasy:</strong></p>
        <ul>
          <li>VOP: ano</li>
          <li>DPA: ano</li>
          <li>Pravidla záznamů: ano</li>
          <li>Oprávnění jednat za organizaci: ano</li>
          <li>Uzavření smlouvy s povinností úhrady: ano</li>
        </ul>

        <p><strong>Právní verze:</strong> 2026-03-start-v1</p>
        <p><strong>Odesláno:</strong> ${escapeHtml(now)}</p>
        <p><strong>IP:</strong> ${escapeHtml(clientIp || "-")}</p>
      `,
    });

    // EMAIL ZÁKAZNÍKOVI
    await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: data.email,
      subject: "Potvrzení objednávky – ARCHIMEDES Live",
      html: `
        <h2>Děkujeme za objednávku</h2>

        <p>Vaše objednávka balíčku <strong>ARCHIMEDES START</strong> byla přijata.</p>

        <p><strong>Škola / organizace:</strong> ${schoolName}</p>
        <p><strong>Objednatel:</strong> ${contactName}</p>
        <p><strong>Období:</strong> duben–červen 2026</p>
        <p><strong>Cena:</strong> 4 990 Kč bez DPH</p>

        <br/>

        <p>
          Odesláním objednávky došlo k uzavření smlouvy o poskytování služby
          ARCHIMEDES Live v rozsahu balíčku START.
        </p>

        <p>Na základě objednávky vám bude vystavena faktura.</p>

        <p>
          Důležité dokumenty:
          <br/>
          <a href="https://www.archimedeslive.com/vop">VOP</a><br/>
          <a href="https://www.archimedeslive.com/dpa">DPA</a><br/>
          <a href="https://www.archimedeslive.com/pravidla-zaznamu">Pravidla záznamů a archivu</a><br/>
          <a href="https://www.archimedeslive.com/ochrana-osobnich-udaju">Ochrana osobních údajů</a>
        </p>

        <br/>

        <p>S pozdravem,<br/>
        <strong>ARCHIMEDES Live</strong><br/>
        EduVision s.r.o.</p>
      `,
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("SERVER ERROR:", err);

    return res.status(500).json({
      error: "Objednávku se nepodařilo odeslat. Zkuste to prosím znovu.",
    });
  }
}
