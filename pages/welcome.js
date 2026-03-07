import Link from "next/link";
import RequireAuth from "../components/RequireAuth";
import PortalHeader from "../components/PortalHeader";

export default function WelcomePage() {
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

              <Link
                href="/portal"
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
                Pokračovat
              </Link>
            </div>
          </div>
        </main>
      </div>
    </RequireAuth>
  );
}
