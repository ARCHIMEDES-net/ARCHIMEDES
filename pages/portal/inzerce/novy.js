import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import RequireAuth from "../../../components/RequireAuth";
import PortalHeader from "../../../components/PortalHeader";
import { supabase } from "../../../lib/supabaseClient";

const CATEGORY_OPTIONS = [
  "Vybavení školy",
  "Učebnice a pomůcky",
  "Technologie",
  "Výměnné pobyty a projekty",
  "Obec a komunita",
  "ARCHIMEDES komponenty",
];

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

  function validate() {
    const email = contactEmail.trim();
    const phone = contactPhone.trim();
    if (!title.trim()) return "Vyplň název inzerátu.";
    if (!category) return "Vyber kategorii.";
    if (!email) return "Kontakt e-mail je povinný.";
    if (!phone) return "Telefon je povinný.";
    if (phone.replace(/\s+/g, "").length < 6) return "Telefon vypadá příliš krátký.";
    return "";
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
    };

    const { data, error } = await supabase.from("marketplace_posts").insert(payload).select("id").single();

    if (error) {
      setErr(error.message || "Nepodařilo se uložit inzerát.");
      setSaving(false);
      return;
    }

    setSaving(false);
    router.push(`/portal/inzerce/${data.id}`);
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

          <div style={{ marginTop: 14 }}>
            <button
              onClick={onSave}
              disabled={saving}
              style={{ padding: "10px 14px", borderRadius: 12, border: "1px solid #ddd", cursor: "pointer" }}
            >
              {saving ? "Ukládám…" : "Uložit inzerát"}
            </button>
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}
