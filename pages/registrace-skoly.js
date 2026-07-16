import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Badge } from "../components/ui/badge";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Alert } from "../components/ui/alert";

export default function RegistraceSkolyPage() {
  const [form, setForm] = useState({
    registrationNumber: "",
    name: "",
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
      setForm((prev) => ({
        ...prev,
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
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  }

  async function submitForm(event) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const response = await fetch("/api/registrace-skoly", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session?.access_token
            ? { Authorization: `Bearer ${session.access_token}` }
            : {}),
        },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Registraci školy se nepodařilo dokončit.");
      }
      setResult(data);
    } catch (submitError) {
      setError(submitError.message || "Registraci školy se nepodařilo dokončit.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-[760px] px-4 py-10">
        <Card className="p-7">
          <Badge variant="outline">Registrace školy</Badge>

          {!result ? (
            <>
              <h1 className="mt-4 text-[34px] font-[950] tracking-[-0.03em] text-navy-900">
                Zaregistrovat školu pod obcí
              </h1>
              <p className="mb-5 mt-3 text-[17px] leading-relaxed text-muted">
                Školu může zaregistrovat ředitel nebo pověřený správce pomocí
                registračního čísla aktivní obce. Po registraci získá škola
                vlastní kód pro učitele.
              </p>

              {session ? (
                <Alert variant="neutral" className="mb-4">
                  Použije se váš přihlášený účet. E-mail ani heslo se nezmění.
                </Alert>
              ) : null}
              {error ? <Alert variant="error" className="mb-4">{error}</Alert> : null}

              <form onSubmit={submitForm} className="grid gap-4">
                <div>
                  <Label htmlFor="registrationNumber">Registrační číslo obce*</Label>
                  <Input id="registrationNumber" name="registrationNumber" required value={form.registrationNumber} onChange={updateField} />
                </div>
                <div>
                  <Label htmlFor="name">Název školy*</Label>
                  <Input id="name" name="name" required value={form.name} onChange={updateField} />
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
                    <Button href="/login?next=/registrace-skoly" variant="secondary">
                      Už mám účet
                    </Button>
                  ) : null}
                  <Button href="/zadost" variant="secondary">Zpět</Button>
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
