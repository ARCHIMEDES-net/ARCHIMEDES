import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

const AUDIENCE_GROUPS = ["1. stupeň", "2. stupeň", "Dospělí", "Senioři", "Komunita"];

const CATEGORIES = [
  "Kariérní poradenství",
  "Wellbeing",
  "Wellbeing story",
  "Čtenářský klub ZŠ",
  "Senior klub",
  "Čtenářský klub dospělí",
  "Vzdělávání",
  "Filmový klub",
  "Speciál",
];

const POSTERS_BUCKET = "posters";

function toDatetimeLocalValue(date) {
  const pad = (n) => String(n).padStart(2, "0");
  return (
    date.getFullYear() +
    "-" +
    pad(date.getMonth() + 1) +
    "-" +
    pad(date.getDate()) +
    "T" +
    pad(date.getHours()) +
    ":" +
    pad(date.getMinutes())
  );
}

function fromDatetimeLocalToISO(value) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

function fromIsoToDatetimeLocal(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return toDatetimeLocalValue(d);
}

function safeFileName(name) {
  return String(name || "poster")
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9._-]/g, "")
    .slice(0, 80);
}

function publicPosterUrl(poster_path) {
  if (!poster_path) return null;
  const { data } = supabase.storage.from(POSTERS_BUCKET).getPublicUrl(poster_path);
  return data?.publicUrl || null;
}

function Pill({ children, strong }) {
  return <span className={`pill ${strong ? "pill-strong" : ""}`}>{children}</span>;
}

export default function AdminUdalosti() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);

  const defaultStartsAtLocal = useMemo(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + 30);
    return toDatetimeLocalValue(d);
  }, []);

  // Form
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState("");
  const [startsAtLocal, setStartsAtLocal] = useState(defaultStartsAtLocal);
  const [category, setCategory] = useState("Speciál");
  const [audienceGroups, setAudienceGroups] = useState(["Komunita"]);
  const [fullDescription, setFullDescription] = useState("");
  const [streamUrl, setStreamUrl] = useState("");
  const [worksheetUrl, setWorksheetUrl] = useState("");
  const [isPublished, setIsPublished] = useState(true);

  // Poster
  const [posterPath, setPosterPath] = useState("");
  const [posterCaption, setPosterCaption] = useState("");
  const [posterFile, setPosterFile] = useState(null);
  const [removePoster, setRemovePoster] = useState(false);

  const posterPreviewUrl = useMemo(() => publicPosterUrl(posterPath), [posterPath]);

  async function loadEvents() {
    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("events")
      .select(
        "id,title,starts_at,category,audience_groups,is_published,stream_url,worksheet_url,full_description,poster_path,poster_caption"
      )
      .order("starts_at", { ascending: false })
      .limit(500);

    if (error) {
      setError(error.message);
      setItems([]);
    } else {
      setItems(data || []);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadEvents();
  }, []);

  function resetForm() {
    setEditingId(null);
    setTitle("");
    setStartsAtLocal(defaultStartsAtLocal);
    setCategory("Speciál");
    setAudienceGroups(["Komunita"]);
    setFullDescription("");
    setStreamUrl("");
    setWorksheetUrl("");
    setIsPublished(true);

    setPosterPath("");
    setPosterCaption("");
    setPosterFile(null);
    setRemovePoster(false);
  }

  function startEdit(e) {
    setError("");
    setEditingId(e.id);
    setTitle(e.title || "");
    setStartsAtLocal(e.starts_at ? fromIsoToDatetimeLocal(e.starts_at) : defaultStartsAtLocal);
    setCategory(e.category || "Speciál");
    setAudienceGroups(
      Array.isArray(e.audience_groups) && e.audience_groups.length ? e.audience_groups : ["Komunita"]
    );
    setFullDescription(e.full_description || "");
    setStreamUrl(e.stream_url || "");
    setWorksheetUrl(e.worksheet_url || "");
    setIsPublished(!!e.is_published);

    setPosterPath(e.poster_path || "");
    setPosterCaption(e.poster_caption || "");
    setPosterFile(null);
    setRemovePoster(false);

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function uploadPosterForEvent(eventId, file) {
    if (!eventId || !file) return null;

    setUploading(true);

    const ext = file.name?.includes(".") ? file.name.split(".").pop() : "png";
    const base = safeFileName(file.name);
    const path = `event-posters/${eventId}/${Date.now()}_${base || "poster"}.${ext}`;

    const { error: upErr } = await supabase.storage.from(POSTERS_BUCKET).upload(path, file, {
      cacheControl: "3600",
      upsert: true,
      contentType: file.type || "image/png",
    });

    setUploading(false);

    if (upErr) throw new Error(upErr.message);
    return path;
  }

  async function deletePosterIfExists(path) {
    if (!path) return;
    // v MVP ignorujeme chybu – když nejde smazat, neblokujeme admin
    try {
      await supabase.storage.from(POSTERS_BUCKET).remove([path]);
    } catch {}
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const t = (title || "").trim();
    const starts_at = fromDatetimeLocalToISO(startsAtLocal);

    if (!t) return setError("Vyplň název události.");
    if (!starts_at) return setError("Vyplň datum a čas.");
    if (!category) return setError("Vyber rubriku.");
    if (!Array.isArray(audienceGroups) || audienceGroups.length === 0) {
      return setError("Vyber alespoň jednu cílovou skupinu.");
    }

    setSaving(true);

    // kompatibilita pro starší kód: audience = audience_groups + category
    const audience = [...audienceGroups, category];

    // payload bez plakátu (ten řešíme zvlášť kvůli create-flow)
    const basePayload = {
      title: t,
      starts_at,
      category,
      audience_groups: audienceGroups,
      audience,
      full_description: (fullDescription || "").trim() || null,
      stream_url: (streamUrl || "").trim() || null,
      worksheet_url: (worksheetUrl || "").trim() || null,
      is_published: !!isPublished,
      poster_caption: (posterCaption || "").trim() || null,
    };

    try {
      if (editingId) {
        // EDIT
        let nextPosterPath = posterPath || null;

        // pokud chce odstranit plakát
        if (removePoster) {
          await deletePosterIfExists(posterPath);
          nextPosterPath = null;
        }

        // pokud vybral nový soubor → upload + nastav
        if (posterFile) {
          // volitelně smažeme starý
          await deletePosterIfExists(posterPath);
          nextPosterPath = await uploadPosterForEvent(editingId, posterFile);
        }

        const payload = {
          ...basePayload,
          poster_path: nextPosterPath,
        };

        const { error: updErr } = await supabase.from("events").update(payload).eq("id", editingId);
        if (updErr) throw new Error(updErr.message);
      } else {
        // CREATE: nejdřív insert, ať máme ID, pak upload, pak update poster_path
        const { data: created, error: insErr } = await supabase
          .from("events")
          .insert([{ ...basePayload }])
          .select("id")
          .single();

        if (insErr) throw new Error(insErr.message);

        const newId = created?.id;
        if (!newId) throw new Error("Nepodařilo se získat ID nové události.");

        let nextPosterPath = null;

        if (posterFile) {
          nextPosterPath = await uploadPosterForEvent(newId, posterFile);

          const { error: updPosterErr } = await supabase
            .from("events")
            .update({ poster_path: nextPosterPath })
            .eq("id", newId);

          if (updPosterErr) throw new Error(updPosterErr.message);
        }
      }

      await loadEvents();
      resetForm();
    } catch (err) {
      setError(err?.message || "Nastala chyba při ukládání.");
    }

    setSaving(false);
  }

  async function handleDelete(id, path) {
    const ok = window.confirm("Opravdu smazat tuto událost?");
    if (!ok) return;

    setError("");

    // nejdřív smažeme soubor (neblokuje)
    await deletePosterIfExists(path);

    const { error: delErr } = await supabase.from("events").delete().eq("id", id);
    if (delErr) {
      setError(delErr.message);
      return;
    }

    if (editingId === id) resetForm();
    await loadEvents();
  }

  return (
    <div className="container">
      <div className="topbar">
        <div>
          <h1 className="h1">Admin – události</h1>
          <div className="sub">Vytvářej a spravuj vysílání (rubrika + pro koho + odkazy + plakát).</div>
        </div>

        <div className="row">
          <Link href="/portal">
            <a className="btn">← Zpět do portálu</a>
          </Link>
          <Link href="/portal/kalendar">
            <a className="btn">Program</a>
          </Link>
        </div>
      </div>

      {error ? (
        <div className="bad">
          <b>Chyba:</b> {error}
        </div>
      ) : null}

      {/* FORM */}
      <div className="card card-pad">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}>
          <div style={{ fontWeight: 900, fontSize: 16 }}>
            {editingId ? "Upravit událost" : "Nová událost"}
          </div>

          {editingId ? (
            <button className="btn" type="button" onClick={resetForm}>
              Zrušit úpravy
            </button>
          ) : null}
        </div>

        <div className="hr" />

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
          <div>
            <label style={{ fontWeight: 800 }}>Název události*</label>
            <input
              className="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="např. Česká cesta do vesmíru"
              style={{ marginTop: 6 }}
            />
          </div>

          <div className="grid-2">
            <div>
              <label style={{ fontWeight: 800 }}>Datum a čas*</label>
              <input
                className="input"
                type="datetime-local"
                value={startsAtLocal}
                onChange={(e) => setStartsAtLocal(e.target.value)}
                style={{ marginTop: 6 }}
              />
            </div>

            <div>
              <label style={{ fontWeight: 800 }}>Rubrika*</label>
              <select
                className="select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{ marginTop: 6 }}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label style={{ fontWeight: 800 }}>Pro koho*</label>

            <div
              style={{
                marginTop: 10,
                display: "grid",
                gap: 10,
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              }}
            >
              {AUDIENCE_GROUPS.map((opt) => {
                const checked = audienceGroups.includes(opt);
                return (
                  <label
                    key={opt}
                    className="card"
                    style={{
                      padding: 12,
                      borderRadius: 14,
                      boxShadow: "none",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        if (e.target.checked) setAudienceGroups((prev) => [...prev, opt]);
                        else setAudienceGroups((prev) => prev.filter((x) => x !== opt));
                      }}
                    />
                    <span style={{ fontWeight: 700 }}>{opt}</span>
                  </label>
                );
              })}
            </div>

            <div className="small" style={{ marginTop: 8 }}>
              Ukládá se do <b>audience_groups</b> a kompatibilně i do <b>audience</b>.
            </div>
          </div>

          {/* POSTER */}
          <div className="card" style={{ padding: 14, boxShadow: "none" }}>
            <div style={{ fontWeight: 900, marginBottom: 10 }}>Plakát / pozvánka</div>

            <div className="grid-2">
              <div>
                <label style={{ fontWeight: 800 }}>Nahrát plakát (PNG/JPG)</label>
                <input
                  className="input"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPosterFile(e.target.files?.[0] || null)}
                  style={{ marginTop: 6 }}
                />
                <div className="small" style={{ marginTop: 6 }}>
                  {uploading ? "Nahrávám…" : "Soubor se uloží do Supabase Storage (bucket posters)."}
                </div>

                {editingId && posterPath ? (
                  <label className="row" style={{ marginTop: 10 }}>
                    <input
                      type="checkbox"
                      checked={removePoster}
                      onChange={(e) => setRemovePoster(e.target.checked)}
                    />
                    <span style={{ fontWeight: 800 }}>Odstranit stávající plakát</span>
                  </label>
                ) : null}
              </div>

              <div>
                <label style={{ fontWeight: 800 }}>Popisek (volitelné)</label>
                <input
                  className="input"
                  value={posterCaption}
                  onChange={(e) => setPosterCaption(e.target.value)}
                  placeholder="např. Vysílání pro 2. stupeň"
                  style={{ marginTop: 6 }}
                />

                <div style={{ marginTop: 12 }}>
                  <div className="small" style={{ marginBottom: 6 }}>
                    Náhled:
                  </div>

                  {posterPreviewUrl ? (
                    <a href={posterPreviewUrl} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
                      <img
                        src={posterPreviewUrl}
                        alt="Plakát"
                        style={{
                          width: "100%",
                          maxHeight: 220,
                          objectFit: "cover",
                          borderRadius: 14,
                          border: "1px solid rgba(11,18,32,.10)",
                        }}
                      />
                    </a>
                  ) : (
                    <div className="small">Zatím bez plakátu.</div>
                  )}
                </div>
              </div>
            </div>

            {posterPath ? (
              <div className="small" style={{ marginTop: 10 }}>
                Uloženo jako: <b>{posterPath}</b>
              </div>
            ) : null}
          </div>

          <div>
            <label style={{ fontWeight: 800 }}>Popis</label>
            <textarea
              className="textarea"
              value={fullDescription}
              onChange={(e) => setFullDescription(e.target.value)}
              rows={5}
              style={{ marginTop: 6 }}
            />
          </div>

          <div className="grid-2">
            <div>
              <label style={{ fontWeight: 800 }}>Odkaz na vysílání</label>
              <input
                className="input"
                value={streamUrl}
                onChange={(e) => setStreamUrl(e.target.value)}
                placeholder="https://meet.google.com/..."
                style={{ marginTop: 6 }}
              />
            </div>

            <div>
              <label style={{ fontWeight: 800 }}>Pracovní list</label>
              <input
                className="input"
                value={worksheetUrl}
                onChange={(e) => setWorksheetUrl(e.target.value)}
                placeholder="https://..."
                style={{ marginTop: 6 }}
              />
            </div>
          </div>

          <label className="row" style={{ marginTop: 4 }}>
            <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} />
            <span style={{ fontWeight: 800 }}>Publikovat</span>
            <span className="small">(is_published = true)</span>
          </label>

          <div className="row" style={{ justifyContent: "flex-end" }}>
            <button
              className="btn"
              disabled={saving || uploading}
              type="submit"
              style={{ opacity: saving || uploading ? 0.7 : 1 }}
            >
              {saving ? "Ukládám…" : uploading ? "Nahrávám…" : editingId ? "Uložit změny" : "Uložit událost"}
            </button>
          </div>
        </form>
      </div>

      {/* LIST */}
      <div style={{ marginTop: 16 }}>
        <div className="row" style={{ justifyContent: "space-between" }}>
          <div style={{ fontWeight: 900 }}>Seznam událostí</div>
          <button className="btn" onClick={loadEvents} disabled={loading} style={{ opacity: loading ? 0.7 : 1 }}>
            {loading ? "Načítám…" : "Obnovit"}
          </button>
        </div>

        {loading ? (
          <div className="small" style={{ marginTop: 10 }}>
            Načítám…
          </div>
        ) : items.length === 0 ? (
          <div className="card card-pad" style={{ marginTop: 10 }}>
            <div className="small">Zatím nejsou žádné události.</div>
          </div>
        ) : (
          <div style={{ marginTop: 10, display: "grid", gap: 12 }}>
            {items.map((e) => {
              const thumb = publicPosterUrl(e.poster_path);
              return (
                <div key={e.id} className="card card-pad">
                  <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                    <div style={{ width: 86, flex: "0 0 86px" }}>
                      {thumb ? (
                        <img
                          src={thumb}
                          alt="Plakát"
                          style={{
                            width: 86,
                            height: 86,
                            objectFit: "cover",
                            borderRadius: 14,
                            border: "1px solid rgba(11,18,32,.10)",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: 86,
                            height: 86,
                            borderRadius: 14,
                            border: "1px solid rgba(11,18,32,.10)",
                            background: "rgba(11,18,32,.03)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 12,
                            color: "rgba(11,18,32,.55)",
                            fontWeight: 700,
                          }}
                        >
                          bez plakátu
                        </div>
                      )}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline" }}>
                        <div style={{ fontWeight: 900, fontSize: 16 }}>{e.title}</div>
                        <div className="small">
                          {e.starts_at ? new Date(e.starts_at).toLocaleString("cs-CZ") : "—"}
                        </div>
                      </div>

                      <div className="row" style={{ marginTop: 10 }}>
                        <Pill strong>{e.category || "Speciál"}</Pill>
                        {(Array.isArray(e.audience_groups) ? e.audience_groups : []).map((g) => (
                          <Pill key={g}>{g}</Pill>
                        ))}
                        <Pill>{e.is_published ? "publikováno" : "nepublikováno"}</Pill>
                      </div>

                      <div className="row" style={{ marginTop: 12 }}>
                        <Link href={`/portal/udalost/${e.id}`}>
                          <a className="btn">Detail</a>
                        </Link>

                        <button className="btn" onClick={() => startEdit(e)} type="button">
                          Upravit
                        </button>

                        <button className="btn" onClick={() => handleDelete(e.id, e.poster_path)} type="button">
                          Smazat
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
