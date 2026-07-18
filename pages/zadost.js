import { useEffect, useState } from "react";
import { useRouter } from "next/router";
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
  type: "",
  name: "",
  role: "",
  email: "",
  phone: "",
  organization: "",
  address: "",
  population: "",
  legalIdentifier: "",
  message: "",
  company: "",
};

const CUSTOMER_TYPES = {
  obec: {
    label: "Obec",
    organizationLabel: "Název obce",
    organizationPlaceholder: "Např. Obec Křenov",
    addressLabel: "Adresa obecního úřadu",
    successLabel: "obec",
  },
  skola: {
    label: "Škola",
    organizationLabel: "Název školy",
    organizationPlaceholder: "Oficiální název školy",
    addressLabel: "Adresa školy",
    successLabel: "školu",
  },
  spolek: {
    label: "Spolek",
    organizationLabel: "Název spolku",
    organizationPlaceholder: "Oficiální název spolku",
    addressLabel: "Sídlo spolku",
    successLabel: "spolek",
  },
};

export default function ZadostPage() {
  const router = useRouter();
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const customerType = CUSTOMER_TYPES[form.type] || null;

  useEffect(() => {
    if (!router.isReady || !router.query.type) return;
    const requestedType = String(router.query.type).toLowerCase();
    if (CUSTOMER_TYPES[requestedType]) {
      setForm((current) => ({ ...current, type: requestedType }));
    }
  }, [router.isReady, router.query.type]);

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
        type: form.type,
        name: form.name.trim(),
        role: form.role.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        organization: form.organization.trim(),
        address: form.address.trim(),
        population: form.population.trim(),
        legalIdentifier: form.legalIdentifier.trim(),
        message: form.message.trim(),
        company: form.company,
      };

      if (!CUSTOMER_TYPES[payload.type]) throw new Error("Vyberte prosím, koho chcete zapojit.");
      if (!payload.name) throw new Error("Vyplňte prosím jméno a příjmení.");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
        throw new Error("Zadejte prosím platný e-mail.");
      }
      if (!payload.organization) throw new Error(`Vyplňte prosím ${CUSTOMER_TYPES[payload.type].organizationLabel.toLowerCase()}.`);
      if (!payload.address) throw new Error(`Vyplňte prosím ${CUSTOMER_TYPES[payload.type].addressLabel.toLowerCase()}.`);
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
          ? `Děkujeme. Žádost byla úspěšně odeslána.\n\nPo ověření ${CUSTOMER_TYPES[payload.type].successLabel} zaregistrujeme.\n\nPotvrzovací e-mail se teď nepodařilo odeslat, ale vaše žádost je v pořádku zaznamenaná — ozveme se vám i tak.`
          : `Děkujeme. Žádost byla úspěšně odeslána.\n\nPo ověření ${CUSTOMER_TYPES[payload.type].successLabel} zaregistrujeme.`
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
        <title>Zapojit obec, školu nebo spolek | ARCHIMEDES Live</title>
        <meta
          name="description"
          content="Objednejte jednotný program ARCHIMEDES Live pro obec, školu nebo spolek za 1 990 Kč měsíčně."
        />
      </Head>
      <main className="mx-auto max-w-[760px] px-4 py-10">
        <Card className="p-7">
          <Badge variant="outline">{submitted ? "Odesláno" : "Žádost o program"}</Badge>

          {!submitted ? (
            <>
              <h1 className="mt-4 text-[34px] font-[950] leading-[1.12] tracking-[-0.03em] text-navy-900">
                Chci zapojit obec, školu nebo spolek
              </h1>
              <p className="mb-5 mt-3 text-[17px] leading-relaxed text-muted">
                Jeden společný program stojí 1 990 Kč měsíčně. Žádost ověříme
                a ozveme se vám s dalším postupem zapojení.
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
                  <Label htmlFor="type">Koho chcete zapojit?*</Label>
                  <Select id="type" name="type" required value={form.type} onChange={updateField}>
                    <option value="">Vyberte</option>
                    <option value="obec">Obec</option>
                    <option value="skola">Školu</option>
                    <option value="spolek">Spolek</option>
                  </Select>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="name">Jméno a příjmení*</Label>
                    <Input id="name" name="name" autoComplete="name" required value={form.name} onChange={updateField} />
                  </div>

                  <div>
                    <Label htmlFor="role">Funkce (volitelně)</Label>
                    <Select id="role" name="role" value={form.role} onChange={updateField}>
                      <option value="">Vyberte</option>
                      <option value="starosta">Starosta/starostka</option>
                      <option value="mistostarosta">Místostarosta/místostarostka</option>
                      <option value="zamestnanec-uradu">Zaměstnanec obecního úřadu</option>
                      <option value="vedeni-skoly">Ředitel/ředitelka nebo vedení školy</option>
                      <option value="ucitel">Učitel/učitelka</option>
                      <option value="zastupce-spolku">Zástupce spolku</option>
                      <option value="jine">Jiné</option>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="email">E-mail*</Label>
                    <Input type="email" id="email" name="email" autoComplete="email" required value={form.email} onChange={updateField} />
                  </div>

                  <div>
                    <Label htmlFor="phone">Telefon*</Label>
                    <Input type="tel" id="phone" name="phone" autoComplete="tel" inputMode="tel" required value={form.phone} onChange={updateField} />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-[1.35fr_0.65fr]">
                  <div>
                    <Label htmlFor="organization">{customerType?.organizationLabel || "Název subjektu"}*</Label>
                    <Input id="organization" name="organization" autoComplete="organization" required value={form.organization} onChange={updateField} placeholder={customerType?.organizationPlaceholder || "Oficiální název"} />
                  </div>

                  <div>
                    <Label htmlFor="legalIdentifier">IČO (volitelně)</Label>
                    <Input id="legalIdentifier" name="legalIdentifier" inputMode="numeric" value={form.legalIdentifier} onChange={updateField} placeholder="8 číslic" />
                  </div>
                </div>

                {form.type === "obec" ? (
                  <div>
                    <Label htmlFor="population">Počet obyvatel (volitelně)</Label>
                    <Input id="population" name="population" inputMode="numeric" value={form.population} onChange={updateField} />
                  </div>
                ) : null}

                <div>
                  <Label htmlFor="address">{customerType?.addressLabel || "Adresa sídla"}*</Label>
                  <Input id="address" name="address" autoComplete="street-address" required value={form.address} onChange={updateField} placeholder="Ulice, číslo popisné, obec, PSČ" />
                </div>

                {form.type === "skola" || form.type === "spolek" ? (
                  <p className="text-xs leading-relaxed text-slate-500">
                    Pokud subjekt nemá vlastní fakturační údaje, uveďte prosím
                    jeho zřizovatele nebo provozovatele do zprávy.
                  </p>
                ) : null}

                <div>
                  <Label htmlFor="message">Zpráva (volitelně)</Label>
                  <Textarea id="message" name="message" rows={5} value={form.message} onChange={updateField} placeholder="Můžete doplnit cokoli, co nám pomůže žádost zpracovat." />
                </div>

                <div className="mt-1 flex flex-wrap gap-2.5">
                  <Button type="submit" disabled={saving} className="w-full sm:w-auto">{saving ? "Odesílám..." : "Odeslat žádost o program"}</Button>
                  <Button href="/" variant="secondary" className="w-full sm:w-auto">Zpět na hlavní stránku</Button>
                </div>

                <p className="text-xs leading-relaxed text-slate-500">
                  Kontaktní údaje použijeme pouze ke zpracování žádosti a navazující komunikaci. Podrobnosti najdete v {" "}
                  <Link href="/ochrana-osobnich-udaju" className="font-bold text-navy-900 underline underline-offset-2">zásadách ochrany osobních údajů</Link>.
                </p>
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
                <div>2. Po ověření aktivujeme vybraný subjekt v ARCHIMEDES Live.</div>
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
