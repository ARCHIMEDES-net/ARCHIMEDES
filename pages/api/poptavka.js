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
      selectedLabel,
      name,
      place: place || "",
      email,
      phone: phone || "",
      message: message || "",
    };

    console.log("=== NOVÁ POPTÁVKA ARCHIMEDES ===");
    console.log(JSON.stringify(payload, null, 2));

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
