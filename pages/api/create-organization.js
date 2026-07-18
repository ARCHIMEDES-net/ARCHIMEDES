export default function handler(_req, res) {
  return res.status(410).json({
    error:
      "Organizace vzniká až po ověřené žádosti. Obec, škola i spolek mohou požádat o samostatné zapojení; škola a spolek se mohou také registrovat pod aktivní obcí.",
  });
}
