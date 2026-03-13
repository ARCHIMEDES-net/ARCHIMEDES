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

    // 1️⃣ vytvoření demo organizace
    const { data: organization, error: orgError } = await supabase
      .from("organizations")
      .insert([
        {
          name: `${school} – DEMO`,
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

    // 2️⃣ vytvoření uživatele v Supabase Auth
    const { data: createdUser, error: createUserError } =
      await supabase.auth.admin.createUser({
        email,
        email_confirm: true,
      });

    if (createUserError) {
      console.error("CREATE USER ERROR:", createUserError);
      throw new Error(`Nepodařilo se vytvořit uživatele: ${createUserError.message}`);
    }

    const userId = createdUser?.user?.id;

    if (!userId) {
      throw new Error("Nevzniklo user ID.");
    }

    // 3️⃣ vytvoření / aktualizace profilu
    const { error: profileError } = await supabase.from("profiles").upsert(
      [
        {
          id: userId,
          full_name: name,
          user_type: "organization",
        },
      ],
      { onConflict: "id" }
    );

    if (profileError) {
      console.error("PROFILE ERROR:", profileError);
      throw new Error(`Nepodařilo se uložit profil: ${profileError.message}`);
    }

    // 4️⃣ přidání do organizace
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
      throw new Error(`Nepodařilo se vytvořit členství: ${memberError.message}`);
    }

    return res.status(200).json({
      success: true,
      organizationId: organization.id,
    });
  } catch (error) {
    console.error("START DEMO ERROR:", error);
    return res.status(500).json({
      error: error.message || "Nepodařilo se vytvořit demo.",
    });
  }
}
