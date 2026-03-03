// pages/portal/inzerce/novy.js
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import RequireAuth from "../../../components/RequireAuth";
import PortalHeader from "../../../components/PortalHeader";
import { supabase } from "../../../lib/supabaseClient";

const BUCKET = "marketplace";

const CATEGORY_OPTIONS = [
  "Vybavení školy",
  "Učebnice a pomůcky",
  "Technologie",
  "Výměnné pobyty a projekty",
  "Obec a komunita",
  "ARCHIMEDES komponenty",
];

const EXPIRY_PRESETS = [
  { value: "30", label: "30 dní" },
  { value: "60", label: "60 dní" },
  { value: "90", label: "90 dní" },
  { value: "custom", label: "Vlastní datum" },
];

function sanitizeFileName(name) {
  return String(name || "")
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9._-]/g, "");
}

function isImageMime(mime) {
  return typeof mime === "string" && mime.startsWith("image/");
}

export default function NovyInzerat() {
  const router = useRouter();
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);

  const [type, setType] = useState("offer");
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");

  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  const [expiryPreset, setExpiryPreset] = useState("90");
  const [customExpiry, setCustomExpiry] = useState(""); // yyyy-mm-dd

  const [imageFiles, setImageFiles] = useState([]);
  const [docFiles, setDocFiles] = useState([]);

  function validate() {
    const email = contactEmail.trim();
    const phone = contactPhone.trim();
    if (!title.trim()) return "Vyplň název inzerátu.";
    if (!category) return "Vyber kategorii.";
    if (!email) return "Kontakt e-mail je povinný.";
    if (!phone) return "Telefon je povinný.";
    if (phone.replace(/\s+/g, "").length < 6) return "Telefon vypadá příliš krátký.";

    if (expiryPreset === "custom") {
      if (!customExpiry) return "Vyber vlastní datum expirace.";
      const d = new Date(customExpiry + "T00:00:00");
      if (Number.isNaN(d.getTime())) return "Neplatné datum expirace.";
      // min. zítra
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      if (d.getTime() < tomorrow.getTime()) return "Expirace musí být nejdříve zítra.";
    }

    if (imageFiles.length > 5) return "Maximálně 5 fotek.";
    if (docFiles.length > 5) return "Maximálně 5 příloh.";

    return "";
  }

  function computeExpiresAtIso() {
    if (expiryPreset === "custom") {
      // konec dne lokálně
      return new Date(customExpiry + "T23:59:59").toISOString();
    }
    const days = parseInt(expiryPreset, 10);
    const d = new Date();
    d.setDate(d.getDate() + (Number.isFinite(days) ? days : 90));
    return d.toISOString();
  }

  async function uploadOneFile({ file, userId, postId }) {
    const safeName = sanitizeFileName(file.name) || `file_${Date.now()}`;
    const path = `${userId}/posts/${postId}/${Date.now()}_${safeName}`;

    const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || undefined,
    });

    if (upErr) throw new Error(upErr.message || "Upload selhal.");

    const payload = {
      post_id: postId,
      author_id: userId,
      file_path: path,
      file_name: file.name || safeName,
      mime_type: file.type || null,
      file_size: typeof file.size === "number" ? file.size : null,
      is_image: isImageMime(file.type),
    };

    const { error: insErr } = await supabase.from("marketplace_attachments").insert(payload);
    if (insErr) throw new Error(insErr.message || "Uložení přílohy selhalo.");
  }

  async function onSave() {
    setErr("");
    const v = validate();
    if (v) {
      setErr(v);
      return;
    }

    setSaving(true);

    const { data: auth } = await supabase.auth.getUser();
    const userId = auth?.user?.id;

    if (!userId) {
      setErr("Nejste přihlášen.");
      setSaving(false);
      return;
    }

    // 1) uložit inzerát
    const payload = {
      author_id: userId,
      type,
      category,
      title: title.trim(),
      description: description.trim() || null,
      location: location.trim() || null,
      contact_email: contactEmail.trim(),
      contact_phone: contactPhone.trim(),
      status: "active",
      expires_at: computeExpiresAtIso(),
    };

    const { data: post, error: postErr } = await supabase
      .from("marketplace_posts")
      .insert(payload)
      .select("id")
      .single();

    if (postErr) {
      setErr(postErr.message || "Nepodařilo se uložit inzerát.");
      setSaving(false);
      return;
    }

    const postId = post.id;

    // 2) nahrát přílohy (fota + dokumenty)
    try {
      const all = [...imageFiles, ...docFiles];
      for (const f of all) {
        // eslint-disable-next-line no-await-in-loop
        await uploadOneFile({ file: f, userId, postId });
      }
    } catch (e) {
      // inzerát existuje, jen přílohy selhaly
      setErr(`Inzerát uložen, ale přílohy se nepodařilo nahrát: ${e?.message || e}`);
      setSaving(false);
      router.push(`/portal/inzerce/${postId}`);
      return;
    }

    setSaving(false);
    router.push(`/portal/inzerce/${postId}`);
  }

  return (
    <RequireAuth>
      <PortalHeader title="Inzerce – nový inzerát" />

      <div style={{ padding: 16, maxWidth: 900, margin: "0 auto" }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", marginBottom: 12 }}>
          <Link href="/portal/inzerce">← Zpět na Inzerci</Link>
        </div>

        {err ? (
          <div style={{ padding: 12, border: "1px solid #f3c2c2", background: "#fff4f4", borderRadius: 12, marginBottom: 12 }}>
            Chyba: {err}
          </div>
        ) : null}

        <div style={{ border: "1px solid #e6e6e6", borderRadius: 14, padding: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <div style={{ fontSize: 12, opacity: 0.7 }}>Typ</div>
              <select value={type} onChange={(e) => setType(e.target.value)} style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ddd" }}>
                <option value="offer">Nabídka</option>
                <option value="demand">Poptávka</option>
                <option value="partnership">Partnerství</option>
              </select>
            </div>

            <div>
              <div style={{ fontSize: 12, opacity: 0.7 }}>Kategorie</div>
              <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ddd" }}>
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ marginTop: 10 }}>
            <div style={{ fontSize: 12, opacity: 0.7 }}>Název inzerátu*</div>
            <input value={title} onChange={(e) => setTitle(e.target.value)} style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ddd" }} />
          </div>

          <div style={{ marginTop: 10 }}>
            <div style={{ fontSize: 12, opacity: 0.7 }}>Popis</div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
            />
          </div>

          <div style={{ marginTop: 10 }}>
            <div style={{ fontSize: 12, opacity: 0.7 }}>Lokalita (obec/město)</div>
            <input value={location} onChange={(e) => setLocation(e.target.value)} style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ddd" }} />
          </div>

          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 12, opacity: 0.7 }}>Expirace</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <select
                value={expiryPreset}
                onChange={(e) => setExpiryPreset(e.target.value)}
                style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
              >
                {EXPIRY_PRESETS.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>

              <input
                type="date"
                disabled={expiryPreset !== "custom"}
                value={customExpiry}
                onChange={(e) => setCustomExpiry(e.target.value)}
                style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ddd", opacity: expiryPreset === "custom" ? 1 : 0.5 }}
              />
            </div>
            <div style={{ marginTop: 6, fontSize: 12, opacity: 0.7 }}>
              Doporučeno: 90 dní. Po expiraci se inzerát nebude zobrazovat (pokud je zapnut filtr „Jen neexpir.“).
            </div>
          </div>

          <div style={{ marginTop: 16, fontWeight: 700 }}>Kontakt (povinné)</div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 8 }}>
            <div>
              <div style={{ fontSize: 12, opacity: 0.7 }}>E-mail*</div>
              <input
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="např. ucitel@skola.cz"
                style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
              />
            </div>
            <div>
              <div style={{ fontSize: 12, opacity: 0.7 }}>Telefon*</div>
              <input
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+420 777 000 000"
                style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
              />
            </div>
          </div>

          <div style={{ marginTop: 16, fontWeight: 700 }}>Fotky (max 5)</div>
          <div style={{ marginTop: 8 }}>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setImageFiles(Array.from(e.target.files || []).slice(0, 5))}
            />
            {imageFiles.length ? (
              <div style={{ marginTop: 8, fontSize: 12, opacity: 0.8 }}>
                Vybráno: {imageFiles.map((f) => f.name).join(", ")}
              </div>
            ) : null}
          </div>

          <div style={{ marginTop: 16, fontWeight: 700 }}>Přílohy (PDF, DOCX, XLSX… max 5)</div>
          <div style={{ marginTop: 8 }}>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv"
              multiple
              onChange={(e) => setDocFiles(Array.from(e.target.files || []).slice(0, 5))}
            />
            {docFiles.length ? (
              <div style={{ marginTop: 8, fontSize: 12, opacity: 0.8 }}>
                Vybráno: {docFiles.map((f) => f.name).join(", ")}
              </div>
            ) : null}
          </div>

          <div style={{ marginTop: 14 }}>
            <button
              onClick={onSave}
              disabled={saving}
              style={{ padding: "10px 14px", borderRadius: 12, border: "1px solid #ddd", cursor: "pointer" }}
            >
              {saving ? "Ukládám…" : "Uložit inzerát"}
            </button>
          </div>

          <div style={{ marginTop: 10, fontSize: 12, opacity: 0.7 }}>
            Pozn.: Přílohy se nahrají až po uložení inzerátu.
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}
