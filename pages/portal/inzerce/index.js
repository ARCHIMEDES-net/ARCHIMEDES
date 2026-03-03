import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import RequireAuth from "../../../components/RequireAuth";
import PortalHeader from "../../../components/PortalHeader";
import { supabase } from "../../../lib/supabaseClient";

const BUCKET = "marketplace";

function formatDateTimeCS(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString("cs-CZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function publicUrlFromPath(path) {
  if (!path) return null;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data?.publicUrl || null;
}

function Thumb({ url }) {
  const [fail, setFail] = useState(false);

  if (!url || fail) {
    return (
      <div
        style={{
          width: 84,
          height: 64,
          borderRadius: 14,
          border: "1px dashed #d1d5db",
          background: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#6b7280",
          fontWeight: 900,
          fontSize: 11,
        }}
      >
        bez fotky
      </div>
    );
  }

  return (
    <img
      src={url}
      alt=""
      onError={() => setFail(true)}
      style={{
        width: 84,
        height: 64,
        borderRadius: 14,
        objectFit: "cover",
        border: "1px solid #e5e7eb",
        background: "#f9fafb",
      }}
    />
  );
}

export default function InzerceIndex() {
  const [rows, setRows] = useState([]);
  const [thumbByPostId, setThumbByPostId] = useState({});
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  const [q, setQ] = useState("");
  const [type, setType] = useState("Vše");
  const [category, setCategory] = useState("Vše");
  const [status, setStatus] = useState("Aktivní"); // UI label
  const [onlyNonExpired, setOnlyNonExpired] = useState(true);
  const [onlyArchimedes, setOnlyArchimedes] = useState(false);

  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

  const pageCount = useMemo(() => {
    const total = rows.length;
    return Math.max(1, Math.ceil(total / PAGE_SIZE));
  }, [rows.length]);

  const pagedRows = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return rows.slice(start, start + PAGE_SIZE);
  }, [rows, page]);

  async function load() {
    setLoading(true);
    setErr("");

    let query = supabase
      .from("marketplace_posts")
      .select("id,type,category,title,description,location,is_archimedes,is_pinned,status,created_at,expires_at")
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false });

    // vyhledávání (jednoduché ilike na title/description)
    const qq = q.trim();
    if (qq) {
      const escaped = qq.replace(/[%_]/g, "\\$&");
      query = query.or(`title.ilike.%${escaped}%,description.ilike.%${escaped}%`);
    }

    // typ/kategorie
    if (type !== "Vše") query = query.eq("type", type);
    if (category !== "Vše") query = query.eq("category", category);

    // status – OPRAVA: UI “Aktivní” = DB “active”
    if (status === "Aktivní") query = query.eq("status", "active");
    else if (status === "Uzavřené") query = query.eq("status", "closed");
    else if (status !== "Vše") query = query.eq("status", status);

    // jen ARCHIMEDES
    if (onlyArchimedes) query = query.eq("is_archimedes", true);

    // jen neexpir.
    if (onlyNonExpired) {
      const nowIso = new Date().toISOString();
      query = query.or(`expires_at.is.null,expires_at.gt.${nowIso}`);
    }

    const { data, error } = await query;

    if (error) {
      setErr(error.message || "Chyba při načítání.");
      setRows([]);
      setLoading(false);
      return;
    }

    const list = data || [];
    setRows(list);
    setPage(1);

    // načti thumbnails z marketplace_attachments (1. fotka na post)
    try {
      const ids = list.map((r) => r.id);
      if (ids.length === 0) {
        setThumbByPostId({});
      } else {
        const { data: att, error: attErr } = await supabase
          .from("marketplace_attachments")
          .select("post_id,file_path,is_image,created_at")
          .in("post_id", ids)
          .eq("is_image", true)
          .order("created_at", { ascending: true });

        if (!attErr) {
          const map = {};
          for (const a of att || []) {
            if (!map[a.post_id] && a.file_path) {
              map[a.post_id] = publicUrlFromPath(a.file_path);
            }
          }
          setThumbByPostId(map);
        }
      }
    } catch (_) {
      // thumbnail není kritické
    }

    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function resetFilters() {
    setQ("");
    setType("Vše");
    setCategory("Vše");
    setStatus("Aktivní");
    setOnlyNonExpired(true);
    setOnlyArchimedes(false);
    setPage(1);
  }

  const card = {
    border: "1px solid #e5e7eb",
    borderRadius: 16,
    padding: 16,
    background: "#fff",
  };

  const input = { padding: "10px 12px", borderRadius: 12, border: "1px solid #e5e7eb", width: "100%" };
  const label = { fontWeight: 900, marginBottom: 6 };
  const small = { fontSize: 12, color: "#6b7280" };

  return (
    <RequireAuth>
      <PortalHeader />

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "18px 16px" }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <div>
            <h1 style={{ margin: "10px 0 6px" }}>Inzerce</h1>
            <div style={{ color: "#374151" }}>Nabídky a poptávky v rámci komunity ARCHIMEDES.</div>
          </div>

          <div style={{ marginLeft: "auto", display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <Link href="/portal/inzerce/novy" style={{ fontWeight: 900 }}>+ Nový inzerát</Link>
            <button
              onClick={load}
              style={{
                padding: "10px 12px",
                borderRadius: 999,
                border: "1px solid #e5e7eb",
                background: "#fff",
                fontWeight: 900,
                cursor: "pointer",
              }}
            >
              Obnovit
            </button>
          </div>
        </div>

        {err ? (
          <div style={{ marginTop: 12, padding: 12, borderRadius: 12, border: "1px solid #fecaca", background: "#fef2f2" }}>
            <b>Chyba:</b> {err}
          </div>
        ) : null}

        <section style={{ ...card, marginTop: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.7fr 1fr 0.7fr", gap: 12 }}>
            <div>
              <div style={label}>Vyhledávání</div>
              <input
                style={input}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="např. židle, stůl…"
              />
            </div>

            <div>
              <div style={label}>Typ</div>
              <select style={input} value={type} onChange={(e) => setType(e.target.value)}>
                <option>Vše</option>
                <option>NABÍDKA</option>
                <option>POPTÁVKA</option>
              </select>
            </div>

            <div>
              <div style={label}>Kategorie</div>
              <select style={input} value={category} onChange={(e) => setCategory(e.target.value)}>
                <option>Vše</option>
                <option>Vybavení školy</option>
                <option>Učebnice a pomůcky</option>
                <option>Služby</option>
                <option>Spolupráce</option>
                <option>Ostatní</option>
              </select>
            </div>

            <div>
              <div style={label}>Stav</div>
              <select style={input} value={status} onChange={(e) => setStatus(e.target.value)}>
                <option>Aktivní</option>
                <option>Uzavřené</option>
                <option>Vše</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <button
              onClick={load}
              style={{
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid #111827",
                background: "#111827",
                color: "#fff",
                fontWeight: 900,
                cursor: "pointer",
              }}
            >
              Hledat
            </button>

            <button
              onClick={resetFilters}
              style={{
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid #e5e7eb",
                background: "#fff",
                fontWeight: 900,
                cursor: "pointer",
              }}
            >
              Reset
            </button>

            <label style={{ display: "flex", gap: 8, alignItems: "center", fontWeight: 900 }}>
              <input type="checkbox" checked={onlyNonExpired} onChange={(e) => setOnlyNonExpired(e.target.checked)} />
              Jen neexpir.
            </label>

            <label style={{ display: "flex", gap: 8, alignItems: "center", fontWeight: 900 }}>
              <input type="checkbox" checked={onlyArchimedes} onChange={(e) => setOnlyArchimedes(e.target.checked)} />
              Jen ARCHIMEDES
            </label>

            <div style={{ marginLeft: "auto", fontWeight: 900, color: "#6b7280" }}>
              Zobrazeno: {rows.length} • stránka: {page}/{pageCount}
            </div>
          </div>
        </section>

        {loading ? (
          <div style={{ marginTop: 14, padding: 12, opacity: 0.7 }}>Načítám…</div>
        ) : pagedRows.length === 0 ? (
          <div style={{ marginTop: 14, padding: 12, color: "#6b7280" }}>Zatím tu nic není.</div>
        ) : (
          <div style={{ marginTop: 14, display: "grid", gap: 12 }}>
            {pagedRows.map((r) => (
              <Link key={r.id} href={`/portal/inzerce/${r.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                <div style={{ border: "1px solid #e5e7eb", borderRadius: 16, padding: 14, background: "#fff" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "84px 1fr", gap: 12, alignItems: "center" }}>
                    <Thumb url={thumbByPostId[r.id]} />

                    <div>
                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                        <div style={{ fontWeight: 900, fontSize: 16 }}>{r.title}</div>

                        {r.is_pinned ? (
                          <span style={{ fontSize: 12, padding: "4px 8px", borderRadius: 999, background: "#111827", color: "#fff", fontWeight: 900 }}>
                            TOP
                          </span>
                        ) : null}

                        {r.is_archimedes ? (
                          <span style={{ fontSize: 12, padding: "4px 8px", borderRadius: 999, background: "#f3f4f6", border: "1px solid #e5e7eb", fontWeight: 900 }}>
                            ARCHIMEDES
                          </span>
                        ) : null}

                        <div style={{ marginLeft: "auto", ...small }}>
                          Stav: {r.status === "active" ? "Aktivní" : r.status === "closed" ? "Uzavřené" : (r.status || "—")}
                        </div>
                      </div>

                      <div style={{ marginTop: 6, ...small }}>
                        {r.category || "—"} • {r.type || "—"} {r.location ? `• ${r.location}` : ""}
                      </div>

                      <div style={{ marginTop: 6, ...small }}>
                        Vloženo: {formatDateTimeCS(r.created_at)} • Expirace: {r.expires_at ? formatDateTimeCS(r.expires_at) : "—"}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div style={{ marginTop: 14, display: "flex", justifyContent: "space-between", gap: 12 }}>
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            style={{
              padding: "10px 12px",
              borderRadius: 12,
              border: "1px solid #e5e7eb",
              background: "#fff",
              fontWeight: 900,
              cursor: page <= 1 ? "not-allowed" : "pointer",
              opacity: page <= 1 ? 0.5 : 1,
            }}
          >
            ← Předchozí
          </button>

          <button
            disabled={page >= pageCount}
            onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
            style={{
              padding: "10px 12px",
              borderRadius: 12,
              border: "1px solid #e5e7eb",
              background: "#fff",
              fontWeight: 900,
              cursor: page >= pageCount ? "not-allowed" : "pointer",
              opacity: page >= pageCount ? 0.5 : 1,
            }}
          >
            Další →
          </button>
        </div>
      </main>
    </RequireAuth>
  );
}
