import { useState } from "react";
import Link from "next/link";

const INTEREST_SECTIONS = [
  {
    title: "🎓 Pro školu",
    items: [
      { code: "skola_1_stupen", label: "1. stupeň ZŠ" },
      { code: "skola_2_stupen", label: "2. stupeň ZŠ" },
      { code: "ucitele", label: "Učitelé" },
      { code: "karierni_poradenstvi", label: "Kariérní poradenství" },
    ],
  },
  {
    title: "🌍 Témata",
    items: [
      { code: "veda_a_objevy", label: "Věda a objevy" },
      { code: "priroda_a_ekologie", label: "Příroda a ekologie" },
      { code: "historie_a_archeologie", label: "Historie a archeologie" },
      { code: "wellbeing", label: "Wellbeing" },
      { code: "svet_v_souvislostech", label: "Svět v souvislostech" },
      { code: "anglictina", label: "Vysílání v angličtině" },
    ],
  },
  {
    title: "🏛️ Kluby a programy",
    items: [
      { code: "ctenarsky_klub", label: "Čtenářský klub" },
      { code: "filmovy_klub", label: "Filmový klub" },
    ],
  },
  {
    title: "👥 Pro komunitu a spolky",
    items: [
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
    ],
  },
];

export default function PridatSeKOrganizaciPage() {
  const [joinCode, setJoinCode] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [selected, setSelected] = useState([]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  function toggle(code) {
    setSelected((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  }

  async function submitForm(e) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const trimmedJoinCode = joinCode.trim();
      const trimmedName = fullName.trim();
      const trimmedEmail = email.trim();

      if (!trimmedJoinCode) {
        throw new Error("Vyplňte prosím kód organizace.");
      }

      if (!trimmedName) {
        throw new Error("Vyplňte prosím jméno a příjmení.");
      }

      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail);
      if (!emailOk) {
        throw new Error("Zadejte prosím platný e-mail.");
      }

      if (selected.length === 0) {
        throw new Error("Vyberte prosím alespoň jeden okruh, o který máte zájem.");
      }

      const res = await fetch("/api/pridat-se-k-organizaci", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          joinCode: trimmedJoinCode,
          fullName: trimmedName,
          email: trimmedEmail,
          activityCodes: selected,
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

      setResult(data);
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

  const cardStyle = {
    background: "#fff",
    borderRadius: 24,
    padding: 28,
    boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
    border: "1px solid rgba(0,0,0,0.08)",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f6f7fb" }}>
      <main style={{ maxWidth: 820, margin: "0 auto", padding: "40px 16px" }}>
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
            {result ? "Zaregistrováno" : "Upozornění na vysílání a program"}
          </div>

          {!result ? (
            <>
              <h1 style={{ marginTop: 0, fontSize: 34, lineHeight: 1.12 }}>
                Chci dostávat upozornění na vysílání ARCHIMEDES Live
              </h1>

              <p style={{ color: "rgba(0,0,0,0.72)", lineHeight: 1.7, marginBottom: 8, fontSize: 17 }}>
                Zadejte kód vaší organizace (spolku nebo školy) a vyberte, o
                jaké vysílání a program máte zájem — budeme vám posílat jen
                upozornění na to, co si zvolíte.
              </p>

              <p style={{ color: "rgba(0,0,0,0.55)", lineHeight: 1.6, marginBottom: 20, fontSize: 14 }}>
                Kód organizace vám sdělí kontaktní osoba vašeho spolku nebo
                školy, která už má ARCHIMEDES Live aktivovaný.
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
                    Kód organizace*
                  </label>
                  <input
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    placeholder="Např. ORG-A1B2C3D4"
                    style={fieldStyle}
                  />
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>
                    Jméno a příjmení*
                  </label>
                  <input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    style={fieldStyle}
                  />
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>
                    E-mail*
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={fieldStyle}
                  />
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: 12, fontWeight: 600 }}>
                    O co máte zájem?*
                  </label>

                  <div style={{ display: "grid", gap: 20 }}>
                    {INTEREST_SECTIONS.map((section) => (
                      <div key={section.title}>
                        <div style={{ fontWeight: 700, marginBottom: 10, fontSize: 15 }}>
                          {section.title}
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                          {section.items.map((item) => {
                            const active = selected.includes(item.code);
                            return (
                              <button
                                key={item.code}
                                type="button"
                                onClick={() => toggle(item.code)}
                                style={{
                                  appearance: "none",
                                  border: "1px solid rgba(0,0,0,0.15)",
                                  background: active ? "#111827" : "#fff",
                                  color: active ? "#fff" : "#111827",
                                  borderColor: active ? "#111827" : "rgba(0,0,0,0.15)",
                                  padding: "10px 14px",
                                  borderRadius: 999,
                                  fontSize: 14,
                                  fontWeight: 700,
                                  cursor: "pointer",
                                }}
                              >
                                {item.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

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
                    {saving ? "Odesílám..." : "Zaregistrovat se k upozorněním"}
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
                Jste zaregistrováni
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
                Budeme vám posílat upozornění na vysílání a program
                ARCHIMEDES Live pro organizaci „{result.organizationName}“
                podle vybraných okruhů.
                {result.emailSent === false
                  ? " Potvrzovací e-mail se teď nepodařilo odeslat, ale registrace proběhla v pořádku."
                  : ""}
              </div>

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
            </>
          )}
        </div>
      </main>
    </div>
  );
}
