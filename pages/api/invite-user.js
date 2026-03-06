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

    const { email, fullName, role, schoolId } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email chybí" });
    }

    if (!schoolId) {
      return res.status(400).json({ error: "schoolId chybí" });
    }

    const { data: newUser, error: createUserError } =
      await supabaseAdmin.auth.admin.createUser({
        email: email,
        email_confirm: false,
        user_metadata: {
          invited: true
        }
      });

    if (createUserError) {
      return res.status(500).json({ error: createUserError.message });
    }

    const userId = newUser.user.id;

    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert({
        id: userId,
        email: email,
        full_name: fullName,
        role: role || "teacher",
        school_id: schoolId,
        is_active: true
      });

    if (profileError) {
      return res.status(500).json({ error: profileError.message });
    }

    await supabaseAdmin.auth.admin.generateLink({
      type: "invite",
      email: email
    });

    return res.status(200).json({
      success: true
    });

  } catch (err) {

    return res.status(500).json({
      error: err.message
    });

  }

}
