import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import RequirePlatformAdmin from "../../../../components/RequirePlatformAdmin";
import PortalHeader from "../../../../components/PortalHeader";
import { supabase } from "../../../../lib/supabaseClient";
import { cn } from "../../../../lib/utils";
import { Card } from "../../../../components/ui/card";
import { Input } from "../../../../components/ui/input";
import { Textarea } from "../../../../components/ui/textarea";
import { Select } from "../../../../components/ui/select";
import { Button } from "../../../../components/ui/button";
import { Alert } from "../../../../components/ui/alert";

const STATUS_OPTIONS = [
  { value: "draft", label: "Rozpracováno" },
  { value: "scheduled", label: "Připraveno" },
  { value: "live", label: "Právě vysíláme" },
  { value: "finished", label: "Dokončeno" },
];

const RECORDING_STATUS_OPTIONS = [
  { value: "none", label: "Bez záznamu" },
  { value: "processing", label: "Zpracovává se" },
  { value: "ready", label: "Připraveno" },
  { value: "published", label: "Publikováno" },
  { value: "failed", label: "Chyba" },
];

function toDateTimeLocalValue(date) {
  if (!date) return "";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

function formatDateTimeCZ(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("cs-CZ", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function normalizeUrl(url) {
  const v = String(url || "").trim();
  if (!v) return "";
  if (v.startsWith("http://") || v.startsWith("https://")) return v;
  return `https://${v}`;
}

function FieldLabel({ children }) {
  return <label className="mb-2 block font-bold text-navy-900">{children}</label>;
}

export default function AdminVysilaniDetailPage() {
  const router = useRouter();
  const { eventId } = router.query;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copyInfo, setCopyInfo] = useState("");
  const [recipientGroups, setRecipientGroups] = useState([]);
  const [selectedRecipientGroups, setSelectedRecipientGroups] = useState([]);
  const [recipients, setRecipients] = useState([]);
  const [recipientsLoading, setRecipientsLoading] = useState(false);

  const [eventRow, setEventRow] = useState(null);
  const [sessionId, setSessionId] = useState("");

  const [status, setStatus] = useState("draft");
  const [moderatorName, setModeratorName] = useState("");
  const [guest1Name, setGuest1Name] = useState("");
  const [guest2Name, setGuest2Name] = useState("");
  const [guest3Name, setGuest3Name] = useState("");
  const [guest4Name, setGuest4Name] = useState("");
  const [guest5Name, setGuest5Name] = useState("");
  const [viewerUrl, setViewerUrl] = useState("");
  const [recordingUrl, setRecordingUrl] = useState("");
  const [recordingStatus, setRecordingStatus] = useState("none");
  const [notesInternal, setNotesInternal] = useState("");
  const [startsAt, setStartsAt] = useState("");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!router.isReady || !eventId) return;
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, eventId]);

  async function ensureSessionExists() {
    const { data, error } = await supabase
      .from("broadcast_sessions")
      .select("*")
      .eq("event_id", eventId)
      .limit(1);

    if (error) throw error;

    if (Array.isArray(data) && data.length > 0) {
      return data[0];
    }

    const { data: created, error: createError } = await supabase
      .from("broadcast_sessions")
      .insert([
        {
          event_id: eventId,
          status: "draft",
          platform: "webmeeting",
          recording_status: "none",
        },
      ])
      .select()
      .single();

    if (createError) throw createError;
    return created;
  }

  async function loadData() {
    setLoading(true);
    setError("");
    setMessage("");
    setCopyInfo("");

    try {
      const { data: eventData, error: eventError } = await supabase
        .from("events")
        .select("*")
        .eq("id", eventId)
        .single();

      if (eventError) throw eventError;

      setEventRow(eventData);

      const session = await ensureSessionExists();

      setSessionId(session.id || "");
      setStatus(session.status || "draft");
      setModeratorName(session.moderator_name || "");
      setGuest1Name(session.guest_1_name || "");
      setGuest2Name(session.guest_2_name || "");
      setGuest3Name(session.guest_3_name || "");
      setGuest4Name(session.guest_4_name || "");
      setGuest5Name(session.guest_5_name || "");
      setViewerUrl(session.viewer_url || eventData.stream_url || "");
      setRecordingUrl(session.recording_url || "");
      setRecordingStatus(session.recording_status || "none");
      setNotesInternal(session.notes_internal || "");
      setStartsAt(toDateTimeLocalValue(session.starts_at || eventData.starts_at));
      await loadRecipientGroups();
    } catch (e) {
      setError(e.message || "Nepodařilo se načíst detail vysílání.");
    } finally {
      setLoading(false);
    }
  }

  async function getAccessToken() {
    const { data } = await supabase.auth.getSession();
    const token = data?.session?.access_token;
    if (!token) throw new Error("Přihlášení vypršelo. Přihlaste se prosím znovu.");
    return token;
  }

  async function loadRecipientGroups() {
    const token = await getAccessToken();
    const response = await fetch("/api/admin/group-counts", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "Nepodařilo se načíst skupiny zájmů.");
    setRecipientGroups(Array.isArray(payload) ? payload : []);
  }

  async function generateRecipients() {
    setRecipientsLoading(true);
    setError("");
    setCopyInfo("");
    try {
      const token = await getAccessToken();
      const response = await fetch("/api/admin/broadcast-recipients", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ groups: selectedRecipientGroups }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Nepodařilo se vytvořit seznam příjemců.");
      setRecipients(payload.users || []);
      setCopyInfo(`Seznam obsahuje ${payload.count || 0} unikátních příjemců.`);
    } catch (e) {
      setRecipients([]);
      setError(e.message || "Nepodařilo se vytvořit seznam příjemců.");
    } finally {
      setRecipientsLoading(false);
    }
  }

  async function copyRecipients() {
    if (!recipients.length) {
      setError("Nejprve vytvořte seznam příjemců.");
      return;
    }
    try {
      await navigator.clipboard.writeText(recipients.map((item) => item.email).join(", "));
      setCopyInfo(`${recipients.length} e-mailů bylo zkopírováno pro vložení do WebMeetingu.`);
    } catch (_e) {
      setCopyInfo("E-maily zkopírujte ručně.");
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    setCopyInfo("");

    try {
      if (!sessionId) {
        throw new Error("Chybí session pro tuto událost.");
      }

      const normalizedViewerUrl = normalizeUrl(viewerUrl);
      const normalizedRecordingUrl = normalizeUrl(recordingUrl);

      const payload = {
        status,
        platform: "webmeeting",
        moderator_name: moderatorName.trim() || null,
        guest_1_name: guest1Name.trim() || null,
        guest_2_name: guest2Name.trim() || null,
        guest_3_name: guest3Name.trim() || null,
        guest_4_name: guest4Name.trim() || null,
        guest_5_name: guest5Name.trim() || null,
        viewer_url: normalizedViewerUrl || null,
        recording_url: normalizedRecordingUrl || null,
        recording_status: recordingStatus,
        notes_internal: notesInternal.trim() || null,
        starts_at: startsAt ? new Date(startsAt).toISOString() : null,
        is_published: status !== "draft",
      };

      const { error: updateError } = await supabase
        .from("broadcast_sessions")
        .update(payload)
        .eq("id", sessionId);

      if (updateError) throw updateError;

      const eventPatch = {};

      // Starší události mohou mít odkaz používaný portálem. Pokud správce
      // nový odkaz nevyplní, existující hodnotu nemažeme.
      if (normalizedViewerUrl) eventPatch.stream_url = normalizedViewerUrl;

      if (startsAt) {
        eventPatch.starts_at = new Date(startsAt).toISOString();
      }

      if (Object.keys(eventPatch).length > 0) {
        const { error: eventUpdateError } = await supabase
          .from("events")
          .update(eventPatch)
          .eq("id", eventId);

        if (eventUpdateError) throw eventUpdateError;
      }

      setViewerUrl(normalizedViewerUrl);
      setRecordingUrl(normalizedRecordingUrl);
      setMessage(
        normalizedViewerUrl
          ? "Vysílání bylo uloženo; volitelný odkaz se propsal do události."
          : "Vysílání bylo uloženo. Pozvánky a přístupový odkaz rozešle WebMeeting."
      );
    } catch (e) {
      setError(e.message || "Vysílání se nepodařilo uložit.");
    } finally {
      setSaving(false);
    }
  }

  async function handleCopyViewerLink() {
    try {
      const normalizedViewerUrl = normalizeUrl(viewerUrl);
      if (!normalizedViewerUrl) {
        setError("Volitelný odkaz není vyplněný.");
        return;
      }

      await navigator.clipboard.writeText(normalizedViewerUrl);
      setCopyInfo("Volitelný odkaz byl zkopírován.");
    } catch (_e) {
      setCopyInfo("Odkaz zkopírujte ručně.");
    }
  }

  async function handleCopyProductionSummary() {
    try {
      const normalizedViewerUrl = normalizeUrl(viewerUrl);
      const guestLines = [
        guest1Name.trim(),
        guest2Name.trim(),
        guest3Name.trim(),
        guest4Name.trim(),
        guest5Name.trim(),
      ].filter(Boolean);

      const summary = [
        `Událost: ${eventRow?.title || "Bez názvu"}`,
        `Začátek: ${startsAt ? formatDateTimeCZ(new Date(startsAt).toISOString()) : "—"}`,
        `Moderátor: ${moderatorName.trim() || "—"}`,
        `Hosté: ${guestLines.length ? guestLines.join(", ") : "—"}`,
        `WebMeeting odkaz uložený v portálu: ${normalizedViewerUrl || "není potřeba"}`,
        `Stav vysílání: ${
          STATUS_OPTIONS.find((s) => s.value === status)?.label || status || "—"
        }`,
        notesInternal.trim() ? `Interní poznámka: ${notesInternal.trim()}` : "",
      ]
        .filter(Boolean)
        .join("\n");

      await navigator.clipboard.writeText(summary);
      setCopyInfo("Produkční shrnutí bylo zkopírováno.");
    } catch (_e) {
      setCopyInfo("Shrnutí zkopírujte ručně.");
    }
  }

  const normalizedViewerUrl = useMemo(() => normalizeUrl(viewerUrl), [viewerUrl]);

  const statusBadge = useMemo(() => {
    if (status === "scheduled") {
      return { label: "🟢 Vysílání připraveno", className: "border-emerald-200 bg-emerald-50 text-emerald-800" };
    }

    if (status === "live") {
      return { label: "🔴 Právě vysíláme", className: "border-red-200 bg-red-50 text-red-700" };
    }

    if (status === "finished") {
      return { label: "✅ Dokončeno", className: "border-blue-200 bg-blue-50 text-blue-700" };
    }

    return { label: "🟡 Vysílání rozpracováno", className: "border-yellow-200 bg-yellow-50 text-yellow-800" };
  }, [status]);

  return (
    <RequirePlatformAdmin>
      <div className="min-h-screen bg-slate-50">
        <PortalHeader title="Admin • vysílání" />

        <main className="mx-auto max-w-[980px] px-4 pb-14 pt-8">
          <div className="mb-4">
            <Button href="/portal/admin/udalosti" variant="ghost" size="sm" className="mb-3">
              ← Zpět na admin událostí
            </Button>

            <h1 className="text-[34px] font-black text-navy-900">Správa vysílání</h1>

            <p className="mt-1 leading-relaxed text-muted">
              Produkční karta WebMeetingu, moderátora, hostů a seznamu pozvaných podle osobních zájmů.
            </p>
          </div>

          {eventRow ? (
            <Card className="mb-4 p-4 shadow-card">
              <div className="mb-1.5 text-sm text-slate-500">Událost</div>
              <div className="text-xl font-black text-navy-900">{eventRow.title || "Bez názvu"}</div>
              <div className="mt-1.5 text-slate-600">
                Plánovaný čas: {eventRow.starts_at ? formatDateTimeCZ(eventRow.starts_at) : "—"}
              </div>

              <div
                className={cn(
                  "mt-2.5 inline-flex items-center rounded-full border px-2.5 py-1.5 text-[13px] font-bold",
                  statusBadge.className
                )}
              >
                {statusBadge.label}
              </div>
            </Card>
          ) : null}

          {error ? (
            <Alert variant="error" className="mb-4">
              {error}
            </Alert>
          ) : null}

          {message ? (
            <Alert variant="success" className="mb-4">
              {message}
            </Alert>
          ) : null}

          {copyInfo ? (
            <Alert variant="info" className="mb-4">
              {copyInfo}
            </Alert>
          ) : null}

          <Card className="p-5 shadow-card">
            {loading ? (
              <div className="text-muted">Načítám…</div>
            ) : (
              <>
                <div className="mb-4 flex flex-wrap gap-2.5">
                  <Button
                    type="button"
                    onClick={() => {
                      if (!normalizedViewerUrl) {
                        setError("Volitelný odkaz není vyplněný.");
                        return;
                      }
                      window.open(normalizedViewerUrl, "_blank", "noopener,noreferrer");
                    }}
                    variant="primary"
                  >
                    Otevřít volitelný odkaz
                  </Button>

                  <Button type="button" onClick={handleCopyViewerLink} variant="secondary">
                    Zkopírovat odkaz
                  </Button>

                  <Button type="button" onClick={handleCopyProductionSummary} variant="secondary">
                    Zkopírovat produkční shrnutí
                  </Button>
                </div>

                <form onSubmit={handleSave}>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <FieldLabel>Stav vysílání</FieldLabel>
                      <Select value={status} onChange={(e) => setStatus(e.target.value)}>
                        {STATUS_OPTIONS.map((item) => (
                          <option key={item.value} value={item.value}>
                            {item.label}
                          </option>
                        ))}
                      </Select>
                    </div>

                    <div>
                      <FieldLabel>Začátek vysílání</FieldLabel>
                      <Input
                        type="datetime-local"
                        value={startsAt}
                        onChange={(e) => setStartsAt(e.target.value)}
                      />
                    </div>

                    <div>
                      <FieldLabel>Moderátor</FieldLabel>
                      <Input
                        type="text"
                        value={moderatorName}
                        onChange={(e) => setModeratorName(e.target.value)}
                        placeholder="Např. Simona Nováková"
                      />
                    </div>

                    <div>
                      <FieldLabel>Volitelný odkaz na vysílání</FieldLabel>
                      <Input
                        type="text"
                        value={viewerUrl}
                        onChange={(e) => setViewerUrl(e.target.value)}
                        placeholder="Není nutný — pozvánku rozešle WebMeeting"
                      />
                    </div>

                    <div>
                      <FieldLabel>Host 1</FieldLabel>
                      <Input type="text" value={guest1Name} onChange={(e) => setGuest1Name(e.target.value)} />
                    </div>

                    <div>
                      <FieldLabel>Host 2</FieldLabel>
                      <Input type="text" value={guest2Name} onChange={(e) => setGuest2Name(e.target.value)} />
                    </div>

                    <div>
                      <FieldLabel>Host 3</FieldLabel>
                      <Input type="text" value={guest3Name} onChange={(e) => setGuest3Name(e.target.value)} />
                    </div>

                    <div>
                      <FieldLabel>Host 4</FieldLabel>
                      <Input type="text" value={guest4Name} onChange={(e) => setGuest4Name(e.target.value)} />
                    </div>

                    <div>
                      <FieldLabel>Host 5</FieldLabel>
                      <Input type="text" value={guest5Name} onChange={(e) => setGuest5Name(e.target.value)} />
                    </div>

                    <div>
                      <FieldLabel>Stav záznamu</FieldLabel>
                      <Select value={recordingStatus} onChange={(e) => setRecordingStatus(e.target.value)}>
                        {RECORDING_STATUS_OPTIONS.map((item) => (
                          <option key={item.value} value={item.value}>
                            {item.label}
                          </option>
                        ))}
                      </Select>
                    </div>

                    <div className="sm:col-span-2">
                      <FieldLabel>Odkaz na záznam</FieldLabel>
                      <Input
                        type="text"
                        value={recordingUrl}
                        onChange={(e) => setRecordingUrl(e.target.value)}
                        placeholder="https://..."
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <FieldLabel>Interní poznámka</FieldLabel>
                      <Textarea
                        value={notesInternal}
                        onChange={(e) => setNotesInternal(e.target.value)}
                        rows={5}
                        className="min-h-[130px]"
                        placeholder="Technické poznámky, instrukce pro moderátora, pořadí hostů apod."
                      />
                    </div>
                  </div>

                  <div className="mt-3 text-sm text-slate-600">
                    WebMeeting rozešle přístupový odkaz příjemcům. Toto pole zachovává kompatibilitu se staršími událostmi.
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <Button type="submit" disabled={saving} variant="primary">
                      {saving ? "Ukládám..." : "Uložit vysílání"}
                    </Button>

                    <Button type="button" onClick={loadData} disabled={loading} variant="secondary">
                      Obnovit
                    </Button>
                  </div>
                </form>

                <div className="mt-7 border-t border-slate-200 pt-6">
                  <h2 className="text-xl font-black text-navy-900">Příjemci pozvánky</h2>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">
                    Vyberte osobní zájmy. Jedna osoba se ve výsledku objeví pouze jednou, i když má vybráno více zájmů. Seznam pak vložte do WebMeetingu.
                  </p>

                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    {recipientGroups.map((group) => (
                      <label key={group.slug} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2">
                        <span className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedRecipientGroups.includes(group.slug)}
                            onChange={() => {
                              setRecipients([]);
                              setSelectedRecipientGroups((current) =>
                                current.includes(group.slug)
                                  ? current.filter((slug) => slug !== group.slug)
                                  : [...current, group.slug]
                              );
                            }}
                          />
                          <span>{group.label}</span>
                        </span>
                        <span className="text-sm font-bold text-slate-500">{group.count}</span>
                      </label>
                    ))}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3">
                    <Button type="button" onClick={generateRecipients} disabled={recipientsLoading || !selectedRecipientGroups.length} variant="primary">
                      {recipientsLoading ? "Vytvářím…" : "Vytvořit seznam"}
                    </Button>
                    <Button type="button" onClick={copyRecipients} disabled={!recipients.length} variant="secondary">
                      Zkopírovat {recipients.length ? `${recipients.length} e-mailů` : "e-maily"}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </Card>
        </main>
      </div>
    </RequirePlatformAdmin>
  );
}
