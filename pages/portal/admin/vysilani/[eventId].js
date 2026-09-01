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
import { isGoogleMeetUrl } from "../../../../lib/archiveRecording";
import {
  canSyncBroadcastResults,
  getBroadcastLifecycle,
} from "../../../../lib/broadcastLifecycle";
import {
  MAX_MANUAL_RECIPIENT_EMAILS,
  getInitialRecipientGroups,
  normalizeManualRecipientEmails,
  normalizeRecipientGroupCodes,
} from "../../../../lib/broadcastRecipients";
import {
  appendCleanupError,
  getPosterPublicUrl,
  removeEventOwnedPosterIfUnreferenced,
  removePosterObject,
} from "../../../../lib/posterStorage";

const AUDIENCE_OPTIONS = [
  "I. stupeň",
  "II. stupeň",
  "Učitelé",
  "Senioři",
  "Komunita",
  "Dospělí",
];

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

function normalizeAudienceGroups(groups) {
  const allowed = new Set(AUDIENCE_OPTIONS);
  return (groups || []).map(String).filter((group) => allowed.has(group));
}

function getEventAudienceGroups(event) {
  const persisted = Array.isArray(event?.audience_groups) ? event.audience_groups : [];
  if (persisted.length) return normalizeAudienceGroups(persisted);
  return normalizeAudienceGroups(String(event?.audience || "").split(",").map((item) => item.trim()));
}

function makePosterPath(file, eventId) {
  const parts = String(file?.name || "").split(".");
  const ext = (parts.length > 1 ? parts.pop() : "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const random = Math.random().toString(36).slice(2, 8);
  return `events/${eventId}/${Date.now()}-${random}.${ext}`;
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
  const [manualRecipientEmails, setManualRecipientEmails] = useState("");
  const [recipients, setRecipients] = useState([]);
  const [recipientsLoading, setRecipientsLoading] = useState(false);
  const [invitationsSending, setInvitationsSending] = useState(false);
  const [recipientsExporting, setRecipientsExporting] = useState(false);
  const [webMeetingConfigured, setWebMeetingConfigured] = useState(null);
  const [webMeetingChecking, setWebMeetingChecking] = useState(false);
  const [webMeetingCreating, setWebMeetingCreating] = useState(false);
  const [webMeetingSyncing, setWebMeetingSyncing] = useState(false);
  const [attendance, setAttendance] = useState([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);

  const [eventRow, setEventRow] = useState(null);
  const [eventTitle, setEventTitle] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventAudienceGroups, setEventAudienceGroups] = useState([]);
  const [eventIsPublished, setEventIsPublished] = useState(true);
  const [eventPosterUrl, setEventPosterUrl] = useState("");
  const [savedEventPosterUrl, setSavedEventPosterUrl] = useState("");
  const [savedEventPosterPath, setSavedEventPosterPath] = useState("");
  const [pendingPoster, setPendingPoster] = useState(null);
  const [uploadingPoster, setUploadingPoster] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [externalMeetingId, setExternalMeetingId] = useState("");
  const [providerStatus, setProviderStatus] = useState("");

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
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

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
      const posterUrl = eventData.poster_url || getPosterPublicUrl(supabase, eventData.poster_path);
      setEventTitle(eventData.title || "");
      setEventDescription(eventData.full_description || "");
      setEventAudienceGroups(getEventAudienceGroups(eventData));
      setEventIsPublished(eventData.is_published !== false);
      setEventPosterUrl(posterUrl || "");
      setSavedEventPosterUrl(posterUrl || "");
      setSavedEventPosterPath(eventData.poster_path || "");
      setPendingPoster(null);

      const session = await ensureSessionExists();

      setSessionId(session.id || "");
      setExternalMeetingId(session.external_meeting_id || "");
      setProviderStatus(session.provider_status || "");
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
      setStartsAt(toDateTimeLocalValue(eventData.starts_at || session.starts_at));
      setNotificationsEnabled(session.notifications_enabled === true);
      setManualRecipientEmails(
        Array.isArray(session.manual_recipient_emails)
          ? session.manual_recipient_emails.join("\n")
          : ""
      );
      const groups = await loadRecipientGroups();
      setSelectedRecipientGroups(
        getInitialRecipientGroups({
          event: eventData,
          availableGroups: groups,
          persistedCodes: session.recipient_group_codes,
          configured: session.recipient_groups_configured,
        })
      );
      await Promise.all([loadWebMeetingStatus(), loadAttendance()]);
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
    const groups = Array.isArray(payload) ? payload : [];
    setRecipientGroups(groups);
    return groups;
  }

  async function loadWebMeetingStatus() {
    const token = await getAccessToken();
    const response = await fetch("/api/admin/webmeeting/status", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "Nepodařilo se zjistit stav WebMeeting API.");
    setWebMeetingConfigured(Boolean(payload.configured));
    return payload;
  }

  async function loadAttendance() {
    setAttendanceLoading(true);
    try {
      const token = await getAccessToken();
      const response = await fetch(
        `/api/admin/webmeeting/attendance?eventId=${encodeURIComponent(eventId)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Seznam účastníků se nepodařilo načíst.");
      setAttendance(Array.isArray(payload.attendees) ? payload.attendees : []);
      return payload;
    } finally {
      setAttendanceLoading(false);
    }
  }

  async function testWebMeetingConnection() {
    setWebMeetingChecking(true);
    setError("");
    setMessage("");
    try {
      const token = await getAccessToken();
      const response = await fetch("/api/admin/webmeeting/status", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Spojení s WebMeeting API nefunguje.");
      setWebMeetingConfigured(Boolean(payload.configured));
      setMessage(payload.message || "Spojení s WebMeeting API funguje.");
    } catch (e) {
      setError(e.message || "Spojení s WebMeeting API se nepodařilo ověřit.");
    } finally {
      setWebMeetingChecking(false);
    }
  }

  async function createWebMeetingRoom() {
    if (externalMeetingId) {
      setError("Pro tuto událost už byla místnost ve WebMeetingu vytvořena.");
      return;
    }

    setWebMeetingCreating(true);
    setError("");
    setMessage("");
    try {
      const token = await getAccessToken();
      const response = await fetch("/api/admin/webmeeting/create-meeting", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ eventId }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Místnost se nepodařilo vytvořit.");
      await loadData();
      setExternalMeetingId(payload.meetingId || "");
      setProviderStatus("created");
      setStatus(payload.status || "scheduled");
      setMessage("Místnost byla bezpečně vytvořena ve WebMeetingu.");
    } catch (e) {
      setError(e.message || "Místnost se nepodařilo vytvořit.");
    } finally {
      setWebMeetingCreating(false);
    }
  }

  async function openModeratorEntry() {
    setError("");
    try {
      const token = await getAccessToken();
      const response = await fetch("/api/admin/webmeeting/moderator-url", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ eventId }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.url) {
        throw new Error(payload.error || "Moderátorský vstup se nepodařilo vytvořit.");
      }
      window.open(payload.url, "_blank", "noopener,noreferrer");
    } catch (e) {
      setError(e.message || "Moderátorský vstup se nepodařilo vytvořit.");
    }
  }

  async function syncWebMeetingResults() {
    setWebMeetingSyncing(true);
    setError("");
    setMessage("");
    try {
      const token = await getAccessToken();
      const response = await fetch("/api/admin/webmeeting/sync-results", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ eventId }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Výsledky vysílání se nepodařilo synchronizovat.");
      }
      await Promise.all([loadData(), loadAttendance()]);
      setMessage(
        payload.recordingFound
          ? `Synchronizace dokončena: záznam je připraven ke kontrole a docházka obsahuje ${payload.attendanceCount || 0} účastníků.`
          : `Synchronizace docházky dokončena (${payload.attendanceCount || 0} účastníků). Záznam zatím WebMeeting nevrátil.`
      );
    } catch (e) {
      setError(e.message || "Výsledky vysílání se nepodařilo synchronizovat.");
    } finally {
      setWebMeetingSyncing(false);
    }
  }

  async function generateRecipients() {
    setRecipientsLoading(true);
    setError("");
    setCopyInfo("");
    try {
      const manualRecipients = normalizeManualRecipientEmails(manualRecipientEmails);
      if (manualRecipients.invalid.length > 0) {
        throw new Error(
          `Opravte neplatné e-mailové adresy: ${manualRecipients.invalid.join(", ")}`
        );
      }
      if (
        manualRecipients.inputCount > MAX_MANUAL_RECIPIENT_EMAILS ||
        manualRecipients.emails.length > MAX_MANUAL_RECIPIENT_EMAILS
      ) {
        throw new Error(
          `Ručně lze přidat nejvýše ${MAX_MANUAL_RECIPIENT_EMAILS} e-mailových adres.`
        );
      }

      const { error: recipientSaveError } = await supabase
        .from("broadcast_sessions")
        .update({
          manual_recipient_emails: manualRecipients.emails,
          recipient_group_codes: normalizeRecipientGroupCodes(
            selectedRecipientGroups,
            recipientGroups
          ),
          recipient_groups_configured: true,
        })
        .eq("id", sessionId);
      if (recipientSaveError) throw recipientSaveError;

      const token = await getAccessToken();
      const response = await fetch("/api/admin/broadcast-recipients", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          groups: selectedRecipientGroups,
          manualEmails: manualRecipients.emails,
        }),
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

  async function sendInvitationsNow() {
    if (!externalMeetingId) {
      setError("Nejprve vytvořte místnost ve WebMeetingu.");
      return;
    }
    if (!recipients.length) {
      setError("Nejprve uložte a vytvořte aktuální seznam příjemců.");
      return;
    }

    const confirmed = window.confirm(
      `Odeslat nyní pozvánku ${recipients.length} příjemcům? WebMeeting pošle zprávu pouze dosud nepozvaným osobám.`
    );
    if (!confirmed) return;

    setInvitationsSending(true);
    setError("");
    setCopyInfo("");
    try {
      const token = await getAccessToken();
      const response = await fetch("/api/admin/webmeeting/send-invitations", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ eventId }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Pozvánky se nepodařilo odeslat.");
      }
      setCopyInfo(
        `WebMeeting zpracoval ${payload.count || recipients.length} příjemců a odeslal pozvánku dosud nepozvaným.`
      );
    } catch (e) {
      setError(e.message || "Pozvánky se nepodařilo odeslat.");
    } finally {
      setInvitationsSending(false);
    }
  }

  async function exportRecipientsToExcel() {
    if (!recipients.length) {
      setError("Nejprve uložte a vytvořte aktuální seznam příjemců.");
      return;
    }

    setRecipientsExporting(true);
    setError("");
    setCopyInfo("");
    try {
      const token = await getAccessToken();
      const response = await fetch(
        `/api/admin/webmeeting/export-participants?eventId=${encodeURIComponent(eventId)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || "Excel se nepodařilo vytvořit.");
      }

      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = downloadUrl;
      anchor.download = `archimedes-ucastnici-${String(eventId).slice(0, 8)}.xls`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(downloadUrl);
      setCopyInfo(`Excel obsahuje ${recipients.length} účastníků.`);
    } catch (e) {
      setError(e.message || "Excel se nepodařilo vytvořit.");
    } finally {
      setRecipientsExporting(false);
    }
  }

  async function handlePosterUpload(file) {
    setError("");
    setMessage("");
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Plakát musí být JPG, PNG nebo WEBP.");
      return;
    }
    if (file.size > 7 * 1024 * 1024) {
      setError("Plakát je moc velký (max 7 MB).");
      return;
    }

    setUploadingPoster(true);
    try {
      const path = makePosterPath(file, eventId);
      const { error: uploadError } = await supabase.storage.from("posters").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });
      if (uploadError) throw uploadError;

      const url = getPosterPublicUrl(supabase, path);
      if (!url) {
        const cleanup = await removePosterObject(supabase, path);
        throw new Error(
          appendCleanupError("Upload proběhl, ale nepodařilo se získat veřejnou URL.", cleanup.error)
        );
      }

      if (pendingPoster?.path) {
        const cleanup = await removePosterObject(supabase, pendingPoster.path);
        if (cleanup.error) {
          await removePosterObject(supabase, path);
          throw new Error(`Předchozí neuložený plakát se nepodařilo uklidit: ${cleanup.error.message}`);
        }
      }

      setEventPosterUrl(url);
      setPendingPoster({ path, url });
      setMessage("Plakát byl nahrán. Změnu potvrďte tlačítkem Uložit.");
    } catch (uploadError) {
      setError(uploadError?.message || "Plakát se nepodařilo nahrát.");
    } finally {
      setUploadingPoster(false);
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

      if (!operationalLocked && !eventTitle.trim()) {
        throw new Error("Vyplňte název události.");
      }
      if (!operationalLocked && eventAudienceGroups.length === 0) {
        throw new Error("Vyberte alespoň jednu cílovku události.");
      }
      if (!operationalLocked && (!startsAt || Number.isNaN(new Date(startsAt).getTime()))) {
        throw new Error("Vyplňte platné datum a čas vysílání.");
      }

      const manualRecipients = normalizeManualRecipientEmails(manualRecipientEmails);
      if (manualRecipients.invalid.length > 0) {
        throw new Error(
          `Opravte neplatné e-mailové adresy: ${manualRecipients.invalid.join(", ")}`
        );
      }
      if (
        manualRecipients.inputCount > MAX_MANUAL_RECIPIENT_EMAILS ||
        manualRecipients.emails.length > MAX_MANUAL_RECIPIENT_EMAILS
      ) {
        throw new Error(
          `Ručně lze přidat nejvýše ${MAX_MANUAL_RECIPIENT_EMAILS} e-mailových adres.`
        );
      }

      const normalizedViewerUrl = normalizeUrl(viewerUrl);
      const normalizedRecordingUrl = normalizeUrl(recordingUrl);

      if (normalizedRecordingUrl && isGoogleMeetUrl(normalizedRecordingUrl)) {
        throw new Error(
          "Google Meet je odkaz na živé vysílání. Do pole záznamu vložte až hotové video."
        );
      }

      if (normalizedRecordingUrl && recordingStatus === "none") {
        throw new Error("U vloženého záznamu vyberte jeho aktuální stav.");
      }

      if (recordingStatus === "published" && !normalizedRecordingUrl) {
        throw new Error("Publikovaný záznam musí mít vyplněný odkaz.");
      }

      if (
        notificationsEnabled &&
        selectedRecipientGroups.length === 0 &&
        manualRecipients.emails.length === 0
      ) {
        throw new Error(
          "Pro oznámení vyberte alespoň jednu skupinu příjemců nebo zadejte alespoň jednu e-mailovou adresu."
        );
      }

      const postProductionPayload = {
        recording_url: normalizedRecordingUrl || null,
        recording_status: recordingStatus,
        notes_internal: notesInternal.trim() || null,
      };

      const payload = operationalLocked
        ? postProductionPayload
        : {
            ...postProductionPayload,
            status,
            platform: "webmeeting",
            moderator_name: moderatorName.trim() || null,
            guest_1_name: guest1Name.trim() || null,
            guest_2_name: guest2Name.trim() || null,
            guest_3_name: guest3Name.trim() || null,
            guest_4_name: guest4Name.trim() || null,
            guest_5_name: guest5Name.trim() || null,
            viewer_url: normalizedViewerUrl || null,
            starts_at: startsAt ? new Date(startsAt).toISOString() : null,
            is_published: status !== "draft",
            notifications_enabled: notificationsEnabled,
            notification_delivery_policy: "in_app_only",
            manual_recipient_emails: manualRecipients.emails,
            recipient_group_codes: normalizeRecipientGroupCodes(
              selectedRecipientGroups,
              recipientGroups
            ),
            recipient_groups_configured: true,
          };

      const { error: updateError } = await supabase
        .from("broadcast_sessions")
        .update(payload)
        .eq("id", sessionId);

      if (updateError) throw updateError;

      const normalizedPosterUrl = normalizeUrl(eventPosterUrl);
      const pendingPosterIsLinked =
        Boolean(pendingPoster) && normalizeUrl(pendingPoster.url) === normalizedPosterUrl;
      const posterPath = pendingPosterIsLinked
        ? pendingPoster.path
        : normalizedPosterUrl === normalizeUrl(savedEventPosterUrl)
          ? savedEventPosterPath || null
          : null;

      const eventPatch = operationalLocked
        ? {}
        : {
            title: eventTitle.trim(),
            full_description: eventDescription.trim(),
            audience_groups: normalizeAudienceGroups(eventAudienceGroups),
            audience: normalizeAudienceGroups(eventAudienceGroups).join(", "),
            is_published: eventIsPublished,
            poster_url: normalizedPosterUrl,
            poster_path: posterPath,
            starts_at: new Date(startsAt).toISOString(),
          };

      // Starší události mohou mít odkaz používaný portálem. Pokud správce
      // nový odkaz nevyplní, existující hodnotu nemažeme.
      if (!operationalLocked && normalizedViewerUrl) eventPatch.stream_url = normalizedViewerUrl;

      if (Object.keys(eventPatch).length > 0) {
        const { error: eventUpdateError } = await supabase
          .from("events")
          .update(eventPatch)
          .eq("id", eventId);

        if (eventUpdateError) {
          const cleanup = await removePosterObject(supabase, pendingPoster?.path);
          setPendingPoster(null);
          setEventPosterUrl(savedEventPosterUrl);
          throw new Error(appendCleanupError(eventUpdateError.message, cleanup.error));
        }

        let posterCleanupWarning = "";
        if (pendingPoster && !pendingPosterIsLinked) {
          const cleanup = await removePosterObject(supabase, pendingPoster.path);
          if (cleanup.error) posterCleanupWarning = " Nový nepropojený plakát zůstal ve Storage.";
        }
        if (
          (savedEventPosterPath && savedEventPosterPath !== eventPatch.poster_path) ||
          (savedEventPosterUrl && normalizeUrl(savedEventPosterUrl) !== eventPatch.poster_url)
        ) {
          const cleanup = await removeEventOwnedPosterIfUnreferenced(supabase, {
            eventId,
            path: savedEventPosterPath,
            publicUrl: savedEventPosterUrl,
          });
          if (cleanup.error) posterCleanupWarning += " Starý plakát zůstal ve Storage.";
        }
        setPendingPoster(null);
        setSavedEventPosterUrl(eventPatch.poster_url);
        setSavedEventPosterPath(eventPatch.poster_path || "");
        setEventRow((current) => ({ ...current, ...eventPatch }));
        if (posterCleanupWarning) setCopyInfo(posterCleanupWarning.trim());
      }

      let providerSynced = false;
      if (!operationalLocked && externalMeetingId) {
        const token = await getAccessToken();
        const response = await fetch("/api/admin/webmeeting/update-meeting", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ eventId }),
        });
        const result = await response.json();
        if (!response.ok) {
          throw new Error(
            `ARCHIMEDES změnu uložil, ale WebMeeting ji nepřijal: ${
              result.error || "neznámá chyba"
            }`
          );
        }
        providerSynced = Boolean(result.synced);
      }

      setViewerUrl(normalizedViewerUrl);
      setRecordingUrl(normalizedRecordingUrl);
      setMessage(
        operationalLocked
          ? "Záznam a interní poznámka byly uloženy. Technické údaje vysílání zůstaly uzamčené."
          : providerSynced
          ? "Obsah i nastavení byly uloženy v ARCHIMEDES a propsány do WebMeetingu."
          : normalizedViewerUrl
            ? "Obsah i nastavení byly uloženy; volitelný odkaz se propsal do události."
            : "Obsah i nastavení byly uloženy. Pozvánky a přístupový odkaz rozešle WebMeeting."
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

  const lifecycle = useMemo(
    () =>
      getBroadcastLifecycle({
        startsAt: eventRow?.starts_at,
        status,
        recordingStatus,
        recordingUrl,
        providerStatus,
      }),
    [eventRow?.starts_at, status, recordingStatus, recordingUrl, providerStatus]
  );
  const operationalLocked = lifecycle !== "planned";
  const resultsSyncAvailable = canSyncBroadcastResults({ startsAt: eventRow?.starts_at });

  const statusBadge = useMemo(() => {
    if (lifecycle === "planned" && status === "scheduled") {
      return { label: "🟢 Vysílání připraveno", className: "border-emerald-200 bg-emerald-50 text-emerald-800" };
    }

    if (lifecycle === "live") {
      return { label: "🔴 Právě vysíláme", className: "border-red-200 bg-red-50 text-red-700" };
    }

    if (lifecycle === "finished") {
      return { label: "✅ Dokončeno", className: "border-blue-200 bg-blue-50 text-blue-700" };
    }

    return { label: "🟡 Vysílání rozpracováno", className: "border-yellow-200 bg-yellow-50 text-yellow-800" };
  }, [lifecycle, status]);

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
              Na jednom místě upravíte obsah události, plakát, cílovky i produkční nastavení WebMeetingu.
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
                    onClick={testWebMeetingConnection}
                    disabled={webMeetingChecking || webMeetingConfigured === false}
                    variant="secondary"
                  >
                    {webMeetingChecking ? "Ověřuji propojení…" : "Ověřit WebMeeting API"}
                  </Button>

                  <Button
                    type="button"
                    onClick={openModeratorEntry}
                    disabled={!externalMeetingId}
                    variant="secondary"
                  >
                    Vstoupit jako moderátor
                  </Button>

                  <Button
                    type="button"
                    onClick={syncWebMeetingResults}
                    disabled={
                      !externalMeetingId ||
                      webMeetingSyncing ||
                      !resultsSyncAvailable
                    }
                    title={
                      resultsSyncAvailable
                        ? undefined
                        : "Záznam a docházku lze načíst až po plánovaném začátku vysílání."
                    }
                    variant="secondary"
                  >
                    {webMeetingSyncing ? "Synchronizuji…" : "Načíst záznam a docházku"}
                  </Button>

                  <Button
                    type="button"
                    onClick={createWebMeetingRoom}
                    disabled={
                      webMeetingCreating ||
                      webMeetingConfigured !== true ||
                      Boolean(externalMeetingId)
                    }
                    variant="primary"
                  >
                    {webMeetingCreating
                      ? "Zakládám místnost…"
                      : externalMeetingId
                        ? "Místnost je založena"
                        : "Založit místnost ve WebMeetingu"}
                  </Button>

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

                <div className="mb-5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  <div>
                    API: {webMeetingConfigured === true ? "nakonfigurováno" : webMeetingConfigured === false ? "čeká na přístupové údaje" : "ověřuji"}
                  </div>
                  <div>
                    Místnost: {externalMeetingId ? `WebMeeting ID ${externalMeetingId}` : "zatím nebyla vytvořena"}
                    {providerStatus ? ` • ${providerStatus}` : ""}
                  </div>
                </div>

                <div className="mb-5 rounded-xl border border-slate-200 bg-white p-4">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h2 className="font-black text-navy-900">Docházka účastníků</h2>
                      <p className="mt-1 text-sm text-muted">
                        Účastníci, kteří vstoupili přes ARCHIMEDES. Stav přítomnosti se načítá z WebMeetingu.
                      </p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-700">
                      {attendance.length} {attendance.length === 1 ? "účastník" : "účastníků"}
                    </span>
                  </div>

                  {attendanceLoading ? (
                    <div className="text-sm text-muted">Načítám docházku…</div>
                  ) : attendance.length ? (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[680px] border-collapse text-left text-sm">
                        <thead>
                          <tr className="border-b border-slate-200 text-slate-500">
                            <th className="px-2 py-2 font-bold">Jméno</th>
                            <th className="px-2 py-2 font-bold">E-mail</th>
                            <th className="px-2 py-2 font-bold">Organizace</th>
                            <th className="px-2 py-2 font-bold">Vstup vyžádán</th>
                            <th className="px-2 py-2 font-bold">Docházka</th>
                          </tr>
                        </thead>
                        <tbody>
                          {attendance.map((item) => (
                            <tr key={item.id} className="border-b border-slate-100 last:border-0">
                              <td className="px-2 py-3 font-bold text-navy-900">{item.name}</td>
                              <td className="px-2 py-3 text-slate-700">{item.email || "—"}</td>
                              <td className="px-2 py-3 text-slate-700">{item.organization || "—"}</td>
                              <td className="px-2 py-3 text-slate-700">
                                {formatDateTimeCZ(item.joinRequestedAt)}
                              </td>
                              <td className="px-2 py-3">
                                <span
                                  className={cn(
                                    "inline-flex rounded-full px-2.5 py-1 text-xs font-bold",
                                    item.present
                                      ? "bg-emerald-100 text-emerald-800"
                                      : "bg-amber-100 text-amber-800"
                                  )}
                                >
                                  {item.present ? "Potvrzena" : "Čeká na synchronizaci"}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="rounded-lg bg-slate-50 px-3 py-3 text-sm text-muted">
                      Zatím se nepřihlásil žádný účastník přes ARCHIMEDES.
                    </div>
                  )}
                </div>

                {operationalLocked ? (
                  <Alert variant="info" className="mb-5">
                    {lifecycle === "live"
                      ? "Vysílání už začalo. Obsah události i produkční nastavení jsou uzamčené; uložit lze pouze záznam a interní poznámku."
                      : "Vysílání je dokončeno. Obsah události i produkční nastavení jsou uzamčené; upravit lze pouze záznam pro archiv a interní poznámku."}
                  </Alert>
                ) : null}

                <form onSubmit={handleSave}>
                  <section className="mb-6 rounded-xl border border-slate-200 bg-white p-4">
                    <h2 className="text-xl font-black text-navy-900">Obsah události</h2>
                    <p className="mt-1 text-sm text-muted">
                      Tyto údaje se zobrazí návštěvníkům. Název, popis a čas se při uložení synchronizují také do WebMeetingu.
                    </p>

                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <FieldLabel>Název události *</FieldLabel>
                        <Input
                          type="text"
                          value={eventTitle}
                          onChange={(event) => setEventTitle(event.target.value)}
                          disabled={operationalLocked}
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <FieldLabel>Cílovka *</FieldLabel>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                          {AUDIENCE_OPTIONS.map((audience) => (
                            <label
                              key={audience}
                              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
                            >
                              <input
                                type="checkbox"
                                checked={eventAudienceGroups.includes(audience)}
                                disabled={operationalLocked}
                                onChange={(event) =>
                                  setEventAudienceGroups((current) =>
                                    event.target.checked
                                      ? Array.from(new Set([...current, audience]))
                                      : current.filter((item) => item !== audience)
                                  )
                                }
                              />
                              <span>{audience}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="sm:col-span-2">
                        <FieldLabel>Popis události</FieldLabel>
                        <Textarea
                          value={eventDescription}
                          onChange={(event) => setEventDescription(event.target.value)}
                          rows={5}
                          className="min-h-[130px]"
                          disabled={operationalLocked}
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <FieldLabel>Plakát / cover</FieldLabel>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto]">
                          <Input
                            type="text"
                            value={eventPosterUrl}
                            onChange={(event) => setEventPosterUrl(event.target.value)}
                            placeholder="URL obrázku nebo nahrajte soubor z počítače"
                            disabled={operationalLocked}
                          />
                          <label className="inline-flex cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-[15px] font-black text-navy-900">
                            {uploadingPoster ? "Nahrávám…" : "Nahrát z PC"}
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/webp"
                              className="hidden"
                              onChange={(event) => handlePosterUpload(event.target.files?.[0])}
                              disabled={operationalLocked || uploadingPoster}
                            />
                          </label>
                        </div>
                        {eventPosterUrl ? (
                          <img
                            src={normalizeUrl(eventPosterUrl)}
                            alt="Náhled plakátu"
                            className="mt-3 h-[160px] w-[280px] rounded-xl border border-slate-200 bg-slate-50 object-cover"
                            onError={(event) => (event.currentTarget.style.display = "none")}
                          />
                        ) : null}
                      </div>

                      <label className="sm:col-span-2 flex items-center gap-2.5 font-bold text-navy-900">
                        <input
                          type="checkbox"
                          checked={eventIsPublished}
                          onChange={(event) => setEventIsPublished(event.target.checked)}
                          disabled={operationalLocked}
                        />
                        {eventIsPublished ? "Publikováno v kalendáři" : "Skryto před návštěvníky"}
                      </label>
                    </div>
                  </section>

                  <h2 className="mb-4 text-xl font-black text-navy-900">Nastavení vysílání</h2>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <FieldLabel>Stav vysílání</FieldLabel>
                      <Select
                        value={status}
                        onChange={(e) => {
                          const nextStatus = e.target.value;
                          setStatus(nextStatus);
                          if (nextStatus === "draft") setNotificationsEnabled(false);
                        }}
                        disabled={operationalLocked}
                      >
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
                        disabled={operationalLocked}
                      />
                    </div>

                    <div className="sm:col-span-2 rounded-xl border border-blue-200 bg-blue-50 p-4">
                      <label className="flex items-start gap-3 font-bold text-navy-900">
                        <input
                          type="checkbox"
                          className="mt-1 h-5 w-5"
                          checked={notificationsEnabled}
                          onChange={(event) => setNotificationsEnabled(event.target.checked)}
                          disabled={operationalLocked || status === "draft"}
                        />
                        <span>
                          Aktivovat oznámení v aplikaci
                          <span className="mt-1 block text-sm font-normal leading-relaxed text-slate-600">
                            Nové vysílání a zvolená připomenutí se zobrazí v „Co je nového“.
                            E-mail ani push se tímto nastavením neposílá; přístupový e-mail 30 minut
                            před začátkem nadále zajišťuje WebMeeting.
                          </span>
                          {status === "draft" ? (
                            <span className="mt-1 block text-xs font-semibold text-amber-700">
                              Nejprve změňte stav vysílání na Připraveno.
                            </span>
                          ) : null}
                        </span>
                      </label>
                    </div>

                    <div>
                      <FieldLabel>Moderátor</FieldLabel>
                      <Input
                        type="text"
                        value={moderatorName}
                        onChange={(e) => setModeratorName(e.target.value)}
                        placeholder="Např. Simona Nováková"
                        disabled={operationalLocked}
                      />
                    </div>

                    <div>
                      <FieldLabel>Volitelný odkaz na vysílání</FieldLabel>
                      <Input
                        type="text"
                        value={viewerUrl}
                        onChange={(e) => setViewerUrl(e.target.value)}
                        placeholder="Pouze pro starší nebo náhradní vysílání"
                        disabled={operationalLocked}
                      />
                    </div>

                    <div>
                      <FieldLabel>Host 1</FieldLabel>
                      <Input type="text" value={guest1Name} onChange={(e) => setGuest1Name(e.target.value)} disabled={operationalLocked} />
                    </div>

                    <div>
                      <FieldLabel>Host 2</FieldLabel>
                      <Input type="text" value={guest2Name} onChange={(e) => setGuest2Name(e.target.value)} disabled={operationalLocked} />
                    </div>

                    <div>
                      <FieldLabel>Host 3</FieldLabel>
                      <Input type="text" value={guest3Name} onChange={(e) => setGuest3Name(e.target.value)} disabled={operationalLocked} />
                    </div>

                    <div>
                      <FieldLabel>Host 4</FieldLabel>
                      <Input type="text" value={guest4Name} onChange={(e) => setGuest4Name(e.target.value)} disabled={operationalLocked} />
                    </div>

                    <div>
                      <FieldLabel>Host 5</FieldLabel>
                      <Input type="text" value={guest5Name} onChange={(e) => setGuest5Name(e.target.value)} disabled={operationalLocked} />
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
                      <FieldLabel>Odkaz na hotový záznam</FieldLabel>
                      <Input
                        type="text"
                        value={recordingUrl}
                        onChange={(e) => setRecordingUrl(e.target.value)}
                        placeholder="Např. https://youtu.be/..."
                      />
                      <p className="mt-1 text-xs leading-relaxed text-slate-500">
                        Nevkládejte sem Google Meet. V archivu se odkaz zobrazí až ve stavu Publikováno.
                      </p>
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
                    Pozvánku rozesílá ARCHIMEDES Live na naši stránku události. Unikátní vstupní odkaz WebMeetingu se bude generovat až po ověření přihlášeného uživatele. Toto pole slouží jen pro starší nebo náhradní vysílání.
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <Button type="submit" disabled={saving} variant="primary">
                      {saving
                        ? "Ukládám..."
                        : operationalLocked
                          ? "Uložit záznam a poznámku"
                          : "Uložit obsah a nastavení"}
                    </Button>

                    <Button type="button" onClick={loadData} disabled={loading} variant="secondary">
                      Obnovit
                    </Button>
                  </div>
                </form>

                <div className="mt-7 border-t border-slate-200 pt-6">
                  <h2 className="text-xl font-black text-navy-900">Příjemci pozvánky</h2>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">
                    Vyberte osobní zájmy nebo zadejte alespoň jednu konkrétní e-mailovou adresu. Jedna osoba se ve výsledku objeví pouze jednou, i když má vybráno více zájmů. ARCHIMEDES Live použije seznam pro vlastní pozvánky a řízení oprávněných vstupů.
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">
                    Jednoznačné zájmy jsou předvybrané podle cílovek události. Výběr vždy zkontrolujte; činnost organizace se zde nepoužívá.
                  </p>

                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    {recipientGroups.map((group) => (
                      <label key={group.slug} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2">
                        <span className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedRecipientGroups.includes(group.slug)}
                            disabled={operationalLocked}
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

                  <div className="mt-5">
                    <FieldLabel>Další ručně pozvané e-mailové adresy</FieldLabel>
                    <Textarea
                      value={manualRecipientEmails}
                      onChange={(event) => {
                        setManualRecipientEmails(event.target.value);
                        setRecipients([]);
                        setCopyInfo("");
                      }}
                      rows={4}
                      disabled={operationalLocked}
                      placeholder={"host@example.cz\npartner@example.cz"}
                    />
                    <p className="mt-1 text-xs leading-relaxed text-slate-500">
                      Adresy oddělte čárkou, středníkem, mezerou nebo novým řádkem. Přidají se k vybraným cílovým skupinám a duplicity se automaticky odstraní. Maximálně {MAX_MANUAL_RECIPIENT_EMAILS} adres.
                    </p>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3">
                    <Button
                      type="button"
                      onClick={generateRecipients}
                      disabled={
                        recipientsLoading ||
                        (!selectedRecipientGroups.length && !manualRecipientEmails.trim()) ||
                        operationalLocked
                      }
                      variant="primary"
                    >
                      {recipientsLoading ? "Ukládám a vytvářím…" : "Uložit a vytvořit seznam"}
                    </Button>
                    <Button type="button" onClick={copyRecipients} disabled={!recipients.length} variant="secondary">
                      Zkopírovat {recipients.length ? `${recipients.length} e-mailů` : "e-maily"}
                    </Button>
                    <Button
                      type="button"
                      onClick={exportRecipientsToExcel}
                      disabled={!recipients.length || recipientsExporting}
                      variant="secondary"
                    >
                      {recipientsExporting ? "Vytvářím Excel…" : "Exportovat účastníky do Excelu"}
                    </Button>
                    <Button
                      type="button"
                      onClick={sendInvitationsNow}
                      disabled={!recipients.length || !externalMeetingId || invitationsSending}
                      variant="primary"
                    >
                      {invitationsSending
                        ? "Odesílám pozvánky…"
                        : `Odeslat pozvánky nyní${recipients.length ? ` (${recipients.length})` : ""}`}
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
