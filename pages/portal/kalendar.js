import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import RequireAuth from "../../components/RequireAuth";
import { supabase } from "../../../lib/supabaseClient";

function safeDate(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

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

export default function KalendarPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setLoading(true);
      setErr("");

      const { data, error } = await supabase
        .from("events")
        .select("id,title,start_at,audience,full_description,stream_url,worksheet_url,is_published")
        .eq("is_published", true)
        .order("start_at", { ascending: true });

      if (!isMounted) return;

      if (error) {
        setErr(error.message || "Nepodařilo se načíst události.");
        setEvents([]);
      } else {
        setEvents(Array.isArray(data) ? data : []);
      }

      setLoading(false);
    }

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const grouped = useMemo(() => {
    const map = new Map(); // key: YYYY-MM-DD
    for (const e of events) {
      const d = safeDate(e.start_at);
      const key = d ? d.toISOString().slice(0, 10) : "bez-datumu";
      if (!map.has(key)) map.set(key, []);
      map.get(key).push({ ...e, _date: d });
    }
    return Array.from(map.entries()).sort(([a], [b]) => (a > b ? 1 : -1));
  }, [events]);

  return (
    <RequireAuth>
      <div style={{ maxWidth: 980, margin: "40px auto", fontFamily: "system-ui", padding: 16 }}>
        <h1>Kalendář</h1>

        <p style={{ marginTop: 8 }}>
          <Link href="/portal">← Zpět do portálu</Link>
        </p>

        {loading && <p>Načítám…</p>}

        {!loading && err && (
          <p style={{ color: "crimson" }}>
            Chyba: {err}
          </p>
        )}

        {!loading && !err && grouped.length === 0 && (
          <p>Zatím nejsou žádné publikované události.</p>
        )}

        {!loading && !err && grouped.map(([key, items]) => {
          const dayDate = items[0]?._date;
          return (
            <div key={key} style={{ marginTop: 22, paddingTop: 10, borderTop: "1px solid #eee" }}>
              <h2 style={{ margin: "0 0 10px 0" }}>
                {dayDate ? formatDayLabel(dayDate) : "Bez data"}
              </h2>

              <ul style={{ paddingLeft: 18, margin: 0 }}>
                {items.map((e) => (
                  <li key={e.id} style={{ marginBottom: 10 }}>
                    <div style={{ fontWeight: 700 }}>
                      {e._date ? `${formatTime(e._date)} – ` : ""}
                      {e.title || "(bez názvu)"}
                    </div>

                    {e.audience && (
                      <div style={{ opacity: 0.85 }}>Cílovka: {e.audience}</div>
                    )}

                    {(e.stream_url || e.worksheet_url) && (
                      <div style={{ marginTop: 4 }}>
                        {e.stream_url && (
                          <>
                            <a href={e.stream_url} target="_blank" rel="noreferrer">
                              Vysílání
                            </a>
                          </>
                        )}
                        {e.stream_url && e.worksheet_url ? " · " : ""}
                        {e.worksheet_url && (
                          <a href={e.worksheet_url} target="_blank" rel="noreferrer">
                            Pracovní list
                          </a>
                        )}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </RequireAuth>
  );
}
