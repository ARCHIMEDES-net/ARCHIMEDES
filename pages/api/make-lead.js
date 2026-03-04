export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const webhookUrl = "https://hook.eu1.make.com/kh63p8nprtcq6dcf1sdfroktoqwdnduf";

    const r = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body || {}),
    });

    // Make většinou vrací 200/204. Když ne, pošleme chybu dál (ať to vidíš).
    if (!r.ok) {
      const text = await r.text().catch(() => "");
      return res.status(502).json({
        ok: false,
        error: `Make webhook failed: ${r.status} ${r.statusText}`,
        details: text?.slice(0, 500) || null,
      });
    }

    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e?.message || "Server error" });
  }
}
