import { useEffect, useMemo, useState } from "react";
import RequireAuth from "../../components/RequireAuth";
import PortalHeader from "../../components/PortalHeader";
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
  "Vstup expertů – 1. stupeň",
  "Vstup expertů – 2. stupeň",
  "Kariérní poradenství jinak",
  "Smart City klub",
  "Generace Z",
  "13. komnata VIP",
  "English Talk",
  "Senior klub",
  "Čtenářský klub – děti",
  "Čtenářský klub – dospělí",
  "Speciál",
  "Wellbeing",
  "Filmový klub",
];

function normalizeAudienceGroups(groups) {
  if (!Array.isArray(groups)) return [];
  return groups
    .map((g) => (g === "komunita" ? "Komunita" : g))
    .map((g) => String(g).trim())
    .filter(Boolean);
}

function toIsoFromDatetimeLocal(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

function toDatetimeLocalFromIso(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

function formatDateTimeCS(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString("cs-CZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function PosterThumb({ url }) {
  const [failed, setFailed] = useState(false);

  if (!url || failed) {
    return (
      <div
        style={{
          width: 120,
          height: 90,
          borderRadius: 12,
          border: "1px dashed #d1d5db",
          background: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#6b7280",
          fontWeight: 800,
          fontSize: 12,
        }}
      >
        Bez plakátu
      </div>
    );
  }

  return (
    <img
      style={{
        width: 120,
        height: 90,
        borderRadius: 12,
        objectFit: "cover",
        border: "1px solid #e5e7eb",
        background: "#f9fafb",
      }}
      src={url}
      alt=""
      onError={() => setFailed(true)}
    />
  );
}

/** Pro: profesionální "breadcrumb" ve formě tlačítek */
function AdminTopNav({ active }) {
  const baseBtn = {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 12px",
    borderRadius: 999,
    border: "1px solid #e5e7eb",
    background: "#fff",
    textDecoration: "none",
    color: "#111827",
    fontSize: 13,
    fontWeight: 900,
    lineHeight: 1,
    boxShadow: "0 1px 0 rgba(0,0,0,0.02)",
  };

  const activeBtn = {
    ...baseBtn,
    background: "#111827",
    border: "1px solid #111827",
    color: "#fff",
  };

  const btn = (key) => (active === key ? activeBtn : baseBtn);

  return (
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
      <Link href="/portal/admin-udalosti" style={btn("udalosti")}>
        Události
      </Link>
      <Link href="/portal/admin-inzerce" style={btn("inzerce")}>
        Inzerce
      </Link>
      <Link href="/portal/kalendar" style={btn("program")}>
        Program
      </Link>
      <Link href="/portal" style={btn("portal")}>
        Portál
      </Link>
    </div>
  );
}

export default function AdminUdalosti() {
  const [events, setEvents] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [title, setTitle] = useState("");
  const [startAtLocal, setStartAtLocal] = useState("");
  const [description, setDescription] = useState("");
  const [streamUrl, setStreamUrl] = useState("");
  const [worksheetUrl, setWorksheetUrl] = useState("");
  const [category, setCategory] = useState("Speciál");
  const [audienceGroups, setAudienceGroups] = useState([]);
  const [isPublished, setIsPublished] = useState(true);

  const [posterFile, setPosterFile] = useState(null);
  const [posterCaption, setPosterCaption] = useState("");
  const [posterAltText, setPosterAltText] = useState("");

  const [currentPosterPath, setCurrentPosterPath] = useState(null);
  const [currentPosterUrl, setCurrentPosterUrl] = useState(null);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const normalizedAudienceGroups = useMemo(
    () => normalizeAudienceGroups(audienceGroups),
    [audienceGroups]
  );

  async function loadEvents() {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("starts_at", { ascending: false });

    if (error) return;

    const rows = (data || []).map((e) => {
      if (e?.poster_path) {
        const { data: pub } = supabase.storage
          .from("posters")
          .getPublicUrl(e.poster_path);
        const fixedUrl = pub?.publicUrl || null;
        return { ...e, poster_url: fixedUrl || e.poster_url };
      }
      return e;
    });

    setEvents(rows);
  }

  useEffect(() => {
    loadEvents();
  }, []);

  function toggleAudience(value) {
    setAudienceGroups((prev) =>
      prev.includes(value) ? prev.filter((a) => a !== value) : [...prev, value]
    );
  }

  function resetForm() {
    setEditingId(null);
    setTitle("");
    setStartAtLocal("");
    setDescription("");
    setStreamUrl("");
    setWorksheetUrl("");
    setCategory("Speciál");
    setAudienceGroups([]);
    setIsPublished(true);

    setPosterFile(null);
    setPosterCaption("");
    setPosterAltText("");

    setCurrentPosterPath(null);
    setCurrentPosterUrl(null);
  }

  function startEdit(e) {
    setError("");
    setEditingId(e.id);

    setTitle(e.title || "");
    setStartAtLocal(toDatetimeLocalFromIso(e.starts_at || ""));
    setDescription(e.full_description || "");
    setStreamUrl(e.stream_url || "");
    setWorksheetUrl(e.worksheet_url || "");
    setCategory(e.category || "Speciál");
    setAudienceGroups(Array.isArray(e.audience_groups) ? e.audience_groups : []);
    setIsPublished(e.is_published !== false);

    setPosterFile(null);
    setPosterCaption(e.poster_caption || "");
    setPosterAltText(e.poster_alt_text || "");

    setCurrentPosterPath(e.poster_path || null);
    setCurrentPosterUrl(e.poster_url || null);

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function uploadPosterIfAny() {
    if (!posterFile)
      return { poster_path: currentPosterPath, poster_url: currentPosterUrl };

    const bucket = "posters";
    const safeName = posterFile.name.replace(/[^\w.\-]+/g, "_");
    const path = `events/${Date.now()}-${safeName}`;

    const { error: upErr } = await supabase.storage
      .from(bucket)
      .upload(path, posterFile, { upsert: true });
    if (upErr) throw upErr;

    const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path);
    const publicUrl = pub?.publicUrl || null;

    return { poster_path: path, poster_url: publicUrl };
  }

  async function saveEvent() {
    setError("");

    if (!title.trim()) return setError("Chybí název");
    if (!startAtLocal) return setError("Chybí datum a čas");

    const startsAtIso = toIsoFromDatetimeLocal(startAtLocal);
    if (!startsAtIso) return setError("Neplatné datum a čas");

    if (normalizedAudienceGroups.length === 0)
      return setError("Vyber alespoň jednu cílovou skupinu");

    setLoading(true);

    try {
      const { poster_path, poster_url } = await uploadPosterIfAny();

      const payload = {
        title: title.trim(),
        starts_at: startsAtIso,
        full_description: description || null,
        stream_url: streamUrl || null,
        worksheet_url: worksheetUrl || null,
        category: category || null,
        audience_groups: normalizedAudienceGroups,
        audience: normalizedAudienceGroups, // legacy kompatibilita jako array
        is_published: !!isPublished,
        poster_path: poster_path || null,
        poster_url: poster_url || null,
        poster_caption: posterCaption || null,
        poster_alt_text: posterAltText || null,
      };

      if (editingId) {
        const { error: updErr } = await supabase
          .from("events")
          .update(payload)
          .eq("id", editingId);
        if (updErr) throw updErr;
      } else {
        const { error: insErr } = await supabase.from("events").insert([payload]);
        if (insErr) throw insErr;
      }

      await loadEvents();
      resetForm();
    } catch (e) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  async function deleteEvent(id) {
    setError("");
    const ok = window.confirm("Opravdu smazat tuto událost?");
    if (!ok) return;

    setLoading(true);
    try {
      const { error: delErr } = await supabase.from("events").delete().eq("id", id);
      if (delErr) throw delErr;

      await loadEvents();
      if (editingId === id) resetForm();
    } catch (e) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  const card = {
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    padding: 14,
    background: "#fff",
  };

  const label = { fontWeight: 800, marginBottom: 6 };
  const input = {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid #e5e7eb",
  };

  return (
    <RequireAuth>
      <PortalHeader />

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "18px 16px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <div>
            <h1 style={{ margin: "10px 0 6px" }}>Admin – události</h1>
            <div style={{ color: "#374151" }}>Správa programu, plakátů a odkazů.</div>
          </div>

          {/* ✅ Profi tlačítka místo textu se šipkami */}
          <AdminTopNav active="udalosti" />
        </div>

        {error ? (
          <div
            style={{
              marginTop: 12,
              padding: 12,
              borderRadius: 12,
              border: "1px solid #fecaca",
              background: "#fef2f2",
            }}
          >
            <b>Chyba:</b> {error}
          </div>
        ) : null}

        {/* FORM */}
        <section style={{ ...card, marginTop: 14 }}>
          <h2 style={{ margin: "0 0 10px" }}>{editingId ? "Upravit událost" : "Nová událost"}</h2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <div style={label}>Název události*</div>
              <input
                style={{ ...input, width: "100%" }}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <div style={label}>Datum a čas (start)</div>
              <input
                style={{ ...input, width: "100%" }}
                type="datetime-local"
                value={startAtLocal}
                onChange={(e) => setStartAtLocal(e.target.value)}
              />
            </div>

            <div>
              <div style={label}>Rubrika</div>
              <select
                style={{ ...input, width: "100%" }}
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

            <div>
              <div style={label}>Publikovat</div>
              <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                />
                {isPublished ? "Ano (zobrazí se v programu)" : "Ne (skryto)"}
              </label>
            </div>

            <div>
              <div style={label}>Odkaz na vysílání</div>
              <input
                style={{ ...input, width: "100%" }}
                value={streamUrl}
                onChange={(e) => setStreamUrl(e.target.value)}
                placeholder="https://…"
              />
            </div>

            <div>
              <div style={label}>Pracovní list</div>
              <input
                style={{ ...input, width: "100%" }}
                value={worksheetUrl}
                onChange={(e) => setWorksheetUrl(e.target.value)}
                placeholder="https://…"
              />
            </div>

            <div>
              <div style={label}>
                Plakát (upload)
                {editingId && currentPosterUrl
                  ? " – aktuální zůstane, pokud nevybereš nový"
                  : ""}
              </div>
              <input
                style={{ ...input, width: "100%" }}
                type="file"
                accept="image/*"
                onChange={(e) => setPosterFile(e.target.files?.[0] || null)}
              />
            </div>

            <div>
              <div style={label}>Popisek plakátu</div>
              <input
                style={{ ...input, width: "100%" }}
                value={posterCaption}
                onChange={(e) => setPosterCaption(e.target.value)}
              />
            </div>

            <div>
              <div style={label}>Alt text plakátu</div>
              <input
                style={{ ...input, width: "100%" }}
                value={posterAltText}
                onChange={(e) => setPosterAltText(e.target.value)}
              />
            </div>
          </div>

          <div style={{ marginTop: 14 }}>
            <div style={label}>Cílové skupiny</div>
            <div
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 14,
                padding: 12,
                background: "#fff",
              }}
            >
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
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
          </div>

          <div style={{ marginTop: 14 }}>
            <div style={label}>Popis</div>
            <textarea
              style={{ ...input, width: "100%", minHeight: 120 }}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              onClick={saveEvent}
              disabled={loading}
              style={{
                padding: "12px 14px",
                borderRadius: 12,
                border: "1px solid #111827",
                background: loading ? "#9ca3af" : "#111827",
                color: "#fff",
                fontWeight: 900,
                cursor: "pointer",
              }}
            >
              {loading ? "Ukládám…" : editingId ? "Uložit změny" : "Uložit událost"}
            </button>

            {editingId ? (
              <button
                onClick={resetForm}
                disabled={loading}
                style={{
                  padding: "12px 14px",
                  borderRadius: 12,
                  border: "1px solid #e5e7eb",
                  background: "#fff",
                  color: "#111827",
                  fontWeight: 900,
                  cursor: "pointer",
                }}
              >
                Zrušit úpravy
              </button>
            ) : null}
          </div>
        </section>

        {/* LIST */}
        <section style={{ marginTop: 14 }}>
          <h2 style={{ margin: "0 0 10px" }}>Seznam událostí (nejnovější nahoře)</h2>

          <div style={{ display: "grid", gap: 12 }}>
            {events.map((e) => (
              <div
                key={e.id}
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 14,
                  padding: 12,
                  background: "#fff",
                  display: "grid",
                  gridTemplateColumns: "120px 1fr",
                  gap: 12,
                  alignItems: "start",
                }}
              >
                <PosterThumb url={e.poster_url} />

                <div>
                  <Link
                    href={`/portal/udalost/${e.id}`}
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    <div style={{ fontWeight: 900, fontSize: 16, cursor: "pointer" }}>
                      {e.title}
                    </div>
                  </Link>

                  <div style={{ marginTop: 6, color: "#374151" }}>
                    {formatDateTimeCS(e.starts_at)} &nbsp; • &nbsp; {e.category || "—"}
                  </div>

                  <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {(e.audience_groups || []).map((g) => (
                      <span
                        key={g}
                        style={{
                          fontSize: 12,
                          padding: "4px 8px",
                          borderRadius: 999,
                          background: "#f3f4f6",
                          border: "1px solid #e5e7eb",
                          fontWeight: 800,
                        }}
                      >
                        {g}
                      </span>
                    ))}
                    {e.is_published === false ? (
                      <span
                        style={{
                          fontSize: 12,
                          padding: "4px 8px",
                          borderRadius: 999,
                          background: "#fef2f2",
                          border: "1px solid #fecaca",
                          fontWeight: 900,
                        }}
                      >
                        nepublikováno
                      </span>
                    ) : null}
                  </div>

                  <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
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

                  <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <button
                      onClick={() => startEdit(e)}
                      disabled={loading}
                      style={{
                        padding: "8px 10px",
                        borderRadius: 10,
                        border: "1px solid #e5e7eb",
                        background: "#fff",
                        fontWeight: 900,
                        cursor: "pointer",
                      }}
                    >
                      Upravit
                    </button>
                    <button
                      onClick={() => deleteEvent(e.id)}
                      disabled={loading}
                      style={{
                        padding: "8px 10px",
                        borderRadius: 10,
                        border: "1px solid #fecaca",
                        background: "#fff",
                        fontWeight: 900,
                        cursor: "pointer",
                      }}
                    >
                      Smazat
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </RequireAuth>
  );
}
