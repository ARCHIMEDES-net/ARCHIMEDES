import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { supabase } from "../lib/supabaseClient";
import { cn } from "../lib/utils";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Alert } from "../components/ui/alert";

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
      setJoinCode(router.query.code.toUpperCase());
    }
  }, [router.isReady, router.query.code]);

  const passwordTooShort = password.length > 0 && password.length < 8;
  const passwordMismatch =
    passwordConfirm.length > 0 && password !== passwordConfirm;

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

    if (!passwordConfirm) {
      setError("Potvrďte prosím heslo.");
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

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-[760px] px-4 py-12">
        <Card className="p-7">
          <img src="/logo-archimedes-live.png" alt="ARCHIMEDES Live" className="mb-4 block h-[42px] w-auto" />

          <h1 className="mb-2.5 text-[34px] font-[950] tracking-[-0.03em] text-navy-900">
            Připojit se do organizace
          </h1>

          <p className="mb-6 text-muted">
            Pokud jste dostali kód školy nebo organizace, vyplňte formulář a účet se
            automaticky připojí ke správné organizaci.
          </p>

          {error ? (
            <Alert variant="error" className="mb-4">
              Chyba: {error}
            </Alert>
          ) : null}

          {message ? (
            <Alert variant="success" className="mb-4">
              {message}
            </Alert>
          ) : null}

          <form onSubmit={handleSubmit}>
            <div className="grid gap-3.5">
              <div>
                <Label>Jméno a příjmení</Label>
                <Input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Např. Jana Nováková"
                  autoComplete="name"
                />
              </div>

              <div>
                <Label>E-mail</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jmeno@skola.cz"
                  autoComplete="email"
                />
              </div>

              <div>
                <Label>Heslo</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Alespoň 8 znaků"
                  className={cn(passwordTooShort && "border-red-400 focus:ring-red-400")}
                  autoComplete="new-password"
                />
                {passwordTooShort ? (
                  <p className="mt-1.5 text-sm font-semibold text-red-600">
                    Heslo musí mít alespoň 8 znaků.
                  </p>
                ) : null}
              </div>

              <div>
                <Label>Potvrzení hesla</Label>
                <Input
                  type="password"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  placeholder="Zadejte heslo znovu"
                  className={cn(passwordMismatch && "border-red-400 focus:ring-red-400")}
                  autoComplete="new-password"
                />
                {passwordMismatch ? (
                  <p className="mt-1.5 text-sm font-semibold text-red-600">Hesla se neshodují.</p>
                ) : null}
              </div>

              <div>
                <Label>Kód organizace</Label>
                <Input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="NAPŘ. ORG-A1B2C3D4"
                  className="uppercase"
                  autoComplete="off"
                />
              </div>

              <div className="pt-1.5">
                <Button type="submit" disabled={saving}>
                  {saving ? "Vytvářím účet…" : "Vytvořit účet a připojit se"}
                </Button>
              </div>
            </div>
          </form>

          <div className="mt-4 text-muted">
            Už účet máte?{" "}
            <Link href="/login" className="font-bold text-brand hover:underline">
              Přihlaste se
            </Link>
          </div>
        </Card>
      </main>
    </div>
  );
}
