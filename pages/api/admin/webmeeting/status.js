import { createClient } from "@supabase/supabase-js";
import { requirePlatformAdmin } from "../../../../lib/server/platformAdminApi";
import {
  getWebMeetingConfiguration,
  WebMeetingApiError,
  webMeeting,
} from "../../../../lib/server/webmeetingClient";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

export default async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const admin = await requirePlatformAdmin(req, res, supabaseAdmin);
    if (!admin) return;

    const configuration = getWebMeetingConfiguration();
    if (!configuration.configured) {
      return res.status(200).json({
        configured: false,
        connected: false,
        message: "Na serveru zatím chybí přístupové údaje WebMeeting API.",
      });
    }

    if (req.method === "GET") {
      return res.status(200).json({ configured: true, connected: null });
    }

    await webMeeting.getMeetings(null);
    return res.status(200).json({
      configured: true,
      connected: true,
      message: "Podepsané spojení s WebMeeting API funguje.",
    });
  } catch (error) {
    console.error("webmeeting status error:", error);
    const status = error instanceof WebMeetingApiError ? error.status : 500;
    return res.status(status).json({
      configured: true,
      connected: false,
      error: error.message || "Spojení s WebMeeting API se nepodařilo ověřit.",
    });
  }
}
