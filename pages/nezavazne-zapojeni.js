import Head from "next/head";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Footer from "../components/Footer";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { PLATFORM_INQUIRY_KIND } from "../lib/platformInquiry";
import { trackConversion } from "../lib/conversionAnalytics";

const EMPTY = { name: "", email: "", place: "", phone: "", message: "", company: "" };

export default function PlatformInquiryPage() {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const started = useRef(false);
  const lock = useRef(false);
  const feedback = useRef(null);
  useEffect(() => { trackConversion("platform_inquiry_view"); }, []);
  useEffect(() => { if (submitted || error) feedback.current?.focus(); }, [submitted, error]);
  function change(event) {
    const { name, value } = event.target;
    setForm(current => ({ ...current, [name]: value }));
    if (!started.current && name !== "company") {
      started.current = true;
      trackConversion("platform_inquiry_start");
    }
  }
  async function submit(event) {
    event.preventDefault();
    if (lock.current) return;
    lock.current = true;
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/poptavka", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, inquiryKind: PLATFORM_INQUIRY_KIND }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.ok) throw new Error(result.error || "Poptávku se nepodařilo odeslat. Zkuste to prosím znovu.");
      setSubmitted(true);
      setForm(EMPTY);
      trackConversion("platform_inquiry_success");
    } catch (err) {
      setError(err.message || "Poptávku se nepodařilo odeslat.");
      trackConversion("platform_inquiry_error");
    } finally { lock.current = false; setSaving(false); }
  }
  return <>
    <Head><title>Nezávazně probrat zapojení | ARCHIMEDES Live</title><meta name="description" content="Proberte s námi možnosti pravidelného programu pro obec, školu nebo spolek. Nezávazná poptávka bez objednávky a bez závazku k platbě." /></Head>
    <main className="bg-slate-50 px-4 py-10 sm:py-16">
      <div className="mx-auto max-w-[720px] rounded-3xl border border-slate-200 bg-white p-5 sm:p-9">
        <p className="text-xs font-black uppercase tracking-widest text-brand">ARCHIMEDES Live · Nezávazná poptávka</p>
        {submitted ? <div ref={feedback} tabIndex={-1} role="status" className="mt-5">
          <h1 className="text-3xl font-black text-navy-900">Děkujeme, poptávku jsme uložili.</h1>
          <p className="mt-4 leading-relaxed text-slate-700">Ozveme se vám na uvedený kontakt a probereme možnosti zapojení. Nevznikla objednávka ani závazek k platbě.</p>
          <Button href="/program" className="mt-6">Prohlédnout program</Button>
        </div> : <>
          <h1 className="mt-4 text-3xl font-black leading-tight text-navy-900 sm:text-4xl">Proberme, jak může ARCHIMEDES Live fungovat u vás.</h1>
          <p className="mt-4 leading-relaxed text-slate-700">Ozveme se vám a společně projdeme možnosti zapojení školy, spolků nebo seniorů. Odesláním nevzniká objednávka ani závazek k platbě.</p>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">Venkovní učebnu nepotřebujete. Pravidelný program stojí 1 990 Kč bez DPH měsíčně při objednávce na 12 měsíců. Tady si jej zatím neobjednáváte.</p>
          {error && <p ref={feedback} tabIndex={-1} role="alert" className="mt-5 rounded-xl bg-red-50 p-4 text-red-800">{error}</p>}
          <form onSubmit={submit} className="mt-7 grid gap-5" aria-busy={saving}>
            <div hidden aria-hidden="true"><input name="company" value={form.company} onChange={change} tabIndex={-1} autoComplete="off" /></div>
            <div><Label htmlFor="inquiry-name">Jméno a příjmení *</Label><Input id="inquiry-name" name="name" autoComplete="name" required minLength={2} maxLength={120} value={form.name} onChange={change} /></div>
            <div><Label htmlFor="inquiry-email">E-mail *</Label><Input id="inquiry-email" name="email" type="email" autoComplete="email" required maxLength={254} value={form.email} onChange={change} /></div>
            <div><Label htmlFor="inquiry-place">Název obce nebo organizace *</Label><Input id="inquiry-place" name="place" autoComplete="organization" required maxLength={180} value={form.place} onChange={change} /></div>
            <div><Label htmlFor="inquiry-phone">Telefon (nepovinné)</Label><Input id="inquiry-phone" name="phone" type="tel" autoComplete="tel" maxLength={40} value={form.phone} onChange={change} /></div>
            <div><Label htmlFor="inquiry-message">Co byste chtěli probrat? (nepovinné)</Label><Textarea id="inquiry-message" name="message" rows={4} maxLength={4000} value={form.message} onChange={change} /></div>
            <p className="text-sm leading-relaxed text-slate-600">Údaje použijeme ke zpracování poptávky a navazující komunikaci. <Link href="/ochrana-osobnich-udaju" className="font-bold underline">Informace o zpracování osobních údajů</Link>.</p>
            <Button type="submit" disabled={saving} className="h-auto min-h-12 whitespace-normal py-3 text-center">{saving ? "Odesílám…" : "Odeslat nezávaznou poptávku"}</Button>
          </form>
          <p className="mt-6 text-sm leading-relaxed text-slate-600">Už jste rozhodnutí? <Link href="/zadost" className="font-bold text-brand underline">Objednat program</Link>.</p>
        </>}
      </div>
    </main><Footer />
  </>;
}
