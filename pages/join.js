import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { supabase } from "../lib/supabaseClient";

export default function JoinPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [joinCode, setJoinCode] = useState(
    typeof router.query.code === "string" ? router.query.code : ""
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!router.isReady) return;
    if (typeof router.query.code === "string") {
      setJoinCode(router.query.code);
    }
  }, [router.isReady, router.query.code]);

  const passwordTooShort = password.length > 0 && password.length < 8;
  const passwordMismatch =
    passwordConfirm.length > 0 && password !== passwordConfirm;

  const canSubmit = useMemo(() => {
    return (
      !saving &&
      fullName.trim().length > 0 &&
      email.trim().length > 0 &&
      password.length >= 8 &&
      password === passwordConfirm &&
      joinCode.trim().length > 0
    );
  }, [saving, fullName, email, password, passwordConfirm, joinCode]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!fullName.trim()) {
      setError("Vyplňte jméno a příjmení.");
      return;
    }

    if (!email.trim()) {
      setError("Vyplňte e-mail.");
      return;
    }

    if (password.length < 8) {
      setError("Heslo musí mít alespoň 8 znaků.");
      return;
    }

    if (password !== passwordConfirm) {
      setError("Hesla se neshodují.");
      return;
    }

    if (!joinCode.trim()) {
      setError("Vyplňte kód organizace.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/join-organization", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          fullName: fullName.trim(),
          password,
          joinCode: joinCode.trim().toUpperCase(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error || "Nepodařilo se vytvořit účet.");
      }

      setMessage(
        result?.organizationName
          ? `Účet byl vytvořen. Připojeno do organizace: ${result.organizationName}`
          : "Účet byl vytvořen."
      );

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (signInError) {
        throw new Error(signInError.message);
      }

      router.push("/portal/muj-profil");
    } catch (e) {
      setError(e.message || "Nepodařilo se dokončit registraci.");
    } finally {
      setSaving(false);
    }
  }

  const baseInputStyle = {
    width: "100%",
    padding: "13px 14px",
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,0.15)",
    background: "#fff",
    boxSizing: "border-box",
    fontSize: 16,
    outline: "none",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f6f7fb", fontFamily: "system-ui" }}>
      <main style={{ maxWidth: 760, margin: "0 auto", padding: "48px 16px" }}>
        <div
          style={{
            background: "#fff",
            borderRadius: 24,
            padding: 28,
            boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
            border: "1px solid rgba(0,0,0,0.08)",
          }}
        >
          <div style={{ marginBottom: 18 }}>
            <img
              src="/logo-archimedes-live.png"
              alt="ARCHIMEDES Live"
              style={{ height: 42, width: "auto", display: "block" }}
            />
          </div>

          <h1 style={{ marginTop: 0, marginBottom: 10, fontSize: 34 }}>
            Připojit se do organizace
          </h1>

          <p style={{ color: "rgba(0,0,0,0.65)", marginTop: 0, marginBottom: 24 }}>
            Pokud jste dostali kód školy nebo organizace, vyplňte formulář a účet se
            automaticky připojí ke správné organizaci.
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

          {message ? (
            <div
              style={{
                marginBottom: 16,
                padding: 12,
                borderRadius: 12,
                background: "#eefaf0",
                color: "#166534",
                border: "1px solid #cfe8d3",
              }}
            >
              {message}
            </div>
          ) : null}

          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gap: 14 }}>
              <div>
                <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>
                  Jméno a příjmení
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Např. Jana Nováková"
                  style={baseInputStyle}
                  autoComplete="name"
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>
                  E-mail
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jmeno@skola.cz"
                  style={baseInputStyle}
                  autoComplete="email"
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>
                  Heslo
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Alespoň 8 znaků"
                  style={{
                    ...baseInputStyle,
                    border:
                      passwordTooShort || passwordMismatch
                        ? "1px solid #ef4444"
                        : baseInputStyle.border,
                  }}
                  autoComplete="new-password"
                />
                {passwordTooShort ? (
                  <div
                    style={{
                      marginTop: 6,
                      fontSize: 14,
                      color: "#dc2626",
                      fontWeight: 600,
                    }}
                  >
                    Heslo musí mít alespoň 8 znaků.
                  </div>
                ) : null}
              </div>

              <div>
                <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>
                  Potvrzení hesla
                </label>
                <input
                  type="password"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  placeholder="Zadejte heslo znovu"
                  style={{
                    ...baseInputStyle,
                    border: passwordMismatch
                      ? "1px solid #ef4444"
                      : baseInputStyle.border,
                  }}
                  autoComplete="new-password"
                />
                {passwordMismatch ? (
                  <div
                    style={{
                      marginTop: 6,
                      fontSize: 14,
                      color: "#dc2626",
                      fontWeight: 600,
                    }}
                  >
                    Hesla se neshodují.
                  </div>
                ) : null}
              </div>

              <div>
                <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>
                  Kód organizace
                </label>
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="Např. ORG-A1B2C3D4"
                  style={{
                    ...baseInputStyle,
                    textTransform: "uppercase",
                  }}
                  autoComplete="off"
                />
              </div>

              <div style={{ paddingTop: 6 }}>
                <button
                  type="submit"
                  disabled={!canSubmit}
                  style={{
                    padding: "13px 18px",
                    borderRadius: 12,
                    border: "none",
                    background: "#111827",
                    color: "#fff",
                    fontWeight: 700,
                    cursor: canSubmit ? "pointer" : "default",
                    opacity: canSubmit ? 1 : 0.7,
                  }}
                >
                  {saving ? "Vytvářím účet…" : "Vytvořit účet a připojit se"}
                </button>
              </div>
            </div>
          </form>

          <div style={{ marginTop: 18, color: "rgba(0,0,0,0.6)" }}>
            Už účet máte? <Link href="/login">Přihlaste se</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
