import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import RequireAuth from "../../components/RequireAuth";
import PortalHeader from "../../components/PortalHeader";
import { supabase } from "../../lib/supabaseClient";

const BUCKET = "event-posters"; // ← pokud máš jinak, změň jen toto

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

function normalizeAudience(aud) {
  if (!aud) return [];
  if (Array.isArray(aud)) return aud.filter(Boolean).map(String);
  const s = String(aud).trim();
  if (!s) return [];
  return s.split(",").map((x) => x.trim()).filter(Boolean);
}

function badgeColor(label) {
  const s = String(label || "").toLowerCase();
  if (s.includes("1")) return "bg-emerald-100 text-emerald-800";
  if (s.includes("2")) return "bg-blue-100 text-blue-800";
  if (s.includes("senior")) return "bg-amber-100 text-amber-800";
  if (s.includes("komunit")) return "bg-purple-100 text-purple-800";
  if (s.includes("rodi")) return "bg-pink-100 text-pink-800";
  if (s.includes("učitel")) return "bg-slate-200 text-slate-800";
  return "bg-slate-100 text-slate-700";
}

function normalizePosterPath(p) {
  if (!p) return "";
  let s = String(p);

  // když DB omylem ukládá i "event-posters/..."
  if (s.startsWith(`${BUCKET}/`)) s = s.slice(BUCKET.length + 1);

  // kdyby někdy bylo uložené celé URL
  if (s.startsWith("http://") || s.startsWith("https://")) return s;

  // odstranit případné počáteční lomítko
  if (s.startsWith("/")) s = s.slice(1);

  return s;
}

function publicUrlFromPath(path) {
  const p = normalizePosterPath(path);
  if (!p) return "";
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(p);
  return data?.publicUrl || "";
}
export default function Kalendar() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  async function load() {
    setLoading(true);
    setErr("");

    const { data, error } = await supabase
      .from("events")
      .select("id,title,category,audience_groups,starts_at,stream_url,worksheet_url,is_published,poster_path")
      .eq("is_published", true)
      .order("starts_at", { ascending: true });

    if (error) {
      setErr(error.message);
      setLoading(false);
      return;
    }

    setRows(data || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const now = new Date();

  const upcoming = useMemo(() => {
    return rows.filter((r) => {
      const d = safeDate(r.starts_at);
      return d && d >= now;
    });
  }, [rows]);

  const nextOne = upcoming[0] || null;
  const later = upcoming.slice(1);

  return (
    <RequireAuth>
      <PortalHeader />

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-semibold">Program</h1>
            <p className="text-slate-600 mt-1">
              Přehled živého vysílání a archivu.
            </p>
          </div>

          <button
            onClick={load}
            className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:border-slate-300"
          >
            Obnovit
          </button>
        </div>

        {loading && <div className="mt-6">Načítám…</div>}
        {err && <div className="mt-6 text-red-600">{err}</div>}

        {!loading && !err ? (
          <div className="mt-6 space-y-8">
            <div>
              <div className="text-sm font-semibold text-slate-700 mb-3">
                Nejbližší vysílání
              </div>

              {nextOne ? (
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
                  <div className="flex gap-4 items-start">
                    {nextOne.poster_path ? (
                      <div className="w-[140px] shrink-0 border border-slate-200 rounded-2xl overflow-hidden bg-slate-50">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={publicUrlFromPath(nextOne.poster_path)}
                          alt="Plakát"
                          className="w-full h-auto"
                          loading="lazy"
                        />
                      </div>
                    ) : null}

                    <div className="flex-1 min-w-[260px]">
                      <div className="text-sm text-slate-500">
                        {nextOne.starts_at
                          ? formatDateTimeCS(new Date(nextOne.starts_at))
                          : "Bez data"}
                      </div>

                      <div className="text-lg font-semibold mt-1">
                        {nextOne.title}
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                        {nextOne.category ? (
                          <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-700">
                            {nextOne.category}
                          </span>
                        ) : null}

                        {normalizeAudience(nextOne.audience_groups).map((a, i) => (
                          <span
                            key={i}
                            className={`px-2 py-1 rounded-full ${badgeColor(a)}`}
                          >
                            {a}
                          </span>
                        ))}
                      </div>

                      <div className="mt-4 flex gap-2 flex-wrap">
                        <Link
                          href={`/portal/udalost/${nextOne.id}`}
                          className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:border-slate-300"
                        >
                          Detail
                        </Link>

                        {nextOne.stream_url ? (
                          <a
                            href={nextOne.stream_url}
                            target="_blank"
                            rel="noreferrer"
                            className="px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800"
                          >
                            ▶ Odkaz na vysílání
                          </a>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-slate-600">Žádné nadcházející vysílání.</div>
              )}
            </div>

            <div>
              <div className="text-sm font-semibold text-slate-700 mb-3">
                Nadcházející vysílání
              </div>

              {later.length ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {later.map((r) => {
                    const posterUrl = r.poster_path
                      ? publicUrlFromPath(r.poster_path)
                      : "";
                    return (
                      <div
                        key={r.id}
                        className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5"
                      >
                        <div className="flex gap-4 items-start">
                          {posterUrl ? (
                            <div className="w-[120px] shrink-0 border border-slate-200 rounded-2xl overflow-hidden bg-slate-50">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={posterUrl}
                                alt="Plakát"
                                className="w-full h-auto"
                                loading="lazy"
                              />
                            </div>
                          ) : null}

                          <div className="flex-1">
                            <div className="text-sm text-slate-500">
                              {r.starts_at
                                ? formatDateTimeCS(new Date(r.starts_at))
                                : "Bez data"}
                            </div>

                            <div className="text-lg font-semibold mt-1">
                              {r.title}
                            </div>

                            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                              {r.category ? (
                                <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-700">
                                  {r.category}
                                </span>
                              ) : null}

                              {normalizeAudience(r.audience_groups).map((a, i) => (
                                <span
                                  key={i}
                                  className={`px-2 py-1 rounded-full ${badgeColor(a)}`}
                                >
                                  {a}
                                </span>
                              ))}
                            </div>

                            <div className="mt-4 flex gap-2 flex-wrap">
                              <Link
                                href={`/portal/udalost/${r.id}`}
                                className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:border-slate-300"
                              >
                                Detail
                              </Link>

                              {r.stream_url ? (
                                <a
                                  href={r.stream_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800"
                                >
                                  ▶ Odkaz na vysílání
                                </a>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-slate-600">Žádné další nadcházející vysílání.</div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </RequireAuth>
  );
}
