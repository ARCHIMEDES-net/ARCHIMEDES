import { createClient } from "@supabase/supabase-js";
import { requirePlatformAdmin } from "../../../../lib/server/platformAdminApi";
import { WebMeetingApiError, webMeeting } from "../../../../lib/server/webmeetingClient";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const eventId = String(req.body?.eventId || "").trim();
  if (!eventId) return res.status(400).json({ error: "Chybí ID události." });

  try {
    const admin = await requirePlatformAdmin(req, res, supabaseAdmin);
    if (!admin) return;

    const { data: sessions, error } = await supabaseAdmin
      .from("broadcast_sessions")
      .select("external_meeting_id, moderator_name")
      .eq("event_id", eventId)
      .limit(1);

    if (error) throw error;
    const session = sessions?.[0];
    if (!session?.external_meeting_id) {
      return res.status(409).json({ error: "Místnost ve WebMeetingu zatím není vytvořena." });
    }

    const url = await webMeeting.getModeratorEnterURL(
      session.external_meeting_id,
      String(session.moderator_name || "ARCHIMEDES Live").trim()
    );

    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({ url });
  } catch (error) {
    console.error("webmeeting moderator url error:", error);
    const status = error instanceof WebMeetingApiError ? error.status : 500;
    return res.status(status).json({
      error: error.message || "Moderátorský vstup se nepodařilo vytvořit.",
    });
  }
}
