import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email, password, fullName, joinCode } = req.body || {};

    const cleanEmail = String(email || "").trim().toLowerCase();
    const cleanPassword = String(password || "");
    const cleanFullName = String(fullName || "").trim();
    const cleanJoinCode = String(joinCode || "").trim().toUpperCase();

    if (!cleanEmail) {
      return res.status(400).json({ error: "Vyplňte e-mail." });
    }

    if (!cleanPassword || cleanPassword.length < 8) {
      return res.status(400).json({ error: "Heslo musí mít alespoň 8 znaků." });
    }

    if (!cleanFullName) {
      return res.status(400).json({ error: "Vyplňte jméno a příjmení." });
    }

    if (!cleanJoinCode) {
      return res.status(400).json({ error: "Vyplňte kód organizace." });
    }

    // 1) Najít organizaci podle join_code
    const { data: organization, error: orgError } = await supabaseAdmin
      .from("organizations")
      .select("id, name, status")
      .eq("join_code", cleanJoinCode)
      .maybeSingle();

    if (orgError) {
      return res.status(400).json({ error: orgError.message });
    }

    if (!organization) {
      return res.status(404).json({ error: "Organizace s tímto kódem neexistuje." });
    }

    if (organization.status !== "active" && organization.status !== "trial") {
      return res.status(403).json({ error: "Tato organizace není aktivní." });
    }

    // 2) Vytvořit uživatele
    const { data: createdUser, error: createUserError } =
      await supabaseAdmin.auth.admin.createUser({
        email: cleanEmail,
        password: cleanPassword,
        email_confirm: true,
        user_metadata: {
          full_name: cleanFullName,
        },
      });

    if (createUserError) {
      return res.status(400).json({ error: createUserError.message });
    }

    const userId = createdUser?.user?.id;

    if (!userId) {
      return res.status(500).json({ error: "Nepodařilo se vytvořit uživatele." });
    }

    // 3) Profil
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .upsert(
        {
          id: userId,
          email: cleanEmail,
          full_name: cleanFullName,
          is_active: true,
          must_set_password: false,
        },
        { onConflict: "id" }
      );

    if (profileError) {
      return res.status(400).json({ error: profileError.message });
    }

    // 4) Členství v organizaci
    const { error: membershipError } = await supabaseAdmin
      .from("organization_members")
      .upsert(
        {
          organization_id: organization.id,
          user_id: userId,
          role_in_org: "member",
          status: "active",
        },
        { onConflict: "user_id,organization_id" }
      );

    if (membershipError) {
      return res.status(400).json({ error: membershipError.message });
    }

    return res.status(200).json({
      success: true,
      organizationName: organization.name,
      message: "Účet byl vytvořen a uživatel byl připojen do organizace.",
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message || "Serverová chyba.",
    });
  }
}
