// pages/portal/admin-udalosti.js
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import RequireAuth from "../../components/RequireAuth";
import PortalHeader from "../../components/PortalHeader";
import { supabase } from "../../lib/supabaseClient";

const BUCKET = "posters";

function toDateTimeLocalValue(date) {
  if (!date) return "";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";
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

export default function AdminUdalosti() {
  const [rows, setRows] = useState([]);
  const [categories, setCategories] = useState([]);
  const [audienceGroups, setAudienceGroups] = useState([]);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // edit modal (inline panel)
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    title: "",
    starts_at: "",
    category: "",
    audience: [],
    full_description: "",
    stream_url: "",
    worksheet_url: "",
    is_published: true,
    poster_file: null,
    poster_path: "",
  });
  const [saving, setSaving] = useState(false);

  async function loadAll() {
    setLoading(true);
    setErr("");

    const [{ data: ev, error: evErr }, { data: cats, error: cErr }, { data: aud, error: aErr }] =
      await Promise.all([
        supabase.from("events").select("*").order("created_at", { ascending: false }),
        supabase.from("categories").select("*").order("title", { ascending: true }),
        supabase.from("audience_groups").select("*").order("title", { ascending: true }),
      ]);

    if (evErr) {
      setErr(evErr.message);
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
  }, []);

  const categoriesByValue = useMemo(() => {
    const m = new Map();
    (categories || []).forEach((c) => m.set(c.value ?? c.slug ?? c.title, c));
    return m;
  }, [categories]);

  const audienceByValue = useMemo(() => {
    const m = new Map();
    (audienceGroups || []).forEach((a) => m.set(a.value ?? a.slug ?? a.title, a));
    return m;
  }, [audienceGroups]);

  function normalizeAudienceValue(v) {
    if (!v) return [];
    if (Array.isArray(v)) return v;
    // pokud je uložené jako text "a,b,c"
    return String(v)
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);
  }

  function openEdit(row) {
    setEditingId(row.id);
    setForm({
      title: row.title || "",
      starts_at: toDateTimeLocalValue(row.starts_at),
      category: row.category || "",
      audience: normalizeAudienceValue(row.audience),
      full_description: row.full_description || "",
      stream_url: row.stream_url || "",
      worksheet_url: row.worksheet_url || "",
      is_published: row.is_published !== false,
      poster_file: null,
      poster_path: row.poster_path || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function closeEdit() {
    setEditingId(null);
    setForm({
      title: "",
      starts_at: "",
      category: "",
      audience: [],
      full_description: "",
      stream_url: "",
      worksheet_url: "",
      is_published: true,
      poster_file: null,
      poster_path: "",
    });
  }

  async function uploadPosterIfNeeded(eventId) {
    if (!form.poster_file) return form.poster_path || null;

    const file = form.poster_file;
    const ext = file.name.split(".").pop() || "png";
    const safeName = `${eventId}_${Date.now()}.${ext}`;
    const path = `events/${safeName}`;

    const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file, {
      upsert: true,
      contentType: file.type || "image/png",
    });

    if (upErr) throw new Error(`Upload plakátu selhal: ${upErr.message}`);
    return path;
  }

  async function saveEdit() {
    if (!editingId) return;
    setSaving(true);
    setErr("");

    try {
      if (!form.title.trim()) throw new Error("Vyplň název události.");
      if (!form.starts_at) throw new Error("Vyplň datum a čas (starts_at).");
      if (!form.category) throw new Error("Vyber rubriku (category).");
      if (!form.audience || form.audience.length === 0)
        throw new Error("Vyber alespoň jednu cílovku (audience).");

      const poster_path = await uploadPosterIfNeeded(editingId);

      const payload = {
        title: form.title.trim(),
        starts_at: new Date(form.starts_at).toISOString(),
        category: form.category,
        audience: form.audience, // DB constraint events_audience_groups_nonempty
        full_description: form.full_description || "",
        stream_url: form.stream_url || "",
        worksheet_url: form.worksheet_url || "",
        is_published: !!form.is_published,
        poster_path: poster_path || null,
      };

      const { error: upErr } = await supabase.from("events").update(payload).eq("id", editingId);
      if (upErr) throw new Error(upErr.message);

      await loadAll();
      closeEdit();
    } catch (e) {
      setErr(e.message || "Uložení selhalo.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteEvent(row) {
    if (!confirm(`Smazat událost „${row.title}“?`)) return;

    setErr("");
    // (volitelně) smazání plakátu ze storage – bucket je public, ale write je admin, takže by to mělo jít
    try {
      const { error: delErr } = await supabase.from("events").delete().eq("id", row.id);
      if (delErr) throw new Error(delErr.message);

      if (row.poster_path) {
        // neblokovat mazání, když storage delete selže
        await supabase.storage.from(BUCKET).remove([row.poster_path]);
      }

      await loadAll();
    } catch (e) {
      setErr(e.message || "Mazání selhalo.");
    }
  }

  async function duplicateEvent(row) {
    if (!confirm("Duplikovat tuto událost?")) return;

    setErr("");
    try {
      const payload = {
        title: row.title ? `${row.title} (kopie)` : "Kopie",
        starts_at: row.starts_at,
        category: row.category,
        audience: normalizeAudienceValue(row.audience),
        full_description: row.full_description || "",
        stream_url: row.stream_url || "",
        worksheet_url: row.worksheet_url || "",
        is_published: false, // kopii raději jako koncept
        poster_path: row.poster_path || null,
      };

      const { error } = await supabase.from("events").insert(payload);
      if (error) throw new Error(error.message);

      await loadAll();
    } catch (e) {
      setErr(e.message || "Duplikace selhala.");
    }
  }

  function toggleAudience(val) {
    setForm((prev) => {
      const has = prev.audience.includes(val);
      return { ...prev, audience: has ? prev.audience.filter((x) => x !== val) : [...prev.audience, val] };
    });
  }

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
        {editingId ? (
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
              <h2 style={{ margin: 0, fontSize: 18 }}>Upravit událost</h2>
              <button
                onClick={closeEdit}
                style={{
                  padding: "8px 12px",
                  borderRadius: 12,
                  border: "1px solid rgba(0,0,0,0.15)",
                  background: "white",
                  cursor: "pointer",
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
                  style={{ padding: 10, borderRadius: 12, border: "1px solid rgba(0,0,0,0.18)", background: "white" }}
                >
                  <option value="">— vyber —</option>
                  {categories.map((c) => {
                    const val = c.value ?? c.slug ?? c.title;
                    return (
                      <option key={c.id ?? val} value={val}>
                        {c.title ?? val}
                      </option>
                    );
                  })}
                </select>
              </label>

              <label style={{ display: "grid", gap: 6 }}>
                <span>Publikovat</span>
                <select
                  value={form.is_published ? "1" : "0"}
                  onChange={(e) => setForm((p) => ({ ...p, is_published: e.target.value === "1" }))}
                  style={{ padding: 10, borderRadius: 12, border: "1px solid rgba(0,0,0,0.18)", background: "white" }}
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
                  const val = a.value ?? a.slug ?? a.title;
                  const active = form.audience.includes(val);
                  return (
                    <button
                      key={a.id ?? val}
                      type="button"
                      onClick={() => toggleAudience(val)}
                      style={{
                        padding: "8px 10px",
                        borderRadius: 999,
                        border: "1px solid rgba(0,0,0,0.18)",
                        background: active ? "rgba(0,0,0,0.08)" : "white",
                        cursor: "pointer",
                      }}
                    >
                      {a.title ?? val}
                    </button>
                  );
                })}
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
                <small style={{ opacity: 0.7 }}>
                  Pokud vybereš soubor, přepíše se plakát. Jinak zůstane stávající.
                </small>
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
                onClick={saveEdit}
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
                {saving ? "Ukládám…" : "Uložit změny"}
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
            <div style={{ marginLeft: "auto", opacity: 0.7 }}>
              {loading ? "Načítám…" : `${rows.length} položek`}
            </div>
          </div>

          {loading ? (
            <div style={{ padding: 14, opacity: 0.7 }}>Načítám…</div>
          ) : rows.length === 0 ? (
            <div style={{ padding: 14, opacity: 0.7 }}>Zatím žádné události.</div>
          ) : (
            <div style={{ display: "grid" }}>
              {rows.map((r) => {
                const posterUrl = publicUrlFromPath(r.poster_path);
                const audList = normalizeAudienceValue(r.audience);
                const catTitle =
                  categoriesByValue.get(r.category)?.title ?? r.category ?? "—";
                const audTitles = audList
                  .map((a) => audienceByValue.get(a)?.title ?? a)
                  .filter(Boolean);

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
                        border: "1px solid rgba(0,0,0,0.10)",
                        background: "rgba(0,0,0,0.03)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {posterUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          alt="Plakát"
                          src={posterUrl}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
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
                            opacity: 0.8,
                          }}
                        >
                          {catTitle}
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
                        {audTitles.slice(0, 6).map((t) => (
                          <span
                            key={t}
                            style={{
                              fontSize: 12,
                              padding: "2px 8px",
                              borderRadius: 999,
                              border: "1px solid rgba(0,0,0,0.10)",
                              opacity: 0.8,
                            }}
                          >
                            {t}
                          </span>
                        ))}
                        {audTitles.length > 6 ? (
                          <span style={{ fontSize: 12, opacity: 0.6 }}>+{audTitles.length - 6}</span>
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
                        🧬 Duplikovat TEST
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
          Tip: Pokud se ti po nasazení tlačítko stále jmenuje „Duplikovat“ (bez TEST), tak se nenasazuje
          aktuální soubor z repa a budeme řešit mismatch deploye na Vercelu.
        </div>
      </div>
    </RequireAuth>
  );
}
