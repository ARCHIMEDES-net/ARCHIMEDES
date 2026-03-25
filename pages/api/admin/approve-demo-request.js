// pages/api/admin/approve-demo-request.js
import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";

const SUPABASE_URL =
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;

const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error(
    "Chybí SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL nebo SUPABASE_SERVICE_ROLE_KEY."
  );
}

const supabaseAdmin = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY
);

const DEMO_ORG_NAME = "ARCHIMEDES DEMO SKOLA";
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.archimedeslive.com";
const REDIRECT_TO = `${SITE_URL}/nastavit-heslo`;

function normServer(v) {
  return (v ?? "").toString().trim();
}

function normalizeEmail(value = "") {
  return String(value || "").trim().toLowerCase();
}

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getBearerToken(req) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || typeof authHeader !== "string") return null;

  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : null;
}

function assertMailConfig() {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT);
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const mailFrom = process.env.MAIL_FROM;

  if (!smtpHost || !smtpPort || !smtpUser || !smtpPass || !mailFrom) {
    throw new Error("E-mailová služba není správně nastavena.");
  }

  return {
    smtpHost,
    smtpPort,
    smtpUser,
    smtpPass,
    mailFrom,
  };
}

function createTransporter() {
  const { smtpHost, smtpPort, smtpUser, smtpPass } = assertMailConfig();

  return nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort === 465 ? 465 : smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });
}

async function sendMailLogged(transporter, { label, ...message }) {
  try {
    const info = await transporter.sendMail(message);

    console.log("MAIL SENT:", {
      label,
      accepted: info?.accepted || [],
      rejected: info?.rejected || [],
      messageId: info?.messageId || "",
      response: info?.response || "",
    });

    return info;
  } catch (error) {
    console.error("MAIL ERROR:", {
      label,
      message: error?.message || "Neznámá chyba",
      stack: error?.stack || "",
    });
    throw error;
  }
}

async function findAuthUserByEmail(email) {
  const target = normalizeEmail(email);
  let page = 1;
  const perPage = 200;

  while (true) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      page,
      perPage,
    });

    if (error) {
      throw new Error(error.message || "Nepodařilo se načíst uživatele.");
    }

    const users = data?.users || [];
    const found = users.find(
      (u) => normalizeEmail(u.email || "") === target
    );

    if (found) return found;
    if (users.length < perPage) return null;

    page += 1;
  }
}

async function getSingleDemoOrganization() {
  const { data: demoOrgs, error } = await supabaseAdmin
    .from("organizations")
    .select("id, name, join_code")
    .eq("name", DEMO_ORG_NAME);

  if (error) {
    throw new Error(error.message || "Nepodařilo se načíst demo organizaci.");
  }

  if (!demoOrgs || demoOrgs.length === 0) {
    throw new Error(`Demo organizace ${DEMO_ORG_NAME} nebyla nalezena.`);
  }

  if (demoOrgs.length > 1) {
    throw new Error(
      `V databázi existuje více organizací se jménem ${DEMO_ORG_NAME}. Nejprve je potřeba odstranit duplicity.`
    );
  }

  return demoOrgs[0];
}

async function ensureDemoMembership({ userId, demoOrgId }) {
  const { data: memberships, error: membershipReadError } = await supabaseAdmin
    .from("organization_members")
    .select("id, organization_id, user_id, role_in_org, status")
    .eq("user_id", userId);

  if (membershipReadError) {
    throw new Error(
      membershipReadError.message ||
        "Nepodařilo se načíst členství uživatele."
    );
  }

  const demoMemberships = (memberships || []).filter(
    (m) => m.organization_id === demoOrgId
  );

  if (demoMemberships.length > 1) {
    throw new Error(
      "U uživatele existuje více členství ve stejné demo organizaci. Nejprve je potřeba odstranit duplicity."
    );
  }

  const existingDemoMembership = demoMemberships[0];

  if (existingDemoMembership?.id) {
    const { error: membershipUpdateError } = await supabaseAdmin
      .from("organization_members")
      .update({
        role_in_org: "demo_viewer",
        status: "active",
      })
      .eq("id", existingDemoMembership.id);

    if (membershipUpdateError) {
      throw new Error(
        membershipUpdateError.message ||
          "Nepodařilo se aktivovat demo členství."
      );
    }

    return existingDemoMembership.id;
  }

  const { data: insertedMembership, error: membershipInsertError } =
    await supabaseAdmin
      .from("organization_members")
      .insert({
        organization_id: demoOrgId,
        user_id: userId,
        role_in_org: "demo_viewer",
        status: "active",
      })
      .select("id")
      .single();

  if (membershipInsertError) {
    throw new Error(
      membershipInsertError.message ||
        "Nepodařilo se vytvořit demo členství."
    );
  }

  return insertedMembership?.id || null;
}

async function upsertProfileForDemo({
  userId,
  email,
  contactName,
  demoOrgId,
}) {
  const { error: profileError } = await supabaseAdmin.from("profiles").upsert(
    {
      id: userId,
      email,
      full_name: contactName || null,
      user_type: "organization",
      must_set_password: true,
      active_organization_id: demoOrgId,
    },
    { onConflict: "id" }
  );

  if (profileError) {
    throw new Error(
      profileError.message || "Nepodařilo se uložit profil uživatele."
    );
  }
}

async function generateRecoveryLink(email) {
  const { data, error } = await supabaseAdmin.auth.admin.generateLink({
    type: "recovery",
    email,
    options: {
      redirectTo: REDIRECT_TO,
    },
  });

  if (error) {
    throw new Error(
      error.message || "Nepodařilo se vygenerovat odkaz pro nastavení hesla."
    );
  }

  const actionLink =
    data?.properties?.action_link ||
    data?.properties?.hashed_token_link ||
    data?.action_link ||
    "";

  if (!actionLink) {
    throw new Error("Nepodařilo se získat odkaz pro nastavení hesla.");
  }

  return actionLink;
}

function buildDemoApprovalEmail({
  contactName,
  organization,
  actionLink,
}) {
  const safeName = escapeHtml(contactName || "");
  const safeOrganization = escapeHtml(organization || "");
  const safeActionLink = escapeHtml(actionLink);

  const subject = "ARCHIMEDES Live – schválený ukázkový přístup";

  const text = `
Dobrý den${contactName ? ` ${contactName}` : ""},

váš ukázkový přístup do ARCHIMEDES Live byl schválen.

${organization ? `Organizace uvedená v žádosti: ${organization}\n` : ""}
Pro nastavení hesla a vstup do ukázkového prostředí použijte tento odkaz:
${actionLink}

Po nastavení hesla se můžete přihlásit do ukázkového režimu ARCHIMEDES Live.

Pokud by odkaz nefungoval nebo vypršel, ozvěte se prosím a pošleme vám nový.

ARCHIMEDES Live
${SITE_URL}
  `.trim();

  const html = `
    <div style="font-family:Segoe UI,Arial,sans-serif;color:#0f172a;line-height:1.6;">
      <p>Dobrý den${safeName ? ` ${safeName}` : ""},</p>

      <p>váš <strong>ukázkový přístup do ARCHIMEDES Live</strong> byl schválen.</p>

      ${
        safeOrganization
          ? `<p><strong>Organizace uvedená v žádosti:</strong> ${safeOrganization}</p>`
          : ""
      }

      <p>Pro nastavení hesla a vstup do ukázkového prostředí použijte toto tlačítko:</p>

      <p style="margin:24px 0;">
        <a
          href="${safeActionLink}"
          style="
            display:inline-block;
            padding:14px 20px;
            border-radius:14px;
            background:#0f172a;
            color:#ffffff;
            text-decoration:none;
            font-weight:700;
          "
        >
          Nastavit heslo a otevřít DEMO
        </a>
      </p>

      <p>Pokud by tlačítko nefungovalo, použijte tento odkaz:</p>
      <p style="word-break:break-all;">
        <a href="${safeActionLink}">${safeActionLink}</a>
      </p>

      <p>Po nastavení hesla se můžete přihlásit do ukázkového režimu ARCHIMEDES Live.</p>

      <p>Pokud by odkaz nefungoval nebo vypršel, ozvěte se prosím a pošleme vám nový.</p>

      <p style="margin-top:28px;">
        ARCHIMEDES Live<br />
        <a href="${escapeHtml(SITE_URL)}">${escapeHtml(SITE_URL)}</a>
      </p>
    </div>
  `.trim();

  return { subject, text, html };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const token = getBearerToken(req);

    if (!token) {
      return res.status(401).json({ error: "Chybí autorizace uživatele." });
    }

    const {
      data: { user: actingUser },
      error: userError,
    } = await supabaseAdmin.auth.getUser(token);

    if (userError || !actingUser) {
      return res.status(401).json({ error: "Neplatné nebo expirované přihlášení." });
    }

    const { data: adminRow, error: adminCheckError } = await supabaseAdmin
      .from("platform_admins")
      .select("user_id")
      .eq("user_id", actingUser.id)
      .maybeSingle();

    if (adminCheckError) {
      throw adminCheckError;
    }

    if (!adminRow?.user_id) {
      return res.status(403).json({
        error: "Tuto akci může provádět pouze platform admin.",
      });
    }

    const { requestId } = req.body || {};

    if (!requestId) {
      return res.status(400).json({ error: "Chybí requestId." });
    }

    const { data: lead, error: leadError } = await supabaseAdmin
      .from("leads")
      .select("id, type, organization, contact_name, email, note, status")
      .eq("id", requestId)
      .maybeSingle();

    if (leadError) {
      return res.status(500).json({ error: leadError.message });
    }

    if (!lead) {
      return res.status(404).json({ error: "Žádost nebyla nalezena." });
    }

    const email = normalizeEmail(lead.email || "");
    const contactName = normServer(lead.contact_name);
    const organization = normServer(lead.organization);

    if (!email) {
      return res.status(400).json({ error: "Žádost nemá e-mail." });
    }

    const demoOrg = await getSingleDemoOrganization();

    let user = await findAuthUserByEmail(email);

    if (!user) {
      const { data: createData, error: createError } =
        await supabaseAdmin.auth.admin.createUser({
          email,
          email_confirm: true,
          user_metadata: {
            full_name: contactName || "",
          },
        });

      if (createError) {
        return res.status(500).json({ error: createError.message });
      }

      user = createData?.user;
    }

    if (!user?.id) {
      return res.status(500).json({ error: "Nepodařilo se získat user_id." });
    }

    await upsertProfileForDemo({
      userId: user.id,
      email,
      contactName,
      demoOrgId: demoOrg.id,
    });

    await ensureDemoMembership({
      userId: user.id,
      demoOrgId: demoOrg.id,
    });

    const actionLink = await generateRecoveryLink(email);

    const transporter = createTransporter();
    const { mailFrom } = assertMailConfig();
    const mail = buildDemoApprovalEmail({
      contactName,
      organization,
      actionLink,
    });

    await sendMailLogged(transporter, {
      label: "approve-demo-request",
      from: mailFrom,
      to: email,
      subject: mail.subject,
      text: mail.text,
      html: mail.html,
    });

    const approvalNote = [
      normServer(lead.note),
      "",
      `Demo schváleno: ${new Date().toISOString()}`,
      `Schválil platform admin: ${actingUser.email || actingUser.id}`,
      `Demo organizace: ${demoOrg.name}`,
      `Uživatel: ${email}`,
      `Nastaven active_organization_id: ${demoOrg.id}`,
      `Odeslán vlastní e-mail s recovery odkazem na: ${REDIRECT_TO}`,
      organization ? `Žadatel uvedl organizaci: ${organization}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const { error: leadUpdateError } = await supabaseAdmin
      .from("leads")
      .update({
        status: "approved",
        note: approvalNote,
      })
      .eq("id", lead.id);

    if (leadUpdateError) {
      return res.status(500).json({ error: leadUpdateError.message });
    }

    return res.status(200).json({
      success: true,
      message:
        "Demo přístup byl schválen a byl odeslán e-mail pro nastavení hesla.",
      email,
      userId: user.id,
      organizationId: demoOrg.id,
    });
  } catch (e) {
    console.error("APPROVE DEMO REQUEST ERROR:", e);

    return res.status(500).json({
      error: e?.message || "Schválení demo přístupu se nepodařilo.",
    });
  }
}
