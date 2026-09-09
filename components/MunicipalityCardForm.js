import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Alert } from "./ui/alert";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

const EMPTY = { name: "", legalIdentifier: "", address: "", contactName: "", contactEmail: "", contactPhone: "", classroomVerified: false, eligibilityReference: "", activateLicense: false };
const FIELDS = [
  ["name", "Název obce", 160, "text"],
  ["legalIdentifier", "IČO (volitelné)", 8, "text"],
  ["address", "Adresa (volitelné)", 300, "text"],
  ["contactName", "Kontaktní osoba (volitelné)", 120, "text"],
  ["contactEmail", "Kontaktní e-mail (volitelné)", 254, "email"],
  ["contactPhone", "Telefon (volitelné)", 32, "tel"],
];

export default function MunicipalityCardForm({ organizationId = null }) {
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [existingId, setExistingId] = useState(null);
  const [saved, setSaved] = useState(null);
  const [municipalities, setMunicipalities] = useState([]);
  const [canActivate, setCanActivate] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true); setReady(false); setError("");
      try {
        const { data, error: loadError } = await supabase.from("organizations")
          .select("id,name,ico,legal_identifier,registered_address,contact_name,contact_email,contact_phone,registration_number,license_started_at,activated_at,license_status")
          .in("org_type", ["municipality", "obec"]).is("parent_organization_id", null).order("name");
        if (loadError) throw loadError;
        if (cancelled) return;
        setMunicipalities(data || []);
        if (organizationId) {
          const org = data?.find((item) => item.id === organizationId);
          if (!org) throw new Error("Obec nebyla nalezena.");
          setCanActivate(!org.license_started_at && !org.activated_at && org.license_status !== "active");
          setForm({ ...EMPTY, name: org.name, legalIdentifier: org.legal_identifier || org.ico || "",
            address: org.registered_address || "", contactName: org.contact_name || "",
            contactEmail: org.contact_email || "", contactPhone: org.contact_phone || "" });
        }
        setReady(true);
      } catch (_) {
        if (!cancelled) setError("Přehled obcí se nepodařilo načíst. Obnovte stránku.");
      } finally { if (!cancelled) setLoading(false); }
    }
    load();
    return () => { cancelled = true; };
  }, [organizationId]);

  const normalize = (value) => String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();
  const needle = normalize(form.name);
  const matches = municipalities.filter((org) => org.id !== organizationId && (
    (needle.length >= 2 && normalize(org.name).includes(needle)) ||
    (form.legalIdentifier.length === 8 && [org.legal_identifier, org.ico].includes(form.legalIdentifier))
  )).slice(0, 8);

  async function submit(event) {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true); setError(""); setExistingId(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("Přihlášení vypršelo. Přihlaste se znovu.");
      const response = await fetch("/api/admin/municipality-card", {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ ...form, organizationId }),
      });
      const result = await response.json();
      if (!response.ok) {
        setExistingId(result.existingId || null);
        throw new Error(result.error || "Uložení se nezdařilo.");
      }
      setSaved(result.municipality);
    } catch (e) { setError(e.message || "Uložení se nezdařilo."); }
    finally { setSubmitting(false); }
  }

  return <>
    {error ? <Alert variant="error" className="mt-5">{error}{existingId ? <Link className="ml-2 underline" href={`/portal/admin/obce/${existingId}`}>Otevřít existující obec</Link> : null}</Alert> : null}
    {loading ? <Card className="mt-5 p-6">Načítám údaje obcí…</Card> : null}
    {saved ? <Card className="mt-5 p-6">
      <Alert variant="success">{organizationId ? form.activateLicense ? "Údaje byly uloženy a první roční licence byla aktivována." : "Údaje obce byly uloženy. Platnost licence zůstává beze změny." : "Obec byla založena s roční bezplatnou licencí. Nyní můžete přidat školu."}</Alert>
      <p className="my-4 font-bold">Registrační číslo obce: {saved.registration_number}</p>
      <div className="flex flex-wrap gap-3">
        <Link href={`/portal/admin/obce/${saved.id}/nova-organizace`}><Button type="button">Přidat školu</Button></Link>
        <Link href={`/portal/admin/obce/${saved.id}`}><Button type="button" variant="secondary">Otevřít kartu obce</Button></Link>
      </div>
    </Card> : null}
    {!loading && ready && !saved ? <form onSubmit={submit}>
      <Card className="mt-5 p-6">
        <p className="mb-5 text-slate-600">Stačí název obce. Vyplňte další údaje, které již znáte; ostatní doplníte později.</p>
        <div className="grid gap-4 md:grid-cols-2">{FIELDS.map(([key, label, maxLength, type]) => <div key={key}>
          <Label htmlFor={`municipality-${key}`}>{label}</Label>
          <Input id={`municipality-${key}`} type={type} required={key === "name"} minLength={key === "name" ? 2 : undefined}
            maxLength={maxLength} pattern={key === "legalIdentifier" ? "[0-9]{8}" : undefined}
            inputMode={key === "legalIdentifier" ? "numeric" : undefined} value={form[key]}
            onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))} />
        </div>)}</div>
        {matches.length ? <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="font-bold">Podobné obce už evidujeme – nejprve zkontrolujte jejich kartu:</p>
          <ul className="mt-2 space-y-2">{matches.map((org) => <li key={org.id}><Link className="underline" href={`/portal/admin/obce/${org.id}`}>
            {org.name} · IČO {org.legal_identifier || org.ico || "neuvedeno"} · reg. č. {org.registration_number}
          </Link></li>)}</ul>
        </div> : null}
        {organizationId && canActivate ? <Label className="mt-5 flex items-start gap-3"><input type="checkbox" checked={form.activateLicense} onChange={(event) => setForm((current) => ({ ...current, activateLicense: event.target.checked }))} className="mt-1" />Aktivovat první roční bezplatnou licenci této obce</Label> : null}
        {(!organizationId || form.activateLicense) ? <div className="mt-6 rounded-xl bg-slate-50 p-4">
          <Label className="flex items-start gap-3"><input type="checkbox" required checked={form.classroomVerified}
            onChange={(event) => setForm((current) => ({ ...current, classroomVerified: event.target.checked }))} className="mt-1" />
            Potvrzuji, že obec má učebnu ARCHIMEDES a nárok na 12 měsíců zdarma.</Label>
          <Label htmlFor="eligibility-reference" className="mt-4">Podklad ověření realizace</Label>
          <Input id="eligibility-reference" required minLength={5} maxLength={500} placeholder="Např. předávací protokol, záznam realizace v CRM nebo odkaz na dokument" value={form.eligibilityReference} onChange={(event) => setForm((current) => ({ ...current, eligibilityReference: event.target.value }))} />
          <p className="mt-3 text-sm text-slate-600">Aktivace proběhne v interním programu bezplatného přístupu pro obce s učebnou; přijetí smlouvy se tím nepotvrzuje.</p>
          <p className="mt-2 text-sm text-slate-600">Licence začne dnem založení obce a potrvá jeden rok. Založení karty samo neodesílá pozvánky. Chybějící kontakty nebrání přidání školy.</p>
        </div> : null}
      </Card>
      <Button className="mt-5" type="submit" disabled={submitting}>{submitting ? "Ukládám…" : organizationId ? "Uložit údaje obce" : "Založit obec a pokračovat ke škole"}</Button>
    </form> : null}
  </>;
}
