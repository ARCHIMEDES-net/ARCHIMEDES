import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function generateJoinCode() {
  const part = Math.random().toString(16).slice(2, 10).toUpperCase();
  return `ORG-${part}`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { userId, organizationName } = req.body || {};

    if (!userId) {
      return res.status(400).json({ error: "Chybí userId." });
    }

    if (!organizationName?.trim()) {
      return res.status(400).json({ error: "Vyplňte název školy." });
    }

    const joinCode = generateJoinCode();

    // vytvořit organizaci
    const { data: organization, error: orgError } = await supabaseAdmin
      .from("organizations")
      .insert({
        name: organizationName.trim(),
        join_code: joinCode,
        status: "active",
      })
      .select()
      .single();

    if (orgError) throw orgError;

    // vytvořit admin členství
    const { error: membershipError } = await supabaseAdmin
      .from("organization_members")
      .insert({
        organization_id: organization.id,
        user_id: userId,
        role_in_org: "organization_admin",
        status: "active",
      });

    if (membershipError) throw membershipError;

    return res.status(200).json({
      success: true,
      organizationId: organization.id,
      joinCode: joinCode,
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message || "Serverová chyba.",
    });
  }
}
