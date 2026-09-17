import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { PRIZE_LABEL, prizeEndDate } from "../lib/prizeLicense";

export default function PrizeLicenseForm({ organization, onClose, onSaved }) {
  const [start, setStart] = useState(new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Prague" }));
  const [reference, setReference] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const end = prizeEndDate(start);
  const hasOwnLicense = (organization.license_plan || !organization.parent_organization_id) && ["active", "suspended"].includes(organization.license_status)
    && (!organization.license_valid_until || new Date(organization.license_valid_until) >= new Date());
  async function submit(event) {
    event.preventDefault();
    if (busy || hasOwnLicense || !end) return;
    setBusy(true); setError("");
    try {
      const { error: rpcError } = await supabase.rpc("grant_organization_prize", {
        p_organization_id: organization.id, p_start: start, p_reference: reference.trim() || null,
      });
      if (rpcError) throw rpcError;
      setSuccess(`Výherní licence pro ${organization.name} byla uložena. Platí od ${start} do ${end}.`);
      await onSaved();
    } catch (e) { setError(e.message || "Licenci se nepodařilo uložit."); }
    finally { setBusy(false); }
  }
  return <section aria-label="Přidělení výherní licence" className="my-5 rounded-2xl border border-slate-300 bg-white p-5 shadow-sm">
    <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-bold">{PRIZE_LABEL}</h2><button type="button" disabled={busy} onClick={onClose} className="min-h-11 rounded-xl border px-4">Zavřít</button></div>
    <p className="mt-3 text-lg font-bold">{organization.name}</p>
    <p className="mt-2 text-slate-600">Pouze tato organizace a její uživatelé. Licence se nepřenáší na obec ani další organizace. Bez úhrady a bez automatického prodloužení.</p>
    {hasOwnLicense ? <p role="status" className="mt-3 rounded-xl bg-amber-50 p-3">Organizace už má vlastní licenci do {organization.license_valid_until ? new Date(organization.license_valid_until).toLocaleDateString("cs-CZ", { timeZone: "Europe/Prague" }) : "odvolání"}. Výhra ji nepřepíše. Přidělte ji až po skončení stávající licence.</p> : null}
    {error ? <p role="alert" className="mt-3 text-red-700">{error}</p> : null}
    {success ? <p role="status" className="mt-3 text-green-800">{success}</p> : <form onSubmit={submit}>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="font-semibold">Začátek platnosti<input required disabled={busy || Boolean(hasOwnLicense)} type="date" value={start} onChange={e => setStart(e.target.value)} className="mt-1 min-h-11 w-full rounded-xl border border-slate-300 px-3" /></label>
        <label className="font-semibold">Konec platnosti<input readOnly type="date" value={end} className="mt-1 min-h-11 w-full rounded-xl border border-slate-300 bg-slate-50 px-3" /></label>
      </div>
      <label className="mt-4 block font-semibold">Soutěž nebo poznámka (nepovinné)<input maxLength={500} disabled={busy} value={reference} onChange={e => setReference(e.target.value)} placeholder="Např. výhra na konferenci…" className="mt-1 min-h-11 w-full rounded-xl border border-slate-300 px-3" /></label>
      <button disabled={busy || Boolean(hasOwnLicense) || !end} type="submit" className="mt-4 min-h-11 rounded-xl bg-navy-900 px-5 py-2 font-bold text-white disabled:opacity-50">{busy ? "Ukládám…" : "Přidělit této organizaci na 12 měsíců"}</button>
    </form>}
  </section>;
}
