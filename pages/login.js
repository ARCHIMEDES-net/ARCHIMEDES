import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";

function readAuthParams() {
  if (typeof window === "undefined") {
    return {
      code: "",
      tokenHash: "",
      type: "",
      accessTokenInHash: false,
      errorCode: "",
      errorDescription: "",
    };
  }

  const search = new URLSearchParams(window.location.search);
  const hash = new URLSearchParams(
    window.location.hash?.startsWith("#")
      ? window.location.hash.slice(1)
      : window.location.hash || ""
  );

  return {
    code: search.get("code") || "",
    tokenHash: search.get("token_hash") || "",
    type: search.get("type") || hash.get("type") || "",
    accessTokenInHash: !!hash.get("access_token"),
    errorCode: hash.get("error_code") || search.get("error_code") || "",
    errorDescription:
      hash.get("error_description") || search.get("error_description") || "",
  };
}

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [checkingLink, setCheckingLink] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handledRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function handleMagicLinkFlow() {
      try {
        const {
          code,
          tokenHash,
          type,
          accessTokenInHash,
          errorCode,
          errorDescription,
        } = readAuthParams();

        if (errorCode) {
          if (!cancelled) {
            setError(
              errorDescription
                ? decodeURIComponent(errorDescription.replace(/\+/g, " "))
                : "Odkaz pro přihlášení nebo obnovu hesla není platný."
            );
            setCheckingLink(false);
          }
          return;
        }

        if (code) {
          const { error: exchangeError } =
            await supabase.auth.exchangeCodeForSession(code);

          if (exchangeError) {
            if (!cancelled) {
              setError(
                exchangeError.message ||
                  "Nepodařilo se dokončit přihlášení přes odkaz."
              );
            }
          } else if (!cancelled) {
            router.replace("/portal");
            return;
          }

          if (!cancelled) setCheckingLink(false);
          return;
        }

        if (tokenHash && type) {
          const { error: verifyError } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type,
          });

          if (verifyError) {
            if (!cancelled) {
              setError(
                verifyError.message ||
                  "Ověřovací odkaz je neplatný nebo expiroval."
              );
            }
            if (!cancelled) setCheckingLink(false);
            return;
          }

          if (!cancelled) {
            if (type === "recovery") {
              setMessage(
                "Ověření proběhlo úspěšně. Nyní si nastavte nové heslo v profilu nebo pokračujte do portálu."
              );
            } else {
              router.replace("/portal");
              return;
            }
          }

          if (!cancelled) setCheckingLink(false);
          return;
        }

        if (accessTokenInHash) {
          const {
            data: { session },
          } = await supabase.auth.getSession();

          if (session && !cancelled) {
            router.replace("/portal");
            return;
          }
        }

        if (!cancelled) setCheckingLink(false);
      } catch (e) {
        if (!cancelled) {
          setError("Nepodařilo se zpracovat přihlašovací odkaz.");
          setCheckingLink(false);
        }
      }
    }

    if (!handledRef.current) {
      handledRef.current = true;
      handleMagicLinkFlow();
    }

    return () => {
      cancelled = true;
    };
  }, [router]);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (signInError) {
      setError("Neplatné přihlašovací údaje.");
      setLoading(false);
      return;
    }

    router.push("/portal");
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
            Přihlášení
          </h1>

          <p
            style={{
              margin: "10px 0 0",
              fontSize: 16,
              lineHeight: 1.65,
              color: "rgba(15,23,42,0.68)",
            }}
          >
            Přihlaste se do svého účtu ARCHIMEDES Live.
          </p>
        </div>

        {checkingLink ? (
          <div
            style={{
              marginBottom: 16,
              padding: "12px 14px",
              borderRadius: 14,
              background: "#f8fafc",
              border: "1px solid rgba(15,23,42,0.08)",
              color: "#334155",
              fontSize: 14,
            }}
          >
            Ověřujeme přihlašovací odkaz…
          </div>
        ) : null}

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

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 16 }}>
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
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: 10 }}>
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
              Heslo
            </label>

            <div style={{ position: "relative" }}>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ ...inputStyle, paddingRight: 50 }}
              />

              <button
                type="button"
                aria-label={showPassword ? "Skrýt heslo" : "Zobrazit heslo"}
                onClick={() => setShowPassword((v) => !v)}
                style={{
                  position: "absolute",
                  top: "50%",
                  right: 12,
                  transform: "translateY(-50%)",
                  width: 30,
                  height: 30,
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  fontSize: 18,
                  lineHeight: 1,
                  color: "#475569",
                }}
              >
                {showPassword ? "🙈" : "👁"}
              </button>
            </div>
          </div>

          <div style={{ marginBottom: 18 }}>
            <Link
              href="/reset-hesla"
              style={{
                fontSize: 14,
                color: "#334155",
                textDecoration: "underline",
                textUnderlineOffset: 2,
              }}
            >
              Zapomenuté heslo
            </Link>
          </div>

          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              marginBottom: 22,
            }}
          >
            <button type="submit" disabled={loading || checkingLink} style={primaryBtn}>
              {loading ? "Přihlašuji..." : "Přihlásit se"}
            </button>

            <Link href="/poptavka" style={secondaryBtn}>
              Nemám registraci
            </Link>
          </div>
        </form>

        <div
          style={{
            borderTop: "1px solid rgba(15,23,42,0.08)",
            paddingTop: 20,
            marginTop: 6,
          }}
        >
          <div
            style={{
              fontSize: 15,
              fontWeight: 800,
              color: "#0f172a",
              marginBottom: 12,
            }}
          >
            Dostali jste pozvánku od administrátora?
          </div>

          <Link href="/join" style={fullPrimaryBtn}>
            Připojit k organizaci
          </Link>
        </div>
      </div>
    </main>
  );
}

const inputStyle = {
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
};

const primaryBtn = {
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
  textDecoration: "none",
  cursor: "pointer",
};

const secondaryBtn = {
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
};

const fullPrimaryBtn = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
  minHeight: 52,
  padding: "0 18px",
  borderRadius: 16,
  border: "1px solid #0f172a",
  background: "#0f172a",
  color: "#fff",
  fontWeight: 800,
  fontSize: 16,
  textDecoration: "none",
};
