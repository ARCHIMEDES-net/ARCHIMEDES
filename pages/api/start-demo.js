export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  return res.status(403).json({
    error:
      "Tento endpoint je dočasně vypnutý. Pro ukázkový přístup použijte formulář žádosti o přístup.",
  });
}
