import Link from "next/link";
import { useEffect, useState } from "react";
import RequirePlatformAdmin from "../../../components/RequirePlatformAdmin";
import PortalHeader from "../../../components/PortalHeader";
import { supabase } from "../../../lib/supabaseClient";
import { safeNotificationTargetPath } from "../../../lib/notifications";

function Alerts() {
  const [rows,setRows] = useState([]);
  const [error,setError] = useState("");
  const [loading,setLoading] = useState(true);
  const [busy,setBusy] = useState(false);
  async function load() {
    setLoading(true); setError("");
    const { data,error } = await supabase.from("user_notifications").select("id,title,body,target_path,available_at,read_at").like("target_path","/portal/admin%").lte("available_at",new Date().toISOString()).order("available_at",{ascending:false}).limit(200);
    if(error) setError("Upozornění se nepodařilo načíst."); else { setRows(data || []); const {count} = await supabase.from("user_notifications").select("id",{count:"exact",head:true}).like("target_path","/portal/admin%").is("read_at",null).lte("available_at",new Date().toISOString()); window.dispatchEvent(new CustomEvent("archimedes:operational-count",{detail:{count:count || 0}})); }
    setLoading(false);
  }
  useEffect(()=>{load();},[]);
  async function markRead(id) {
    setBusy(true);
    const {error} = await supabase.from("user_notifications").update({read_at:new Date().toISOString()}).eq("id",id);
    if(error) setError("Stav se nepodařilo uložit."); else await load();
    setBusy(false);
  }
  return <><PortalHeader /><main className="mx-auto max-w-[900px] px-4 py-6">
    <Link href="/portal/admin" className="font-semibold text-slate-600">← Správa platformy</Link>
    <h1 className="mt-3 text-3xl font-black text-navy-900">Provozní upozornění</h1>
    <p className="my-3 text-slate-600">Provozní zprávy určené vašemu účtu. Nezapočítávají se do novinek ani do čísla na ikoně aplikace. Označení jako přečtené znovu neodesílá e-mail.</p>
    <button type="button" onClick={load} disabled={loading} className="min-h-11 rounded-xl border border-slate-300 px-4 font-bold">Obnovit</button>
    {error ? <p role="alert" className="my-3 text-red-700">{error}</p>:null}
    {loading ? <p role="status">Načítám…</p> : !rows.length && !error ? <p className="my-5">Nemáte žádná provozní upozornění.</p>:null}
    <div className="mt-5 grid gap-3">{rows.map(row=><article key={row.id} className="rounded-2xl border border-slate-200 bg-white p-5">
      <p className="text-sm text-slate-600">{row.read_at ? "Přečtené" : "Nepřečtené"} · {new Date(row.available_at).toLocaleString("cs-CZ")}</p>
      <h2 className="mt-2 text-lg font-bold">{row.title}</h2><p className="mt-2 whitespace-pre-wrap break-words text-slate-600">{row.body}</p>
      <div className="mt-3 flex flex-wrap gap-3">{safeNotificationTargetPath(row.target_path) ? <Link href={row.target_path} className="inline-flex min-h-11 items-center font-bold underline">Otevřít související přehled</Link>:null}{!row.read_at ? <button type="button" disabled={busy} onClick={()=>markRead(row.id)} className="min-h-11 rounded-xl border border-slate-300 px-3 font-semibold">Označit jako přečtené</button>:null}</div>
    </article>)}</div>
  </main></>;
}
export default function OperationalAlerts() { return <RequirePlatformAdmin><Alerts /></RequirePlatformAdmin>; }
