import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).send("Chybí token.");
    }

    // 1) najdi žádost podle tokenu
    const { data: lead, error } = await supabase
      .from("leads")
      .select("*")
      .eq("approve_token", token)
      .single();

    if (error || !lead) {
      return res.status(404).send("Žádost nenalezena.");
    }

    // 2) bezpečnostní kontroly
    if (lead.type !== "demo") {
      return res.status(403).send("Neplatný typ žádosti.");
    }

    if (lead.approved_at) {
      return res.send("Tato žádost už byla schválena.");
    }

    // 3) označ jako schválené
    await supabase
      .from("leads")
      .update({
        approved_at: new Date().toISOString(),
        status: "approved",
        approve_token: null,
      })
      .eq("id", lead.id);

    // 4) zavolej EXISTUJÍCÍ logiku (pokud existuje)
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_SITE_URL}/api/admin/approve-demo-request`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            leadId: lead.id,
          }),
        }
      );
    } catch (e) {
      console.error("Napojení na admin approve selhalo:", e);
    }

    return res.send(`
      <html>
        <body style="font-family:Segoe UI,Arial;text-align:center;padding:40px;">
          <h2>✅ Demo bylo schváleno</h2>
          <p>${lead.email}</p>
        </body>
      </html>
    `);
  } catch (e) {
    console.error(e);
    return res.status(500).send("Chyba serveru.");
  }
}
