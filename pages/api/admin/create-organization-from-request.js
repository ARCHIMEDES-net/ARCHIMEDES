export default function handler(_req, res) {
  res.setHeader("Cache-Control", "no-store");
  return res.status(410).json({
    error:
      "Tato stará cesta byla ukončena. Obec, škola i spolek nyní vznikají přímo z ověřené žádosti jako čekající na schválení.",
  });
}
