export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { toEmail, postId, postTitle, fromName, fromEmail, message } = req.body || {};

    if (!toEmail || !fromEmail || !message || !postId) {
      return res.status(400).json({ error: "Missing fields" });
    }

    // ✅ Jednoduché odeslání přes Resend (doporučuji)
    // 1) nainstaluj: npm i resend
    // 2) nastav ENV: RESEND_API_KEY + FROM_EMAIL

    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    const subject = `ARCHIMEDES Live – zpráva k inzerátu: ${postTitle || postId}`;
    const text =
`Zpráva z ARCHIMEDES Live (inzerce)

Inzerát: ${postTitle || "-"}
ID: ${postId}

Od: ${fromName || "-"}
E-mail: ${fromEmail}

Zpráva:
${message}
`;

    const { error } = await resend.emails.send({
      from: process.env.FROM_EMAIL,
      to: toEmail,
      reply_to: fromEmail,
      subject,
      text,
    });

    if (error) return res.status(500).json({ error: error.message });

    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: e.message || "Server error" });
  }
}
