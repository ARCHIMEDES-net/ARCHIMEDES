const PORTAL_BROADCAST_SESSION_COLUMNS = [
  "id",
  "event_id",
  "status",
  "viewer_url",
  "recording_url",
  "recording_status",
  "starts_at",
  "ended_at",
  "access_mode",
  "is_published",
  "moderator_name",
  "guest_1_name",
  "guest_2_name",
  "guest_3_name",
  "guest_4_name",
  "guest_5_name",
  "has_external_meeting",
].join(",");

export async function attachPortalBroadcastSessions(supabase, events) {
  const rows = Array.isArray(events) ? events : [];
  const eventIds = rows.map((row) => row?.id).filter(Boolean);

  if (eventIds.length === 0) return rows;

  const { data, error } = await supabase
    .from("portal_broadcast_sessions")
    .select(PORTAL_BROADCAST_SESSION_COLUMNS)
    .in("event_id", eventIds);

  if (error) throw error;

  const sessionsByEvent = new Map();
  for (const session of data || []) {
    if (!sessionsByEvent.has(session.event_id)) {
      sessionsByEvent.set(session.event_id, []);
    }
    sessionsByEvent.get(session.event_id).push(session);
  }

  return rows.map((row) => ({
    ...row,
    broadcast_sessions: sessionsByEvent.get(row.id) || [],
  }));
}

export async function attachPortalBroadcastSession(supabase, event) {
  if (!event?.id) return event;
  const [result] = await attachPortalBroadcastSessions(supabase, [event]);
  return result || event;
}
