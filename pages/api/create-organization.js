export default function handler(_req, res) {
  return res.status(410).json({
    error:
      "Přímé zakládání organizací bylo ukončeno. Obec podává žádost a škola nebo spolek se registrují pod aktivní obcí.",
  });
}
