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

function Pill({ children, strong }) {
  return <span className={`pill ${strong ? "pill-strong" : ""}`}>{children}</span>;
}

export default function AdminUdalosti() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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

  async function loadEvents() {
    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("events")
      .select(
        "id,title,starts_at,category,audience_groups,is_published,stream_url,worksheet_url,full_description"
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

    window.scrollTo({ top: 0, behavior: "smooth" });
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

    const payload = {
      title: t,
      starts_at,
      category,
      audience_groups: audienceGroups,
      audience,
      full_description: (fullDescription || "").trim() || null,
      stream_url: (streamUrl || "").trim() || null,
      worksheet_url: (worksheetUrl || "").trim() || null,
      is_published: !!isPublished,
    };

    if (editingId) {
      const { error: updErr } = await supabase.from("events").update(payload).eq("id", editingId);
      if (updErr) {
        setError(updErr.message);
        setSaving(false);
        return;
      }
    } else {
      const { error: insErr } = await supabase.from("events").insert([payload]);
      if (insErr) {
        setError(insErr.message);
        setSaving(false);
        return;
      }
    }

    await loadEvents();
    resetForm();
    setSaving(false);
  }

  async function handleDelete(id) {
    const ok = window.confirm("Opravdu smazat tuto událost?");
    if (!ok) return;

    setError("");
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
          <div className="sub">Vytvářej a spravuj vysílání (rubrika + pro koho + odkazy).</div>
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
              placeholder="např. Wellbeing – práce se stresem"
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

            <div style={{ marginTop: 10, display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
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
            <button className="btn" disabled={saving} type="submit" style={{ opacity: saving ? 0.7 : 1 }}>
              {saving ? "Ukládám…" : editingId ? "Uložit změny" : "Uložit událost"}
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
            {items.map((e) => (
              <div key={e.id} className="card card-pad">
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

                  <button className="btn" onClick={() => handleDelete(e.id)} type="button">
                    Smazat
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
