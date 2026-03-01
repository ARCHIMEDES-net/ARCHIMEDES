import { useEffect, useState } from "react";
import Link from "next/link";
import RequireAuth from "../../components/RequireAuth";
import { supabase } from "../../lib/supabaseClient";

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
        .select("id,title,start_at,short_description,full_description,audience,stream_url,worksheet_url")
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

  return (
    <RequireAuth>
      <div style={{ maxWidth: 900, margin: "40px auto", fontFamily: "system-ui", padding: 16 }}>
        <h1>Kalendář</h1>

        <p>
          <Link href="/portal">← Zpět do portálu</Link>
        </p>

        {loading && <p>Načítám události…</p>}
        {error && <p style={{ color: "crimson" }}>Chyba: {error}</p>}

        {!loading && !error && events.length === 0 && (
          <p>Zatím nejsou žádné události.</p>
        )}

        {!loading && !error && events.length > 0 && (
          <ul style={{ paddingLeft: 18 }}>
            {events.map((e) => (
              <li key={e.id} style={{ marginBottom: 14 }}>
                <div style={{ fontWeight: 700 }}>{e.title}</div>

                {e.start_at && (
                  <div style={{ opacity: 0.8 }}>
                    {new Date(e.start_at).toLocaleString("cs-CZ")}
                  </div>
                )}

                {e.short_description && <div>{e.short_description}</div>}
                {e.audience && <div style={{ opacity: 0.8 }}>Cílovka: {e.audience}</div>}

                <div style={{ marginTop: 6 }}>
                  {e.stream_url ? (
                    <a href={e.stream_url} target="_blank" rel="noreferrer">
                      ▶ Odkaz na vysílání
                    </a>
                  ) : (
                    <span style={{ opacity: 0.6 }}>▶ Odkaz na vysílání není</span>
                  )}

                  {"  |  "}

                  {e.worksheet_url ? (
                    <a href={e.worksheet_url} target="_blank" rel="noreferrer">
                      📄 Pracovní list
                    </a>
                  ) : (
                    <span style={{ opacity: 0.6 }}>📄 Pracovní list není</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </RequireAuth>
  );
}
