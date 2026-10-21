// pages/nastavit-heslo.js
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/router";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Alert } from "../components/ui/alert";
import { finishRecoveredPasswordProfile } from "../lib/finishRecoveredPasswordProfile";
import {
  getWeakPasswordMessage,
  PASSWORD_MIN_LENGTH,
} from "../lib/authPasswordErrors";

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

  if (code === "otp_expired" || /expired|invalid|not found/i.test(description)) {
    return "Odkaz pro nastavení hesla už neplatí (vypršel nebo byl použit). Klikněte níže na „Požádat o nový odkaz“, zadejte svůj e-mail a nový odkaz otevřete hned.";
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
  const [status, setStatus] = useState("loading"); // loading | confirm | ready | success | error
  const [pendingOtp, setPendingOtp] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const [message, setMessage] = useState("Ověřuji odkaz...");
  const [formError, setFormError] = useState("");

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
          // Token se ověří až po kliknutí na tlačítko. Bezpečnostní skenery pošty
          // odkaz jen načtou, ale nekliknou – jednorázový token tak zůstane platný.
          if (!mounted) return;
          setPendingOtp({ tokenHash, type });
          setStatus("confirm");
          setMessage("");
          return;
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

  async function handleConfirmLink() {
    if (!pendingOtp) return;
    setConfirming(true);
    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        token_hash: pendingOtp.tokenHash,
        type: pendingOtp.type,
      });
      if (verifyError) throw verifyError;
      cleanupUrl();
      setPendingOtp(null);
      setStatus("ready");
      setMessage("");
    } catch (err) {
      cleanupUrl();
      setStatus("error");
      setMessage(humanizeRecoveryError(err?.code || "", err?.message || ""));
    } finally {
      setConfirming(false);
    }
  }

  async function handleSetPassword(e) {
    e.preventDefault();
    setFormError("");

    if (!password || password.length < PASSWORD_MIN_LENGTH) {
      setFormError(
        `Heslo musí mít alespoň ${PASSWORD_MIN_LENGTH} znaků.`
      );
      return;
    }

    if (password !== password2) {
      setFormError("Zadaná hesla se neshodují.");
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

      const profileSync = await finishRecoveredPasswordProfile(supabase, user.id);
      if (!profileSync.ok) {
        console.error("PASSWORD_SETUP_PROFILE_SYNC_FAILED", { code: profileSync.code });
        setFormError(
          "Heslo bylo nastaveno, ale aktivaci účtu se nepodařilo dokončit. " +
          "Zkuste heslo potvrdit znovu. Pokud problém trvá, kontaktujte správce školy."
        );
        return;
      }

      let nextUrl = "/portal";
      try {
        const { data: profileRow } = await supabase
          .from("profiles")
          .select("profile_completed_at")
          .eq("id", user.id)
          .maybeSingle();
        if (profileRow && !profileRow.profile_completed_at) {
          nextUrl = "/portal/muj-profil?vitejte=1";
        }
      } catch {
        // Při chybě zůstává výchozí přesměrování do portálu.
      }

      setStatus("success");
      setMessage(
        nextUrl === "/portal"
          ? "Heslo bylo nastaveno. Přesměrovávám do portálu..."
          : "Heslo bylo nastaveno. Teď prosím doplňte svůj profil – zabere to minutu."
      );

      setTimeout(() => {
        router.push(nextUrl);
      }, 1200);
    } catch (err) {
      setFormError(
        getWeakPasswordMessage(err) || "Heslo se nepodařilo nastavit. Zkuste to znovu."
      );
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

        {status === "confirm" && (
          <div className="grid gap-3.5">
            <p className="text-muted">
              Vítejte v ARCHIMEDES Live. Pokračujte kliknutím na tlačítko –
              v dalším kroku si zvolíte své heslo.
            </p>
            <Button type="button" onClick={handleConfirmLink} disabled={confirming}>
              {confirming ? "Ověřuji odkaz..." : "Pokračovat k nastavení hesla"}
            </Button>
          </div>
        )}

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
              Zadejte nové heslo o délce alespoň {PASSWORD_MIN_LENGTH} znaků
              pro dokončení přístupu do ARCHIMEDES Live.
            </p>

            {formError ? (
              <Alert variant="error" className="mb-4">
                {formError}
              </Alert>
            ) : null}

            <form onSubmit={handleSetPassword} className="grid gap-3">
              <Input
                type="password"
                placeholder="Nové heslo"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setFormError("");
                }}
                autoComplete="new-password"
                minLength={PASSWORD_MIN_LENGTH}
                required
              />

              <Input
                type="password"
                placeholder="Potvrzení nového hesla"
                value={password2}
                onChange={(e) => {
                  setPassword2(e.target.value);
                  setFormError("");
                }}
                autoComplete="new-password"
                minLength={PASSWORD_MIN_LENGTH}
                required
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
