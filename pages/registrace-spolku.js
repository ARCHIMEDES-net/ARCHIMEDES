import { useState } from "react";
import Link from "next/link";

const ACTIVITY_OPTIONS = [
  { code: "hasici", label: "Požární ochrana" },
  { code: "sport", label: "Sport a tělovýchova" },
  { code: "myslivost", label: "Myslivost" },
  { code: "vcelarstvi", label: "Včelařství" },
  { code: "zahradkari", label: "Zahrádkáři a pěstitelé" },
  { code: "rybarstvi", label: "Rybářství" },
  { code: "chovatelstvi", label: "Chovatelství" },
  { code: "folklor", label: "Folklor a tradice" },
  { code: "kultura", label: "Kultura a umění" },
  { code: "seniori", label: "Senioři" },
  { code: "rodice_deti", label: "Rodiče a děti" },
  { code: "mladez", label: "Děti a mládež" },
  { code: "socialni", label: "Sociální a zdravotní" },
  { code: "duchovni", label: "Duchovní společenství" },
  { code: "komunita", label: "Okrašlovací a komunitní" },
  { code: "smart_city", label: "Chytrá obec" },
  { code: "jine", label: "Jiné" },
];

export default function RegistraceSpolkuPage() {
  const [form, setForm] = useState({
    registrationNumber: "",
    name: "",
    contactName: "",
    email: "",
    phone: "",
    activityCode: "",
    customText: "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [resultOrg, setResultOrg] = useState(null);

  function updateField(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function submitForm(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSubmitted(false);

    try {
      const trimmedRegistrationNumber = form.registrationNumber.trim();
      const trimmedName = form.name.trim();
      const trimmedContactName = form.contactName.trim();
      const trimmedEmail = form.email.trim();
      const trimmedPhone = form.phone.trim();
      const trimmedCustomText = form.customText.trim();

      if (!trimmedRegistrationNumber) {
        throw new Error("Vyplňte prosím registrační číslo obce.");
      }

      if (!trimmedName) {
        throw new Error("Vyplňte prosím název spolku.");
      }

      if (!trimmedContactName) {
        throw new Error("Vyplňte prosím kontaktní osobu.");
      }

      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail);
      if (!emailOk) {
        throw new Error("Zadejte prosím platný e-mail.");
      }

      if (!trimmedPhone || trimmedPhone.length < 6) {
        throw new Error("Vyplňte prosím platný telefon.");
      }

      if (!form.activityCode) {
        throw new Error("Vyberte prosím činnost spolku.");
      }

      if (form.activityCode === "jine" && !trimmedCustomText) {
        throw new Error("U činnosti „Jiné“ prosím vyplňte, o jakou činnost jde.");
      }

      const res = await fetch("/api/registrace-spolku", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registrationNumber: trimmedRegistrationNumber,
          name: trimmedName,
          contactName: trimmedContactName,
          email: trimmedEmail,
          phone: trimmedPhone,
          activityCode: form.activityCode,
          customText: trimmedCustomText,
        }),
      });

      let data = {};
      try {
        data = await res.json();
      } catch {
        data = {};
      }

      if (!res.ok) {
        throw new Error(data?.error || "Registraci se nepodařilo odeslat.");
      }

      setResultOrg(data.organization || null);
      setSubmitted(true);
    } catch (err) {
      setError(err.message || "Registraci se nepodařilo odeslat.");
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

  const helperStyle = {
    marginTop: 6,
    fontSize: 13,
    color: "rgba(0,0,0,0.62)",
    lineHeight: 1.5,
  };

  const cardStyle = {
    background: "#fff",
    borderRadius: 24,
    padding: 28,
    boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
    border: "1px solid rgba(0,0,0,0.08)",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f6f7fb" }}>
      <main style={{ maxWidth: 760, margin: "0 auto", padding: "40px 16px" }}>
        <div style={cardStyle}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "8px 12px",
              borderRadius: 999,
              background: "#f3f4f6",
              color: "#374151",
              fontSize: 13,
              fontWeight: 800,
              marginBottom: 16,
            }}
          >
            {submitted ? "Registrace přijata" : "Registrace spolku"}
          </div>

          {!submitted ? (
            <>
              <h1 style={{ marginTop: 0, fontSize: 34, lineHeight: 1.12 }}>
                Registrace spolku do ARCHIMEDES Live
              </h1>

              <p
                style={{
                  color: "rgba(0,0,0,0.72)",
                  lineHeight: 1.7,
                  marginBottom: 20,
                  fontSize: 17,
                }}
              >
                Vyplňte registrační číslo vaší obce (obdržíte ho od obecního
                úřadu) a údaje o spolku.
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

              <form onSubmit={submitForm} style={{ display: "grid", gap: 16 }}>
                <div>
                  <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>
                    Registrační číslo obce*
                  </label>
                  <input
                    name="registrationNumber"
                    required
                    value={form.registrationNumber}
                    onChange={updateField}
                    placeholder="Např. 4823"
                    style={fieldStyle}
                  />
                  <div style={helperStyle}>
                    Registrační číslo vám sdělí obecní úřad, který má
                    ARCHIMEDES Live aktivovaný.
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>
                    Název spolku*
                  </label>
                  <input
                    name="name"
                    required
                    value={form.name}
                    onChange={updateField}
                    placeholder="Např. SDH Křenov"
                    style={fieldStyle}
                  />
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>
                    Kontaktní osoba*
                  </label>
                  <input
                    name="contactName"
                    required
                    value={form.contactName}
                    onChange={updateField}
                    style={fieldStyle}
                  />
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>
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
                  <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>
                    Telefon*
                  </label>
                  <input
                    name="phone"
                    required
                    value={form.phone}
                    onChange={updateField}
                    style={fieldStyle}
                  />
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>
                    Činnost spolku*
                  </label>
                  <select
                    name="activityCode"
                    required
                    value={form.activityCode}
                    onChange={updateField}
                    style={fieldStyle}
                  >
                    <option value="">Vyberte</option>
                    {ACTIVITY_OPTIONS.map((o) => (
                      <option key={o.code} value={o.code}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>

                {form.activityCode === "jine" ? (
                  <div>
                    <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>
                      Upřesněte činnost*
                    </label>
                    <input
                      name="customText"
                      required
                      value={form.customText}
                      onChange={updateField}
                      style={fieldStyle}
                    />
                  </div>
                ) : null}

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 4 }}>
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
                    {saving ? "Odesílám..." : "Registrovat spolek"}
                  </button>

                  <Link
                    href="/"
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
                    Zpět na hlavní stránku
                  </Link>
                </div>
              </form>
            </>
          ) : (
            <>
              <h1 style={{ marginTop: 0, fontSize: 34, lineHeight: 1.12 }}>
                Spolek jsme zaregistrovali
              </h1>

              <div
                style={{
                  marginTop: 20,
                  marginBottom: 24,
                  padding: 18,
                  borderRadius: 18,
                  background: "#eefaf0",
                  color: "#166534",
                  border: "1px solid #cfe8d3",
                  lineHeight: 1.8,
                  fontSize: 16,
                }}
              >
                {resultOrg?.registrationNumber || resultOrg?.registration_number
                  ? `Registrační číslo spolku: ${
                      resultOrg.registration_number || resultOrg.registrationNumber
                    }`
                  : "Registraci jsme přijali."}
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 10,
                  flexWrap: "wrap",
                }}
              >
                <Link
                  href="/"
                  style={{
                    display: "inline-block",
                    padding: "12px 16px",
                    borderRadius: 12,
                    background: "#111827",
                    color: "#fff",
                    textDecoration: "none",
                    fontWeight: 700,
                    border: "none",
                  }}
                >
                  Zpět na hlavní stránku
                </Link>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
