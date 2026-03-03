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
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function normalizeGroups(row) {
  if (Array.isArray(row?.audience_groups) && row.audience_groups.length) return row.audience_groups;
  const aud = row?.audience;
  if (!aud) return [];
  if (Array.isArray(aud)) return aud;
  return String(aud)
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

export default function PracovniListy() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [filterCategory, setFilterCategory] = useState("Vše");
  const [filterAudience, setFilterAudience] = useState("Vše");
  const [q, setQ] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setLoading(true);
      setErr("");

      const { data, error } = await supabase
        .from("events")
        .select(
          "id,title,starts_at,category,audience_groups,audience,worksheet_url,is_published,poster_url"
        )
        .order("starts_at", { ascending: false });

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

  const prepared = useMemo(() => {
    return rows
      .filter((r) => r.is_published !== false)
      .map((r) => ({ ...r, _d: safeDate(r.starts_at), _groups: normalizeGroups(r) }));
  }, [rows]);

  const categories = useMemo(() => {
    const set = new Set();
    prepared.forEach((r) => {
      if (r.category) set.add(r.category);
    });
    return ["Vše", ...Array.from(set).sort((a, b) => a.localeCompare(b, "cs"))];
  }, [prepared]);

  const audiences = useMemo(() => {
    const set = new Set();
    prepared.forEach((r) => (r._groups || []).forEach((g) => set.add(g)));
    return ["Vše", ...Array.from(set).sort((a, b) => a.localeCompare(b, "cs"))];
  }, [prepared]);

  const visible = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return prepared
      .filter((r) => !!r.worksheet_url)
      .filter((r) => (filterCategory === "Vše" ? true : r.category === filterCategory))
      .filter((r) => (filterAudience === "Vše" ? true : (r._groups || []).includes(filterAudience)))
      .filter((r) => (qq ? String(r.title || "").toLowerCase().includes(qq) : true));
  }, [prepared, filterCategory, filterAudience, q]);

  return (
    <RequireAuth>
      <PortalHeader />

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "18px 16px" }}>
        <h1 style={{ margin: "10px 0 6px" }}>Pracovní listy</h1>
        <p style={{ margin: 0, color: "#374151" }}>
          Přehled událostí, které mají vložený pracovní list.
        </p>

        <div
          style={{
            marginTop: 12,
            border: "1px solid #e5e7eb",
            borderRadius: 14,
            padding: 12,
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 10,
          }}
        >
          <div>
            <div style={{ fontWeight: 900, marginBottom: 6 }}>Hledat</div>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Název události…"
              style={{ width: "100%", padding: "10px 12px", borderRadius: 12, border: "1px solid #e5e7eb" }}
            />
          </div>

          <div>
            <div style={{ fontWeight: 900, marginBottom: 6 }}>Rubrika</div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              style={{ width: "100%", padding: "10px 12px", borderRadius: 12, border: "1px solid #e5e7eb" }}
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div style={{ fontWeight: 900, marginBottom: 6 }}>Cílovka</div>
            <select
              value={filterAudience}
              onChange={(e) => setFilterAudience(e.target.value)}
              style={{ width: "100%", padding: "10px 12px", borderRadius: 12, border: "1px solid #e5e7eb" }}
            >
              {audiences.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
        </div>

        {err ? (
          <div style={{ marginTop: 12, padding: 12, border: "1px solid #fecaca", background: "#fef2f2", borderRadius: 12 }}>
            <b>Chyba:</b> {err}
          </div>
        ) : null}

        {loading ? <p style={{ marginTop: 14 }}>Načítám…</p> : null}

        {!loading && !err ? (
          <section style={{ marginTop: 14 }}>
            {visible.length === 0 ? (
              <div style={{ border: "1px solid #e5e7eb", borderRadius: 14, padding: 14, color: "#6b7280" }}>
                Žádné pracovní listy podle zvolených filtrů.
              </div>
            ) : (
              <div style={{ display: "grid", gap: 12 }}>
                {visible.map((r) => (
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
                      background: "#fff",
                    }}
                  >
                    {r.poster_url ? (
                      <img
                        src={r.poster_url}
                        alt=""
                        style={{ width: 120, height: 90, objectFit: "cover", borderRadius: 12, border: "1px solid #e5e7eb", background: "#f9fafb" }}
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
                          fontWeight: 800,
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
                        {r._d ? formatDateTimeCS(r._d) : "—"}
                        {r.category ? <span> &nbsp; • &nbsp; {r.category}</span> : null}
                        {(r._groups || []).length ? <span> &nbsp; • &nbsp; {r._groups.join(", ")}</span> : null}
                      </div>

                      <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
                        <a href={r.worksheet_url} target="_blank" rel="noreferrer">
                          📄 Otevřít pracovní list
                        </a>
                        <Link href="/portal/kalendar">→ Program</Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        ) : null}
      </main>
    </RequireAuth>
  );
}
