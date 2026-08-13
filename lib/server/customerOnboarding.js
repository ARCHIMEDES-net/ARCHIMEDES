import nodemailer from "nodemailer";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class CustomerOnboardingError extends Error {
  constructor(message, status = 400, code = "ONBOARDING_ERROR") {
    super(message);
    this.name = "CustomerOnboardingError";
    this.status = status;
    this.code = code;
  }
}

export function parseCentralAdminUserIds(value) {
  const ids = [
    ...new Set(
      String(value || "")
        .split(",")
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean)
    ),
  ];

  if (ids.length === 0) {
    throw new CustomerOnboardingError(
      "Nejsou nakonfigurováni centrální správci onboardingu.",
      500,
      "CENTRAL_ADMINS_NOT_CONFIGURED"
    );
  }
  if (ids.length > 10 || ids.some((id) => !UUID_PATTERN.test(id))) {
    throw new CustomerOnboardingError(
      "Konfigurace centrálních správců není platná.",
      500,
      "CENTRAL_ADMINS_INVALID"
    );
  }

  return ids.sort();
}

export async function resolveConfiguredCentralAdmins({
  supabaseAdmin,
  configuredUserIds,
}) {
  const uniqueIds = [...new Set(configuredUserIds)];
  const [{ data: adminRows, error: adminError }, { data: profiles, error: profileError }] =
    await Promise.all([
      supabaseAdmin
        .from("platform_admins")
        .select("user_id, role")
        .in("user_id", uniqueIds),
      supabaseAdmin
        .from("profiles")
        .select("id, email, full_name, is_active")
        .in("id", uniqueIds),
    ]);

  if (adminError) throw adminError;
  if (profileError) throw profileError;

  const adminById = new Map((adminRows || []).map((row) => [row.user_id, row]));
  const profileById = new Map((profiles || []).map((profile) => [profile.id, profile]));

  for (const userId of uniqueIds) {
    const profile = profileById.get(userId);
    const platformAdmin = adminById.get(userId);
    if (
      !["admin", "super_admin"].includes(platformAdmin?.role) ||
      !profile?.email ||
      profile.is_active !== true
    ) {
      throw new CustomerOnboardingError(
        "Některý nakonfigurovaný centrální správce nemá platný aktivní účet platformového správce.",
        409,
        "CENTRAL_ADMIN_INVALID"
      );
    }

    const { data: authUser, error: authError } =
      await supabaseAdmin.auth.admin.getUserById(userId);
    if (
      authError ||
      !authUser?.user ||
      String(authUser.user.email || "").trim().toLowerCase() !==
        String(profile.email).trim().toLowerCase()
    ) {
      throw new CustomerOnboardingError(
        "Některý nakonfigurovaný centrální správce nemá konzistentní Auth účet a profil.",
        409,
        "CENTRAL_ADMIN_IDENTITY_MISMATCH"
      );
    }
  }

  return uniqueIds;
}

async function findAuthUserByEmail(supabaseAdmin, email) {
  const matches = [];

  for (let page = 1; page <= 10; page += 1) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      page,
      perPage: 1000,
    });
    if (error) throw error;

    const users = data?.users || [];
    matches.push(
      ...users.filter(
        (user) => String(user.email || "").trim().toLowerCase() === email
      )
    );
    if (users.length < 1000) break;
  }

  if (matches.length > 1) {
    throw new CustomerOnboardingError(
      "Pro e-mail lokálního správce existuje více Auth účtů. Je nutná ruční kontrola.",
      409,
      "DUPLICATE_AUTH_USER"
    );
  }

  return matches[0] || null;
}

async function generatePasswordSetupLink(supabaseAdmin, email, redirectTo) {
  const { data, error } = await supabaseAdmin.auth.admin.generateLink({
    type: "recovery",
    email,
    options: { redirectTo },
  });
  const setupUrl = data?.properties?.action_link || "";

  if (error || !setupUrl) {
    throw new Error("Nepodařilo se připravit odkaz pro nastavení hesla.");
  }
  return setupUrl;
}

function authUserBelongsToOnboarding(user, idempotencyKey, organizationId) {
  const metadata = user?.user_metadata || {};
  return (
    metadata.archimedes_onboarding_idempotency_key === idempotencyKey &&
    metadata.archimedes_onboarding_organization_id === organizationId &&
    metadata.archimedes_onboarding_managed === true
  );
}

async function loadAuthPreparation(supabaseAdmin, idempotencyKey) {
  const { data, error } = await supabaseAdmin
    .from("organization_onboarding_auth_preparations")
    .select("*")
    .eq("idempotency_key", idempotencyKey)
    .maybeSingle();
  if (error) throw error;
  return data || null;
}

async function claimAuthPreparation({
  supabaseAdmin,
  idempotencyKey,
  organizationId,
  email,
  fullName,
  performedBy,
}) {
  const now = new Date().toISOString();
  const { data: inserted, error: insertError } = await supabaseAdmin
    .from("organization_onboarding_auth_preparations")
    .insert({
      idempotency_key: idempotencyKey,
      organization_id: organizationId,
      local_admin_email: email,
      local_admin_full_name: fullName,
      created_by: performedBy,
      status: "preparing",
      updated_at: now,
    })
    .select("*")
    .maybeSingle();

  if (!insertError && inserted) return inserted;
  if (!insertError) {
    throw new Error("Nepodařilo se založit audit přípravy Auth účtu.");
  }
  if (insertError?.code !== "23505") throw insertError;

  const existing = await loadAuthPreparation(supabaseAdmin, idempotencyKey);
  if (
    !existing ||
    existing.organization_id !== organizationId ||
    String(existing.local_admin_email || "").toLowerCase() !== email ||
    existing.local_admin_full_name !== fullName
  ) {
    throw new CustomerOnboardingError(
      "Identifikátor onboardingu už patří jiné přípravě Auth účtu.",
      409,
      "AUTH_PREPARATION_CONFLICT"
    );
  }

  const canRetryWithoutAuth = ["preparing", "rolled_back"].includes(
    existing.status
  );
  if (!canRetryWithoutAuth) {
    throw new CustomerOnboardingError(
      "Předchozí příprava Auth účtu vyžaduje ruční kontrolu.",
      409,
      "AUTH_PREPARATION_MANUAL_REVIEW"
    );
  }

  const updatedAt = new Date(existing.updated_at || existing.created_at).getTime();
  if (
    existing.status === "preparing" &&
    Number.isFinite(updatedAt) &&
    Date.now() - updatedAt < 5 * 60 * 1000
  ) {
    throw new CustomerOnboardingError(
      "Přípravu Auth účtu právě zpracovává jiný požadavek. Zkuste stav za chvíli obnovit.",
      409,
      "AUTH_PREPARATION_IN_PROGRESS"
    );
  }

  const { data: reclaimed, error: reclaimError } = await supabaseAdmin
    .from("organization_onboarding_auth_preparations")
    .update({
      status: "preparing",
      preparation_attempt: Number(existing.preparation_attempt || 1) + 1,
      recovery_reason:
        existing.status === "rolled_back"
          ? "retry_after_safe_auth_rollback"
          : "stale_preparation_without_auth_user",
      recovered_by: performedBy,
      recovered_at: now,
      updated_at: now,
    })
    .eq("id", existing.id)
    .eq("status", existing.status)
    .eq("updated_at", existing.updated_at)
    .select("*")
    .maybeSingle();
  if (reclaimError) throw reclaimError;
  if (!reclaimed) {
    throw new CustomerOnboardingError(
      "Přípravu Auth účtu převzal jiný souběžný požadavek.",
      409,
      "AUTH_PREPARATION_IN_PROGRESS"
    );
  }
  return reclaimed;
}

export async function updateAuthPreparationStatus(
  supabaseAdmin,
  preparationId,
  status,
  values = {}
) {
  if (!preparationId) return true;
  const { error } = await supabaseAdmin
    .from("organization_onboarding_auth_preparations")
    .update({ status, updated_at: new Date().toISOString(), ...values })
    .eq("id", preparationId);
  if (error) {
    console.error("municipality onboarding Auth preparation audit failed", {
      preparationId,
      status,
    });
    return false;
  }
  return true;
}

export async function resolveLocalAdministrator({
  supabaseAdmin,
  email,
  fullName,
  redirectTo,
  prepareSetupLink = true,
  idempotencyKey,
  organizationId,
  performedBy,
}) {
  const cleanEmail = String(email || "").trim().toLowerCase();
  const cleanFullName = String(fullName || "").trim();

  const { data: profiles, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("id, email, full_name, must_set_password")
    .ilike("email", cleanEmail)
    .limit(2);

  if (profileError) throw profileError;
  if ((profiles || []).length > 1) {
    throw new CustomerOnboardingError(
      "Pro e-mail lokálního správce existuje více profilů. Je nutná ruční kontrola.",
      409,
      "DUPLICATE_PROFILE"
    );
  }

  const profile = profiles?.[0] || null;
  if (profile) {
    const { data: authUser, error: authError } =
      await supabaseAdmin.auth.admin.getUserById(profile.id);
    const authEmail = String(authUser?.user?.email || "").trim().toLowerCase();

    if (authError || !authUser?.user || authEmail !== cleanEmail) {
      throw new CustomerOnboardingError(
        "Profil lokálního správce nemá konzistentní Auth účet. Je nutná ruční kontrola.",
        409,
        "LOCAL_ADMIN_IDENTITY_MISMATCH"
      );
    }

    return {
      userId: profile.id,
      email: cleanEmail,
      fullName: profile.full_name || cleanFullName,
      isNewAccount: false,
      cleanupEligible: false,
      mustSetPassword: profile.must_set_password === true,
      authPreparationId: null,
      setupUrl:
        profile.must_set_password === true && prepareSetupLink
          ? await generatePasswordSetupLink(supabaseAdmin, cleanEmail, redirectTo)
          : "",
    };
  }

  const existingAuthUser = await findAuthUserByEmail(supabaseAdmin, cleanEmail);
  if (existingAuthUser) {
    if (
      idempotencyKey &&
      organizationId &&
      authUserBelongsToOnboarding(
        existingAuthUser,
        idempotencyKey,
        organizationId
      )
    ) {
      let preparation = await loadAuthPreparation(supabaseAdmin, idempotencyKey);
      if (!preparation) {
        const { data, error } = await supabaseAdmin
          .from("organization_onboarding_auth_preparations")
          .insert({
            idempotency_key: idempotencyKey,
            organization_id: organizationId,
            local_admin_email: cleanEmail,
            local_admin_full_name: cleanFullName,
            auth_user_id: existingAuthUser.id,
            status: "recovered",
            created_by: performedBy,
            recovered_by: performedBy,
            recovered_at: new Date().toISOString(),
            recovery_reason: "recovered_from_auth_metadata",
          })
          .select("*")
          .maybeSingle();
        if (error) throw error;
        preparation = data;
      } else {
        const recoverableStatuses = [
          "preparing",
          "auth_created",
          "recovered",
          "cleanup_required",
        ];
        const updatedAt = new Date(
          preparation.updated_at || preparation.created_at
        ).getTime();
        if (
          !recoverableStatuses.includes(preparation.status) ||
          (Number.isFinite(updatedAt) && Date.now() - updatedAt < 5 * 60 * 1000)
        ) {
          throw new CustomerOnboardingError(
            "Přípravu Auth účtu právě zpracovává jiný požadavek. Zkuste stav za chvíli obnovit.",
            409,
            "AUTH_PREPARATION_IN_PROGRESS"
          );
        }

        const recoveryTime = new Date().toISOString();
        const { data: recovered, error: recoveryError } = await supabaseAdmin
          .from("organization_onboarding_auth_preparations")
          .update({
            status: "recovered",
            auth_user_id: existingAuthUser.id,
            preparation_attempt: Number(preparation.preparation_attempt || 1) + 1,
            recovered_by: performedBy,
            recovered_at: recoveryTime,
            recovery_reason: "recovered_from_auth_metadata",
            updated_at: recoveryTime,
          })
          .eq("id", preparation.id)
          .eq("updated_at", preparation.updated_at)
          .in("status", recoverableStatuses)
          .select("*")
          .maybeSingle();
        if (recoveryError) throw recoveryError;
        if (!recovered) {
          throw new CustomerOnboardingError(
            "Přípravu Auth účtu převzal jiný souběžný požadavek.",
            409,
            "AUTH_PREPARATION_IN_PROGRESS"
          );
        }
        preparation = recovered;
      }

      return {
        userId: existingAuthUser.id,
        email: cleanEmail,
        fullName: cleanFullName,
        isNewAccount: true,
        cleanupEligible: true,
        mustSetPassword: true,
        authPreparationId: preparation?.id || null,
        setupUrl: prepareSetupLink
          ? await generatePasswordSetupLink(supabaseAdmin, cleanEmail, redirectTo)
          : "",
      };
    }
    throw new CustomerOnboardingError(
      "Auth účet s tímto e-mailem už existuje bez odpovídajícího profilu. Je nutná ruční kontrola.",
      409,
      "ORPHAN_AUTH_USER"
    );
  }

  if (!idempotencyKey || !organizationId || !performedBy) {
    throw new Error("Chybí auditní identita přípravy Auth účtu.");
  }

  const preparation = await claimAuthPreparation({
    supabaseAdmin,
    idempotencyKey,
    organizationId,
    email: cleanEmail,
    fullName: cleanFullName,
    performedBy,
  });

  const { data: linkData, error: linkError } =
    await supabaseAdmin.auth.admin.generateLink({
      type: "invite",
      email: cleanEmail,
      options: {
        redirectTo,
        data: {
          full_name: cleanFullName,
          archimedes_onboarding_managed: true,
          archimedes_onboarding_idempotency_key: idempotencyKey,
          archimedes_onboarding_organization_id: organizationId,
        },
      },
    });
  const userId = linkData?.user?.id || null;
  const setupUrl = linkData?.properties?.action_link || "";

  if (linkError || !userId || !setupUrl) {
    let rollbackStatus = "rolled_back";
    if (userId) {
      const cleanupSucceeded = await cleanupNewAuthUser(supabaseAdmin, userId, {
        idempotencyKey,
        organizationId,
      });
      rollbackStatus = cleanupSucceeded ? "rolled_back" : "cleanup_required";
    }
    await updateAuthPreparationStatus(
      supabaseAdmin,
      preparation.id,
      rollbackStatus,
      {
        auth_user_id: userId,
        recovery_reason: "generate_link_failed",
      }
    );
    if (/already|registered|exists/i.test(linkError?.message || "")) {
      throw new CustomerOnboardingError(
        "Auth účet s tímto e-mailem už existuje bez odpovídajícího profilu. Je nutná ruční kontrola.",
        409,
        "ORPHAN_AUTH_USER"
      );
    }
    throw new Error("Nepodařilo se připravit účet lokálního správce.");
  }

  const preparationRecorded = await updateAuthPreparationStatus(
    supabaseAdmin,
    preparation.id,
    "auth_created",
    { auth_user_id: userId }
  );
  if (!preparationRecorded) {
    throw new Error("Auth účet vznikl, ale jeho přípravu se nepodařilo auditovat.");
  }

  return {
    userId,
    email: cleanEmail,
    fullName: cleanFullName,
    isNewAccount: true,
    cleanupEligible: true,
    mustSetPassword: true,
    authPreparationId: preparation.id,
    setupUrl,
  };
}

export async function cleanupNewAuthUser(
  supabaseAdmin,
  userId,
  { idempotencyKey, organizationId } = {}
) {
  if (!userId) return true;

  try {
    const { data, error: lookupError } =
      await supabaseAdmin.auth.admin.getUserById(userId);
    if (
      lookupError ||
      !authUserBelongsToOnboarding(
        data?.user,
        idempotencyKey,
        organizationId
      )
    ) {
      console.error("municipality onboarding refused unsafe Auth cleanup", {
        userId,
      });
      return false;
    }
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("municipality onboarding Auth rollback failed", {
      userId,
      error: error?.message || "unknown",
    });
    return false;
  }
}

export function validateCustomerOnboardingEmailConfiguration() {
  const port = Number(process.env.SMTP_PORT);
  if (
    !process.env.SMTP_HOST ||
    !port ||
    !process.env.SMTP_USER ||
    !process.env.SMTP_PASS ||
    !process.env.MAIL_FROM
  ) {
    throw new CustomerOnboardingError(
      "Konfigurace onboardingového e-mailu není kompletní.",
      500,
      "SMTP_CONFIG_MISSING"
    );
  }

  return port;
}

export async function sendCustomerOnboardingEmail({
  email,
  fullName,
  organizationName,
  organizationType,
  registrationNumber,
  licensePlanLabel,
  licenseValidUntil,
  siteUrl,
  setupUrl,
}) {
  const port = validateCustomerOnboardingEmailConfiguration();

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  });
  const isMunicipality = ["municipality", "obec"].includes(organizationType);
  const validUntilText = licenseValidUntil
    ? new Date(licenseValidUntil).toLocaleDateString("cs-CZ")
    : "do ukončení měsíční licence";
  const accessLine = setupUrl
    ? `Nastavit heslo a dokončit přístup: ${setupUrl}`
    : `Přihlášení stávajícím účtem: ${siteUrl}/login`;
  const registrationLine = isMunicipality
    ? `Registrační číslo obce: ${registrationNumber || "bude doplněno v portálu"}\n`
    : "";
  const nextStepUrl = isMunicipality
    ? `${siteUrl}/portal/organizace-obce`
    : organizationType === "school"
      ? `${siteUrl}/portal/uzivatele`
      : `${siteUrl}/portal/muj-profil`;

  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to: email,
    subject: `ARCHIMEDES Live – přístup správce pro ${organizationName}`,
    text: `Dobrý den ${fullName},

byl vám připraven přístup lokálního správce platformy ARCHIMEDES Live pro organizaci ${organizationName}.

Varianta: ${licensePlanLabel}
Platnost: ${validUntilText}
${registrationLine}${accessLine}
Po přihlášení můžete pokračovat nastavením organizace zde: ${nextStepUrl}

Pokud jste tento přístup neočekával/a, nepoužívejte uvedený odkaz a informujte správce ARCHIMEDES Live.

Tým ARCHIMEDES Live`,
  });
}
