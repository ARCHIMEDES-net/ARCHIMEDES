
import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.archimedeslive.com";

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

const CUSTOMER_TYPES = {
  obec: {
    orgType: "municipality",
    leadType: "obec",
    label: "Obec",
    accusative: "obec",
    duplicateLabel: "obec",
  },
  skola: {
    orgType: "school",
    leadType: "skola",
    label: "Škola",
    accusative: "školu",
    duplicateLabel: "školu",
  },
  spolek: {
    orgType: "association",
    leadType: "komunita",
    label: "Spolek",
    accusative: "spolek",
    duplicateLabel: "spolek",
  },
};

function resolveCustomerType(value) {
  const key = String(value || "").toLowerCase().trim();
  return CUSTOMER_TYPES[key] ? { key, ...CUSTOMER_TYPES[key] } : null;
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

function buildApplicantEmail({ name, customer }) {
  const safeName = escapeHtml(name || "");

  const intro = `
    <p style="margin:0 0 12px;">Dobrý den${safeName ? ` ${safeName}` : ""},</p>
    <p style="margin:0;">děkujeme za Váš zájem o ARCHIMEDES Live.</p>
  `;

  const bodyHtml = `
      <div style="padding:18px 20px;border-radius:18px;background:#eefaf0;border:1px solid #cfe8d3;color:#166534;">
        <strong>Vaši žádost o přístup jsme v pořádku přijali.</strong>
      </div>

      <div style="margin-top:20px;">
        <p style="margin:0 0 12px;">
          Žádost ověříme a poté ${escapeHtml(customer.accusative)} zaregistrujeme.
        </p>
      </div>
    `;

  const noteHtml = `
      Pokud budete mít jakýkoliv dotaz, můžete na tento e-mail přímo odpovědět.
    `;

  return {
    subject: "ARCHIMEDES Live – přijali jsme Vaši žádost",
    text: `
Dobrý den${name ? ` ${name}` : ""},

děkujeme za Váš zájem o ARCHIMEDES Live.

Vaši žádost o přístup jsme v pořádku přijali.

Žádost ověříme a poté ${customer.accusative} zaregistrujeme.

Pokud budete mít jakýkoliv dotaz, můžete na tento e-mail přímo odpovědět.

S pozdravem,

Tým ARCHIMEDES Live
${SITE_URL}
      `.trim(),
    html: buildEmailLayout({
      preheader: "Vaši žádost o přístup jsme přijali.",
      eyebrow: `Žádost • ${customer.label}`,
      title: "Žádost jsme přijali",
      intro,
      bodyHtml,
      noteHtml,
    }),
  };
}

// E-mailové oznámení (týmu + potvrzení žadateli) je odděleno od DB zápisu
// tak, aby selhání SMTP (chybějící konfigurace i chyba při odeslání)
// nezpůsobilo chybovou odpověď žadateli poté, co lead/organizace v DB už
// úspěšně vznikly — viz volání v handleru níže. Dřív se stejná chyba
// (config missing i sendMail throw) vracela jako 500 PO úspěšném insertu,
// takže žadatel klidně mohl zkusit formulář odeslat znovu a omylem
// založit duplicitní obec (smoke test 11.7.2026).
async function sendRequestEmails({
  customer,
  cleanEmail,
  cleanName,
  cleanRole,
  cleanOrganization,
  cleanAddress,
  cleanPopulation,
  cleanLegalIdentifier,
  cleanMessage,
  cleanPhone,
  createdAt,
  leadId,
}) {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT);
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const mailFrom = process.env.MAIL_FROM;
  const mailTo = process.env.MAIL_TO;

  if (!smtpHost || !smtpPort || !smtpUser || !smtpPass || !mailFrom || !mailTo) {
    throw new Error("SMTP config missing");
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
    subject: `ARCHIMEDES Live – ŽÁDOST ${customer.label.toUpperCase()} | ${cleanOrganization} | ${cleanName}`,
    priority: "high",
    text: `
Přišla nová žádost z webu ARCHIMEDES Live

ID: ${leadId}

Typ zákazníka:
${customer.label}

Jméno:
${cleanName}
Funkce:
${cleanRole || "-"}
Organizace:
${cleanOrganization}

Adresa:
${cleanAddress}
IČO:
${cleanLegalIdentifier || "-"}

Přibližný počet obyvatel:
${cleanPopulation || "-"}
Email:
${cleanEmail}

Telefon:
${cleanPhone || "-"}

Zpráva:
${cleanMessage || "-"}

Datum:
${createdAt}

      `.trim(),
    html: `
        <div style="font-family:Segoe UI,Arial,sans-serif;color:#0f172a;line-height:1.6;">
          <h2 style="margin:0 0 16px;">Přišla nová žádost z webu ARCHIMEDES Live</h2>

          <p><strong>ID:</strong> ${escapeHtml(String(leadId))}</p>
          <p><strong>Typ zákazníka:</strong> ${escapeHtml(customer.label)}</p>
          <p><strong>Jméno:</strong> ${escapeHtml(cleanName)}</p>
          <p><strong>Funkce:</strong> ${escapeHtml(cleanRole || "-")}</p>
          <p><strong>Organizace:</strong> ${escapeHtml(cleanOrganization)}</p>
          <p><strong>Adresa:</strong> ${escapeHtml(cleanAddress)}</p>
          <p><strong>IČO:</strong> ${escapeHtml(cleanLegalIdentifier || "-")}</p>
          <p><strong>Přibližný počet obyvatel:</strong> ${escapeHtml(cleanPopulation || "-")}</p>
          <p><strong>Email:</strong> ${escapeHtml(cleanEmail)}</p>
          <p><strong>Telefon:</strong> ${escapeHtml(cleanPhone || "-")}</p>
          <p><strong>Zpráva:</strong><br />${escapeHtml(cleanMessage || "-").replace(/\n/g, "<br />")}</p>
          <p><strong>Datum:</strong> ${escapeHtml(createdAt)}</p>

        </div>
      `,
  });

  const applicantMail = buildApplicantEmail({
    name: cleanName,
    customer,
  });

  await transporter.sendMail({
    from: mailFrom,
    to: cleanEmail,
    subject: applicantMail.subject,
    text: applicantMail.text,
    html: applicantMail.html,
  });
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
      legalIdentifier,
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
    const requestedPopulation = String(population || "").trim();
    const cleanLegalIdentifier = String(legalIdentifier || "").replace(/\s+/g, "").trim();
    const customer = resolveCustomerType(type);
    const cleanPopulation = customer?.key === "obec" ? requestedPopulation : "";
    const cleanMessage = String(message || "").trim();
    const demoMode = !!isDemoRequest;

    if (demoMode) {
      return res.status(410).json({
        error: "Demo přístup již není součástí nabídky ARCHIMEDES Live.",
      });
    }

    if (!customer) {
      return res.status(400).json({ error: "Vyberte prosím obec, školu nebo spolek." });
    }

    if (cleanLegalIdentifier && !/^\d{8}$/.test(cleanLegalIdentifier)) {
      return res.status(400).json({ error: "IČO musí obsahovat přesně 8 číslic." });
    }

    if (!cleanName || cleanName.length < 2) {
      return res.status(400).json({ error: "Vyplňte prosím jméno a příjmení." });
    }

    if (!isValidEmail(cleanEmail)) {
      return res.status(400).json({ error: "Zadejte prosím platný e-mail." });
    }

    if (!cleanOrganization) {
      return res.status(400).json({
        error: `Vyplňte prosím název: ${customer.label.toLowerCase()}.`,
      });
    }

    if (!cleanAddress) {
      return res.status(400).json({
        error: "Vyplňte prosím adresu sídla.",
      });
    }

    if (!cleanPhone) {
      return res.status(400).json({ error: "Vyplňte prosím telefon." });
    }
    if (cleanPhone.length < 6) {
      return res.status(400).json({ error: "Telefon je příliš krátký." });
    }

    // Duplicitu ověříme před prvním zápisem. Původní pořadí nejprve
    // vytvořilo lead a teprve potom vrátilo 409, takže opakovaný formulář
    // zanechal v administraci falešnou novou žádost.
    const { data: conflicting, error: conflictError } = await supabase.rpc(
      "find_conflicting_customer",
      {
        p_org_type: customer.orgType,
        p_email: cleanEmail,
        p_name: cleanOrganization,
        p_legal_identifier: cleanLegalIdentifier || null,
        p_address: cleanAddress,
      }
    );

    if (conflictError) {
      console.error("duplicate customer check error:", conflictError);
      return res.status(500).json({
        error: "Nepodařilo se ověřit, zda už subjekt není zaregistrovaný.",
      });
    }

    if (conflicting && conflicting.length > 0) {
      return res.status(409).json({
        error:
          `Žádost pro ${customer.duplicateLabel} už evidujeme. Pokud potřebujete něco upravit, napište nám prosím přes stránku Kontakt.`,
      });
    }

    const createdAt = new Date().toISOString();

    const requestHeader = "Typ žádosti: standardní přístup";
    const organizationTypeLine = `Typ zákazníka: ${customer.label}`;
    const roleLine = cleanRole ? `Funkce: ${cleanRole}` : "";
    const sourceLine = `Zdroj: web archimedeslive.com/zadost?type=${customer.key}`;
    const addressLine = `Adresa: ${cleanAddress}`;
    const populationLine = cleanPopulation
      ? `Přibližný počet obyvatel: ${cleanPopulation}`
      : "";
    const legalIdentifierLine = cleanLegalIdentifier
      ? `IČO: ${cleanLegalIdentifier}`
      : "";

    const composedMessage = [
      requestHeader,
      roleLine,
      organizationTypeLine,
      addressLine,
      legalIdentifierLine,
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
          type: customer.leadType,
          contact_name: cleanName,
          email: cleanEmail,
          organization: cleanOrganization,
          phone: cleanPhone || null,
          note: composedMessage,
          status: "new",
          created_at: createdAt,
          approve_token: null,
          approve_token_created_at: null,
        },
      ])
      .select("id")
      .single();

    if (error) {
      console.error("DB error:", error);
      return res.status(500).json({ error: "DB error" });
    }

    const leadId = data?.id || "-";

    // Odeslání žádosti zakládá zvoleného zákazníka se stavem
    // pending_approval. Organizace je do ručního schválení neaktivní.
    // status: "inactive" navíc (nad rámec license_status) brání tomu, aby
    // šlo neschválenou obec obejít přes auto-generovaný join_code v
    // pages/api/join-organization.js, který kontroluje jen status
    // active/trial.
    const { data: orgRows, error: orgError } = await supabase.rpc(
      "create_pending_customer",
      {
        p_name: cleanOrganization,
        p_org_type: customer.orgType,
        p_legal_identifier: cleanLegalIdentifier || null,
        p_address: cleanAddress,
        p_contact_name: cleanName,
        p_contact_email: cleanEmail,
        p_contact_phone: cleanPhone || null,
      }
    );

    const orgData = orgRows?.[0];

    if (orgError) {
      console.error("Organization creation error:", orgError);
      await supabase.from("leads").delete().eq("id", leadId);
      if (orgError.code === "23505") {
        return res.status(409).json({
          error: `Žádost pro ${customer.duplicateLabel} už evidujeme.`,
        });
      }
      return res.status(500).json({ error: "Nepodařilo se založit čekající organizaci." });
    }

    if (!orgData?.id) {
      await supabase.from("leads").delete().eq("id", leadId);
      return res.status(500).json({ error: "Nepodařilo se ověřit vytvořenou organizaci." });
    }

    // Archiv/log žádosti je doplňkový a nesmí zablokovat
    // hotovou žádost. Supabase chybu vrací v objektu, nevyhazuje ji.
    const { error: archiveError } = await supabase.from("access_requests").insert([
      {
        license_type: customer.key,
        contact_name: cleanName,
        organization: cleanOrganization,
        address: cleanAddress,
        email: cleanEmail,
        phone: cleanPhone || null,
        message: composedMessage,
        status: "new",
        organization_id: orgData.id,
      },
    ]);
    if (archiveError) {
      console.error("access_requests archive error:", archiveError);
    }

    let emailSent = false;
    try {
      await sendRequestEmails({
        customer,
        cleanEmail,
        cleanName,
        cleanRole,
        cleanOrganization,
        cleanAddress,
        cleanPopulation,
        cleanLegalIdentifier,
        cleanMessage,
        cleanPhone,
        createdAt,
        leadId,
      });
      emailSent = true;
    } catch (emailError) {
      console.error(
        "Email send error (DB záznam už existuje, žadateli vracíme 200):",
        emailError
      );
    }

    return res.status(200).json({
      ok: true,
      message: emailSent
        ? "Žádost byla odeslána."
        : "Žádost byla zaznamenána, potvrzovací e-mail dorazí později.",
      emailSent,
    });
  } catch (e) {
    console.error("API error:", e);
    return res.status(500).json({ error: "Server error" });
  }
}
