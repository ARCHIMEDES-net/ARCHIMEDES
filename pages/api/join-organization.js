import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    "Chybí SUPABASE_URL (nebo NEXT_PUBLIC_SUPABASE_URL) nebo SUPABASE_SERVICE_ROLE_KEY."
  );
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

async function safeDeleteAuthUser(userId) {
  if (!userId) return;
  try {
    await supabaseAdmin.auth.admin.deleteUser(userId);
  } catch (_) {
    // záměrně mlčíme – nechceme přepsat původní chybu
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  let createdUserId = null;

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

    const { data: organization, error: orgError } = await supabaseAdmin
      .from("organizations")
      .select("id, name, status")
      .eq("join_code", cleanJoinCode)
      .maybeSingle();

    if (orgError) {
      return res.status(400).json({ error: orgError.message });
    }

    if (!organization) {
      return res
        .status(404)
        .json({ error: "Organizace s tímto kódem neexistuje." });
    }

    if (organization.status !== "active" && organization.status !== "trial") {
      return res.status(403).json({ error: "Tato organizace není aktivní." });
    }

    const { data: existingUsers, error: listUsersError } =
      await supabaseAdmin.auth.admin.listUsers();

    if (listUsersError) {
      return res.status(400).json({
        error: `Nepodařilo se ověřit existenci uživatele: ${listUsersError.message}`,
      });
    }

    const existingUser = existingUsers?.users?.find(
      (user) => String(user.email || "").trim().toLowerCase() === cleanEmail
    );

    if (existingUser) {
      return res.status(409).json({
        error:
          "Účet s tímto e-mailem už existuje. Přihlaste se a připojte se ke škole jiným způsobem, nebo použijte obnovu hesla.",
      });
    }

    const { count: activeMembersCount, error: countError } = await supabaseAdmin
      .from("organization_members")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", organization.id)
      .eq("status", "active");

    if (countError) {
      return res.status(400).json({
        error: `Nepodařilo se ověřit členství organizace: ${countError.message}`,
      });
    }

    const assignedRole =
      (activeMembersCount || 0) === 0 ? "organization_admin" : "member";

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
    createdUserId = userId;

    if (!userId) {
      return res.status(500).json({ error: "Nepodařilo se vytvořit uživatele." });
    }

    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .upsert(
        {
          id: userId,
          email: cleanEmail,
          full_name: cleanFullName,
          is_active: true,
          must_set_password: false,
          active_organization_id: organization.id,
        },
        { onConflict: "id" }
      );

    if (profileError) {
      await safeDeleteAuthUser(userId);
      return res.status(400).json({
        error: `Profil se nepodařilo uložit: ${profileError.message}`,
      });
    }

    const { data: savedProfile, error: savedProfileError } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .maybeSingle();

    if (savedProfileError) {
      await safeDeleteAuthUser(userId);
      return res.status(400).json({
        error: `Profil nelze ověřit: ${savedProfileError.message}`,
      });
    }

    if (!savedProfile) {
      await safeDeleteAuthUser(userId);
      return res
        .status(500)
        .json({ error: "Profil nebyl po vytvoření nalezen." });
    }

    const { error: membershipError } = await supabaseAdmin
      .from("organization_members")
      .upsert(
        {
          organization_id: organization.id,
          user_id: userId,
          role_in_org: assignedRole,
          status: "active",
        },
        { onConflict: "user_id,organization_id" }
      );

    if (membershipError) {
      await safeDeleteAuthUser(userId);
      return res.status(400).json({
        error: `Členství se nepodařilo uložit: ${membershipError.message}`,
      });
    }

    const { error: activateOrgError } = await supabaseAdmin
      .from("profiles")
      .update({ active_organization_id: organization.id })
      .eq("id", userId);

    if (activateOrgError) {
      await safeDeleteAuthUser(userId);
      return res.status(400).json({
        error: `Nepodařilo se nastavit aktivní organizaci: ${activateOrgError.message}`,
      });
    }

    return res.status(200).json({
      success: true,
      organizationName: organization.name,
      assignedRole,
      message:
        assignedRole === "organization_admin"
          ? "Účet byl vytvořen a uživatel se stal prvním správcem organizace."
          : "Účet byl vytvořen a uživatel byl připojen do organizace.",
    });
  } catch (err) {
    if (createdUserId) {
      await safeDeleteAuthUser(createdUserId);
    }

    return res.status(500).json({
      error: err?.message || "Serverová chyba.",
    });
  }
}
