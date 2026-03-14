import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function normalizeType(selectedOption, selectedLabel) {
  const map = {
    program: "program",
    senior: "senior",
    ucebna: "ucebna",
    oboji: "program_a_ucebna",
    navsteva: "navsteva_vzorove_ucebny",
  };

  return map[selectedOption] || selectedLabel || "nezarazeno";
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      selectedOption,
      selectedLabel,
      name,
      place,
      email,
      phone,
      message,
    } = req.body || {};

    if (!selectedOption) {
      return res.status(400).json({ error: "Vyberte, o co máte zájem." });
    }

    if (!name || !email) {
      return res.status(400).json({ error: "Vyplňte jméno a email." });
    }

    const payload = {
      createdAt: new Date().toISOString(),
      selectedOption,
      selectedLabel: selectedLabel || "",
      name: String(name || "").trim(),
      place: String(place || "").trim(),
      email: String(email || "").trim(),
      phone: String(phone || "").trim(),
      message: String(message || "").trim(),
    };

    // 1) uložení do DB
    const { data: insertedLead, error: insertError } = await supabaseAdmin
      .from("leads")
      .insert([
        {
          created_at: payload.createdAt,
          type: normalizeType(selectedOption, selectedLabel),
          organization: payload.place || "",
          contact_name: payload.name,
          email: payload.email,
          phone: payload.phone,
          note: [
            selectedLabel ? `Zájem: ${selectedLabel}` : "",
            payload.message ? `Zpráva: ${payload.message}` : "",
          ]
            .filter(Boolean)
            .join("\n\n"),
          status: "new",
        },
      ])
      .select("id")
      .single();

    if (insertError) {
      console.error("Insert do leads selhal:", insertError);
      return res.status(500).json({
        error: "Nepodařilo se uložit poptávku.",
      });
    }

    // 2) webhook do Make -> email na portal@archimedeslive.com
    const webhookUrl = process.env.MAKE_LEAD_WEBHOOK_URL;

    if (webhookUrl) {
      const makeResp = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          leadId: insertedLead?.id || null,
          source: "web-poptavka",
          selectedOption: payload.selectedOption,
          selectedLabel: payload.selectedLabel,
          name: payload.name,
          place: payload.place,
          email: payload.email,
          phone: payload.phone,
          message: payload.message,
          createdAt: payload.createdAt,
          notifyEmail: "portal@archimedeslive.com",
        }),
      });

      if (!makeResp.ok) {
        const text = await makeResp.text().catch(() => "");
        console.error("Make webhook failed:", makeResp.status, text);
      }
    }

    return res.status(200).json({
      ok: true,
      message: "Poptávka byla úspěšně odeslána.",
    });
  } catch (error) {
    console.error("Chyba API /api/poptavka:", error);
    return res.status(500).json({
      error: "Serverová chyba při odeslání poptávky.",
    });
  }
}
