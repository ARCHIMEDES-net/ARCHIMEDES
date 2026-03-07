import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function getSiteUrl() {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    "https://www.archimedeslive.com";

  return raw.replace(/\/+$/, "");
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email, fullName, role, schoolId } = req.body || {};

    const cleanEmail = String(email || "").trim().toLowerCase();
    const cleanFullName = String(fullName || "").trim();
    const cleanRole = role === "school_admin" ? "school_admin" : "teacher";
    const cleanSchoolId = String(schoolId || "").trim();

    if (!cleanEmail) {
      return res.status(400).json({ error: "Vyplňte e-mail." });
    }

    if (!cleanFullName) {
      return res.status(400).json({ error: "Vyplňte jméno a příjmení." });
    }

    if (!cleanSchoolId) {
      return res.status(400).json({ error: "Chybí schoolId." });
    }

    const siteUrl = getSiteUrl();
    const redirectTo = `${siteUrl}/login`;

    const { data: invitedUser, error: inviteError } =
      await supabaseAdmin.auth.admin.inviteUserByEmail(cleanEmail, {
        redirectTo,
        data: {
          full_name: cleanFullName,
          role: cleanRole,
          school_id: cleanSchoolId,
        },
      });

    if (inviteError) {
      return res.status(400).json({ error: inviteError.message });
    }

    const invitedUserId = invitedUser?.user?.id;

    if (!invitedUserId) {
      return res
        .status(500)
        .json({ error: "Nepodařilo se získat ID pozvaného uživatele." });
    }

    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .upsert(
        {
          id: invitedUserId,
          email: cleanEmail,
          full_name: cleanFullName,
          role: cleanRole,
          school_id: cleanSchoolId,
          is_active: true,
          must_set_password: true,
        },
        { onConflict: "id" }
      );

    if (profileError) {
      return res.status(400).json({ error: profileError.message });
    }

    return res.status(200).json({
      success: true,
      message: "Pozvánka byla odeslána.",
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message || "Serverová chyba.",
    });
  }
}
