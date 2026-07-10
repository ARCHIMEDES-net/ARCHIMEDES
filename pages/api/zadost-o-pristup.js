
import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";
import crypto from "crypto";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.archimedeslive.com";

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

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function buildEmailLayout({
  preheader = "",
  eyebrow = "",
  title = "",
  intro = "",
  bodyHtml = "",
  noteHtml = "",
}) {
  const safePreheader = escapeHtml(preheader);
  const safeEyebrow = escapeHtml(eyebrow);
  const safeTitle = escapeHtml(title);

  return `
    <!doctype html>
    <html lang="cs">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${safeTitle}</title>
      </head>
      <body style="margin:0;padding:0;background:#f4f6fb;font-family:Segoe UI,Arial,sans-serif;color:#0f172a;">
        <div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;">
          ${safePreheader}
        </div>

        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;background:#f4f6fb;">
          <tr>
            <td align="center" style="padding:32px 16px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;max-width:720px;">
                <tr>
                  <td style="padding:0 0 14px 4px;font-size:28px;line-height:1.1;font-weight:900;color:#0f172a;">
                    archimedes <span style="display:inline-block;padding:3px 8px;border-radius:8px;background:#ef4444;color:#ffffff;font-size:18px;vertical-align:middle;">live</span>
                  </td>
                </tr>

                <tr>
                  <td style="background:#ffffff;border:1px solid rgba(15,23,42,0.08);border-radius:26px;padding:34px 30px;box-shadow:0 12px 34px rgba(15,23,42,0.05);">
                    ${
                      safeEyebrow
                        ? `<div style="display:inline-flex;align-items:center;min-height:34px;padding:0 14px;border-radius:999px;background:#e9eef8;color:#223252;font-size:12px;font-weight:800;letter-spacing:0.04em;text-transform:uppercase;margin-bottom:18px;">${safeEyebrow}</div>`
                        : ""
                    }

                    <h1 style="margin:0;font-size:34px;line-height:1.08;letter-spacing:-0.03em;font-weight:900;color:#0f172a;">
                      ${safeTitle}
                    </h1>

                    ${
                      intro
                        ? `<div style="margin-top:16px;font-size:17px;line-height:1.75;color:#475467;">${intro}</div>`
                        : ""
                    }

                    <div style="margin-top:22px;font-size:16px;line-height:1.75;color:#334155;">
                      ${bodyHtml}
                    </div>

                    ${
                      noteHtml
                        ? `<div style="margin-top:22px;padding:18px 20px;border-radius:18px;background:#f8fafc;border:1px solid rgba(15,23,42,0.08);font-size:15px;line-height:1.7;color:#475467;">${noteHtml}</div>`
                        : ""
                    }

                    <div style="margin-top:28px;padding-top:20px;border-top:1px solid rgba(15,23,42,0.08);font-size:14px;line-height:1.7;color:#667085;">
                      <strong style="color:#0f172a;">Tým ARCHIMEDES Live</strong><br />
                      <a href="${escapeHtml(SITE_URL)}" style="color:#1d4ed8;text-decoration:none;">${escapeHtml(SITE_URL)}</a>
                    </div>
                  </td>
                </tr>

                <tr>
                  <td style="padding:14px 6px 0;font-size:12px;line-height:1.6;color:#94a3b8;text-align:center;">
                    Tento e-mail byl odeslán v souvislosti s žádostí o přístup do ARCHIMEDES Live.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

function buildApplicantEmail({ name, isDemoRequest }) {
  const safeName = escapeHtml(name || "");

  const intro = `
    <p style="margin:0 0 12px;">Dobrý den${safeName ? ` ${safeName}` : ""},</p>
    <p style="margin:0;">děkujeme za Váš zájem o ARCHIMEDES Live.</p>
  `;

  const bodyHtml = isDemoRequest
    ? `
      <div style="padding:18px 20px;border-radius:18px;background:#eefaf0;border:1px solid #cfe8d3;color:#166534;">
        <strong>Vaši žádost o ukázkový přístup jsme v pořádku přijali.</strong>
      </div>

      <div style="margin-top:20px;">
        <p style="margin:0 0 12px;">
          Nyní ji zpracujeme a po schválení Vám pošleme e-mail s tlačítkem pro vstup do ukázkového prostředí ARCHIMEDES Live.
        </p>

        <p style="margin:0 0 12px;">
          V ukázce si můžete projít, jak ARCHIMEDES Live funguje z pohledu školy a jak vypadá prostředí programu, archivu a pracovních materiálů.
        </p>
      </div>
    `
    : `
      <div style="padding:18px 20px;border-radius:18px;background:#eefaf0;border:1px solid #cfe8d3;color:#166534;">
        <strong>Vaši žádost o přístup jsme v pořádku přijali.</strong>
      </div>

      <div style="margin-top:20px;">
        <p style="margin:0 0 12px;">
          Zpracujeme Vaši žádost a obec zaregistrujeme.
        </p>
      </div>
    `;

  const noteHtml = isDemoRequest
    ? `
      Pokud e-mail během několika minut nenajdete, zkontrolujte prosím i složku Hromadné nebo Spam.<br /><br />
      Pokud budete mít jakýkoliv dotaz, můžete na tento e-mail přímo odpovědět.
    `
    : `
      Pokud budete mít jakýkoliv dotaz, můžete na tento e-mail přímo odpovědět.
    `;

  return {
    subject: "ARCHIMEDES Live – přijali jsme Vaši žádost",
    text: isDemoRequest
      ? `
Dobrý den${name ? ` ${name}` : ""},

děkujeme za Váš zájem o ARCHIMEDES Live.

Vaši žádost o ukázkový přístup jsme v pořádku přijali.

Nyní ji zpracujeme a po schválení Vám pošleme e-mail s tlačítkem pro vstup do ukázkového prostředí ARCHIMEDES Live.

V ukázce si můžete projít, jak ARCHIMEDES Live funguje z pohledu školy a jak vypadá prostředí programu, archivu a pracovních materiálů.

Pokud e-mail během několika minut nenajdete, zkontrolujte prosím i složku Hromadné nebo Spam.

Pokud budete mít jakýkoliv dotaz, můžete na tento e-mail přímo odpovědět.

S pozdravem,

Tým ARCHIMEDES Live
${SITE_URL}
      `.trim()
      : `
Dobrý den${name ? ` ${name}` : ""},

děkujeme za Váš zájem o ARCHIMEDES Live.

Vaši žádost o přístup jsme v pořádku přijali.

Zpracujeme Vaši žádost a obec zaregistrujeme.

Pokud budete mít jakýkoliv dotaz, můžete na tento e-mail přímo odpovědět.

S pozdravem,

Tým ARCHIMEDES Live
${SITE_URL}
      `.trim(),
    html: buildEmailLayout({
      preheader: isDemoRequest
        ? "Vaši žádost o ukázkový přístup jsme přijali."
        : "Vaši žádost o přístup jsme přijali.",
      eyebrow: isDemoRequest ? "Ukázkový přístup" : "Žádost o přístup",
      title: isDemoRequest
        ? "Žádost o ukázkový přístup jsme přijali"
        : "Žádost jsme přijali",
      intro,
      bodyHtml,
      noteHtml,
    }),
  };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      name,
      role,
      email,
      phone,
      organization,
      address,
      population,
      type,
      message,
      isDemoRequest,
      company,
    } = req.body || {};

    if (company) {
      return res.status(200).json({
        ok: true,
        message: "Žádost byla odeslána.",
      });
    }

    const cleanName = String(name || "").trim();
    const cleanRole = String(role || "").trim();
    const cleanEmail = String(email || "").trim().toLowerCase();
    const cleanPhone = String(phone || "").trim();
    const cleanOrganization = String(organization || "").trim();
    const cleanAddress = String(address || "").trim();
    const cleanPopulation = String(population || "").trim();
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
          : "Vyplňte prosím název obce.",
      });
    }

    if (!cleanAddress) {
      return res.status(400).json({
        error: demoMode
          ? "Vyplňte prosím adresu."
          : "Vyplňte prosím adresu obecního úřadu.",
      });
    }

    if (demoMode) {
      if (cleanPhone && cleanPhone.length < 6) {
        return res.status(400).json({ error: "Telefon je příliš krátký." });
      }
    } else {
      if (!cleanPhone) {
        return res.status(400).json({ error: "Vyplňte prosím telefon." });
      }
      if (cleanPhone.length < 6) {
        return res.status(400).json({ error: "Telefon je příliš krátký." });
      }
    }

    const createdAt = new Date().toISOString();

    const approveToken = demoMode
      ? crypto.randomBytes(32).toString("hex")
      : null;

    const requestHeader = demoMode
      ? "Typ žádosti: demo přístup"
      : "Typ žádosti: standardní přístup";

    const organizationTypeLine = demoMode
      ? `Typ organizace: ${cleanType || "neuvedeno"}`
      : "";
    const roleLine = cleanRole ? `Funkce: ${cleanRole}` : "";
    const sourceLine = demoMode
      ? "Zdroj: web archimedeslive.com/zadost-o-pristup?type=demo"
      : "Zdroj: web archimedeslive.com/zadost-o-pristup";
    const addressLine = `Adresa: ${cleanAddress}`;
    const populationLine = cleanPopulation
      ? `Přibližný počet obyvatel: ${cleanPopulation}`
      : "";

    const composedMessage = [
      requestHeader,
      roleLine,
      organizationTypeLine,
      addressLine,
      populationLine,
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
          approve_token: approveToken,
          approve_token_created_at: approveToken ? createdAt : null,
        },
      ])
      .select("id")
      .single();

    if (error) {
      console.error("DB error:", error);
      return res.status(500).json({ error: "DB error" });
    }

    const leadId = data?.id || "-";

    const approveUrl =
      demoMode && approveToken
        ? `${SITE_URL}/api/demo-approve-from-email?token=${approveToken}`
        : null;

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
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

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
${!demoMode ? `\nFunkce:\n${cleanRole || "-"}\n` : ""}
Organizace:
${cleanOrganization}

Adresa:
${cleanAddress}
${!demoMode ? `\nPřibližný počet obyvatel:\n${cleanPopulation || "-"}\n` : ""}
Email:
${cleanEmail}

Telefon:
${cleanPhone || "-"}

Zpráva:
${cleanMessage || "-"}

Datum:
${createdAt}

${approveUrl ? `Schválit demo: ${approveUrl}` : ""}
      `.trim(),
      html: `
        <div style="font-family:Segoe UI,Arial,sans-serif;color:#0f172a;line-height:1.6;">
          <h2 style="margin:0 0 16px;">Přišla nová žádost z webu ARCHIMEDES Live</h2>

          <p><strong>ID:</strong> ${escapeHtml(String(leadId))}</p>
          <p><strong>Typ žádosti:</strong> ${demoMode ? "Ukázkový přístup" : "Standardní přístup"}</p>
          <p><strong>Typ organizace:</strong> ${escapeHtml(cleanType || "-")}</p>
          <p><strong>Jméno:</strong> ${escapeHtml(cleanName)}</p>
          ${!demoMode ? `<p><strong>Funkce:</strong> ${escapeHtml(cleanRole || "-")}</p>` : ""}
          <p><strong>Organizace:</strong> ${escapeHtml(cleanOrganization)}</p>
          <p><strong>Adresa:</strong> ${escapeHtml(cleanAddress)}</p>
          ${!demoMode ? `<p><strong>Přibližný počet obyvatel:</strong> ${escapeHtml(cleanPopulation || "-")}</p>` : ""}
          <p><strong>Email:</strong> ${escapeHtml(cleanEmail)}</p>
          <p><strong>Telefon:</strong> ${escapeHtml(cleanPhone || "-")}</p>
          <p><strong>Zpráva:</strong><br />${escapeHtml(cleanMessage || "-").replace(/\n/g, "<br />")}</p>
          <p><strong>Datum:</strong> ${escapeHtml(createdAt)}</p>

          ${
            approveUrl
              ? `
                <div style="margin-top:24px;">
                  <a
                    href="${escapeHtml(approveUrl)}"
                    style="display:inline-block;padding:12px 18px;background:#111827;color:#ffffff;text-decoration:none;border-radius:10px;font-weight:700;"
                  >
                    Schválit demo
                  </a>
                </div>
              `
              : ""
          }
        </div>
      `,
    });

    const applicantMail = buildApplicantEmail({
      name: cleanName,
      isDemoRequest: demoMode,
    });

    await transporter.sendMail({
      from: mailFrom,
      to: cleanEmail,
      subject: applicantMail.subject,
      text: applicantMail.text,
      html: applicantMail.html,
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
