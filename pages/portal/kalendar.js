import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

function formatCz(dt) {
  try {
    const d = new Date(dt);
    if (Number.isNaN(d.getTime())) return "—";
    return new Intl.DateTimeFormat("cs-CZ", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  } catch {
    return "—";
  }
}

export default function Kalendar() {
  const [loading, setLoading] = useState(true);
  const [upcoming, setUpcoming] = useState([]);
  const [past, setPast] = useState([]);
  const [error, setError] = useState("");

  const nowIso = useMemo(() => new Date().toISOString(), []);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setLoading(true);
      setError("");

      // Nadcházející (publikované)
      const upcomingRes = await supabase
        .from("events")
        .select("id,title,starts_at,audience,stream_url,worksheet_url,is_published")
        .eq("is_published", true)
        .gte("starts_at", nowIso)
        .order("starts_at", { ascending: true })
        .limit(200);

      // Archiv (publikované)
      const pastRes = await supabase
        .from("events")
        .select("id,title,starts_at,audience,stream_url,worksheet_url,is_published")
        .eq("is_published", true)
        .lt("starts_at", nowIso)
        .order("starts_at", { ascending: false })
        .limit(200);

      if (!isMounted) return;

      const errs = [];
      if (upcomingRes.error) errs.push(upcomingRes.error.message);
      if (pastRes.error) errs.push(pastRes.error.message);

      if (errs.length) {
        setError(errs.join(" | "));
        setUpcoming([]);
        setPast([]);
      } else {
        setUpcoming(upcomingRes.data || []);
        setPast(pastRes.data || []);
      }

      setLoading(false);
    }

    load();
    return () => {
      isMounted = false;
    };
  }, [nowIso]);

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>Program (TV)</div>
          <div style={{ opacity: 0.7 }}>Přehled vysílání jako TV program. Řazeno podle starts_at.</div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <Link href="/portal">
            <a style={{ padding: "10px 12px", border: "1px solid #ddd", borderRadius: 10, textDecoration: "none" }}>
              ← Zpět do portálu
            </a>
          </Link>
          <Link href="/portal/admin/events">
            <a style={{ padding: "10px 12px", border: "1px solid #ddd", borderRadius: 10, textDecoration: "none" }}>
              Admin – události
            </a>
          </Link>
        </div>
      </div>

      {error ? (
        <div style={{ marginTop: 16, padding: 12, border: "1px solid #f2c", borderRadius: 12 }}>
          <b>Chyba:</b> {error}
        </div>
      ) : null}

      {loading ? (
        <div style={{ marginTop: 18, opacity: 0.7 }}>Načítám…</div>
      ) : (
        <>
          <Section
            title="Nadcházející"
            items={upcoming}
          />
          <Section
            title="Archiv"
            items={past}
          />
        </>
      )}

      <div style={{ marginTop: 24, opacity: 0.6, fontSize: 13 }}>
        Pozn.: Zobrazuji pouze publikované události (is_published = true).
      </div>
    </div>
  );
}

function Section({ title, items }) {
  return (
    <div style={{ marginTop: 22 }}>
      <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>{title}</div>

      {(!items || items.length === 0) ? (
        <div style={{ padding: 14, border: "1px solid #eee", borderRadius: 14, opacity: 0.75 }}>
          Zatím prázdné.
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {items.map((e) => (
            <div key={e.id} style={{ padding: 14, border: "1px solid #eee", borderRadius: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline" }}>
                <div style={{ fontWeight: 700 }}>{e.title}</div>
                <div style={{ opacity: 0.75, fontSize: 14 }}>{formatCz(e.starts_at)}</div>
              </div>

              <div style={{ marginTop: 6, display: "flex", gap: 8, flexWrap: "wrap", opacity: 0.85 }}>
                <span style={{ padding: "4px 8px", border: "1px solid #eee", borderRadius: 999 }}>
                  {e.audience}
                </span>
                {e.stream_url ? <span style={{ padding: "4px 8px", border: "1px solid #eee", borderRadius: 999 }}>▶ vysílání</span> : null}
                {e.worksheet_url ? <span style={{ padding: "4px 8px", border: "1px solid #eee", borderRadius: 999 }}>📄 pracovní list</span> : null}
              </div>

              <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
                <Link href={`/portal/event/${e.id}`}>
                  <a style={{ padding: "10px 12px", border: "1px solid #ddd", borderRadius: 10, textDecoration: "none" }}>
                    Detail
                  </a>
                </Link>

                {e.stream_url ? (
                  <a
                    href={e.stream_url}
                    target="_blank"
                    rel="noreferrer"
                    style={{ padding: "10px 12px", border: "1px solid #ddd", borderRadius: 10, textDecoration: "none" }}
                  >
                    ▶ Vysílání
                  </a>
                ) : null}

                {e.worksheet_url ? (
                  <a
                    href={e.worksheet_url}
                    target="_blank"
                    rel="noreferrer"
                    style={{ padding: "10px 12px", border: "1px solid #ddd", borderRadius: 10, textDecoration: "none" }}
                  >
                    📄 Pracovní list
                  </a>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
