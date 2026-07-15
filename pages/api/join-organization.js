import { createClient } from "@supabase/supabase-js";
import { getBearerToken } from "../../lib/server/platformAdminApi";

const supabaseUrl =
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    "Chybí SUPABASE_URL (nebo NEXT_PUBLIC_SUPABASE_URL) nebo SUPABASE_SERVICE_ROLE_KEY."
  );
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

async function safeDeleteAuthUser(userId) {
  if (!userId) return;
  try {
    await supabaseAdmin.auth.admin.deleteUser(userId);
  } catch (_) {
    // Zachováme původní chybu; úklid je pouze kompenzační krok.
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  let createdUserId = null;

  try {
    const { email, password, fullName, joinCode } = req.body || {};
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

    const cleanEmail = String(authenticatedUser?.email || email || "")
      .trim()
      .toLowerCase();
    const cleanPassword = String(password || "");
    const cleanFullName = String(
      fullName || authenticatedUser?.user_metadata?.full_name || ""
    ).trim();
    const cleanJoinCode = String(joinCode || "").trim().toUpperCase();

    if (!cleanEmail) {
      return res.status(400).json({ error: "Vyplňte e-mail." });
    }

    if (!authenticatedUser && cleanPassword.length < 8) {
      return res.status(400).json({ error: "Heslo musí mít alespoň 8 znaků." });
    }

    if (!cleanFullName) {
      return res.status(400).json({ error: "Vyplňte jméno a příjmení." });
    }

    if (!cleanJoinCode) {
      return res.status(400).json({ error: "Vyplňte kód školy." });
    }

    const { data: organization, error: orgError } = await supabaseAdmin
      .from("organizations")
      .select("id, name, org_type, status")
      .eq("join_code", cleanJoinCode)
      .maybeSingle();

    if (orgError) throw orgError;

    if (!organization) {
      return res.status(404).json({ error: "Škola s tímto kódem neexistuje." });
    }

    if (organization.org_type !== "school") {
      return res.status(403).json({
        error: "Tento kód nepatří škole. Jednotlivé členství je určeno pouze učitelům škol.",
      });
    }

    if (organization.status !== "active" && organization.status !== "trial") {
      return res.status(403).json({ error: "Tato škola není aktivní." });
    }

    let userId = authenticatedUser?.id || null;

    if (!userId) {
      const { data: existingProfiles, error: existingProfileError } =
        await supabaseAdmin
          .from("profiles")
          .select("id")
          .ilike("email", cleanEmail)
          .limit(1);

      if (existingProfileError) throw existingProfileError;

      if (existingProfiles?.length) {
        return res.status(409).json({
          error: "Účet s tímto e-mailem už existuje. Nejprve se přihlaste a potom zadejte kód školy znovu.",
          accountExists: true,
        });
      }

      const { data: createdUser, error: createUserError } =
        await supabaseAdmin.auth.admin.createUser({
          email: cleanEmail,
          password: cleanPassword,
          email_confirm: true,
          user_metadata: { full_name: cleanFullName },
        });

      if (createUserError) {
        if (/already|registered|exists/i.test(createUserError.message || "")) {
          return res.status(409).json({
            error: "Účet s tímto e-mailem už existuje. Nejprve se přihlaste a potom zadejte kód školy znovu.",
            accountExists: true,
          });
        }
        throw createUserError;
      }

      userId = createdUser?.user?.id || null;
      createdUserId = userId;

      if (!userId) throw new Error("Nepodařilo se vytvořit uživatele.");
    }

    const { data: existingMembership, error: existingMembershipError } =
      await supabaseAdmin
        .from("organization_members")
        .select("id, role_in_org, status")
        .eq("organization_id", organization.id)
        .eq("user_id", userId)
        .maybeSingle();

    if (existingMembershipError) throw existingMembershipError;

    const { count: activeMembersCount, error: countError } = await supabaseAdmin
      .from("organization_members")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", organization.id)
      .eq("status", "active");

    if (countError) throw countError;

    const assignedRole =
      existingMembership?.role_in_org ||
      ((activeMembersCount || 0) === 0 ? "organization_admin" : "member");

    const { error: profileError } = await supabaseAdmin.from("profiles").upsert(
      {
        id: userId,
        email: cleanEmail,
        full_name: cleanFullName,
        is_active: true,
        ...(createdUserId ? { must_set_password: false } : {}),
        active_organization_id: organization.id,
      },
      { onConflict: "id" }
    );

    if (profileError) throw profileError;

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

    if (membershipError) throw membershipError;

    return res.status(200).json({
      success: true,
      existingAccount: !createdUserId,
      organizationName: organization.name,
      assignedRole,
      message: !createdUserId
        ? "Stávající účet byl připojen ke škole. Přihlašovací údaje zůstaly beze změny."
        : assignedRole === "organization_admin"
          ? "Účet byl vytvořen a uživatel se stal prvním správcem školy."
          : "Účet byl vytvořen a uživatel byl připojen ke škole.",
    });
  } catch (err) {
    if (createdUserId) await safeDeleteAuthUser(createdUserId);

    console.error("join-organization error:", err);
    return res.status(500).json({ error: "Připojení ke škole se nepodařilo." });
  }
}
