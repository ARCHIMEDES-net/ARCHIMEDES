import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import Footer from "../components/Footer";
import { Badge } from "../components/ui/badge";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Select } from "../components/ui/select";
import { Label } from "../components/ui/label";
import { Alert } from "../components/ui/alert";

const EMPTY_FORM = {
  name: "",
  role: "",
  email: "",
  phone: "",
  organization: "",
  address: "",
  population: "",
  message: "",
  company: "",
};

export default function ZadostPage() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function submitForm(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const payload = {
        name: form.name.trim(),
        role: form.role.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        organization: form.organization.trim(),
        address: form.address.trim(),
        population: form.population.trim(),
        type: "obec",
        message: form.message.trim(),
        company: form.company,
      };

      if (!payload.name) throw new Error("Vyplňte prosím jméno a příjmení.");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
        throw new Error("Zadejte prosím platný e-mail.");
      }
      if (!payload.organization) throw new Error("Vyplňte prosím název obce.");
      if (!payload.address) throw new Error("Vyplňte prosím adresu obecního úřadu.");
      if (!payload.phone) throw new Error("Vyplňte prosím telefon.");
      if (payload.phone.length < 6) throw new Error("Telefon je příliš krátký.");

      const response = await fetch("/api/zadost-o-pristup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Žádost se nepodařilo odeslat.");

      setMessage(
        result.emailSent === false
          ? "Děkujeme. Žádost o přístup byla úspěšně odeslána.\n\nZpracujeme žádost a obec zaregistrujeme.\n\nPotvrzovací e-mail se teď nepodařilo odeslat, ale vaše žádost je v pořádku zaznamenaná — ozveme se vám i tak."
          : "Děkujeme. Žádost o přístup byla úspěšně odeslána.\n\nZpracujeme žádost a obec zaregistrujeme."
      );
      setSubmitted(true);
      setForm(EMPTY_FORM);
    } catch (submitError) {
      setError(submitError.message || "Žádost se nepodařilo odeslat.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Head>
        <title>Program pro vaši obec | ARCHIMEDES Live</title>
        <meta
          name="description"
          content="Požádejte o program ARCHIMEDES Live pro školy, spolky, seniory a další komunity ve vaší obci."
        />
      </Head>
      <main className="mx-auto max-w-[760px] px-4 py-10">
        <Card className="p-7">
          <Badge variant="outline">{submitted ? "Odesláno" : "Žádost o program pro obec"}</Badge>

          {!submitted ? (
            <>
              <h1 className="mt-4 text-[34px] font-[950] leading-[1.12] tracking-[-0.03em] text-navy-900">
                Chci program pro naši obec
              </h1>
              <p className="mb-5 mt-3 text-[17px] leading-relaxed text-muted">
                Vyplňte krátký formulář — žádost zpracujeme a obec po kontrole zaregistrujeme.
              </p>

              {error ? <Alert variant="error" className="mb-4">Chyba: {error}</Alert> : null}

              <form onSubmit={submitForm} className="grid gap-4">
                <input
                  type="text"
                  name="company"
                  value={form.company}
                  onChange={updateField}
                  autoComplete="off"
                  tabIndex={-1}
                  aria-hidden="true"
                  className="pointer-events-none absolute left-[-9999px] h-0 w-0 opacity-0"
                />

                <div>
                  <Label htmlFor="name">Jméno a příjmení*</Label>
                  <Input id="name" name="name" required value={form.name} onChange={updateField} />
                </div>

                <div>
                  <Label htmlFor="role">Funkce (volitelně)</Label>
                  <Select id="role" name="role" value={form.role} onChange={updateField}>
                    <option value="">Vyberte</option>
                    <option value="starosta">Starosta/starostka</option>
                    <option value="mistostarosta">Místostarosta/ka</option>
                    <option value="zamestnanec-uradu">Zaměstnanec obecního úřadu</option>
                    <option value="zastupce-spolku">Zástupce spolku v obci</option>
                    <option value="jine">Jiné</option>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="organization">Název obce*</Label>
                  <Input id="organization" name="organization" required value={form.organization} onChange={updateField} placeholder="Např. Obec Křenov" />
                </div>

                <div>
                  <Label htmlFor="email">E-mail*</Label>
                  <Input type="email" id="email" name="email" required value={form.email} onChange={updateField} />
                </div>

                <div>
                  <Label htmlFor="phone">Telefon*</Label>
                  <Input id="phone" name="phone" required value={form.phone} onChange={updateField} />
                </div>

                <div>
                  <Label htmlFor="address">Adresa obecního úřadu*</Label>
                  <Input id="address" name="address" required value={form.address} onChange={updateField} placeholder="Ulice, číslo popisné, obec, PSČ" />
                </div>

                <div>
                  <Label htmlFor="population">Přibližný počet obyvatel (volitelně)</Label>
                  <Input id="population" name="population" value={form.population} onChange={updateField} />
                </div>

                <div>
                  <Label htmlFor="message">Zpráva (volitelně)</Label>
                  <Textarea id="message" name="message" rows={5} value={form.message} onChange={updateField} placeholder="Můžete doplnit cokoli, co nám pomůže žádost zpracovat." />
                </div>

                <div className="mt-1 flex flex-wrap gap-2.5">
                  <Button type="submit" disabled={saving}>{saving ? "Odesílám..." : "Odeslat žádost"}</Button>
                  <Button href="/" variant="secondary">Zpět na hlavní stránku</Button>
                </div>
              </form>

              <p className="mt-5 text-sm leading-relaxed text-slate-500">
                Pokud už má vaše obec ARCHIMEDES Live aktivovaný, můžete pokračovat přímo k registraci{" "}
                <Link href="/registrace-spolku" className="font-bold text-navy-900">spolku</Link>{" nebo "}
                <Link href="/registrace-skoly" className="font-bold text-navy-900">školy</Link>.
              </p>
            </>
          ) : (
            <>
              <h1 className="mt-4 text-[34px] font-[950] leading-[1.12] tracking-[-0.03em] text-navy-900">Žádost jsme přijali</h1>
              <Alert variant="success" className="mb-6 mt-5 whitespace-pre-line text-base">{message}</Alert>
              <div className="mb-7 grid gap-3 text-base leading-relaxed text-muted">
                <div><strong className="text-navy-900">Co bude následovat:</strong></div>
                <div>1. Vaši žádost zaevidujeme a zkontrolujeme.</div>
                <div>2. Obec aktivuje platformový administrátor.</div>
                <div>3. Kontaktní osoba obdrží přístup pod svým stávajícím nebo nově založeným účtem.</div>
              </div>
              <div className="flex flex-wrap gap-2.5">
                <Button href="/">Zpět na hlavní stránku</Button>
                <Button href="/login" variant="secondary">Přejít na přihlášení</Button>
              </div>
            </>
          )}
        </Card>
      </main>
      <Footer />
    </div>
  );
}
