import { createClient } from "@supabase/supabase-js";
import { requirePlatformAdmin } from "../../../../lib/server/platformAdminApi";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const eventId = String(req.query?.eventId || "").trim();
  if (!eventId) return res.status(400).json({ error: "Chybí ID události." });

  try {
    const admin = await requirePlatformAdmin(req, res, supabaseAdmin);
    if (!admin) return;

    const { data: sessions, error: sessionError } = await supabaseAdmin
      .from("broadcast_sessions")
      .select("id")
      .eq("event_id", eventId)
      .limit(1);

    if (sessionError) throw sessionError;
    const sessionId = sessions?.[0]?.id;
    if (!sessionId) return res.status(200).json({ attendees: [], count: 0 });

    const { data: participantRows, error: participantError } = await supabaseAdmin
      .from("broadcast_participants")
      .select(
        "id, user_id, organization_id, join_requested_at, presence_data, last_presence_sync_at"
      )
      .eq("session_id", sessionId)
      .order("join_requested_at", { ascending: true });

    if (participantError) throw participantError;
    const rows = participantRows || [];
    const userIds = unique(rows.map((row) => row.user_id));
    const organizationIds = unique(rows.map((row) => row.organization_id));

    const [profilesResult, organizationsResult] = await Promise.all([
      userIds.length
        ? supabaseAdmin.from("profiles").select("id, full_name, email").in("id", userIds)
        : Promise.resolve({ data: [], error: null }),
      organizationIds.length
        ? supabaseAdmin.from("organizations").select("id, name").in("id", organizationIds)
        : Promise.resolve({ data: [], error: null }),
    ]);

    if (profilesResult.error) throw profilesResult.error;
    if (organizationsResult.error) throw organizationsResult.error;

    const profiles = new Map((profilesResult.data || []).map((item) => [item.id, item]));
    const organizations = new Map(
      (organizationsResult.data || []).map((item) => [item.id, item])
    );

    const attendees = rows.map((row) => {
      const profile = profiles.get(row.user_id) || {};
      const organization = organizations.get(row.organization_id) || {};
      return {
        id: row.id,
        name: profile.full_name || profile.email || "Neznámý účastník",
        email: profile.email || "",
        organization: organization.name || "",
        joinRequestedAt: row.join_requested_at || null,
        present: Boolean(row.presence_data),
        lastPresenceSyncAt: row.last_presence_sync_at || null,
      };
    });

    return res.status(200).json({ attendees, count: attendees.length });
  } catch (error) {
    console.error("webmeeting attendance error:", error);
    return res.status(500).json({
      error: error.message || "Seznam účastníků se nepodařilo načíst.",
    });
  }
}
