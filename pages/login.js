// pages/login.js
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Alert } from "../components/ui/alert";

function readAuthParams() {
  if (typeof window === "undefined") {
    return {
      code: "",
      tokenHash: "",
      type: "",
      accessTokenInHash: false,
      accessToken: "",
      refreshToken: "",
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
    accessToken: hash.get("access_token") || search.get("access_token") || "",
    refreshToken:
      hash.get("refresh_token") || search.get("refresh_token") || "",
    errorCode: hash.get("error_code") || search.get("error_code") || "",
    errorDescription:
      hash.get("error_description") || search.get("error_description") || "",
  };
}

function clearAuthUrl() {
  if (typeof window === "undefined") return;
  window.history.replaceState({}, document.title, "/login");
}

function humanizeAuthError(errorCode = "", errorDescription = "") {
  const code = String(errorCode || "").toLowerCase();
  const description = decodeURIComponent(
    String(errorDescription || "").replace(/\+/g, " ")
  );

  if (code === "otp_expired") {
    return "Odkaz vypršel. Požádejte o nový odkaz pro nastavení hesla.";
  }

  if (description) return description;

  return "Odkaz pro přihlášení nebo obnovu hesla není platný.";
}

function isPasswordSetupFlow(type = "") {
  const normalized = String(type || "").toLowerCase();
  return normalized === "recovery" || normalized === "invite";
}

async function resolvePostLoginPath() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw userError;
  if (!user) return "/login";

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, user_type, active_organization_id, must_set_password")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) throw profileError;

  if (profile?.must_set_password) {
    return "/nastavit-heslo";
  }

  if (profile?.active_organization_id) {
    const { data: membership, error: membershipError } = await supabase
      .from("organization_members")
      .select("organization_id, status")
      .eq("user_id", user.id)
      .eq("organization_id", profile.active_organization_id)
      .eq("status", "active")
      .maybeSingle();

    if (membershipError) throw membershipError;

    if (membership?.organization_id) {
      return "/portal";
    }
  }

  const { data: fallbackMembership, error: fallbackMembershipError } =
    await supabase
      .from("organization_members")
      .select("organization_id, status")
      .eq("user_id", user.id)
      .eq("status", "active")
      .limit(1)
      .maybeSingle();

  if (fallbackMembershipError) throw fallbackMembershipError;

  if (fallbackMembership?.organization_id) {
    if (profile?.active_organization_id !== fallbackMembership.organization_id) {
      const { error: updateProfileError } = await supabase
        .from("profiles")
        .update({
          active_organization_id: fallbackMembership.organization_id,
        })
        .eq("id", user.id);

      if (updateProfileError) {
        throw updateProfileError;
      }
    }

    return "/portal";
  }

  if (profile?.user_type === "individual") {
    return "/portal";
  }

  return "/welcome";
}

export default function LoginPage() {
  const router = useRouter();

  function requestedInternalPath() {
    const next = typeof router.query.next === "string" ? router.query.next : "";
    return next.startsWith("/") && !next.startsWith("//") ? next : "";
  }

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

    async function safeRedirectAfterAuth() {
      const target = requestedInternalPath() || (await resolvePostLoginPath());
      if (!cancelled) {
        router.replace(target);
      }
    }

    async function handleMagicLinkFlow() {
      try {
        const {
          code,
          tokenHash,
          type,
          accessTokenInHash,
          accessToken,
          refreshToken,
          errorCode,
          errorDescription,
        } = readAuthParams();

        if (errorCode) {
          clearAuthUrl();

          if (!cancelled) {
            setError(humanizeAuthError(errorCode, errorDescription));
            setCheckingLink(false);
          }
          return;
        }

        if (code) {
          let sessionWasAlreadyExchanged = false;
          const { data: exchangeData, error: exchangeError } =
            await supabase.auth.exchangeCodeForSession(code);

          if (exchangeError) {
            // detectSessionInUrl může kód zpracovat automaticky dřív než
            // tento efekt. V takovém případě je výměna podruhé neplatná,
            // ale již existující relace je správný výsledek.
            const {
              data: { session },
            } = await supabase.auth.getSession();

            if (!session?.user) {
              if (!cancelled) {
                setError(
                  exchangeError.message ||
                    "Nepodařilo se dokončit přihlášení přes odkaz."
                );
                setCheckingLink(false);
              }
              return;
            }

            sessionWasAlreadyExchanged = true;
          }

          clearAuthUrl();

          if (
            sessionWasAlreadyExchanged ||
            isPasswordSetupFlow(exchangeData?.redirectType || type)
          ) {
            if (!cancelled) router.replace("/nastavit-heslo");
            return;
          }

          await safeRedirectAfterAuth();
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
              setCheckingLink(false);
            }
            return;
          }

          clearAuthUrl();

          if (isPasswordSetupFlow(type)) {
            if (!cancelled) router.replace("/nastavit-heslo");
            return;
          }

          await safeRedirectAfterAuth();
          return;
        }

        if (accessTokenInHash && accessToken && refreshToken) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) {
            if (!cancelled) {
              setError(
                sessionError.message ||
                  "Nepodařilo se dokončit přihlášení přes odkaz."
              );
              setCheckingLink(false);
            }
            return;
          }

          clearAuthUrl();

          if (isPasswordSetupFlow(type)) {
            if (!cancelled) router.replace("/nastavit-heslo");
            return;
          }

          await safeRedirectAfterAuth();
          return;
        }

        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        if (session?.user) {
          await new Promise((r) => setTimeout(r, 50));
          await safeRedirectAfterAuth();
          return;
        }

        if (!cancelled) setCheckingLink(false);
      } catch (e) {
        if (!cancelled) {
          setError(
            e?.message || "Nepodařilo se zpracovat přihlašovací odkaz."
          );
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

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        setError("Neplatné přihlašovací údaje.");
        setLoading(false);
        return;
      }

      const target = requestedInternalPath() || (await resolvePostLoginPath());
      router.push(target);
    } catch (e) {
      setError(e?.message || "Přihlášení se nepodařilo.");
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-[calc(100vh-90px)] items-center justify-center bg-slate-50 px-4 py-12">
      <Card className="w-full max-w-[560px] p-6 sm:p-7">
        <div className="mb-4">
          <h1 className="text-[32px] font-[950] leading-[1.08] tracking-[-0.03em] text-navy-900">
            Přihlášení
          </h1>
          <p className="mt-2.5 text-base leading-relaxed text-muted">
            Přihlaste se do svého účtu ARCHIMEDES Live.
          </p>
        </div>

        {checkingLink ? (
          <Alert variant="neutral" className="mb-4">
            Ověřujeme přihlašovací odkaz…
          </Alert>
        ) : null}

        {error ? (
          <Alert variant="error" className="mb-4">
            {error}
          </Alert>
        ) : null}

        {message ? (
          <Alert variant="success" className="mb-4">
            {message}
          </Alert>
        ) : null}

        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="mb-2.5">
            <Label htmlFor="password">Heslo</Label>

            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-12"
              />

              <button
                type="button"
                aria-label={showPassword ? "Skrýt heslo" : "Zobrazit heslo"}
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center text-slate-600"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <Eye className="h-5 w-5" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          <div className="mb-4">
            <Link href="/reset-hesla" className="text-sm text-slate-700 underline underline-offset-2">
              Zapomenuté heslo
            </Link>
          </div>

          <div className="mb-5 flex flex-wrap gap-2.5">
            <Button type="submit" disabled={loading || checkingLink}>
              {loading ? "Přihlašuji..." : "Přihlásit se"}
            </Button>

            <Button href="/zadost" variant="secondary">
              Chci program pro naši obec
            </Button>
          </div>
        </form>

        <div className="mt-1.5 border-t border-slate-900/[0.08] pt-5">
          <div className="mb-3 text-[15px] font-black text-navy-900">
            Dostali jste pozvánku od administrátora?
          </div>

          <Button href="/join" className="w-full">
            Připojit se ke škole
          </Button>
        </div>
      </Card>
    </main>
  );
}
