import { useEffect, useMemo, useState } from "react";
import RequireAuth from "../../components/RequireAuth";
import { supabase } from "../../lib/supabaseClient";
import Link from "next/link";

const AUDIENCE_OPTIONS = [
  "1. stupeň",
  "2. stupeň",
  "Deváťáci",
  "Rodiče",
  "Učitelé",
  "Senioři",
  "Komunita",
];

const CATEGORY_OPTIONS = [
  // Školní program
  "Vstup expertů – 1. stupeň",
  "Vstup expertů – 2. stupeň",
  "Kariérní poradenství jinak",
  "Smart City klub",
  "Generace Z",
  "13. komnata VIP",
  "English Talk",

  // Komunitní program
  "Senior klub",
  "Čtenářský klub – děti",
  "Čtenářský klub – dospělí",

  // Obecné rubriky (historické)
  "Speciál",
  "Wellbeing",
  "Filmový klub",
];

function normalizeAudienceGroups(groups) {
  if (!Array.isArray(groups)) return [];
  // sjednotíme případné "komunita" -> "Komunita"
  return groups.map((g) => (g === "komunita" ? "Komunita" : g));
}

function toIsoFromDatetimeLocal(value) {
  // input datetime-local vrací "YYYY-MM-DDTHH:mm"
  // Nový Date(...) z toho udělá lokální čas; toISOString() pošle UTC.
  // Pro většinu použití s timestamptz je to OK (Supabase uloží správně jako timestamptz).
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

export default function AdminUdalosti() {
  const [events, setEvents] = useState([]);

  const [title, setTitle] = useState("");
  const [startAtLocal, setStartAtLocal] = useState(""); // datetime-local string
  const [description, setDescription] = useState("");
  const [streamUrl, setStreamUrl] = useState("");
  const [worksheetUrl, setWorksheetUrl] = useState("");
  const [category, setCategory] = useState("Speciál");

  const [audienceGroups, setAudienceGroups] = useState([]);
  const normalizedAudienceGroups = useMemo(
    () => normalizeAudienceGroups(audienceGroups),
    [audienceGroups]
  );

  // plakát
  const [posterFile, setPosterFile] = useState(null);
  const [posterCaption, setPosterCaption] = useState("");
  const [posterAltText, setPosterAltText] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadEvents() {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("starts_at", { ascending: true });

    if (!error) setEvents(data || []);
  }

  useEffect(() => {
    loadEvents();
  }, []);

  function toggleAudience(value) {
    setAudienceGroups((prev) => {
      if (prev.includes(value)) return prev.filter((a) => a !== value);
      return [...prev, value];
    });
  }

  async function uploadPosterIfAny() {
    if (!posterFile) {
      return { poster_path: null, poster_url: null };
    }

    // bucket "posters" (podle vašich Supabase query tabů)
    const bucket = "posters";
    const safeName = posterFile.name.replace(/[^\w.\-]+/g, "_");
    const path = `events/${Date.now()}-${safeName}`;

    const { error: upErr } = await supabase.storage
      .from(bucket)
      .upload(path, posterFile, { upsert: true });

    if (upErr) throw upErr;

    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    const publicUrl = data?.publicUrl || null;

    return { poster_path: path, poster_url: publicUrl };
  }

  async function saveEvent() {
    setError("");

    if (!title.trim()) {
      setError("Chybí název");
      return;
    }

    if (!startAtLocal) {
      setError("Chybí datum a čas");
      return;
    }

    const startsAtIso = toIsoFromDatetimeLocal(startAtLocal);
    if (!startsAtIso) {
      setError("Neplatné datum a čas");
      return;
    }

    if (normalizedAudienceGroups.length === 0) {
      setError("Vyber alespoň jednu cílovou skupinu");
      return;
    }

    setLoading(true);

    try {
      const { poster_path, poster_url } = await uploadPosterIfAny();

      // čitelný text do legacy audience
      const audienceText = normalizedAudienceGroups.join(", ");

      const payload = {
        title: title.trim(),

        // ✅ DB vyžaduje starts_at (NOT NULL) — uložíme obojí pro kompatibilitu
        starts_at: startsAtIso,
        start_at: startsAtIso,

        full_description: description || null,
        stream_url: streamUrl || null,
        worksheet_url: worksheetUrl || null,

        category: category || null,
        audience_groups: normalizedAudienceGroups,
        audience: audienceText,

        is_published: true,

        // plakát
        poster_path: poster_path,
        poster_url: poster_url,
        poster_caption: posterCaption || null,
        poster_alt_text: posterAltText || null,
      };

      const { error: insErr } = await supabase.from("events").insert([payload]);
      if (insErr) throw insErr;

      // reset formuláře
      setTitle("");
      setStartAtLocal("");
      setDescription("");
      setStreamUrl("");
      setWorksheetUrl("");
      setCategory("Speciál");
      setAudienceGroups([]);

      setPosterFile(null);
      setPosterCaption("");
      setPosterAltText("");

      await loadEvents();
    } catch (e) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  const styles = {
    page: { padding: 24, background: "#f6f7fb", minHeight: "100vh" },
    container: {
      maxWidth: 980,
      margin: "0 auto",
      background: "white",
      borderRadius: 12,
      padding: 24,
      boxShadow: "0 6px 24px rgba(0,0,0,0.08)",
    },
    topbar: { display: "flex", alignItems: "center", justifyContent: "space-between" },
    h1: { margin: 0, fontSize: 28 },
    link: { textDecoration: "underline" },
    error: {
      marginTop: 12,
      padding: 12,
      borderRadius: 10,
      background: "#ffecec",
      color: "#b00020",
      border: "1px solid #ffb3b3",
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 16,
      marginTop: 16,
    },
    field: { display: "flex", flexDirection: "column", gap: 6 },
    label: { fontWeight: 600 },
    input: { padding: "10px 12px", borderRadius: 10, border: "1px solid #d6d9e0" },
    textarea: { padding: "10px 12px", borderRadius: 10, border: "1px solid #d6d9e0" },
    select: { padding: "10px 12px", borderRadius: 10, border: "1px solid #d6d9e0" },
    sectionTitle: { marginTop: 18, marginBottom: 6, fontSize: 18 },
    audienceBox: {
      border: "1px solid #d6d9e0",
      borderRadius: 10,
      padding: 12,
      background: "#fafbff",
    },
    audienceGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 },
    button: {
      marginTop: 14,
      padding: "12px 14px",
      borderRadius: 12,
      border: "none",
      cursor: "pointer",
      fontWeight: 700,
    },
    list: { marginTop: 18, display: "grid", gap: 12 },
    card: {
      border: "1px solid #e3e6ee",
      borderRadius: 12,
      padding: 14,
      background: "white",
      display: "grid",
      gridTemplateColumns: "120px 1fr",
      gap: 14,
      alignItems: "start",
    },
    poster: {
      width: 120,
      height: 90,
      borderRadius: 10,
      objectFit: "cover",
      border: "1px solid #e3e6ee",
      background: "#f2f3f7",
    },
    meta: { display: "grid", gap: 6 },
    badgeRow: { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 6 },
    badge: {
      fontSize: 12,
      padding: "4px 8px",
      borderRadius: 999,
      background: "#eef2ff",
      border: "1px solid #d9e0ff",
    },
  };

  return (
    <RequireAuth>
      <div style={styles.page}>
        <div style={styles.container}>
          <div style={styles.topbar}>
            <h1 style={styles.h1}>Admin – události</h1>
            <Link href="/portal" style={styles.link}>
              ← Zpět do portálu
            </Link>
          </div>

          {error && <div style={styles.error}>Chyba: {error}</div>}

          <h2 style={{ marginTop: 18 }}>Nová událost</h2>

          <div style={styles.grid}>
            <div style={styles.field}>
              <div style={styles.label}>Název události*</div>
              <input
                style={styles.input}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Např. Generace Z – host…"
              />
            </div>

            <div style={styles.field}>
              <div style={styles.label}>Datum a čas (start)</div>
              <input
                style={styles.input}
                type="datetime-local"
                value={startAtLocal}
                onChange={(e) => setStartAtLocal(e.target.value)}
              />
            </div>

            <div style={styles.field}>
              <div style={styles.label}>Rubrika</div>
              <select
                style={styles.select}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.field}>
              <div style={styles.label}>Odkaz na vysílání</div>
              <input
                style={styles.input}
                value={streamUrl}
                onChange={(e) => setStreamUrl(e.target.value)}
                placeholder="https://…"
              />
            </div>

            <div style={styles.field}>
              <div style={styles.label}>Pracovní list</div>
              <input
                style={styles.input}
                value={worksheetUrl}
                onChange={(e) => setWorksheetUrl(e.target.value)}
                placeholder="https://…"
              />
            </div>

            <div style={styles.field}>
              <div style={styles.label}>Plakát (upload)</div>
              <input
                style={styles.input}
                type="file"
                accept="image/*"
                onChange={(e) => setPosterFile(e.target.files?.[0] || null)}
              />
            </div>

            <div style={styles.field}>
              <div style={styles.label}>Popisek plakátu</div>
              <input
                style={styles.input}
                value={posterCaption}
                onChange={(e) => setPosterCaption(e.target.value)}
                placeholder="Krátký text pod plakátem (volitelné)"
              />
            </div>

            <div style={styles.field}>
              <div style={styles.label}>Alt text plakátu</div>
              <input
                style={styles.input}
                value={posterAltText}
                onChange={(e) => setPosterAltText(e.target.value)}
                placeholder="Např. Plakát – Generace Z (volitelné)"
              />
            </div>
          </div>

          <div style={styles.sectionTitle}>Cílové skupiny</div>
          <div style={styles.audienceBox}>
            <div style={styles.audienceGrid}>
              {AUDIENCE_OPTIONS.map((a) => (
                <label key={a} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <input
                    type="checkbox"
                    checked={audienceGroups.includes(a)}
                    onChange={() => toggleAudience(a)}
                  />
                  {a}
                </label>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <div style={styles.label}>Popis</div>
            <textarea
              style={{ ...styles.textarea, width: "100%" }}
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Delší popis události…"
            />
          </div>

          <button
            onClick={saveEvent}
            disabled={loading}
            style={{
              ...styles.button,
              background: loading ? "#c9d1ff" : "#2f52ff",
              color: "white",
            }}
          >
            {loading ? "Ukládám…" : "Uložit událost"}
          </button>

          <h2 style={{ marginTop: 22 }}>Seznam událostí</h2>
          <div style={styles.list}>
            {events.map((e) => (
              <div key={e.id} style={styles.card}>
                <img
                  style={styles.poster}
                  src={e.poster_url || "/favicon.ico"}
                  alt={e.poster_alt_text || e.title || "Plakát"}
                  onError={(ev) => {
                    // fallback pokud URL nejde
                    ev.currentTarget.src = "/favicon.ico";
                  }}
                />
                <div style={styles.meta}>
                  <div style={{ fontWeight: 800, fontSize: 16 }}>{e.title}</div>
                  <div style={{ color: "#444" }}>
                    {e.starts_at || e.start_at || ""}
                  </div>
                  <div style={{ color: "#444" }}>{e.category || ""}</div>

                  <div style={styles.badgeRow}>
                    {(e.audience_groups || []).map((g) => (
                      <span key={g} style={styles.badge}>
                        {g}
                      </span>
                    ))}
                  </div>

                  {e.poster_caption ? (
                    <div style={{ marginTop: 6, color: "#555" }}>{e.poster_caption}</div>
                  ) : null}

                  <div style={{ marginTop: 6, display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {e.stream_url ? (
                      <a href={e.stream_url} target="_blank" rel="noreferrer">
                        ▶ Vysílání
                      </a>
                    ) : null}
                    {e.worksheet_url ? (
                      <a href={e.worksheet_url} target="_blank" rel="noreferrer">
                        📄 Pracovní list
                      </a>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}
