import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import RequireAuth from "../../components/RequireAuth";
import { supabase } from "../../lib/supabaseClient";

function formatDayLabel(date) {
  return date.toLocaleDateString("cs-CZ", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatTime(date) {
  return date.toLocaleTimeString("cs-CZ", { hour: "2-digit", minute: "2-digit" });
}

function normalizeAudience(aud) {
  if (!aud) return "";
  const s = aud.toLowerCase();
  if (s.includes("1")) return "1. stupeň";
  if (s.includes("2")) return "2. stupeň";
  if (s.includes("sen")) return "Senioři";
  if (s.includes("kom")) return "Komunita";
  return aud;
}

function pillStyle(label) {
  return {
    display: "inline-block",
    padding: "2px 10px",
    borderRadius: 999,
    border: "1px solid rgba(0,0,0,0.15)",
    fontSize: 12,
    opacity: 0.9,
    marginLeft: 8,
  };
}

function groupByDay(events) {
  const map = new Map();
  for (const e of events) {
    const d = e.start_at ? new Date(e.start_at) : null;
    const key = d ? d.toISOString().slice(0, 10) : "bez-datumu";
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(e);
  }
  // Seřadit události v každém dni podle času
  for (const [k, arr] of map) {
    arr.sort((a, b) => {
      const ta = a.start_at ? new Date(a.start_at).getTime() : 0;
      const tb = b.start_at ? new Date(b.start_at).getTime() : 0;
      return ta - tb;
    });
    map.set(k, arr);
  }
  // Seřadit dny
  const keys = Array.from(map.keys()).sort();
  return keys.map((k) => ({ key: k, items: map.get(k) }));
}

export default function Kalendar() {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");

      const { data, error } = await supabase
        .from("events")
        .select("id,title,start_at,short_description,full_description,audience,stream_url,worksheet_url,created_at")
        .order("start_at", { ascending: true, nullsFirst: false });

      if (error) {
        setError(error.message || "Nepodařilo se načíst události.");
        setEvents([]);
      } else {
        setEvents(data || []);
      }

      setLoading(false);
    }

    load();
  }, []);

  const now = Date.now();

  const { upcomingGrouped, archiveGrouped } = useMemo(() => {
    const upcoming = [];
    const archive = [];

    for (const e of events) {
      const t = e.start_at ? new Date(e.start_at).getTime() : null;

      // Bez start_at dáme zatím do nadcházejících (ať se neztratí)
      if (!t) {
        upcoming.push(e);
        continue;
      }

      if (t >= now - 5 * 60 * 1000) upcoming.push(e); // malá tolerance -5 min
      else archive.push(e);
    }

    return {
      upcomingGrouped: groupByDay(upcoming),
      archiveGrouped: groupByDay(archive),
    };
  }, [events, now]);

  return (
    <RequireAuth>
      <div style={{ maxWidth: 980, margin: "40px auto", fontFamily: "system-ui", padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
          <h1 style={{ margin: 0 }}>Program (TV)</h1>
          <div style={{ display: "flex", gap: 12 }}>
            <Link href="/portal">Portál</Link>
            <a href="/logout">Odhlásit</a>
          </div>
        </div>

        <p style={{ marginTop: 10, opacity: 0.8 }}>
          Přehled vysílání jako TV program. Řazeno podle <strong>start_at</strong>.
        </p>

        {loading && <p>Načítám program…</p>}
        {error && <p style={{ color: "crimson" }}>Chyba: {error}</p>}

        {!loading && !error && (
          <>
            {/* NADCHÁZEJÍCÍ */}
            <h2 style={{ marginTop: 26 }}>Nadcházející</h2>

            {upcomingGrouped.length === 0 ? (
              <p>Zatím nic naplánovaného.</p>
            ) : (
              upcomingGrouped.map((g) => {
                const dayDate = g.key === "bez-datumu" ? null : new Date(g.key + "T00:00:00");
                return (
                  <div key={g.key} style={{ marginTop: 14 }}>
                    <div style={{ fontWeight: 700, marginBottom: 8 }}>
                      {dayDate ? formatDayLabel(dayDate) : "Bez data"}
                    </div>

                    <div style={{ display: "grid", gap: 10 }}>
                      {g.items.map((e) => {
                        const d = e.start_at ? new Date(e.start_at) : null;
                        const aud = normalizeAudience(e.audience);

                        return (
                          <div
                            key={e.id}
                            style={{
                              border: "1px solid rgba(0,0,0,0.12)",
                              borderRadius: 12,
                              padding: 12,
                              display: "grid",
                              gridTemplateColumns: "90px 1fr",
                              gap: 12,
                              alignItems: "start",
                            }}
                          >
                            <div style={{ fontWeight: 800, fontSize: 16 }}>
                              {d ? formatTime(d) : "--:--"}
                            </div>

                            <div>
                              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6 }}>
                                <div style={{ fontWeight: 800 }}>{e.title}</div>
                                {aud && <span style={pillStyle(aud)}>{aud}</span>}
                              </div>

                              {e.short_description && (
                                <div style={{ marginTop: 6, opacity: 0.9 }}>{e.short_description}</div>
                              )}

                              <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 10 }}>
                                <Link href={`/portal/udalost/${e.id}`}>Detail</Link>

                                {e.stream_url ? (
                                  <a href={e.stream_url} target="_blank" rel="noreferrer">
                                    ▶ Vysílání
                                  </a>
                                ) : (
                                  <span style={{ opacity: 0.6 }}>▶ bez odkazu</span>
                                )}

                                {e.worksheet_url ? (
                                  <a href={e.worksheet_url} target="_blank" rel="noreferrer">
                                    📄 Pracovní list
                                  </a>
                                ) : (
                                  <span style={{ opacity: 0.6 }}>📄 bez listu</span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}

            {/* ARCHIV */}
            <h2 style={{ marginTop: 34 }}>Archiv</h2>

            {archiveGrouped.length === 0 ? (
              <p>Archiv je zatím prázdný.</p>
            ) : (
              archiveGrouped
                .slice()
                .reverse() // v archivu chceme nejnovější den nahoře
                .map((g) => {
                  const dayDate = g.key === "bez-datumu" ? null : new Date(g.key + "T00:00:00");
                  return (
                    <div key={g.key} style={{ marginTop: 14 }}>
                      <div style={{ fontWeight: 700, marginBottom: 8, opacity: 0.85 }}>
                        {dayDate ? formatDayLabel(dayDate) : "Bez data"}
                      </div>

                      <div style={{ display: "grid", gap: 10 }}>
                        {g.items.map((e) => {
                          const d = e.start_at ? new Date(e.start_at) : null;
                          const aud = normalizeAudience(e.audience);

                          return (
                            <div
                              key={e.id}
                              style={{
                                border: "1px solid rgba(0,0,0,0.10)",
                                borderRadius: 12,
                                padding: 12,
                                display: "grid",
                                gridTemplateColumns: "90px 1fr",
                                gap: 12,
                                opacity: 0.9,
                              }}
                            >
                              <div style={{ fontWeight: 800 }}>{d ? formatTime(d) : "--:--"}</div>

                              <div>
                                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6 }}>
                                  <div style={{ fontWeight: 800 }}>{e.title}</div>
                                  {aud && <span style={pillStyle(aud)}>{aud}</span>}
                                </div>

                                <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 10 }}>
                                  <Link href={`/portal/udalost/${e.id}`}>Detail</Link>
                                  {e.stream_url ? (
                                    <a href={e.stream_url} target="_blank" rel="noreferrer">
                                      ▶ Záznam / link
                                    </a>
                                  ) : (
                                    <span style={{ opacity: 0.6 }}>▶ bez odkazu</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
            )}
          </>
        )}
      </div>
    </RequireAuth>
  );
}
