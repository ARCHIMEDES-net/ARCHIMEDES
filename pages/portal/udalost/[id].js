import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Check, Lock, CalendarPlus, CalendarDays, FileText, X } from "lucide-react";
import RequireAuth from "../../../components/RequireAuth";
import PortalHeader from "../../../components/PortalHeader";
import JoinBroadcastButton from "../../../components/JoinBroadcastButton";
import { getStreamUrl } from "../../../lib/broadcastState";
import { resolveLicenseMode } from "../../../lib/licenseMode";
import { supabase } from "../../../lib/supabaseClient";
import { fetchMyOrganization } from "../../../lib/myOrganizations";

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
  const s = String(aud).trim();
  if (!s) return [];
  return s.split(",").map((x) => x.trim()).filter(Boolean);
}

function normalizePosterPath(path) {
  if (!path) return "";
  let s = String(path).trim();
  if (!s) return "";
  if (s.startsWith(`${BUCKET}/`)) s = s.slice(BUCKET.length + 1);
  if (s.startsWith("http://") || s.startsWith("https://")) return s;
  if (s.startsWith("/")) s = s.slice(1);
  return s;
}

function publicUrlFromPath(path) {
  const normalized = normalizePosterPath(path);
  if (!normalized) return "";
  if (normalized.startsWith("http://") || normalized.startsWith("https://")) return normalized;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(normalized);
  return data?.publicUrl || "";
}

function resolvePosterUrl(row) {
  const directUrl = String(row?.poster_url || "").trim();
  if (directUrl) return directUrl;
  return publicUrlFromPath(row?.poster_path);
}

function formatGoogleDate(date) {
  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(date.getUTCDate()).padStart(2, "0");
  const hh = String(date.getUTCHours()).padStart(2, "0");
  const min = String(date.getUTCMinutes()).padStart(2, "0");
  const sec = String(date.getUTCSeconds()).padStart(2, "0");
  return `${yyyy}${mm}${dd}T${hh}${min}${sec}Z`;
}

function escapeIcsText(value = "") {
  return String(value || "")
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function buildGoogleCalendarUrl({ title, start, end, details, location }) {
  if (!title || !start || !end) return "";
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${formatGoogleDate(start)}/${formatGoogleDate(end)}`,
    details: details || "",
    location: location || "",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function downloadIcsFile({ title, start, end, details, location, filename }) {
  if (!title || !start || !end) return;

  const now = new Date();
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//ARCHIMEDES Live//CZ",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${start.getTime()}-${Math.random().toString(36).slice(2)}@archimedeslive.com`,
    `DTSTAMP:${formatGoogleDate(now)}`,
    `DTSTART:${formatGoogleDate(start)}`,
    `DTEND:${formatGoogleDate(end)}`,
    `SUMMARY:${escapeIcsText(title)}`,
    `DESCRIPTION:${escapeIcsText(details || "")}`,
    `LOCATION:${escapeIcsText(location || "")}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename || "udalost.ics";
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

function slugifyFileName(value = "") {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .toLowerCase();
}

export default function UdalostDetail() {
  const router = useRouter();
  const { id } = router.query;

  const [row, setRow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [licenseMode, setLicenseMode] = useState("active");
  const [licenseLoading, setLicenseLoading] = useState(true);
  const [isPlatformAdmin, setIsPlatformAdmin] = useState(false);
  const [isPosterOpen, setIsPosterOpen] = useState(false);

  const [currentUserId, setCurrentUserId] = useState("");
  const [activeOrganizationId, setActiveOrganizationId] = useState("");
  const [attendeeLoading, setAttendeeLoading] = useState(false);
  const [attendeeSaving, setAttendeeSaving] = useState(false);
  const [isAttending, setIsAttending] = useState(false);
  const [attendeeCount, setAttendeeCount] = useState(0);
  const [attendeeError, setAttendeeError] = useState("");

  useEffect(() => {
    async function load() {
      if (!id) return;

      setLoading(true);
      setErr("");

      const { data, error } = await supabase
        .from("events")
        .select(`
          *,
          broadcast_sessions (
            id,
            event_id,
            status,
            viewer_url,
            recording_url,
            recording_status,
            starts_at,
            external_meeting_id
          )
        `)
        .eq("id", id)
        .single();

      if (error) {
        setErr(error.message);
        setLoading(false);
        return;
      }

      setRow(data);
      setLoading(false);
    }

    load();
  }, [id]);

  useEffect(() => {
    let mounted = true;

    async function loadAccess() {
      try {
        const { data: adminData, error: adminError } = await supabase.rpc("is_admin");
        if (!adminError && mounted) {
          setIsPlatformAdmin(!!adminData);
        }

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) throw userError;

        if (!user) {
          if (mounted) setLicenseMode("default");
          return;
        }

        if (mounted) setCurrentUserId(user.id);

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("id, active_organization_id")
          .eq("id", user.id)
          .maybeSingle();

        if (profileError) throw profileError;

        if (!mounted) return;

        const orgId = profile?.active_organization_id || "";
        setActiveOrganizationId(orgId);

        if (!orgId) {
          setLicenseMode("active");
          return;
        }

        const { data: membership, error: membershipError } = await supabase
          .from("organization_members")
          .select("organization_id")
          .eq("user_id", user.id)
          .eq("organization_id", orgId)
          .eq("status", "active")
          .maybeSingle();

        if (membershipError) throw membershipError;

        if (!mounted) return;

        if (!membership?.organization_id) {
          setLicenseMode("active");
          return;
        }

        const org = await fetchMyOrganization(supabase, orgId);

        const mode = await resolveLicenseMode(supabase, orgId, org);
        if (mounted) {
          setLicenseMode(mode);
        }
      } catch (_e) {
        if (mounted) setLicenseMode("inactive");
      } finally {
        if (mounted) setLicenseLoading(false);
      }
    }

    loadAccess();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadAttendeeStatus() {
      if (!id || !activeOrganizationId) return;

      setAttendeeLoading(true);
      setAttendeeError("");

      try {
        const { data: ownRows, error: ownError } = await supabase
          .from("event_attendees")
          .select("id")
          .eq("event_id", id)
          .eq("organization_id", activeOrganizationId)
          .limit(1);

        if (ownError) throw ownError;

        if (mounted) {
          setIsAttending(Array.isArray(ownRows) && ownRows.length > 0);
        }

        if (isPlatformAdmin) {
          const { count, error: countError } = await supabase
            .from("event_attendees")
            .select("id", { count: "exact", head: true })
            .eq("event_id", id);

          if (countError) throw countError;

          if (mounted) {
            setAttendeeCount(count || 0);
          }
        }
      } catch (e) {
        if (mounted) {
          setAttendeeError(e?.message || "Nepodařilo se načíst účast.");
        }
      } finally {
        if (mounted) setAttendeeLoading(false);
      }
    }

    loadAttendeeStatus();

    return () => {
      mounted = false;
    };
  }, [id, activeOrganizationId, isPlatformAdmin]);

  useEffect(() => {
    if (!isPosterOpen) return;

    function handleKeyDown(e) {
      if (e.key === "Escape") {
        setIsPosterOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isPosterOpen]);

  const starts = useMemo(() => safeDate(row?.starts_at), [row?.starts_at]);
  const aud = useMemo(
    () => normalizeAudience(row?.audience_groups || row?.audience),
    [row]
  );

  const streamUrl = getStreamUrl(row);
  const broadcastSession = Array.isArray(row?.broadcast_sessions)
    ? row.broadcast_sessions[0]
    : row?.broadcast_sessions;
  const hasWebMeetingRoom = Boolean(broadcastSession?.external_meeting_id);
  const worksheetUrl = row?.worksheet_url || "";
  const posterUrl = useMemo(() => resolvePosterUrl(row), [row]);

  const canAccessStream =
    (Boolean(streamUrl) || hasWebMeetingRoom) &&
    (isPlatformAdmin || licenseMode === "active");

  const showLockedStreamNotice =
    (Boolean(streamUrl) || hasWebMeetingRoom) &&
    !canAccessStream &&
    !licenseLoading;

  const eventTitle = row?.title || row?.name || "Událost";
  const eventDescription =
    row?.full_description || row?.description || row?.short_description || "";
  const eventLocation = streamUrl || "ARCHIMEDES Live";

  const calendarStart = starts;
  const calendarEnd = useMemo(() => {
    if (!starts) return null;
    return new Date(starts.getTime() + 60 * 60 * 1000);
  }, [starts]);

  const calendarDetails = useMemo(() => {
    const parts = [];

    if (eventDescription) {
      parts.push(eventDescription);
    }

    if (streamUrl) {
      parts.push(`Odkaz na vysílání: ${streamUrl}`);
    }

    parts.push("Událost z portálu ARCHIMEDES Live.");

    return parts.join("\n\n");
  }, [eventDescription, streamUrl]);

  const googleCalendarUrl = useMemo(() => {
    if (!calendarStart || !calendarEnd) return "";
    return buildGoogleCalendarUrl({
      title: eventTitle,
      start: calendarStart,
      end: calendarEnd,
      details: calendarDetails,
      location: eventLocation,
    });
  }, [eventTitle, calendarStart, calendarEnd, calendarDetails, eventLocation]);

  async function handleAttendEvent() {
    if (!id || !currentUserId || !activeOrganizationId || isAttending) return;

    setAttendeeSaving(true);
    setAttendeeError("");

    try {
      const { error } = await supabase
        .from("event_attendees")
        .insert({
          event_id: id,
          organization_id: activeOrganizationId,
          user_id: currentUserId,
        });

      if (error && error.code !== "23505") {
        throw error;
      }

      setIsAttending(true);

      if (isPlatformAdmin) {
        setAttendeeCount((prev) => Math.max(1, Number(prev || 0) + 1));
      }
    } catch (e) {
      setAttendeeError(e?.message || "Přihlášení účasti se nepodařilo.");
    } finally {
      setAttendeeSaving(false);
    }
  }

  function handleDownloadIcs() {
    if (!calendarStart || !calendarEnd) return;

    downloadIcsFile({
      title: eventTitle,
      start: calendarStart,
      end: calendarEnd,
      details: calendarDetails,
      location: eventLocation,
      filename: `${slugifyFileName(eventTitle) || "udalost"}.ics`,
    });
  }

  if (loading) return <div className="p-6">Načítám…</div>;
  if (err) return <div className="p-6 text-red-600">{err}</div>;
  if (!row) return <div className="p-6">Událost nenalezena.</div>;

  return (
    <RequireAuth>
      <PortalHeader />

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <Link href="/portal/kalendar" className="text-sm text-slate-500 hover:underline">
            ← Zpět na Program
          </Link>

          <button
            onClick={() => router.back()}
            className="text-sm px-3 py-1 rounded-lg border border-slate-200 hover:bg-slate-50"
            title="Zpět"
          >
            Zpět
          </button>
        </div>

        <div className="mt-4 bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
          {posterUrl ? (
            <div className="mb-5 border border-slate-200 rounded-2xl bg-slate-50 p-3">
              <button
                type="button"
                onClick={() => setIsPosterOpen(true)}
                className="block w-full text-left"
                title="Klikněte pro zvětšení"
              >
                <img
                  src={posterUrl}
                  alt="Plakát události"
                  className="mx-auto w-full max-w-2xl max-h-[520px] object-contain cursor-zoom-in rounded-xl hover:opacity-95 transition"
                  loading="lazy"
                />
              </button>

              <div className="mt-3 text-center text-sm text-slate-500">
                Klikněte na plakát pro zvětšení
              </div>
            </div>
          ) : null}

          <div className="text-sm text-slate-500">
            {starts ? formatDateTimeCS(starts) : "Bez data"}
          </div>

          <h1 className="text-2xl font-semibold mt-2">
            {eventTitle}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {row.category ? (
              <span className="px-2 py-1 rounded-full text-xs bg-slate-100 text-slate-700">
                {row.category}
              </span>
            ) : null}

            {aud.map((a, i) => (
              <span key={i} className={`px-2 py-1 rounded-full text-xs ${badgeColor(a)}`}>
                {a}
              </span>
            ))}
          </div>

          {eventDescription ? (
            <div className="mt-5 text-slate-700 whitespace-pre-wrap">
              {eventDescription}
            </div>
          ) : (
            <div className="mt-5 text-slate-500">Popis zatím není vyplněn.</div>
          )}

          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <div className="text-sm font-extrabold uppercase tracking-wide text-emerald-800">
              Účast školy
            </div>

            <div className="mt-2 text-slate-700 leading-7">
              Potvrďte jedním kliknutím, že se vaše škola plánuje tohoto vysílání zúčastnit.
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              {activeOrganizationId ? (
                <button
                  type="button"
                  onClick={handleAttendEvent}
                  disabled={attendeeLoading || attendeeSaving || isAttending}
                  className={
                    isAttending
                      ? "px-4 py-2 rounded-xl bg-emerald-700 text-white font-bold cursor-default"
                      : "px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed"
                  }
                >
                  {attendeeSaving ? (
                    "Ukládám…"
                  ) : (
                    <span className="inline-flex items-center gap-1.5">
                      <Check className="h-4 w-4" aria-hidden="true" />
                      {isAttending ? "Vaše škola je přihlášena" : "Zúčastníme se vysílání"}
                    </span>
                  )}
                </button>
              ) : (
                <div className="text-sm text-slate-600">
                  Účast může potvrdit pouze uživatel přiřazený ke škole nebo organizaci.
                </div>
              )}

              {isPlatformAdmin ? (
                <div className="text-sm font-semibold text-emerald-900 bg-white/70 border border-emerald-200 rounded-xl px-3 py-2">
                  Přihlášeno škol: {attendeeCount}
                </div>
              ) : null}
            </div>

            {attendeeError ? (
              <div className="mt-3 text-sm text-red-700">
                {attendeeError}
              </div>
            ) : null}
          </div>

          {showLockedStreamNotice ? (
            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <div className="text-sm font-extrabold uppercase tracking-wide text-amber-800">
                Vysílání je součástí aktivní licence
              </div>

              <div className="mt-2 text-slate-700 leading-7">
                Tato událost je v portálu viditelná, ale přímý vstup do vysílání
                je dostupný pouze pro školy a organizace s aktivní licencí ARCHIMEDES Live.
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href="/zadost"
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800"
                >
                  Chci program pro naši obec
                </Link>

                <Link
                  href="/kontakt"
                  className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:border-slate-300"
                >
                  Napsat nám
                </Link>
              </div>
            </div>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-2">
            {canAccessStream ? (
              <JoinBroadcastButton
                event={row}
                detailHref={`/portal/udalost/${row?.id}`}
                showWaiting
              />
            ) : streamUrl || hasWebMeetingRoom ? (
              <button
                type="button"
                disabled
                className="px-4 py-2 rounded-xl bg-slate-200 text-slate-600 cursor-not-allowed font-semibold"
                title="Dostupné pouze pro aktivní organizace"
              >
                <span className="inline-flex items-center gap-1.5">
                  <Lock className="h-4 w-4" aria-hidden="true" /> Vstup do vysílání
                </span>
              </button>
            ) : null}

            {calendarStart && calendarEnd && googleCalendarUrl ? (
              <a
                href={googleCalendarUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:border-slate-300"
                title="Přidat událost do Google kalendáře"
              >
                <span className="inline-flex items-center gap-1.5">
                  <CalendarPlus className="h-4 w-4" aria-hidden="true" /> Přidat do Google kalendáře
                </span>
              </a>
            ) : null}

            {calendarStart && calendarEnd ? (
              <button
                type="button"
                onClick={handleDownloadIcs}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:border-slate-300"
                title="Stáhnout událost do kalendáře"
              >
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="h-4 w-4" aria-hidden="true" /> Stáhnout do kalendáře
                </span>
              </button>
            ) : null}

            {worksheetUrl ? (
              <a
                href={worksheetUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:border-slate-300"
              >
                <span className="inline-flex items-center gap-1.5">
                  <FileText className="h-4 w-4" aria-hidden="true" /> Pracovní list
                </span>
              </a>
            ) : null}

            <Link
              href="/portal/kalendar"
              className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:border-slate-300"
            >
              Zpět na Program
            </Link>
          </div>
        </div>
      </div>

      {isPosterOpen && posterUrl ? (
        <div
          className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4"
          onClick={() => setIsPosterOpen(false)}
          aria-modal="true"
          role="dialog"
        >
          <div
            className="relative w-full max-w-6xl flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsPosterOpen(false)}
              className="absolute top-2 right-2 z-10 rounded-full bg-white/95 px-3 py-2 text-sm font-medium text-slate-900 shadow hover:bg-white"
              title="Zavřít"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>

            <img
              src={posterUrl}
              alt="Plakát události – zvětšený náhled"
              className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      ) : null}
    </RequireAuth>
  );
}
