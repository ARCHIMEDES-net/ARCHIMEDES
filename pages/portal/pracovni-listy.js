import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import RequireAuth from "../../components/RequireAuth";
import { supabase } from "../../lib/supabaseClient";

function isValidDate(d) {
  return d instanceof Date && !Number.isNaN(d.getTime());
}

function safeDate(value) {
  if (!value) return null;
  const d = new Date(value);
  return isValidDate(d) ? d : null;
}

function formatDay(date) {
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
  if (Array.isArray(aud)) return aud.filter(Boolean).join(", ");
  return String(aud);
}

export default function PracovniListy() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [q, setQ] = useState("");
  const [onlyFuture, setOnlyFuture] = useState(false);

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      setErr("");

      // bereme jen publikované události, které mají worksheet_url
      const { data, error } = await supabase
        .from("events")
        .select(
          "id,title,short_description,promo_short_text,audience,starts_at,is_published,worksheet_url,stream_url"
        )
        .eq("is_published", true)
        .not("worksheet_url", "is", null)
        .order("starts_at", { ascending: false });

      if (!alive) return;

      if (error) {
        setErr(error.message || "Nepodařilo se načíst pracovní listy.");
        setRows([]);
      } else {
        setRows(Array.isArray(data) ? data : []);
      }

      setLoading(false);
    }

    load();
    return () => (alive = false);
  }, []);

  const filtered = useMemo(() => {
    const now = new Date();
    const needle = q.trim().toLowerCase();

    return (rows || [])
      .map((r) => ({
        ...r,
        _start: safeDate(r.starts_at),
        _aud: normalizeAudience(r.audience),
      }))
      .filter((r) => r.worksheet_url) // jistota
      .filter((r) => (onlyFuture ? (r._start ? r._start >= now : false) : true))
      .filter((r) => {
        if (!needle) return true;
        const hay = [
          r.title,
          r.short_description,
          r.promo_short_text,
          r._aud,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return hay.includes(needle);
      });
  }, [rows, q, onlyFuture]);

  const grouped = useMemo(() => {
    // skupiny podle roku (jednoduché a přehledné)
    const map = new Map();
    for (const r of filtered) {
      const year = r._start ? String(r._start.getFullYear()) : "Bez data";
      if (!map.has(year)) map.set(year, []);
      map.get(year).push(r);
    }
    return Array.from(map.entries()).sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [filtered]);

  return (
    <RequireAuth>
      <div style={{ maxWidth: 1000, margin: "40px auto", fontFamily: "system-ui", padding: 16 }}>
        <h1>Pracovní listy</h1>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <Link href="/portal">← Zpět do portálu</Link>
          <span style={{ opacity: 0.6 }}>|</span>
          <Link href="/portal/kalendar">Kalendář</Link>

          <label style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: 12 }}>
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Hledat (název / cílovka)…"
              style={{ width: 340, padding: "8px 10px" }}
            />
          </label>

          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="checkbox"
              checked={onlyFuture}
              onChange={(e) => setOnlyFuture(e.target.checked)}
            />
            Jen budoucí
          </label>
        </div>

        {loading && <p style={{ marginTop: 16 }}>Načítám…</p>}
        {!loading && err && <p style={{ marginTop: 16, color: "crimson" }}>Chyba: {err}</p>}

        {!loading && !err && filtered.length === 0 && (
          <p style={{ marginTop: 16 }}>Zatím žádné pracovní listy.</p>
        )}

        {!loading && !err && filtered.length > 0 && (
          <div style={{ marginTop: 18 }}>
            {grouped.map(([year, items]) => (
              <div key={year} style={{ marginBottom: 22 }}>
                <h3 style={{ margin: "16px 0 10px" }}>{year}</h3>

                <div style={{ border: "1px solid #e5e5e5", borderRadius: 10, overflow: "hidden" }}>
                  {items.map((r, idx) => (
                    <div
                      key={r.id}
                      style={{
                        padding: 12,
                        borderTop: idx === 0 ? "none" : "1px solid #eee",
                        display: "grid",
                        gridTemplateColumns: "1fr auto",
                        gap: 12,
                        alignItems: "center",
                      }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 16, fontWeight: 800, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          <Link href={`/portal/udalost/${r.id}`}>{r.title || "(bez názvu)"}</Link>
                        </div>

                        <div style={{ opacity: 0.8, marginTop: 2, fontSize: 13 }}>
                          {r._start ? `${formatDay(r._start)} • ${formatTime(r._start)}` : "Bez data"}
                          {r._aud ? ` • ${r._aud}` : ""}
                        </div>

                        {(r.short_description || r.promo_short_text) && (
                          <div style={{ marginTop: 6, opacity: 0.9 }}>
                            {r.short_description || r.promo_short_text}
                          </div>
                        )}
                      </div>

                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
                        <a
                          href={r.worksheet_url}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            padding: "10px 12px",
                            borderRadius: 10,
                            border: "1px solid #ddd",
                            textDecoration: "none",
                            fontWeight: 800,
                            whiteSpace: "nowrap",
                          }}
                        >
                          📄 Otevřít
                        </a>

                        {r.stream_url ? (
                          <a
                            href={r.stream_url}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              padding: "10px 12px",
                              borderRadius: 10,
                              border: "1px solid #ddd",
                              textDecoration: "none",
                              fontWeight: 800,
                              whiteSpace: "nowrap",
                            }}
                          >
                            ▶ Vysílání
                          </a>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </RequireAuth>
  );
}
