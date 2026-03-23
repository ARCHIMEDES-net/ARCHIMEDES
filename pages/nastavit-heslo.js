// pages/nastavit-heslo.js
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/router";

function parseAuthTokensFromUrl() {
  if (typeof window === "undefined") {
    return { accessToken: "", refreshToken: "" };
  }

  const hash = window.location.hash?.startsWith("#")
    ? window.location.hash.slice(1)
    : window.location.hash || "";

  const search = window.location.search?.startsWith("?")
    ? window.location.search.slice(1)
    : window.location.search || "";

  const hashParams = new URLSearchParams(hash);
  const searchParams = new URLSearchParams(search);

  const accessToken =
    hashParams.get("access_token") ||
    searchParams.get("access_token") ||
    "";

  const refreshToken =
    hashParams.get("refresh_token") ||
    searchParams.get("refresh_token") ||
    "";

  return { accessToken, refreshToken };
}

export default function NastavitHeslo() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("loading"); // loading | ready | success | error
  const [message, setMessage] = useState("Ověřuji odkaz...");

  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        const { accessToken, refreshToken } = parseAuthTokensFromUrl();

        if (accessToken && refreshToken) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) {
            throw sessionError;
          }

          // Po úspěšném převzetí session uklidíme URL, ať tam nezůstávají tokeny.
          if (typeof window !== "undefined") {
            window.history.replaceState({}, document.title, "/nastavit-heslo");
          }
        }

        const {
          data: { session },
          error: sessionReadError,
        } = await supabase.auth.getSession();

        if (sessionReadError) {
          throw sessionReadError;
        }

        if (!mounted) return;

        if (session?.user) {
          setStatus("ready");
          setMessage("");
        } else {
          setStatus("error");
          setMessage("Odkaz není platný nebo vypršel. Zkuste požádat o nový.");
        }
      } catch (err) {
        if (!mounted) return;
        setStatus("error");
        setMessage(
          err?.message || "Odkaz není platný nebo vypršel. Zkuste požádat o nový."
        );
      }
    }

    init();

    return () => {
      mounted = false;
    };
  }, []);

  async function handleSetPassword(e) {
    e.preventDefault();

    if (!password || password.length < 6) {
      alert("Heslo musí mít alespoň 6 znaků.");
      return;
    }

    if (password !== password2) {
      alert("Zadaná hesla se neshodují.");
      return;
    }

    setLoading(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user?.id) {
        throw new Error("Nepodařilo se ověřit uživatele.");
      }

      const { error: passwordError } = await supabase.auth.updateUser({
        password,
      });

      if (passwordError) {
        throw passwordError;
      }

      // Volitelný, ale důležitý krok: po nastavení hesla zrušit příznak must_set_password.
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ must_set_password: false })
        .eq("id", user.id);

      // Tady chybu profilu nezastavujeme tvrdě, protože heslo už je správně nastavené.
      // Jen ji vypíšeme do konzole.
      if (profileError) {
        console.error("PROFILE UPDATE ERROR:", profileError);
      }

      setStatus("success");
      setMessage("Heslo bylo nastaveno. Přesměrovávám do portálu...");

      setTimeout(() => {
        router.push("/portal");
      }, 1200);
    } catch (err) {
      alert(err?.message || "Heslo se nepodařilo nastavit.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h1 style={styles.title}>Nastavení hesla</h1>

        {status === "loading" && <p style={styles.text}>{message}</p>}

        {status === "error" && (
          <div style={styles.errorBox}>
            <p style={styles.errorText}>{message}</p>
            <button
              type="button"
              onClick={() => router.push("/login")}
              style={styles.secondaryButton}
            >
              Přejít na přihlášení
            </button>
          </div>
        )}

        {status === "ready" && (
          <>
            <p style={styles.text}>
              Zadejte nové heslo pro dokončení přístupu do ARCHIMEDES Live.
            </p>

            <form onSubmit={handleSetPassword} style={styles.form}>
              <input
                type="password"
                placeholder="Nové heslo"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
                autoComplete="new-password"
              />

              <input
                type="password"
                placeholder="Potvrzení nového hesla"
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
                style={styles.input}
                autoComplete="new-password"
              />

              <button type="submit" disabled={loading} style={styles.button}>
                {loading ? "Ukládám..." : "Nastavit heslo"}
              </button>
            </form>
          </>
        )}

        {status === "success" && <p style={styles.successText}>{message}</p>}
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f5f7fa",
    padding: "24px",
  },
  card: {
    background: "#ffffff",
    padding: "40px",
    borderRadius: "16px",
    width: "100%",
    maxWidth: "440px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
  },
  title: {
    margin: "0 0 20px 0",
    fontSize: "32px",
    lineHeight: "1.1",
    color: "#0f172a",
  },
  text: {
    margin: "0 0 18px 0",
    color: "#475467",
    lineHeight: "1.6",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  input: {
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #d0d5dd",
    fontSize: "16px",
  },
  button: {
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    background: "#0f172a",
    color: "#fff",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: 700,
  },
  secondaryButton: {
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #d0d5dd",
    background: "#ffffff",
    color: "#0f172a",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: 700,
  },
  errorBox: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  errorText: {
    margin: 0,
    color: "#b42318",
    lineHeight: "1.6",
  },
  successText: {
    margin: 0,
    color: "#166534",
    lineHeight: "1.6",
    fontWeight: 700,
  },
};
