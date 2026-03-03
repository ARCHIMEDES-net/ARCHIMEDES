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

function formatDateTimeCS(date) {
  return date.toLocaleString("cs-CZ", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function normalizeAudience(row) {
  const ag = row?.audience_groups;
  if (Array.isArray(ag) && ag.length) return ag.join(", ");

  const aud = row?.audience;
  if (!aud) return "";
  if (Array.isArray(aud)) return aud.join(", ");
  return String(aud);
}

export default function Kalendar() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [view, setView] = useState("upcoming"); // upcoming | archive | nodate

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setLoading(true);
      setErr("");

      const { data, error } = await supabase
        .from("events")
        .select(
          "id,title,starts_at,stream_url,worksheet_url,is_published,audience,audience_groups,poster_url,category,created_at"
        )
        .order("starts_at", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: false });

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

  const prepared = useMemo(() => rows.map((r) => ({ ...r, _d: safeDate(r.starts_at) })), [rows]);

  const upcoming = useMemo(() => {
    const now = new Date();
    return prepared.filter((r) => r.is_published !== false && r._d && r._d >= now);
  }, [prepared]);

  const archive = useMemo(() => {
    const now = new Date();
    return prepared
      .filter((r) => r.is_published !== false && r._d && r._d < now)
      .sort((a, b) => (b._d?.getTime() || 0) - (a._d?.getTime() || 0));
  }, [prepared]);

  const noDate = useMemo(() => prepared.filter((r) => r.is_published !== false && !r._d), [prepared]);

  const visibleRows = view === "archive" ? archive : view === "nodate" ? noDate : upcoming;

  return (
    <RequireAuth>
      <PortalHeader />

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "18px 16px" }}>
        <h1 style={{ margin: "10px 0 6px" }}>Program (Kalendář)</h1>
        <p style={{ margin: 0, color: "#374151" }}>
          Přehled vysílání jako program. Řazeno podle <code>starts_at</code> a publikace.
        </p>

        <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
          <TabButton active={view === "upcoming"} onClick={() => setView("upcoming")}>
            Nadcházející ({upcoming.length})
          </TabButton>
          <TabButton active={view === "archive"} onClick={() => setView("archive")}>
            Archiv ({archive.length})
          </TabButton>
          <TabButton active={view === "nodate"} onClick={() => setView("nodate")}>
            Bez data ({noDate.length})
          </TabButton>
        </div>

        {err ? (
          <div style={{ marginTop: 12, padding: 12, border: "1px solid #fecaca", background: "#fef2f2", borderRadius: 12 }}>
            <b>Chyba:</b> {err}
          </div>
        ) : null}

        {loading ? <p style={{ marginTop: 14 }}>Načítám…</p> : null}

        {!loading && !err ? (
          <section style={{ marginTop: 14 }}>
            {visibleRows.length === 0 ? (
              <div style={{ border: "1px solid #e5e7eb", borderRadius: 14, padding: 14, color: "#6b7280" }}>
                Zatím žádné události v této sekci.
              </div>
            ) : (
              <List rows={visibleRows} />
            )}
          </section>
        ) : null}
      </main>
    </RequireAuth>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "8px 12px",
        borderRadius: 999,
        border: "1px solid #e5e7eb",
        background: active ? "#111827" : "#fff",
        color: active ? "#fff" : "#111827",
        cursor: "pointer",
        fontWeight: 700,
      }}
    >
      {children}
    </button>
  );
}

function List({ rows }) {
  return (
    <div style={{ display: "grid", gap: 12 }}>
      {rows.map((r) => {
        const aud = normalizeAudience(r);
        const d = r._d;

        return (
          <div
            key={r.id}
            style={{
              display: "grid",
              gridTemplateColumns: "120px 1fr",
              gap: 12,
              border: "1px solid #e5e7eb",
              borderRadius: 14,
              padding: 12,
              alignItems: "start",
            }}
          >
            {r.poster_url ? (
              <img
                src={r.poster_url}
                alt=""
                style={{ width: 120, height: 90, objectFit: "cover", borderRadius: 12, border: "1px solid #eee", background: "#f9fafb" }}
              />
            ) : (
              <div
                style={{
                  width: 120,
                  height: 90,
                  borderRadius: 12,
                  border: "1px dashed #d1d5db",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#6b7280",
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                Bez plakátu
              </div>
            )}

            <div>
              <Link href={`/portal/udalost/${r.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                <div style={{ fontWeight: 900, fontSize: 16, cursor: "pointer" }}>{r.title}</div>
              </Link>

              <div style={{ marginTop: 6, color: "#374151" }}>
                {d ? formatDateTimeCS(d) : <span style={{ color: "#6b7280" }}>bez data</span>}
                {aud ? <span> &nbsp; • &nbsp; {aud}</span> : null}
                {r.category ? <span> &nbsp; • &nbsp; {r.category}</span> : null}
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
          </div>
        );
      })}
    </div>
  );
}
