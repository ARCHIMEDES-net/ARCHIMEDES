// pages/reset-hesla.js
import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Alert } from "../components/ui/alert";

export default function ResetHeslaPage() {
  const [email, setEmail] = useState("");
  const [requestLoading, setRequestLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleRequestReset(e) {
    e.preventDefault();
    setRequestLoading(true);
    setError("");
    setMessage("");

    try {
      const trimmedEmail = email.trim().toLowerCase();

      if (!trimmedEmail) {
        throw new Error("Vyplňte prosím e-mail.");
      }

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        trimmedEmail,
        {
          redirectTo: `${window.location.origin}/nastavit-heslo`,
        }
      );

      if (resetError) {
        throw new Error(
          resetError.message || "Nepodařilo se odeslat odkaz pro obnovu hesla."
        );
      }

      setMessage(
        "Pokud je tento e-mail v systému registrován, poslali jsme vám odkaz pro nastavení nového hesla."
      );
    } catch (e) {
      setError(e?.message || "Nepodařilo se odeslat odkaz pro obnovu hesla.");
    } finally {
      setRequestLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <Card className="w-full max-w-[560px] p-6 sm:p-7">
        <div className="mb-4">
          <h1 className="text-[32px] font-[950] leading-[1.08] tracking-[-0.03em] text-navy-900">
            Obnova hesla
          </h1>
          <p className="mt-2.5 text-base leading-relaxed text-muted">
            Zadejte e-mail, pod kterým jste registrováni. Pošleme vám odkaz pro
            nastavení nového hesla.
          </p>
        </div>

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

        <form onSubmit={handleRequestReset}>
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

          <div className="mb-3.5 flex flex-wrap gap-2.5">
            <Button type="submit" disabled={requestLoading}>
              {requestLoading ? "Odesílám..." : "Poslat odkaz"}
            </Button>

            <Button href="/login" variant="secondary">
              Zpět na přihlášení
            </Button>
          </div>
        </form>
      </Card>
    </main>
  );
}
