export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const webhookUrl =
      process.env.MAKE_LEAD_WEBHOOK_URL ||
      process.env.MAKE_WEBHOOK_URL ||
      "";

    console.log("make-lead env check", {
      hasMakeLeadWebhook: !!process.env.MAKE_LEAD_WEBHOOK_URL,
      hasMakeWebhook: !!process.env.MAKE_WEBHOOK_URL,
      resolvedWebhook: webhookUrl ? "present" : "missing",
    });

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

    const r = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
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
