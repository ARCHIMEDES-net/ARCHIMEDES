import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";
import { getBearerToken } from "../../lib/server/platformAdminApi";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.archimedeslive.com";

const ELIGIBLE_ORG_TYPES = ["spolek", "school"];

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Nový příjemce dostane v našem potvrzovacím e-mailu jednorázový odkaz pro
// nastavení hesla. Existujícímu přihlášenému účtu heslo ani e-mail neměníme.
async function sendConfirmationEmail({
  email,
  fullName,
  organizationName,
  interestLabels,
  setupUrl,
}) {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT);
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const mailFrom = process.env.MAIL_FROM;

  if (!smtpHost || !smtpPort || !smtpUser || !smtpPass || !mailFrom) {
    throw new Error("SMTP config missing");
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: { user: smtpUser, pass: smtpPass },
  });

  const safeName = escapeHtml(fullName || "");
  const safeOrg = escapeHtml(organizationName || "");
  const listHtml = interestLabels.map((label) => `<li>${escapeHtml(label)}</li>`).join("");

  await transporter.sendMail({
    from: mailFrom,
    to: email,
    subject: "ARCHIMEDES Live – upozornění na vysílání nastavena",
    text: `Dobrý den${fullName ? ` ${fullName}` : ""},

jste zaregistrováni k upozornění na vysílání a program ARCHIMEDES Live pro organizaci ${organizationName}.

Vybrané okruhy:
${interestLabels.map((l) => `- ${l}`).join("\n")}

Kdykoliv si výběr můžete upravit ve svém profilu na ${SITE_URL}/login.
${setupUrl ? `\nNejprve si nastavte heslo: ${setupUrl}\n` : ""}

Tým ARCHIMEDES Live
${SITE_URL}`,
    html: `
      <div style="font-family:Segoe UI,Arial,sans-serif;color:#0f172a;line-height:1.6;">
        <p>Dobrý den${safeName ? ` ${safeName}` : ""},</p>
        <p>jste zaregistrováni k <strong>upozornění na vysílání a program ARCHIMEDES Live</strong> pro organizaci <strong>${safeOrg}</strong>.</p>
        <p><strong>Vybrané okruhy:</strong></p>
        <ul>${listHtml}</ul>
        ${
          setupUrl
            ? `<p><a href="${escapeHtml(setupUrl)}" style="display:inline-block;padding:12px 18px;border-radius:10px;background:#1d4ed8;color:#fff;text-decoration:none;font-weight:700;">Nastavit heslo</a></p>`
            : ""
        }
        <p>Kdykoliv si výběr můžete upravit ve svém profilu na <a href="${escapeHtml(SITE_URL)}/login">${escapeHtml(SITE_URL)}/login</a>.</p>
        <p>Tým ARCHIMEDES Live<br/><a href="${escapeHtml(SITE_URL)}">${escapeHtml(SITE_URL)}</a></p>
      </div>
    `,
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { joinCode, fullName, email, activityCodes } = req.body || {};
    const token = getBearerToken(req);
    let authenticatedUser = null;

    if (token) {
      const {
        data: { user },
        error: userError,
      } = await supabaseAdmin.auth.getUser(token);

      if (userError || !user) {
        return res.status(401).json({ error: "Neplatné nebo expirované přihlášení." });
      }

      authenticatedUser = user;
    }

    const cleanJoinCode = String(joinCode || "").trim().toUpperCase();
    const cleanFullName = String(
      fullName || authenticatedUser?.user_metadata?.full_name || ""
    ).trim();
    const cleanEmail = String(authenticatedUser?.email || email || "")
      .trim()
      .toLowerCase();
    const cleanActivityCodes = Array.isArray(activityCodes)
      ? [...new Set(activityCodes.map((c) => String(c || "").trim()).filter(Boolean))]
      : [];

    if (!cleanJoinCode) {
      return res.status(400).json({ error: "Vyplňte prosím kód organizace." });
    }

    if (!cleanFullName || cleanFullName.length < 2) {
      return res.status(400).json({ error: "Vyplňte prosím jméno a příjmení." });
    }

    if (!isValidEmail(cleanEmail)) {
      return res.status(400).json({ error: "Zadejte prosím platný e-mail." });
    }

    if (cleanActivityCodes.length === 0) {
      return res.status(400).json({ error: "Vyberte prosím alespoň jeden okruh." });
    }

    const { data: organization, error: orgError } = await supabaseAdmin
      .from("organizations")
      .select("id, name, org_type, status")
      .eq("join_code", cleanJoinCode)
      .maybeSingle();

    if (orgError) {
      console.error("organization lookup error:", orgError);
      return res.status(500).json({ error: "Nepodařilo se ověřit kód organizace." });
    }

    if (!organization) {
      return res.status(404).json({
        error: "Organizace s tímto kódem neexistuje. Zkontrolujte prosím kód se svým spolkem nebo školou.",
      });
    }

    // Kód platí, ale patří organizaci, která tuhle funkci nemá (např. obec)
    // — samostatná chyba od "kód neexistuje", ať to jde snadno odlišit.
    if (!ELIGIBLE_ORG_TYPES.includes(organization.org_type)) {
      return res.status(400).json({
        error:
          "Osobní upozornění si teď mohou nastavit jen lidé navázaní na spolek nebo školu. Tenhle kód patří jinému typu organizace.",
      });
    }

    if (organization.status !== "active") {
      return res.status(403).json({
        error: "Tato organizace zatím není aktivní, zkuste to prosím později.",
      });
    }

    const { data: activities, error: activitiesError } = await supabaseAdmin
      .from("activity_categories")
      .select("code, label, is_active")
      .in("code", cleanActivityCodes);

    if (activitiesError) {
      console.error("activity_categories lookup error:", activitiesError);
      return res.status(500).json({ error: "Nepodařilo se ověřit vybrané okruhy." });
    }

    const validActivities = (activities || []).filter((a) => a.is_active);

    if (validActivities.length !== cleanActivityCodes.length) {
      return res.status(400).json({ error: "Vybrali jste neplatný okruh zájmu." });
    }

    // Existující preference lze měnit pouze po přihlášení pod stejným UUID.
    const { data: existingProfiles, error: existingProfileError } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .ilike("email", cleanEmail)
      .limit(1);

    if (existingProfileError) {
      console.error("existing profile lookup error:", existingProfileError);
      return res.status(500).json({ error: "Nepodařilo se ověřit e-mail." });
    }

    let profileId = existingProfiles?.[0]?.id || null;
    let setupUrl = "";

    if (profileId && authenticatedUser?.id !== profileId) {
      return res.status(409).json({
        error: "Účet s tímto e-mailem už existuje. Přihlaste se a formulář odešlete znovu.",
        accountExists: true,
      });
    }

    if (!profileId && authenticatedUser?.id) {
      profileId = authenticatedUser.id;
    }

    const isNewAccount = !profileId;

    if (isNewAccount) {
      const { data: createdUser, error: createUserError } =
        await supabaseAdmin.auth.admin.createUser({
          email: cleanEmail,
          email_confirm: true,
          user_metadata: { full_name: cleanFullName },
        });

      if (createUserError) {
        console.error("createUser error:", createUserError);
        return res.status(500).json({ error: "Nepodařilo se založit profil." });
      }

      profileId = createdUser?.user?.id;

      if (!profileId) {
        return res.status(500).json({ error: "Nepodařilo se založit profil." });
      }

      const { data: linkData, error: linkError } =
        await supabaseAdmin.auth.admin.generateLink({
          type: "recovery",
          email: cleanEmail,
          options: { redirectTo: `${SITE_URL}/nastavit-heslo` },
        });

      if (linkError) {
        console.error("password setup link error:", linkError);
        await supabaseAdmin.auth.admin.deleteUser(profileId);
        return res.status(500).json({ error: "Nepodařilo se připravit bezpečný odkaz pro nastavení hesla." });
      }

      setupUrl = linkData?.properties?.action_link || "";

      if (!setupUrl) {
        await supabaseAdmin.auth.admin.deleteUser(profileId);
        return res.status(500).json({ error: "Nepodařilo se připravit bezpečný odkaz pro nastavení hesla." });
      }
    }

    if (isNewAccount || !existingProfiles?.length) {
      const { error: profileUpsertError } = await supabaseAdmin
        .from("profiles")
        .upsert(
          {
            id: profileId,
            email: cleanEmail,
            full_name: cleanFullName,
            is_active: true,
            must_set_password: isNewAccount,
            user_type: "individual",
          },
          { onConflict: "id" }
        );

      if (profileUpsertError) {
        console.error("profile upsert error:", profileUpsertError);
        if (isNewAccount) await supabaseAdmin.auth.admin.deleteUser(profileId);
        return res.status(500).json({ error: "Nepodařilo se uložit profil." });
      }
    }

    const preferenceRows = cleanActivityCodes.map((code) => ({
      profile_id: profileId,
      activity_code: code,
      enabled: true,
    }));

    const { error: preferencesError } = await supabaseAdmin
      .from("notification_preferences")
      .upsert(preferenceRows, { onConflict: "profile_id,activity_code" });

    if (preferencesError) {
      console.error("notification_preferences upsert error:", preferencesError);
      if (isNewAccount) await supabaseAdmin.auth.admin.deleteUser(profileId);
      return res.status(500).json({ error: "Nepodařilo se uložit vybrané okruhy." });
    }

    let emailSent = false;
    try {
      await sendConfirmationEmail({
        email: cleanEmail,
        fullName: cleanFullName,
        organizationName: organization.name,
        interestLabels: validActivities.map((a) => a.label),
        setupUrl,
      });
      emailSent = true;
    } catch (emailError) {
      console.error(
        "Confirmation email error (DB záznam už existuje, žadateli vracíme 200):",
        emailError
      );
    }

    return res.status(200).json({
      ok: true,
      organizationName: organization.name,
      emailSent,
      existingAccount: !isNewAccount,
    });
  } catch (err) {
    console.error("pridat-se-k-organizaci API error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
