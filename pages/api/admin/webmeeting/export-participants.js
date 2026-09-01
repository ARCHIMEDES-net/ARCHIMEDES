import { createClient } from "@supabase/supabase-js";
import { consumeAuthenticatedRateLimit } from "../../../../lib/server/authenticatedRateLimit";
import { resolveWebMeetingParticipants } from "../../../../lib/server/broadcastRecipientResolver";
import { requirePlatformAdmin } from "../../../../lib/server/platformAdminApi";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

function escapeXml(value) {
  return String(value ?? "")
    .replace(/&/gu, "&amp;")
    .replace(/</gu, "&lt;")
    .replace(/>/gu, "&gt;")
    .replace(/"/gu, "&quot;")
    .replace(/'/gu, "&apos;");
}

function cell(value, style = "") {
  return `<Cell${style ? ` ss:StyleID="${style}"` : ""}><Data ss:Type="String">${escapeXml(
    value
  )}</Data></Cell>`;
}

function workbookXml(participants) {
  const header = ["number", "surname", "firstname", "email"]
    .map((value) => cell(value, "Header"))
    .join("");
  const rows = participants
    .map(
      (participant) =>
        `<Row>${cell(participant.number)}${cell(participant.surname)}${cell(
          participant.firstname
        )}${cell(participant.email)}</Row>`
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal"><Alignment ss:Vertical="Bottom"/><Font ss:FontName="Arial" ss:Size="10"/></Style>
  <Style ss:ID="Header"><Font ss:Bold="1" ss:Color="#FFFFFF"/><Interior ss:Color="#163A5F" ss:Pattern="Solid"/></Style>
 </Styles>
 <Worksheet ss:Name="Účastníci">
  <Table>
   <Column ss:Width="90"/><Column ss:Width="140"/><Column ss:Width="140"/><Column ss:Width="240"/>
   <Row>${header}</Row>
   ${rows}
  </Table>
  <WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel">
   <FreezePanes/><FrozenNoSplit/><SplitHorizontal>1</SplitHorizontal><TopRowBottomPane>1</TopRowBottomPane>
  </WorksheetOptions>
 </Worksheet>
</Workbook>`;
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const eventId = String(req.query?.eventId || "").trim();
  if (!eventId) return res.status(400).json({ error: "Chybí ID události." });

  try {
    const admin = await requirePlatformAdmin(req, res, supabaseAdmin);
    if (!admin) return;

    const allowed = await consumeAuthenticatedRateLimit({
      supabaseAdmin,
      req,
      route: "webmeeting-export-participants",
      userId: admin.id,
      resourceId: eventId,
      limit: 20,
      windowSeconds: 10 * 60,
    });

    if (!allowed) {
      res.setHeader("Retry-After", "600");
      return res.status(429).json({
        error: "Export byl vytvářen příliš často. Zkuste to prosím později.",
      });
    }

    const { data: sessions, error: sessionError } = await supabaseAdmin
      .from("broadcast_sessions")
      .select("recipient_group_codes, manual_recipient_emails")
      .eq("event_id", eventId)
      .limit(1);

    if (sessionError) throw sessionError;
    const session = sessions?.[0];
    if (!session) return res.status(404).json({ error: "Vysílání nebylo nalezeno." });

    const participants = await resolveWebMeetingParticipants(supabaseAdmin, {
      groupCodes: session.recipient_group_codes,
      manualEmails: session.manual_recipient_emails,
    });

    if (participants.length === 0) {
      return res.status(400).json({ error: "Seznam příjemců je prázdný." });
    }

    res.setHeader("Content-Type", "application/vnd.ms-excel; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="archimedes-ucastnici-${eventId.slice(0, 8)}.xls"`
    );
    return res.status(200).send(workbookXml(participants));
  } catch (error) {
    console.error("webmeeting export participants error:", error);
    return res.status(500).json({ error: "Excel se nepodařilo vytvořit." });
  }
}
