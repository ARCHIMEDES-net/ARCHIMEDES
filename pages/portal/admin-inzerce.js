import { useEffect, useState } from "react";
import Link from "next/link";
import RequireAuth from "../../components/RequireAuth";
import PortalHeader from "../../components/PortalHeader";
import { supabase } from "../../lib/supabaseClient";

const BUCKET = "announcements";

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

function publicUrlFromPath(path) {
  if (!path) return null;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data?.publicUrl || null;
}

function Thumb({ url }) {
  const [failed, setFailed] = useState(false);

  if (!url || failed) {
    return (
      <div
        style={{
          width: 120,
          height: 90,
          borderRadius: 12,
          border: "1px dashed #d1d5db",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#6b7280",
          fontSize: 12,
          fontWeight: 800,
          background: "#fff",
        }}
      >
        Bez fotky
      </div>
    );
  }

  return (
    <img
      src={url}
      alt=""
      style={{
        width: 120,
        height: 90,
        borderRadius: 12,
        objectFit: "cover",
        border: "1px solid #e5e7eb",
        background: "#f9fafb",
      }}
      onError={() => setFailed(true)}
    />
  );
}

export default function AdminInzerce() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [editingId, setEditingId] = useState(null);

  const [title, setTitle] = useState("");
  const [startsAtLocal, setStartsAtLocal] = useState("");
  const [endsAtLocal, setEndsAtLocal] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [isPublished, setIsPublished] = useState(true);

  // image
  const [imageFile, setImageFile] = useState(null);
  const [imageCaption, setImageCaption] = useState("");
  const [imageAltText, setImageAltText] = useState("");
  const [currentImagePath, setCurrentImagePath] = useState(null);
  const [currentImageUrl, setCurrentImageUrl] = useState(null);

  async function loadRows() {
    const { data, error } = await supabase
      .from("announcements")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) return;

    const fixed = (data || []).map((r) => {
      const url = r?.image_path ? publicUrlFromPath(r.image_path) : null;
      return { ...r, image_url: url };
    });

    setRows(fixed);
  }

  useEffect(() => {
    loadRows();
  }, []);

  function resetForm() {
    setEditingId(null);
    setTitle("");
    setStartsAtLocal("");
    setEndsAtLocal("");
    setUrl("");
    setDescription("");
    setIsPublished(true);

    setImageFile(null);
    setImageCaption("");
    setImageAltText("");
    setCurrentImagePath(null);
    setCurrentImageUrl(null);
  }

  function startEdit(r) {
    setErr("");
    setEditingId(r.id);

    setTitle(r.title || "");
    setStartsAtLocal(toDatetimeLocalFromIso(r.starts_at || ""));
    setEndsAtLocal(toDatetimeLocalFromIso(r.ends_at || ""));
    setUrl(r.url || "");
    setDescription(r.description || "");
    setIsPublished(r.is_published !== false);

    setImageFile(null);
    setImageCaption(r.image_caption || "");
    setImageAltText(r.image_alt_text || "");
    setCurrentImagePath(r.image_path || null);
    setCurrentImageUrl(r.image_path ? publicUrlFromPath(r.image_path) : null);

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function uploadImageIfAny() {
    if (!imageFile) {
      return { image_path: currentImagePath };
    }

    const safeName = imageFile.name.replace(/[^\w.\-]+/g, "_");
    const path = `items/${Date.now()}-${safeName}`;

    const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, imageFile, {
      upsert: true,
    });

    if (upErr) throw upErr;

    return { image_path: path };
  }

  async function save() {
    setErr("");

    if (!title.trim()) {
      setErr("Chybí název");
      return;
    }

    const startsAtIso = startsAtLocal ? toIsoFromDatetimeLocal(startsAtLocal) : null;
    const endsAtIso = endsAtLocal ? toIsoFromDatetimeLocal(endsAtLocal) : null;

    if (startsAtLocal && !startsAtIso) return setErr("Neplatné datum Od");
    if (endsAtLocal && !endsAtIso) return setErr("Neplatné datum Do");

    setLoading(true);

    try {
      const { image_path } = await uploadImageIfAny();

      const payload = {
        title: title.trim(),
        starts_at: startsAtIso,
        ends_at: endsAtIso,
        url: url || null,
        description: description || null,
        is_published: !!isPublished,

        image_path: image_path || null,
        image_caption: imageCaption || null,
        image_alt_text: imageAltText || null,
      };

      if (editingId) {
        const { error } = await supabase.from("announcements").update(payload).eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("announcements").insert([payload]);
        if (error) throw error;
      }

      await loadRows();
      resetForm();
    } catch (e) {
      setErr(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  async function del(id) {
    setErr("");
    const ok = window.confirm("Opravdu smazat tuto položku inzerce?");
    if (!ok) return;

    setLoading(true);
    try {
      const { error } = await supabase.from("announcements").delete().eq("id", id);
      if (error) throw error;

      await loadRows();
      if (editingId === id) resetForm();
    } catch (e) {
      setErr(e?.message || String(e));
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

  const label = { fontWeight: 900, marginBottom: 6 };
  const input = { padding: "10px 12px", borderRadius: 12, border: "1px solid #e5e7eb" };

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
            <h1 style={{ margin: "10px 0 6px" }}>Admin – inzerce</h1>
            <div style={{ color: "#374151" }}>Správa oznámení a pozvánek + fotek.</div>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <Link href="/portal/inzerce">→ Inzerce</Link>
          </div>
        </div>

        {err ? (
          <div
            style={{
              marginTop: 12,
              padding: 12,
              borderRadius: 12,
              border: "1px solid #fecaca",
              background: "#fef2f2",
            }}
          >
            <b>Chyba:</b> {err}
          </div>
        ) : null}

        <section style={{ ...card, marginTop: 14 }}>
          <h2 style={{ margin: "0 0 10px" }}>{editingId ? "Upravit inzerát" : "Nový inzerát"}</h2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <div style={label}>Název*</div>
              <input style={{ ...input, width: "100%" }} value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>

            <div>
              <div style={label}>Publikovat</div>
              <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} />
                {isPublished ? "Ano (zobrazí se)" : "Ne (skryto)"}
              </label>
            </div>

            <div>
              <div style={label}>Platnost od</div>
              <input
                type="datetime-local"
                style={{ ...input, width: "100%" }}
                value={startsAtLocal}
                onChange={(e) => setStartsAtLocal(e.target.value)}
              />
            </div>

            <div>
              <div style={label}>Platnost do</div>
              <input
                type="datetime-local"
                style={{ ...input, width: "100%" }}
                value={endsAtLocal}
                onChange={(e) => setEndsAtLocal(e.target.value)}
              />
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <div style={label}>Odkaz</div>
              <input style={{ ...input, width: "100%" }} value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" />
            </div>

            {/* IMAGE UPLOAD */}
            <div style={{ gridColumn: "1 / -1" }}>
              <div style={label}>
                Fotka (upload){editingId && currentImageUrl ? " – aktuální zůstane, pokud nevybereš novou" : ""}
              </div>
              <input
                style={{ ...input, width: "100%" }}
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              />
              {currentImageUrl ? (
                <div style={{ marginTop: 10 }}>
                  <Thumb url={currentImageUrl} />
                </div>
              ) : null}
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <div style={label}>Popisek fotky</div>
              <input style={{ ...input, width: "100%" }} value={imageCaption} onChange={(e) => setImageCaption(e.target.value)} />
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <div style={label}>Alt text fotky</div>
              <input style={{ ...input, width: "100%" }} value={imageAltText} onChange={(e) => setImageAltText(e.target.value)} />
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <div style={label}>Text</div>
              <textarea
                style={{ ...input, width: "100%", minHeight: 120 }}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              onClick={save}
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
              {loading ? "Ukládám…" : editingId ? "Uložit změny" : "Uložit inzerát"}
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

        <section style={{ marginTop: 14 }}>
          <h2 style={{ margin: "0 0 10px" }}>Seznam inzerce (nejnovější nahoře)</h2>

          <div style={{ display: "grid", gap: 12 }}>
            {rows.map((r) => {
              const imgUrl = r?.image_path ? publicUrlFromPath(r.image_path) : null;

              return (
                <div key={r.id} style={card}>
                  <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 12, alignItems: "start" }}>
                    <Thumb url={imgUrl} />

                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                        <div style={{ fontWeight: 900, fontSize: 16 }}>{r.title}</div>

                        <span
                          style={{
                            fontSize: 12,
                            padding: "4px 8px",
                            borderRadius: 999,
                            border: "1px solid #e5e7eb",
                            background: r.is_published === false ? "#f3f4f6" : "#ecfdf5",
                            fontWeight: 900,
                          }}
                        >
                          {r.is_published === false ? "nepublikováno" : "publikováno"}
                        </span>
                      </div>

                      <div style={{ marginTop: 8, color: "#374151" }}>
                        {r.starts_at ? `Od ${formatDateTimeCS(r.starts_at)}` : "Od kdykoli"}
                        {r.ends_at ? ` • Do ${formatDateTimeCS(r.ends_at)}` : " • Bez konce"}
                      </div>

                      {r.url ? (
                        <div style={{ marginTop: 10 }}>
                          <a href={r.url} target="_blank" rel="noreferrer">
                            → Otevřít odkaz
                          </a>
                        </div>
                      ) : null}

                      {r.image_caption ? (
                        <div style={{ marginTop: 8, color: "#374151" }}>{r.image_caption}</div>
                      ) : null}

                      {r.description ? (
                        <div style={{ marginTop: 10, whiteSpace: "pre-wrap", color: "#111827" }}>
                          {r.description}
                        </div>
                      ) : null}

                      <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
                        <button
                          onClick={() => startEdit(r)}
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
                          onClick={() => del(r.id)}
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
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </RequireAuth>
  );
}
