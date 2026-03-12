import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { supabase } from "../lib/supabaseClient";

const ORG_TYPES = [
  { value: "school", label: "Škola" },
  { value: "municipality", label: "Obec / město" },
  { value: "senior_club", label: "Senior klub" },
  { value: "association", label: "Spolek" },
  { value: "community_center", label: "Komunitní centrum" },
  { value: "diaspora", label: "Krajanská organizace" },
  { value: "partner", label: "Partner" },
];

export default function CreateOrganizationPage() {
  const router = useRouter();

  const [organizationName, setOrganizationName] = useState("");
  const [orgType, setOrgType] = useState("school");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [createdOrganizationName, setCreatedOrganizationName] = useState("");
  const [createdJoinCode, setCreatedJoinCode] = useState("");
  const [copyMessage, setCopyMessage] = useState("");

  async function handleCreate(e) {
    e.preventDefault();
    setError("");
    setCopyMessage("");
    setCreatedOrganizationName("");
    setCreatedJoinCode("");
    setLoading(true);

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) throw sessionError;

      const accessToken = session?.access_token;
      const user = session?.user;

      if (!user || !accessToken) {
        throw new Error("Nejste přihlášen.");
      }

      const response = await fetch("/api/create-organization", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          organizationName,
          orgType,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error || "Nepodařilo se vytvořit organizaci.");
      }

      setCreatedOrganizationName(result?.organizationName || organizationName);
      setCreatedJoinCode(result?.joinCode || "");
    } catch (e) {
      setError(e.message || "Chyba při vytváření organizace.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopyCode() {
    try {
      if (!createdJoinCode) return;
      await navigator.clipboard.writeText(createdJoinCode);
      setCopyMessage("Kód organizace byl zkopírován.");
      setTimeout(() => setCopyMessage(""), 1800);
    } catch (_e) {
      setCopyMessage("Kód zkopírujte ručně.");
      setTimeout(() => setCopyMessage(""), 1800);
    }
  }

  const createdSuccessfully = !!createdJoinCode;

  return (
    <main
      style={{
        maxWidth: 760,
        margin: "70px auto",
        padding: 20,
        fontFamily: "system-ui",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 24,
          padding: 28,
          boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
          border: "1px solid rgba(0,0,0,0.08)",
        }}
      >
        <h1 style={{ marginTop: 0, marginBottom: 8 }}>Vytvořit organizaci</h1>

        <p style={{ marginTop: 0, color: "rgba(0,0,0,0.65)" }}>
          Založíte novou organizaci a automaticky se stanete jejím administrátorem.
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
            {error}
          </div>
        ) : null}

        {createdSuccessfully ? (
          <div
            style={{
              marginBottom: 18,
              padding: 18,
              borderRadius: 16,
              background: "#eefaf0",
              color: "#166534",
              border: "1px solid #cfe8d3",
            }}
          >
            <div style={{ fontWeight: 800, marginBottom: 6 }}>
              Organizace byla úspěšně vytvořena.
            </div>

            {createdOrganizationName ? (
              <div style={{ marginBottom: 10 }}>
                Organizace: <strong>{createdOrganizationName}</strong>
              </div>
            ) : null}

            <div style={{ fontSize: 14, color: "rgba(0,0,0,0.65)", marginBottom: 6 }}>
              Kód organizace
            </div>

            <div
              style={{
                fontSize: 24,
                fontWeight: 800,
                letterSpacing: "0.05em",
                fontFamily:
                  "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                marginBottom: 12,
                color: "#111827",
              }}
            >
              {createdJoinCode}
            </div>

            <div style={{ color: "rgba(0,0,0,0.68)", marginBottom: 14 }}>
              Tento kód můžete poslat kolegům. Připojí se přes stránku <strong>/join</strong>.
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={handleCopyCode}
                style={{
                  padding: "11px 14px",
                  borderRadius: 12,
                  border: "1px solid rgba(0,0,0,0.12)",
                  background: "#fff",
                  color: "#111827",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Zkopírovat kód
              </button>

              <button
                type="button"
                onClick={() => router.push("/portal/uzivatele")}
                style={{
                  padding: "11px 14px",
                  borderRadius: 12,
                  border: "none",
                  background: "#111827",
                  color: "#fff",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Pokračovat do správy uživatelů
              </button>
            </div>

            {copyMessage ? (
              <div style={{ marginTop: 10, fontSize: 14, color: "#166534" }}>
                {copyMessage}
              </div>
            ) : null}
          </div>
        ) : null}

        {!createdSuccessfully ? (
          <form onSubmit={handleCreate}>
            <div style={{ display: "grid", gap: 16 }}>
              <div>
                <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>
                  Název organizace
                </label>
                <input
                  type="text"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  placeholder="Např. ZŠ Hodonín nebo Senior klub Křenov"
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: 12,
                    border: "1px solid rgba(0,0,0,0.15)",
                    background: "#fff",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>
                  Typ organizace
                </label>
                <select
                  value={orgType}
                  onChange={(e) => setOrgType(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: 12,
                    border: "1px solid rgba(0,0,0,0.15)",
                    background: "#fff",
                  }}
                >
                  {ORG_TYPES.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              <div
                style={{
                  padding: 14,
                  borderRadius: 14,
                  background: "#f8fafc",
                  border: "1px solid rgba(0,0,0,0.08)",
                  color: "rgba(0,0,0,0.68)",
                  fontSize: 14,
                }}
              >
                Po vytvoření získáte vlastní <strong>kód organizace</strong>, který můžete poslat
                kolegům. Vy se automaticky stanete <strong>administrátorem organizace</strong>.
              </div>

              <div style={{ paddingTop: 6 }}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: "12px 18px",
                    borderRadius: 12,
                    border: "none",
                    background: "#111827",
                    color: "#fff",
                    fontWeight: 700,
                    cursor: loading ? "default" : "pointer",
                    opacity: loading ? 0.7 : 1,
                  }}
                >
                  {loading ? "Vytvářím..." : "Vytvořit organizaci"}
                </button>
              </div>
            </div>
          </form>
        ) : null}

        <div style={{ marginTop: 18, color: "rgba(0,0,0,0.6)" }}>
          Máte kód organizace? <Link href="/join">Připojte se ke stávající organizaci</Link>
        </div>
      </div>
    </main>
  );
}
