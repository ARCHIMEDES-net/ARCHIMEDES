import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import RequireAuth from "../../../components/RequireAuth";
import PortalHeader from "../../../components/PortalHeader";
import { supabase } from "../../../lib/supabaseClient";

/**
 * Admin – Události (ARCHIMEDES Live)
 * - CRUD pro tabulku events v Supabase
 * - Povinné: title, starts_at, audience (kvůli typickým NOT NULL constraintům)
 * - Inline jednoduchý UI styl (bez Tailwind závislosti)
 */

function toDatetimeLocalValue(dateLike) {
  // Accepts ISO string or Date; returns "YYYY-MM-DDTHH:mm"
  if (!dateLike) return "";
  const d = dateLike instanceof Date ? dateLike : new Date(dateLike);
  if (Number.isNaN(d.getTime())) return "";

  const pad = (n) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

function fromDatetimeLocalValue(value) {
  // "YYYY-MM-DDTHH:mm" => Date (local)
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d;
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

function normalizeStr(v) {
  if (v === null || v === undefined) return "";
  return String(v);
}

export default function AdminUdalosti() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const [rows, setRows] = useState([]);

  // Form state
  const [editingId, setEditingId] = useState(null);

  const [title, setTitle] = useState("");
  const [startsAtLocal, setStartsAtLocal] = useState(""); // datetime-local input
  const [audience, setAudience] = useState("");
  const [fullDescription, setFullDescription] = useState("");
  const [streamUrl, setStreamUrl] = useState("");
  const [worksheetUrl, setWorksheetUrl] = useState("");
  const [isPublished, setIsPublished] = useState(true);

  const sortedRows = useMemo(() => {
    // Published first? Keep simple: sort by starts_at DESC then created_at DESC
    const copy = Array.isArray(rows) ? [...rows] : [];
    copy.sort((a, b) => {
      const da = a?.starts_at ? new Date(a.starts_at).getTime() : 0;
      const db = b?.starts_at ? new Date(b.starts_at).getTime() : 0;
      if (db !== da) return db - da;

      const ca = a?.created_at ? new Date(a.created_at).getTime() : 0;
      const cb = b?.created_at ? new Date(b.created_at).getTime() : 0;
      return cb - ca;
    });
    return copy;
  }, [rows]);

  async function loadEvents() {
    setLoading(true);
    setError("");
    setInfo("");

    const { data, error } = await supabase
      .from("events")
      .select(
        "id,title,starts_at,audience,full_description,stream_url,worksheet_url,is_published,created_at"
      )
      .order("starts_at", { ascending: false });

    if (error) {
      setError(error.message || "Chyba načítání událostí.");
      setRows([]);
    } else {
      setRows(Array.isArray(data) ? data : []);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadEvents();
  }, []);

  function resetForm() {
    setEditingId(null);
    setTitle("");
    setStartsAtLocal("");
    setAudience("");
    setFullDescription("");
    setStreamUrl("");
    setWorksheetUrl("");
    setIsPublished(true);
    setError("");
    setInfo("");
  }

  function fillFormFromRow(r) {
    setEditingId(r.id);
    setTitle(normalizeStr(r.title));
    setStartsAtLocal(toDatetimeLocalValue(r.starts_at));
    setAudience(normalizeStr(r.audience));
    setFullDescription(normalizeStr(r.full_description));
    setStreamUrl(normalizeStr(r.stream_url));
    setWorksheetUrl(normalizeStr(r.worksheet_url));
    setIsPublished(r.is_published !== false);
    setError("");
    setInfo("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function validateForm() {
    const t = title.trim();
    const aud = audience.trim();
    const dt = fromDatetimeLocalValue(startsAtLocal);

    if (!t) return "Vyplň název události.";
    if (!startsAtLocal || !dt) return "Vyplň datum a čas (start).";
    if (!aud) return "Vyplň cílovku (audience).";
    return "";
  }

  async function saveEvent(e) {
    e.preventDefault();
    setInfo("");
    setError("");

    const v = validateForm();
    if (v) {
      setError(v);
      return;
    }

    const startsAt = fromDatetimeLocalValue(startsAtLocal);
    if (!startsAt) {
      setError("Neplatné datum a čas.");
      return;
    }

    // Payload – držíme se názvů sloupců v DB
    const payload = {
      title: title.trim(),
      starts_at: startsAt.toISOString(),
      audience: audience.trim(),
      full_description: fullDescription?.trim() || "",
      stream_url: streamUrl?.trim() || "",
      worksheet_url: worksheetUrl?.trim() || "",
      is_published: !!isPublished,
    };

    setSaving(true);

    try {
      if (editingId) {
        const { error } = await supabase
          .from("events")
          .update(payload)
          .eq("id", editingId);

        if (error) throw error;
        setInfo("Událost byla upravena.");
      } else {
        const { error } = await supabase.from("events").insert(payload);
        if (error) throw error;
        setInfo("Událost byla vytvořena.");
      }

      await loadEvents();
      resetForm();
    } catch (err) {
      setError(err?.message || "Chyba při ukládání.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteEvent(id) {
    setError("");
    setInfo("");

    const ok = window.confirm("Opravdu smazat událost? Tuto akci nelze vrátit.");
    if (!ok) return;

    try {
      const { error } = await supabase.from("events").delete().eq("id", id);
      if (error) throw error;
      setInfo("Událost byla smazána.");
      await loadEvents();
      if (editingId === id) resetForm();
    } catch (err) {
      setError(err?.message || "Chyba při mazání.");
    }
  }

  async function togglePublished(id, current) {
    setError("");
    setInfo("");
    try {
      const { error } = await supabase
        .from("events")
        .update({ is_published: !current })
        .eq("id", id);
      if (error) throw error;
      setInfo(!current ? "Událost publikována." : "Událost skryta.");
      await loadEvents();
    } catch (err) {
      setError(err?.message || "Chyba při změně publikace.");
    }
  }

  return (
    <RequireAuth>
      <PortalHeader />

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "18px 16px" }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <Link href="/portal/admin">← Zpět do adminu</Link>
          <span style={{ color: "#6b7280" }}>|</span>
          <Link href="/portal/kalendar">Kalendář</Link>
        </div>

        <h1 style={{ margin: "10px 0 6px" }}>Admin – události</h1>
        <p style={{ margin: 0, color: "#374151" }}>
          Správa vysílání a programu. Povinné: <b>Název</b>, <b>Datum a čas</b>, <b>Cílovka</b>.
        </p>

        {error ? (
          <div
            style={{
              marginTop: 12,
              padding: 12,
              border: "1px solid #fecaca",
              background: "#fef2f2",
              borderRadius: 12,
              color: "#991b1b",
              whiteSpace: "pre-wrap",
            }}
          >
            <b>Chyba:</b> {error}
          </div>
        ) : null}

        {info ? (
          <div
            style={{
              marginTop: 12,
              padding: 12,
              border: "1px solid #bbf7d0",
              background: "#f0fdf4",
              borderRadius: 12,
              color: "#166534",
              whiteSpace: "pre-wrap",
            }}
          >
            {info}
          </div>
        ) : null}

        {/* Form */}
        <section style={{ marginTop: 16 }}>
          <div style={card}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <h2 style={{ margin: 0 }}>
                {editingId ? "Upravit událost" : "Nová událost"}
              </h2>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {editingId ? (
                  <button type="button" onClick={resetForm} style={btnSecondary}>
                    Zrušit úpravy
                  </button>
                ) : null}
                <button type="button" onClick={loadEvents} style={btnSecondary} disabled={loading}>
                  Obnovit seznam
                </button>
              </div>
            </div>

            <form onSubmit={saveEvent} style={{ marginTop: 12, display: "grid", gap: 12 }}>
              <div style={grid2}>
                <Field label="Název události *">
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Např. Science On – energie"
                    style={input}
                  />
                </Field>

                <Field label="Datum a čas (starts_at) *">
                  <input
                    type="datetime-local"
                    value={startsAtLocal}
                    onChange={(e) => setStartsAtLocal(e.target.value)}
                    style={input}
                  />
                </Field>
              </div>

              <div style={grid2}>
                <Field label="Cílovka (audience) *">
                  <input
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                    placeholder="1. stupeň / 2. stupeň / senioři / komunita…"
                    style={input}
                  />
                </Field>

                <Field label="Publikovat">
                  <label style={{ display: "flex", gap: 10, alignItems: "center", padding: "10px 0" }}>
                    <input
                      type="checkbox"
                      checked={!!isPublished}
                      onChange={(e) => setIsPublished(e.target.checked)}
                    />
                    <span style={{ color: "#374151" }}>
                      {isPublished ? "Ano (viditelné v kalendáři)" : "Ne (skryté)"}
                    </span>
                  </label>
                </Field>
              </div>

              <Field label="Popis (full_description)">
                <textarea
                  value={fullDescription}
                  onChange={(e) => setFullDescription(e.target.value)}
                  placeholder="Krátký popis události, instrukce, co si připravit…"
                  style={{ ...input, minHeight: 110, resize: "vertical" }}
                />
              </Field>

              <div style={grid2}>
                <Field label="Odkaz na vysílání (stream_url)">
                  <input
                    value={streamUrl}
                    onChange={(e) => setStreamUrl(e.target.value)}
                    placeholder="https://meet.google.com/..."
                    style={input}
                  />
                </Field>

                <Field label="Pracovní list (worksheet_url)">
                  <input
                    value={worksheetUrl}
                    onChange={(e) => setWorksheetUrl(e.target.value)}
                    placeholder="https://..."
                    style={input}
                  />
                </Field>
              </div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button type="submit" style={btnPrimary} disabled={saving}>
                  {saving ? "Ukládám…" : editingId ? "Uložit změny" : "Vytvořit událost"}
                </button>
                {editingId ? (
                  <button type="button" style={btnDanger} onClick={() => deleteEvent(editingId)}>
                    Smazat
                  </button>
                ) : null}
              </div>
            </form>
          </div>
        </section>

        {/* List */}
        <section style={{ marginTop: 16 }}>
          <div style={card}>
            <h2 style={{ marginTop: 0 }}>Seznam událostí</h2>

            {loading ? <p>Načítám…</p> : null}

            {!loading && sortedRows.length === 0 ? (
              <p style={{ margin: 0, color: "#6b7280" }}>Zatím žádné události.</p>
            ) : null}

            {!loading && sortedRows.length > 0 ? (
              <div style={{ display: "grid", gap: 12 }}>
                {sortedRows.map((r) => (
                  <div key={r.id} style={rowCard}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 16 }}>{r.title}</div>
                        <div style={{ marginTop: 6, color: "#374151" }}>
                          <span>{formatDateTimeCZ(r.starts_at)}</span>
                          {r.audience ? <span> &nbsp; • &nbsp; {String(r.audience)}</span> : null}
                          <span>
                            {" "}
                            &nbsp; • &nbsp;{" "}
                            {r.is_published !== false ? (
                              <b style={{ color: "#166534" }}>publikováno</b>
                            ) : (
                              <b style={{ color: "#991b1b" }}>skryto</b>
                            )}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                        <button
                          type="button"
                          style={btnSecondary}
                          onClick={() => fillFormFromRow(r)}
                        >
                          Upravit
                        </button>

                        <button
                          type="button"
                          style={btnSecondary}
                          onClick={() => togglePublished(r.id, r.is_published !== false)}
                        >
                          {r.is_published !== false ? "Skrýt" : "Publikovat"}
                        </button>

                        <button type="button" style={btnDanger} onClick={() => deleteEvent(r.id)}>
                          Smazat
                        </button>
                      </div>
                    </div>

                    <div style={{ marginTop: 10, display: "flex", gap: 12, flexWrap: "wrap" }}>
                      {r.stream_url ? (
                        <a href={r.stream_url} target="_blank" rel="noreferrer">
                          ▶ Vysílání
                        </a>
                      ) : null}
                      {r.worksheet_url ? (
                        <a href={r.worksheet_url} target="_blank" rel="noreferrer">
                          📄 Pracovní list
                        </a>
                      ) : null}
                    </div>

                    {r.full_description ? (
                      <div style={{ marginTop: 10, color: "#374151", whiteSpace: "pre-wrap" }}>
                        {String(r.full_description)}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </section>
      </main>
    </RequireAuth>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <div style={{ fontWeight: 700, marginBottom: 6 }}>{label}</div>
      {children}
    </div>
  );
}

const card = {
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: 14,
  background: "white",
};

const rowCard = {
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  padding: 12,
  background: "white",
};

const grid2 = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 12,
};

const input = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #e5e7eb",
  outline: "none",
};

const btnPrimary = {
  padding: "10px 14px",
  borderRadius: 12,
  border: "1px solid #111827",
  background: "#111827",
  color: "white",
  cursor: "pointer",
  fontWeight: 800,
};

const btnSecondary = {
  padding: "10px 14px",
  borderRadius: 12,
  border: "1px solid #e5e7eb",
  background: "white",
  color: "#111827",
  cursor: "pointer",
  fontWeight: 700,
};

const btnDanger = {
  padding: "10px 14px",
  borderRadius: 12,
  border: "1px solid #fecaca",
  background: "#fef2f2",
  color: "#991b1b",
  cursor: "pointer",
  fontWeight: 800,
};
