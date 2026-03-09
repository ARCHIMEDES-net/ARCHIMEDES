import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import RequireAuth from "../../components/RequireAuth";
import PortalHeader from "../../components/PortalHeader";
import { supabase } from "../../lib/supabaseClient";

const BUCKET = "posters";

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
  return s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
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

  if (s.startsWith(`${BUCKET}/`)) s = s.slice(BUCKET.length + 1);
  if (s.startsWith("http://") || s.startsWith("https://")) return s;
  if (s.startsWith("/")) s = s.slice(1);

  return s;
}

function publicUrlFromPath(path) {
  const p = normalizePosterPath(path);
  if (!p) return "";
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(p);
  return data?.publicUrl || "";
}

function normalizeSessionStatus(value) {
  const s = String(value || "").trim().toLowerCase();

  if (s === "scheduled") return "scheduled";
  if (s === "finished") return "finished";
  if (s === "draft") return "draft";

  return "unset";
}

function getStreamUrl(row) {
  return row?.broadcast_session?.viewer_url || row?.stream_url || "";
}

function getSessionStatus(row) {
  return normalizeSessionStatus(
    row?.broadcast_session?.status ||
      row?.broadcast_session?.broadcast_status ||
      ""
  );
}

function getEffectiveStart(row) {
  return safeDate(
    row?.broadcast_session?.starts_at ||
      row?.starts_at ||
      row?.event?.starts_at
  );
}

function shouldShowJoinButton(row, now = new Date()) {
  const streamUrl = getStreamUrl(row);
  if (!streamUrl) return false;

  const status = getSessionStatus(row);
  if (status !== "scheduled") return false;

  const start = getEffectiveStart(row);
  if (!start) return false;

  const openFrom = new Date(start.getTime() - 15 * 60 * 1000);
  const openUntil = new Date(start.getTime() + 4 * 60 * 60 * 1000);

  return now >= openFrom && now <= openUntil;
}

function getBroadcastBadge(row, now = new Date()) {
  const start = getEffectiveStart(row);
  const status = getSessionStatus(row);
  const streamUrl = getStreamUrl(row);

  if (status === "draft") {
    return {
      label: "Vysílání rozpracováno",
      className: "bg-amber-100 text-amber-700 border border-amber-200",
      dotClassName: "bg-amber-500",
    };
  }

  if (status === "finished") {
    return {
      label: "Dokončeno",
      className: "bg-blue-100 text-blue-700 border border-blue-200",
      dotClassName: "bg-blue-500",
    };
  }

  if (!start) return null;
  if (!streamUrl) return null;

  const liveFrom = new Date(start.getTime() - 5 * 60 * 1000);
  const liveUntil = new Date(start.getTime() + 2 * 60 * 60 * 1000);

  if (status === "scheduled" && now >= liveFrom && now <= liveUntil) {
    return {
      label: "Právě vysíláme",
      className: "bg-red-100 text-red-700 border border-red-200",
      dotClassName: "bg-red-500",
    };
  }

  if (status === "scheduled" && shouldShowJoinButton(row, now)) {
    return {
      label: "Vysílání připraveno",
      className: "bg-emerald-100 text-emerald-700 border border-emerald-200",
      dotClassName: "bg-emerald-500",
    };
  }

  if (status === "scheduled") {
    return {
      label: "Vysílání připraveno",
      className: "bg-emerald-100 text-emerald-700 border border-emerald-200",
      dotClassName: "bg-emerald-500",
    };
  }

  return null;
}

function BroadcastBadge({ row }) {
  const badge = getBroadcastBadge(row);
  if (!badge) return null;

  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${badge.className}`}
    >
      <span className={`w-2 h-2 rounded-full ${badge.dotClassName}`} />
      {badge.label}
    </span>
  );
}

function JoinButton({ row }) {
  if (!shouldShowJoinButton(row)) return null;

  const href = getStreamUrl(row);
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 font-medium"
    >
      ▶ Vstoupit do vysílání
    </a>
  );
}

function EventCard({ row, compact = false }) {
  const posterUrl = row.poster_path ? publicUrlFromPath(row.poster_path) : "";
  const start = getEffectiveStart(row);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
      <div className="flex gap-4 items-start">
        {posterUrl ? (
          <div
            className={`${
              compact ? "w-[120px]" : "w-[140px]"
            } shrink-0 border border-slate-200 rounded-2xl overflow-hidden bg-slate-50`}
          >
            <img
              src={posterUrl}
              alt="Plakát"
              className="w-full h-auto"
              loading="lazy"
            />
          </div>
        ) : null}

        <div className="flex-1 min-w-[260px]">
          <div className="text-sm text-slate-500">
            {start ? formatDateTimeCS(start) : "Bez data"}
          </div>

          <div className="text-lg font-semibold mt-1">{row.title}</div>

          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            {row.category ? (
              <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-700">
                {row.category}
              </span>
            ) : null}

            {normalizeAudience(row.audience_groups).map((a, i) => (
              <span
                key={i}
                className={`px-2 py-1 rounded-full ${badgeColor(a)}`}
              >
                {a}
              </span>
            ))}

            <BroadcastBadge row={row} />
          </div>

          <div className="mt-4 flex gap-2 flex-wrap">
            <Link
              href={`/portal/udalost/${row.id}`}
              className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:border-slate-300"
            >
              Detail
            </Link>

            <JoinButton row={row} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Kalendar() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  async function load() {
    setLoading(true);
    setErr("");

    const { data: eventsData, error: eventsError } = await supabase
      .from("events")
      .select(
        "id,title,category,audience_groups,starts_at,stream_url,worksheet_url,is_published,poster_path"
      )
      .eq("is_published", true)
      .order("starts_at", { ascending: true });

    if (eventsError) {
      setErr(eventsError.message);
      setLoading(false);
      return;
    }

    const baseRows = eventsData || [];

    if (!baseRows.length) {
      setRows([]);
      setLoading(false);
      return;
    }

    const eventIds = baseRows.map((r) => r.id).filter(Boolean);

    let sessionsMap = {};

    const { data: sessionsData, error: sessionsError } = await supabase
      .from("broadcast_sessions")
      .select(
        "id,event_id,status,broadcast_status,viewer_url,recording_url,recording_status,moderator_name,guest_1_name,guest_2_name,guest_3_name,guest_4_name,guest_5_name,notes_internal,starts_at"
      )
      .in("event_id", eventIds);

    if (!sessionsError && Array.isArray(sessionsData)) {
      sessionsMap = Object.fromEntries(
        sessionsData.map((s) => [s.event_id, s])
      );
    }

    const merged = baseRows.map((row) => ({
      ...row,
      broadcast_session: sessionsMap[row.id] || null,
      event: row,
    }));

    setRows(merged);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const now = new Date();

  const visibleRows = useMemo(() => {
    return rows.filter((r) => {
      const d = getEffectiveStart(r);
      if (!d) return false;

      const keepUntil = new Date(d.getTime() + 24 * 60 * 60 * 1000);
      return keepUntil >= now;
    });
  }, [rows, now]);

  const sortedRows = useMemo(() => {
    return [...visibleRows].sort((a, b) => {
      const da = getEffectiveStart(a)?.getTime() || 0;
      const db = getEffectiveStart(b)?.getTime() || 0;
      return da - db;
    });
  }, [visibleRows]);

  const nextOne = sortedRows[0] || null;
  const later = sortedRows.slice(1);

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
                <EventCard row={nextOne} />
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
                  {later.map((r) => (
                    <EventCard key={r.id} row={r} compact />
                  ))}
                </div>
              ) : (
                <div className="text-slate-600">
                  Žádné další nadcházející vysílání.
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </RequireAuth>
  );
}
