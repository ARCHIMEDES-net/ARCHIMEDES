import { useState } from "react";
import Link from "next/link";
import PortalHeader from "../components/PortalHeader";
import { supabase } from "../lib/supabaseClient";

function normalizeLicenseType(value) {
  const v = String(value || "").toLowerCase().trim();

  if (["škola", "skola", "school"].includes(v)) return "skola";
  if (["obec", "město", "mesto", "obec / město", "obec / mesto"].includes(v)) return "obec";
  if (["spolek", "komunita", "community"].includes(v)) return "komunita";
  if (["senior-klub", "senior klub", "senior", "senior club"].includes(v)) return "senior";
  return "komunita";
}

export default function ZadostPristupPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    organization: "",
    address: "",
    type: "",
    message: "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  function updateField(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function submitForm(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const trimmedName = form.name.trim();
      const trimmedEmail = form.email.trim();
      const trimmedPhone = form.phone.trim();
      const trimmedOrganization = form.organization.trim();
      const trimmedAddress = form.address.trim();
      const trimmedType = form.type.trim();
      const trimmedMessage = form.message.trim();

      if (!trimmedName) {
        throw new Error("Vyplňte prosím jméno a příjmení.");
      }

      if (!trimmedEmail) {
        throw new Error("Vyplňte prosím e-mail.");
      }

      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail);
      if (!emailOk) {
        throw new Error("Zadejte prosím platný e-mail.");
      }

      if (!trimmedOrganization) {
        throw new Error("Vyplňte prosím název školy, obce nebo organizace.");
      }

      if (!trimmedAddress) {
        throw new Error("Vyplňte prosím adresu.");
      }

      if (trimmedPhone && trimmedPhone.length < 6) {
        throw new Error("Telefon je příliš krátký.");
      }

      const { error: insertError } = await supabase.from("access_requests").insert([
        {
          license_type: normalizeLicenseType(trimmedType),
          contact_name: trimmedName,
          organization: trimmedOrganization,
          address: trimmedAddress,
          email: trimmedEmail,
          phone: trimmedPhone || null,
          message: trimmedMessage
            ? `Typ organizace: ${trimmedType || "neuvedeno"}\n\n${trimmedMessage}`
            : `Typ organizace: ${trimmedType || "neuvedeno"}`,
          status: "new",
        },
      ]);

      if (insertError) {
        throw new Error(insertError.message || "Žádost se nepodařilo uložit.");
      }

      setMessage(
        "Děkujeme. Žádost o přístup byla úspěšně odeslána. Ozveme se vám s dalším postupem."
      );

      setForm({
        name: "",
        email: "",
        phone: "",
        organization: "",
        address: "",
        type: "",
        message: "",
      });
    } catch (err) {
      setError(err.message || "Žádost se nepodařilo odeslat.");
    } finally {
      setSaving(false);
    }
  }

  const fieldStyle = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,0.15)",
    fontSize: 15,
    boxSizing: "border-box",
    background: "#fff",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f6f7fb" }}>
      <PortalHeader />

      <main style={{ maxWidth: 760, margin: "0 auto", padding: "40px 16px" }}>
        <div
          style={{
            background: "#fff",
            borderRadius: 24,
            padding: 28,
            boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
            border: "1px solid rgba(0,0,0,0.08)",
          }}
        >
          <h1 style={{ marginTop: 0, fontSize: 32 }}>
            Žádost o přístup do ARCHIMEDES Live
          </h1>

          <p style={{ color: "rgba(0,0,0,0.68)", lineHeight: 1.6, marginBottom: 20 }}>
            Pokud ještě nemáte přístup do portálu, vyplňte krátký formulář.
            Ozveme se vám s dalším postupem a vhodným typem přístupu.
          </p>

          {error ? (
            <div
              style={{
                marginBottom: 16,
                padding: 12,
                borderRadius: 12,
                background: "#fff1f1",
                color: "#a40000",
                border: "1px solid #f2c9c9",
              }}
            >
              Chyba: {error}
            </div>
          ) : null}

          {message ? (
            <div
              style={{
                marginBottom: 16,
                padding: 12,
                borderRadius: 12,
                background: "#eefaf0",
                color: "#166534",
                border: "1px solid #cfe8d3",
              }}
            >
              {message}
            </div>
          ) : null}

          <form
            onSubmit={submitForm}
            style={{
              display: "grid",
              gap: 16,
            }}
          >
            <div>
              <label
                style={{ display: "block", marginBottom: 8, fontWeight: 600 }}
              >
                Jméno a příjmení*
              </label>
              <input
                name="name"
                required
                value={form.name}
                onChange={updateField}
                style={fieldStyle}
              />
            </div>

            <div>
              <label
                style={{ display: "block", marginBottom: 8, fontWeight: 600 }}
              >
                E-mail*
              </label>
              <input
                type="email"
                name="email"
                required
                value={form.email}
                onChange={updateField}
                style={fieldStyle}
              />
            </div>

            <div>
              <label
                style={{ display: "block", marginBottom: 8, fontWeight: 600 }}
              >
                Telefon (volitelně)
              </label>
              <input
                name="phone"
                value={form.phone}
                onChange={updateField}
                style={fieldStyle}
              />
            </div>

            <div>
              <label
                style={{ display: "block", marginBottom: 8, fontWeight: 600 }}
              >
                Název školy / obce / organizace*
              </label>
              <input
                name="organization"
                required
                value={form.organization}
                onChange={updateField}
                style={fieldStyle}
              />
            </div>

            <div>
              <label
                style={{ display: "block", marginBottom: 8, fontWeight: 600 }}
              >
                Adresa*
              </label>
              <input
                name="address"
                required
                value={form.address}
                onChange={updateField}
                placeholder="Ulice, číslo popisné, město, PSČ"
                style={fieldStyle}
              />
            </div>

            <div>
              <label
                style={{ display: "block", marginBottom: 8, fontWeight: 600 }}
              >
                Typ organizace
              </label>
              <select
                name="type"
                value={form.type}
                onChange={updateField}
                style={fieldStyle}
              >
                <option value="">Vyberte</option>
                <option value="škola">Škola</option>
                <option value="obec">Obec / město</option>
                <option value="spolek">Spolek</option>
                <option value="senior-klub">Senior klub</option>
                <option value="partner">Partner</option>
                <option value="jine">Jiné</option>
              </select>
            </div>

            <div>
              <label
                style={{ display: "block", marginBottom: 8, fontWeight: 600 }}
              >
                Zpráva
              </label>
              <textarea
                name="message"
                rows={5}
                value={form.message}
                onChange={updateField}
                style={{ ...fieldStyle, resize: "vertical" }}
              />
            </div>

            <div
              style={{
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
                marginTop: 4,
              }}
            >
              <button
                type="submit"
                disabled={saving}
                style={{
                  padding: "12px 16px",
                  borderRadius: 12,
                  background: "#111827",
                  color: "#fff",
                  fontWeight: 700,
                  border: "none",
                  cursor: saving ? "default" : "pointer",
                  opacity: saving ? 0.7 : 1,
                }}
              >
                {saving ? "Odesílám..." : "Odeslat žádost"}
              </button>

              <Link
                href="/login"
                style={{
                  display: "inline-block",
                  padding: "12px 16px",
                  borderRadius: 12,
                  background: "#fff",
                  color: "#111827",
                  textDecoration: "none",
                  fontWeight: 700,
                  border: "1px solid rgba(0,0,0,0.12)",
                }}
              >
                Zpět na přihlášení
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
