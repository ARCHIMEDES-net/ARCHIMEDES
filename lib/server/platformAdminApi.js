export function getBearerToken(req) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || typeof authHeader !== "string") return null;

  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : null;
}

export async function requirePlatformAdmin(req, res, supabaseAdmin) {
  const token = getBearerToken(req);

  if (!token) {
    res.status(401).json({ error: "Chybí autorizace uživatele." });
    return null;
  }

  const {
    data: { user },
    error: userError,
  } = await supabaseAdmin.auth.getUser(token);

  if (userError || !user) {
    res.status(401).json({ error: "Neplatné nebo expirované přihlášení." });
    return null;
  }

  const { data: adminRow, error: adminError } = await supabaseAdmin
    .from("platform_admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (adminError) throw adminError;

  if (!adminRow?.user_id) {
    res.status(403).json({ error: "Tuto stránku může používat pouze správce platformy." });
    return null;
  }

  return user;
}
