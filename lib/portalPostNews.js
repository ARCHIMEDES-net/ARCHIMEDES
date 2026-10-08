export function parsePostNewsFields(body) {
  const result = {};
  if ("show_in_news" in body) {
    if (typeof body.show_in_news !== "boolean") throw new Error("Neplatná volba zobrazení v novinkách.");
    result.show_in_news = body.show_in_news;
  }
  if ("news_expires_at" in body) {
    if (body.news_expires_at && !Number.isFinite(Date.parse(body.news_expires_at))) throw new Error("Neplatný termín ukončení novinky.");
    result.news_expires_at = body.news_expires_at ? new Date(body.news_expires_at).toISOString() : null;
  }
  if ("related_event_id" in body) {
    if (body.related_event_id && !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(body.related_event_id)) throw new Error("Neplatné propojení vysílání.");
    result.related_event_id = body.related_event_id || null;
  }
  return result;
}
export function mergeNews(notifications, posts, nextEventId, now = new Date()) {
  const visiblePosts = posts.filter(p => p.is_published && p.show_in_news && (!p.news_expires_at || Date.parse(p.news_expires_at) > now.getTime()));
  const linked = new Set(visiblePosts.map(p => p.related_event_id).filter(Boolean));
  const seen = new Set();
  const notices = notifications.filter(n => {
    if (n.kind !== "new_event") return true;
    if (n.event_id === nextEventId || linked.has(n.event_id) || seen.has(n.event_id)) return false;
    seen.add(n.event_id); return true;
  });
  return [...notices.map(n => ({...n, feedKey: `notice-${n.id}`})), ...visiblePosts.map(p => ({
    id: p.id, feedKey: `post-${p.id}`, kind: p.section === "contests" ? "contest" : "article", title: p.title,
    body: String(p.content || "").length > 240 ? String(p.content).slice(0, 240) + "…" : p.content,
    target_path: `/portal/${p.section === "contests" ? "souteze" : "komunita"}?post=${p.id}#post-${p.id}`,
    available_at: p.created_at, read_at: p.created_at, isPost: true,
  }))].sort((a,b) => Date.parse(b.available_at) - Date.parse(a.available_at));
}
