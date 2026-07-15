import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Badge } from "../components/ui/badge";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select } from "../components/ui/select";
import { Label } from "../components/ui/label";
import { Alert } from "../components/ui/alert";

const ACTIVITY_OPTIONS = [
  { code: "hasici", label: "Požární ochrana" },
  { code: "sport", label: "Sport a tělovýchova" },
  { code: "myslivost", label: "Myslivost" },
  { code: "vcelarstvi", label: "Včelařství" },
  { code: "zahradkari", label: "Zahrádkáři a pěstitelé" },
  { code: "rybarstvi", label: "Rybářství" },
  { code: "chovatelstvi", label: "Chovatelství" },
  { code: "folklor", label: "Folklor a tradice" },
  { code: "kultura", label: "Kultura a umění" },
  { code: "seniori", label: "Senioři" },
  { code: "rodice_deti", label: "Rodiče a děti" },
  { code: "mladez", label: "Děti a mládež" },
  { code: "socialni", label: "Sociální a zdravotní" },
  { code: "duchovni", label: "Duchovní společenství" },
  { code: "komunita", label: "Okrašlovací a komunitní" },
  { code: "smart_city", label: "Chytrá obec" },
  { code: "jine", label: "Jiné" },
];

export default function RegistraceSpolkuPage() {
  const [form, setForm] = useState({
    registrationNumber: "",
    name: "",
    contactName: "",
    email: "",
    phone: "",
    activityCode: "",
    customText: "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [resultOrg, setResultOrg] = useState(null);
  const [session, setSession] = useState(null);

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

  function updateField(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function submitForm(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSubmitted(false);

    try {
      const trimmedRegistrationNumber = form.registrationNumber.trim();
      const trimmedName = form.name.trim();
      const trimmedContactName = form.contactName.trim();
      const trimmedEmail = form.email.trim();
      const trimmedPhone = form.phone.trim();
      const trimmedCustomText = form.customText.trim();

      if (!trimmedRegistrationNumber) {
        throw new Error("Vyplňte prosím registrační číslo obce.");
      }

      if (!trimmedName) {
        throw new Error("Vyplňte prosím název spolku.");
      }

      if (!trimmedContactName) {
        throw new Error("Vyplňte prosím kontaktní osobu.");
      }

      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail);
      if (!emailOk) {
        throw new Error("Zadejte prosím platný e-mail.");
      }

      if (!trimmedPhone || trimmedPhone.length < 6) {
        throw new Error("Vyplňte prosím platný telefon.");
      }

      if (!form.activityCode) {
        throw new Error("Vyberte prosím činnost spolku.");
      }

      if (form.activityCode === "jine" && !trimmedCustomText) {
        throw new Error("U činnosti „Jiné“ prosím vyplňte, o jakou činnost jde.");
      }

      const res = await fetch("/api/registrace-spolku", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session?.access_token
            ? { Authorization: `Bearer ${session.access_token}` }
            : {}),
        },
        body: JSON.stringify({
          registrationNumber: trimmedRegistrationNumber,
          name: trimmedName,
          contactName: trimmedContactName,
          email: trimmedEmail,
          phone: trimmedPhone,
          activityCode: form.activityCode,
          customText: trimmedCustomText,
        }),
      });

      let data = {};
      try {
        data = await res.json();
      } catch {
        data = {};
      }

      if (!res.ok) {
        throw new Error(data?.error || "Registraci se nepodařilo odeslat.");
      }

      setResultOrg(data.organization || null);
      setSubmitted(true);
    } catch (err) {
      setError(err.message || "Registraci se nepodařilo odeslat.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-[760px] px-4 py-10">
        <Card className="p-7">
          <Badge variant="outline">{submitted ? "Registrace přijata" : "Registrace spolku"}</Badge>

          {!submitted ? (
            <>
              <h1 className="mt-4 text-[34px] font-[950] leading-[1.12] tracking-[-0.03em] text-navy-900">
                Registrace spolku do ARCHIMEDES Live
              </h1>

              <p className="mb-5 mt-3 text-[17px] leading-relaxed text-muted">
                Vyplňte registrační číslo vaší obce (obdržíte ho od obecního
                úřadu) a údaje o spolku.
              </p>

              {error ? (
                <Alert variant="error" className="mb-4">
                  Chyba: {error}
                </Alert>
              ) : null}

              {session ? (
                <Alert variant="neutral" className="mb-4">
                  Použije se váš přihlášený účet. E-mail ani heslo se nezmění.
                </Alert>
              ) : null}

              <form onSubmit={submitForm} className="grid gap-4">
                <div>
                  <Label htmlFor="registrationNumber">Registrační číslo obce*</Label>
                  <Input
                    id="registrationNumber"
                    name="registrationNumber"
                    required
                    value={form.registrationNumber}
                    onChange={updateField}
                    placeholder="Např. 4823"
                  />
                  <p className="mt-1.5 text-[13px] leading-relaxed text-slate-500">
                    Registrační číslo vám sdělí obecní úřad, který má
                    ARCHIMEDES Live aktivovaný.
                  </p>
                </div>

                <div>
                  <Label htmlFor="name">Název spolku*</Label>
                  <Input
                    id="name"
                    name="name"
                    required
                    value={form.name}
                    onChange={updateField}
                    placeholder="Např. SDH Křenov"
                  />
                </div>

                <div>
                  <Label htmlFor="contactName">Kontaktní osoba*</Label>
                  <Input id="contactName" name="contactName" required value={form.contactName} onChange={updateField} />
                </div>

                <div>
                  <Label htmlFor="email">E-mail*</Label>
                  <Input type="email" id="email" name="email" required value={form.email} onChange={updateField} disabled={!!session} />
                </div>

                <div>
                  <Label htmlFor="phone">Telefon*</Label>
                  <Input id="phone" name="phone" required value={form.phone} onChange={updateField} />
                </div>

                <div>
                  <Label htmlFor="activityCode">Činnost spolku*</Label>
                  <Select id="activityCode" name="activityCode" required value={form.activityCode} onChange={updateField}>
                    <option value="">Vyberte</option>
                    {ACTIVITY_OPTIONS.map((o) => (
                      <option key={o.code} value={o.code}>
                        {o.label}
                      </option>
                    ))}
                  </Select>
                </div>

                {form.activityCode === "jine" ? (
                  <div>
                    <Label htmlFor="customText">Upřesněte činnost*</Label>
                    <Input id="customText" name="customText" required value={form.customText} onChange={updateField} />
                  </div>
                ) : null}

                <div className="mt-1 flex flex-wrap gap-2.5">
                  <Button type="submit" disabled={saving}>
                    {saving ? "Odesílám..." : "Registrovat spolek"}
                  </Button>
                  <Button href="/" variant="secondary">
                    Zpět na hlavní stránku
                  </Button>
                  {!session ? (
                    <Button href="/login?next=/registrace-spolku" variant="secondary">
                      Už mám účet
                    </Button>
                  ) : null}
                </div>
              </form>
            </>
          ) : (
            <>
              <h1 className="mt-4 text-[34px] font-[950] leading-[1.12] tracking-[-0.03em] text-navy-900">
                Spolek jsme zaregistrovali
              </h1>

              <Alert variant="success" className="mb-6 mt-5 text-base">
                {resultOrg?.registrationNumber || resultOrg?.registration_number
                  ? `Registrační číslo spolku: ${
                      resultOrg.registration_number || resultOrg.registrationNumber
                    }`
                  : "Registraci jsme přijali."}
              </Alert>

              <div className="flex flex-wrap gap-2.5">
                {resultOrg?.join_code ? (
                  <Button
                    href={`/pridat-se-k-organizaci?code=${encodeURIComponent(
                      resultOrg.join_code
                    )}`}
                  >
                    Nastavit osobní zájmy
                  </Button>
                ) : null}
                <Button href="/" variant="secondary">Zpět na hlavní stránku</Button>
              </div>
            </>
          )}
        </Card>
      </main>
    </div>
  );
}
