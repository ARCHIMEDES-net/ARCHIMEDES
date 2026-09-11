import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import RequireAuth from "../../../../components/RequireAuth";
import PortalHeader from "../../../../components/PortalHeader";
import { supabase } from "../../../../lib/supabaseClient";

export default function EventAttendance() {
  const { query: { id } } = useRouter();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState(false);
  const [search, setSearch] = useState("");
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    if (typeof id !== "string") return;
    let cancelled = false;
    setData(null);
    setError("");
    async function load() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error("Pro zobrazení seznamu se přihlaste.");
        const response = await fetch(`/api/admin/event-attendees?eventId=${encodeURIComponent(id)}`, {
          headers: { Authorization: `Bearer ${session.access_token}` }, cache: "no-store",
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Seznam se nepodařilo načíst.");
        if (!cancelled) setData(result);
      } catch (e) { if (!cancelled) setError(e.message); }
    }
    load();
    return () => { cancelled = true; };
  }, [id, revision]);

  async function exportExcel() {
    setExporting(true);
    setError("");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Pro export se přihlaste.");
      const response = await fetch(`/api/admin/event-attendees?eventId=${encodeURIComponent(id)}&format=excel`, {
        headers: { Authorization: `Bearer ${session.access_token}` }, cache: "no-store",
      });
      if (!response.ok) throw new Error((await response.json()).error || "Export se nepodařil.");
      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement("a");
      link.href = url;
      link.download = `archimedes-prihlaseni-${id}.xml`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) { setError(e.message); }
    finally { setExporting(false); }
  }
  const rows = (data?.attendees || []).filter((r) =>
    [r.organization, r.name, r.email].join(" ").toLocaleLowerCase("cs").includes(search.toLocaleLowerCase("cs")));
  return <RequireAuth><PortalHeader />
    <main className="max-w-6xl mx-auto px-4 py-6">
      <Link href="/portal/kalendar" className="text-slate-600 hover:underline">← Zpět na Program</Link>
      <h1 className="text-2xl font-bold mt-4">Přihlášené organizace</h1>
      {data && <h2 className="text-lg mt-2 font-semibold">{data.event.title}</h2>}
      <p className="text-slate-600 mt-2">Potvrzení plánované účasti za školu, obec nebo jinou organizaci. Nejde o evidenci skutečného sledování vysílání.</p>
      <div className="flex flex-wrap gap-3 items-center my-5">
        {data && <><strong>Celkem: {data.attendees.length}</strong>
          <button className="rounded-xl bg-slate-900 text-white px-4 py-3 disabled:opacity-50" disabled={exporting} onClick={exportExcel}>{exporting ? "Připravuji…" : "Export všech do Excelu"}</button></>}
        <button className="rounded-xl border px-4 py-3" onClick={() => setRevision((r) => r + 1)}>Obnovit seznam</button>
      </div>
      {error && <p role="alert" className="rounded-xl bg-red-50 text-red-800 p-4">{error}</p>}
      {!data && !error && <p role="status">Načítám přihlášky…</p>}
      {data && <>
        <label className="block font-semibold mb-2" htmlFor="attendance-search">Hledat organizaci, jméno nebo e-mail</label>
        <input id="attendance-search" className="w-full sm:max-w-lg rounded-xl border px-4 py-3 mb-4" value={search} onChange={(e) => setSearch(e.target.value)} />
        <div className="overflow-x-auto rounded-2xl border bg-white">
          <table className="w-full text-left"><caption className="sr-only">Seznam potvrzených účastí</caption>
            <thead className="bg-slate-50"><tr>{["Škola / organizace", "Účast potvrdil(a)", "E-mail", "Datum přihlášení"].map((v) => <th scope="col" className="p-4" key={v}>{v}</th>)}</tr></thead>
            <tbody>{rows.map((r) => <tr className="border-t" key={r.id}>
              <td className="p-4 font-semibold">{r.organization}</td><td className="p-4">{r.name}</td>
              <td className="p-4 break-all">{r.email || "E-mail není dostupný"}</td>
              <td className="p-4 whitespace-nowrap">{new Date(r.created_at).toLocaleString("cs-CZ", { timeZone: "Europe/Prague" })}</td>
            </tr>)}</tbody>
          </table>
          {!rows.length && <p className="p-5 text-slate-600">{data.attendees.length ? "Hledání neodpovídá žádná přihláška." : "Zatím se nepřihlásila žádná organizace."}</p>}
        </div>
      </>}
    </main>
  </RequireAuth>;
}
