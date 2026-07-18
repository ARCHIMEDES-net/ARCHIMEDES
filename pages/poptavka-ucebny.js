import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import Footer from "../components/Footer";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select } from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";
import { Alert } from "../components/ui/alert";

const EMPTY_FORM = {
  organizationType: "",
  organization: "",
  place: "",
  name: "",
  email: "",
  phone: "",
  variant: "",
  timeframe: "",
  message: "",
  company: "",
};

export default function ClassroomInquiryPage() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function submitForm(event) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const response = await fetch("/api/poptavka-ucebny", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Poptávku se nepodařilo odeslat.");
      setSubmitted(true);
      setForm(EMPTY_FORM);
    } catch (submitError) {
      setError(submitError.message || "Poptávku se nepodařilo odeslat.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Head>
        <title>Poptávka venkovní učebny ARCHIMEDES®</title>
        <meta
          name="description"
          content="Nezávazná poptávka venkovní učebny ARCHIMEDES® pro školu nebo obec."
        />
      </Head>

      <main className="min-h-screen bg-[#f4f7fb] px-4 py-10 sm:py-14">
        <div className="mx-auto max-w-[820px]">
          <Link href="/ucebna" className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-brand">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Zpět na učebnu
          </Link>

          <Card className="overflow-hidden p-0">
            <div className="bg-[#0f3154] px-6 py-8 text-white sm:px-9 sm:py-10">
              <Badge className="border-white/20 bg-white/10 text-white">Venkovní učebna ARCHIMEDES®</Badge>
              <h1 className="mt-4 text-[clamp(34px,5vw,48px)] font-[950] leading-[1.02] tracking-[-0.045em]">
                Nezávazná poptávka učebny
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/75 sm:text-lg">
                Napište nám základní informace. Ozveme se vám kvůli vhodné variantě,
                místu realizace a dalšímu postupu.
              </p>
            </div>

            <div className="p-6 sm:p-9">
              {submitted ? (
                <div className="py-5 text-center">
                  <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-600" aria-hidden="true" />
                  <h2 className="mt-5 text-2xl font-[950] text-navy-900">Poptávka byla odeslána</h2>
                  <p className="mx-auto mt-3 max-w-lg leading-relaxed text-muted">
                    Děkujeme. Na váš e-mail jsme poslali potvrzení a s dalším postupem se vám ozveme osobně.
                  </p>
                  <Button href="/ucebna" className="mt-7">Zpět k učebně</Button>
                </div>
              ) : (
                <form onSubmit={submitForm} className="grid gap-5">
                  {error ? <Alert variant="error">{error}</Alert> : null}

                  <Input
                    aria-hidden="true"
                    tabIndex={-1}
                    autoComplete="off"
                    name="company"
                    value={form.company}
                    onChange={updateField}
                    className="pointer-events-none absolute left-[-9999px] h-0 w-0 opacity-0"
                  />

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="organizationType">Poptáváte za*</Label>
                      <Select id="organizationType" name="organizationType" required value={form.organizationType} onChange={updateField}>
                        <option value="">Vyberte</option>
                        <option value="school">Školu</option>
                        <option value="municipality">Obec nebo město</option>
                        <option value="other">Jinou organizaci</option>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="organization">Název školy nebo organizace*</Label>
                      <Input id="organization" name="organization" autoComplete="organization" required value={form.organization} onChange={updateField} />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="place">Místo plánované realizace*</Label>
                    <Input id="place" name="place" required value={form.place} onChange={updateField} placeholder="Obec, případně adresa" />
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="name">Jméno a příjmení*</Label>
                      <Input id="name" name="name" autoComplete="name" required value={form.name} onChange={updateField} />
                    </div>
                    <div>
                      <Label htmlFor="phone">Telefon*</Label>
                      <Input id="phone" name="phone" type="tel" autoComplete="tel" required value={form.phone} onChange={updateField} />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">E-mail*</Label>
                    <Input id="email" name="email" type="email" autoComplete="email" required value={form.email} onChange={updateField} />
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="variant">Preferovaná varianta</Label>
                      <Select id="variant" name="variant" value={form.variant} onChange={updateField}>
                        <option value="">Zatím nevím</option>
                        <option value="optimal">OPTIMAL</option>
                        <option value="optimal-plus">OPTIMAL+</option>
                        <option value="premium">PREMIUM</option>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="timeframe">Předpokládaný termín</Label>
                      <Select id="timeframe" name="timeframe" value={form.timeframe} onChange={updateField}>
                        <option value="">Zatím nevím</option>
                        <option value="this-year">Ještě letos</option>
                        <option value="next-year">V příštím roce</option>
                        <option value="later">Později</option>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="message">Co už o projektu víte? (volitelně)</Label>
                    <Textarea id="message" name="message" rows={5} value={form.message} onChange={updateField} placeholder="Pozemek, počet žáků, způsob využití nebo vaše otázky…" />
                  </div>

                  <p className="text-xs leading-relaxed text-slate-500">
                    Odesláním souhlasíte se zpracováním údajů za účelem vyřízení poptávky.
                    Podrobnosti najdete v <Link href="/ochrana-osobnich-udaju" className="font-bold text-brand">ochraně osobních údajů</Link>.
                  </p>

                  <Button type="submit" disabled={saving} className="w-full sm:w-auto">
                    {saving ? "Odesílám…" : "Odeslat nezávaznou poptávku"}
                  </Button>
                </form>
              )}
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </>
  );
}
