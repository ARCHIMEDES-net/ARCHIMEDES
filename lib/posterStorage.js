export const POSTER_BUCKET = "posters";

export function getPosterPublicUrl(client, path) {
  if (!path) return "";
  const { data } = client.storage.from(POSTER_BUCKET).getPublicUrl(path);
  return data?.publicUrl ? String(data.publicUrl) : "";
}

export function extractPosterPathFromPublicUrl(value) {
  if (!value) return "";

  try {
    const url = new URL(String(value));
    const marker = `/storage/v1/object/public/${POSTER_BUCKET}/`;
    const markerIndex = url.pathname.indexOf(marker);
    if (markerIndex < 0) return "";
    return decodeURIComponent(url.pathname.slice(markerIndex + marker.length));
  } catch {
    return "";
  }
}

export function isEventOwnedPosterPath(path, eventId) {
  if (!path || !eventId) return false;
  return String(path).startsWith(`events/${eventId}/`);
}

export async function removePosterObject(client, path) {
  if (!path) return { removed: false, error: null };

  const { error } = await client.storage.from(POSTER_BUCKET).remove([path]);
  return { removed: !error, error: error || null };
}

export async function insertEventWithPosterCleanup(client, payload, uploadedPosterPath) {
  const result = await client.from("events").insert(payload).select("id").single();
  if (!result.error || !uploadedPosterPath) {
    return { ...result, cleanupError: null };
  }

  const cleanup = await removePosterObject(client, uploadedPosterPath);
  return { ...result, cleanupError: cleanup.error };
}

export async function removeEventOwnedPosterIfUnreferenced(
  client,
  { eventId, path, publicUrl }
) {
  const normalizedPath = path || extractPosterPathFromPublicUrl(publicUrl);
  if (!isEventOwnedPosterPath(normalizedPath, eventId)) {
    return { removed: false, skipped: "not_event_owned", error: null };
  }

  const normalizedUrl = publicUrl || getPosterPublicUrl(client, normalizedPath);
  const pathReferences = await client
    .from("events")
    .select("id", { count: "exact", head: true })
    .neq("id", eventId)
    .eq("poster_path", normalizedPath);

  if (pathReferences.error) {
    return { removed: false, skipped: "reference_check_failed", error: pathReferences.error };
  }

  if ((pathReferences.count || 0) > 0) {
    return { removed: false, skipped: "still_referenced", error: null };
  }

  let urlReferences = { count: 0, error: null };
  if (normalizedUrl) {
    urlReferences = await client
      .from("events")
      .select("id", { count: "exact", head: true })
      .neq("id", eventId)
      .like(
        "poster_url",
        `%/storage/v1/object/public/${POSTER_BUCKET}/${normalizedPath}%`
      );
  }

  if (urlReferences.error) {
    return { removed: false, skipped: "reference_check_failed", error: urlReferences.error };
  }

  if ((urlReferences.count || 0) > 0) {
    return { removed: false, skipped: "still_referenced", error: null };
  }

  return removePosterObject(client, normalizedPath);
}

export function appendCleanupError(message, cleanupError) {
  if (!cleanupError) return message;
  return `${message} Nový plakát se nepodařilo uklidit ze Storage: ${
    cleanupError.message || String(cleanupError)
  }`;
}
