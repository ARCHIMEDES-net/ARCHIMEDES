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

export default function InzerceIndex() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // filters
  const [q, setQ] = useState("");
  const [typeFilter, setTypeFilter] = useState("all"); // "all" | "NABIDKA" | "POPTAVKA" | "SPOLUPRACE"
  const [categoryFilter, setCategoryFilter] = useState("all"); // "all" | "Vybavení školy" ...
  const [statusFilter, setStatusFilter] = useState("active"); // "active" | "closed" | "expired" | "all"
  const [onlyNonExpired, setOnlyNonExpired] = useState(true);
  const [onlyArchimedes, setOnlyArchimedes] = useState(false);

  // pagination
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // data
  const [rows, setRows] = useState([]);
  const [categories, setCategories] = useState([]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil((totalCount || 0) / PAGE_SIZE)), [totalCount]);
  const fromIdx = useMemo(() => (page - 1) * PAGE_SIZE, [page]);

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

      let query = supabase
        .from("marketplace_posts")
        .select("*", { count: "exact" });

      // fulltext search
      if (q && q.trim().length > 0) {
        query = query.textSearch("search_tsv", q.trim(), {
          type: "websearch",
          config: "simple",
        });
      }

      // type
      if (typeFilter !== "all") query = query.eq("post_type", typeFilter);

      // category
      if (categoryFilter !== "all") query = query.eq("category", categoryFilter);

      // only archimedes
      if (onlyArchimedes) query = query.eq("is_archimedes", true);

      // expiry / status
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
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between gap-4">
          <div className="text-2xl font-semibold">Inzerce</div>
          <Link
            href="/portal/inzerce/novy"
            className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 hover:bg-gray-50"
          >
            <span className="text-lg leading-none">+</span>
            <span>Nový inzerát</span>
          </Link>
        </div>

        <div className="mt-4 rounded-xl border bg-white p-4">
          <Link href="/portal" className="text-sm underline">
            ← Zpět do portálu
          </Link>

          <form onSubmit={onSubmitSearch} className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
              <div className="md:col-span-4">
                <label className="block text-sm text-gray-700 mb-1">Vyhledávání</label>
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="např. židle, zidle, dřevěné..."
                  className="w-full rounded-lg border px-3 py-2"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm text-gray-700 mb-1">Typ</label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2"
                >
                  <option value="all">Vše</option>
                  <option value="POPTAVKA">Poptávka</option>
                  <option value="NABIDKA">Nabídka</option>
                  <option value="SPOLUPRACE">Spolupráce</option>
                </select>
              </div>

              <div className="md:col-span-3">
                <label className="block text-sm text-gray-700 mb-1">Kategorie</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2"
                >
                  <option value="all">Vše</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-3">
                <label className="block text-sm text-gray-700 mb-1">Stav</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2"
                >
                  <option value="active">Aktivní</option>
                  <option value="closed">Uzavřené</option>
                  <option value="expired">Expirované</option>
                  <option value="all">Vše</option>
                </select>
              </div>

              <div className="md:col-span-12 flex flex-wrap items-center gap-3 mt-1">
                <button type="submit" className="rounded-lg border px-4 py-2 hover:bg-gray-50" disabled={loading}>
                  Hledat
                </button>

                <button type="button" className="rounded-lg border px-4 py-2 hover:bg-gray-50" onClick={onReset} disabled={loading}>
                  Reset
                </button>

                <label className="inline-flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={onlyNonExpired} onChange={(e) => setOnlyNonExpired(e.target.checked)} />
                  Jen neexpir.
                </label>

                <label className="inline-flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={onlyArchimedes} onChange={(e) => setOnlyArchimedes(e.target.checked)} />
                  Jen ARCHIMEDES
                </label>

                <button
                  type="button"
                  className="ml-auto rounded-lg border px-4 py-2 hover:bg-gray-50"
                  onClick={() => fetchRows({ resetPage: true })}
                  disabled={loading}
                  title="Obnovit seznam"
                >
                  Obnovit
                </button>
              </div>
            </div>

            <div className="mt-3 text-sm text-gray-600">
              Zobrazeno: <strong>{rows.length}</strong> / <strong>{totalCount}</strong> • stránka:{" "}
              <strong>
                {page} / {totalPages}
              </strong>
            </div>

            {error ? (
              <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                Chyba: {error}
              </div>
            ) : null}
          </form>
        </div>

        <div className="mt-4">
          {loading ? (
            <div className="text-sm text-gray-600">Načítám…</div>
          ) : rows.length === 0 ? (
            <div className="text-sm text-gray-600">Zatím tu nic není.</div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {rows.map((r) => {
                const created = safeDate(r.created_at);
                const expires = safeDate(r.expires_at);
                const expired = expires ? expires.getTime() <= Date.now() : false;

                const badgeType =
                  r.post_type === "POPTAVKA" ? "POPTÁVKA" : r.post_type === "NABIDKA" ? "NABÍDKA" : r.post_type || "—";

                const stateLabel = r.is_closed ? "Uzavřené" : expired ? "Expirované" : "Aktivní";

                return (
                  <Link
                    key={r.id}
                    href={`/portal/inzerce/${r.id}`}
                    className="block rounded-xl border bg-white p-4 hover:bg-gray-50"
                  >
                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-700">
                      <span className="rounded-full border px-2 py-1">{badgeType}</span>
                      {r.category ? <span className="rounded-full border px-2 py-1">{r.category}</span> : null}
                      {r.is_archimedes ? <span className="rounded-full border px-2 py-1">ARCHIMEDES</span> : null}
                      {r.location ? <span className="rounded-full border px-2 py-1">{r.location}</span> : null}
                      <span className="ml-auto text-gray-600">Stav: {stateLabel}</span>
                    </div>

                    <div className="mt-2 text-lg font-semibold">{r.title || "Bez názvu"}</div>

                    {r.description ? <div className="mt-1 text-sm text-gray-700 line-clamp-2">{r.description}</div> : null}

                    <div className="mt-2 text-xs text-gray-600">
                      {created ? <>Vloženo: {formatDateTimeCS(created)}</> : null}
                      {expires ? <> • Expirace: {formatDateTimeCS(expires)}</> : null}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-5 flex items-center justify-between">
          <button className="rounded-lg border px-4 py-2 disabled:opacity-50" onClick={goPrev} disabled={loading || page <= 1}>
            ← Předchozí
          </button>
          <button className="rounded-lg border px-4 py-2 disabled:opacity-50" onClick={goNext} disabled={loading || page >= totalPages}>
            Další →
          </button>
        </div>
      </div>
    </RequireAuth>
  );
}
