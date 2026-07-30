export async function attachPortalBroadcastSessions(supabase, events) {
  const rows = Array.isArray(events) ? events : [];
  const eventIds = rows.map((row) => row?.id).filter(Boolean);

  if (eventIds.length === 0) return rows;

  const { data, error } = await supabase.rpc("get_portal_broadcast_sessions", {
    p_event_ids: eventIds,
  });

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
