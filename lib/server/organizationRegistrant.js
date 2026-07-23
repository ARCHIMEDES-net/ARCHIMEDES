import { getBearerToken } from "./platformAdminApi";

export class RegistrantError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = "RegistrantError";
    this.status = status;
  }
}

export async function resolveOrganizationRegistrant({
  supabaseAdmin,
  req,
  email,
  fullName,
  redirectTo,
}) {
  const token = getBearerToken(req);
  let authenticatedUser = null;

  if (token) {
    const {
      data: { user },
      error,
    } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      throw new RegistrantError("Neplatné nebo expirované přihlášení.", 401);
    }
    authenticatedUser = user;
  }

  const requestedEmail = String(email || "").trim().toLowerCase();
  const authenticatedEmail = String(authenticatedUser?.email || "")
    .trim()
    .toLowerCase();

  if (
    authenticatedUser &&
    requestedEmail &&
    authenticatedEmail !== requestedEmail
  ) {
    throw new RegistrantError(
      "E-mail v pozvánce se neshoduje s přihlášeným účtem.",
      403
    );
  }

  const cleanEmail = authenticatedEmail || requestedEmail;
  const cleanFullName = String(
    fullName || authenticatedUser?.user_metadata?.full_name || ""
  ).trim();

  const { data: existingProfiles, error: profileLookupError } =
    await supabaseAdmin
      .from("profiles")
      .select("id, active_organization_id")
      .ilike("email", cleanEmail)
      .limit(1);

  if (profileLookupError) throw profileLookupError;

  let userId = existingProfiles?.[0]?.id || authenticatedUser?.id || null;

  if (existingProfiles?.[0]?.id && existingProfiles[0].id !== authenticatedUser?.id) {
    throw new RegistrantError(
      "Účet s tímto e-mailem už existuje. Přihlaste se a registraci odešlete znovu.",
      409
    );
  }

  let isNewAccount = false;
  let setupUrl = "";

  if (!userId) {
    const { data: createdUser, error: createUserError } =
      await supabaseAdmin.auth.admin.createUser({
        email: cleanEmail,
        email_confirm: true,
        user_metadata: { full_name: cleanFullName },
      });

    if (createUserError) {
      if (/already|registered|exists/i.test(createUserError.message || "")) {
        throw new RegistrantError(
          "Účet s tímto e-mailem už existuje. Přihlaste se a registraci odešlete znovu.",
          409
        );
      }
      throw createUserError;
    }

    userId = createdUser?.user?.id || null;
    if (!userId) throw new Error("Nepodařilo se vytvořit účet kontaktní osoby.");
    isNewAccount = true;

    const { data: linkData, error: linkError } =
      await supabaseAdmin.auth.admin.generateLink({
        type: "recovery",
        email: cleanEmail,
        options: { redirectTo },
      });

    setupUrl = linkData?.properties?.action_link || "";

    if (linkError || !setupUrl) {
      await supabaseAdmin.auth.admin.deleteUser(userId);
      throw new Error("Nepodařilo se připravit odkaz pro nastavení hesla.");
    }
  }

  return {
    userId,
    email: cleanEmail,
    fullName: cleanFullName,
    isNewAccount,
    setupUrl,
    previousActiveOrganizationId:
      existingProfiles?.[0]?.active_organization_id || null,
  };
}

export async function cleanupNewRegistrant(supabaseAdmin, registrant) {
  if (!registrant?.userId) return;

  try {
    if (registrant.isNewAccount) {
      await supabaseAdmin.auth.admin.deleteUser(registrant.userId);
      return;
    }

    await supabaseAdmin
      .from("profiles")
      .update({
        active_organization_id:
          registrant.previousActiveOrganizationId || null,
      })
      .eq("id", registrant.userId);
  } catch (_) {
    // Kompenzační úklid nesmí přepsat původní chybu.
  }
}
