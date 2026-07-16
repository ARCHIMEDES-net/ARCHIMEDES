export default function handler(req, res) {
  res.setHeader("Allow", "GET");
  return res.status(410).json({
    error:
      "Tato veřejná registrace už není dostupná. Učitelé se připojují školním kódem; ostatní osobní zájmy upravuje přihlášený uživatel ve svém profilu.",
  });
}
