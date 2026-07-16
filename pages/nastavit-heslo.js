// pages/nastavit-heslo.js
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/router";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Alert } from "../components/ui/alert";

function parseAuthStateFromUrl() {
  if (typeof window === "undefined") {
    return {
      code: "",
      tokenHash: "",
      accessToken: "",
      refreshToken: "",
      errorCode: "",
      errorDescription: "",
      type: "",
    };
  }

  const hash = window.location.hash?.startsWith("#")
    ? window.location.hash.slice(1)
    : window.location.hash || "";

  const search = window.location.search?.startsWith("?")
    ? window.location.search.slice(1)
    : window.location.search || "";

  const hashParams = new URLSearchParams(hash);
  const searchParams = new URLSearchParams(search);

  return {
    code: searchParams.get("code") || "",
    tokenHash: searchParams.get("token_hash") || "",
    accessToken:
      hashParams.get("access_token") ||
      searchParams.get("access_token") ||
      "",
    refreshToken:
      hashParams.get("refresh_token") ||
      searchParams.get("refresh_token") ||
      "",
    errorCode:
      hashParams.get("error_code") ||
      searchParams.get("error_code") ||
      "",
    errorDescription:
      hashParams.get("error_description") ||
      searchParams.get("error_description") ||
      "",
    type:
      hashParams.get("type") ||
      searchParams.get("type") ||
      "",
  };
}

function cleanupUrl() {
  if (typeof window === "undefined") return;
  window.history.replaceState({}, document.title, "/nastavit-heslo");
}

function humanizeRecoveryError(errorCode = "", errorDescription = "") {
  const code = String(errorCode || "").toLowerCase();
  const description = decodeURIComponent(
    String(errorDescription || "").replace(/\+/g, " ")
  );

  if (code === "otp_expired") {
    return "Odkaz pro nastavení hesla vypršel. Požádejte o nový odkaz.";
  }

  if (description) {
    return description;
  }

  return "Odkaz není platný nebo vypršel. Požádejte o nový odkaz.";
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
        const {
          code,
          tokenHash,
          accessToken,
          refreshToken,
          errorCode,
          errorDescription,
          type,
        } = parseAuthStateFromUrl();

        if (errorCode) {
          cleanupUrl();

          if (!mounted) return;
          setStatus("error");
          setMessage(humanizeRecoveryError(errorCode, errorDescription));
          return;
        }

        if (code) {
          const { error: exchangeError } =
            await supabase.auth.exchangeCodeForSession(code);

          if (exchangeError) {
            const {
              data: { session },
            } = await supabase.auth.getSession();

            if (!session?.user) throw exchangeError;
          }

          cleanupUrl();
        } else if (tokenHash && type) {
          const { error: verifyError } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type,
          });

          if (verifyError) throw verifyError;
          cleanupUrl();
        } else if (accessToken && refreshToken) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) {
            throw sessionError;
          }

          cleanupUrl();
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
          setMessage("Odkaz není platný nebo vypršel. Požádejte o nový odkaz.");
        }
      } catch (err) {
        if (!mounted) return;
        setStatus("error");
        setMessage(
          err?.message || "Odkaz není platný nebo vypršel. Požádejte o nový odkaz."
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

      const { error: profileError } = await supabase
        .from("profiles")
        .update({ must_set_password: false })
        .eq("id", user.id);

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
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <Card className="w-full max-w-[440px] p-8">
        <h1 className="mb-5 text-[32px] font-[950] leading-[1.1] tracking-[-0.03em] text-navy-900">
          Nastavení hesla
        </h1>

        {status === "loading" && <p className="text-muted">{message}</p>}

        {status === "error" && (
          <div className="grid gap-3.5">
            <Alert variant="error">{message}</Alert>
            <div className="grid gap-2.5">
              <Button type="button" onClick={() => router.push("/reset-hesla")}>
                Požádat o nový odkaz
              </Button>
              <Button type="button" variant="secondary" onClick={() => router.push("/login")}>
                Zpět na přihlášení
              </Button>
            </div>
          </div>
        )}

        {status === "ready" && (
          <>
            <p className="mb-4.5 mb-4 text-muted">
              Zadejte nové heslo pro dokončení přístupu do ARCHIMEDES Live.
            </p>

            <form onSubmit={handleSetPassword} className="grid gap-3">
              <Input
                type="password"
                placeholder="Nové heslo"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />

              <Input
                type="password"
                placeholder="Potvrzení nového hesla"
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
                autoComplete="new-password"
              />

              <Button type="submit" disabled={loading}>
                {loading ? "Ukládám..." : "Nastavit heslo"}
              </Button>
            </form>
          </>
        )}

        {status === "success" && <p className="font-bold text-emerald-700">{message}</p>}
      </Card>
    </div>
  );
}
