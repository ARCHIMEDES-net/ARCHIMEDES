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

function normalizeEmail(value = "") {
  return String(value).trim().toLowerCase();
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const data = req.body || {};

    const schoolNameRaw = String(data.schoolName || "").trim();
    const icoRaw = String(data.ico || "").trim();
    const streetRaw = String(data.street || "").trim();
    const cityRaw = String(data.city || "").trim();
    const zipRaw = String(data.zip || "").trim();
    const contactNameRaw = String(data.contactName || "").trim();
    const roleRaw = String(data.role || "").trim();
    const emailRaw = normalizeEmail(data.email);
    const adminEmailRaw = normalizeEmail(data.adminEmail);
    const phoneRaw = String(data.phone || "").trim();
    const noteRaw = String(data.note || "").trim();

    // VALIDACE POVINNÝCH POLÍ
    if (
      !schoolNameRaw ||
      !icoRaw ||
      !streetRaw ||
      !cityRaw ||
      !zipRaw ||
      !contactNameRaw ||
      !roleRaw ||
      !emailRaw ||
      !adminEmailRaw
    ) {
      return res.status(400).json({
        error: "Prosím vyplňte všechny povinné údaje.",
      });
    }

    // ZÁKLADNÍ VALIDACE E-MAILŮ
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailRaw) || !emailRegex.test(adminEmailRaw)) {
      return res.status(400).json({
        error: "Prosím zadejte platné e-mailové adresy.",
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
        school_name: schoolNameRaw,
        ico: icoRaw,
        street: streetRaw,
        city: cityRaw,
        zip: zipRaw,
        contact_name: contactNameRaw,
        role: roleRaw,
        email: emailRaw,
        admin_email: adminEmailRaw,
        phone: phoneRaw || null,
        note: noteRaw || null,

        agree_vop: !!data.agreeVop,
        agree_dpa: !!data.agreeDpa,
        agree_recordings: !!data.agreeRecordings,
        agree_authority: !!data.agreeAuthority,
        agree_contract: !!data.agreeContract,

        onboarding_status: "pending",
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

    const schoolName = escapeHtml(schoolNameRaw);
    const ico = escapeHtml(icoRaw);
    const street = escapeHtml(streetRaw);
    const city = escapeHtml(cityRaw);
    const zip = escapeHtml(zipRaw);
    const contactName = escapeHtml(contactNameRaw);
    const role = escapeHtml(roleRaw);
    const email = escapeHtml(emailRaw);
    const adminEmail = escapeHtml(adminEmailRaw);
    const phone = escapeHtml(phoneRaw || "-");
    const note = escapeHtml(noteRaw || "-");

    const subject = `🟢 START – ${schoolNameRaw} (IČO: ${icoRaw})`;

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
        <p><strong>Email objednatele:</strong> ${email}</p>
        <p><strong>Admin email (portál):</strong> ${adminEmail}</p>
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

        <p><strong>Onboarding stav:</strong> pending</p>
        <p><strong>Právní verze:</strong> 2026-03-start-v1</p>
        <p><strong>Odesláno:</strong> ${escapeHtml(now)}</p>
        <p><strong>IP:</strong> ${escapeHtml(clientIp || "-")}</p>
      `,
    });

    // EMAIL ZÁKAZNÍKOVI
    await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: emailRaw,
      subject: "Potvrzení objednávky – ARCHIMEDES Live",
      html: `
        <h2>Děkujeme za objednávku</h2>

        <p>Vaše objednávka balíčku <strong>ARCHIMEDES START</strong> byla přijata.</p>

        <p><strong>Škola / organizace:</strong> ${schoolName}</p>
        <p><strong>Objednatel:</strong> ${contactName}</p>
        <p><strong>Administrátor portálu:</strong> ${adminEmail}</p>
        <p><strong>Období:</strong> duben–červen 2026</p>
        <p><strong>Cena:</strong> 4 990 Kč bez DPH</p>

        <br/>

        <p>
          Odesláním objednávky došlo k uzavření smlouvy o poskytování služby
          ARCHIMEDES Live v rozsahu balíčku START.
        </p>

        <p>Na základě objednávky vám bude vystavena faktura.</p>
        <p>
          Přístup administrátora školy do portálu bude připraven pro e-mail:
          <strong>${adminEmail}</strong>.
        </p>

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
