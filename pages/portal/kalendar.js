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

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function minutesToHuman(mins) {
  if (mins < 1) return "za chvíli";
  if (mins < 60) return `za ${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (m === 0) return `za ${h} h`;
  return `za ${h} h ${m} min`;
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

function normalizeAudience(aud) {
  if (!aud) return [];
  if (Array.isArray(aud)) return aud.filter(Boolean).map(String);
  // kdyby bylo uložené jako text
  const s = String(aud).trim();
  if (!s) return [];
  return s.split(",").map((x) => x.trim()).filter(Boolean);
}

function sortByStartAsc(a, b) {
  const da = safeDate(a?.starts_at);
  const db = safeDate(b?.starts_at);
  if (!da && !db) return 0;
  if (!da) return 1;
  if (!db) return -1;
  return da.getTime() - db.getTime();
}

export default function Kalendar() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  async function load() {
    setLoading(true);
    setErr("");

    // Bereme jen publikované (pokud sloupec existuje a používáš ho)
    // Když by náhodou neexistoval, Supabase vrátí chybu – u tebe už is_published používáme, takže OK.
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("is_published", true)
      .order("starts_at", { ascending: true, nullsFirst: false });

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

  const enriched = useMemo(() => {
    return (rows || []).map((r) => {
      const d = safeDate(r.starts_at);
      const aud = normalizeAudience(r.audience_groups || r.audience);
      return {
        ...r,
        _starts: d,
        _aud: aud,
      };
    });
  }, [rows]);

  const { todayNextHero, upcoming, archive, undated } = useMemo(() => {
    const future = [];
    const past = [];
    const noDate = [];

    for (const r of enriched) {
      if (!r._starts) {
        noDate.push(r);
      } else if (r._starts.getTime() >= now.getTime()) {
        future.push(r);
      } else {
        past.push(r);
      }
    }

    future.sort(sortByStartAsc);
    past.sort((a, b) => (b._starts?.getTime() || 0) - (a._starts?.getTime() || 0));

    // hero = nejbližší událost, ideálně dnes; když není dnes, tak nejbližší budoucí
    let hero = null;
    const today = future.find((x) => x._starts && isSameDay(x._starts, now));
    hero = today || future[0] || null;

    // upcoming bez hero
    const up = hero ? future.filter((x) => x.id !== hero.id) : future;

    return {
      todayNextHero: hero,
      upcoming: up,
      archive: past,
      undated: noDate,
    };
  }, [enriched]);

  function HeroBadge(hero) {
    if (!hero?._starts) return null;
    const mins = Math.round((hero._starts.getTime() - now.getTime()) / 60000);
    const sameDay = isSameDay(hero._starts, now);

    if (mins <= 0) {
      return (
        <span className="px-3 py-1 rounded-full text-xs bg-red-100 text-red-800">
          🔴 Právě probíhá / právě začíná
        </span>
      );
    }
    if (sameDay) {
      return (
        <span className="px-3 py-1 rounded-full text-xs bg-red-100 text-red-800">
          DNES {minutesToHuman(mins)}
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-full text-xs bg-slate-100 text-slate-700">
        Nejbližší vysílání
      </span>
    );
  }

  function EventCard({ r, variant = "default" }) {
    const dt = r._starts ? formatDateTimeCS(r._starts) : "Bez data";
    const category = r.category || "";
    const hasLink = !!(r.stream_url || r.streamUrl);
    const streamUrl = r.stream_url || r.streamUrl || "";

    return (
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs text-slate-500">{dt}</div>
            <div className="text-lg font-semibold mt-1">{r.title || r.name || "Událost"}</div>

            <div className="mt-2 flex flex-wrap items-center gap-2">
              {category ? (
                <span className="px-2 py-1 rounded-full text-xs bg-slate-100 text-slate-700">
                  {category}
                </span>
              ) : null}

              {(r._aud || []).map((a, i) => (
                <span key={i} className={`px-2 py-1 rounded-full text-xs ${badgeColor(a)}`}>
                  {a}
                </span>
              ))}
            </div>
          </div>

          {variant === "hero" ? (
            <div className="shrink-0">{HeroBadge(r)}</div>
          ) : null}
        </div>

        {r.short_description || r.description ? (
          <div className="mt-3 text-sm text-slate-600 whitespace-pre-wrap">
            {r.short_description || r.description}
          </div>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href={`/portal/udalost/${r.id}`}
            className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:border-slate-300"
          >
            Detail
          </Link>

          {hasLink ? (
            <a
              href={streamUrl}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800"
            >
              ▶ Odkaz na vysílání
            </a>
          ) : null}

          {r.worksheet_url ? (
            <a
              href={r.worksheet_url}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:border-slate-300"
            >
              📄 Pracovní list
            </a>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <RequireAuth>
      <PortalHeader />

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-end justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-semibold">Program</h1>
            <p className="text-slate-600 mt-1">
              Přehled živého vysílání a archivu. (Archiv se tvoří automaticky podle data.)
            </p>
          </div>

          <button
            onClick={load}
            className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:border-slate-300"
          >
            Obnovit
          </button>
        </div>

        {err ? (
          <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700">
            {err}
          </div>
        ) : null}

        {loading ? <div className="mt-6">Načítám…</div> : null}

        {/* HERO */}
        <div className="mt-6">
          <div className="text-sm font-semibold text-slate-800 mb-3">
            Nejbližší vysílání
          </div>

          {todayNextHero ? (
            <div className="border border-slate-200 rounded-2xl bg-gradient-to-b from-slate-50 to-white p-1">
              <div className="rounded-2xl">
                <EventCard r={todayNextHero} variant="hero" />
              </div>
            </div>
          ) : (
            <div className="text-slate-500">Zatím tu není žádné naplánované vysílání.</div>
          )}
        </div>

        {/* UPCOMING */}
        <div className="mt-10">
          <div className="text-sm font-semibold text-slate-800 mb-3">
            Nadcházející vysílání
          </div>

          {upcoming.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcoming.map((r) => (
                <EventCard key={r.id} r={r} />
              ))}
            </div>
          ) : (
            <div className="text-slate-500">Žádné další nadcházející vysílání.</div>
          )}
        </div>

        {/* UNDATED */}
        {undated.length ? (
          <div className="mt-10">
            <div className="text-sm font-semibold text-slate-800 mb-3">
              Bez data
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {undated.map((r) => (
                <EventCard key={r.id} r={r} />
              ))}
            </div>
          </div>
        ) : null}

        {/* ARCHIVE */}
        <div className="mt-10">
          <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
            <div className="text-sm font-semibold text-slate-800">Archiv</div>
            <div className="text-xs text-slate-500">
              (Zatím bez „záznamů“ – až přidáme `recording_url`, doplníme tlačítko Záznam.)
            </div>
          </div>

          {archive.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {archive.slice(0, 20).map((r) => (
                <EventCard key={r.id} r={r} />
              ))}
            </div>
          ) : (
            <div className="text-slate-500">Archiv je zatím prázdný.</div>
          )}
        </div>
      </div>
    </RequireAuth>
  );
}
