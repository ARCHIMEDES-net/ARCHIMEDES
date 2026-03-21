import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";

export default function ResetHeslaPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [requestLoading, setRequestLoading] = useState(false);

  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [modeReady, setModeReady] = useState(false);

  const isRecoveryMode = useMemo(() => {
    if (typeof window === "undefined") return false;

    const hash = window.location.hash || "";
    const search = window.location.search || "";

    return (
      hash.includes("access_token=") ||
      hash.includes("type=recovery") ||
      search.includes("type=recovery")
    );
  }, [router.asPath]);

  useEffect(() => {
    let alive = true;

    async function initRecoverySession() {
      try {
        setError("");
        setMessage("");

        const hash = window.location.hash || "";
        const search = window.location.search || "";
        const hasRecoveryParams =
          hash.includes("access_token=") ||
          hash.includes("type=recovery") ||
          search.includes("type=recovery");

        if (!hasRecoveryParams) {
          if (alive) setModeReady(true);
          return;
        }

        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        if (!session) {
          const {
            data: { session: refreshedSession },
            error: refreshedError,
          } = await supabase.auth.refreshSession();

          if (refreshedError) {
            throw refreshedError;
          }

          if (!refreshedSession) {
            throw new Error(
              "Odkaz pro nastavení hesla je neplatný nebo vypršel. Požádejte prosím o nový."
            );
          }
        }

        if (alive) {
          setModeReady(true);
          setMessage("Ověření proběhlo. Nyní si nastavte nové heslo.");
        }
      } catch (e) {
        if (!alive) return;
        setError(
          e?.message ||
            "Odkaz pro nastavení hesla je neplatný nebo vypršel. Požádejte prosím o nový."
        );
        setModeReady(true);
      }
    }

    initRecoverySession();

    return () => {
      alive = false;
    };
  }, [router.asPath]);

  async function handleRequestReset(e) {
    e.preventDefault();
    setRequestLoading(true);
    setError("");
    setMessage("");

    try {
      const trimmedEmail = email.trim().toLowerCase();

      if (!trimmedEmail) {
        throw new Error("Vyplňte prosím e-mail.");
      }

      const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
        redirectTo: `${window.location.origin}/reset-hesla`,
      });

      if (error) {
        throw new Error(
          error.message || "Nepodařilo se odeslat odkaz pro obnovu hesla."
        );
      }

      setMessage(
        "Pokud je tento e-mail v systému registrován, poslali jsme vám odkaz pro nastavení nového hesla."
      );
    } catch (e) {
      setError(e?.message || "Nepodařilo se odeslat odkaz pro obnovu hesla.");
    } finally {
      setRequestLoading(false);
    }
  }

  async function handleSetNewPassword(e) {
    e.preventDefault();
    setResetLoading(true);
    setError("");
    setMessage("");

    try {
      const p1 = password.trim();
      const p2 = password2.trim();

      if (!p1 || p1.length < 8) {
        throw new Error("Nové heslo musí mít alespoň 8 znaků.");
      }

      if (p1 !== p2) {
        throw new Error("Hesla se neshodují.");
      }

      const { error } = await supabase.auth.updateUser({
        password: p1,
      });

      if (error) {
        throw new Error(error.message || "Nepodařilo se uložit nové heslo.");
      }

      setMessage("Heslo bylo úspěšně nastaveno. Za chvíli budete přesměrováni.");
      setPassword("");
      setPassword2("");

      setTimeout(() => {
        router.replace("/portal");
      }, 1400);
    } catch (e) {
      setError(e?.message || "Nepodařilo se uložit nové heslo.");
    } finally {
      setResetLoading(false);
    }
  }

  if (!modeReady) {
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
          Načítám…
        </div>
      </main>
    );
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
            {isRecoveryMode ? "Nastavení nového hesla" : "Obnova hesla"}
          </h1>

          <p
            style={{
              margin: "10px 0 0",
              fontSize: 16,
              lineHeight: 1.65,
              color: "rgba(15,23,42,0.68)",
            }}
          >
            {isRecoveryMode
              ? "Zadejte nové heslo pro svůj účet ARCHIMEDES Live."
              : "Zadejte e-mail, pod kterým jste registrováni. Pošleme vám odkaz pro nastavení nového hesla."}
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

        {!isRecoveryMode ? (
          <form onSubmit={handleRequestReset}>
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
                disabled={requestLoading}
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
                  cursor: requestLoading ? "default" : "pointer",
                }}
              >
                {requestLoading ? "Odesílám..." : "Poslat odkaz"}
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
        ) : (
          <form onSubmit={handleSetNewPassword}>
            <div style={{ marginBottom: 18 }}>
              <label
                htmlFor="password"
                style={{
                  display: "block",
                  marginBottom: 8,
                  fontSize: 15,
                  fontWeight: 800,
                  color: "#0f172a",
                }}
              >
                Nové heslo
              </label>

              <input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

            <div style={{ marginBottom: 18 }}>
              <label
                htmlFor="password2"
                style={{
                  display: "block",
                  marginBottom: 8,
                  fontSize: 15,
                  fontWeight: 800,
                  color: "#0f172a",
                }}
              >
                Potvrzení nového hesla
              </label>

              <input
                id="password2"
                type="password"
                autoComplete="new-password"
                required
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
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
                disabled={resetLoading}
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
                  cursor: resetLoading ? "default" : "pointer",
                }}
              >
                {resetLoading ? "Ukládám..." : "Nastavit heslo"}
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
        )}
      </div>
    </main>
  );
}
