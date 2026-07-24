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
  const [sessionChecked, setSessionChecked] = useState(false);
  const [inviteContext, setInviteContext] = useState(null);
  const [inviteChecking, setInviteChecking] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      const current = data?.session || null;
      setSession(current);
      setSessionChecked(true);
      if (current?.user) {
        setForm((previous) => ({
          ...previous,
          contactName:
            previous.contactName ||
            current.user.user_metadata?.full_name ||
            current.user.user_metadata?.name ||
            "",
        }));
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!router.isReady || !inviteToken) return;
    let mounted = true;

    async function loadInviteContext() {
      setInviteChecking(true);
      setError("");
      try {
        const response = await fetch("/api/municipality/invite-context", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            inviteToken,
            organizationType: "school",
          }),
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.error || "Pozvánku se nepodařilo ověřit.");
        }
        if (!mounted) return;
        setInviteContext(data);
        setForm((previous) => ({
          ...previous,
          email: data.invitedEmail || previous.email,
        }));
      } catch (inviteError) {
        if (mounted) {
          setError(inviteError.message || "Pozvánku se nepodařilo ověřit.");
        }
      } finally {
        if (mounted) setInviteChecking(false);
      }
    }

    loadInviteContext();
    return () => {
      mounted = false;
    };
  }, [router.isReady, inviteToken]);

  useEffect(() => {
    if (!sessionChecked || !session?.user || !inviteContext) return;
    if (!inviteContext.invitedEmail) {
      setForm((previous) => ({
        ...previous,
        email: session.user.email || previous.email,
      }));
    }
  }, [sessionChecked, session, inviteContext]);

  const sessionEmail = String(session?.user?.email || "").trim().toLowerCase();
  const invitedEmail = String(inviteContext?.invitedEmail || "")
    .trim()
    .toLowerCase();
  const emailMismatch =
    !!sessionEmail && !!invitedEmail && sessionEmail !== invitedEmail;

  async function signOutForInvite() {
    setError("");
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      setError("Odhlášení se nepodařilo. Zkuste to prosím znovu.");
      return;
    }
    setSession(null);
    setSessionChecked(true);
    setForm((previous) => ({
      ...previous,
      email: invitedEmail,
      contactName: "",
    }));
    await router.replace(
      `/registrace-skoly?invite=${encodeURIComponent(inviteToken)}`
    );
  }

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

              {emailMismatch ? (
                <Alert variant="error" className="mb-4">
                  <div className="font-bold">Jste přihlášeni jiným účtem.</div>
                  <div className="mt-1">
                    Pozvánka je určena pro <strong>{invitedEmail}</strong>, ale
                    přihlášeni jste jako <strong>{sessionEmail}</strong>.
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    className="mt-3"
                    onClick={signOutForInvite}
                  >
                    Odhlásit a pokračovat správným účtem
                  </Button>
                </Alert>
              ) : session ? (
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
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={updateField}
                    disabled={!!invitedEmail || !!session}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Telefon*</Label>
                  <Input id="phone" name="phone" required value={form.phone} onChange={updateField} />
                </div>
                <div className="flex flex-wrap gap-2.5 pt-1">
                  <Button
                    type="submit"
                    disabled={
                      saving ||
                      inviteChecking ||
                      !inviteContext ||
                      emailMismatch
                    }
                  >
                    {saving ? "Registruji…" : "Zaregistrovat školu"}
                  </Button>
                  {!session && !emailMismatch ? (
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
