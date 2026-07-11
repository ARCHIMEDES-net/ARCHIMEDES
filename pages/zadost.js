import { useState } from "react";
import Link from "next/link";

export default function ZadostPage() {
  const [form, setForm] = useState({
    name: "",
    role: "",
    email: "",
    phone: "",
    organization: "",
    address: "",
    population: "",
    message: "",
    company: "",
  });

const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

function updateField(e) {
  setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
}

async function submitForm(e) {
  e.preventDefault();
  setSaving(true);
  setError("");
  setMessage("");
  setSubmitted(false);

  try {
    const trimmedName = form.name.trim();
    const trimmedRole = form.role.trim();
    const trimmedEmail = form.email.trim();
    const trimmedPhone = form.phone.trim();
    const trimmedOrganization = form.organization.trim();
    const trimmedAddress = form.address.trim();
    const trimmedPopulation = form.population.trim();
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
    throw new Error("Vyplňte prosím název obce.");
  }

  if (!trimmedAddress) {
    throw new Error("Vyplňte prosím adresu obecního úřadu.");
  }

  if (!trimmedPhone) {
    throw new Error("Vyplňte prosím telefon.");
  }
    if (trimmedPhone.length < 6) {
      throw new Error("Telefon je příliš krátký.");
    }

  const res = await fetch("/api/zadost-o-pristup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: trimmedName,
      role: trimmedRole,
      email: trimmedEmail,
      phone: trimmedPhone,
      organization: trimmedOrganization,
      address: trimmedAddress,
      population: trimmedPopulation,
      type: "obec",
      message: trimmedMessage,
      company: form.company,
    }),
  });

  let data = {};
    try {
      data = await res.json();
    } catch {
      data = {};
    }

  if (!res.ok) {
    throw new Error(data?.error || "Žádost se nepodařilo odeslat.");
  }

  setMessage(
    data.emailSent === false
    ? "Děkujeme. Žádost o přístup byla úspěšně odeslána.\n\nZpracujeme žádost a obec zaregistrujeme.\n\nPotvrzovací e-mail se teď nepodařilo odeslat, ale vaše žádost je v pořádku zaznamenaná — ozveme se vám i tak."
    : "Děkujeme. Žádost o přístup byla úspěšně odeslána.\n\nZpracujeme žádost a obec zaregistrujeme."
    );

  setSubmitted(true);

  setForm({
    name: "",
    role: "",
    email: "",
    phone: "",
    organization: "",
    address: "",
    population: "",
    message: "",
    company: "",
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
{submitted ? "Odesláno" : "Žádost o program pro obec"}
</div>

{!submitted ? (
  <>
  <h1 style={{ marginTop: 0, fontSize: 34, lineHeight: 1.12 }}>
Chci program pro naši obec
  </h1>

<p
 style={{
   color: "rgba(0,0,0,0.72)",
   lineHeight: 1.7,
   marginBottom: 20,
   fontSize: 17,
 }}
>
Vyplňte krátký formulář — zpracujeme žádost a obec zaregistrujeme.
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

  <form
onSubmit={submitForm}
style={{
  display: "grid",
  gap: 16,
}}
>
<input
type="text"
name="company"
value={form.company}
onChange={updateField}
autoComplete="off"
tabIndex={-1}
aria-hidden="true"
style={{
  position: "absolute",
  left: "-9999px",
  opacity: 0,
  pointerEvents: "none",
  height: 0,
  width: 0,
}}
/>

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
Funkce (volitelně)
  </label>
<select
name="role"
value={form.role}
onChange={updateField}
style={fieldStyle}
>
  <option value="">Vyberte</option>
<option value="starosta">Starosta/starostka</option>
<option value="mistostarosta">Místostarosta/ka</option>
<option value="zamestnanec-uradu">
  Zaměstnanec obecního úřadu
  </option>
<option value="zastupce-spolku">
  Zástupce spolku v obci
  </option>
<option value="jine">Jiné</option>
  </select>
  </div>

<div>
  <label
style={{ display: "block", marginBottom: 8, fontWeight: 600 }}
>
Název obce*
  </label>
<input
name="organization"
required
value={form.organization}
onChange={updateField}
placeholder="Např. Obec Křenov"
style={fieldStyle}
/>
  <div style={helperStyle}>
  Napište prosím název obce, která má o program zájem.
  </div>
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
  <label
style={{ display: "block", marginBottom: 8, fontWeight: 600 }}
>
Adresa obecního úřadu*
  </label>
<input
name="address"
required
value={form.address}
onChange={updateField}
placeholder="Ulice, číslo popisné, město, PSČ"
style={fieldStyle}
/>
  <div style={helperStyle}>
  Uveďte prosím adresu obecního úřadu.
  </div>
  </div>

<div>
  <label
style={{ display: "block", marginBottom: 8, fontWeight: 600 }}
>
Přibližný počet obyvatel (volitelně)
  </label>
<input
name="population"
value={form.population}
onChange={updateField}
style={fieldStyle}
/>
  </div>

<div>
  <label
style={{ display: "block", marginBottom: 8, fontWeight: 600 }}
>
Zpráva (volitelně)
  </label>
<textarea
name="message"
rows={5}
value={form.message}
onChange={updateField}
style={{ ...fieldStyle, resize: "vertical" }}
  placeholder="Můžete doplnit cokoli, co nám pomůže se na hovor lépe připravit."
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

<p
style={{
  marginTop: 20,
  marginBottom: 0,
  fontSize: 14,
  lineHeight: 1.6,
  color: "rgba(0,0,0,0.62)",
}}
>
Zastupujete spolek, ne obecní úřad? Pokud vaše obec už má
ARCHIMEDES Live aktivovaný, zaregistrujte se rovnou{" "}
<Link
href="/registrace-spolku"
style={{ color: "#111827", fontWeight: 700 }}
>
zde
  </Link>
.
  </p>
  </>
) : (
  <>
  <h1 style={{ marginTop: 0, fontSize: 34, lineHeight: 1.12 }}>
Žádost jsme přijali
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
  whiteSpace: "pre-line",
  fontSize: 16,
}}
>
{message}
</div>

<div
style={{
  display: "grid",
  gap: 12,
  marginBottom: 26,
  color: "rgba(0,0,0,0.72)",
  lineHeight: 1.7,
}}
>
<div>
  <strong>Co bude následovat:</strong>
  </div>
<div>1. Vaši žádost zaevidujeme.</div>
<div>2. Žádost zpracujeme.</div>
<div>3. Obec zaregistrujeme a program může začít.</div>
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
Přejít na přihlášení
  </Link>
  </div>
  </>
)}
</div>
  </main>
  </div>
);
}
