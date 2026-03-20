import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Neplatné přihlašovací údaje.");
      setLoading(false);
      return;
    }

    window.location.href = "/portal";
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f6f7fb",
        padding: 16,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "#fff",
          borderRadius: 20,
          padding: 28,
          boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
          border: "1px solid rgba(0,0,0,0.08)",
        }}
      >
        <h1 style={{ marginTop: 0 }}>Přihlášení</h1>

        <p style={{ color: "rgba(0,0,0,0.65)", marginBottom: 20 }}>
          Přihlaste se do svého účtu ARCHIMEDES Live.
        </p>

        {error && (
          <div
            style={{
              background: "#fff1f1",
              border: "1px solid #f2c9c9",
              padding: 10,
              borderRadius: 10,
              marginBottom: 16,
              color: "#a40000",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 12 }}>
            <label>E-mail</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={input}
            />
          </div>

          <div style={{ marginBottom: 8 }}>
            <label>Heslo</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={input}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <a href="/reset-hesla" style={{ fontSize: 13 }}>
              Zapomenuté heslo
            </a>
          </div>

          {/* CTA ROW */}
          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              marginBottom: 20,
            }}
          >
            <button type="submit" disabled={loading} style={primaryBtn}>
              {loading ? "Přihlašuji..." : "Přihlásit se"}
            </button>

            <a href="/poptavka" style={secondaryBtn}>
              Nemám registraci
            </a>
          </div>
        </form>

        {/* JOIN SECTION */}
        <div
          style={{
            borderTop: "1px solid rgba(0,0,0,0.08)",
            paddingTop: 20,
            marginTop: 10,
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: 10 }}>
            Dostali jste pozvánku od administrátora?
          </div>

          <a href="/join" style={primaryBtnFull}>
            Připojit k organizaci
          </a>
        </div>
      </div>
    </div>
  );
}

/* STYLY */

const input = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid rgba(0,0,0,0.15)",
  marginTop: 4,
};

const primaryBtn = {
  background: "#111827",
  color: "#fff",
  border: "none",
  padding: "10px 14px",
  borderRadius: 10,
  cursor: "pointer",
  fontWeight: 600,
};

const primaryBtnFull = {
  display: "block",
  width: "100%",
  textAlign: "center",
  background: "#111827",
  color: "#fff",
  padding: "12px",
  borderRadius: 12,
  textDecoration: "none",
  fontWeight: 700,
};

const secondaryBtn = {
  background: "#fff",
  color: "#111827",
  border: "1px solid rgba(0,0,0,0.2)",
  padding: "10px 14px",
  borderRadius: 10,
  textDecoration: "none",
  fontWeight: 600,
};
