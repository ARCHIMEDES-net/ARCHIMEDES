export default function handler(req, res) {
  res.status(200).json({ ok: false, message: "Dočasně deaktivováno" });
}
