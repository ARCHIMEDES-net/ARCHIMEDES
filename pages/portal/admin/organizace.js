import PrizeLicenseForm from "../../../components/PrizeLicenseForm";
import { PRIZE_LABEL, PRIZE_PLAN } from "../../../lib/prizeLicense";
import Link from "next/link";
import { useEffect, useState } from "react";
import RequirePlatformAdmin from "../../../components/RequirePlatformAdmin";
import PortalHeader from "../../../components/PortalHeader";
import { supabase } from "../../../lib/supabaseClient";
import { filterOrganizations, organizationAdminHref } from "../../../lib/portalNavigation";

const types = { senior_club: "Senior klub", community_center: "Komunitní centrum", partner: "Partner", diaspora: "Krajanská organizace", municipality: "Obec", obec: "Obec", school: "Škola", association: "Spolek", spolek: "Spolek", child_home: "Dětský domov", foundation: "Nadace / nadační fond" };
const states = { active: "Aktivní", inactive: "Neaktivní", pending_approval: "Čeká na schválení", suspended: "Pozastaveno", pending: "Čeká" };

function Directory() {
  const [selected, setSelected] = useState(null);
  const [rows, setRows] = useState([]);
  const [query, setQuery] = useState("");
  const [type, setType] = useState("");
  const [system, setSystem] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  async function load() {
    setLoading(true); setError("");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Přihlášení vypršelo.");
      const response = await fetch("/api/admin/organization-directory", { headers: { Authorization: `Bearer ${session.access_token}` } });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setRows(data.organizations.sort((a,b) => a.name.localeCompare(b.name,"cs")));
    } catch (e) { setError(e.message); } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);
  const visible = filterOrganizations(rows, query, type, system);
  return <><PortalHeader /><main className="mx-auto max-w-[1100px] px-4 py-6">
    <Link href="/portal/admin" className="font-semibold text-slate-600">← Správa platformy</Link>
    <h1 className="mt-3 text-3xl font-black text-navy-900">Všechny organizace</h1>
    <p className="mt-2 text-slate-600">Vyhledejte organizaci a otevřete její správu. Váš osobní účet a přihlášení na vysílání zůstávají vaše.</p>
    {selected ? <PrizeLicenseForm key={selected.id} organization={selected} onClose={() => setSelected(null)} onSaved={load} /> : null}
    <div className="my-5 grid gap-3 sm:grid-cols-[1fr_220px_auto]">
      <label className="font-semibold">Hledat školu, obec nebo organizaci<input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Název organizace nebo obce…" className="mt-1 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base" /></label>
      <label className="font-semibold">Typ organizace<select value={type} onChange={e=>setType(e.target.value)} className="mt-1 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base"><option value="">Všechny typy</option>{Object.entries(types).filter(([key])=>!["obec","spolek"].includes(key)).map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></label>
      <button type="button" onClick={load} disabled={loading} className="min-h-11 self-end rounded-xl border border-slate-300 bg-white px-4 py-2 font-bold">Obnovit</button>
    </div>
    <label className="flex min-h-11 items-center gap-2"><input type="checkbox" checked={system} onChange={e=>setSystem(e.target.checked)} /> Zobrazit také systémové organizace</label>
    {error ? <p role="alert" className="my-3 text-red-700">{error}</p> : null}
    <p aria-live="polite" className="my-3 text-sm text-slate-600">{loading ? "Načítám organizace…" : `Zobrazeno ${visible.length} z ${rows.length} organizací`}</p>
    {!loading && !error && !visible.length ? <p>Žádná organizace neodpovídá hledání. Zkuste upravit název nebo filtr.</p> : null}
    <div className="grid gap-3">{visible.map(org=><article key={org.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4">
      <div className="min-w-0 flex-1"><h2 className="break-words text-lg font-bold text-navy-900">{org.name}</h2><p className="mt-1 text-sm text-slate-600">{types[org.org_type] || org.org_type} · {states[org.status] || org.status}{org.is_system ? " · Systémová" : ""}</p>{org.parent_name ? <p className="mt-1 text-sm text-slate-600">Pod organizací: {org.parent_name}</p> : null}</div>
      {org.license_plan === PRIZE_PLAN ? <p className="text-sm text-slate-600">{PRIZE_LABEL} · do {new Date(org.license_valid_until).toLocaleDateString("cs-CZ", { timeZone: "Europe/Prague" })}</p> : null}
      {!org.is_system ? <button type="button" onClick={() => { setSelected(org); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="min-h-11 rounded-xl border border-slate-300 px-4 py-2 font-bold">Výherní licence</button> : null}
      <Link href={organizationAdminHref(org)} className="inline-flex min-h-11 items-center rounded-xl bg-navy-900 px-4 py-2 font-bold text-white">Otevřít správu</Link>
    </article>)}</div>
  </main></>;
}
export default function OrganizationDirectory() { return <RequirePlatformAdmin><Directory /></RequirePlatformAdmin>; }
