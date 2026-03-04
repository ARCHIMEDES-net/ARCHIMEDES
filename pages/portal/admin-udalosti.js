// pages/portal/admin-udalosti.js
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import RequireAuth from "../../components/RequireAuth";
import PortalHeader from "../../components/PortalHeader";
import { supabase } from "../../lib/supabaseClient";

const BUCKET = "posters";

/* ---------------- helpers ---------------- */

function safeDate(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function formatDateTimeCS(value) {
  const d = safeDate(value);
  if (!d) return "—";
  return d.toLocaleString("cs-CZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function toDateTimeLocalValue(value) {
  if (!value) return "";
  const d = safeDate(value);
  if (!d) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

function nextHalfHourLocalValue() {
  const d = new Date();
  d.setSeconds(0);
  d.setMilliseconds(0);
  const m = d.getMinutes();
  const add = m === 0 || m === 30 ? 0 : m < 30 ? 30 - m : 60 - m;
  d.setMinutes(m + add);

  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

function publicUrlFromPath(path) {
  if (!path) return null;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data?.publicUrl || null;
}

function normalizeAudienceValue(v) {
  if (!v) return [];
  if (Array.isArray(v)) {
    return v.map(String).map((x) => x.trim()).filter(Boolean);
  }

  const s = String(v).trim();
  if (!s) return [];

  // JSON array string
  if (s.startsWith("[") && s.endsWith("]")) {
    try {
      const parsed = JSON.parse(s);
      if (Array.isArray(parsed)) {
        return parsed.map(String).map((x) => x.trim()).filter(Boolean);
      }
    } catch (_) {}
  }

  // Postgres array string
  if (s.startsWith("{") && s.endsWith("}")) {
    const inner = s.slice(1, -1).trim();
    if (!inner) return [];
    return inner
      .split(",")
      .map((x) => x.trim().replace(/^"(.*)"$/, "$1"))
      .filter(Boolean);
  }

  // CSV fallback
  return s
    .split(",")
    .map((x) => x.trim().replace(/^"(.*)"$/, "$1"))
    .filter(Boolean);
}

function defaultAudience(audienceGroups) {
  const komunita = (audienceGroups || []).find((a) =>
    String(a?.name || "").toLowerCase().includes("komunit")
  );
  if (komunita?.name) return [komunita.name];
  if (audienceGroups?.[0]?.name) return [audienceGroups[0].name];
  return [];
}

// v řádku může být buď audience_groups nebo audience (nebo oboje)
function getRowAudience(row) {
  return normalizeAudienceValue(row?.audience_groups ?? row?.audience);
}

// Vrací true, pokud je to chyba typu "neexistuje sloupec"
function isUnknownColumnError(errMsg, columnName) {
  const s = String(errMsg || "").toLowerCase();
  return s.includes("column") && s.includes(columnName.toLowerCase()) && s.includes("does not exist");
}

// Insert odolný proti názvu sloupce audience vs audience_groups
async function insertEventWithAudience(payload, audArr) {
  // 1) zkus audience_groups
  {
    const p = { ...payload, audience_groups: audArr };
    const { data, error } = await supabase.from("events").insert(p).select("id").single();
    if (!error) return { data, error: null, used: "audience_groups" };
    if (!isUnknownColumnError(error.message, "audience_groups")) return { data: null, error, used: "audience_groups" };
  }
  // 2) fallback audience
  {
    const p = { ...payload, audience: audArr };
    const { data, error } = await supabase.from("events").insert(p).select("id").single();
    return { data, error, used: "audience" };
  }
}

// Update odolný proti názvu sloupce audience vs audience_groups
async function updateEventWithAudience(id, payload, audArr) {
  // 1) zkus audience_groups
  {
    const p = { ...payload, audience_groups: audArr };
    const { error } = await supabase.from("events").update(p).eq("id", id);
    if (!error) return { error: null, used: "audience_groups" };
    if (!isUnknownColumnError(error.message, "audience_groups")) return { error, used: "audience_groups" };
  }
  // 2) fallback audience
  {
    const p = { ...payload, audience: audArr };
    const { error } = await supabase.from("events").update(p).eq("id", id);
    return { error, used: "audience" };
  }
}

/* ---------------- component ---------------- */

export default function AdminUdalosti() {
  const [rows, setRows] = useState([]);
  const [categories, setCategories] = useState([]);
  const [audienceGroups, setAudienceGroups] = useState([]);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [editingId, setEditingId] = useState(null); // uuid nebo "NEW"
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: "",
    starts_at: "",
    category: "",
    audience: [],
    full_description: "",
    stream_url: "",
    worksheet_url: "",
    is_published: false,
    poster_file: null,
    poster_path: "",
  });

  const categoriesByName = useMemo(() => {
    const m = new Map();
    (categories || []).forEach((c) => m.set(c.name, c));
    return m;
  }, [categories]);

  const audienceByName = useMemo(() => {
    const m = new Map();
    (audienceGroups || []).forEach((a) => m.set(a.name, a));
    return m;
  }, [audienceGroups]);

  async function loadAll() {
    setLoading(true);
    setErr("");

    const [
      { data: ev, error: evErr },
      { data: cats, error: cErr },
      { data: aud, error: aErr },
    ] = await Promise.all([
      supabase.from("events").select("*").order("created_at", { ascending: false }),
      supabase.from("categories").select("*").order("sort", { ascending: true }),
      supabase.from("audience_groups").select("*").order("sort", { ascending: true }),
    ]);

    if (evErr) {
      setErr(evErr.message);
      setRows([]);
      setCategories(cats || []);
      setAudienceGroups(aud || []);
      setLoading(false);
      return;
    }
    if (cErr) setErr((prev) => prev || cErr.message);
    if (aErr) setErr((prev) => prev || aErr.message);

    setRows(ev || []);
    setCategories(cats || []);
    setAudienceGroups(aud || []);
    setLoading(false);
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pojistka pro NEW: když se audienceGroups načtou pozdě, doplníme default
  useEffect(() => {
    if (editingId !== "NEW") return;
    if (!audienceGroups?.length) return;

    setForm((p) => {
      const curr = Array.isArray(p.audience) ? p.audience : normalizeAudienceValue(p.audience);
      if (curr.length > 0) return p;
      return { ...p, audience: defaultAudience(audienceGroups) };
    });
  }, [audienceGroups, editingId]);

  function resetFormToNew(defaults = {}) {
    setForm({
      title: "",
      starts_at: nextHalfHourLocalValue(),
      category: "",
      audience: defaultAudience(audienceGroups),
      full_description: "",
      stream_url: "",
      worksheet_url: "",
      is_published: false,
      poster_file: null,
      poster_path: "",
      ...defaults,
    });
  }

  function openNew() {
    setErr("");
    setEditingId("NEW");
    resetFormToNew();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openEdit(row) {
    setErr("");
    setEditingId(row.id);

    const rawAud = getRowAudience(row);
    const cleanedAud = rawAud.filter((name) => audienceByName.has(name));
    const aud = cleanedAud.length ? cleanedAud : defaultAudience(audienceGroups);

    setForm({
      title: row.title || "",
      starts_at: toDateTimeLocalValue(row.starts_at),
      category: row.category || "",
      audience: aud,
      full_description: row.full_description || "",
      stream_url: row.stream_url || "",
      worksheet_url: row.worksheet_url || "",
      is_published: row.is_published === true,
      poster_file: null,
      poster_path: row.poster_path || "",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function closeEdit() {
    setErr("");
    setEditingId(null);
    resetFormToNew({ starts_at: "" });
  }

  function toggleAudience(name) {
    setForm((prev) => {
      const curr = Array.isArray(prev.audience) ? prev.audience : normalizeAudienceValue(prev.audience);
      const has = curr.includes(name);
      const next = has ? curr.filter((x) => x !== name) : [...curr, name];
      return { ...prev, audience: next };
    });
  }

  async function uploadPosterIfNeeded(eventIdOrNewId) {
    if (!form.poster_file) return form.poster_path || null;

    const file = form.poster_file;
    const ext = file.name.split(".").pop() || "png";
    const safeName = `${eventIdOrNewId}_${Date.now()}.${ext}`;
    const path = `events/${safeName}`;

    const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file, {
      upsert: true,
      contentType: file.type || "image/png",
    });

    if (upErr) throw new Error(`Upload plakátu selhal: ${upErr.message}`);
    return path;
  }

  function validateForm() {
    if (!form.title.trim()) throw new Error("Vyplň název události.");
    if (!form.starts_at) throw new Error("Vyplň datum a čas (starts_at).");
    if (!form.category) throw new Error("Vyber rubriku (category).");
    if (!categoriesByName.has(form.category)) {
      throw new Error("Rubrika musí být vybrána ze seznamu (categories).");
    }

    const audArr = Array.isArray(form.audience) ? form.audience : normalizeAudienceValue(form.audience);
    if (!audArr.length) throw new Error("Vyber alespoň jednu cílovku (audience).");

    for (const a of audArr) {
      if (!audienceByName.has(a)) {
        throw new Error("Cílovka musí být vybrána ze seznamu (audience_groups).");
      }
    }
  }

  async function save() {
    if (!editingId) return;

    setSaving(true);
    setErr("");

    try {
      validateForm();

      const startsISO = new Date(form.starts_at).toISOString();

      let audArr = Array.isArray(form.audience) ? form.audience : normalizeAudienceValue(form.audience);
      audArr = audArr.filter((name) => audienceByName.has(name));
      if (!audArr.length) audArr = defaultAudience(audienceGroups);
      if (!audArr.length) throw new Error("Vyber alespoň jednu cílovku (audience).");

      if (editingId === "NEW") {
        const basePayload = {
          title: form.title.trim(),
          starts_at: startsISO,
          category: form.category,
          full_description: form.full_description || "",
          stream_url: form.stream_url || "",
          worksheet_url: form.worksheet_url || "",
          is_published: !!form.is_published,
          poster_path: null,
        };

        const { data: inserted, error: insErr } = await insertEventWithAudience(basePayload, audArr);
        if (insErr) throw new Error(insErr.message);

        const newId = inserted?.id;
        const poster_path = await uploadPosterIfNeeded(newId);

        if (poster_path) {
          const { error: upErr } = await supabase.from("events").update({ poster_path }).eq("id", newId);
          if (upErr) throw new Error(upErr.message);
        }

        await loadAll();
        closeEdit();
        return;
      }

      const poster_path = await uploadPosterIfNeeded(editingId);

      const payload = {
        title: form.title.trim(),
        starts_at: startsISO,
        category: form.category,
        full_description: form.full_description || "",
        stream_url: form.stream_url || "",
        worksheet_url: form.worksheet_url || "",
        is_published: !!form.is_published,
        poster_path: poster_path || null,
      };

      const { error: upErr } = await updateEventWithAudience(editingId, payload, audArr);
      if (upErr) throw new Error(upErr.message);

      await loadAll();
      closeEdit();
    } catch (e) {
      setErr(e?.message || "Uložení selhalo.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteEvent(row) {
    if (!confirm(`Smazat událost „${row.title}“?`)) return;
    setErr("");

    try {
      const { error: delErr } = await supabase.from("events").delete().eq("id", row.id);
      if (delErr) throw new Error(delErr.message);

      if (row.poster_path) {
        await supabase.storage.from(BUCKET).remove([row.poster_path]);
      }

      await loadAll();
    } catch (e) {
      setErr(e?.message || "Mazání selhalo.");
    }
  }

  async function duplicateEvent(row) {
    if (!confirm("Duplikovat tuto událost?")) return;
    setErr("");

    try {
      let audArr = getRowAudience(row).filter((name) => audienceByName.has(name));
      if (!audArr.length) audArr = defaultAudience(audienceGroups);
      if (!audArr.length) throw new Error("Nelze duplikovat: chybí cílovka (audience).");

      const basePayload = {
        title: row.title ? `${row.title} (kopie)` : "Kopie",
        starts_at: row.starts_at,
        category: row.category,
        full_description: row.full_description || "",
        stream_url: row.stream_url || "",
        worksheet_url: row.worksheet_url || "",
        is_published: false,
        poster_path: row.poster_path || null,
      };

      const { error } = await insertEventWithAudience(basePayload, audArr);
      if (error) throw new Error(error.message);

      await loadAll();
    } catch (e) {
      setErr(e?.message || "Duplikace selhala.");
    }
  }

  const isEditing = !!editingId;

  return (
    <RequireAuth>
      <PortalHeader />

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "16px 16px 40px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
          <Link href="/portal" style={{ textDecoration: "none" }}>
            ← Zpět do portálu
          </Link>
          <span style={{ opacity: 0.5 }}>|</span>
          <Link href="/portal/kalendar" style={{ textDecoration: "none" }}>
            Kalendář
          </Link>

          <div style={{ marginLeft: "auto", display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              onClick={openNew}
              style={{
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid rgba(0,0,0,0.18)",
                background: "black",
                color: "white",
                cursor: "pointer",
              }}
            >
              ➕ Nová událost
            </button>
          </div>
        </div>

        <h1 style={{ margin: "8px 0 14px", fontSize: 22 }}>Admin – události</h1>

        {err ? (
          <div
            style={{
              background: "#fff3f3",
              border: "1px solid #ffd0d0",
              padding: 12,
              borderRadius: 12,
              marginBottom: 14,
              color: "#8a1f1f",
              whiteSpace: "pre-wrap",
            }}
          >
            Chyba: {err}
          </div>
        ) : null}

        {/* EDIT PANEL */}
        {isEditing ? (
          <div
            style={{
              border: "1px solid rgba(0,0,0,0.12)",
              borderRadius: 16,
              padding: 16,
              marginBottom: 18,
              background: "white",
              boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
              <h2 style={{ margin: 0, fontSize: 18 }}>
                {editingId === "NEW" ? "Nová událost" : "Upravit událost"}
              </h2>
              <button
                onClick={closeEdit}
                disabled={saving}
                style={{
                  padding: "8px 12px",
                  borderRadius: 12,
                  border: "1px solid rgba(0,0,0,0.15)",
                  background: "white",
                  cursor: saving ? "not-allowed" : "pointer",
                }}
              >
                Zavřít
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
              <label style={{ display: "grid", gap: 6 }}>
                <span>Název události*</span>
                <input
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  style={{ padding: 10, borderRadius: 12, border: "1px solid rgba(0,0,0,0.18)" }}
                />
              </label>

              <label style={{ display: "grid", gap: 6 }}>
                <span>Datum a čas (starts_at)*</span>
                <input
                  type="datetime-local"
                  value={form.starts_at}
                  onChange={(e) => setForm((p) => ({ ...p, starts_at: e.target.value }))}
                  style={{ padding: 10, borderRadius: 12, border: "1px solid rgba(0,0,0,0.18)" }}
                />
              </label>

              <label style={{ display: "grid", gap: 6 }}>
                <span>Rubrika (category)*</span>
                <select
                  value={form.category}
                  onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                  style={{
                    padding: 10,
                    borderRadius: 12,
                    border: "1px solid rgba(0,0,0,0.18)",
                    background: "white",
                  }}
                >
                  <option value="">— vyber —</option>
                  {categories.map((c) => (
                    <option key={c.id ?? c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>

              <label style={{ display: "grid", gap: 6 }}>
                <span>Publikovat</span>
                <select
                  value={form.is_published ? "1" : "0"}
                  onChange={(e) => setForm((p) => ({ ...p, is_published: e.target.value === "1" }))}
                  style={{
                    padding: 10,
                    borderRadius: 12,
                    border: "1px solid rgba(0,0,0,0.18)",
                    background: "white",
                  }}
                >
                  <option value="1">Ano (vidí se v programu)</option>
                  <option value="0">Ne (koncept)</option>
                </select>
              </label>
            </div>

            <div style={{ marginTop: 12 }}>
              <div style={{ marginBottom: 8 }}>Cílovka (audience)*</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {audienceGroups.map((a) => {
                  const activeArr = Array.isArray(form.audience)
                    ? form.audience
                    : normalizeAudienceValue(form.audience);
                  const active = activeArr.includes(a.name);

                  return (
                    <button
                      key={a.id ?? a.name}
                      type="button"
                      onClick={() => toggleAudience(a.name)}
                      style={{
                        padding: "8px 10px",
                        borderRadius: 999,
                        border: "1px solid rgba(0,0,0,0.18)",
                        background: active ? "rgba(0,0,0,0.10)" : "white",
                        cursor: "pointer",
                      }}
                    >
                      {a.name}
                    </button>
                  );
                })}
              </div>
              <div style={{ marginTop: 6, fontSize: 12, opacity: 0.7 }}>
                Pozn.: když se cílovky načítají později, doplní se defaultně „Komunita“ (nebo první cílovka), aby to nikdy nespadlo na DB constraintu.
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
              <label style={{ display: "grid", gap: 6 }}>
                <span>Odkaz na vysílání (stream_url)</span>
                <input
                  value={form.stream_url}
                  onChange={(e) => setForm((p) => ({ ...p, stream_url: e.target.value }))}
                  style={{ padding: 10, borderRadius: 12, border: "1px solid rgba(0,0,0,0.18)" }}
                />
              </label>

              <label style={{ display: "grid", gap: 6 }}>
                <span>Pracovní list (worksheet_url)</span>
                <input
                  value={form.worksheet_url}
                  onChange={(e) => setForm((p) => ({ ...p, worksheet_url: e.target.value }))}
                  style={{ padding: 10, borderRadius: 12, border: "1px solid rgba(0,0,0,0.18)" }}
                />
              </label>
            </div>

            <label style={{ display: "grid", gap: 6, marginTop: 12 }}>
              <span>Popis (full_description)</span>
              <textarea
                rows={4}
                value={form.full_description}
                onChange={(e) => setForm((p) => ({ ...p, full_description: e.target.value }))}
                style={{ padding: 10, borderRadius: 12, border: "1px solid rgba(0,0,0,0.18)", resize: "vertical" }}
              />
            </label>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
              <label style={{ display: "grid", gap: 6 }}>
                <span>Plakát (volitelně)</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setForm((p) => ({ ...p, poster_file: e.target.files?.[0] || null }))}
                />
                <small style={{ opacity: 0.7 }}>Pokud vybereš soubor, přepíše se plakát. Jinak zůstane stávající.</small>
              </label>

              <div style={{ display: "grid", gap: 6 }}>
                <span>Náhled plakátu</span>
                <div
                  style={{
                    border: "1px solid rgba(0,0,0,0.12)",
                    borderRadius: 12,
                    padding: 10,
                    minHeight: 110,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    background: "rgba(0,0,0,0.03)",
                  }}
                >
                  {form.poster_path ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      alt="Plakát"
                      src={publicUrlFromPath(form.poster_path)}
                      style={{ maxWidth: "100%", maxHeight: 180, objectFit: "cover", borderRadius: 10 }}
                    />
                  ) : (
                    <span style={{ opacity: 0.6 }}>Bez plakátu</span>
                  )}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
              <button
                onClick={save}
                disabled={saving}
                style={{
                  padding: "10px 14px",
                  borderRadius: 12,
                  border: "1px solid rgba(0,0,0,0.18)",
                  background: "black",
                  color: "white",
                  cursor: saving ? "not-allowed" : "pointer",
                }}
              >
                {saving ? "Ukládám…" : editingId === "NEW" ? "Vytvořit událost" : "Uložit změny"}
              </button>

              <button
                onClick={closeEdit}
                disabled={saving}
                style={{
                  padding: "10px 14px",
                  borderRadius: 12,
                  border: "1px solid rgba(0,0,0,0.18)",
                  background: "white",
                  cursor: saving ? "not-allowed" : "pointer",
                }}
              >
                Zrušit
              </button>
            </div>
          </div>
        ) : null}

        {/* LIST */}
        <div
          style={{
            border: "1px solid rgba(0,0,0,0.12)",
            borderRadius: 16,
            overflow: "hidden",
            background: "white",
          }}
        >
          <div style={{ padding: 14, borderBottom: "1px solid rgba(0,0,0,0.08)", display: "flex", gap: 10 }}>
            <div style={{ fontWeight: 600 }}>Seznam událostí</div>
            <div style={{ marginLeft: "auto", opacity: 0.7 }}>{loading ? "Načítám…" : `${rows.length} položek`}</div>
          </div>

          {loading ? (
            <div style={{ padding: 14, opacity: 0.7 }}>Načítám…</div>
          ) : rows.length === 0 ? (
            <div style={{ padding: 14, opacity: 0.7 }}>Zatím žádné události.</div>
          ) : (
            <div style={{ display: "grid" }}>
              {rows.map((r) => {
                const posterUrl = publicUrlFromPath(r.poster_path);

                const audList = getRowAudience(r).filter((name) => audienceByName.has(name));
                const audTitles = audList.slice(0, 50);

                return (
                  <div
                    key={r.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "120px 1fr auto",
                      gap: 12,
                      padding: 14,
                      borderTop: "1px solid rgba(0,0,0,0.06)",
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        width: 120,
                        height: 80,
                        borderRadius: 12,
                        overflow: "hidden",
                        border: "1px solid rgba(0,0,0,0.1)",
                        background: "rgba(0,0,0,0.03)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {posterUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img alt="Plakát" src={posterUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <span style={{ opacity: 0.6, fontSize: 12 }}>Bez plakátu</span>
                      )}
                    </div>

                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: "flex", gap: 10, alignItems: "baseline", flexWrap: "wrap" }}>
                        <div style={{ fontWeight: 700 }}>{r.title || "—"}</div>
                        <div style={{ opacity: 0.7 }}>{formatDateTimeCS(r.starts_at)}</div>

                        <span
                          style={{
                            fontSize: 12,
                            padding: "2px 8px",
                            borderRadius: 999,
                            border: "1px solid rgba(0,0,0,0.12)",
                            opacity: 0.85,
                          }}
                        >
                          {r.category || "—"}
                        </span>

                        <span
                          style={{
                            fontSize: 12,
                            padding: "2px 8px",
                            borderRadius: 999,
                            border: "1px solid rgba(0,0,0,0.12)",
                            background: r.is_published ? "rgba(0,0,0,0.06)" : "transparent",
                            opacity: 0.85,
                          }}
                        >
                          {r.is_published ? "Publikováno" : "Koncept"}
                        </span>
                      </div>

                      <div style={{ marginTop: 6, display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {audTitles.slice(0, 8).map((t) => (
                          <span
                            key={`${r.id}-${t}`}
                            style={{
                              fontSize: 12,
                              padding: "2px 8px",
                              borderRadius: 999,
                              border: "1px solid rgba(0,0,0,0.1)",
                              opacity: 0.8,
                            }}
                          >
                            {t}
                          </span>
                        ))}
                        {audTitles.length > 8 ? (
                          <span style={{ fontSize: 12, opacity: 0.6 }}>+{audTitles.length - 8}</span>
                        ) : null}
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
                      <button
                        onClick={() => openEdit(r)}
                        style={{
                          padding: "8px 10px",
                          borderRadius: 12,
                          border: "1px solid rgba(0,0,0,0.18)",
                          background: "white",
                          cursor: "pointer",
                        }}
                      >
                        ✏️ Upravit
                      </button>

                      <button
                        onClick={() => duplicateEvent(r)}
                        style={{
                          padding: "8px 10px",
                          borderRadius: 12,
                          border: "1px solid rgba(0,0,0,0.18)",
                          background: "white",
                          cursor: "pointer",
                        }}
                      >
                        🧬 Duplikovat
                      </button>

                      <button
                        onClick={() => deleteEvent(r)}
                        style={{
                          padding: "8px 10px",
                          borderRadius: 12,
                          border: "1px solid rgba(0,0,0,0.18)",
                          background: "white",
                          cursor: "pointer",
                        }}
                      >
                        🗑️ Smazat
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div style={{ marginTop: 14, opacity: 0.7, fontSize: 13 }}>
          Pozn.: Rubrika i cílovky se ukládají jako texty z <b>categories.name</b> a <b>audience_groups.name</b>.
        </div>
      </div>
    </RequireAuth>
  );
}
