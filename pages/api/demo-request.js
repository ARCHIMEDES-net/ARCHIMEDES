import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.archimedeslive.com";

function normalizeText(value = "") {
  return String(value).trim();
}

function normalizeEmail(value = "") {
  return String(value).trim().toLowerCase();
}

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

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const name = normalizeText(req.body?.name);
    const email = normalizeEmail(req.body?.email);
    const organization = normalizeText(req.body?.organization);
    const note = normalizeText(req.body?.note);

    if (!name || !email) {
      return res.status(400).json({
        error: "Prosím vyplňte jméno a e-mail.",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: "Prosím zadejte platný e-mail.",
      });
    }

    const clientIp = getClientIp(req);
    const userAgent = req.headers["user-agent"] || "";

    const { data: insertedLead, error } = await supabase
      .from("leads")
      .insert([
        {
          type: "demo",
          contact_name: name,
          email,
          organization: organization || null,
          note: note || null,
          status: "new",
          source_path: "/zadost-o-pristup",
        },
      ])
      .select("id, created_at")
      .single();

    if (error) {
      console.error("DEMO REQUEST DB ERROR:", error);
      return res.status(500).json({ error: "DB error" });
    }

    const transporter = createTransporter();

    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeOrganization = escapeHtml(organization || "-");
    const safeNote = escapeHtml(note || "-");
    const safeLeadId = escapeHtml(insertedLead?.id || "-");
    const safeCreatedAt = escapeHtml(insertedLead?.created_at || "-");
    const safeIp = escapeHtml(clientIp || "-");
    const safeUa = escapeHtml(userAgent || "-");

    await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: process.env.MAIL_TO,
      subject: `🟦 Demo žádost – ${name}${organization ? ` / ${organization}` : ""}`,
      html: `
        <h2>Nová žádost o demo přístup</h2>

        <p><strong>Jméno:</strong> ${safeName}</p>
        <p><strong>E-mail:</strong> ${safeEmail}</p>
        <p><strong>Organizace:</strong> ${safeOrganization}</p>
        <p><strong>Poznámka:</strong><br/>${safeNote}</p>

        <hr/>

        <p><strong>ID leadu:</strong> ${safeLeadId}</p>
        <p><strong>Vytvořeno:</strong> ${safeCreatedAt}</p>
        <p><strong>Zdroj:</strong> /zadost-o-pristup</p>
        <p><strong>IP:</strong> ${safeIp}</p>
        <p><strong>User-Agent:</strong> ${safeUa}</p>
      `,
    });

    await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: email,
      subject: "Potvrzení přijetí žádosti o demo – ARCHIMEDES Live",
      html: `
        <h2>Děkujeme, žádost o demo jsme přijali</h2>

        <p>Dobrý den${safeName ? `, <strong>${safeName}</strong>` : ""},</p>

        <p>
          děkujeme za váš zájem o <strong>ARCHIMEDES Live</strong>.
          Vaši žádost o demo přístup jsme přijali a zařadili ke zpracování.
        </p>

        <p>
          Jakmile demo přístup připravíme, pošleme vám další e-mail s postupem
          pro přihlášení.
        </p>

        ${
          organization
            ? `<p><strong>Uvedená organizace:</strong> ${safeOrganization}</p>`
            : ""
        }

        <p>
          Přehled programu a další informace najdete zde:
          <br/>
          <a href="${SITE_URL}">${SITE_URL}</a>
        </p>

        <p>S pozdravem,<br/>
        <strong>ARCHIMEDES Live</strong><br/>
        EduVision s.r.o.</p>
      `,
    });

    return res.status(200).json({ success: true });
  } catch (e) {
    console.error("DEMO REQUEST SERVER ERROR:", e);
    return res.status(500).json({ error: "Server error" });
  }
}
