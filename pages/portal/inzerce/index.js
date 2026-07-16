import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import RequireAuth from "../../../components/RequireAuth";
import PortalHeader from "../../../components/PortalHeader";
import { supabase } from "../../../lib/supabaseClient";

const BUCKET = "marketplace";
const PAGE_SIZE = 24;

function typeBadge(type) {
  if (type === "offer") return "bg-green-100 text-green-800";
  if (type === "demand") return "bg-blue-100 text-blue-800";
  if (type === "partnership") return "bg-purple-100 text-purple-800";
  return "bg-slate-100 text-slate-700";
}

function typeLabel(type) {
  if (type === "offer") return "Nabídka";
  if (type === "demand") return "Poptávka";
  if (type === "partnership") return "Spolupráce";
  return type;
}

export default function Inzerce() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [filterStatus, setFilterStatus] = useState("active");
  const [onlyArchimedes, setOnlyArchimedes] = useState(false);
  const [onlyNotExpired, setOnlyNotExpired] = useState(true);
  const [page, setPage] = useState(0);

  const [isPlatformAdmin, setIsPlatformAdmin] = useState(false);
  const [pinBusyId, setPinBusyId] = useState(null);

  useEffect(() => {
    async function init() {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user || null;
      if (user?.id) {
        const { data: adminRow, error: adminError } = await supabase
          .from("platform_admins")
          .select("user_id")
          .eq("user_id", user.id)
          .maybeSingle();
        setIsPlatformAdmin(!adminError && !!adminRow?.user_id);
      }
      load();
    }
    init();
  }, [filterStatus]);

  async function load() {
    setLoading(true);
    setErr("");

    const { data, error } = await supabase
      .from("marketplace_posts")
      .select(
        `
        *,
        marketplace_attachments (
          file_path,
          is_image
        )
      `
      )
      .eq("status", filterStatus)
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      setErr(error.message);
      setLoading(false);
      return;
    }

    setRows(data || []);
    setLoading(false);
  }

  function getImage(row) {
    const img = row.marketplace_attachments?.find((a) => a.is_image);
    if (!img?.file_path) return null;

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(img.file_path);
    return data?.publicUrl || null;
  }

  async function togglePinned(postId, currentValue) {
    try {
      setPinBusyId(postId);
      const { error } = await supabase
        .from("marketplace_posts")
        .update({ is_pinned: !currentValue })
        .eq("id", postId);

      if (error) throw error;

      // Optimistic update:
      setRows((prev) => {
        const next = prev.map((r) => (r.id === postId ? { ...r, is_pinned: !currentValue } : r));
        // re-sort: pinned first, then by created_at desc
        next.sort((a, b) => {
          if ((b.is_pinned ? 1 : 0) !== (a.is_pinned ? 1 : 0)) return (b.is_pinned ? 1 : 0) - (a.is_pinned ? 1 : 0);
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
        return next;
      });
    } catch (e) {
      alert(e?.message || "Nepodařilo se změnit připnutí.");
    } finally {
      setPinBusyId(null);
    }
  }

  const locations = useMemo(() => {
    const set = new Set();
    for (const r of rows) {
      const loc = (r.location || "").trim();
      if (loc) set.add(loc);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, "cs"));
  }, [rows]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((row) => {
      const matchesSearch =
        !q ||
        (row.title || "").toLowerCase().includes(q) ||
        (row.description || "").toLowerCase().includes(q) ||
        (row.category || "").toLowerCase().includes(q) ||
        (row.location || "").toLowerCase().includes(q);

      const matchesType = !filterType || row.type === filterType;
      const matchesLoc = !filterLocation || (row.location || "").trim() === filterLocation;
      const matchesArchimedes = !onlyArchimedes || row.is_archimedes;
      const expiresAt = row.expires_at ? new Date(row.expires_at).getTime() : null;
      const matchesExpiration = !onlyNotExpired || !expiresAt || expiresAt > Date.now();

      return matchesSearch && matchesType && matchesLoc && matchesArchimedes && matchesExpiration;
    });
  }, [rows, search, filterType, filterLocation, onlyArchimedes, onlyNotExpired]);

  useEffect(() => {
    setPage(0);
  }, [search, filterType, filterLocation, filterStatus, onlyArchimedes, onlyNotExpired]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visibleRows = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <RequireAuth>
      <PortalHeader />

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Inzerce</h1>
            <p className="text-slate-600 mt-1">Globální komunitní marketplace pro přihlášené uživatele.</p>
          </div>

          <Link href="/portal/inzerce/novy" className="px-4 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800">
            + Nový inzerát
          </Link>
        </div>

        {/* Filtry */}
        <div className="mb-6 flex flex-wrap gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <input
            type="text"
            placeholder="Vyhledat…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-xl w-72"
          />

          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-xl">
            <option value="">Všechny typy</option>
            <option value="offer">Nabídka</option>
            <option value="demand">Poptávka</option>
            <option value="partnership">Spolupráce</option>
          </select>

          <select
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-xl"
          >
            <option value="">Všechny lokality</option>
            {locations.map((loc) => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>

          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2">
            <option value="active">Aktivní</option>
            <option value="closed">Uzavřené</option>
          </select>

          <label className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700">
            <input type="checkbox" checked={onlyNotExpired} onChange={(e) => setOnlyNotExpired(e.target.checked)} />
            Jen neexpirované
          </label>

          <label className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700">
            <input type="checkbox" checked={onlyArchimedes} onChange={(e) => setOnlyArchimedes(e.target.checked)} />
            Jen ARCHIMEDES
          </label>

          {(search || filterType || filterLocation || filterStatus !== "active" || onlyArchimedes || !onlyNotExpired) && (
            <button
              onClick={() => {
                setSearch("");
                setFilterType("");
                setFilterLocation("");
                setFilterStatus("active");
                setOnlyArchimedes(false);
                setOnlyNotExpired(true);
              }}
              className="px-3 py-2 border border-slate-200 rounded-xl bg-white hover:border-slate-300"
            >
              Vyčistit
            </button>
          )}
        </div>

        {err && (
          <div className="p-3 mb-4 rounded-xl bg-red-50 border border-red-200 text-red-700">
            {err}
          </div>
        )}

        {loading && <div>Načítám…</div>}

        <div className="space-y-4">
          {visibleRows.map((row) => {
            const imgUrl = getImage(row);

            return (
              <div
                key={row.id}
                className={`bg-white border rounded-2xl shadow-sm hover:shadow-md transition flex overflow-hidden ${
                  row.is_pinned ? "border-yellow-400" : "border-slate-200"
                }`}
              >
                {/* Obrázek */}
                <div className="w-48 h-40 bg-slate-100 flex items-center justify-center overflow-hidden">
                  {imgUrl ? (
                    <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs text-slate-400">bez fotky</span>
                  )}
                </div>

                {/* Obsah */}
                <div className="flex-1 p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${typeBadge(row.type)}`}>
                        {typeLabel(row.type)}
                      </span>

                      {row.is_pinned && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-yellow-600">
                          <Star className="h-3 w-3 fill-current" aria-hidden="true" /> Doporučeno
                        </span>
                      )}

                      {row.category && <span className="text-xs text-slate-500">{row.category}</span>}

                      {row.location && (
                        <span className="text-xs text-slate-500">• {row.location}</span>
                      )}
                    </div>

                    <h3 className="text-lg font-semibold mb-1">{row.title}</h3>

                    <p className="text-sm text-slate-600 line-clamp-2">{row.description}</p>
                  </div>

                  <div className="flex justify-between items-center mt-4 text-xs text-slate-500">
                    <span>{new Date(row.created_at).toLocaleDateString("cs-CZ")}</span>

                    <div className="flex items-center gap-3">
                      {isPlatformAdmin && (
                        <button
                          onClick={() => togglePinned(row.id, row.is_pinned)}
                          disabled={pinBusyId === row.id}
                          className={pinBusyId === row.id ? "opacity-50" : "text-yellow-600 hover:text-yellow-800"}
                          title="Připnout / Odepnout"
                        >
                          <Star className={row.is_pinned ? "h-4 w-4 fill-current" : "h-4 w-4"} aria-hidden="true" />
                        </button>
                      )}

                      <Link href={`/portal/inzerce/${row.id}`} className="text-slate-900 font-medium hover:underline">
                        Detail →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {!loading && filtered.length === 0 && (
          <div className="text-slate-500 mt-6">Žádné výsledky.</div>
        )}

        {!loading && filtered.length > 0 ? (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-5">
            <span className="text-sm text-slate-500">
              {filtered.length} výsledků · stránka {page + 1} z {pageCount}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page === 0}
                onClick={() => setPage((value) => Math.max(0, value - 1))}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-40"
              >
                Předchozí
              </button>
              <button
                type="button"
                disabled={page + 1 >= pageCount}
                onClick={() => setPage((value) => Math.min(pageCount - 1, value + 1))}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-40"
              >
                Další
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </RequireAuth>
  );
}
