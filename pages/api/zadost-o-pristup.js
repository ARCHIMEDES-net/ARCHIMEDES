
import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

function normalizeLeadType(value, isDemoRequest = false) {
  if (isDemoRequest) return "demo";

  const v = String(value || "").toLowerCase().trim();

  if (["škola", "skola", "school"].includes(v)) return "skola";
  if (["obec", "město", "mesto", "obec / město", "obec / mesto"].includes(v)) {
    return "obec";
  }
  if (["senior-klub", "senior klub", "senior", "senior club"].includes(v)) {
    return "senior";
  }
  if (["spolek", "komunita", "community"].includes(v)) return "komunita";
  return "obec";
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      name,
      email,
      phone,
      organization,
      address,
      type,
      message,
      isDemoRequest,
      company,
    } = req.body || {};

    // Honeypot ochrana
    if (company) {
      return res.status(200).json({
        ok: true,
        message: "Žádost byla odeslána.",
      });
    }

    const cleanName = String(name || "").trim();
    const cleanEmail = String(email || "").trim().toLowerCase();
    const cleanPhone = String(phone || "").trim();
    const cleanOrganization = String(organization || "").trim();
    const cleanAddress = String(address || "").trim();
    const cleanType = String(type || "").trim();
    const cleanMessage = String(message || "").trim();
    const demoMode = !!isDemoRequest;

    if (!cleanName || cleanName.length < 2) {
      return res.status(400).json({ error: "Vyplňte prosím jméno a příjmení." });
    }

    if (!isValidEmail(cleanEmail)) {
      return res.status(400).json({ error: "Zadejte prosím platný e-mail." });
    }

    if (!cleanOrganization) {
      return res.status(400).json({
        error: demoMode
          ? "Vyplňte prosím školu nebo organizaci."
          : "Vyplňte prosím školu, obec nebo organizaci.",
      });
    }

    if (!cleanAddress) {
      return res.status(400).json({ error: "Vyplňte prosím adresu." });
    }

    if (cleanPhone && cleanPhone.length < 6) {
      return res.status(400).json({ error: "Telefon je příliš krátký." });
    }

    const createdAt = new Date().toISOString();

    const requestHeader = demoMode
      ? "Typ žádosti: demo přístup"
      : "Typ žádosti: standardní přístup";

    const organizationTypeLine = `Typ organizace: ${cleanType || "neuvedeno"}`;
    const sourceLine = demoMode
      ? "Zdroj: web archimedeslive.com/zadost-o-pristup?type=demo"
      : "Zdroj: web archimedeslive.com/zadost-o-pristup";
    const addressLine = `Adresa: ${cleanAddress}`;

    const composedMessage = [
      requestHeader,
      organizationTypeLine,
      addressLine,
      sourceLine,
      cleanMessage || "",
    ]
      .filter(Boolean)
      .join("\n\n");

    const { data, error } = await supabase
      .from("leads")
      .insert([
        {
          type: normalizeLeadType(cleanType, demoMode),
          contact_name: cleanName,
          email: cleanEmail,
          organization: cleanOrganization,
          phone: cleanPhone || null,
          note: composedMessage,
          status: "new",
          created_at: createdAt,
        },
      ])
      .select("id")
      .single();

    if (error) {
      console.error("DB error:", error);
      return res.status(500).json({ error: "DB error" });
    }

    const leadId = data?.id || "-";

    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = Number(process.env.SMTP_PORT);
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const mailFrom = process.env.MAIL_FROM;
    const mailTo = process.env.MAIL_TO;

    if (!smtpHost || !smtpPort || !smtpUser || !smtpPass || !mailFrom || !mailTo) {
      console.error("SMTP config missing");
      return res.status(500).json({
        error: "E-mailová služba není správně nastavena.",
      });
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

    // 1) Interní notifikace pro vás
    await transporter.sendMail({
      from: mailFrom,
      to: mailTo,
      replyTo: cleanEmail,
      subject: demoMode
        ? `ARCHIMEDES Live – DEMO | ${cleanOrganization} | ${cleanName}`
        : `ARCHIMEDES Live – ŽÁDOST | ${cleanOrganization} | ${cleanName}`,
      priority: "high",
      text: `
Přišla nová žádost z webu ARCHIMEDES Live

ID: ${leadId}

Typ žádosti:
${demoMode ? "Ukázkový přístup" : "Standardní přístup"}

Typ organizace:
${cleanType || "-"}

Jméno:
${cleanName}

Organizace:
${cleanOrganization}

Adresa:
${cleanAddress}

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

    // 2) Potvrzovací e-mail žadateli
    await transporter.sendMail({
      from: mailFrom,
      to: cleanEmail,
      subject: "ARCHIMEDES Live – přijali jsme Vaši žádost",
      text: `
Dobrý den,

děkujeme za Váš zájem o ARCHIMEDES Live.

Vaši žádost jsme v pořádku přijali a nyní ji zpracováváme.

V nejbližší době Vám zašleme přístup do ukázkového prostředí,
kde si můžete projít, jak ARCHIMEDES Live funguje ve škole i v obci.

Součástí přístupu bude:
– ukázka programu
– reálné vysílání
– archiv a pracovní materiály

Po schválení Vám přijde e-mail s výzvou „Reset Password“.
Jedná se o standardní bezpečnostní krok pro vytvoření Vašeho přístupu.

Stačí kliknout na odkaz v tomto e-mailu a nastavit si vlastní heslo.

Pokud e-mail nenajdete během několika minut, zkontrolujte prosím i složku spam.

Pokud budete mít jakýkoliv dotaz, můžete na tento e-mail přímo odpovědět.

Těšíme se na spolupráci.

ARCHIMEDES Live
www.archimedeslive.com
      `.trim(),
    });

    return res.status(200).json({
      ok: true,
      message: "Žádost byla odeslána.",
    });
  } catch (e) {
    console.error("API error:", e);
    return res.status(500).json({ error: "Server error" });
  }
}
