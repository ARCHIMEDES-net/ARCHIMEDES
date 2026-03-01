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
  if (Array.isArray(aud)) return aud.filter(Boolean).join(", ");
  return String(aud);
}

export default function Kalendar() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [q, setQ] = useState("");
  const [onlyFuture, setOnlyFuture] = useState(true);

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      setErr("");

      const { data, error } = await supabase
        .from("events")
        .select(
          "id,title,short_description,full_description,audience,start_at,is_published,stream_url,worksheet_url,archive_url,poster_url,promo_short_text"
        )
        .eq("is_published", true)
        .order("start_at", { ascending: true });

      if (!alive) return;

      if (error) {
        setErr(error.message);
        setRows([]);
      } else {
        setRows(data || []);
      }

      setLoading(false);
    }

    load();
    return () => {
      alive = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const now = new Date();
    const needle = q.trim().toLowerCase();

    return (rows || [])
      .map((r) => ({
        ...r,
        _start: safeDate(r.start_at),
        _aud: normalizeAudience(r.audience),
      }))
      .filter((r) => r._start) // jen validní datum
      .filter((r) => (onlyFuture ? r._start >= now : true))
      .filter((r) => {
        if (!needle) return true;
        const hay = [
          r.title,
          r.short_description,
          r.full_description,
          r._aud,
          r.promo_short_text,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return hay.includes(needle);
      });
  }, [rows, q, onlyFuture]);

  const grouped = useMemo(() => {
    const map = new Map();
    for (const r of filtered) {
      const key = formatDayLabel(r._start);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(r);
    }
    return Array.from(map.entries());
  }, [filtered]);

  return (
    <RequireAuth>
      <div style={{ maxWidth: 1000, margin: "40px auto", fontFamily: "system-ui", padding: 16 }}>
        <h1>Kalendář</h1>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <Link href="/portal">← Zpět do portálu</Link>

          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Hledat (název / cílovka / popis)…"
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

          <span style={{ marginLeft: "auto" }}>
            <Link href="/portal/admin/udalosti">Admin – události →</Link>
          </span>
        </div>

        {loading && <p style={{ marginTop: 16 }}>Načítám…</p>}
        {!loading && err && <p style={{ marginTop: 16, color: "crimson" }}>Chyba: {err}</p>}

        {!loading && !err && grouped.length === 0 && (
          <p style={{ marginTop: 16 }}>Nic nenalezeno (nebo nejsou publikované události).</p>
        )}

        {!loading && !err && grouped.length > 0 && (
          <div style={{ marginTop: 18 }}>
            {grouped.map(([day, items]) => (
              <div key={day} style={{ marginBottom: 18 }}>
                <h3 style={{ margin: "16px 0 10px" }}>{day}</h3>

                <div style={{ border: "1px solid #e5e5e5", borderRadius: 10, overflow: "hidden" }}>
                  {items.map((r, idx) => (
                    <div
                      key={r.id}
                      style={{
                        padding: 12,
                        borderTop: idx === 0 ? "none" : "1px solid #eee",
                        display: "grid",
                        gridTemplateColumns: "90px 1fr",
                        gap: 12,
                      }}
                    >
                      <div style={{ fontWeight: 700 }}>{formatTime(r._start)}</div>

                      <div>
                        <div style={{ fontSize: 16, fontWeight: 700 }}>
                          <Link href={`/portal/udalost/${r.id}`}>{r.title || "(bez názvu)"}</Link>
                        </div>

                        {r._aud && (
                          <div style={{ opacity: 0.8, marginTop: 2 }}>Cílovka: {r._aud}</div>
                        )}

                        {(r.short_description || r.promo_short_text) && (
                          <div style={{ marginTop: 6 }}>
                            {r.short_description || r.promo_short_text}
                          </div>
                        )}
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
