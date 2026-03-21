import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // důležité!
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { name, email, organization, note } = req.body;

    const { error } = await supabase.from("leads").insert([
      {
        type: "demo",
        contact_name: name,
        email: email,
        organization: organization,
        note: note,
      },
    ]);

    if (error) {
      console.error(error);
      return res.status(500).json({ error: "DB error" });
    }

    return res.status(200).json({ success: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
}
