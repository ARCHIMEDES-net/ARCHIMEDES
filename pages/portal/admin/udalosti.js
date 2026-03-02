import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import RequireAuth from "../../../components/RequireAuth";
import PortalHeader from "../../../components/PortalHeader";
import { supabase } from "../../../lib/supabaseClient";

/* -------------------------
   Helpers
------------------------- */

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

  if (v.startsWith("ww.")) v = "www." + v.slice(3);

  if (v.startsWith("http://") || v.startsWith("https://")) return v;

  return `https://${v}`;
}

/* -------------------------
   Component
------------------------- */

export default function AdminUdalosti() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const [rows, setRows] = useState([]);

  // form
  const [editingId, setEditingId] = useState(null);

  const [title, setTitle] = useState("");
  const [startsAtLocal, setStartsAtLocal] = useState("");
  const [audience, setAudience] = useState("");
  const [fullDescription, setFullDescription] = useState("");
  const [streamUrl, setStreamUrl] = useState("");
  const [worksheetUrl, setWorksheetUrl] = useState("");
  const [posterUrl, setPosterUrl] = useState(""); // NEW
  const [isPublished, setIsPublished] = useState(true);

  async function loadEvents() {
    setLoading(true);
    setError("");
    setInfo("");

    const { data, error } = await supabase
      .from("events")
      .select(
        "id,title,starts_at,audience,full_description,stream_url,worksheet_url,poster_url,is_published,created_at"
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
    setTitle("");
    setStartsAtLocal("");
    setAudience("");
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
    setTitle(normalizeText(r.title));
    setStartsAtLocal(toDatetimeLocalValue(r.starts_at));
    setAudience(normalizeText(r.audience));
    setFullDescription(normalizeText(r.full_description));
    setStreamUrl(normalizeText(r.stream_url));
    setWorksheetUrl(normalizeText(r.worksheet_url));
    setPosterUrl(normalizeText(r.poster_url));
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

    const payload = {
      title: title.trim(),
      starts_at: startsAt.toISOString(),
      audience: audience.trim(),
      full_description: (fullDescription || "").trim(),
      stream_url: normalizeUrl(streamUrl),
      worksheet_url: normalizeUrl(worksheetUrl),
      poster_url: normalizeUrl(posterUrl), // NEW (will keep empty if blank)
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
        <p style={{ margin: 0, color: "#374151" }}>
          Správa vysílání a programu. Povinné: <b>Název</b>, <b>Datum a čas</b>, <b>Cílovka</b>.
          Odkazy se automaticky opraví na <code>https://</code>.
        </p>

        {error ? (
          <div style={errorBox}>
            <b>Chyba:</b> {error}
          </div>
        ) : null}

        {info ? <div style={infoBox}>{info}</div> : null}

        {/* Form */}
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
                    placeholder="meet.google.com/abc-defg-hij"
                    style={input}
                  />
                </Field>

                <Field label="Pracovní list (worksheet_url)">
                  <input
                    value={worksheetUrl}
                    onChange={(e) => setWorksheetUrl(e.target.value)}
                    placeholder="www.archimedesoec.com/..."
                    style={input}
                  />
                </Field>
              </div>

              <Field label="Plakát / cover (poster_url)">
                <input
                  value={posterUrl}
                  onChange={(e) => setPosterUrl(e.target.value)}
                  placeholder="https://... (odkaz na obrázek plakátu)"
                  style={input}
                />
                     <div style={{marginTop:10}}>
  <input
    type="file"
    accept="image/*"
    onChange={async (e)=>{

      const file = e.target.files?.[0];
      if(!file) return;

      const fileName =
        Date.now()+"_"+file.name.replace(/\s+/g,"_");

      const { error } =
        await supabase.storage
        .from("posters")
        .upload(fileName,file);

      if(error){
        alert("Chyba uploadu: "+error.message);
        return;
      }

      const { data } =
        supabase.storage
        .from("posters")
        .getPublicUrl(fileName);

      setPosterUrl(data.publicUrl);

    }}
  />
</div>                <div style={{ marginTop: 8, color: "#6b7280", fontSize: 12 }}>
                  Tip: stačí veřejná URL obrázku (png/jpg/webp). Automaticky doplníme <code>https://</code>.
                </div>
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
                          <div style={{ width: 140 }}>
                            {/* simple poster preview */}
                            <img
                              src={poster}
                              alt="Plakát"
                              style={{
                                width: "100%",
                                height: 90,
                                objectFit: "cover",
                                borderRadius: 10,
                                border: "1px solid #e5e7eb",
                              }}
                              onError={(e) => {
                                // hide broken image gracefully
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          </div>
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

                            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                              <button type="button" style={btnSecondary} onClick={() => fillFormFromRow(r)}>
                                Upravit
                              </button>

                              <button
                                type="button"
                                style={btnSecondary}
                                onClick={() => togglePublished(r.id, published)}
                              >
                                {published ? "Skrýt" : "Publikovat"}
                              </button>

                              <button type="button" style={btnDanger} onClick={() => deleteEvent(r.id)}>
                                Smazat
                              </button>
                            </div>
                          </div>

                          <div style={{ marginTop: 10, display: "flex", gap: 12, flexWrap: "wrap" }}>
                            {stream ? (
                              <a href={stream} target="_blank" rel="noreferrer">
                                ▶ Vysílání
                              </a>
                            ) : null}
                            {worksheet ? (
                              <a href={worksheet} target="_blank" rel="noreferrer">
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
