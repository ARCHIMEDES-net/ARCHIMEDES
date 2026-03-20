import { useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabaseClient";

export default function ResetHeslaPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      setError("Vyplňte prosím e-mail.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
      redirectTo: `${window.location.origin}/login`,
    });

    if (error) {
      setError(error.message || "Nepodařilo se odeslat odkaz pro obnovu hesla.");
      setLoading(false);
      return;
    }

    setMessage(
      "Pokud je tento e-mail v systému registrován, poslali jsme vám odkaz pro nastavení nového hesla."
    );
    setLoading(false);
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f5f7fb",
        padding: "48px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily:
          'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 560,
          background: "#fff",
          borderRadius: 28,
          border: "1px solid rgba(15,23,42,0.08)",
          boxShadow: "0 20px 60px rgba(15,23,42,0.08)",
          padding: "26px 26px 24px",
        }}
      >
        <div style={{ marginBottom: 18 }}>
          <h1
            style={{
              margin: 0,
              fontSize: 32,
              lineHeight: 1.08,
              letterSpacing: "-0.03em",
              color: "#0f172a",
            }}
          >
            Obnova hesla
          </h1>

          <p
            style={{
              margin: "10px 0 0",
              fontSize: 16,
              lineHeight: 1.65,
              color: "rgba(15,23,42,0.68)",
            }}
          >
            Zadejte e-mail, pod kterým jste registrováni. Pošleme vám odkaz pro
            nastavení nového hesla.
          </p>
        </div>

        {error ? (
          <div
            style={{
              marginBottom: 16,
              padding: "12px 14px",
              borderRadius: 14,
              background: "#fff1f2",
              border: "1px solid #fecdd3",
              color: "#be123c",
              fontSize: 14,
              lineHeight: 1.5,
            }}
          >
            {error}
          </div>
        ) : null}

        {message ? (
          <div
            style={{
              marginBottom: 16,
              padding: "12px 14px",
              borderRadius: 14,
              background: "#ecfdf5",
              border: "1px solid #bbf7d0",
              color: "#166534",
              fontSize: 14,
              lineHeight: 1.5,
            }}
          >
            {message}
          </div>
        ) : null}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 18 }}>
            <label
              htmlFor="email"
              style={{
                display: "block",
                marginBottom: 8,
                fontSize: 15,
                fontWeight: 800,
                color: "#0f172a",
              }}
            >
              E-mail
            </label>

            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: "100%",
                minHeight: 54,
                padding: "0 16px",
                borderRadius: 16,
                border: "1px solid rgba(15,23,42,0.14)",
                fontSize: 16,
                color: "#0f172a",
                background: "#fff",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              marginBottom: 14,
            }}
          >
            <button
              type="submit"
              disabled={loading}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 48,
                padding: "0 18px",
                borderRadius: 14,
                border: "1px solid #0f172a",
                background: "#0f172a",
                color: "#fff",
                fontWeight: 800,
                fontSize: 15,
                cursor: loading ? "default" : "pointer",
              }}
            >
              {loading ? "Odesílám..." : "Poslat odkaz"}
            </button>

            <Link
              href="/login"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 48,
                padding: "0 18px",
                borderRadius: 14,
                border: "1px solid rgba(15,23,42,0.14)",
                background: "#fff",
                color: "#0f172a",
                fontWeight: 800,
                fontSize: 15,
                textDecoration: "none",
              }}
            >
              Zpět na přihlášení
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
