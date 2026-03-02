import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import RequireAuth from "../../../components/RequireAuth";
import PortalHeader from "../../../components/PortalHeader";
import { supabase } from "../../../lib/supabaseClient";

/* =========================
   RUBRIKY (ověřené názvy)
========================= */
const RUBRICS = [
  { key: "senior", label: "Senior Klub", titlePrefix: "Senior Klub – ", aud: ["Senioři"] },
  { key: "wellbeing", label: "Wellbeing", titlePrefix: "Wellbeing – ", aud: ["Wellbeing"] },

  // v materiálech a na stránkách máte konkrétně tyto názvy:
  { key: "science_on", label: "Science On", titlePrefix: "Science On – ", aud: ["2. stupeň"] },
  { key: "czexpats", label: "Czexpats in Science", titlePrefix: "Czexpats in Science – ", aud: ["2. stupeň"] },
  { key: "smart_city", label: "Smart City Klub", titlePrefix: "Smart City Klub – ", aud: ["2. stupeň", "Smart Cities"] },
  { key: "kariera", label: "Kariérní poradenství jinak", titlePrefix: "Kariérní poradenství jinak – ", aud: ["2. stupeň", "Kariérní poradenství"] },

  { key: "lit_adult", label: "Literární klub Magnesia Litera (dospělí)", titlePrefix: "Literární klub – dospělí – ", aud: ["Komunita", "Čtenářský klub – dospělí"] },
  { key: "lit_kids", label: "Literární klub Magnesia Litera (děti)", titlePrefix: "Literární klub – děti – ", aud: ["1. stupeň", "Čtenářský klub – děti"] },

  { key: "film", label: "Filmový klub", titlePrefix: "Filmový klub – ", aud: ["Komunita", "Filmový klub"] },
  { key: "special", label: "Speciál", titlePrefix: "Speciál – ", aud: ["Speciál"] },
];

/* =========================
   Cílovky (checkbox „tabulka“)
========================= */
const AUDIENCE_OPTIONS = [
  "1. stupeň",
  "2. stupeň",
  "Senioři",
  "Komunita",
  "Wellbeing",
  "Filmový klub",
  "Čtenářský klub – děti",
  "Čtenářský klub – dospělí",
  "Smart Cities",
  "Kariérní poradenství",
  "Speciál",
];

function splitAudience(value) {
  return (value || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}
function joinAudience(list) {
  return (list || []).join(", ");
}

/* =========================
   Helpers
========================= */
function pad2(n) {
  return String(n).padStart(2, "0");
}

function toDatetimeLocalValue(dateLike) {
  if (!dateLike) return "";
  const d = new Date(dateLike);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(
    d.getHours()
  )}:${pad2(d.getMinutes())}`;
}

function fromDatetimeLocalValue(value) {
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

function normalizeText(v) {
  if (v === null || v === undefined) return "";
  return String(v);
}

function normalizeUrl(url) {
  let v = (url || "").trim();
  if (!v) return "";
  if (v.startsWith("http://") || v.startsWith("https://")) return v;
  return `https://${v}`;
}

function safeFileExt(fileName) {
  const parts = String(fileName || "").split(".");
  const ext = parts.length > 1 ? parts.pop().toLowerCase() : "";
  return ext.replace(/[^a-z0-9]/g, "");
}

function makePosterPath(file) {
  const ext = safeFileExt(file?.name) || "jpg";
  const now = new Date();
  const ym = `${now.getFullYear()}-${pad2(now.getMonth() + 1)}`;
  const rand = Math.random().toString(36).slice(2, 8);
  return `${ym}/${Date.now()}-${rand}.${ext}`;
}

/* =========================
   Page
========================= */
export default function AdminUdalosti() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPoster, setUploadingPoster] = useState(false);

  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const [rows, setRows] = useState([]);

  // form
  const [editingId, setEditingId] = useState(null);

  const [rubricKey, setRubricKey] = useState("");
  const [title, setTitle] = useState("");
  const [startsAtLocal, setStartsAtLocal] = useState("");

  // Ukládáme obojí:
  // - audience (text) kvůli zobrazení
  // - audience_groups (array) kvůli DB constraintu
  const [audienceText, setAudienceText] = useState("");
  const [audienceSelected, setAudienceSelected] = useState([]);

  const [fullDescription, setFullDescription] = useState("");
  const [streamUrl, setStreamUrl] = useState("");
  const [worksheetUrl, setWorksheetUrl] = useState("");
  const [posterUrl, setPosterUrl] = useState("");
  const [isPublished, setIsPublished] = useState(true);

  // sync: checkboxy -> text
  useEffect(() => {
    if (Array.isArray(audienceSelected)) {
      setAudienceText(joinAudience(audienceSelected));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audienceSelected]);

  // sync: text -> checkboxy (když někdo upraví ručně)
  useEffect(() => {
    const parsed = splitAudience(audienceText);
    const a = JSON.stringify(parsed);
    const b = JSON.stringify(audienceSelected);
    if (a !== b) setAudienceSelected(parsed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audienceText]);

  async function loadEvents() {
    setLoading(true);
    setError("");
    setInfo("");

    // audience_groups načítáme, ať umíme editovat i staré záznamy
    const { data, error } = await supabase
      .from("events")
      .select(
        "id,title,starts_at,audience,audience_groups,full_description,stream_url,worksheet_url,poster_url,is_published,created_at"
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

  const sortedRows = useMemo(() => {
    const copy = Array.isArray(rows) ? [...rows] : [];
    copy.sort((a, b) => {
      const ta = a?.starts_at ? new Date(a.starts_at).getTime() : 0;
      const tb = b?.starts_at ? new Date(b.starts_at).getTime() : 0;
      if (tb !== ta) return tb - ta;
      const ca = a?.created_at ? new Date(a.created_at).getTime() : 0;
      const cb = b?.created_at ? new Date(b.created_at).getTime() : 0;
      return cb - ca;
    });
    return copy;
  }, [rows]);

  function resetForm() {
    setEditingId(null);
    setRubricKey("");
    setTitle("");
    setStartsAtLocal("");
    setAudienceText("");
    setAudienceSelected([]);
    setFullDescription("");
    setStreamUrl("");
    setWorksheetUrl("");
    setPosterUrl("");
    setIsPublished(true);
    setError("");
    setInfo("");
  }

  function fillFormFromRow(r) {
    setEditingId(r.id);
    setRubricKey("");
    setTitle(normalizeText(r.title));
    setStartsAtLocal(toDatetimeLocalValue(r.starts_at));

    // primárně bereme audience_groups (array), když je, jinak odvodíme z textu
    const groups = Array.isArray(r.audience_groups) ? r.audience_groups.map(String) : [];
    const audText = normalizeText(r.audience);

    const finalGroups = groups.length ? groups : splitAudience(audText);

    setAudienceSelected(finalGroups);
    setAudienceText(groups.length ? joinAudience(finalGroups) : audText);

    setFullDescription(normalizeText(r.full_description));
    setStreamUrl(normalizeText(r.stream_url));
    setWorksheetUrl(normalizeText(r.worksheet_url));
    setPosterUrl(normalizeText(r.poster_url));
    setIsPublished(r.is_published !== false);
    setError("");
    setInfo("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function applyRubric(r) {
    setRubricKey(r.key);

    if (!title.trim() || title.trim().length < 3) {
      setTitle(r.titlePrefix);
    }

    const cur = Array.isArray(audienceSelected) ? audienceSelected : [];
    const merged = Array.from(new Set([...(cur || []), ...(r.aud || [])]));
    setAudienceSelected(merged);
    setAudienceText(joinAudience(merged));

    setInfo(`Rubrika nastavena: ${r.label}`);
  }

  function validateForm() {
    const t = title.trim();
    const dt = fromDatetimeLocalValue(startsAtLocal);

    if (!t) return "Vyplň název události.";
    if (!startsAtLocal || !dt) return "Vyplň datum a čas (start).";

    // tady hlídáme přesně to, co chce DB constraint
    if (!Array.isArray(audienceSelected) || audienceSelected.length === 0) {
      return "Vyber alespoň jednu cílovku (audience_groups nesmí být prázdné).";
    }
    return "";
  }

  async function handlePosterUpload(file) {
    setError("");
    setInfo("");
    if (!file) return;

    const okType =
      file.type === "image/jpeg" || file.type === "image/png" || file.type === "image/webp";
    if (!okType) {
      setError("Plakát musí být JPG, PNG nebo WEBP.");
      return;
    }
    if (file.size > 7 * 1024 * 1024) {
      setError("Plakát je moc velký (max 7 MB).");
      return;
    }

    setUploadingPoster(true);
    try {
      const path = makePosterPath(file);

      const { error: upErr } = await supabase.storage.from("posters").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

      if (upErr) throw upErr;

      const { data } = supabase.storage.from("posters").getPublicUrl(path);
      const url = data?.publicUrl ? String(data.publicUrl) : "";

      if (!url) {
        setError("Upload proběhl, ale nepodařilo se získat veřejnou URL.");
        return;
      }

      setPosterUrl(url);
      setInfo("Plakát nahrán. URL se vyplnila automaticky.");
    } catch (err) {
      setError(err?.message || "Chyba při nahrávání plakátu.");
    } finally {
      setUploadingPoster(false);
    }
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

    const groups = (audienceSelected || []).map(String).filter(Boolean);

    const payload = {
      title: title.trim(),
      starts_at: startsAt.toISOString(),

      // text pro přehled a kompatibilitu
      audience: audienceText.trim() || joinAudience(groups),

      // array pro DB constraint
      audience_groups: groups,

      full_description: (fullDescription || "").trim(),
      stream_url: normalizeUrl(streamUrl),
      worksheet_url: normalizeUrl(worksheetUrl),
      poster_url: normalizeUrl(posterUrl),
      is_published: !!isPublished,
    };

    setSaving(true);

    try {
      if (editingId) {
        const { error } = await supabase.from("events").update(payload).eq("id", editingId);
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

  async function togglePublished(id, currentPublished) {
    setError("");
    setInfo("");
    try {
      const { error } = await supabase
        .from("events")
        .update({ is_published: !currentPublished })
        .eq("id", id);
      if (error) throw error;
      setInfo(!currentPublished ? "Událost publikována." : "Událost skryta.");
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

        {error ? (
          <div style={errorBox}>
            <b>Chyba:</b> {error}
          </div>
        ) : null}
        {info ? <div style={infoBox}>{info}</div> : null}

        <section style={{ marginTop: 16 }}>
          <div style={card}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <h2 style={{ margin: 0 }}>{editingId ? "Upravit událost" : "Nová událost"}</h2>
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

            {/* RUBRIKY */}
            <div style={{ marginTop: 12 }}>
              <div style={{ fontWeight: 800, marginBottom: 8 }}>Rubriky</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {RUBRICS.map((r) => (
                  <button
                    key={r.key}
                    type="button"
                    onClick={() => applyRubric(r)}
                    style={{
                      padding: "8px 10px",
                      borderRadius: 999,
                      border: rubricKey === r.key ? "1px solid #111827" : "1px solid #e5e7eb",
                      background: rubricKey === r.key ? "#111827" : "white",
                      color: rubricKey === r.key ? "white" : "#111827",
                      cursor: "pointer",
                      fontWeight: 800,
                    }}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
              <div style={{ marginTop: 6, color: "#6b7280", fontSize: 13 }}>
                Kliknutím se předvyplní název a cílovka (můžeš dál upravit).
              </div>
            </div>

            <form onSubmit={saveEvent} style={{ marginTop: 12, display: "grid", gap: 12 }}>
              <div style={grid2}>
                <Field label="Název události *">
                  <input value={title} onChange={(e) => setTitle(e.target.value)} style={input} />
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
                {/* CÍLOVKA – checkbox “tabulka” */}
                <Field label="Cílovka (audience_groups) *">
                  <div style={{ display: "grid", gap: 10 }}>
                    <div style={audGrid}>
                      {AUDIENCE_OPTIONS.map((opt) => {
                        const checked = audienceSelected.includes(opt);
                        return (
                          <label key={opt} style={audCell}>
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(e) => {
                                const cur = Array.isArray(audienceSelected) ? audienceSelected : [];
                                const next = e.target.checked
                                  ? Array.from(new Set([...cur, opt]))
                                  : cur.filter((x) => x !== opt);
                                setAudienceSelected(next);
                              }}
                            />
                            <span>{opt}</span>
                          </label>
                        );
                      })}
                    </div>

                    {/* Textové pole zůstává (pro rychlou úpravu/poznámku), ale DB se řídí audience_groups */}
                    <input
                      value={audienceText}
                      onChange={(e) => setAudienceText(e.target.value)}
                      style={input}
                      placeholder="Text pro zobrazení (lze upravit)…"
                    />

                    <div style={{ color: "#6b7280", fontSize: 13 }}>
                      Pozn.: databáze vyžaduje neprázdné <b>audience_groups</b> – proto vyber aspoň jednu cílovku.
                    </div>
                  </div>
                </Field>

                <Field label="Publikovat">
                  <label style={{ display: "flex", gap: 10, alignItems: "center", padding: "10px 0" }}>
                    <input type="checkbox" checked={!!isPublished} onChange={(e) => setIsPublished(e.target.checked)} />
                    <span>{isPublished ? "Ano (viditelné v kalendáři)" : "Ne (skryté)"}</span>
                  </label>
                </Field>
              </div>

              <Field label="Popis (full_description)">
                <textarea
                  value={fullDescription}
                  onChange={(e) => setFullDescription(e.target.value)}
                  style={{ ...input, minHeight: 110, resize: "vertical" }}
                />
              </Field>

              <div style={grid2}>
                <Field label="Odkaz na vysílání (stream_url)">
                  <input value={streamUrl} onChange={(e) => setStreamUrl(e.target.value)} style={input} />
                </Field>

                <Field label="Pracovní list (worksheet_url)">
                  <input value={worksheetUrl} onChange={(e) => setWorksheetUrl(e.target.value)} style={input} />
                </Field>
              </div>

              <Field label="Plakát / cover (poster_url)">
                <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10 }}>
                  <input value={posterUrl} onChange={(e) => setPosterUrl(e.target.value)} style={input} />
                  <label style={{ ...btnSecondary, display: "inline-flex", alignItems: "center" }}>
                    {uploadingPoster ? "Nahrávám…" : "Nahrát z PC"}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      style={{ display: "none" }}
                      onChange={(e) => handlePosterUpload(e.target.files?.[0])}
                      disabled={uploadingPoster}
                    />
                  </label>
                </div>

                {posterUrl ? (
                  <div style={{ marginTop: 10 }}>
                    <img
                      src={normalizeUrl(posterUrl)}
                      alt="Plakát"
                      style={{
                        width: 260,
                        height: 140,
                        objectFit: "cover",
                        borderRadius: 12,
                        border: "1px solid #e5e7eb",
                        background: "#f9fafb",
                      }}
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                  </div>
                ) : null}
              </Field>

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

        {/* LIST */}
        <section style={{ marginTop: 16 }}>
          <div style={card}>
            <h2 style={{ marginTop: 0 }}>Seznam událostí</h2>

            {loading ? <p>Načítám…</p> : null}
            {!loading && sortedRows.length === 0 ? (
              <p style={{ margin: 0, color: "#6b7280" }}>Zatím žádné události.</p>
            ) : null}

            {!loading && sortedRows.length > 0 ? (
              <div style={{ display: "grid", gap: 12 }}>
                {sortedRows.map((r) => {
                  const published = r.is_published !== false;
                  const stream = normalizeText(r.stream_url);
                  const worksheet = normalizeText(r.worksheet_url);
                  const poster = normalizeText(r.poster_url);

                  return (
                    <div key={r.id} style={rowCard}>
                      <div style={{ display: "grid", gridTemplateColumns: poster ? "140px 1fr" : "1fr", gap: 12 }}>
                        {poster ? (
                          <img
                            src={normalizeUrl(poster)}
                            alt="Plakát"
                            style={{
                              width: 140,
                              height: 90,
                              objectFit: "cover",
                              borderRadius: 10,
                              border: "1px solid #e5e7eb",
                              background: "#f9fafb",
                            }}
                            onError={(e) => (e.currentTarget.style.display = "none")}
                          />
                        ) : null}

                        <div>
                          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                            <div>
                              <div style={{ fontWeight: 800, fontSize: 16 }}>{r.title}</div>
                              <div style={{ marginTop: 6, color: "#374151" }}>
                                <span>{formatDateTimeCZ(r.starts_at)}</span>
                                {r.audience ? <span> &nbsp; • &nbsp; {String(r.audience)}</span> : null}
                                <span>
                                  {" "}
                                  &nbsp; • &nbsp;{" "}
                                  {published ? (
                                    <b style={{ color: "#166534" }}>publikováno</b>
                                  ) : (
                                    <b style={{ color: "#991b1b" }}>skryto</b>
                                  )}
                                </span>
                              </div>
                            </div>

                            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                              <button type="button" style={btnSecondary} onClick={() => fillFormFromRow(r)}>
                                Upravit
                              </button>

                              <button type="button" style={btnSecondary} onClick={() => togglePublished(r.id, published)}>
                                {published ? "Skrýt" : "Publikovat"}
                              </button>

                              <button type="button" style={btnDanger} onClick={() => deleteEvent(r.id)}>
                                Smazat
                              </button>
                            </div>
                          </div>

                          <div style={{ marginTop: 10, display: "flex", gap: 12, flexWrap: "wrap" }}>
                            {stream ? (
                              <a href={normalizeUrl(stream)} target="_blank" rel="noreferrer">
                                ▶ Vysílání
                              </a>
                            ) : null}
                            {worksheet ? (
                              <a href={normalizeUrl(worksheet)} target="_blank" rel="noreferrer">
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
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>
        </section>
      </main>
    </RequireAuth>
  );
}

/* =========================
   UI helpers/styles
========================= */
function Field({ label, children }) {
  return (
    <div>
      <div style={{ fontWeight: 700, marginBottom: 6 }}>{label}</div>
      {children}
    </div>
  );
}

const errorBox = {
  marginTop: 12,
  padding: 12,
  border: "1px solid #fecaca",
  background: "#fef2f2",
  borderRadius: 12,
  color: "#991b1b",
  whiteSpace: "pre-wrap",
};

const infoBox = {
  marginTop: 12,
  padding: 12,
  border: "1px solid #bbf7d0",
  background: "#f0fdf4",
  borderRadius: 12,
  color: "#166534",
  whiteSpace: "pre-wrap",
};

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

const audGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 8,
  padding: 10,
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  background: "#fff",
};

const audCell = {
  display: "flex",
  gap: 10,
  alignItems: "center",
  padding: "8px 10px",
  border: "1px solid #f3f4f6",
  borderRadius: 10,
  background: "#fafafa",
};
