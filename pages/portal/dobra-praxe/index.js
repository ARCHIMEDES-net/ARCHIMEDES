import { useEffect, useState } from "react";
import Link from "next/link";
import RequireAuth from "../../../components/RequireAuth";
import PortalHeader from "../../../components/PortalHeader";
import { supabase } from "../../../lib/supabaseClient";

const BUCKET = "dobra-praxe";
const PAGE_SIZE = 10;
const PREVIEW_LEN = 320;

const CATEGORY_LABELS = {
  obec: "Obec",
  spolek: "Spolek",
  skola: "Škola",
  seniori: "Senioři",
};

function formatDateCS(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("cs-CZ", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function getPhotoUrl(path) {
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data?.publicUrl || "";
}

export default function DobraPraxeFeed() {
  const [posts, setPosts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedIds, setExpandedIds] = useState({});
  const [lightboxImage, setLightboxImage] = useState("");

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  useEffect(() => {
    let alive = true;

    async function loadPosts() {
      setLoading(true);
      setError("");
      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data, error, count } = await supabase
        .from("best_practice_posts")
        .select("id, title, body, photo_paths, category, created_at, organizations(name)", {
          count: "exact",
        })
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .range(from, to);

      if (!alive) return;
      if (error) {
        setError(error.message || "Nepodařilo se načíst příspěvky.");
      } else {
        setPosts(data || []);
        setTotal(count || 0);
      }
      setLoading(false);
    }

    loadPosts();
    return () => {
      alive = false;
    };
  }, [page]);

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape") setLightboxImage("");
    }
    if (lightboxImage) {
      window.addEventListener("keydown", onKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [lightboxImage]);

  return (
    <RequireAuth>
      <PortalHeader />

      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-semibold">Dobrá praxe</h1>
            <p className="text-slate-600 mt-1">
              Příklady, jak obce, spolky a školy dělají věci dobře.
            </p>
          </div>
          <Link
            href="/portal/dobra-praxe/nova"
            className="px-4 py-2 rounded-xl bg-blue-700 text-white font-semibold"
          >
            Přidat příspěvek
          </Link>
        </div>

        {error ? (
          <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700">{error}</div>
        ) : null}

        {loading ? (
          <p className="text-slate-500 mt-6">Načítám…</p>
        ) : posts.length ? (
          <ul className="mt-6 space-y-4">
            {posts.map((p) => {
              const isExpanded = !!expandedIds[p.id];
              const showFull = isExpanded || p.body.length <= PREVIEW_LEN;
              const text = showFull ? p.body : `${p.body.slice(0, PREVIEW_LEN)}…`;

              return (
                <li key={p.id} className="p-4 rounded-2xl border border-slate-200 bg-white">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 font-semibold">
                      {CATEGORY_LABELS[p.category] || p.category}
                    </span>
                    <span>{p.organizations?.name}</span>
                    <span>·</span>
                    <span>{formatDateCS(p.created_at)}</span>
                  </div>

                  <h3 className="mt-2 text-lg font-semibold">{p.title}</h3>
                  <p className="mt-1 text-slate-700 whitespace-pre-wrap">{text}</p>

                  {!showFull ? (
                    <button
                      type="button"
                      className="mt-1 text-blue-700 text-sm underline"
                      onClick={() => setExpandedIds((prev) => ({ ...prev, [p.id]: true }))}
                    >
                      Zobrazit celé
                    </button>
                  ) : null}

                  {p.photo_paths?.length ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {p.photo_paths.map((path) => (
                        <button
                          key={path}
                          type="button"
                          onClick={() => setLightboxImage(getPhotoUrl(path))}
                          className="block"
                        >
                          <img
                            src={getPhotoUrl(path)}
                            alt=""
                            className="w-24 h-24 object-cover rounded-lg border border-slate-200"
                          />
                        </button>
                      ))}
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-slate-500 mt-6">Zatím tu není žádný schválený příspěvek.</p>
        )}

        {totalPages > 1 ? (
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-4 py-2 rounded-xl border border-slate-200 disabled:opacity-40"
            >
              Předchozí
            </button>
            <span className="text-sm text-slate-600">
              Strana {page} z {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="px-4 py-2 rounded-xl border border-slate-200 disabled:opacity-40"
            >
              Další
            </button>
          </div>
        ) : null}
      </div>

      {lightboxImage ? (
        <div
          onClick={() => setLightboxImage("")}
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 cursor-zoom-out"
        >
          <img src={lightboxImage} alt="" className="max-w-[90vw] max-h-[90vh] object-contain" />
        </div>
      ) : null}
    </RequireAuth>
  );
}
