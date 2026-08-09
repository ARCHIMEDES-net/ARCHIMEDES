export default function handler(_req, res) {
  res.setHeader("Cache-Control", "no-store");
  return res.status(410).json({
    error:
      "Samoobslužná registrace školy byla ukončena. Organizace zakládá po ověření centrální tým ARCHIMEDES.",
  });
}
