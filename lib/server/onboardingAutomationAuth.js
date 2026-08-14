import crypto from "crypto";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function bearerToken(req) {
  const header = String(
    req.headers?.authorization || req.headers?.Authorization || ""
  );
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : "";
}

function secretsMatch(provided, expected) {
  if (!provided || !expected) return false;
  const providedDigest = crypto.createHash("sha256").update(provided).digest();
  const expectedDigest = crypto.createHash("sha256").update(expected).digest();
  return crypto.timingSafeEqual(providedDigest, expectedDigest);
}

function configuration() {
  const secret = String(process.env.ONBOARDING_AUTOMATION_SECRET || "");
  const actorUserId = String(
    process.env.ONBOARDING_AUTOMATION_ADMIN_USER_ID || ""
  ).trim();

  if (secret.length < 32 || !UUID_PATTERN.test(actorUserId)) {
    throw new Error("Onboarding automation is not configured safely.");
  }

  return { secret, actorUserId };
}

export async function requireOnboardingAutomation(req, res, supabaseAdmin) {
  let configured;
  try {
    configured = configuration();
  } catch {
    res.status(503).json({
      error: "Automatizovaný onboarding není bezpečně nakonfigurován.",
    });
    return null;
  }

  if (!secretsMatch(bearerToken(req), configured.secret)) {
    res.status(401).json({ error: "Neplatná autorizace automatizovaného onboardingu." });
    return null;
  }

  const { data: authData, error: authError } =
    await supabaseAdmin.auth.admin.getUserById(configured.actorUserId);
  if (authError || !authData?.user?.id || !authData.user.email) {
    res.status(403).json({ error: "Auditní správce automatizace není aktivní." });
    return null;
  }

  const [{ data: platformAdmin, error: adminError }, { data: profile, error: profileError }] =
    await Promise.all([
      supabaseAdmin
        .from("platform_admins")
        .select("user_id, role")
        .eq("user_id", configured.actorUserId)
        .maybeSingle(),
      supabaseAdmin
        .from("profiles")
        .select("id, email, is_active")
        .eq("id", configured.actorUserId)
        .maybeSingle(),
    ]);

  if (adminError || profileError) throw adminError || profileError;

  if (
    !platformAdmin?.user_id ||
    !["admin", "super_admin"].includes(platformAdmin.role) ||
    profile?.is_active !== true ||
    String(profile.email || "").trim().toLowerCase() !==
      String(authData.user.email).trim().toLowerCase()
  ) {
    res.status(403).json({
      error: "Auditní správce automatizace nemá platné oprávnění.",
    });
    return null;
  }

  return authData.user;
}
