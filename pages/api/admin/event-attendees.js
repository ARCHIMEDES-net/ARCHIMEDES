import { createClient } from "@supabase/supabase-js";
import { requirePlatformAdmin } from "../../../lib/server/platformAdminApi";
import { loadEventAttendees, attendanceWorkbook } from "../../../lib/server/eventAttendees";

const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } });

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "private, no-store");
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    if (!await requirePlatformAdmin(req, res, db)) return;
    const eventId = req.query?.eventId;
    if (typeof eventId !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(eventId)) {
      return res.status(400).json({ error: "Neplatné ID vysílání." });
    }
    const { data: event, error } = await db.from("events").select("id, title").eq("id", eventId).maybeSingle();
    if (error) throw error;
    if (!event) return res.status(404).json({ error: "Vysílání nebylo nalezeno." });
    const attendees = await loadEventAttendees(db, eventId);
    if (req.query.format === "excel") {
      res.setHeader("Content-Type", "application/vnd.ms-excel; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename="archimedes-prihlaseni-${eventId}.xml"`);
      return res.status(200).send(attendanceWorkbook(event.title, attendees));
    }
    return res.status(200).json({ event, attendees });
  } catch (_error) {
    return res.status(500).json({ error: "Seznam přihlášených se nepodařilo načíst." });
  }
}
