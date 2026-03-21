import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import PortalHeader from "../components/PortalHeader";
import { supabase } from "../lib/supabaseClient";

function normalizeLicenseType(value) {
  const v = String(value || "").toLowerCase().trim();

  if (["škola", "skola", "school"].includes(v)) return "skola";
  if (["obec", "město", "mesto", "obec / město", "obec / mesto"].includes(v))
    return "obec";
  if (["spolek", "komunita", "community"].includes(v)) return "komunita";
  if (["senior-klub", "senior klub", "senior", "senior club"].includes(v))
    return "senior";
  return "komunita";
}

export default function ZadostPristupPage() {
  const router = useRouter();
  const isDemoRequest = useMemo(
    () => String(router.query.type || "").toLowerCase() === "demo",
    [router.query.type]
  );

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    organization: "",
    address: "",
    type: isDemoRequest ? "škola" : "",
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
        throw new Error(
          isDemoRequest
            ? "Vyplňte prosím školu nebo organizaci, pro kterou chcete ukázkový přístup."
            : "Vyplňte prosím školu, obec, organizaci nebo místo, kde chcete ARCHIMEDES Live využít."
        );
      }

      if (!trimmedAddress) {
        throw new Error("Vyplňte prosím adresu.");
      }

      if (trimmedPhone && trimmedPhone.length < 6) {
        throw new Error("Telefon je příliš krátký.");
      }

      const requestHeader = isDemoRequest
        ? "Typ žádosti: demo přístup"
        : "Typ žádosti: standardní přístup";

      const organizationTypeLine = `Typ organizace: ${
        trimmedType || "neuvedeno"
      }`;

      const composedMessage = [
        requestHeader,
        organizationTypeLine,
        trimmedMessage || "",
      ]
        .filter(Boolean)
        .join("\n\n");

      const { error: insertError } = await supabase.from("access_requests").insert([
        {
          license_type: normalizeLicenseType(trimmedType),
          contact_name: trimmedName,
          organization: trimmedOrganization,
          address: trimmedAddress,
          email: trimmedEmail,
          phone: trimmedPhone || null,
          message: composedMessage,
          status: "new",
        },
      ]);

      if (insertError) {
        throw new Error(insertError.message || "Žádost se nepodařilo uložit.");
      }

      setMessage(
        isDemoRequest
          ? "Děkujeme. Žádost o ukázkový přístup byla úspěšně odeslána. Ozveme se vám s dalším postupem a přístupem do demo prostředí."
          : "Děkujeme. Žádost o přístup byla úspěšně odeslána. Ozveme se vám s dalším postupem."
      );

      setForm({
        name: "",
        email: "",
        phone: "",
        organization: "",
        address: "",
        type: isDemoRequest ? "škola" : "",
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

  const helperStyle = {
    marginTop: 6,
    fontSize: 13,
    color: "rgba(0,0,0,0.62)",
    lineHeight: 1.5,
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
            {isDemoRequest
              ? "Žádost o ukázkový přístup do ARCHIMEDES Live"
              : "Žádost o přístup do ARCHIMEDES Live"}
          </h1>

          <p
            style={{
              color: "rgba(0,0,0,0.68)",
              lineHeight: 1.6,
              marginBottom: 20,
            }}
          >
            {isDemoRequest
              ? "Vyplňte krátký formulář a požádejte o přístup do ukázkového prostředí. Demo slouží k bezpečné prohlídce portálu z pohledu školy, bez administrativních zásahů a bez možnosti aktivního spuštění vysílání."
              : "Pokud ještě nemáte přístup do portálu, vyplňte krátký formulář. Ozveme se vám s dalším postupem a vhodným typem přístupu."}
          </p>

          {isDemoRequest ? (
            <div
              style={{
                marginBottom: 18,
                padding: 14,
                borderRadius: 14,
                background: "#eefaf0",
                color: "#166534",
                border: "1px solid #cfe8d3",
                lineHeight: 1.6,
              }}
            >
              Ukázkový přístup je určen k prohlížení prostředí ARCHIMEDES Live.
              Neumožňuje správu školy, vytváření událostí ani spuštění vysílání.
            </div>
          ) : null}

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
                {isDemoRequest
                  ? "Škola / organizace pro ukázkový přístup*"
                  : "Škola / obec / organizace / místo zájmu*"}
              </label>
              <input
                name="organization"
                required
                value={form.organization}
                onChange={updateField}
                placeholder={
                  isDemoRequest
                    ? "Např. ZŠ Hodonín, Gymnázium Vyškov..."
                    : "Např. ZŠ Hodonín, Obec Křenov, Hodonín, komunita v Bučovicích..."
                }
                style={fieldStyle}
              />
              <div style={helperStyle}>
                {isDemoRequest
                  ? "Napište prosím školu nebo organizaci, pro kterou chcete ukázkové prostředí zobrazit."
                  : "Pokud zatím nežádáte za konkrétní organizaci, napište prosím obec, město nebo stručně popište, kde chcete ARCHIMEDES Live využít."}
              </div>
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
                <option value="jine">Jiné / zatím neurčeno</option>
              </select>
              <div style={helperStyle}>
                Pokud zatím nevystupujete za konkrétní organizaci, zvolte „Jiné /
                zatím neurčeno“.
              </div>
            </div>

            <div>
              <label
                style={{ display: "block", marginBottom: 8, fontWeight: 600 }}
              >
                {isDemoRequest ? "Poznámka" : "Zpráva"}
              </label>
              <textarea
                name="message"
                rows={5}
                value={form.message}
                onChange={updateField}
                style={{ ...fieldStyle, resize: "vertical" }}
                placeholder={
                  isDemoRequest
                    ? "Můžete doplnit, pro koho chcete ukázkový přístup, jakou roli ve škole máte nebo co vás na ARCHIMEDES Live zajímá nejvíce."
                    : "Můžete doplnit, pro koho o přístup usilujete, koho chcete zapojit nebo v jaké fázi zájmu jste."
                }
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
                {saving
                  ? "Odesílám..."
                  : isDemoRequest
                  ? "Odeslat žádost o ukázkový přístup"
                  : "Odeslat žádost"}
              </button>

              <Link
                href={isDemoRequest ? "/demo" : "/login"}
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
                {isDemoRequest ? "Zpět na ukázku" : "Zpět na přihlášení"}
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
