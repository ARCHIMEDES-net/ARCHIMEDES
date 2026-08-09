export default function handler(_req, res) {
  res.setHeader("Cache-Control", "no-store");
  return res.status(410).json({
    error:
      "Registrační pozvánky obce už nejsou podporovány. Organizace zakládá po ověření centrální tým ARCHIMEDES.",
  });
}
