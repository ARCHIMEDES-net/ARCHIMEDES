import { useEffect, useState } from "react";
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

function isInviteOrRecoveryType(type) {
  return type === "invite" || type === "recovery";
}

export default function Login() {
  const router = useRouter();

  const [mode, setMode] = useState("login"); // login | set-password
  const [checkingSession, setCheckingSession] = useState(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [newPassword2, setNewPassword2] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function init() {
      if (!router.isReady) return;

      setCheckingSession(true);
      setError("");
      setMessage("");

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
          throw new Error(
            decodeURIComponent(
              errorDescription || "Emailový odkaz je neplatný nebo vypršel."
            )
          );
        }

        const inviteOrRecovery =
          isInviteOrRecoveryType(type) || accessTokenInHash;

        // PKCE flow: /login?code=...
        if (code) {
          const { error: exchangeError } =
            await supabase.auth.exchangeCodeForSession(code);

          if (exchangeError) throw exchangeError;
        }

        // token_hash flow: /login?token_hash=...&type=invite|recovery
        if (tokenHash && isInviteOrRecoveryType(type)) {
          const { error: verifyError } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type,
          });

          if (verifyError) throw verifyError;
        }

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!mounted) return;

        if (session?.user) {
          if (inviteOrRecovery) {
            setMode("set-password");
            setMessage("Dokončete registraci nastavením svého hesla.");
          } else {
            router.replace("/portal");
            return;
          }
        } else {
          setMode("login");
        }
      } catch (e) {
        if (!mounted) return;
        setError(e.message || "Nepodařilo se načíst přihlášení.");
        setMode("login");
      } finally {
        if (mounted) setCheckingSession(false);
      }
    }

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (event === "PASSWORD_RECOVERY" && session?.user) {
        setMode("set-password");
        setMessage("Nastavte si nové heslo.");
        setCheckingSession(false);
        return;
      }

      if (session?.user) {
        const { type, accessTokenInHash } = readAuthParams();
        const inviteOrRecovery =
          isInviteOrRecoveryType(type) || accessTokenInHash;

        if (inviteOrRecovery) {
          setMode("set-password");
          setMessage("Dokončete registraci nastavením svého hesla.");
          setCheckingSession(false);
          return;
        }

        router.replace("/portal");
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [router]);

  async function handleLogin(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("Přihlašuji...");

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) throw error;

      router.push("/portal");
    } catch (e) {
      setError(e.message || "Přihlášení se nepodařilo.");
      setMessage("");
    } finally {
      setSaving(false);
    }
  }

  async function handleSetPassword(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      if (!newPassword || newPassword.length < 8) {
        throw new Error("Heslo musí mít alespoň 8 znaků.");
      }

      if (newPassword !== newPassword2) {
        throw new Error("Hesla se neshodují.");
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        throw new Error(
          "Relace z pozvánky nebyla nalezena. Otevřete prosím odkaz z e-mailu znovu."
        );
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      const {
        data: { user },
        error: getUserError,
      } = await supabase.auth.getUser();

      if (getUserError) throw getUserError;
      if (!user?.id) {
        throw new Error("Nepodařilo se dohledat přihlášeného uživatele.");
      }

      const { error: profileUpdateError } = await supabase
        .from("profiles")
        .update({ must_set_password: false })
        .eq("id", user.id);

      if (profileUpdateError) throw profileUpdateError;

      setMessage("Heslo bylo nastaveno. Přesměrovávám do portálu...");
      setTimeout(() => {
        router.push("/portal/muj-profil");
      }, 900);
    } catch (e) {
      setError(e.message || "Nepodařilo se nastavit heslo.");
    } finally {
      setSaving(false);
    }
  }

  if (checkingSession) {
    return (
      <div
        style={{
          maxWidth: 520,
          margin: "60px auto",
          padding: "0 16px",
          fontFamily: "system-ui",
        }}
      >
        Načítám…
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f6f7fb",
        fontFamily: "system-ui",
        padding: "40px 16px",
      }}
    >
      <div
        style={{
          maxWidth: 520,
          margin: "0 auto",
          background: "#fff",
          borderRadius: 20,
          padding: 24,
          boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
          border: "1px solid rgba(0,0,0,0.08)",
        }}
      >
        <h1 style={{ marginTop: 0, marginBottom: 8, fontSize: 30 }}>
          {mode === "set-password" ? "Dokončení registrace" : "Přihlášení"}
        </h1>

        <p style={{ marginTop: 0, color: "rgba(0,0,0,0.65)" }}>
          {mode === "set-password"
            ? "Nastavte si své heslo pro vstup do ARCHIMEDES Live."
            : "Přihlaste se do svého účtu ARCHIMEDES Live."}
        </p>

        {error ? (
          <div
            style={{
              marginTop: 16,
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
              marginTop: 16,
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

        {mode === "set-password" ? (
          <form onSubmit={handleSetPassword}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>
                Nové heslo
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: 12,
                  border: "1px solid rgba(0,0,0,0.15)",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{ marginBottom: 18 }}>
              <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>
                Nové heslo znovu
              </label>
              <input
                type="password"
                value={newPassword2}
                onChange={(e) => setNewPassword2(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: 12,
                  border: "1px solid rgba(0,0,0,0.15)",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              style={{
                padding: "12px 18px",
                borderRadius: 12,
                border: "none",
                background: "#111827",
                color: "#fff",
                fontWeight: 700,
                cursor: saving ? "default" : "pointer",
                opacity: saving ? 0.7 : 1,
              }}
            >
              {saving ? "Ukládám…" : "Nastavit heslo a pokračovat"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: 12,
                  border: "1px solid rgba(0,0,0,0.15)",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{ marginBottom: 18 }}>
              <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>
                Heslo
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: 12,
                  border: "1px solid rgba(0,0,0,0.15)",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              style={{
                padding: "12px 18px",
                borderRadius: 12,
                border: "none",
                background: "#111827",
                color: "#fff",
                fontWeight: 700,
                cursor: saving ? "default" : "pointer",
                opacity: saving ? 0.7 : 1,
              }}
            >
              {saving ? "Přihlašuji…" : "Přihlásit se"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
