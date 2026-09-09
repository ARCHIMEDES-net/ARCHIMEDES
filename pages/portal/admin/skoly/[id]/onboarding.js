import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import RequirePlatformAdmin from "../../../../../components/RequirePlatformAdmin";
import PortalHeader from "../../../../../components/PortalHeader";
import { supabase } from "../../../../../lib/supabaseClient";
import { Alert } from "../../../../../components/ui/alert";
import { Button } from "../../../../../components/ui/button";
import { Card } from "../../../../../components/ui/card";
import { Input } from "../../../../../components/ui/input";
import { Label } from "../../../../../components/ui/label";
import { Select } from "../../../../../components/ui/select";

const STATES = { preparing: "Připravuje se", sending: "Odesílání probíhá – neopakovat", sent: "Předáno e-mailovému providerovi",
  sent_copy_failed: "Odesláno, kopie vyžaduje kontrolu", delivery_unknown: "Doručení není ověřené – neopakovat",
  failed: "Neodesláno", rolled_back: "Změny vráceny", cleanup_required: "Vyžaduje kontrolu" };
const blank = () => ({ fullName: "", email: "", role: "organization_admin", idempotencyKey: globalThis.crypto?.randomUUID?.() || "" });

export default function SchoolOnboarding() {
  const router = useRouter();
  const id = typeof router.query.id === "string" ? router.query.id : "";
  const [data, setData] = useState(null);
  const [form, setForm] = useState(blank);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  const request = useCallback(async (method, body) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) throw new Error("Přihlášení vypršelo. Přihlaste se znovu.");
    const response = await fetch(`/api/admin/invite-school-member?organizationId=${encodeURIComponent(id)}`, {
      method, headers: { Authorization: `Bearer ${session.access_token}`, ...(body ? { "Content-Type": "application/json" } : {}) },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Operace se nezdařila.");
    return result;
  }, [id]);
  const load = useCallback(async () => {
    setLoading(true);
    try { setData(await request("GET")); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [request]);
  useEffect(() => { if (router.isReady && id) load(); }, [router.isReady, id, load]);
  function change(field, value) { setForm((current) => ({ ...current, [field]: value, idempotencyKey: globalThis.crypto?.randomUUID?.() || "" })); }
  async function submit(event) {
    event.preventDefault();
    if (sending) return;
    setSending(true); setError(""); setMessage("");
    try {
      const result = await request("POST", { organizationId: id, ...form });
      setMessage(result.message);
      setForm({ ...blank(), role: "member" });
    } catch (e) { setError(e.message); }
    finally { await load(); setSending(false); }
  }
  const hasAdmin = data?.members.some((member) => member.role === "organization_admin" && member.status === "active" && member.profile?.is_active);

  return <RequirePlatformAdmin><div className="min-h-screen bg-slate-50">
    <PortalHeader title="Admin • onboarding školy" />
    <main className="mx-auto max-w-[1000px] px-4 py-8 sm:px-6">
      <Link className="underline" href={data ? `/portal/admin/obce/${data.school.parent_organization_id}` : "/portal/admin/obce"}>← Zpět na obec</Link>
      <h1 className="mt-3 text-3xl font-black text-navy-900">{data?.school.name || "Onboarding školy"}</h1>
      {data ? <p className="mt-2 text-slate-600">Registrační číslo: {data.school.registration_number || "—"} · {data.school.registered_address}</p> : null}
      {error ? <Alert variant="error" className="mt-5">{error}</Alert> : null}
      {message ? <Alert variant="success" className="mt-5">{message}</Alert> : null}
      {loading && !data ? <Card className="mt-5 p-6">Načítám školu…</Card> : null}
      {data ? <>
        <Card className="mt-5 p-6">
          <h2 className="text-xl font-bold">1. Organizace je založena</h2>
          <p className="mt-2">Škola je připojena k obci. Pro uživatelský onboarding potřebujete jméno a pracovní e-mail každého uživatele.</p>
          <p className="mt-2 font-semibold">{hasAdmin ? "Škola má přímého administrátora. Pokračujte přidáním učitelů." : "Školní administrátor zatím není připojen."}</p>
        </Card>
        <form onSubmit={submit}>
          <Card className="mt-5 p-6">
            <h2 className="text-xl font-bold">2. Připojit správce školy nebo učitele</h2>
            <p className="mt-2 text-sm text-slate-600">Existující účet a heslo se zachovají. Novému uživateli přijde odkaz pro nastavení hesla. Pozvánka se odešle až po stisknutí tlačítka.</p>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div><Label htmlFor="school-role">Role ve škole</Label><Select id="school-role" disabled={sending} value={form.role} onChange={(e) => change("role", e.target.value)}><option value="organization_admin">Školní administrátor</option><option value="member">Učitel</option></Select></div>
              <div><Label htmlFor="school-member-name">Jméno a příjmení</Label><Input id="school-member-name" required minLength={2} maxLength={120} disabled={sending} value={form.fullName} onChange={(e) => change("fullName", e.target.value)} /></div>
              <div><Label htmlFor="school-member-email">Pracovní e-mail</Label><Input id="school-member-email" type="email" required maxLength={254} disabled={sending} value={form.email} onChange={(e) => change("email", e.target.value)} /></div>
            </div>
            <Button type="submit" className="mt-5" disabled={sending || !form.idempotencyKey}>{sending ? "Připravuji přístup…" : "Připojit uživatele a odeslat pozvánku"}</Button>
          </Card>
        </form>
        <Card className="mt-5 p-6"><h2 className="text-xl font-bold">3. Kontrola uživatelů a pozvánek</h2>
          <Button type="button" variant="secondary" className="my-4" disabled={loading || sending} onClick={load}>Obnovit stav</Button>
          {data.members.length ? <ul className="space-y-3">{data.members.map((member, index) => <li key={member.profile?.id || index} className="rounded border border-slate-200 p-3">
            <strong>{member.profile?.full_name || "Profil chybí"}</strong> · {member.profile?.email} · {member.role === "organization_admin" ? "Správce školy" : "Učitel"}
            <p className="text-sm text-slate-600">{member.status !== "active" || !member.profile?.is_active ? "Neaktivní přístup" : member.profile?.must_set_password ? "Čeká na nastavení hesla" : "Aktivní přístup – úplnost profilu zkontrolujte samostatně"}</p>
          </li>)}</ul> : <p>Žádní uživatelé zatím nejsou připojeni.</p>}
          <h3 className="mt-6 font-bold">Poslední pokusy o pozvánky</h3>
          <ul className="mt-3 space-y-2">{data.attempts.map((attempt, index) => <li key={index}>{attempt.recipient_email} · {STATES[attempt.status] || attempt.status}</li>)}</ul>
        </Card>
      </> : null}
    </main>
  </div></RequirePlatformAdmin>;
}
