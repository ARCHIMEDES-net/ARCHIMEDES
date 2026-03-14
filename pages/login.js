import Link from "next/link";
import { useEffect, useRef, useState } from "react";
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

function withTimeout(promise, ms, label) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`${label} trvá příliš dlouho.`)), ms)
    ),
  ]);
}

const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid rgba(0,0,0,0.15)",
  boxSizing: "border-box",
};

const primaryButtonStyle = (saving) => ({
  padding: "12px 18px",
  borderRadius: 12,
  border: "none",
  background: "#111827",
  color: "#fff",
  fontWeight: 700,
  cursor: saving ? "default" : "pointer",
  opacity: saving ? 0.7 : 1,
});

const linkButtonStyle = {
  background: "none",
  border: "none",
  padding: 0,
  color: "#111827",
  textDecoration: "underline",
  cursor: "pointer",
  fontSize: 14,
};

const legalTextStyle = {
  marginTop: 16,
  fontSize: 13,
  lineHeight: 1.7,
  color: "rgba(0,0,0,0.62)",
};

const legalLinkStyle = {
  color: "#111827",
  fontWeight: 700,
  textDecoration: "none",
};

export default function Login() {
  const router = useRouter();

  const [mode, setMode] = useState("login"); // login | set-password | reset-password
  const [checkingSession, setCheckingSession] = useState(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [newPassword2, setNewPassword2] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const passwordFlowLockedRef = useRef(false);

  async function getProfileMustSetPassword(userId) {
    if (!userId) return null;

    try {
      const { data, error } = await withTimeout(
        supabase
          .from("profiles")
          .select("must_set_password")
          .eq("id", userId)
          .maybeSingle(),
        8000,
        "Načtení profilu"
      );

      if (error) throw error;
      return data?.must_set_password ?? null;
    } catch {
      return null;
    }
  }

  useEffect(() => {
    if (!router.isReady) return;

    let mounted = true;

    async function init() {
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

        if (inviteOrRecovery) {
          passwordFlowLockedRef.current = true;
        }

        if (code) {
          const { error: exchangeError } = await withTimeout(
            supabase.auth.exchangeCodeForSession(code),
            10000,
            "Výměna kódu za relaci"
          );
          if (exchangeError) throw exchangeError;
        }

        if (tokenHash && isInviteOrRecoveryType(type)) {
          const { error: verifyError } = await withTimeout(
            supabase.auth.verifyOtp({
              token_hash: tokenHash,
              type,
            }),
            10000,
            "Ověření odkazu"
          );
          if (verifyError) throw verifyError;
        }

        const {
          data: { session },
        } = await withTimeout(
          supabase.auth.getSession(),
          8000,
          "Načtení relace"
        );

        if (!mounted) return;

        if (session?.user) {
          const mustSetPassword = await getProfileMustSetPassword(session.user.id);

          if (!mounted) return;

          if (mustSetPassword === true || inviteOrRecovery) {
            passwordFlowLockedRef.current = true;
            setMode("set-password");
            setMessage(
              type === "recovery"
                ? "Nastavte si nové heslo."
                : mustSetPassword === true
                ? "Dokončete registraci nastavením svého hesla."
                : "Nastavte si nové heslo."
            );
            setCheckingSession(false);
            return;
          }

          router.replace("/portal");
          return;
        }

        if (inviteOrRecovery) {
          passwordFlowLockedRef.current = true;
          setMode("set-password");
          setMessage("Nastavte si nové heslo.");
          setCheckingSession(false);
          return;
        }

        setMode(router.query.reset === "1" ? "reset-password" : "login");
      } catch (e) {
        if (!mounted) return;
        setError(e.message || "Nepodařilo se načíst přihlášení.");
        passwordFlowLockedRef.current = false;
        setMode("login");
      } finally {
        if (mounted) setCheckingSession(false);
      }
    }

    init();

    const timeoutId = setTimeout(() => {
      if (!mounted) return;
      setCheckingSession(false);

      if (!passwordFlowLockedRef.current) {
        setMode(router.query.reset === "1" ? "reset-password" : "login");
      }
    }, 12000);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      const { type, accessTokenInHash } = readAuthParams();
      const inviteOrRecovery =
        isInviteOrRecoveryType(type) || accessTokenInHash;

      if (event === "PASSWORD_RECOVERY" && session?.user) {
        passwordFlowLockedRef.current = true;
        setMode("set-password");
        setMessage("Nastavte si nové heslo.");
        setCheckingSession(false);
        return;
      }

      if (event === "SIGNED_IN" && session?.user) {
        if (inviteOrRecovery || passwordFlowLockedRef.current) {
          passwordFlowLockedRef.current = true;
          setMode("set-password");
          setMessage(
            type === "recovery"
              ? "Nastavte si nové heslo."
              : "Dokončete registraci nastavením svého hesla."
          );
          setCheckingSession(false);
          return;
        }

        router.replace("/portal");
        return;
      }

      if ((event === "SIGNED_OUT" || !session) && passwordFlowLockedRef.current) {
        setMode("set-password");
        setCheckingSession(false);
        return;
      }

      if (event === "SIGNED_OUT") {
        setMode("login");
        setCheckingSession(false);
      }
    });

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      subscription?.unsubscribe();
    };
  }, [router.isReady, router.query.reset]);

  async function handleLogin(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("Přihlašuji...");

    try {
      const { error } = await withTimeout(
        supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        }),
        10000,
        "Přihlášení"
      );

      if (error) throw error;
      router.push("/portal");
    } catch (e) {
      setError(e.message || "Přihlášení se nepodařilo.");
      setMessage("");
    } finally {
      setSaving(false);
    }
  }

  async function handleResetPassword(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      if (!email || !email.trim()) {
        throw new Error("Zadejte e-mail.");
      }

      const { error } = await withTimeout(
        supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/login`,
        }),
        10000,
        "Odeslání reset e-mailu"
      );

      if (error) throw error;

      setMessage("Na váš e-mail byl odeslán odkaz pro nastavení nového hesla.");
    } catch (e) {
      setError(e.message || "Nepodařilo se odeslat reset hesla.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSetPassword(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("Ověřuji relaci...");

    try {
      if (!newPassword || newPassword.length < 8) {
        throw new Error("Heslo musí mít alespoň 8 znaků.");
      }

      if (newPassword !== newPassword2) {
        throw new Error("Hesla se neshodují.");
      }

      const {
        data: { session },
      } = await withTimeout(
        supabase.auth.getSession(),
        10000,
        "Načtení relace"
      );

      if (!session?.user) {
        throw new Error(
          "Relace z pozvánky nebo resetu nebyla nalezena. Otevřete prosím odkaz z e-mailu znovu."
        );
      }

      setMessage("Ukládám heslo...");

      const { error: updateUserError } = await withTimeout(
        supabase.auth.updateUser({
          password: newPassword,
        }),
        30000,
        "Aktualizace hesla"
      );

      if (updateUserError) throw updateUserError;

      const {
        data: { user },
        error: getUserError,
      } = await withTimeout(
        supabase.auth.getUser(),
        10000,
        "Načtení uživatele"
      );

      if (getUserError) throw getUserError;
      if (!user?.id) {
        throw new Error("Nepodařilo se dohledat přihlášeného uživatele.");
      }

      await withTimeout(
        supabase
          .from("profiles")
          .update({ must_set_password: false })
          .eq("id", user.id),
        10000,
        "Aktualizace profilu"
      );

      passwordFlowLockedRef.current = false;
      setMessage("Heslo bylo nastaveno. Přesměrovávám do portálu...");

      if (typeof window !== "undefined") {
        window.history.replaceState({}, "", "/login");
      }

      setTimeout(() => {
        router.replace("/portal/muj-profil");
      }, 900);
    } catch (e) {
      setError(e.message || "Nepodařilo se nastavit heslo.");
      setMessage("");
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
          maxWidth: 560,
          margin: "0 auto",
          background: "#fff",
          borderRadius: 20,
          padding: 24,
          boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
          border: "1px solid rgba(0,0,0,0.08)",
        }}
      >
        <h1 style={{ marginTop: 0, marginBottom: 8, fontSize: 30 }}>
          {mode === "set-password"
            ? "Nastavení nového hesla"
            : mode === "reset-password"
            ? "Zapomenuté heslo"
            : "Přihlášení"}
        </h1>

        <p style={{ marginTop: 0, color: "rgba(0,0,0,0.65)", lineHeight: 1.6 }}>
          {mode === "set-password"
            ? "Zadejte nové heslo pro vstup do ARCHIMEDES Live."
            : mode === "reset-password"
            ? "Zadejte svůj e-mail a pošleme vám odkaz pro nastavení nového hesla."
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
                style={inputStyle}
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
                style={inputStyle}
              />
            </div>

            <button type="submit" disabled={saving} style={primaryButtonStyle(saving)}>
              {saving ? "Ukládám…" : "Nastavit heslo a pokračovat"}
            </button>
          </form>
        ) : mode === "reset-password" ? (
          <form onSubmit={handleResetPassword}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={inputStyle}
              />
            </div>

            <button type="submit" disabled={saving} style={primaryButtonStyle(saving)}>
              {saving ? "Odesílám…" : "Odeslat odkaz pro nové heslo"}
            </button>

            <div style={{ marginTop: 14 }}>
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError("");
                  setMessage("");
                }}
                style={linkButtonStyle}
              >
                Zpět na přihlášení
              </button>
            </div>
          </form>
        ) : (
          <>
            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>
                  E-mail
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: 10 }}>
                <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>
                  Heslo
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: 18 }}>
                <button
                  type="button"
                  onClick={() => {
                    setMode("reset-password");
                    setError("");
                    setMessage("");
                  }}
                  style={linkButtonStyle}
                >
                  Zapomenuté heslo
                </button>
              </div>

              <button type="submit" disabled={saving} style={primaryButtonStyle(saving)}>
                {saving ? "Přihlašuji…" : "Přihlásit se"}
              </button>
            </form>

            <p style={legalTextStyle}>
              Přihlášením do portálu berete na vědomí{" "}
              <Link href="/pravni" style={legalLinkStyle}>
                podmínky používání
              </Link>
              ,{" "}
              <Link href="/pravni#udaje" style={legalLinkStyle}>
                ochranu osobních údajů
              </Link>{" "}
              a{" "}
              <Link href="/pravni#cookies" style={legalLinkStyle}>
                informace o cookies
              </Link>
              .
            </p>

            <div
              style={{
                marginTop: 24,
                paddingTop: 18,
                borderTop: "1px solid rgba(0,0,0,0.08)",
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: 8 }}>
                Nemáte přístup do portálu?
              </div>

              <p
                style={{
                  marginTop: 0,
                  marginBottom: 12,
                  color: "rgba(0,0,0,0.65)",
                  lineHeight: 1.6,
                }}
              >
                Pokud jste nová škola, obec, partner nebo si nejste jistí správným
                typem přístupu, vyplňte krátkou žádost nebo se připojte ke stávající
                organizaci.
              </p>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 10,
                }}
              >
                <Link
                  href="/zadost-o-pristup"
                  style={{
                    display: "inline-block",
                    padding: "10px 14px",
                    borderRadius: 12,
                    background: "#111827",
                    color: "#fff",
                    textDecoration: "none",
                    fontWeight: 700,
                  }}
                >
                  Požádat o přístup
                </Link>

                <Link
                  href="/join"
                  style={{
                    display: "inline-block",
                    padding: "10px 14px",
                    borderRadius: 12,
                    background: "#fff",
                    color: "#111827",
                    textDecoration: "none",
                    fontWeight: 700,
                    border: "1px solid rgba(0,0,0,0.12)",
                  }}
                >
                  Připojit se k organizaci
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
