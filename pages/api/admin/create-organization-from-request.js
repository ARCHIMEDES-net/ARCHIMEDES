export default function handler(_req, res) {
  return res.status(410).json({
    error:
      "Staré vytváření organizace z obecné žádosti bylo ukončeno. Obec vzniká přímo jako čekající na schválení; škola a spolek se registrují pod aktivní obcí.",
  });
}
