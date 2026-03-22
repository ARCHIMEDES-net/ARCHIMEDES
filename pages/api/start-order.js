import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const SITE_URL = "https://www.archimedeslive.com";
const REDIRECT_TO = `${SITE_URL}/login`;

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

function normalizeText(value = "") {
  return String(value).trim();
}

function randomCodePart(length = 8) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let i = 0; i < length; i += 1) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

async function generateUniqueJoinCode() {
  for (let i = 0; i < 10; i += 1) {
    const joinCode = `ORG-${randomCodePart(8)}`;
    const { data, error } = await supabase
      .from("organizations")
      .select("id")
      .eq("join_code", joinCode)
      .maybeSingle();

    if (error) {
      throw new Error(`Nepodařilo se ověřit unikátnost kódu organizace: ${error.message}`);
    }

    if (!data) {
      return joinCode;
    }
  }

  throw new Error("Nepodařilo se vygenerovat unikátní kód organizace.");
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

async function getOrganizationById(id) {
  if (!id) return null;

  const { data, error } = await supabase
    .from("organizations")
    .select("id, name, ico, join_code")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`Nepodařilo se načíst organizaci: ${error.message}`);
  }

  return data || null;
}

async function getOrganizationByIco(ico) {
  if (!ico) return null;

  const { data, error } = await supabase
    .from("organizations")
    .select("id, name, ico, join_code")
    .eq("ico", ico)
    .maybeSingle();

  if (error) {
    throw new Error(`Nepodařilo se ověřit existenci organizace: ${error.message}`);
  }

  return data || null;
}

async function createOrganization({ name, ico }) {
  const joinCode = await generateUniqueJoinCode();

  const { data, error } = await supabase
    .from("organizations")
    .insert([
      {
        name,
        org_type: "school",
        status: "active",
        join_code: joinCode,
        license_status: "trial",
        ico,
      },
    ])
    .select("id, name, ico, join_code")
    .single();

  if (error || !data?.id) {
    throw new Error(
      `Nepodařilo se vytvořit organizaci: ${error?.message || "neznámá chyba"}`
    );
  }

  return data;
}

async function ensureProfile({
  userId,
  email,
  fullName,
}) {
  const { error } = await supabase.from("profiles").upsert(
    {
      id: userId,
      email,
      full_name: fullName,
      is_active: true,
      must_set_password: true,
    },
    { onConflict: "id" }
  );

  if (error) {
    throw new Error(`Nepodařilo se uložit profil administrátora: ${error.message}`);
  }
}

async function ensureMembership({
  organizationId,
  userId,
  roleInOrg = "organization_admin",
}) {
  const { error } = await supabase
    .from("organization_members")
    .upsert(
      {
        organization_id: organizationId,
        user_id: userId,
        role_in_org: roleInOrg,
        status: "active",
      },
      { onConflict: "user_id,organization_id" }
    );

  if (error) {
    throw new Error(
      `Nepodařilo se přiřadit administrátora do organizace: ${error.message}`
    );
  }
}

async function checkUserActiveMemberships(userId) {
  const { data, error } = await supabase
    .from("organization_members")
    .select("organization_id, status")
    .eq("user_id", userId)
    .eq("status", "active");

  if (error) {
    throw new Error(
      `Nepodařilo se ověřit existující členství administrátora: ${error.message}`
    );
  }

  return data || [];
}

async function inviteAdminUser({ adminEmail, contactName }) {
  const { data, error } = await supabase.auth.admin.inviteUserByEmail(adminEmail, {
    redirectTo: REDIRECT_TO,
    data: {
      full_name: contactName,
    },
  });

  if (error) {
    throw new Error(`Nepodařilo se pozvat administrátora: ${error.message}`);
  }

  const adminUserId = data?.user?.id;
  if (!adminUserId) {
    throw new Error("Nepodařilo se získat ID administrátora školy.");
  }

  return adminUserId;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  let orderId = null;
  let organizationId = null;
  let adminUserId = null;
  let joinCode = null;

  try {
    const data = req.body || {};

    const schoolNameRaw = normalizeText(data.schoolName);
    const icoRaw = normalizeText(data.ico);
    const streetRaw = normalizeText(data.street);
    const cityRaw = normalizeText(data.city);
    const zipRaw = normalizeText(data.zip);
    const contactNameRaw = normalizeText(data.contactName);
    const roleRaw = normalizeText(data.role);
    const emailRaw = normalizeEmail(data.email);
    const adminEmailRaw = normalizeEmail(data.adminEmail);
    const phoneRaw = normalizeText(data.phone);
    const noteRaw = normalizeText(data.note);

    const currentUserId = normalizeText(data.currentUserId);
    const currentOrganizationId = normalizeText(data.currentOrganizationId);
    const currentOrganizationName = normalizeText(data.currentOrganizationName);

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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailRaw) || !emailRegex.test(adminEmailRaw)) {
      return res.status(400).json({
        error: "Prosím zadejte platné e-mailové adresy.",
      });
    }

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

    const { data: insertedOrder, error: dbError } = await supabase
      .from("orders_start")
      .insert([
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
          legal_version: "2026-03-start-v2",
          ip_address: clientIp,
          user_agent: userAgent,
          submitted_at: now,
        },
      ])
      .select("id")
      .single();

    if (dbError || !insertedOrder?.id) {
      console.error("DB ERROR:", dbError);
      throw new Error("Chyba uložení do databáze");
    }

    orderId = insertedOrder.id;

    let onboardingStatus = "completed";
    let onboardingError = null;
    let onboardingMode = "existing_user";

    try {
      let organization = null;

      if (currentOrganizationId) {
        organization = await getOrganizationById(currentOrganizationId);

        if (!organization) {
          throw new Error("Navázaná organizace z přihlášení nebyla nalezena.");
        }

        organizationId = organization.id;
        joinCode = organization.join_code;
      } else {
        organization = await getOrganizationByIco(icoRaw);

        if (!organization) {
          onboardingMode = "new_user";
          organization = await createOrganization({
            name: schoolNameRaw,
            ico: icoRaw,
          });
        } else {
          onboardingMode = currentUserId ? "existing_user" : "matched_by_ico";
        }

        organizationId = organization.id;
        joinCode = organization.join_code;
      }

      if (currentUserId) {
        adminUserId = currentUserId;

        const memberships = await checkUserActiveMemberships(adminUserId);
        const hasOtherActiveOrg = memberships.some(
          (m) => m.organization_id !== organizationId
        );

        if (hasOtherActiveOrg) {
          throw new Error("Přihlášený uživatel je přiřazen k jiné aktivní organizaci.");
        }

        await ensureProfile({
          userId: adminUserId,
          email: adminEmailRaw,
          fullName: contactNameRaw,
        });

        await ensureMembership({
          organizationId,
          userId: adminUserId,
          roleInOrg: "organization_admin",
        });
      } else {
        adminUserId = await inviteAdminUser({
          adminEmail: adminEmailRaw,
          contactName: contactNameRaw,
        });

        const memberships = await checkUserActiveMemberships(adminUserId);
        const hasOtherActiveOrg = memberships.some(
          (m) => m.organization_id !== organizationId
        );

        if (hasOtherActiveOrg) {
          throw new Error("Administrátor už je přiřazen k jiné aktivní organizaci.");
        }

        await ensureProfile({
          userId: adminUserId,
          email: adminEmailRaw,
          fullName: contactNameRaw,
        });

        await ensureMembership({
          organizationId,
          userId: adminUserId,
          roleInOrg: "organization_admin",
        });
      }

      const { error: onboardingUpdateError } = await supabase
        .from("orders_start")
        .update({
          organization_id: organizationId,
          admin_user_id: adminUserId,
          onboarding_status: "completed",
          onboarding_error: null,
        })
        .eq("id", orderId);

      if (onboardingUpdateError) {
        throw new Error(
          `Nepodařilo se zapsat stav onboardingu: ${onboardingUpdateError.message}`
        );
      }
    } catch (onboardingErr) {
      onboardingStatus = "failed";
      onboardingError = onboardingErr.message || "Neznámá chyba onboardingu.";

      console.error("ONBOARDING ERROR:", onboardingErr);

      const { error: updateOrderError } = await supabase
        .from("orders_start")
        .update({
          organization_id: organizationId,
          admin_user_id: adminUserId,
          onboarding_status,
          onboarding_error: onboardingError,
        })
        .eq("id", orderId);

      if (updateOrderError) {
        console.error("ORDER UPDATE ERROR:", updateOrderError);
      }
    }

    const transporter = createTransporter();

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
    const safeJoinCode = escapeHtml(joinCode || "-");
    const safeOnboardingStatus = escapeHtml(onboardingStatus);
    const safeOnboardingError = escapeHtml(onboardingError || "-");
    const safeOnboardingMode = escapeHtml(onboardingMode);
    const safeCurrentOrganizationName = escapeHtml(currentOrganizationName || "-");

    const subject = `🟢 START – ${schoolNameRaw} (IČO: ${icoRaw})`;

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
          <li>Objednání START s povinností úhrady: ano</li>
        </ul>

        <hr/>

        <p><strong>Režim objednávky:</strong> ${safeOnboardingMode}</p>
        <p><strong>Organizace z klienta:</strong> ${safeCurrentOrganizationName}</p>
        <p><strong>Kód organizace:</strong> ${safeJoinCode}</p>
        <p><strong>Onboarding stav:</strong> ${safeOnboardingStatus}</p>
        <p><strong>Onboarding chyba:</strong> ${safeOnboardingError}</p>
        <p><strong>Právní verze:</strong> 2026-03-start-v2</p>
        <p><strong>Odesláno:</strong> ${escapeHtml(now)}</p>
        <p><strong>IP:</strong> ${escapeHtml(clientIp || "-")}</p>
      `,
    });

    await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: emailRaw,
      subject: "Potvrzení objednávky – ARCHIMEDES Live",
      html: `
        <h2>Děkujeme za objednávku</h2>

        <p>Vaše objednávka balíčku <strong>START</strong> byla přijata.</p>

        <p><strong>Škola / organizace:</strong> ${schoolName}</p>
        <p><strong>Objednatel:</strong> ${contactName}</p>
        <p><strong>Administrátor programu:</strong> ${adminEmail}</p>
        <p><strong>Období:</strong> duben–září 2026</p>
        <p><strong>Cena:</strong> 4 990 Kč bez DPH</p>

        <p>
          Odesláním objednávky došlo k objednání balíčku START programu
          ARCHIMEDES Live.
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

        <p>S pozdravem,<br/>
        <strong>ARCHIMEDES Live</strong><br/>
        EduVision s.r.o.</p>
      `,
    });

    if (onboardingStatus === "completed" && !currentUserId) {
      await transporter.sendMail({
        from: process.env.MAIL_FROM,
        to: adminEmailRaw,
        subject: "Administrátorský přístup – ARCHIMEDES Live",
        html: `
          <h2>Byl vám vytvořen administrátorský přístup</h2>

          <p>Pro školu <strong>${schoolName}</strong> jsme připravili přístup do ARCHIMEDES Live.</p>

          <p><strong>Vaše role:</strong> administrátor školy</p>
          <p><strong>E-mail administrátora:</strong> ${adminEmail}</p>
          <p><strong>Kód organizace:</strong> ${safeJoinCode}</p>

          <p>
            Pro dokončení přístupu použijte odkaz z pozvánky, který vám byl odeslán
            systémem, a následně se přihlaste zde:
            <br/>
            <a href="${REDIRECT_TO}">${REDIRECT_TO}</a>
          </p>

          <p>
            Po přihlášení můžete v portálu přidávat další kolegy učitele a spravovat
            přístup školy.
          </p>

          <p>S pozdravem,<br/>
          <strong>ARCHIMEDES Live</strong><br/>
          EduVision s.r.o.</p>
        `,
      });
    }

    return res.status(200).json({
      success: true,
      onboardingStatus,
    });
  } catch (err) {
    console.error("SERVER ERROR:", err);

    return res.status(500).json({
      error: "Objednávku se nepodařilo odeslat. Zkuste to prosím znovu.",
    });
  }
}
