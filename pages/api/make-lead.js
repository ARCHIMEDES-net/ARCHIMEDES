
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const webhookUrl =
      process.env.MAKE_LEAD_WEBHOOK_URL ||
      process.env.MAKE_WEBHOOK_URL ||
      "";

    if (!webhookUrl) {
      return res.status(500).json({
        ok: false,
        error: "Webhook URL missing",
      });
    }

    const payload = req.body;

    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      return res.status(400).json({
        ok: false,
        error: "Invalid payload",
      });
    }

    // Honeypot ochrana – bot typicky vyplní skryté pole
    if (payload.company) {
      return res.status(200).json({ ok: true });
    }

    const email =
      typeof payload.email === "string" ? payload.email.trim() : "";
    const name =
      typeof payload.name === "string"
        ? payload.name.trim()
        : typeof payload.contact_name === "string"
        ? payload.contact_name.trim()
        : "";

    if (!email || !email.includes("@")) {
      return res.status(400).json({
        ok: false,
        error: "Invalid email",
      });
    }

    if (!name || name.length < 2) {
      return res.status(400).json({
        ok: false,
        error: "Invalid name",
      });
    }

    const cleanPayload = { ...payload };
    delete cleanPayload.company;

    const r = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cleanPayload),
    });

    if (!r.ok) {
      const text = await r.text().catch(() => "");
      console.error("Make webhook failed", {
        status: r.status,
        statusText: r.statusText,
        body: text?.slice(0, 300) || "",
      });

      return res.status(502).json({
        ok: false,
        error: "Make webhook failed",
      });
    }

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error("make-lead error", e);
    return res.status(500).json({
      ok: false,
      error: e?.message || "Server error",
    });
  }
}
