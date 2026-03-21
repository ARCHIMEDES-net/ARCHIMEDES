export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const apiKey = req.headers["x-api-key"];
    const expectedApiKey = process.env.INTERNAL_API_SECRET;
    const webhookUrl = process.env.MAKE_LEAD_WEBHOOK_URL;

    if (!expectedApiKey) {
      console.error("Missing INTERNAL_API_SECRET");
      return res.status(500).json({ ok: false, error: "Server misconfiguration" });
    }

    if (!webhookUrl) {
      console.error("Missing MAKE_LEAD_WEBHOOK_URL");
      return res.status(500).json({ ok: false, error: "Server misconfiguration" });
    }

    if (!apiKey || apiKey !== expectedApiKey) {
      return res.status(401).json({ ok: false, error: "Unauthorized" });
    }

    const payload = req.body;

    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      return res.status(400).json({ ok: false, error: "Invalid payload" });
    }

    const payloadString = JSON.stringify(payload);

    if (payloadString.length > 20_000) {
      return res.status(413).json({ ok: false, error: "Payload too large" });
    }

    const r = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payloadString,
    });

    if (!r.ok) {
      const text = await r.text().catch(() => "");
      console.error("Make webhook failed", {
        status: r.status,
        statusText: r.statusText,
        details: text?.slice(0, 500) || null,
      });

      return res.status(502).json({
        ok: false,
        error: "Upstream webhook failed",
      });
    }

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error("make-lead error:", e);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
}
