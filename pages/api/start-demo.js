import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { school, name, email } = req.body || {};

    if (!school || !name || !email) {
      return res.status(400).json({
        error: "Chybí název školy, jméno nebo e-mail.",
      });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanSchool = String(school).trim();
    const cleanName = String(name).trim();

    // 1) vytvoření demo organizace
    const { data: organization, error: orgError } = await supabase
      .from("organizations")
      .insert([
        {
          name: `${cleanSchool} – DEMO`,
          org_type: "school",
          status: "active",
        },
      ])
      .select()
      .single();

    if (orgError) {
      console.error("ORG ERROR:", orgError);
      throw new Error(`Nepodařilo se vytvořit organizaci: ${orgError.message}`);
    }

    // 2) pozvání uživatele e-mailem
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "https://www.archimedeslive.com";

    const { data: inviteData, error: inviteError } =
      await supabase.auth.admin.inviteUserByEmail(cleanEmail, {
        redirectTo: `${siteUrl}/login`,
      });

    if (inviteError) {
      console.error("INVITE ERROR:", inviteError);
      throw new Error(`Nepodařilo se odeslat pozvánku: ${inviteError.message}`);
    }

    const userId = inviteData?.user?.id;

    if (!userId) {
      throw new Error("Nevzniklo user ID z pozvánky.");
    }

    // 3) profil
    const { error: profileError } = await supabase.from("profiles").upsert(
      [
        {
          id: userId,
          full_name: cleanName,
          user_type: "organization",
          must_set_password: true,
        },
      ],
      { onConflict: "id" }
    );

    if (profileError) {
      console.error("PROFILE ERROR:", profileError);
      throw new Error(`Nepodařilo se uložit profil: ${profileError.message}`);
    }

    // 4) přidání do organizace
    const { error: memberError } = await supabase
      .from("organization_members")
      .insert([
        {
          organization_id: organization.id,
          user_id: userId,
          role_in_org: "organization_admin",
          status: "active",
        },
      ]);

    if (memberError) {
      console.error("MEMBER ERROR:", memberError);
      throw new Error(
        `Nepodařilo se vytvořit členství: ${memberError.message}`
      );
    }

    return res.status(200).json({
      success: true,
      organizationId: organization.id,
      message: "Demo učebna byla vytvořena. Na e-mail byla odeslána pozvánka.",
    });
  } catch (error) {
    console.error("START DEMO ERROR:", error);
    return res.status(500).json({
      error: error.message || "Nepodařilo se vytvořit demo.",
    });
  }
}
