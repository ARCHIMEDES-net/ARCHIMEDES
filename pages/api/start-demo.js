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
    const { school, name, email } = req.body;

    if (!school || !email) {
      return res.status(400).json({ error: "Chybí název školy nebo email." });
    }

    // vytvoření demo organizace
    const { data: organization, error: orgError } = await supabase
      .from("organizations")
      .insert([
        {
          name: `${school} – DEMO`,
          type: "school",
          demo: true,
        },
      ])
      .select()
      .single();

    if (orgError) {
      throw orgError;
    }

    // vytvoření uživatelského účtu
    const { data: userData, error: userError } =
      await supabase.auth.admin.createUser({
        email,
        email_confirm: true,
      });

    if (userError) {
      throw userError;
    }

    const userId = userData.user.id;

    // vytvoření profilu
    const { error: profileError } = await supabase.from("profiles").insert([
      {
        id: userId,
        full_name: name,
        user_type: "organization",
      },
    ]);

    if (profileError) {
      throw profileError;
    }

    // přidání do organizace
    const { error: memberError } = await supabase
      .from("organization_members")
      .insert([
        {
          organization_id: organization.id,
          user_id: userId,
          role: "organization_admin",
        },
      ]);

    if (memberError) {
      throw memberError;
    }

    return res.status(200).json({
      success: true,
      organizationId: organization.id,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Nepodařilo se vytvořit demo.",
    });
  }
}
