// pages/portal/admin-skoly.js
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import RequireAuth from "../../components/RequireAuth";
import PortalHeader from "../../components/PortalHeader";
import { supabase } from "../../lib/supabaseClient";

const BUCKET = "schools";

function publicUrlFromPath(path) {
  if (!path) return null;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data?.publicUrl || null;
}

function toDateInputValue(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function toNumOrNull(v) {
  if (v === null || v === undefined) return null;
  const s = String(v).trim().replace(",", ".");
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function safeFileName(name) {
  return String(name || "file")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9.\-_]/g, "");
}

function normalizeHttp(url) {
  const s = String(url || "").trim();
  if (!s) return "";
  if (s.startsWith("http://") || s.startsWith("https://")) return s;
  return `https://${s}`;
}

function buildGeoQuery(form) {
  const parts = [];
  const a = String(form.address || "").trim();
  const c = String(form.city || "").trim();
  const r = String(form.region || "").trim();
  const co = String(form.country || "").trim();

  if (a) parts.push(a);
  if (c) parts.push(c);
  if (r) parts.push(r);
  if (co) parts.push(co);

  // fallback: když není adresa, použij aspoň název školy
  if (parts.length === 0) {
    const n = String(form.name || "").trim();
    if (n) parts.push(n);
  }

  return parts.join(", ");
}

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid rgba(0,0,0,0.14)",
  background: "white",
  outline: "none",
};

const labelStyle = { fontSize: 12, opacity: 0.7, marginBottom: 6 };

function emptyForm() {
  return {
    name: "",
    website: "",
    address: "",
    city: "",
    region: "",
    country: "Česká republika",
    school_type: "",
    contact_name: "",
    contact_phone: "",
    contact_email: "",
    archimedes_since: "",

    short_description: "",
    classroom_description: "",

    latitude: "",
    longitude: "",

    has_archimedes_classroom: true,
    is_published: true,

    photo_path: "",
  };
}

export default function AdminSkoly() {
  const [rows, setRows] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [err, setErr] = useState("");

  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm());

  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState("");

  async function load() {
    setLoadingList(true);
    setErr("");

    const { data, error } = await supabase
      .from("schools")
      .select(
        "id,name,website,address,city,region,country,school_type,contact_name,contact_phone,contact_email,archimedes_since,short_description,classroom_description,latitude,longitude,has_archimedes_classroom,is_published,photo_path,created_at"
      )
      .order("created_at", { ascending: false });

    if (error) {
      setErr(error.message);
      setLoadingList(false);
      return;
    }

    setRows(data || []);
    setLoadingList(false);
  }

  useEffect(() => {
    load();
  }, []);

  // když vybereš foto → lokální preview
  useEffect(() => {
    if (!photoFile) {
      setPhotoPreviewUrl("");
      return;
    }
    const url = URL.createObjectURL(photoFile);
    setPhotoPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [photoFile]);

  const selectedPhotoUrl = useMemo(() => {
    if (photoPreviewUrl) return photoPreviewUrl;
    return publicUrlFromPath(form.photo_path);
  }, [photoPreviewUrl, form.photo_path]);

  const geoQuery = useMemo(() => buildGeoQuery(form), [form]);

  function startNew() {
    setEditingId(null);
    setForm(emptyForm());
    setPhotoFile(null);
    setPhotoPreviewUrl("");
    setErr("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openRow(r) {
    setErr("");
    setEditingId(r.id);

    setForm({
      name: r.name || "",
      website: r.website || "",
      address: r.address || "",
      city: r.city || "",
      region: r.region || "",
      country: r.country || "Česká republika",
      school_type: r.school_type || "",
      contact_name: r.contact_name || "",
      contact_phone: r.contact_phone || "",
      contact_email: r.contact_email || "",
      archimedes_since: toDateInputValue(r.archimedes_since),

      short_description: r.short_description || "",
      classroom_description: r.classroom_description || "",

      latitude: r.latitude ?? "",
      longitude: r.longitude ?? "",

      has_archimedes_classroom: !!r.has_archimedes_classroom,
      is_published: !!r.is_published,

      photo_path: r.photo_path || "",
    });

    setPhotoFile(null);
    setPhotoPreviewUrl("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function uploadPhotoForSchool(schoolId) {
    if (!photoFile) return null;

    const ext = safeFileName(photoFile.name);
    const path = `schools/${schoolId}/${Date.now()}-${ext}`;

    const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, photoFile, {
      cacheControl: "3600",
      upsert: true,
      contentType: photoFile.type || "image/*",
    });

    if (upErr) throw new Error(upErr.message);
    return path;
  }

  async function save() {
    setSaving(true);
    setErr("");

    try {
      if (!String(form.name || "").trim()) {
        throw new Error("Vyplň Název školy.");
      }

      const payload = {
        name: String(form.name || "").trim(),
        website: String(form.website || "").trim() || null,
        address: String(form.address || "").trim() || null,
        city: String(form.city || "").trim() || null,
        region: String(form.region || "").trim() || null,
        country: String(form.country || "").trim() || null,
        school_type: String(form.school_type || "").trim() || null,

        contact_name: String(form.contact_name || "").trim() || null,
        contact_phone: String(form.contact_phone || "").trim() || null,
        contact_email: String(form.contact_email || "").trim() || null,

        archimedes_since: form.archimedes_since ? new Date(form.archimedes_since).toISOString() : null,

        short_description: String(form.short_description || "").trim() || null,
        classroom_description: String(form.classroom_description || "").trim() || null,

        latitude: toNumOrNull(form.latitude),
        longitude: toNumOrNull(form.longitude),

        has_archimedes_classroom: !!form.has_archimedes_classroom,
        is_published: !!form.is_published,
      };

      let schoolId = editingId;

      // 1) INSERT nebo UPDATE základních dat
      if (!editingId) {
        const { data, error } = await supabase.from("schools").insert([{ ...payload }]).select("id").single();
        if (error) throw new Error(error.message);
        schoolId = data?.id;
        setEditingId(schoolId);
      } else {
        const { error } = await supabase.from("schools").update(payload).eq("id", editingId);
        if (error) throw new Error(error.message);
      }

      // 2) Upload fotky (pokud je vybraná)
      if (photoFile) {
        const photo_path = await uploadPhotoForSchool(schoolId);

        const { error: up2 } = await supabase.from("schools").update({ photo_path }).eq("id", schoolId);
        if (up2) throw new Error(up2.message);

        setForm((p) => ({ ...p, photo_path }));
        setPhotoFile(null);
        setPhotoPreviewUrl("");
      }

      await load();
    } catch (e) {
      setErr(e?.message || "Nepodařilo se uložit školu.");
    } finally {
      setSaving(false);
    }
  }

  async function removeSchool(id) {
    if (!confirm("Opravdu smazat tuto školu?")) return;

    setErr("");
    try {
      const { error } = await supabase.from("schools").delete().eq("id", id);
      if (error) throw new Error(error.message);

      if (editingId === id) startNew();
      await load();
    } catch (e) {
      setErr(e?.message || "Nepodařilo se smazat školu.");
    }
  }

  function openMapy() {
    const q = encodeURIComponent(geoQuery || "");
    window.open(`https://mapy.cz/zakladni?q=${q}`, "_blank", "noopener,noreferrer");
  }

  function openGoogleMaps() {
    const q = encodeURIComponent(geoQuery || "");
    window.open(`https://www.google.com/maps/search/?api=1&query=${q}`, "_blank", "noopener,noreferrer");
  }

  const websiteHref = useMemo(() => normalizeHttp(form.website), [form.website]);

  return (
    <RequireAuth>
      <PortalHeader title="Admin – Školy" />

      <div style={{ background: "#f6f7fb", minHeight: "100vh" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "18px 16px 40px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div>
              <div style={{ fontWeight: 900, fontSize: 22 }}>Admin – Školy</div>
              <div style={{ fontSize: 13, opacity: 0.7, marginTop: 4 }}>
                Databáze škol s učebnou ARCHIMEDES (interně spravovaná).
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
              <Link
                href="/portal"
                style={{
                  textDecoration: "none",
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: "1px solid rgba(0,0,0,0.18)",
                  background: "white",
                  fontWeight: 900,
                  color: "#111827",
                }}
              >
                ← Zpět do portálu
              </Link>

              {editingId ? (
                <Link
                  href={`/portal/skoly/${editingId}`}
                  style={{
                    textDecoration: "none",
                    padding: "10px 12px",
                    borderRadius: 12,
                    border: "1px solid rgba(0,0,0,0.18)",
                    background: "white",
                    fontWeight: 900,
                    color: "#111827",
                  }}
                >
                  Zobrazit detail →
                </Link>
              ) : null}

              <button
                onClick={startNew}
                style={{
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: "1px solid rgba(0,0,0,0.18)",
                  background: "white",
                  fontWeight: 900,
                  cursor: "pointer",
                }}
              >
                Nový záznam
              </button>

              <button
                onClick={save}
                disabled={saving}
                style={{
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: "1px solid rgba(0,0,0,0.18)",
                  background: "#111827",
                  color: "white",
                  fontWeight: 900,
                  cursor: saving ? "not-allowed" : "pointer",
                  opacity: saving ? 0.7 : 1,
                }}
              >
                {saving ? "Ukládám…" : "Uložit"}
              </button>
            </div>
          </div>

          {err ? (
            <div
              style={{
                marginTop: 12,
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

          {/* FORM */}
          <div
            style={{
              marginTop: 14,
              background: "white",
              border: "1px solid rgba(0,0,0,0.08)",
              borderRadius: 18,
              padding: 14,
              boxShadow: "0 12px 30px rgba(0,0,0,0.06)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline" }}>
              <div style={{ fontWeight: 900 }}>Přidat / upravit školu</div>
              <div style={{ fontSize: 12, opacity: 0.6 }}>
                {editingId ? (
                  <>
                    Editace ID: <b>{editingId}</b>
                  </>
                ) : (
                  "Nový záznam"
                )}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 14, marginTop: 12 }}>
              {/* left */}
              <div style={{ display: "grid", gap: 12 }}>
                <div>
                  <div style={labelStyle}>Název školy*</div>
                  <input
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    style={inputStyle}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <div style={labelStyle}>Web školy</div>
                    <input
                      value={form.website}
                      onChange={(e) => setForm((p) => ({ ...p, website: e.target.value }))}
                      style={inputStyle}
                      placeholder="https://… nebo www…"
                    />
                    {websiteHref ? (
                      <div style={{ marginTop: 6, fontSize: 12, opacity: 0.75 }}>
                        Odkaz:{" "}
                        <a href={websiteHref} target="_blank" rel="noreferrer" style={{ fontWeight: 900 }}>
                          otevřít
                        </a>
                      </div>
                    ) : null}
                  </div>

                  <div>
                    <div style={labelStyle}>Typ školy</div>
                    <input
                      value={form.school_type}
                      onChange={(e) => setForm((p) => ({ ...p, school_type: e.target.value }))}
                      style={inputStyle}
                      placeholder="ZŠ / MŠ / SŠ…"
                    />
                  </div>
                </div>

                <div>
                  <div style={labelStyle}>Adresa</div>
                  <input
                    value={form.address}
                    onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                    style={inputStyle}
                    placeholder="Ulice, č.p."
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                  <div>
                    <div style={labelStyle}>Město</div>
                    <input value={form.city} onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))} style={inputStyle} />
                  </div>
                  <div>
                    <div style={labelStyle}>Kraj</div>
                    <input value={form.region} onChange={(e) => setForm((p) => ({ ...p, region: e.target.value }))} style={inputStyle} />
                  </div>
                  <div>
                    <div style={labelStyle}>Země</div>
                    <input value={form.country} onChange={(e) => setForm((p) => ({ ...p, country: e.target.value }))} style={inputStyle} />
                  </div>
                </div>

                {/* GPS helper */}
                <div
                  style={{
                    border: "1px solid rgba(0,0,0,0.08)",
                    background: "rgba(0,0,0,0.02)",
                    borderRadius: 14,
                    padding: 12,
                  }}
                >
                  <div style={{ fontWeight: 900, marginBottom: 6 }}>Pomocník pro GPS</div>
                  <div style={{ fontSize: 12, opacity: 0.75, lineHeight: 1.35 }}>
                    Dotaz: <b>{geoQuery || "—"}</b>
                  </div>
                  <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <button
                      onClick={openMapy}
                      disabled={!geoQuery}
                      style={{
                        padding: "8px 10px",
                        borderRadius: 12,
                        border: "1px solid rgba(0,0,0,0.18)",
                        background: "white",
                        fontWeight: 900,
                        cursor: geoQuery ? "pointer" : "not-allowed",
                        opacity: geoQuery ? 1 : 0.6,
                      }}
                    >
                      Otevřít v Mapy.cz →
                    </button>
                    <button
                      onClick={openGoogleMaps}
                      disabled={!geoQuery}
                      style={{
                        padding: "8px 10px",
                        borderRadius: 12,
                        border: "1px solid rgba(0,0,0,0.18)",
                        background: "white",
                        fontWeight: 900,
                        cursor: geoQuery ? "pointer" : "not-allowed",
                        opacity: geoQuery ? 1 : 0.6,
                      }}
                    >
                      Otevřít v Google Maps →
                    </button>
                    <div style={{ fontSize: 12, opacity: 0.7, alignSelf: "center" }}>
                      Tip: z mapy zkopíruj souřadnice do polí Latitude/Longitude.
                    </div>
                  </div>
                </div>

                {/* GPS */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <div style={labelStyle}>Latitude (GPS)</div>
                    <input
                      value={form.latitude ?? ""}
                      onChange={(e) => setForm((p) => ({ ...p, latitude: e.target.value }))}
                      style={inputStyle}
                      placeholder="např. 49.12345"
                    />
                  </div>
                  <div>
                    <div style={labelStyle}>Longitude (GPS)</div>
                    <input
                      value={form.longitude ?? ""}
                      onChange={(e) => setForm((p) => ({ ...p, longitude: e.target.value }))}
                      style={inputStyle}
                      placeholder="např. 17.23456"
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                  <div>
                    <div style={labelStyle}>Kontaktní osoba</div>
                    <input value={form.contact_name} onChange={(e) => setForm((p) => ({ ...p, contact_name: e.target.value }))} style={inputStyle} />
                  </div>
                  <div>
                    <div style={labelStyle}>Telefon</div>
                    <input value={form.contact_phone} onChange={(e) => setForm((p) => ({ ...p, contact_phone: e.target.value }))} style={inputStyle} />
                  </div>
                  <div>
                    <div style={labelStyle}>Email</div>
                    <input value={form.contact_email} onChange={(e) => setForm((p) => ({ ...p, contact_email: e.target.value }))} style={inputStyle} />
                  </div>
                </div>

                <div>
                  <div style={labelStyle}>Datum otevření učebny</div>
                  <input
                    type="date"
                    value={form.archimedes_since}
                    onChange={(e) => setForm((p) => ({ ...p, archimedes_since: e.target.value }))}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <div style={labelStyle}>Krátký popis školy</div>
                  <textarea
                    value={form.short_description}
                    onChange={(e) => setForm((p) => ({ ...p, short_description: e.target.value }))}
                    style={{ ...inputStyle, minHeight: 90, resize: "vertical" }}
                    placeholder="Stručně: čím je škola zajímavá…"
                  />
                </div>

                <div>
                  <div style={labelStyle}>Popis učebny (text)</div>
                  <textarea
                    value={form.classroom_description}
                    onChange={(e) => setForm((p) => ({ ...p, classroom_description: e.target.value }))}
                    style={{ ...inputStyle, minHeight: 110, resize: "vertical", whiteSpace: "pre-wrap" }}
                    placeholder="Např. základní / voda / kuchyň / dílna / 3D tisk / specifika…"
                  />
                </div>

                <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
                  <label style={{ display: "flex", gap: 8, alignItems: "center", fontWeight: 800 }}>
                    <input
                      type="checkbox"
                      checked={!!form.has_archimedes_classroom}
                      onChange={(e) => setForm((p) => ({ ...p, has_archimedes_classroom: e.target.checked }))}
                    />
                    Má učebnu ARCHIMEDES
                  </label>

                  <label style={{ display: "flex", gap: 8, alignItems: "center", fontWeight: 800 }}>
                    <input
                      type="checkbox"
                      checked={!!form.is_published}
                      onChange={(e) => setForm((p) => ({ ...p, is_published: e.target.checked }))}
                    />
                    Publikovat v síti učeben
                  </label>
                </div>
              </div>

              {/* right */}
              <div style={{ display: "grid", gap: 12 }}>
                <div>
                  <div style={{ fontWeight: 900, marginBottom: 8 }}>Fotka učebny</div>

                  <div
                    style={{
                      height: 220,
                      borderRadius: 16,
                      border: "1px solid rgba(0,0,0,0.10)",
                      background: "rgba(0,0,0,0.03)",
                      overflow: "hidden",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {selectedPhotoUrl ? (
                      <img
                        src={selectedPhotoUrl}
                        alt="Fotka učebny"
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                      />
                    ) : (
                      <div style={{ fontSize: 13, opacity: 0.7, padding: 12, textAlign: "center" }}>
                        Zatím bez fotky.
                        <div style={{ marginTop: 6, fontSize: 12 }}>
                          Vyber soubor níže a klikni <b>Uložit</b>.
                        </div>
                      </div>
                    )}
                  </div>

                  <div style={{ marginTop: 10 }}>
                    <input type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files?.[0] || null)} />
                    <div style={{ marginTop: 6, fontSize: 12, opacity: 0.65 }}>
                      Doporučení: JPG/PNG, šířka alespoň 1200 px.
                    </div>
                  </div>

                  {editingId ? (
                    <div style={{ marginTop: 10, fontSize: 12, opacity: 0.7 }}>
                      Tip: detail školy je na{" "}
                      <Link href={`/portal/skoly/${editingId}`} style={{ fontWeight: 900 }}>
                        /portal/skoly/{editingId}
                      </Link>
                    </div>
                  ) : null}
                </div>

                {editingId ? (
                  <button
                    onClick={() => removeSchool(editingId)}
                    style={{
                      padding: "10px 12px",
                      borderRadius: 12,
                      border: "1px solid rgba(220,38,38,0.35)",
                      background: "rgba(220,38,38,0.08)",
                      fontWeight: 900,
                      cursor: "pointer",
                      color: "rgba(120,20,20,0.95)",
                    }}
                  >
                    Smazat školu
                  </button>
                ) : null}
              </div>
            </div>
          </div>

          {/* LIST */}
          <div
            style={{
              marginTop: 14,
              background: "white",
              border: "1px solid rgba(0,0,0,0.08)",
              borderRadius: 18,
              padding: 14,
              boxShadow: "0 12px 30px rgba(0,0,0,0.06)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline" }}>
              <div style={{ fontWeight: 900 }}>Seznam škol</div>
              <div style={{ fontSize: 12, opacity: 0.65 }}>
                Celkem: <b>{rows.length}</b>
              </div>
            </div>

            {loadingList ? (
              <div style={{ marginTop: 10, opacity: 0.7 }}>Načítám…</div>
            ) : rows.length === 0 ? (
              <div style={{ marginTop: 10, opacity: 0.7 }}>Zatím žádné školy.</div>
            ) : (
              <div style={{ marginTop: 10, overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ textAlign: "left" }}>
                      <th style={{ fontSize: 12, opacity: 0.65, padding: "8px 8px" }}>Název</th>
                      <th style={{ fontSize: 12, opacity: 0.65, padding: "8px 8px" }}>Město</th>
                      <th style={{ fontSize: 12, opacity: 0.65, padding: "8px 8px" }}>Kraj</th>
                      <th style={{ fontSize: 12, opacity: 0.65, padding: "8px 8px" }}>Publikace</th>
                      <th style={{ fontSize: 12, opacity: 0.65, padding: "8px 8px" }}>GPS</th>
                      <th style={{ fontSize: 12, opacity: 0.65, padding: "8px 8px" }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => {
                      const gpsOk =
                        r.latitude !== null &&
                        r.latitude !== undefined &&
                        r.longitude !== null &&
                        r.longitude !== undefined;
                      return (
                        <tr key={r.id} style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
                          <td style={{ padding: "10px 8px", fontWeight: 900 }}>{r.name || "—"}</td>
                          <td style={{ padding: "10px 8px", opacity: 0.85 }}>{r.city || "—"}</td>
                          <td style={{ padding: "10px 8px", opacity: 0.85 }}>{r.region || "—"}</td>
                          <td style={{ padding: "10px 8px" }}>
                            {r.is_published ? (
                              <span
                                style={{
                                  fontSize: 12,
                                  padding: "4px 10px",
                                  borderRadius: 999,
                                  background: "rgba(16,185,129,0.12)",
                                  border: "1px solid rgba(16,185,129,0.20)",
                                }}
                              >
                                Publikováno
                              </span>
                            ) : (
                              <span
                                style={{
                                  fontSize: 12,
                                  padding: "4px 10px",
                                  borderRadius: 999,
                                  background: "rgba(0,0,0,0.04)",
                                  border: "1px solid rgba(0,0,0,0.10)",
                                }}
                              >
                                Skryté
                              </span>
                            )}
                          </td>
                          <td style={{ padding: "10px 8px" }}>
                            {gpsOk ? (
                              <span
                                style={{
                                  fontSize: 12,
                                  padding: "4px 10px",
                                  borderRadius: 999,
                                  background: "rgba(59,130,246,0.12)",
                                  border: "1px solid rgba(59,130,246,0.20)",
                                }}
                              >
                                OK
                              </span>
                            ) : (
                              <span
                                style={{
                                  fontSize: 12,
                                  padding: "4px 10px",
                                  borderRadius: 999,
                                  background: "rgba(0,0,0,0.04)",
                                  border: "1px solid rgba(0,0,0,0.10)",
                                }}
                              >
                                Bez GPS
                              </span>
                            )}
                          </td>
                          <td style={{ padding: "10px 8px", textAlign: "right" }}>
                            <button
                              onClick={() => openRow(r)}
                              style={{
                                padding: "8px 10px",
                                borderRadius: 12,
                                border: "1px solid rgba(0,0,0,0.18)",
                                background: "#111827",
                                color: "white",
                                fontWeight: 900,
                                cursor: "pointer",
                              }}
                            >
                              Otevřít
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}
