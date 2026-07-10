import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

export default function ZadostPage() {
  const router = useRouter();

  const isDemoRequest = useMemo(
    () => String(router.query.type || "").toLowerCase() === "demo",
    [router.query.type]
  );

  const initialType = isDemoRequest ? "škola" : "";

  const [form, setForm] = useState({
    name: "",
    role: "",
    email: "",
    phone: "",
    organization: "",
    address: "",
    population: "",
    preferredDate: "",
    type: initialType,
    message: "",
    company: "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      type: isDemoRequest ? "škola" : prev.type || "",
    }));
  }, [isDemoRequest]);

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
      const trimmedPreferredDate = form.preferredDate.trim();
      const trimmedType = isDemoRequest ? form.type.trim() : "obec";
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
            : "Vyplňte prosím název obce."
        );
      }

      if (!trimmedAddress) {
        throw new Error(
          isDemoRequest
            ? "Vyplňte prosím adresu."
            : "Vyplňte prosím adresu obecního úřadu."
        );
      }

      if (isDemoRequest) {
        if (trimmedPhone && trimmedPhone.length < 6) {
          throw new Error("Telefon je příliš krátký.");
        }
      } else {
        if (!trimmedPhone) {
          throw new Error("Vyplňte prosím telefon.");
        }
        if (trimmedPhone.length < 6) {
          throw new Error("Telefon je příliš krátký.");
        }
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
          preferredDate: trimmedPreferredDate,
          type: trimmedType,
          message: trimmedMessage,
          isDemoRequest,
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
        isDemoRequest
          ? "Děkujeme. Žádost o ukázkový přístup byla úspěšně odeslána.\n\nJakmile bude přístup schválen, na zadaný e-mail obdržíte zprávu s přístupem, který vás jedním kliknutím zavede přímo do ukázkového prostředí.n\nPokud zprávu během několika minut nenajdete, zkontrolujte prosím i složku Spam nebo Hromadné."
          : "Děkujeme. Žádost o přístup byla úspěšně odeslána.\n\nOzveme se vám s dalším postupem."
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
        preferredDate: "",
        type: isDemoRequest ? "škola" : "",
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
              background: isDemoRequest ? "#eef2ff" : "#f3f4f6",
              color: isDemoRequest ? "#1e3a8a" : "#374151",
              fontSize: 13,
              fontWeight: 800,
              marginBottom: 16,
            }}
          >
            {submitted
              ? isDemoRequest
                ? "Žádost přijata"
                : "Odesláno"
              : isDemoRequest
                ? "Ukázkový přístup pro školy"
                : "Žádost o program pro obec"}
          </div>

          {!submitted ? (
            <>
              <h1 style={{ marginTop: 0, fontSize: 34, lineHeight: 1.12 }}>
                {isDemoRequest
                  ? "Požádejte o ukázkový přístup do ARCHIMEDES Live"
                  : "Chci program pro naši obec"}
              </h1>

              <p
                style={{
                  color: "rgba(0,0,0,0.72)",
                  lineHeight: 1.7,
                  marginBottom: 20,
                  fontSize: 17,
                }}
              >
                {isDemoRequest
                  ? "Vyplňte krátký formulář a po schválení vám pošleme přístup do ukázkového prostředí. Uvidíte, jak vypadá program, archiv i celkové prostředí portálu z pohledu školy."
                  : "Vyplňte krátký formulář — ozveme se vám a domluvíme termín prvního vysílání."}
              </p>

              {isDemoRequest ? (
                <div
                  style={{
                    marginBottom: 18,
                    padding: 16,
                    borderRadius: 16,
                    background: "#eefaf0",
                    color: "#166534",
                    border: "1px solid #cfe8d3",
                    lineHeight: 1.7,
                  }}
                >
                  Ukázkový přístup slouží pouze k prohlížení prostředí
                  ARCHIMEDES Live. Neumožňuje správu školy, vytváření událostí
                  ani spuštění vysílání.
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

                {!isDemoRequest ? (
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
                ) : null}

                <div>
                  <label
                    style={{ display: "block", marginBottom: 8, fontWeight: 600 }}
                  >
                    {isDemoRequest ? "Škola / organizace*" : "Název obce*"}
                  </label>
                  <input
                    name="organization"
                    required
                    value={form.organization}
                    onChange={updateField}
                    placeholder={
                      isDemoRequest
                        ? "Např. ZŠ Hodonín, Gymnázium Vyškov..."
                        : "Např. Obec Křenov"
                    }
                    style={fieldStyle}
                  />
                  <div style={helperStyle}>
                    {isDemoRequest
                      ? "Napište prosím školu nebo organizaci, pro kterou chcete ukázkové prostředí zobrazit."
                      : "Napište prosím název obce, která má o program zájem."}
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
                    {isDemoRequest ? "Telefon (volitelně)" : "Telefon*"}
                  </label>
                  <input
                    name="phone"
                    required={!isDemoRequest}
                    value={form.phone}
                    onChange={updateField}
                    style={fieldStyle}
                  />
                </div>

                <div>
                  <label
                    style={{ display: "block", marginBottom: 8, fontWeight: 600 }}
                  >
                    {isDemoRequest ? "Adresa*" : "Adresa obecního úřadu*"}
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
                    {isDemoRequest
                      ? "Uveďte prosím adresu školy nebo organizace."
                      : "Uveďte prosím adresu obecního úřadu."}
                  </div>
                </div>

                {isDemoRequest ? (
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
                      Pokud zatím nevystupujete za konkrétní organizaci, zvolte
                      „Jiné / zatím neurčeno“.
                    </div>
                  </div>
                ) : null}

                {!isDemoRequest ? (
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
                ) : null}

                {!isDemoRequest ? (
                  <div>
                    <label
                      style={{ display: "block", marginBottom: 8, fontWeight: 600 }}
                    >
                      Preferovaný termín prvního vysílání (volitelně)
                    </label>
                    <input
                      type="date"
                      name="preferredDate"
                      value={form.preferredDate}
                      onChange={updateField}
                      style={fieldStyle}
                    />
                    <div style={helperStyle}>
                      Nezávazně, potvrdíme spolu na hovoru.
                    </div>
                  </div>
                ) : null}

                <div>
                  <label
                    style={{ display: "block", marginBottom: 8, fontWeight: 600 }}
                  >
                    {isDemoRequest ? "Poznámka" : "Zpráva (volitelně)"}
                  </label>
                  <textarea
                    name="message"
                    rows={5}
                    value={form.message}
                    onChange={updateField}
                    style={{ ...fieldStyle, resize: "vertical" }}
                    placeholder={
                      isDemoRequest
                        ? "Můžete doplnit, jakou roli ve škole máte, co vás zajímá nejvíce nebo co byste si chtěli v ukázce ověřit."
                        : "Můžete doplnit cokoli, co nám pomůže se na hovor lépe připravit."
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
                        ? "Požádat o ukázkový přístup"
                        : "Odeslat žádost"}
                  </button>

                  <Link
                    href={isDemoRequest ? "/demo" : "/"}
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
                    {isDemoRequest ? "Zpět na ukázku" : "Zpět na hlavní stránku"}
                  </Link>
                </div>
              </form>

              {!isDemoRequest ? (
                <p
                  style={{
                    marginTop: 20,
                    marginBottom: 0,
                    fontSize: 14,
                    lineHeight: 1.6,
                    color: "rgba(0,0,0,0.62)",
                  }}
                >
                  Zastupujete spolek nebo organizaci, ne obecní úřad? Napište
                  nám raději přímo →{" "}
                  <Link href="/kontakt" style={{ color: "#111827", fontWeight: 700 }}>
                    /kontakt
                  </Link>
                  .
                </p>
              ) : null}
            </>
          ) : (
            <>
              <h1 style={{ marginTop: 0, fontSize: 34, lineHeight: 1.12 }}>
                {isDemoRequest
                  ? "Žádost o ukázkový přístup jsme přijali"
                  : "Žádost jsme přijali"}
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
                {isDemoRequest ? (
                  <>
                    <div>1. Vaši žádost zkontrolujeme a schválíme.</div>
                    <div>
                      2. Na zadaný e-mail obdržíte zprávu s přístupem, který vás jedním kliknutím zavede přímo do ukázkového prostředí.
                    </div>
                    <div>
                      3. Poté vstoupíte do ukázkového prostředí ARCHIMEDES Live.
                    </div>
                  </>
                ) : (
                  <>
                    <div>1. Vaši žádost zaevidujeme.</div>
                    <div>2. Zavoláme vám a domluvíme termín prvního vysílání.</div>
                    <div>3. Obec získá přístup a program může začít.</div>
                  </>
                )}
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
                  {isDemoRequest ? "Zpět na ukázku" : "Přejít na přihlášení"}
                </Link>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
