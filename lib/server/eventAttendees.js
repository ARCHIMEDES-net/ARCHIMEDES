// Read in bounded batches so exports are not silently cut off by PostgREST's row limit.
export async function loadEventAttendees(db, eventId) {
  const result = [];
  for (let offset = 0; ; offset += 200) {
    const { data, error } = await db.from("event_attendees")
      .select("id, organization_id, user_id, created_at")
      .eq("event_id", eventId).eq("excluded_admin_context", false).order("created_at").order("id").range(offset, offset + 199);
    if (error) throw error;
    const rows = data || [];
    if (!rows.length) break;
    const [organizations, profiles] = await Promise.all([
      db.from("organizations").select("id, name").in("id", [...new Set(rows.map((r) => r.organization_id))]),
      db.from("profiles").select("id, full_name, email").in("id", [...new Set(rows.map((r) => r.user_id))]),
    ]);
    if (organizations.error) throw organizations.error;
    if (profiles.error) throw profiles.error;
    const orgs = new Map((organizations.data || []).map((r) => [r.id, r]));
    const people = new Map((profiles.data || []).map((r) => [r.id, r]));
    result.push(...rows.map((r) => ({
      id: r.id,
      organization: orgs.get(r.organization_id)?.name || "Organizace již není dostupná",
      name: people.get(r.user_id)?.full_name || "Jméno není vyplněno",
      email: people.get(r.user_id)?.email || "",
      created_at: r.created_at,
    })));
    if (rows.length < 200) break;
  }
  return result;
}

function xml(value) {
  return String(value ?? "").replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}
export function attendanceWorkbook(title, rows) {
  // Explicit string cells prevent user-controlled names from becoming Excel formulas.
  const row = (cells) => `<Row>${cells.map((v) => `<Cell><Data ss:Type="String">${xml(v)}</Data></Cell>`).join("")}</Row>`;
  return `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Worksheet ss:Name="Přihlášení"><Table><Column ss:Width="280"/><Column ss:Width="180"/><Column ss:Width="240"/><Column ss:Width="150"/>
${row([title])}${row(["Škola / organizace", "Účast potvrdil(a)", "E-mail", "Datum přihlášení (Praha)"])}
${rows.map((r) => row([r.organization, r.name, r.email, new Date(r.created_at).toLocaleString("cs-CZ", { timeZone: "Europe/Prague" })])).join("")}
</Table></Worksheet></Workbook>`;
}
