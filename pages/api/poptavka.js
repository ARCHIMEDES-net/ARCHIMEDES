import nodemailer from "nodemailer";

function optionLabelFromKey(key) {
  const map = {
    program: "Program ARCHIMEDES Live",
    senior: "Senior klub",
    ucebna: "Učebna ARCHIMEDES",
    oboji: "Program a učebna",
    navsteva: "Návštěva vzorové učebny",
  };
  return map[key] || key || "";
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

    if (!selectedOption) {
      return res.status(400).json({ error: "Vyberte, o co máte zájem." });
    }

    if (!name || !email) {
      return res.status(400).json({ error: "Vyplňte jméno a email." });
    }

    const finalSelectedLabel =
      selectedLabel || optionLabelFromKey(selectedOption);

    const payload = {
      createdAt: new Date().toISOString(),
      selectedOption,
      selectedLabel: finalSelectedLabel,
      name,
      place: place || "",
      email,
      phone: phone || "",
      message: message || "",
    };

    console.log("=== NOVÁ POPTÁVKA ARCHIMEDES ===");
    console.log(JSON.stringify(payload, null, 2));

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: String(process.env.SMTP_SECURE || "false") === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const adminHtml = `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a;">
        <h2 style="margin-bottom:16px;">Nová poptávka z ARCHIMEDES Live</h2>

        <table cellpadding="8" cellspacing="0" border="0" style="border-collapse:collapse;">
          <tr>
            <td><strong>Typ zájmu:</strong></td>
            <td>${escapeHtml(finalSelectedLabel)}</td>
          </tr>
          <tr>
            <td><strong>Jméno:</strong></td>
            <td>${escapeHtml(name)}</td>
          </tr>
          <tr>
            <td><strong>Odkud jsou:</strong></td>
            <td>${escapeHtml(place || "-")}</td>
          </tr>
          <tr>
            <td><strong>Email:</strong></td>
            <td>${escapeHtml(email)}</td>
          </tr>
          <tr>
            <td><strong>Telefon:</strong></td>
            <td>${escapeHtml(phone || "-")}</td>
          </tr>
        </table>

        <div style="margin-top:20px;">
          <strong>Zpráva:</strong>
          <div style="margin-top:8px;padding:12px 14px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;">
            ${escapeHtml(message || "Bez doplňující zprávy.").replace(/\n/g, "<br/>")}
          </div>
        </div>

        <p style="margin-top:20px;color:#475569;font-size:14px;">
          Odesláno: ${escapeHtml(payload.createdAt)}
        </p>
      </div>
    `;

    const adminText = `
Nová poptávka z ARCHIMEDES Live

Typ zájmu: ${finalSelectedLabel}
Jméno: ${name}
Odkud jsou: ${place || "-"}
Email: ${email}
Telefon: ${phone || "-"}

Zpráva:
${message || "Bez doplňující zprávy."}

Odesláno: ${payload.createdAt}
    `.trim();

    await transporter.sendMail({
      from: process.env.MAIL_FROM || process.env.SMTP_USER,
      to: "portal@archimedeslive.com",
      replyTo: email,
      subject: `Nová poptávka – ${finalSelectedLabel}`,
      text: adminText,
      html: adminHtml,
    });

    await transporter.sendMail({
      from: process.env.MAIL_FROM || process.env.SMTP_USER,
      to: email,
      subject: "Děkujeme za váš zájem | ARCHIMEDES Live",
      text: `
Dobrý den,

děkujeme za váš zájem o ${finalSelectedLabel}.

Vaši poptávku jsme přijali a ozveme se vám co nejdříve.

S pozdravem
Tým ARCHIMEDES Live
portal@archimedeslive.com
      `.trim(),
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a;">
          <p>Dobrý den,</p>
          <p>
            děkujeme za váš zájem o <strong>${escapeHtml(finalSelectedLabel)}</strong>.
          </p>
          <p>
            Vaši poptávku jsme přijali a ozveme se vám co nejdříve.
          </p>
          <p style="margin-top:20px;">
            S pozdravem<br/>
            <strong>Tým ARCHIMEDES Live</strong><br/>
            portal@archimedeslive.com
          </p>
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
      error: "Poptávku se nepodařilo odeslat. Zkuste to prosím znovu.",
    });
  }
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
