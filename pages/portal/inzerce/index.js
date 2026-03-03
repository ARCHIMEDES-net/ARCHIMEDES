import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import RequireAuth from "../../../components/RequireAuth";
import PortalHeader from "../../../components/PortalHeader";
import { supabase } from "../../../lib/supabaseClient";

const BUCKET = "marketplace";

function safeDate(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function formatDateTimeCS(value) {
  const d = safeDate(value);
  if (!d) return "—";
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

function buildFallbackPath(att) {
  // Pokud by v DB někdy nebyl file_path, zkusíme složit:
  // <author_id>/posts/<post_id>/<file_name>
  if (!att?.author_id || !att?.post_id || !att?.file_name) return null;
  return `${att.author_id}/posts/${att.post_id}/${att.file_name}`;
}

function Thumb({ url }) {
  const [failed, setFailed] = useState(false);

  if (!url || failed) {
    return (
      <div
        style={{
          width: 120,
          height: 90,
          borderRadius: 14,
          border: "1px dashed #d1d5db",
          background: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#6b7280",
          fontWeight: 900,
          fontSize: 12,
        }}
      >
        Bez fotky
      </div>
    );
  }

  return (
    <img
      src={url}
      alt=""
      onError={() => setFailed(true)}
      style={{
        width: 120,
        height: 90,
        borderRadius: 14,
        objectFit: "cover",
        border: "1px solid #e5e7eb",
        background: "#f9fafb",
      }}
    />
  );
}

function Chip({ children }) {
  return (
    <span
      style={{
        fontSize: 12,
        padding: "4px 10px",
        borderRadius: 999,
        background: "#f3f4f6",
        border: "1px solid #e5e7eb",
        fontWeight: 800,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

export default function InzerceIndex() {
  const [rows, setRows] = useState([]);
  const [thumbByPostId, setThumbByPostId] = useState({}); // post_id -> url
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  // Filtry (pokud už je máš jinde, klidně uprav)
  const [q, setQ] = useState("");
  const [type, setType] = useState("Vše");
  const [category, setCategory] = useState("Vše");
  const [status, setStatus] = useState("Aktivní");
  const [onlyUnexpired, setOnlyUnexpired] = useState(true);
  const [onlyArchimedes, setOnlyArchimedes] = useState(false);

  // Paging
  const PAGE_SIZE = 20;
  const [page, setPage] = useState(1);

  const filters = useMemo(
    () => ({ q, type, category, status, onlyUnexpired, onlyArchimedes, page }),
    [q, type, category, status, onlyUnexpired, onlyArchimedes, page]
  );

  async function load() {
    setLoading(true);
    setErr("");

    try {
      let query = supabase
        .from("marketplace_posts")
        .select(
          "id,type,category,title,location,is_archimedes,is_pinned,status,created_at,expires_at,author_id"
        )
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false });

      // Status
      if (status && status !== "Vše") query = query.eq("status", status);

      // Type
      if (type && type !== "Vše") query = query.eq("type", type);

      // Category
      if (category && category !== "Vše") query = query.eq("category", category);

      // Jen ARCHIMEDES
      if (onlyArchimedes) query = query.eq("is_archimedes", true);

      // Hledání (jednoduše přes title ilike)
      if (q?.trim()) query = query.ilike("title", `%${q.trim()}%`);

      // Jen neexpir.
      if (onlyUnexpired) {
        const nowIso = new Date().toISOString();
        // Pokud expires_at je null => bereme jako neexpirující
        // (Supabase neumí přímo OR s is null + gt bez RPC, takže to vyřešíme až v JS filtrem)
        // => tady jen přitáhneme data, níže odfiltrujeme.
      }

      // paging
      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      query = query.range(from, to);

      const { data, error } = await query;
      if (error) throw error;

      let list = data || [];

      // dofiltrujeme neexpirující/expirující v JS (kvůli NULL)
      if (onlyUnexpired) {
        const now = new Date();
        list = list.filter((r) => {
          if (!r.expires_at) return true;
          const ex = new Date(r.expires_at);
          if (Number.isNaN(ex.getTime())) return true;
          return ex >= now;
        });
      }

      setRows(list);

      // --- Načti fotky pro aktuální stránku (nejnovější obrázek per post)
      const ids = list.map((r) => r.id).filter(Boolean);
      if (ids.length === 0) {
        setThumbByPostId({});
        setLoading(false);
        return;
      }

      const { data: att, error: attErr } = await supabase
        .from("marketplace_attachments")
        .select("id,post_id,author_id,file_path,file_name,is_image,created_at")
        .in("post_id", ids)
        .eq("is_image", true)
        .order("created_at", { ascending: false });

      if (attErr) throw attErr;

      // vytvoříme mapu: první (nejnovější) image pro každý post_id
      const map = {};
      (att || []).forEach((a) => {
        if (!a?.post_id) return;
        if (map[a.post_id]) return; // už máme nejnovější
        const path = a.file_path || buildFallbackPath(a);
        const url = publicUrlFromPath(path);
        if (url) map[a.post_id] = url;
      });

      setThumbByPostId(map);
      setLoading(false);
    } catch (e) {
      setErr(e?.message || String(e));
      setRows([]);
      setThumbByPostId({});
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.q, filters.type, filters.category, filters.status, filters.onlyUnexpired, filters.onlyArchimedes, filters.page]);

  function resetFilters() {
    setQ("");
    setType("Vše");
    setCategory("Vše");
    setStatus("Aktivní");
    setOnlyUnexpired(true);
    setOnlyArchimedes(false);
    setPage(1);
  }

  const card = {
    border: "1px solid #e5e7eb",
    borderRadius: 16,
    padding: 14,
    background: "#fff",
  };

  const input = {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid #e5e7eb",
  };

  return (
    <RequireAuth>
      <PortalHeader />

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "18px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <div>
            <h1 style={{ margin: "10px 0 6px" }}>Inzerce</h1>
            <div style={{ color: "#374151" }}>Nabídky a poptávky v rámci komunity ARCHIMEDES.</div>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link href="/portal/inzerce/novy">+ Nový inzerát</Link>
            <button
              onClick={load}
              style={{
                padding: "10px 12px",
                borderRadius: 12,
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

        {/* FILTRY */}
        <section style={{ ...card, marginTop: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.7fr 1fr 0.8fr", gap: 12, alignItems: "end" }}>
            <div>
              <div style={{ fontWeight: 900, marginBottom: 6 }}>Vyhledávání</div>
              <input style={{ ...input, width: "100%" }} value={q} onChange={(e) => setQ(e.target.value)} placeholder="např. židle, stůl…" />
            </div>

            <div>
              <div style={{ fontWeight: 900, marginBottom: 6 }}>Typ</div>
              <select style={{ ...input, width: "100%" }} value={type} onChange={(e) => { setType(e.target.value); setPage(1); }}>
                <option>Vše</option>
                <option>NABÍDKA</option>
                <option>POPTÁVKA</option>
              </select>
            </div>

            <div>
              <div style={{ fontWeight: 900, marginBottom: 6 }}>Kategorie</div>
              <select style={{ ...input, width: "100%" }} value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}>
                <option>Vše</option>
                {/* nechávám volné – kategorie bereš z DB, nebo doplň staticky */}
              </select>
            </div>

            <div>
              <div style={{ fontWeight: 900, marginBottom: 6 }}>Stav</div>
              <select style={{ ...input, width: "100%" }} value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
                <option>Aktivní</option>
                <option>Vše</option>
                <option>Uzavřeno</option>
              </select>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginTop: 12 }}>
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

            <label style={{ display: "flex", gap: 8, alignItems: "center", fontWeight: 800 }}>
              <input type="checkbox" checked={onlyUnexpired} onChange={(e) => { setOnlyUnexpired(e.target.checked); setPage(1); }} />
              Jen neexpir.
            </label>

            <label style={{ display: "flex", gap: 8, alignItems: "center", fontWeight: 800 }}>
              <input type="checkbox" checked={onlyArchimedes} onChange={(e) => { setOnlyArchimedes(e.target.checked); setPage(1); }} />
              Jen ARCHIMEDES
            </label>

            <div style={{ marginLeft: "auto", color: "#6b7280", fontWeight: 800 }}>
              Zobrazeno: {rows.length} • stránka: {page}
            </div>
          </div>
        </section>

        {/* LIST */}
        <section style={{ marginTop: 14 }}>
          {loading ? (
            <div style={{ padding: 12, opacity: 0.7 }}>Načítám…</div>
          ) : rows.length === 0 ? (
            <div style={{ padding: 12, opacity: 0.8 }}>Zatím tu nic není.</div>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {rows.map((r) => (
                <div
                  key={r.id}
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: 16,
                    padding: 14,
                    background: "#fff",
                    display: "grid",
                    gridTemplateColumns: "120px 1fr",
                    gap: 14,
                    alignItems: "start",
                  }}
                >
                  <Thumb url={thumbByPostId[r.id]} />

                  <div>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                      <Chip>{r.type || "—"}</Chip>
                      {r.category ? <Chip>{r.category}</Chip> : null}
                      {r.location ? <Chip>{String(r.location).toLowerCase()}</Chip> : null}
                      {r.is_archimedes ? <Chip>ARCHIMEDES</Chip> : null}
                      {r.is_pinned ? <Chip>TOP</Chip> : null}

                      <div style={{ marginLeft: "auto", color: "#6b7280", fontWeight: 800 }}>
                        Stav: {r.status || "—"}
                      </div>
                    </div>

                    <div style={{ marginTop: 10 }}>
                      <Link href={`/portal/inzerce/${r.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                        <div style={{ fontWeight: 1000, fontSize: 18 }}>{r.title}</div>
                      </Link>
                    </div>

                    <div style={{ marginTop: 8, color: "#6b7280", fontWeight: 700, fontSize: 13 }}>
                      Vloženo: {formatDateTimeCS(r.created_at)}
                      {r.expires_at ? ` • Expirace: ${formatDateTimeCS(r.expires_at)}` : ""}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* PAGING */}
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginTop: 14 }}>
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            style={{
              padding: "10px 12px",
              borderRadius: 12,
              border: "1px solid #e5e7eb",
              background: page <= 1 ? "#f9fafb" : "#fff",
              fontWeight: 900,
              cursor: page <= 1 ? "not-allowed" : "pointer",
              opacity: page <= 1 ? 0.6 : 1,
            }}
          >
            ← Předchozí
          </button>

          <button
            onClick={() => setPage((p) => p + 1)}
            style={{
              padding: "10px 12px",
              borderRadius: 12,
              border: "1px solid #e5e7eb",
              background: "#fff",
              fontWeight: 900,
              cursor: "pointer",
            }}
          >
            Další →
          </button>
        </div>
      </main>
    </RequireAuth>
  );
}
