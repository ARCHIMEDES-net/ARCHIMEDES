import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import RequireAuth from "../../components/RequireAuth";
import PortalHeader from "../../components/PortalHeader";
import { supabase } from "../../lib/supabaseClient";

const TYPE_OPTIONS = [
  { value: "", label: "Vše" },
  { value: "offer", label: "Nabídka" },
  { value: "demand", label: "Poptávka" },
  { value: "partnership", label: "Partnerství" },
];

const STATUS_OPTIONS = [
  { value: "active", label: "Aktivní" },
  { value: "closed", label: "Uzavřené" },
];

const CATEGORY_OPTIONS = [
  "",
  "Vybavení školy",
  "Učebnice a pomůcky",
  "Technologie",
  "Výměnné pobyty a projekty",
  "Obec a komunita",
  "ARCHIMEDES komponenty",
];

function typeLabel(t) {
  if (t === "offer") return "NABÍDKA";
  if (t === "demand") return "POPTÁVKA";
  if (t === "partnership") return "PARTNERSTVÍ";
  return t || "";
}

export default function Inzerce() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("active");
  const [onlyArchimedes, setOnlyArchimedes] = useState(false);

  async function load() {
    setLoading(true);
    setErr("");

    let query = supabase
      .from("marketplace_posts")
      .select("id,type,category,title,location,is_archimedes,is_pinned,status,created_at,expires_at,author_id")
      .eq("status", status);

    if (type) query = query.eq("type", type);
    if (category) query = query.eq("category", category);
    if (onlyArchimedes) query = query.eq("is_archimedes", true);

    // Řazení: pinned nahoře, pak nejnovější
    query = query.order("is_pinned", { ascending: false }).order("created_at", { ascending: false });

    const { data, error } = await query;

    if (error) {
      setErr(error.message || "Chyba při načítání inzerce.");
      setRows([]);
      setLoading(false);
      return;
    }

    // jednoduché fulltext filtrování na klientovi (MVP)
    const qq = q.trim().toLowerCase();
    const filtered = (data || []).filter((r) => {
      if (!qq) return true;
      return (
        String(r.title || "").toLowerCase().includes(qq) ||
        String(r.category || "").toLowerCase().includes(qq) ||
        String(r.location || "").toLowerCase().includes(qq)
      );
    });

    setRows(filtered);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, category, status, onlyArchimedes]);

  const activeCount = useMemo(() => rows.filter((r) => r.status === "active").length, [rows]);

  return (
    <RequireAuth>
      <PortalHeader title="Inzerce" />

      <div style={{ padding: 16, maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", marginBottom: 12 }}>
          <Link href="/portal">
            ← Zpět do portálu
          </Link>

          <div style={{ marginLeft: "auto", display: "flex", gap: 12, alignItems: "center" }}>
            <Link href="/portal/inzerce/novy">
              + Nový inzerát
            </Link>
          </div>
        </div>

        <div style={{ padding: 12, border: "1px solid #e6e6e6", borderRadius: 12, marginBottom: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr", gap: 10 }}>
            <div>
              <div style={{ fontSize: 12, opacity: 0.7 }}>Hledat</div>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="název, kategorie, lokalita…"
                style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
              />
              <div style={{ marginTop: 8 }}>
                <button
                  onClick={load}
                  style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid #ddd", cursor: "pointer" }}
                >
                  Hledat
                </button>
              </div>
            </div>

            <div>
              <div style={{ fontSize: 12, opacity: 0.7 }}>Typ</div>
              <select value={type} onChange={(e) => setType(e.target.value)} style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ddd" }}>
                {TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            <div>
              <div style={{ fontSize: 12, opacity: 0.7 }}>Kategorie</div>
              <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ddd" }}>
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c || "all"} value={c}>{c || "Vše"}</option>
                ))}
              </select>
            </div>

            <div>
              <div style={{ fontSize: 12, opacity: 0.7 }}>Stav</div>
              <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ddd" }}>
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>

              <label style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 10, userSelect: "none" }}>
                <input
                  type="checkbox"
                  checked={onlyArchimedes}
                  onChange={(e) => setOnlyArchimedes(e.target.checked)}
                />
                Jen ARCHIMEDES
              </label>
            </div>
          </div>

          <div style={{ marginTop: 10, fontSize: 12, opacity: 0.7 }}>
            Zobrazeno: {rows.length} (aktivní: {activeCount})
          </div>
        </div>

        {err ? (
          <div style={{ padding: 12, border: "1px solid #f3c2c2", background: "#fff4f4", borderRadius: 12, marginBottom: 12 }}>
            Chyba: {err}
          </div>
        ) : null}

        {loading ? (
          <div style={{ padding: 12, opacity: 0.7 }}>Načítám…</div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {rows.length === 0 ? (
              <div style={{ padding: 12, opacity: 0.7 }}>Zatím tu nic není.</div>
            ) : (
              rows.map((r) => (
                <div key={r.id} style={{ border: "1px solid #e6e6e6", borderRadius: 14, padding: 12 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    <span style={{ fontSize: 12, padding: "4px 8px", borderRadius: 999, border: "1px solid #ddd" }}>
                      {typeLabel(r.type)}
                    </span>
                    {r.category ? (
                      <span style={{ fontSize: 12, padding: "4px 8px", borderRadius: 999, border: "1px solid #ddd" }}>
                        {r.category}
                      </span>
                    ) : null}
                    {r.location ? (
                      <span style={{ fontSize: 12, padding: "4px 8px", borderRadius: 999, border: "1px solid #ddd" }}>
                        {r.location}
                      </span>
                    ) : null}
                    {r.is_archimedes ? (
                      <span style={{ fontSize: 12, padding: "4px 8px", borderRadius: 999, border: "1px solid #ddd" }}>
                        ARCHIMEDES
                      </span>
                    ) : null}
                    {r.is_pinned ? (
                      <span style={{ fontSize: 12, padding: "4px 8px", borderRadius: 999, border: "1px solid #ddd" }}>
                        TOP
                      </span>
                    ) : null}

                    <div style={{ marginLeft: "auto" }}>
                      <Link href={`/portal/inzerce/${r.id}`}>Detail</Link>
                    </div>
                  </div>

                  <div style={{ marginTop: 8, fontSize: 16, fontWeight: 600 }}>{r.title}</div>
                  <div style={{ marginTop: 6, fontSize: 12, opacity: 0.7 }}>
                    Stav: {r.status === "active" ? "Aktivní" : "Uzavřené"} • Vloženo: {new Date(r.created_at).toLocaleString("cs-CZ")}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </RequireAuth>
  );
}
