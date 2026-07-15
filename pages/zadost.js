import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "../components/ui/badge";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Select } from "../components/ui/select";
import { Label } from "../components/ui/label";
import { Alert } from "../components/ui/alert";

export default function ZadostPage() {
  // Demo nabídka byla obchodně ukončena. I starý odkaz ?type=demo proto
  // zobrazí standardní žádost obce a nemůže založit demo lead.
  const isDemoRequest = false;

  const initialType = isDemoRequest ? "škola" : "";

  const [form, setForm] = useState({
    name: "",
    role: "",
    email: "",
    phone: "",
    organization: "",
    address: "",
    population: "",
    type: initialType,
    message: "",
    company: "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      type: isDemoRequest ? "škola" : prev.type || "",
    }));
  }, [isDemoRequest]);

  function updateField(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function submitForm(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    setSubmitted(false);

    try {
      const trimmedName = form.name.trim();
      const trimmedRole = form.role.trim();
      const trimmedEmail = form.email.trim();
      const trimmedPhone = form.phone.trim();
      const trimmedOrganization = form.organization.trim();
      const trimmedAddress = form.address.trim();
      const trimmedPopulation = form.population.trim();
      const trimmedType = isDemoRequest ? form.type.trim() : "obec";
      const trimmedMessage = form.message.trim();

      if (!trimmedName) {
        throw new Error("Vyplňte prosím jméno a příjmení.");
      }

      if (!trimmedEmail) {
        throw new Error("Vyplňte prosím e-mail.");
      }

      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail);
      if (!emailOk) {
        throw new Error("Zadejte prosím platný e-mail.");
      }

      if (!trimmedOrganization) {
        throw new Error(
          isDemoRequest
            ? "Vyplňte prosím školu nebo organizaci, pro kterou chcete ukázkový přístup."
            : "Vyplňte prosím název obce."
        );
      }

      if (!trimmedAddress) {
        throw new Error(
          isDemoRequest
            ? "Vyplňte prosím adresu."
            : "Vyplňte prosím adresu obecního úřadu."
        );
      }

      if (isDemoRequest) {
        if (trimmedPhone && trimmedPhone.length < 6) {
          throw new Error("Telefon je příliš krátký.");
        }
      } else {
        if (!trimmedPhone) {
          throw new Error("Vyplňte prosím telefon.");
        }
        if (trimmedPhone.length < 6) {
          throw new Error("Telefon je příliš krátký.");
        }
      }

      const res = await fetch("/api/zadost-o-pristup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: trimmedName,
          role: trimmedRole,
          email: trimmedEmail,
          phone: trimmedPhone,
          organization: trimmedOrganization,
          address: trimmedAddress,
          population: trimmedPopulation,
          type: trimmedType,
          message: trimmedMessage,
          isDemoRequest,
          company: form.company,
        }),
      });

      let data = {};
      try {
        data = await res.json();
      } catch {
        data = {};
      }

      if (!res.ok) {
        throw new Error(data?.error || "Žádost se nepodařilo odeslat.");
      }

      setMessage(
        isDemoRequest
          ? "Děkujeme. Žádost o ukázkový přístup byla úspěšně odeslána.\n\nJakmile bude přístup schválen, na zadaný e-mail obdržíte zprávu s přístupem, který vás jedním kliknutím zavede přímo do ukázkového prostředí.n\nPokud zprávu během několika minut nenajdete, zkontrolujte prosím i složku Spam nebo Hromadné."
          : data.emailSent === false
            ? "Děkujeme. Žádost o přístup byla úspěšně odeslána.\n\nZpracujeme žádost a obec zaregistrujeme.\n\nPotvrzovací e-mail se teď nepodařilo odeslat, ale vaše žádost je v pořádku zaznamenaná — ozveme se vám i tak."
            : "Děkujeme. Žádost o přístup byla úspěšně odeslána.\n\nZpracujeme žádost a obec zaregistrujeme."
      );

      setSubmitted(true);

      setForm({
        name: "",
        role: "",
        email: "",
        phone: "",
        organization: "",
        address: "",
        population: "",
        type: isDemoRequest ? "škola" : "",
        message: "",
        company: "",
      });
    } catch (err) {
      setError(err.message || "Žádost se nepodařilo odeslat.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-[760px] px-4 py-10">
        <Card className="p-7">
          <Badge variant={isDemoRequest ? "default" : "outline"}>
            {submitted
              ? isDemoRequest
                ? "Žádost přijata"
                : "Odesláno"
              : isDemoRequest
                ? "Ukázkový přístup pro školy"
                : "Žádost o program pro obec"}
          </Badge>

          {!submitted ? (
            <>
              <h1 className="mt-4 text-[34px] font-[950] leading-[1.12] tracking-[-0.03em] text-navy-900">
                {isDemoRequest
                  ? "Požádejte o ukázkový přístup do ARCHIMEDES Live"
                  : "Chci program pro naši obec"}
              </h1>

              <p className="mb-5 mt-3 text-[17px] leading-relaxed text-muted">
                {isDemoRequest
                  ? "Vyplňte krátký formulář a po schválení vám pošleme přístup do ukázkového prostředí. Uvidíte, jak vypadá program, archiv i celkové prostředí portálu z pohledu školy."
                  : "Vyplňte krátký formulář — zpracujeme žádost a obec zaregistrujeme."}
              </p>

              {isDemoRequest ? (
                <Alert variant="success" className="mb-5">
                  Ukázkový přístup slouží pouze k prohlížení prostředí
                  ARCHIMEDES Live. Neumožňuje správu školy, vytváření událostí
                  ani spuštění vysílání.
                </Alert>
              ) : null}

              {error ? (
                <Alert variant="error" className="mb-4">
                  Chyba: {error}
                </Alert>
              ) : null}

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

                {!isDemoRequest ? (
                  <div>
                    <Label htmlFor="role">Funkce (volitelně)</Label>
                    <Select id="role" name="role" value={form.role} onChange={updateField}>
                      <option value="">Vyberte</option>
                      <option value="starosta">Starosta/starostka</option>
                      <option value="mistostarosta">Místostarosta/ka</option>
                      <option value="zamestnanec-uradu">
                        Zaměstnanec obecního úřadu
                      </option>
                      <option value="zastupce-spolku">
                        Zástupce spolku v obci
                      </option>
                      <option value="jine">Jiné</option>
                    </Select>
                  </div>
                ) : null}

                <div>
                  <Label htmlFor="organization">
                    {isDemoRequest ? "Škola / organizace*" : "Název obce*"}
                  </Label>
                  <Input
                    id="organization"
                    name="organization"
                    required
                    value={form.organization}
                    onChange={updateField}
                    placeholder={
                      isDemoRequest
                        ? "Např. ZŠ Hodonín, Gymnázium Vyškov..."
                        : "Např. Obec Křenov"
                    }
                  />
                  <p className="mt-1.5 text-[13px] leading-relaxed text-slate-500">
                    {isDemoRequest
                      ? "Napište prosím školu nebo organizaci, pro kterou chcete ukázkové prostředí zobrazit."
                      : "Napište prosím název obce, která má o program zájem."}
                  </p>
                </div>

                <div>
                  <Label htmlFor="email">E-mail*</Label>
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={form.email}
                    onChange={updateField}
                  />
                </div>

                <div>
                  <Label htmlFor="phone">{isDemoRequest ? "Telefon (volitelně)" : "Telefon*"}</Label>
                  <Input
                    id="phone"
                    name="phone"
                    required={!isDemoRequest}
                    value={form.phone}
                    onChange={updateField}
                  />
                </div>

                <div>
                  <Label htmlFor="address">
                    {isDemoRequest ? "Adresa*" : "Adresa obecního úřadu*"}
                  </Label>
                  <Input
                    id="address"
                    name="address"
                    required
                    value={form.address}
                    onChange={updateField}
                    placeholder="Ulice, číslo popisné, město, PSČ"
                  />
                  <p className="mt-1.5 text-[13px] leading-relaxed text-slate-500">
                    {isDemoRequest
                      ? "Uveďte prosím adresu školy nebo organizace."
                      : "Uveďte prosím adresu obecního úřadu."}
                  </p>
                </div>

                {isDemoRequest ? (
                  <div>
                    <Label htmlFor="type">Typ organizace</Label>
                    <Select id="type" name="type" value={form.type} onChange={updateField}>
                      <option value="">Vyberte</option>
                      <option value="škola">Škola</option>
                      <option value="obec">Obec / město</option>
                      <option value="spolek">Spolek</option>
                      <option value="senior-klub">Senior klub</option>
                      <option value="partner">Partner</option>
                      <option value="jine">Jiné / zatím neurčeno</option>
                    </Select>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-slate-500">
                      Pokud zatím nevystupujete za konkrétní organizaci, zvolte
                      „Jiné / zatím neurčeno“.
                    </p>
                  </div>
                ) : null}

                {!isDemoRequest ? (
                  <div>
                    <Label htmlFor="population">Přibližný počet obyvatel (volitelně)</Label>
                    <Input
                      id="population"
                      name="population"
                      value={form.population}
                      onChange={updateField}
                    />
                  </div>
                ) : null}

                <div>
                  <Label htmlFor="message">{isDemoRequest ? "Poznámka" : "Zpráva (volitelně)"}</Label>
                  <Textarea
                    id="message"
                    name="message"
                    rows={5}
                    value={form.message}
                    onChange={updateField}
                    placeholder={
                      isDemoRequest
                        ? "Můžete doplnit, jakou roli ve škole máte, co vás zajímá nejvíce nebo co byste si chtěli v ukázce ověřit."
                        : "Můžete doplnit cokoli, co nám pomůže se na hovor lépe připravit."
                    }
                  />
                </div>

                <div className="mt-1 flex flex-wrap gap-2.5">
                  <Button type="submit" disabled={saving}>
                    {saving
                      ? "Odesílám..."
                      : isDemoRequest
                        ? "Požádat o ukázkový přístup"
                        : "Odeslat žádost"}
                  </Button>

                  <Button href={isDemoRequest ? "/demo" : "/"} variant="secondary">
                    {isDemoRequest ? "Zpět na ukázku" : "Zpět na hlavní stránku"}
                  </Button>
                </div>
              </form>

              {!isDemoRequest ? (
                <p className="mt-5 text-sm leading-relaxed text-slate-500">
                  Pokud už má vaše obec ARCHIMEDES Live aktivovaný, můžete
                  pokračovat přímo k registraci{" "}
                  <Link href="/registrace-spolku" className="font-bold text-navy-900">
                    spolku
                  </Link>
                  {" nebo "}
                  <Link href="/registrace-skoly" className="font-bold text-navy-900">
                    školy
                  </Link>
                  .
                </p>
              ) : null}
            </>
          ) : (
            <>
              <h1 className="mt-4 text-[34px] font-[950] leading-[1.12] tracking-[-0.03em] text-navy-900">
                {isDemoRequest
                  ? "Žádost o ukázkový přístup jsme přijali"
                  : "Žádost jsme přijali"}
              </h1>

              <Alert variant="success" className="mb-6 mt-5 whitespace-pre-line text-base">
                {message}
              </Alert>

              <div className="mb-7 grid gap-3 text-base leading-relaxed text-muted">
                <div>
                  <strong className="text-navy-900">Co bude následovat:</strong>
                </div>
                {isDemoRequest ? (
                  <>
                    <div>1. Vaši žádost zkontrolujeme a schválíme.</div>
                    <div>
                      2. Na zadaný e-mail obdržíte zprávu s přístupem, který vás jedním kliknutím zavede přímo do ukázkového prostředí.
                    </div>
                    <div>
                      3. Poté vstoupíte do ukázkového prostředí ARCHIMEDES Live.
                    </div>
                  </>
                ) : (
                  <>
                    <div>1. Vaši žádost zaevidujeme.</div>
                    <div>2. Žádost zpracujeme.</div>
                    <div>3. Obec zaregistrujeme a program může začít.</div>
                  </>
                )}
              </div>

              <div className="flex flex-wrap gap-2.5">
                <Button href="/">Zpět na hlavní stránku</Button>
                <Button href={isDemoRequest ? "/demo" : "/login"} variant="secondary">
                  {isDemoRequest ? "Zpět na ukázku" : "Přejít na přihlášení"}
                </Button>
              </div>
            </>
          )}
        </Card>
      </main>
    </div>
  );
}
