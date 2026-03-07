import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";
import RequireAuth from "../components/RequireAuth";
import PortalHeader from "../components/PortalHeader";

export default function WelcomePage() {
  const router = useRouter();
  const [savingIndividual, setSavingIndividual] = useState(false);
  const [error, setError] = useState("");

  async function continueAsIndividual() {
    setSavingIndividual(true);
    setError("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) throw new Error("Uživatel není přihlášen.");

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ user_type: "individual" })
        .eq("id", user.id);

      if (updateError) throw updateError;

      router.push("/portal");
    } catch (e) {
      setError(e.message || "Nepodařilo se pokračovat jako jednotlivec.");
    } finally {
      setSavingIndividual(false);
    }
  }

  return (
    <RequireAuth>
      <div style={{ minHeight: "100vh", background: "#f6f7fb" }}>
        <PortalHeader />

        <main style={{ maxWidth: 980, margin: "0 auto", padding: "40px 16px" }}>
          <div
            style={{
              background: "#fff",
              borderRadius: 24,
              padding: 28,
              boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
              border: "1px solid rgba(0,0,0,0.08)",
              marginBottom: 22,
            }}
          >
            <h1 style={{ marginTop: 0, marginBottom: 8, fontSize: 34 }}>
              Jak chcete ARCHIMEDES Live používat?
            </h1>

            <p style={{ marginTop: 0, color: "rgba(0,0,0,0.65)" }}>
              Vyberte si způsob, který vám nejlépe vyhovuje.
            </p>

            {error ? (
              <div
                style={{
                  marginTop: 16,
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
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 18,
            }}
          >
            <div
              style={{
                background: "#fff",
                borderRadius: 20,
                padding: 22,
                border: "1px solid rgba(0,0,0,0.08)",
                boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
              }}
            >
              <h2 style={{ marginTop: 0 }}>Mám kód organizace</h2>

              <p style={{ color: "rgba(0,0,0,0.65)" }}>
                Připojte se ke škole, obci, senior klubu nebo jiné organizaci.
              </p>

              <Link
                href="/join"
                style={{
                  display: "inline-block",
                  marginTop: 10,
                  padding: "10px 14px",
                  borderRadius: 12,
                  background: "#111827",
                  color: "#fff",
                  textDecoration: "none",
                  fontWeight: 700,
                }}
              >
                Připojit se ke stávající organizaci
              </Link>
            </div>

            <div
              style={{
                background: "#fff",
                borderRadius: 20,
                padding: 22,
                border: "1px solid rgba(0,0,0,0.08)",
                boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
              }}
            >
              <h2 style={{ marginTop: 0 }}>Chci vytvořit organizaci</h2>

              <p style={{ color: "rgba(0,0,0,0.65)" }}>
                Založte školu, obec, senior klub nebo jinou organizaci.
              </p>

              <Link
                href="/create-organization"
                style={{
                  display: "inline-block",
                  marginTop: 10,
                  padding: "10px 14px",
                  borderRadius: 12,
                  background: "#111827",
                  color: "#fff",
                  textDecoration: "none",
                  fontWeight: 700,
                }}
              >
                Vytvořit organizaci
              </Link>
            </div>

            <div
              style={{
                background: "#fff",
                borderRadius: 20,
                padding: 22,
                border: "1px solid rgba(0,0,0,0.08)",
                boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
              }}
            >
              <h2 style={{ marginTop: 0 }}>Pokračovat jako jednotlivec</h2>

              <p style={{ color: "rgba(0,0,0,0.65)" }}>
                Používejte ARCHIMEDES Live bez organizace.
              </p>

              <button
                type="button"
                onClick={continueAsIndividual}
                disabled={savingIndividual}
                style={{
                  display: "inline-block",
                  marginTop: 10,
                  padding: "10px 14px",
                  borderRadius: 12,
                  background: "#111827",
                  color: "#fff",
                  fontWeight: 700,
                  border: "none",
                  cursor: savingIndividual ? "default" : "pointer",
                  opacity: savingIndividual ? 0.7 : 1,
                }}
              >
                {savingIndividual ? "Pokračuji..." : "Pokračovat"}
              </button>
            </div>
          </div>
        </main>
      </div>
    </RequireAuth>
  );
}
