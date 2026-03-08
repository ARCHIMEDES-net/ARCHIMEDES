import { useState } from "react";
import Link from "next/link";
import PortalHeader from "../components/PortalHeader";

export default function ZadostPristupPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    organization: "",
    type: "",
    message: "",
  });

  function updateField(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function submitForm(e) {
    e.preventDefault();

    const subject = encodeURIComponent("Žádost o přístup – ARCHIMEDES Live");

    const body = encodeURIComponent(
`Jméno: ${form.name}

Email: ${form.email}

Organizace: ${form.organization}

Typ organizace: ${form.type}

Zpráva:
${form.message}`
    );

    window.location.href = `mailto:portal@archimedeslive.com?subject=${subject}&body=${body}`;
  }

  const fieldStyle = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,0.15)",
    fontSize: 15,
    boxSizing: "border-box",
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
                Jméno a příjmení
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
                E-mail
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
                Název školy / obce / organizace
              </label>
              <input
                name="organization"
                value={form.organization}
                onChange={updateField}
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
                style={{
                  padding: "12px 16px",
                  borderRadius: 12,
                  background: "#111827",
                  color: "#fff",
                  fontWeight: 700,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Odeslat žádost
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
