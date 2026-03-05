// pages/portal/admin-skoly.js
import { useEffect, useMemo, useState } from "react";
import RequireAuth from "../../components/RequireAuth";
import PortalHeader from "../../components/PortalHeader";
import { supabase } from "../../lib/supabaseClient";

const BUCKET = "schools";

function publicUrlFromPath(path) {
  if (!path) return null;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data?.publicUrl || null;
}

function safeYear(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  return String(d.getFullYear());
}

export default function AdminSkoly() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const emptyForm = {
    id: null,
    name: "",
    address: "",
    city: "",
    region: "",
    country: "Česká republika",
    school_type: "",
    website: "",
    contact_name: "",
    contact_email: "",
    contact_phone: "",
    short_description: "",
    classroom_description: "",
    classroom_variant: "",
    archimedes_since: "",
    has_archimedes_classroom: true,
    is_published: true,
    photo_path: "",
  };

  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase.rpc("is_admin");
        if (!error) setIsAdmin(!!data);
      } catch (e) {
        // no-op
      } finally {
        setCheckingAdmin(false);
      }
    })();
  }, []);

  async function load() {
    setLoading(true);
    setErr("");

    const { data, error } = await supabase
      .from("schools")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setErr(error.message);
      setLoading(false);
      return;
    }

    setRows(data || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function setField(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function startCreate() {
    setForm(emptyForm);
    setFile(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function startEdit(r) {
    setForm({
      ...emptyForm,
      ...r,
      id: r.id,
      archimedes_since: r.archimedes_since ? String(r.archimedes_since).slice(0, 10) : "",
      photo_path: r.photo_path || "",
    });
    setFile(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function uploadPhotoForId(id) {
    if (!file) return null;

    const ext = (file.name || "jpg").split(".").pop()?.toLowerCase() || "jpg";
    const path = `schools/${id}-${Date.now()}.${ext}`;

    const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
      upsert: false,
      cacheControl: "3600",
      contentType: file.type || undefined,
    });

    if (error) throw new Error(error.message);
    return path;
  }

  async function save() {
    if (!form.name?.trim()) {
      alert("Vyplň název školy.");
      return;
    }
    if (!isAdmin) {
      alert("Nemáš admin oprávnění.");
      return;
    }

    setSaving(true);
    setErr("");

    try {
      const payload = {
        name: form.name?.trim() || null,
        address: form.address?.trim() || null,
        city: form.city?.trim() || null,
        region: form.region?.trim() || null,
        country: form.country?.trim() || null,
        school_type: form.school_type?.trim() || null,
        website: form.website?.trim() || null,
        contact_name: form.contact_name?.trim() || null,
        contact_email: form.contact_email?.trim() || null,
        contact_phone: form.contact_phone?.trim() || null,
        short_description: form.short_description?.trim() || null,
        classroom_description: form.classroom_description?.trim() || null,
        classroom_variant: form.classroom_variant?.trim() || null,
        archimedes_since: form.archimedes_since ? form.archimedes_since : null,
        has_archimedes_classroom: !!form.has_archimedes_classroom,
        is_published: !!form.is_published,
      };

      let schoolId = form.id;

      if (!schoolId) {
        const { data, error } = await supabase.from("schools").insert([payload]).select("*").single();
        if (error) throw new Error(error.message);
        schoolId = data.id;
        setForm((f) => ({ ...f, id: schoolId }));
      } else {
        const { error } = await supabase.from("schools").update(payload).eq("id", schoolId);
        if (error) throw new Error(error.message);
      }

      // upload fotky (pokud je vybraná)
      if (file) {
        const path = await uploadPhotoForId(schoolId);
        const { error } = await supabase.from("schools").update({ photo_path: path }).eq("id", schoolId);
        if (error) throw new Error(error.message);
        setField("photo_path", path);
        setFile(null);
      }

      await load();
      alert("Uloženo.");
    } catch (e) {
      setErr(e?.message || "Nepodařilo se uložit.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id) {
    if (!isAdmin) return alert("Nemáš admin oprávnění.");
    if (!confirm("Opravdu smazat školu?")) return;

    const { error } = await supabase.from("schools").delete().eq("id", id);
    if (error) return alert(error.message);
    load();
  }

  async function togglePublished(r) {
    if (!isAdmin) return alert("Nemáš admin oprávnění.");
    const { error } = await supabase.from("schools").update({ is_published: !r.is_published }).eq("id", r.id);
    if (error) return alert(error.message);
    load();
  }

  const items = useMemo(() => {
    return (rows || []).map((r) => ({
      ...r,
      photo_url: publicUrlFromPath(r.photo_path),
    }));
  }, [rows]);

  return (
    <RequireAuth>
      <PortalHeader title="Admin – Školy" />

      <div style={{ background: "#f6f7fb", minHeight: "100vh" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "18px 16px 40px" }}>
          {checkingAdmin ? (
            <div style={{ background: "white", borderRadius: 18, padding: 14, border: "1px solid rgba(0,0,0,0.08)" }}>
              Načítám oprávnění…
            </div>
          ) : !isAdmin ? (
            <div style={{ background: "white", borderRadius: 18, padding: 14, border: "1px solid rgba(0,0,0,0.08)" }}>
              Tato stránka je dostupná jen správcům.
            </div>
          ) : (
            <>
              {/* FORM */}
              <div
                style={{
                  background: "white",
                  border: "1px solid rgba(0,0,0,0.08)",
                  borderRadius: 18,
                  padding: 14,
                }}
              >
                <div style={{ display: "flex", gap: 10, alignItems: "baseline" }}>
                  <div style={{ fontWeight: 900, fontSize: 16 }}>
                    {form.id ? "Upravit školu" : "Přidat školu"}
                  </div>
                  <div style={{ marginLeft: "auto", fontSize: 12, opacity: 0.65 }}>
                    {form.id ? `ID: ${form.id}` : ""}
                  </div>
                </div>

                {err ? (
                  <div
                    style={{
                      marginTop: 10,
                      background: "#fff3f3",
                      border: "1px solid #ffd0d0",
                      padding: 12,
                      borderRadius: 12,
                      color: "#8a1f1f",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    Chyba: {err}
                  </div>
                ) : null}

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 }}>
                  <Field label="Název školy *">
                    <input value={form.name} onChange={(e) => setField("name", e.target.value)} style={inputStyle} />
                  </Field>

                  <Field label="Web školy">
                    <input value={form.website || ""} onChange={(e) => setField("website", e.target.value)} style={inputStyle} />
                  </Field>

                  <Field label="Adresa">
                    <input value={form.address || ""} onChange={(e) => setField("address", e.target.value)} style={inputStyle} />
                  </Field>

                  <Field label="Město">
                    <input value={form.city || ""} onChange={(e) => setField("city", e.target.value)} style={inputStyle} />
                  </Field>

                  <Field label="Kraj">
                    <input value={form.region || ""} onChange={(e) => setField("region", e.target.value)} style={inputStyle} />
                  </Field>

                  <Field label="Typ školy">
                    <input value={form.school_type || ""} onChange={(e) => setField("school_type", e.target.value)} style={inputStyle} />
                  </Field>

                  <Field label="Kontaktní osoba">
                    <input value={form.contact_name || ""} onChange={(e) => setField("contact_name", e.target.value)} style={inputStyle} />
                  </Field>

                  <Field label="Telefon">
                    <input value={form.contact_phone || ""} onChange={(e) => setField("contact_phone", e.target.value)} style={inputStyle} />
                  </Field>

                  <Field label="Email">
                    <input value={form.contact_email || ""} onChange={(e) => setField("contact_email", e.target.value)} style={inputStyle} />
                  </Field>

                  <Field label="Učebna od (datum)">
                    <input type="date" value={form.archimedes_since || ""} onChange={(e) => setField("archimedes_since", e.target.value)} style={inputStyle} />
                  </Field>

                  <Field label="Krátký popis školy (1–2 věty)" wide>
                    <textarea value={form.short_description || ""} onChange={(e) => setField("short_description", e.target.value)} style={textareaStyle} />
                  </Field>

                  <Field label="Popis učebny (volný text)" wide>
                    <textarea value={form.classroom_description || ""} onChange={(e) => setField("classroom_description", e.target.value)} style={textareaStyle} />
                  </Field>

                  <Field label="Fotka učebny">
                    <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                    {form.photo_path ? (
                      <div style={{ marginTop: 8, fontSize: 12, opacity: 0.75 }}>
                        Aktuální: <code>{form.photo_path}</code>
                      </div>
                    ) : null}
                  </Field>

                  <Field label="Nastavení">
                    <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13 }}>
                      <input type="checkbox" checked={!!form.has_archimedes_classroom} onChange={(e) => setField("has_archimedes_classroom", e.target.checked)} />
                      Má učebnu ARCHIMEDES
                    </label>
                    <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13, marginTop: 6 }}>
                      <input type="checkbox" checked={!!form.is_published} onChange={(e) => setField("is_published", e.target.checked)} />
                      Publikovat v síti učeben
                    </label>
                  </Field>
                </div>

                <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
                  <button onClick={save} disabled={saving} style={primaryBtn}>
                    {saving ? "Ukládám…" : "Uložit"}
                  </button>
                  <button onClick={startCreate} style={secondaryBtn}>
                    Nový záznam
                  </button>
                  {form.id ? (
                    <a
                      href={`/portal/skoly/${form.id}`}
                      style={{ ...secondaryBtn, display: "inline-flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}
                    >
                      Náhled →
                    </a>
                  ) : null}
                </div>
              </div>

              {/* LIST */}
              <div style={{ marginTop: 12, background: "white", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 18, padding: 14 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                  <div style={{ fontWeight: 900 }}>Seznam škol</div>
                  <div style={{ marginLeft: "auto", fontSize: 12, opacity: 0.65 }}>Celkem: {items.length}</div>
                </div>

                {loading ? <div style={{ marginTop: 10, opacity: 0.7 }}>Načítám…</div> : null}

                <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
                  {items.map((r) => (
                    <div key={r.id} style={{ border: "1px solid rgba(0,0,0,0.10)", borderRadius: 16, padding: 12, display: "flex", gap: 12 }}>
                      <div style={{ width: 110, height: 78, borderRadius: 14, overflow: "hidden", background: "rgba(0,0,0,0.05)", flex: "0 0 auto" }}>
                        {r.photo_url ? (
                          <img src={r.photo_url} alt={r.name || "Škola"} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                        ) : (
                          <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, opacity: 0.6 }}>
                            Bez fotky
                          </div>
                        )}
                      </div>

                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontWeight: 900, fontSize: 14, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.name || "—"}</span>
                          {r.is_published ? (
                            <span style={{ fontSize: 11, fontWeight: 900, padding: "2px 8px", borderRadius: 999, background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.22)" }}>
                              Publikováno
                            </span>
                          ) : (
                            <span style={{ fontSize: 11, fontWeight: 900, padding: "2px 8px", borderRadius: 999, background: "rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.10)" }}>
                              Skryto
                            </span>
                          )}
                        </div>

                        <div style={{ fontSize: 12, opacity: 0.75, marginTop: 4 }}>
                          {(r.city || "—")}
                          {r.region ? ` • ${r.region}` : ""}
                          {r.archimedes_since ? ` • učebna od ${safeYear(r.archimedes_since)}` : ""}
                        </div>

                        {r.short_description ? (
                          <div style={{ fontSize: 12, opacity: 0.75, marginTop: 6, lineHeight: 1.35 }}>
                            {r.short_description}
                          </div>
                        ) : null}

                        <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                          <button onClick={() => startEdit(r)} style={secondaryBtn}>Upravit</button>
                          <button onClick={() => togglePublished(r)} style={secondaryBtn}>
                            {r.is_published ? "Skrýt" : "Publikovat"}
                          </button>
                          <button onClick={() => remove(r.id)} style={dangerBtn}>Smazat</button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {(!loading && items.length === 0) ? (
                    <div style={{ opacity: 0.7 }}>Zatím žádné školy.</div>
                  ) : null}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </RequireAuth>
  );
}

function Field({ label, children, wide }) {
  return (
    <div style={{ gridColumn: wide ? "1 / -1" : "auto" }}>
      <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>{label}</div>
      {children}
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid rgba(0,0,0,0.14)",
  outline: "none",
  background: "white",
};

const textareaStyle = {
  width: "100%",
  minHeight: 90,
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid rgba(0,0,0,0.14)",
  outline: "none",
  background: "white",
  resize: "vertical",
};

const primaryBtn = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid rgba(0,0,0,0.18)",
  background: "#111827",
  color: "white",
  fontWeight: 900,
  cursor: "pointer",
};

const secondaryBtn = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid rgba(0,0,0,0.18)",
  background: "white",
  color: "#111827",
  fontWeight: 900,
  cursor: "pointer",
};

const dangerBtn = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid rgba(185,28,28,0.35)",
  background: "rgba(185,28,28,0.10)",
  color: "#7f1d1d",
  fontWeight: 900,
  cursor: "pointer",
};
