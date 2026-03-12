import { useState } from "react";
import Link from "next/link";

export default function DemoPage() {
  const [organizationName, setOrganizationName] = useState("");
  const [email, setEmail] = useState("");
  const [orgType, setOrgType] = useState("school");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const response = await fetch("/api/start-demo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          organizationName,
          email,
          orgType,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error || "Nepodařilo se spustit demo.");
      }

      setSuccess(true);
      setOrganizationName("");
      setEmail("");
      setOrgType("school");
    } catch (e) {
      setError(e.message || "Nepodařilo se spustit demo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f6f7fb",
        padding: "48px 16px",
        fontFamily: "system-ui",
      }}
    >
      <div
        style={{
          maxWidth: 760,
          margin: "0 auto",
          background: "#fff",
          borderRadius: 24,
          padding: 32,
          boxShadow: "0 16px 40px rgba(15,23,42,0.06)",
          border: "1px solid rgba(15,23,42,0.08)",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "6px 12px",
            borderRadius: 999,
            background: "#eef2ff",
            color: "#3730a3",
            fontSize: 12,
            fontWeight: 800,
            marginBottom: 14,
          }}
        >
          DEMO ARCHIMEDES Live
        </div>

        <h1
          style={{
            margin: 0,
            fontSize: 38,
            lineHeight: 1.08,
            color: "#0f172a",
          }}
        >
          Vyzkoušejte ARCHIMEDES Live
        </h1>

        <p
          style={{
            marginTop: 14,
            marginBottom: 0,
            fontSize: 17,
            lineHeight: 1.65,
            color: "rgba(15,23,42,0.72)",
            maxWidth: 640,
          }}
        >
          Získejte demo přístup do portálu pro školu, obec nebo organizaci.
          Uvidíte kalendář programu, síť učeben a fungování systému v praxi.
        </p>

        <div
          style={{
            marginTop: 22,
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0,1fr))",
            gap: 12,
          }}
        >
          <Feature text="14 dní demo přístup" />
          <Feature text="1 ukázková hodina zdarma" />
          <Feature text="Přehled programu" />
          <Feature text="Síť učeben ARCHIMEDES" />
        </div>

        {error ? (
          <div
            style={{
              marginTop: 22,
              padding: 14,
              borderRadius: 14,
              background: "#fff1f1",
              color: "#a40000",
              border: "1px solid #f2c9c9",
            }}
          >
            {error}
          </div>
        ) : null}

        {success ? (
          <div
            style={{
              marginTop: 22,
              padding: 18,
              borderRadius: 16,
              background: "#eefaf0",
              color: "#166534",
              border: "1px solid #cfe8d3",
            }}
          >
            <div style={{ fontWeight: 800, marginBottom: 8 }}>
              Demo bylo úspěšně spuštěno.
            </div>
            <div style={{ lineHeight: 1.6 }}>
              Na zadaný e-mail jsme poslali pozvánku do portálu.
              Po otevření e-mailu se přihlásíte do ARCHIMEDES Live.
            </div>

            <div style={{ marginTop: 14 }}>
              <Link
                href="/login"
                style={{
                  display: "inline-flex",
                  textDecoration: "none",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "12px 16px",
                  borderRadius: 12,
                  background: "#111827",
                  color: "#fff",
                  fontWeight: 800,
                }}
              >
                Otevřít přihlášení
              </Link>
            </div>
          </div>
        ) : null}

        {!success ? (
          <form onSubmit={handleSubmit} style={{ marginTop: 26 }}>
            <div style={{ display: "grid", gap: 16 }}>
              <div>
                <label style={{ display: "block", marginBottom: 8, fontWeight: 700 }}>
                  Název školy / organizace
                </label>
                <input
                  type="text"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  placeholder="Např. ZŠ Hodonín nebo Obec Křenov"
                  style={inputStyle}
                  required
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: 8, fontWeight: 700 }}>
                  E-mail
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="napr. reditel@skola.cz"
                  style={inputStyle}
                  required
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: 8, fontWeight: 700 }}>
                  Typ organizace
                </label>
                <select
                  value={orgType}
                  onChange={(e) => setOrgType(e.target.value)}
                  style={inputStyle}
                >
                  <option value="school">Škola</option>
                  <option value="municipality">Obec / město</option>
                  <option value="association">Spolek</option>
                  <option value="community_center">Komunitní centrum</option>
                  <option value="partner">Partner</option>
                </select>
              </div>

              <div
                style={{
                  padding: 14,
                  borderRadius: 14,
                  background: "#f8fafc",
                  border: "1px solid rgba(15,23,42,0.08)",
                  color: "rgba(15,23,42,0.68)",
                  fontSize: 14,
                  lineHeight: 1.6,
                }}
              >
                Po odeslání vytvoříme demo organizaci a pošleme vám přístup do portálu.
                Demo přístup je časově omezený a slouží k vyzkoušení systému.
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    border: "none",
                    cursor: loading ? "default" : "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "14px 20px",
                    borderRadius: 14,
                    background: "#0f172a",
                    color: "white",
                    fontWeight: 900,
                    fontSize: 16,
                    opacity: loading ? 0.7 : 1,
                  }}
                >
                  {loading ? "Spouštím demo..." : "Spustit demo"}
                </button>
              </div>
            </div>
          </form>
        ) : null}
      </div>
    </main>
  );
}

function Feature({ text }) {
  return (
    <div
      style={{
        background: "#f8fafc",
        border: "1px solid rgba(15,23,42,0.08)",
        borderRadius: 16,
        padding: "14px 16px",
        fontWeight: 700,
        color: "#0f172a",
      }}
    >
      {text}
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid rgba(15,23,42,0.15)",
  background: "#fff",
  fontSize: 15,
  boxSizing: "border-box",
};
