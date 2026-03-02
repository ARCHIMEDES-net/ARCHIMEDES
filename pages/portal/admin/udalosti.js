// pages/portal/admin/udalosti.js

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
  const [title, setTitle] = useState("");
  const [startsAtLocal, setStartsAtLocal] = useState(defaultStartsAtLocal);

  // ✅ nové "pořádné" řízení
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
      .select("id,title,starts_at,category,audience_groups,is_published,stream_url,worksheet_url")
      .order("starts_at", { ascending: false })
      .limit(300);

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

  async function handleCreate(e) {
    e.preventDefault();
    setError("");

    const t = (title || "").trim();
    const starts_at = fromDatetimeLocalToISO(startsAtLocal);

    if (!t) return setError("Vyplň název události.");
    if (!starts_at) return setError("Vyplň datum a čas.");
    if (!category) return setError("Vyber rubriku (category).");
    if (!Array.isArray(audienceGroups) || audienceGroups.length === 0) {
      return setError("Vyber alespoň jednu skupinu (pro koho).");
    }

    setSaving(true);

    // kompatibilita: původní audience (text[]) naplníme automaticky
    // => díky tomu funguje i starší kód / exporty
    const audience = [...audienceGroups, category];

    const payload = {
      title: t,
      starts_at,
      category,
      audience_groups: audienceGroups,
      audience, // text[] v DB – vyhneme se "malformed array literal"
      full_description: (fullDescription || "").trim() || null,
      stream_url: (streamUrl || "").trim() || null,
      worksheet_url: (worksheetUrl || "").trim() || null,
      is_published: !!isPublished,
    };

    const { error: insertErr } = await supabase.from("events").insert([payload]);

    if (insertErr) {
      setError(insertErr.message);
      setSaving(false);
      return;
    }

    // Reset
    setTitle("");
    setFullDescription("");
    setStreamUrl("");
    setWorksheetUrl("");
    setIsPublished(true);
    setCategory("Speciál");
    setAudienceGroups(["Komunita"]);

    await loadEvents();
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

    await loadEvents();
  }

  return (
    <div style={{ maxWidth: 1050, margin: "0 auto", padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800 }}>Admin – události</div>
          <div style={{ opacity: 0.7 }}>
            Vytváření vysílání: <b>rubrika</b> + <b>pro koho</b> + odkazy.
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href="/portal">
            <a style={{ padding: "10px 12px", border: "1px solid #ddd", borderRadius: 10, textDecoration: "none" }}>
              ← Zpět do portálu
            </a>
          </Link>

          <Link href="/portal/kalendar">
            <a style={{ padding: "10px 12px", border: "1px solid #ddd", borderRadius: 10, textDecoration: "none" }}>
              Program (TV)
            </a>
          </Link>
        </div>
      </div>

      {error ? (
        <div style={{ marginTop: 14, padding: 12, border: "1px solid #ff4d4f", borderRadius: 12 }}>
          <b>Chyba:</b> {error}
        </div>
      ) : null}

      {/* CREATE FORM */}
      <div style={{ marginTop: 18, padding: 16, border: "1px solid #eee", borderRadius: 16 }}>
        <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 10 }}>Nová událost</div>

        <form onSubmit={handleCreate} style={{ display: "grid", gap: 12 }}>
          <div>
            <label style={{ fontWeight: 700 }}>Název události*</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="např. Wellbeing – práce se stresem"
              style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ddd", marginTop: 6 }}
            />
          </div>

          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
            <div>
              <label style={{ fontWeight: 700 }}>Datum a čas*</label>
              <input
                type="datetime-local"
                value={startsAtLocal}
                onChange={(e) => setStartsAtLocal(e.target.value)}
                style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ddd", marginTop: 6 }}
              />
            </div>

            <div>
              <label style={{ fontWeight: 700 }}>Rubrika (category)*</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ddd", marginTop: 6 }}
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
            <label style={{ fontWeight: 700 }}>Pro koho (audience_groups)*</label>
            <div style={{ marginTop: 8, display: "grid", gap: 8, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
              {AUDIENCE_GROUPS.map((opt) => {
                const checked = audienceGroups.includes(opt);
                return (
                  <label
                    key={opt}
                    style={{
                      display: "flex",
                      gap: 10,
                      alignItems: "center",
                      padding: 10,
                      border: "1px solid #eee",
                      borderRadius: 12,
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
                    <span>{opt}</span>
                  </label>
                );
              })}
            </div>
            <div style={{ opacity: 0.65, fontSize: 12, marginTop: 6 }}>
              Ukládá se do DB jako <b>audience_groups</b> (pole) a kvůli kompatibilitě i do <b>audience</b>.
            </div>
          </div>

          <div>
            <label style={{ fontWeight: 700 }}>Popis</label>
            <textarea
              value={fullDescription}
              onChange={(e) => setFullDescription(e.target.value)}
              rows={5}
              style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ddd", marginTop: 6 }}
            />
          </div>

          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
            <div>
              <label style={{ fontWeight: 700 }}>Odkaz na vysílání (stream_url)</label>
              <input
                value={streamUrl}
                onChange={(e) => setStreamUrl(e.target.value)}
                placeholder="https://meet.google.com/..."
                style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ddd", marginTop: 6 }}
              />
            </div>

            <div>
              <label style={{ fontWeight: 700 }}>Pracovní list (worksheet_url)</label>
              <input
                value={worksheetUrl}
                onChange={(e) => setWorksheetUrl(e.target.value)}
                placeholder="https://..."
                style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ddd", marginTop: 6 }}
              />
            </div>
          </div>

          <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} />
            <span>Publikovat (is_published = true)</span>
          </label>

          <button
            disabled={saving}
            style={{
              padding: "12px 14px",
              borderRadius: 12,
              border: "1px solid #ddd",
              background: saving ? "#f7f7f7" : "white",
              cursor: saving ? "not-allowed" : "pointer",
              fontWeight: 700,
            }}
          >
            {saving ? "Ukládám…" : "Uložit událost"}
          </button>
        </form>
      </div>

      {/* LIST */}
      <div style={{ marginTop: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}>
          <div style={{ fontSize: 16, fontWeight: 800 }}>Seznam událostí</div>
          <button
            onClick={loadEvents}
            disabled={loading}
            style={{
              padding: "10px 12px",
              borderRadius: 12,
              border: "1px solid #ddd",
              background: "white",
              cursor: loading ? "not-allowed" : "pointer",
              fontWeight: 700,
            }}
          >
            {loading ? "Načítám…" : "Obnovit"}
          </button>
        </div>

        {loading ? (
          <div style={{ marginTop: 10, opacity: 0.7 }}>Načítám…</div>
        ) : items.length === 0 ? (
          <div style={{ marginTop: 10, padding: 14, border: "1px solid #eee", borderRadius: 14, opacity: 0.75 }}>
            Zatím nejsou žádné události.
          </div>
        ) : (
          <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
            {items.map((e) => (
              <div key={e.id} style={{ padding: 14, border: "1px solid #eee", borderRadius: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline" }}>
                  <div style={{ fontWeight: 800 }}>{e.title}</div>
                  <div style={{ opacity: 0.75, fontSize: 13 }}>
                    {e.starts_at ? new Date(e.starts_at).toLocaleString("cs-CZ") : "—"}
                  </div>
                </div>

                <div style={{ marginTop: 6, display: "flex", gap: 8, flexWrap: "wrap", opacity: 0.9 }}>
                  <span style={{ padding: "4px 10px", border: "1px solid #eee", borderRadius: 999, fontWeight: 700 }}>
                    {e.category || "Speciál"}
                  </span>

                  {(Array.isArray(e.audience_groups) ? e.audience_groups : []).map((g) => (
                    <span key={g} style={{ padding: "4px 10px", border: "1px solid #eee", borderRadius: 999 }}>
                      {g}
                    </span>
                  ))}

                  <span style={{ padding: "4px 10px", border: "1px solid #eee", borderRadius: 999 }}>
                    {e.is_published ? "publikováno" : "nepublikováno"}
                  </span>
                </div>

                <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <Link href={`/portal/udalost/${e.id}`}>
                    <a style={{ padding: "10px 12px", border: "1px solid #ddd", borderRadius: 10, textDecoration: "none" }}>
                      Detail
                    </a>
                  </Link>

                  <button
                    onClick={() => handleDelete(e.id)}
                    style={{
                      padding: "10px 12px",
                      borderRadius: 10,
                      border: "1px solid #ddd",
                      background: "white",
                      cursor: "pointer",
                      fontWeight: 700,
                    }}
                  >
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
