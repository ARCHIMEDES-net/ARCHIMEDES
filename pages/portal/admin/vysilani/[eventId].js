import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import RequireAuth from "../../../../components/RequireAuth";
import PortalHeader from "../../../../components/PortalHeader";
import { supabase } from "../../../../lib/supabaseClient";

const STATUS_OPTIONS = [
  { value: "draft", label: "Rozpracováno" },
  { value: "scheduled", label: "Naplánováno" },
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

export default function AdminVysilaniDetailPage() {
  const router = useRouter();
  const { eventId } = router.query;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
    const { data: existing, error: existingError } = await supabase
      .from("broadcast_sessions")
      .select("*")
      .eq("event_id", eventId)
      .maybeSingle();

    if (existingError) throw existingError;
    if (existing) return existing;

    const { data: created, error: createError } = await supabase
      .from("broadcast_sessions")
      .insert([
        {
          event_id: eventId,
          status: "draft",
          platform: "google_meet",
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
      setViewerUrl(session.viewer_url || "");
      setRecordingUrl(session.recording_url || "");
      setRecordingStatus(session.recording_status || "none");
      setNotesInternal(session.notes_internal || "");
      setStartsAt(toDateTimeLocalValue(session.starts_at || eventData.starts_at));
    } catch (e) {
      setError(e.message || "Nepodařilo se načíst detail vysílání.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      if (!sessionId) {
        throw new Error("Chybí session pro tuto událost.");
      }

      if (!viewerUrl.trim()) {
        throw new Error("Vyplňte prosím Google Meet odkaz.");
      }

      const payload = {
        status,
        platform: "google_meet",
        moderator_name: moderatorName.trim() || null,
        guest_1_name: guest1Name.trim() || null,
        guest_2_name: guest2Name.trim() || null,
        guest_3_name: guest3Name.trim() || null,
        guest_4_name: guest4Name.trim() || null,
        guest_5_name: guest5Name.trim() || null,
        viewer_url: viewerUrl.trim(),
        recording_url: recordingUrl.trim() || null,
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

      setMessage("Vysílání bylo uloženo.");
    } catch (e) {
      setError(e.message || "Vysílání se nepodařilo uložit.");
    } finally {
      setSaving(false);
    }
  }

  const inputStyle = {
    width: "100%",
    minHeight: 46,
    padding: "0 14px",
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,0.14)",
    background: "#fff",
    boxSizing: "border-box",
    fontSize: 15,
  };

  const labelStyle = {
    display: "block",
    marginBottom: 8,
    fontWeight: 700,
    color: "#111827",
  };

  return (
    <RequireAuth>
      <div
        style={{
          minHeight: "100vh",
          background: "#f6f7fb",
          fontFamily:
            'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}
      >
        <PortalHeader title="Admin • vysílání" />

        <main style={{ maxWidth: 980, margin: "0 auto", padding: "34px 16px 60px" }}>
          <div style={{ marginBottom: 18 }}>
            <Link
              href="/portal/admin-udalosti"
              style={{
                display: "inline-flex",
                textDecoration: "none",
                color: "#111827",
                fontWeight: 700,
                marginBottom: 12,
              }}
            >
              ← Zpět na admin událostí
            </Link>

            <h1 style={{ margin: "0 0 8px 0", fontSize: 34 }}>Správa vysílání</h1>

            <p style={{ margin: 0, color: "rgba(0,0,0,0.68)", lineHeight: 1.6 }}>
              Jednoduchá technická karta vysílání pro Google Meet, moderátora a až 5 hostů.
            </p>
          </div>

          {eventRow ? (
            <div
              style={{
                marginBottom: 18,
                padding: 16,
                borderRadius: 16,
                background: "#fff",
                border: "1px solid rgba(0,0,0,0.08)",
                boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
              }}
            >
              <div style={{ fontSize: 14, color: "rgba(0,0,0,0.56)", marginBottom: 6 }}>
                Událost
              </div>
              <div style={{ fontWeight: 800, fontSize: 20, color: "#111827" }}>
                {eventRow.title || "Bez názvu"}
              </div>
              {eventRow.starts_at ? (
                <div style={{ marginTop: 6, color: "rgba(0,0,0,0.66)" }}>
                  Plánovaný čas: {new Date(eventRow.starts_at).toLocaleString("cs-CZ")}
                </div>
              ) : null}
            </div>
          ) : null}

          {error ? (
            <div
              style={{
                marginBottom: 16,
                padding: 12,
                borderRadius: 12,
                background: "#fff1f1",
                border: "1px solid #f2c9c9",
                color: "#a40000",
              }}
            >
              {error}
            </div>
          ) : null}

          {message ? (
            <div
              style={{
                marginBottom: 16,
                padding: 12,
                borderRadius: 12,
                background: "#eefaf0",
                border: "1px solid #cfe8d3",
                color: "#166534",
              }}
            >
              {message}
            </div>
          ) : null}

          <div
            style={{
              background: "#fff",
              borderRadius: 20,
              border: "1px solid rgba(0,0,0,0.08)",
              boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
              padding: 20,
            }}
          >
            {loading ? (
              <div>Načítám…</div>
            ) : (
              <form onSubmit={handleSave}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 16,
                  }}
                >
                  <div>
                    <label style={labelStyle}>Stav vysílání</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      style={inputStyle}
                    >
                      {STATUS_OPTIONS.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={labelStyle}>Začátek vysílání</label>
                    <input
                      type="datetime-local"
                      value={startsAt}
                      onChange={(e) => setStartsAt(e.target.value)}
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Moderátor</label>
                    <input
                      type="text"
                      value={moderatorName}
                      onChange={(e) => setModeratorName(e.target.value)}
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Google Meet odkaz*</label>
                    <input
                      type="text"
                      value={viewerUrl}
                      onChange={(e) => setViewerUrl(e.target.value)}
                      placeholder="https://meet.google.com/..."
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Host 1</label>
                    <input
                      type="text"
                      value={guest1Name}
                      onChange={(e) => setGuest1Name(e.target.value)}
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Host 2</label>
                    <input
                      type="text"
                      value={guest2Name}
                      onChange={(e) => setGuest2Name(e.target.value)}
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Host 3</label>
                    <input
                      type="text"
                      value={guest3Name}
                      onChange={(e) => setGuest3Name(e.target.value)}
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Host 4</label>
                    <input
                      type="text"
                      value={guest4Name}
                      onChange={(e) => setGuest4Name(e.target.value)}
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Host 5</label>
                    <input
                      type="text"
                      value={guest5Name}
                      onChange={(e) => setGuest5Name(e.target.value)}
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Stav záznamu</label>
                    <select
                      value={recordingStatus}
                      onChange={(e) => setRecordingStatus(e.target.value)}
                      style={inputStyle}
                    >
                      {RECORDING_STATUS_OPTIONS.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={labelStyle}>Odkaz na záznam</label>
                    <input
                      type="text"
                      value={recordingUrl}
                      onChange={(e) => setRecordingUrl(e.target.value)}
                      placeholder="https://..."
                      style={inputStyle}
                    />
                  </div>

                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={labelStyle}>Interní poznámka</label>
                    <textarea
                      value={notesInternal}
                      onChange={(e) => setNotesInternal(e.target.value)}
                      rows={5}
                      style={{
                        ...inputStyle,
                        minHeight: 130,
                        padding: 14,
                        resize: "vertical",
                      }}
                      placeholder="Technické poznámky, instrukce pro moderátora, pořadí hostů apod."
                    />
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    flexWrap: "wrap",
                    marginTop: 20,
                  }}
                >
                  <button
                    type="submit"
                    disabled={saving}
                    style={{
                      minHeight: 48,
                      padding: "0 18px",
                      borderRadius: 12,
                      border: "none",
                      background: "#111827",
                      color: "#fff",
                      fontWeight: 700,
                      cursor: saving ? "default" : "pointer",
                      opacity: saving ? 0.7 : 1,
                    }}
                  >
                    {saving ? "Ukládám..." : "Uložit vysílání"}
                  </button>

                  <button
                    type="button"
                    onClick={loadData}
                    disabled={loading}
                    style={{
                      minHeight: 48,
                      padding: "0 18px",
                      borderRadius: 12,
                      border: "1px solid rgba(0,0,0,0.12)",
                      background: "#fff",
                      color: "#111827",
                      fontWeight: 700,
                      cursor: loading ? "default" : "pointer",
                    }}
                  >
                    Obnovit
                  </button>
                </div>
              </form>
            )}
          </div>
        </main>
      </div>
    </RequireAuth>
  );
}
