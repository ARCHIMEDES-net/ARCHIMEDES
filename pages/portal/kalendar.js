import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import RequireAuth from "../../components/RequireAuth";
import PortalHeader from "../../components/PortalHeader";
import { supabase } from "../../lib/supabaseClient";

function safeDate(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function formatDate(date) {
  return date.toLocaleDateString("cs-CZ", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function formatTime(date) {
  return date.toLocaleTimeString("cs-CZ", { hour: "2-digit", minute: "2-digit" });
}

function normalizeAudience(aud) {
  if (!aud) return "";
  if (Array.isArray(aud)) return aud.join(", ");
  return String(aud);
}

export default function Kalendar() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setLoading(true);
      setErr("");

      const { data, error } = await supabase
        .from("events")
        .select("id,title,starts_at,stream_url,worksheet_url,is_published,audience")
        .order("starts_at", { ascending: true });

      if (!isMounted) return;

      if (error) {
        setErr(error.message || "Chyba načítání");
        setRows([]);
      } else {
        setRows(Array.isArray(data) ? data : []);
      }

      setLoading(false);
    }

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const upcoming = useMemo(() => {
    const now = new Date();
    return rows
      .map((r) => ({ ...r, _d: safeDate(r.starts_at) }))
      .filter((r) => r._d && r._d >= now && r.is_published !== false);
  }, [rows]);

  const noDate = useMemo(() => {
    return rows.filter((r) => !r.starts_at && r.is_published !== false);
  }, [rows]);

  return (
    <RequireAuth>
      <PortalHeader />

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "18px 16px" }}>
        <h1 style={{ margin: "10px 0 6px" }}>Program (Kalendář)</h1>
        <p style={{ margin: 0, color: "#374151" }}>
          Přehled vysílání jako program. Řazeno podle <code>starts_at</code>.
        </p>

        {err ? (
          <div style={{ marginTop: 12, padding: 12, border: "1px solid #fecaca", background: "#fef2f2", borderRadius: 12 }}>
            <b>Chyba:</b> {err}
          </div>
        ) : null}

        {loading ? <p style={{ marginTop: 14 }}>Načítám…</p> : null}

        {!loading && !err ? (
          <>
            <Section title="Nadcházející">
              {upcoming.length === 0 ? (
                <p style={{ margin: 0, color: "#6b7280" }}>Zatím žádné nadcházející události.</p>
              ) : (
                <List rows={upcoming} />
              )}
            </Section>

            <Section title="Bez data">
              {noDate.length === 0 ? (
                <p style={{ margin: 0, color: "#6b7280" }}>Bez událostí.</p>
              ) : (
                <List rows={noDate.map((r) => ({ ...r, _d: null }))} />
              )}
            </Section>

            <div style={{ marginTop: 18 }}>
              <Link href="/portal/admin-udalosti">→ Admin události</Link>
            </div>
          </>
        ) : null}
      </main>
    </RequireAuth>
  );
}

function Section({ title, children }) {
  return (
    <section style={{ marginTop: 16 }}>
      <h2 style={{ margin: "10px 0" }}>{title}</h2>
      <div style={{ border: "1px solid #e5e7eb", borderRadius: 14, padding: 14 }}>{children}</div>
    </section>
  );
}

function List({ rows }) {
  return (
    <div style={{ display: "grid", gap: 12 }}>
      {rows.map((r) => {
        const aud = normalizeAudience(r.audience);
        const d = r._d;
        return (
          <div key={r.id} style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 12 }}>
            <div style={{ fontWeight: 800 }}>{r.title}</div>

            <div style={{ marginTop: 6, color: "#374151" }}>
              {d ? (
                <>
                  {formatDate(d)} &nbsp; {formatTime(d)}
                </>
              ) : (
                <span style={{ color: "#6b7280" }}>bez data</span>
              )}
              {aud ? <span> &nbsp; • &nbsp; {aud}</span> : null}
            </div>

            <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
              {r.stream_url ? (
                <a href={r.stream_url} target="_blank" rel="noreferrer">
                  ▶ Vysílání
                </a>
              ) : null}

              {r.worksheet_url ? (
                <a href={r.worksheet_url} target="_blank" rel="noreferrer">
                  📄 Pracovní list
                </a>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
