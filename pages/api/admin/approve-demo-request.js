export default function handler(_req, res) {
  return res.status(410).json({
    error: "Schvalování demo přístupů bylo ukončeno.",
  });
}
