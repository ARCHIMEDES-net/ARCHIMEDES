export default function handler(_req, res) {
  res.setHeader("Cache-Control", "no-store");
  return res.status(410).json({
    error: "Schvalování demo přístupů bylo ukončeno.",
  });
}
