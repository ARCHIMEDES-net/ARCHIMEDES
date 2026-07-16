import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Check, Plus, Wrench, FolderOpen } from "lucide-react";
import RequireAuth from "../../components/RequireAuth";
import PortalHeader from "../../components/PortalHeader";
import JoinBroadcastButton from "../../components/JoinBroadcastButton";
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
  let s = String(p).trim();
  if (!s) return "";
  if (s.startsWith(`${BUCKET}/`)) s = s.slice(BUCKET.length + 1);
  if (s.startsWith("http://") || s.startsWith("https://")) return s;
  if (s.startsWith("/")) s = s.slice(1);
  return s;
}

function publicUrlFromPath(path) {
  const p = normalizePosterPath(path);
  if (!p) return "";
  if (p.startsWith("http://") || p.startsWith("https://")) return p;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(p);
  return data?.publicUrl || "";
}

function resolvePosterUrl(row) {
  const directUrl = String(row?.poster_url || "").trim();
  if (directUrl) return directUrl;
  return publicUrlFromPath(row?.poster_path);
}

function normalizeSession(session) {
  if (!session) return null;
  if (Array.isArray(session)) return session[0] || null;
  return session;
}

function normalizeSessionStatus(value) {
  const s = String(value || "").trim().toLowerCase();
  if (s === "scheduled") return "scheduled";
  if (s === "finished") return "finished";
  if (s === "draft") return "draft";
  return "unset";
}

function getSession(row) {
  return normalizeSession(row?.broadcast_sessions || row?.broadcast_session || null);
}

function getStreamUrl(row) {
  const session = getSession(row);
  return session?.viewer_url || row?.stream_url || "";
}

function getSessionStatus(row) {
  const session = getSession(row);
  return normalizeSessionStatus(session?.status || session?.broadcast_status || "");
}

function getEffectiveStart(row) {
  const session = getSession(row);
  return safeDate(session?.starts_at || row?.starts_at);
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

  if (!start || !streamUrl) return null;

  const liveFrom = new Date(start.getTime() - 5 * 60 * 1000);
  const liveUntil = new Date(start.getTime() + 2 * 60 * 60 * 1000);

  if (status === "scheduled" && now >= liveFrom && now <= liveUntil) {
    return {
      label: "Právě vysíláme",
      className: "bg-red-100 text-red-700 border border-red-200",
      dotClassName: "bg-red-500",
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
    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${badge.className}`}>
      <span className={`w-2 h-2 rounded-full ${badge.dotClassName}`} />
      {badge.label}
    </span>
  );
}

function AttendButton({
  eventId,
  compact,
  isAttending,
  attendeeCount,
  isProgramAdmin,
  canAttend,
  saving,
  onAttend,
}) {
  if (!canAttend) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => onAttend(eventId)}
        disabled={saving || isAttending}
        className={
          isAttending
            ? "px-4 py-2 rounded-xl bg-emerald-700 text-white font-bold cursor-default"
            : "px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed"
        }
        style={{
          minHeight: compact ? 42 : 44,
          fontSize: compact ? 14 : 15,
        }}
      >
        {saving ? (
          "Ukládám…"
        ) : (
          <span className="inline-flex items-center gap-1.5">
            <Check className="h-4 w-4" aria-hidden="true" />
            {isAttending ? "Přihlášeno" : "Zúčastníme se"}
          </span>
        )}
      </button>

      {isProgramAdmin ? (
        <span className="text-xs font-semibold text-emerald-900 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">
          Škol: {attendeeCount || 0}
        </span>
      ) : null}
    </div>
  );
}

function EventCard({
  row,
  compact = false,
  attendeeInfo,
  isProgramAdmin,
  canAttend,
  savingEventId,
  onAttend,
}) {
  const posterUrl = resolvePosterUrl(row);
  const start = getEffectiveStart(row);
  const info = attendeeInfo?.[row.id] || { isAttending: false, count: 0 };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
      <div className="flex flex-col sm:flex-row gap-4 items-start">
        {posterUrl ? (
          <div className={`${compact ? "w-[120px]" : "w-[140px]"} shrink-0 border border-slate-200 rounded-2xl overflow-hidden bg-slate-50`}>
            <img src={posterUrl} alt="Plakát" className="w-full h-auto" loading="lazy" />
          </div>
        ) : null}

        <div className="flex-1 min-w-0 w-full">
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
              <span key={i} className={`px-2 py-1 rounded-full ${badgeColor(a)}`}>
                {a}
              </span>
            ))}

            <BroadcastBadge row={row} />
          </div>

          <div className="mt-4 flex gap-2 flex-wrap">
            <JoinBroadcastButton
              event={row}
              compact={compact}
              detailHref={`/portal/udalost/${row.id}`}
            />

            <AttendButton
              eventId={row.id}
              compact={compact}
              isAttending={info.isAttending}
              attendeeCount={info.count}
              isProgramAdmin={isProgramAdmin}
              canAttend={canAttend}
              saving={savingEventId === row.id}
              onAttend={onAttend}
            />

            <Link
              href={`/portal/udalost/${row.id}`}
              className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:border-slate-300 font-semibold"
            >
              Detail
            </Link>
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
  const [isProgramAdmin, setIsProgramAdmin] = useState(false);

  const [currentUserId, setCurrentUserId] = useState("");
  const [activeOrganizationId, setActiveOrganizationId] = useState("");
  const [attendeeInfo, setAttendeeInfo] = useState({});
  const [savingEventId, setSavingEventId] = useState("");
  const [attendeeError, setAttendeeError] = useState("");

  async function load() {
    setLoading(true);
    setErr("");

    const { data, error } = await supabase
      .from("events")
      .select(`
        id,
        title,
        category,
        audience_groups,
        starts_at,
        stream_url,
        worksheet_url,
        is_published,
        poster_path,
        poster_url,
        broadcast_sessions (
          id,
          event_id,
          status,
          viewer_url,
          recording_url,
          recording_status,
          moderator_name,
          guest_1_name,
          guest_2_name,
          guest_3_name,
          guest_4_name,
          guest_5_name,
          notes_internal,
          starts_at
        )
      `)
      .eq("is_published", true)
      .order("starts_at", { ascending: true });

    if (error) {
      setErr(error.message);
      setRows([]);
      setLoading(false);
      return;
    }

    setRows(data || []);
    setLoading(false);
  }

  async function loadAttendees(eventRows, orgId, adminMode) {
    if (!Array.isArray(eventRows) || eventRows.length === 0) {
      setAttendeeInfo({});
      return;
    }

    const eventIds = eventRows.map((r) => r.id).filter(Boolean);
    if (!eventIds.length) {
      setAttendeeInfo({});
      return;
    }

    const { data, error } = await supabase
      .from("event_attendees")
      .select("event_id, organization_id")
      .in("event_id", eventIds);

    if (error) {
      setAttendeeError(error.message);
      return;
    }

    const next = {};

    eventIds.forEach((eventId) => {
      next[eventId] = {
        isAttending: false,
        count: 0,
      };
    });

    (data || []).forEach((item) => {
      if (!next[item.event_id]) {
        next[item.event_id] = {
          isAttending: false,
          count: 0,
        };
      }

      if (adminMode) {
        next[item.event_id].count += 1;
      }

      if (orgId && item.organization_id === orgId) {
        next[item.event_id].isAttending = true;
      }
    });

    setAttendeeInfo(next);
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadRoleAndProfile() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user || cancelled) {
          if (!cancelled) {
            setIsProgramAdmin(false);
            setCurrentUserId("");
            setActiveOrganizationId("");
          }
          return;
        }

        if (!cancelled) setCurrentUserId(user.id);

        const { data: profile } = await supabase
          .from("profiles")
          .select("active_organization_id")
          .eq("id", user.id)
          .maybeSingle();

        if (!cancelled) {
          setActiveOrganizationId(profile?.active_organization_id || "");
        }

        const { data: isAdminData, error: isAdminError } = await supabase.rpc("is_admin");

        if (cancelled) return;

        setIsProgramAdmin(!isAdminError && !!isAdminData);
      } catch (_e) {
        if (!cancelled) {
          setIsProgramAdmin(false);
          setCurrentUserId("");
          setActiveOrganizationId("");
        }
      }
    }

    loadRoleAndProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  const visibleRows = useMemo(() => {
    // Keep the derived array stable between renders. A fresh `new Date()` in
    // component scope changed this memo on every render, which retriggered
    // the attendee-loading effect below and could make portal navigation
    // unresponsive through a continuous request/render loop.
    const now = new Date();

    return rows.filter((r) => {
      const d = getEffectiveStart(r);
      if (!d) return false;

      const keepUntil = new Date(d.getTime() + 24 * 60 * 60 * 1000);
      return keepUntil >= now;
    });
  }, [rows]);

  const sortedRows = useMemo(() => {
    return [...visibleRows].sort((a, b) => {
      const da = getEffectiveStart(a)?.getTime() || 0;
      const db = getEffectiveStart(b)?.getTime() || 0;
      return da - db;
    });
  }, [visibleRows]);

  useEffect(() => {
    loadAttendees(sortedRows, activeOrganizationId, isProgramAdmin);
  }, [sortedRows, activeOrganizationId, isProgramAdmin]);

  async function handleAttend(eventId) {
    if (!eventId || !currentUserId || !activeOrganizationId) return;

    setSavingEventId(eventId);
    setAttendeeError("");

    try {
      const { error } = await supabase.from("event_attendees").insert({
        event_id: eventId,
        organization_id: activeOrganizationId,
        user_id: currentUserId,
      });

      if (error && error.code !== "23505") {
        throw error;
      }

      setAttendeeInfo((prev) => {
        const old = prev[eventId] || { isAttending: false, count: 0 };
        return {
          ...prev,
          [eventId]: {
            isAttending: true,
            count: isProgramAdmin && !old.isAttending ? Number(old.count || 0) + 1 : old.count,
          },
        };
      });
    } catch (e) {
      setAttendeeError(e?.message || "Přihlášení účasti se nepodařilo.");
    } finally {
      setSavingEventId("");
    }
  }

  const nextOne = sortedRows[0] || null;
  const later = sortedRows.slice(1);
  const canAttend = !!currentUserId && !!activeOrganizationId;

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

          <div className="flex items-center gap-2 flex-wrap">
            {isProgramAdmin ? (
              <>
                <Link
                  href="/portal/admin-udalosti/novy"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-navy-900 px-4 py-2 text-white hover:bg-navy-800"
                >
                  <Plus className="h-4 w-4" aria-hidden="true" /> Nová událost
                </Link>
                <Link
                  href="/portal/admin/udalosti"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 hover:border-slate-300"
                >
                  <Wrench className="h-4 w-4" aria-hidden="true" /> Správa vysílání
                </Link>
                <Link
                  href="/portal/archiv"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 hover:border-slate-300"
                >
                  <FolderOpen className="h-4 w-4" aria-hidden="true" /> Archiv
                </Link>
              </>
            ) : null}

            <button
              onClick={load}
              className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:border-slate-300"
            >
              Obnovit
            </button>
          </div>
        </div>

        {isProgramAdmin ? (
          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="font-semibold text-slate-900">Administrace programu</div>
            <div className="text-sm text-slate-600 mt-1">
              Nové vysílání zakládejte přes tlačítko <strong>Nová událost</strong>. Po skončení vysílání
              doplňte záznam ve <strong>Správě vysílání</strong> a zkontrolujte výsledek v <strong>Archivu</strong>.
            </div>
          </div>
        ) : null}

        {attendeeError ? (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {attendeeError}
          </div>
        ) : null}

        {loading && <div className="mt-6">Načítám…</div>}
        {err && <div className="mt-6 text-red-600">{err}</div>}

        {!loading && !err ? (
          <div className="mt-6 space-y-8">
            <div>
              <div className="text-sm font-semibold text-slate-700 mb-3">
                Nejbližší vysílání
              </div>

              {nextOne ? (
                <EventCard
                  row={nextOne}
                  attendeeInfo={attendeeInfo}
                  isProgramAdmin={isProgramAdmin}
                  canAttend={canAttend}
                  savingEventId={savingEventId}
                  onAttend={handleAttend}
                />
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
                    <EventCard
                      key={r.id}
                      row={r}
                      compact
                      attendeeInfo={attendeeInfo}
                      isProgramAdmin={isProgramAdmin}
                      canAttend={canAttend}
                      savingEventId={savingEventId}
                      onAttend={handleAttend}
                    />
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
