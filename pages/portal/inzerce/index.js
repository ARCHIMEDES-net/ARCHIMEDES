// pages/portal/inzerce/index.js
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import RequireAuth from "../../../components/RequireAuth";
import PortalHeader from "../../../components/PortalHeader";
import { supabase } from "../../../lib/supabaseClient";

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

function nowIso() {
  return new Date().toISOString();
}

const PAGE_SIZE = 10;

const S = {
  page: { maxWidth: 1100, margin: "0 auto", padding: "18px 16px 28px" },
  topRow: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" },
  h1: { fontSize: 22, fontWeight: 700, margin: 0 },
  subtleLink: { color: "#0f172a", textDecoration: "underline", fontSize: 14 },
  btn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "9px 12px",
    borderRadius: 10,
    border: "1px solid #d1d5db",
    background: "#fff",
    cursor: "pointer",
    textDecoration: "none",
    color: "#0f172a",
    fontSize: 14,
    fontWeight: 600,
  },
  btnGhost: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "9px 12px",
    borderRadius: 10,
    border: "1px solid #d1d5db",
    background: "#fff",
    cursor: "pointer",
    color: "#0f172a",
    fontSize: 14,
    fontWeight: 600,
  },
  btnDisabled: { opacity: 0.5, cursor: "not-allowed" },
  card: {
    marginTop: 14,
    border: "1px solid #e5e7eb",
    background: "#fff",
    borderRadius: 14,
    padding: 14,
    boxShadow: "0 1px 0 rgba(15,23,42,0.04)",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(12, minmax(0, 1fr))",
    gap: 10,
    alignItems: "end",
  },
  col4: { gridColumn: "span 4 / span 4" },
  col3: { gridColumn: "span 3 / span 3" },
  col2: { gridColumn: "span 2 / span 2" },
  col12: { gridColumn: "span 12 / span 12" },
  label: { display: "block", fontSize: 13, color: "#334155", marginBottom: 6, fontWeight: 600 },
  input: {
    width: "100%",
    padding: "9px 10px",
    borderRadius: 10,
    border: "1px solid #d1d5db",
    fontSize: 14,
    outline: "none",
  },
  select: {
    width: "100%",
    padding: "9px 10px",
    borderRadius: 10,
    border: "1px solid #d1d5db",
    fontSize: 14,
    background: "#fff",
  },
  row: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" },
  checkboxLabel: { display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, color: "#0f172a" },
  meta: { marginTop: 10, fontSize: 13, color: "#475569" },
  error: {
    marginTop: 10,
    border: "1px solid #fecaca",
    background: "#fef2f2",
    color: "#991b1b",
    borderRadius: 12,
    padding: "10px 12px",
    fontSize: 13,
    whiteSpace: "pre-wrap",
  },
  list: { marginTop: 14, display: "grid", gap: 10 },
  item: {
    display: "block",
    textDecoration: "none",
    color: "#0f172a",
    border: "1px solid #e5e7eb",
    background: "#fff",
    borderRadius: 14,
    padding: 14,
  },
  itemHover: { background: "#f8fafc" },
  badges: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" },
  badge: {
    fontSize: 12,
    padding: "4px 9px",
    borderRadius: 999,
    border: "1px solid #d1d5db",
    background: "#fff",
    color: "#0f172a",
    fontWeight: 600,
  },
  itemTitle: { marginTop: 8, fontSize: 18, fontWeight: 800 },
  itemDesc: { marginTop: 6, fontSize: 14, color: "#334155" },
  itemMeta: { marginTop: 8, fontSize: 12, color: "#64748b" },
  pager: { marginTop: 14, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 },
};

export default function InzerceIndex() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [q, setQ] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("active");
  const [onlyNonExpired, setOnlyNonExpired] = useState(true);
  const [onlyArchimedes, setOnlyArchimedes] = useState(false);

  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [rows, setRows] = useState([]);
  const [categories, setCategories] = useState([]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil((totalCount || 0) / PAGE_SIZE)), [totalCount]);

  async function loadCategoriesOnce() {
    try {
      const { data, error } = await supabase
        .from("marketplace_posts")
        .select("category")
        .not("category", "is", null);

      if (error) return;
      const uniq = Array.from(new Set((data || []).map((x) => x.category).filter(Boolean)));
      uniq.sort((a, b) => String(a).localeCompare(String(b), "cs"));
      setCategories(uniq);
    } catch {
      // ignore
    }
  }

  async function fetchRows({ resetPage = false } = {}) {
    setLoading(true);
    setError("");

    try {
      const effectivePage = resetPage ? 1 : page;
      const from = (effectivePage - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      let query = supabase.from("marketplace_posts").select("*", { count: "exact" });

      // fulltext
      if (q && q.trim().length > 0) {
        query = query.textSearch("search_tsv", q.trim(), {
          type: "websearch",
          config: "simple",
        });
      }

      if (typeFilter !== "all") query = query.eq("post_type", typeFilter);
      if (categoryFilter !== "all") query = query.eq("category", categoryFilter);
      if (onlyArchimedes) query = query.eq("is_archimedes", true);

      const now = nowIso();

      if (onlyNonExpired) {
        query = query.or(`expires_at.is.null,expires_at.gt.${now}`);
      }

      if (statusFilter === "active") {
        query = query.eq("is_closed", false);
        query = query.or(`expires_at.is.null,expires_at.gt.${now}`);
      } else if (statusFilter === "closed") {
        query = query.eq("is_closed", true);
      } else if (statusFilter === "expired") {
        query = query.not("expires_at", "is", null).lte("expires_at", now);
      }

      query = query.order("created_at", { ascending: false }).range(from, to);

      const { data, error, count } = await query;
      if (error) throw error;

      setRows(data || []);
      setTotalCount(count || 0);
      if (resetPage) setPage(1);
    } catch (e) {
      setRows([]);
      setTotalCount(0);
      setError(e?.message || "Chyba při načítání inzerce.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRows({ resetPage: true });
    loadCategoriesOnce();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onSubmitSearch(e) {
    e.preventDefault();
    fetchRows({ resetPage: true });
  }

  function onReset() {
    setQ("");
    setTypeFilter("all");
    setCategoryFilter("all");
    setStatusFilter("active");
    setOnlyNonExpired(true);
    setOnlyArchimedes(false);
    setPage(1);
    setTimeout(() => fetchRows({ resetPage: true }), 0);
  }

  function goPrev() {
    const next = Math.max(1, page - 1);
    setPage(next);
    setTimeout(() => fetchRows(), 0);
  }

  function goNext() {
    const next = Math.min(totalPages, page + 1);
    setPage(next);
    setTimeout(() => fetchRows(), 0);
  }

  return (
    <RequireAuth>
      <PortalHeader />

      <div style={S.page}>
        <div style={S.topRow}>
          <h1 style={S.h1}>Inzerce</h1>
          <Link href="/portal/inzerce/novy" style={S.btn}>
            <span style={{ fontSize: 18, lineHeight: 1 }}>+</span>
            Nový inzerát
          </Link>
        </div>

        <div style={S.card}>
          <Link href="/portal" style={S.subtleLink}>
            ← Zpět do portálu
          </Link>

          <form onSubmit={onSubmitSearch} style={{ marginTop: 12 }}>
            <div style={S.grid}>
              <div style={S.col4}>
                <label style={S.label}>Vyhledávání</label>
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="např. židle, zidle, dřevěné..."
                  style={S.input}
                />
              </div>

              <div style={S.col2}>
                <label style={S.label}>Typ</label>
                <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} style={S.select}>
                  <option value="all">Vše</option>
                  <option value="POPTAVKA">Poptávka</option>
                  <option value="NABIDKA">Nabídka</option>
                  <option value="SPOLUPRACE">Spolupráce</option>
                </select>
              </div>

              <div style={S.col3}>
                <label style={S.label}>Kategorie</label>
                <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} style={S.select}>
                  <option value="all">Vše</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div style={S.col3}>
                <label style={S.label}>Stav</label>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={S.select}>
                  <option value="active">Aktivní</option>
                  <option value="closed">Uzavřené</option>
                  <option value="expired">Expirované</option>
                  <option value="all">Vše</option>
                </select>
              </div>

              <div style={S.col12}>
                <div style={S.row}>
                  <button type="submit" style={{ ...S.btnGhost, ...(loading ? S.btnDisabled : {}) }} disabled={loading}>
                    Hledat
                  </button>
                  <button type="button" style={{ ...S.btnGhost, ...(loading ? S.btnDisabled : {}) }} onClick={onReset} disabled={loading}>
                    Reset
                  </button>

                  <label style={S.checkboxLabel}>
                    <input type="checkbox" checked={onlyNonExpired} onChange={(e) => setOnlyNonExpired(e.target.checked)} />
                    Jen neexpir.
                  </label>

                  <label style={S.checkboxLabel}>
                    <input type="checkbox" checked={onlyArchimedes} onChange={(e) => setOnlyArchimedes(e.target.checked)} />
                    Jen ARCHIMEDES
                  </label>

                  <button
                    type="button"
                    style={{ ...S.btnGhost, marginLeft: "auto", ...(loading ? S.btnDisabled : {}) }}
                    onClick={() => fetchRows({ resetPage: true })}
                    disabled={loading}
                    title="Obnovit seznam"
                  >
                    Obnovit
                  </button>
                </div>

                <div style={S.meta}>
                  Zobrazeno: <b>{rows.length}</b> / <b>{totalCount}</b> • stránka: <b>{page}</b> / <b>{totalPages}</b>
                </div>

                {error ? <div style={S.error}>Chyba: {error}</div> : null}
              </div>
            </div>
          </form>
        </div>

        <div style={S.list}>
          {loading ? (
            <div style={{ fontSize: 14, color: "#475569" }}>Načítám…</div>
          ) : rows.length === 0 ? (
            <div style={{ fontSize: 14, color: "#475569" }}>Zatím tu nic není.</div>
          ) : (
            rows.map((r) => {
              const created = safeDate(r.created_at);
              const expires = safeDate(r.expires_at);
              const expired = expires ? expires.getTime() <= Date.now() : false;

              const badgeType = r.post_type === "POPTAVKA" ? "POPTÁVKA" : r.post_type === "NABIDKA" ? "NABÍDKA" : r.post_type || "—";
              const stateLabel = r.is_closed ? "Uzavřené" : expired ? "Expirované" : "Aktivní";

              return (
                <Link
                  key={r.id}
                  href={`/portal/inzerce/${r.id}`}
                  style={S.item}
                  onMouseEnter={(e) => (e.currentTarget.style.background = S.itemHover.background)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
                >
                  <div style={S.badges}>
                    <span style={S.badge}>{badgeType}</span>
                    {r.category ? <span style={S.badge}>{r.category}</span> : null}
                    {r.is_archimedes ? <span style={S.badge}>ARCHIMEDES</span> : null}
                    {r.location ? <span style={S.badge}>{r.location}</span> : null}
                    <span style={{ marginLeft: "auto", fontSize: 12, color: "#64748b" }}>Stav: {stateLabel}</span>
                  </div>

                  <div style={S.itemTitle}>{r.title || "Bez názvu"}</div>

                  {r.description ? <div style={S.itemDesc}>{String(r.description).slice(0, 220)}{String(r.description).length > 220 ? "…" : ""}</div> : null}

                  <div style={S.itemMeta}>
                    {created ? <>Vloženo: {formatDateTimeCS(created)}</> : null}
                    {expires ? <> • Expirace: {formatDateTimeCS(expires)}</> : null}
                  </div>
                </Link>
              );
            })
          )}
        </div>

        <div style={S.pager}>
          <button
            style={{ ...S.btnGhost, ...(loading || page <= 1 ? S.btnDisabled : {}) }}
            onClick={goPrev}
            disabled={loading || page <= 1}
          >
            ← Předchozí
          </button>

          <button
            style={{ ...S.btnGhost, ...(loading || page >= totalPages ? S.btnDisabled : {}) }}
            onClick={goNext}
            disabled={loading || page >= totalPages}
          >
            Další →
          </button>
        </div>
      </div>
    </RequireAuth>
  );
}
