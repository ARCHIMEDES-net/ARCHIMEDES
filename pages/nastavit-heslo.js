// pages/nastavit-heslo.js
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/router";

export default function NastavitHeslo() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("loading"); // loading | ready | success | error

  useEffect(() => {
    // Supabase si token z URL vezme automaticky
    // tady jen ověříme, že session existuje
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        setStatus("ready");
      } else {
        setStatus("error");
      }
    };

    checkSession();
  }, []);

  const handleSetPassword = async (e) => {
    e.preventDefault();

    if (!password || password.length < 6) {
      alert("Heslo musí mít alespoň 6 znaků.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    setStatus("success");

    // přesměrování do portálu
    setTimeout(() => {
      router.push("/portal");
    }, 1500);
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h1 style={styles.title}>Nastavení hesla</h1>

        {status === "loading" && <p>Načítám...</p>}

        {status === "error" && (
          <p style={{ color: "red" }}>
            Odkaz není platný nebo vypršel. Zkuste požádat o nový.
          </p>
        )}

        {status === "ready" && (
          <form onSubmit={handleSetPassword} style={styles.form}>
            <input
              type="password"
              placeholder="Nové heslo"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
            />

            <button type="submit" disabled={loading} style={styles.button}>
              {loading ? "Ukládám..." : "Nastavit heslo"}
            </button>
          </form>
        )}

        {status === "success" && (
          <p style={{ color: "green" }}>
            Heslo nastaveno. Přesměrovávám do portálu...
          </p>
        )}
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
  },
  card: {
    background: "#ffffff",
    padding: "40px",
    borderRadius: "16px",
    width: "100%",
    maxWidth: "400px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
  },
  title: {
    marginBottom: "20px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  input: {
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #ddd",
  },
  button: {
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    background: "#0f172a",
    color: "#fff",
    cursor: "pointer",
  },
};
