export default function handler(_req, res) {
  res.setHeader("Cache-Control", "no-store");
  return res.status(410).json({
    error: "Demo přístup již není součástí nabídky ARCHIMEDES Live.",
  });
}
