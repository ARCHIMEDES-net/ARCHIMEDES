import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { supabase } from "../lib/supabaseClient";
import { Badge } from "../components/ui/badge";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Alert } from "../components/ui/alert";

export default function RegistraceSkolyPage() {
  const router = useRouter();
  const inviteToken = typeof router.query.invite === "string" ? router.query.invite : "";
  const [form, setForm] = useState({
    name: "",
    address: "",
    legalIdentifier: "",
    contactName: "",
    email: "",
    phone: "",
  });
  const [session, setSession] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted || !data?.session?.user) return;
      const current = data.session;
      setSession(current);
      setForm((previous) => ({
        ...previous,
        email: current.user.email || "",
        contactName:
          current.user.user_metadata?.full_name ||
          current.user.user_metadata?.name ||
          "",
      }));
    });
    return () => {
      mounted = false;
    };
  }, []);

  function updateField(event) {
    setForm((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
  }

  async function submitForm(event) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      if (!inviteToken) {
        throw new Error("Registraci musí zahájit obec jednorázovou pozvánkou.");
      }

      const cleanAddress = form.address.trim();
      const cleanLegalIdentifier = form.legalIdentifier
        .replace(/\s+/g, "")
        .trim();

      if (!cleanAddress) throw new Error("Vyplňte adresu školy.");
      if (cleanLegalIdentifier && !/^\d{8}$/.test(cleanLegalIdentifier)) {
        throw new Error("IČO musí obsahovat přesně 8 číslic.");
      }

      const response = await fetch("/api/registrace-skoly", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session?.access_token
            ? { Authorization: `Bearer ${session.access_token}` }
            : {}),
        },
        body: JSON.stringify({
          ...form,
          inviteToken,
          address: cleanAddress,
          legalIdentifier: cleanLegalIdentifier,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Registraci školy se nepodařilo dokončit."
        );
      }

      setResult(data);
    } catch (submitError) {
      setError(
        submitError.message || "Registraci školy se nepodařilo dokončit."
      );
    } finally {
      setSaving(false);
    }
  }

  const loginNext = encodeURIComponent(
    `/registrace-skoly?invite=${inviteToken}`
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <Head>
        <meta name="referrer" content="no-referrer" />
      </Head>
      <main className="mx-auto max-w-[760px] px-4 py-10">
        <Card className="p-7">
          <Badge variant="outline">Registrace školy</Badge>

          {router.isReady && !inviteToken ? (
            <>
              <h1 className="mt-4 text-[34px] font-[950] tracking-[-0.03em] text-navy-900">
                Je potřeba pozvánka obce
              </h1>
              <Alert variant="neutral" className="mb-5 mt-5">
                Školu může do programu připojit pouze obec s aktivním
                ARCHIMEDES Live. Požádejte obecní úřad o jednorázový
                registrační odkaz.
              </Alert>
              <Button href="/kontakt">Kontaktovat podporu</Button>
            </>
          ) : !result ? (
            <>
              <h1 className="mt-4 text-[34px] font-[950] tracking-[-0.03em] text-navy-900">
                Zaregistrovat školu pod obcí
              </h1>
              <p className="mb-5 mt-3 text-[17px] leading-relaxed text-muted">
                Otevíráte bezpečnou jednorázovou pozvánku vytvořenou správcem
                obce. Po registraci získá škola vlastní kód pro učitele.
              </p>

              {session ? (
                <Alert variant="neutral" className="mb-4">
                  Použije se váš přihlášený účet. E-mail ani heslo se nezmění.
                </Alert>
              ) : null}
              {error ? <Alert variant="error" className="mb-4">{error}</Alert> : null}

              <form onSubmit={submitForm} className="grid gap-4">
                <div>
                  <Label htmlFor="name">Název školy*</Label>
                  <Input id="name" name="name" required value={form.name} onChange={updateField} />
                </div>
                <div className="grid gap-4 sm:grid-cols-[1.35fr_0.65fr]">
                  <div>
                    <Label htmlFor="address">Adresa školy*</Label>
                    <Input id="address" name="address" required value={form.address} onChange={updateField} placeholder="Ulice, obec, PSČ" />
                  </div>
                  <div>
                    <Label htmlFor="legalIdentifier">IČO (volitelně)</Label>
                    <Input id="legalIdentifier" name="legalIdentifier" inputMode="numeric" value={form.legalIdentifier} onChange={updateField} placeholder="8 číslic" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="contactName">Ředitel nebo správce školy*</Label>
                  <Input id="contactName" name="contactName" required value={form.contactName} onChange={updateField} />
                </div>
                <div>
                  <Label htmlFor="email">E-mail*</Label>
                  <Input id="email" name="email" type="email" required value={form.email} onChange={updateField} disabled={!!session} />
                </div>
                <div>
                  <Label htmlFor="phone">Telefon*</Label>
                  <Input id="phone" name="phone" required value={form.phone} onChange={updateField} />
                </div>
                <div className="flex flex-wrap gap-2.5 pt-1">
                  <Button type="submit" disabled={saving}>
                    {saving ? "Registruji…" : "Zaregistrovat školu"}
                  </Button>
                  {!session ? (
                    <Button href={`/login?next=${loginNext}`} variant="secondary">
                      Už mám účet
                    </Button>
                  ) : null}
                </div>
              </form>
            </>
          ) : (
            <>
              <h1 className="mt-4 text-[34px] font-[950] tracking-[-0.03em] text-navy-900">
                Škola je zaregistrovaná
              </h1>
              <Alert variant="success" className="mb-5 mt-5">
                Škola „{result.organization?.name}“ byla připojena pod obec.
                {result.organization?.join_code
                  ? ` Kód školy pro učitele: ${result.organization.join_code}`
                  : ""}
                {!result.existingAccount && result.emailSent
                  ? " Odkaz pro nastavení hesla jsme poslali e-mailem."
                  : ""}
              </Alert>
              <Button href="/portal">Pokračovat do portálu</Button>
            </>
          )}
        </Card>
      </main>
    </div>
  );
}
