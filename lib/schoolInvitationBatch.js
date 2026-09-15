// Accept Excel rows (name<TAB>email) or name;email. Never infer a person's name.
export function parseSchoolInvitationBatch(text) {
  const rows = [];
  const seen = new Set();
  for (const [index, line] of String(text).split(/\r?\n/).entries()) {
    if (!line.trim()) continue;
    const parts = line.split(/[\t;]/).map((part) => part.trim());
    const [fullName, rawEmail] = parts;
    const email = String(rawEmail || "").toLowerCase();
    if (parts.length !== 2 || fullName.length < 2 || fullName.length > 120 ||
      email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error(`Řádek ${index + 1}: zadejte jméno a e-mail oddělené tabulátorem nebo středníkem.`);
    }
    if (seen.has(email)) throw new Error(`Řádek ${index + 1}: e-mail ${email} je v seznamu vícekrát.`);
    seen.add(email);
    rows.push({ fullName, email });
  }
  if (!rows.length || rows.length > 100) throw new Error("Vložte 1 až 100 učitelů.");
  return rows;
}

// Stop on any failure or uncertain response. Never retry sends automatically.
export async function sendSchoolInvitationBatch(rows, send, onResult) {
  for (const row of rows) {
    if (row.status !== "ready") continue;
    try {
      const result = await send(row);
      if (!result?.ok || !result.invitationSent) throw new Error("Výsledek odeslání není potvrzen. Zkontrolujte přehled pozvánek.");
      onResult(row.email, "sent", result.message || "Pozvánka odeslána");
    } catch (error) {
      onResult(row.email, "review", error.message || "Zkontrolujte přehled pozvánek.");
      return false;
    }
  }
  return true;
}
