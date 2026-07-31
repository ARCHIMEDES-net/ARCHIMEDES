import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import RequirePlatformAdmin from "../../../../../components/RequirePlatformAdmin";
import PortalHeader from "../../../../../components/PortalHeader";
import { supabase } from "../../../../../lib/supabaseClient";
import { Card } from "../../../../../components/ui/card";
import { Alert } from "../../../../../components/ui/alert";
import { Button } from "../../../../../components/ui/button";
import { Input } from "../../../../../components/ui/input";
import { Label } from "../../../../../components/ui/label";
import { Select } from "../../../../../components/ui/select";

function dateInput(value) {
  return value ? String(value).slice(0, 10) : "";
}

export default function AdminCustomerEditPage() {
  const router = useRouter();
  const organizationId = typeof router.query.id === "string" ? router.query.id : "";
  const [organization, setOrganization] = useState(null);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!router.isReady || !organizationId) return;
    loadCustomer();
  }, [router.isReady, organizationId]);

  async function loadCustomer() {
    setLoading(true);
    setError("");
    const { data, error: loadError } = await supabase
      .from("organizations")
      .select("id, name, contact_name, contact_email, contact_phone, registered_address, license_plan, license_started_at, license_valid_until, contract_status, billing_status")
      .eq("id", organizationId)
      .maybeSingle();

    if (loadError || !data) {
      setError("Zákazníka se nepodařilo načíst.");
      setLoading(false);
      return;
    }

    setOrganization(data);
    setForm({
      contactName: data.contact_name || "",
      contactEmail: data.contact_email || "",
      contactPhone: data.contact_phone || "",
      registeredAddress: data.registered_address || "",
      licensePlan: data.license_plan || "paid_monthly",
      licenseStartedAt: dateInput(data.license_started_at),
      licenseValidUntil: dateInput(data.license_valid_until),
      contractStatus: data.contract_status || "pending",
      billingStatus: data.billing_status || "pending",
    });
    setLoading(false);
  }

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function updatePlan(value) {
    setForm((current) => ({
      ...current,
      licensePlan: value,
      licenseValidUntil: value === "paid_monthly" ? "" : current.licenseValidUntil,
      billingStatus: value === "classroom_free_12m" ? "not_applicable" : current.billingStatus === "not_applicable" ? "pending" : current.billingStatus,
    }));
  }

  async function save(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      setError("Přihlášení vypršelo. Přihlaste se znovu.");
      setSaving(false);
      return;
    }

    try {
      const response = await fetch("/api/admin/update-customer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ organizationId, ...form }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error || "Změny se nepodařilo uložit.");
      setMessage("Změny byly bezpečně uloženy.");
      await loadCustomer();
    } catch (saveError) {
      setError(saveError?.message || "Změny se nepodařilo uložit.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <RequirePlatformAdmin>
      <div className="min-h-screen bg-slate-50">
        <PortalHeader title="Admin • úprava zákazníka" />
        <main className="mx-auto max-w-[920px] px-4 py-8 sm:px-6">
          <Link href={`/portal/admin/obce/${organizationId}`} className="text-sm font-bold text-slate-600 underline underline-offset-4">
            ← Zpět na detail
          </Link>
          <h1 className="mt-2 text-3xl font-black text-navy-900">Upravit {organization?.name || "zákazníka"}</h1>
          <p className="mt-2 text-sm text-slate-600">Změny jsou dostupné pouze platformním administrátorům.</p>

          {error ? <Alert variant="error" className="mt-5">{error}</Alert> : null}
          {message ? <Alert variant="success" className="mt-5">{message}</Alert> : null}
          {loading ? <Card className="mt-5 p-6">Načítám…</Card> : null}

          {!loading && form ? (
            <form onSubmit={save}>
              <Card className="mt-5 p-6">
                <h2 className="text-xl font-black text-navy-900">Kontakt a adresa</h2>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div><Label>Kontaktní osoba</Label><Input value={form.contactName} onChange={(e) => update("contactName", e.target.value)} /></div>
                  <div><Label>E-mail</Label><Input type="email" value={form.contactEmail} onChange={(e) => update("contactEmail", e.target.value)} /></div>
                  <div><Label>Telefon</Label><Input value={form.contactPhone} onChange={(e) => update("contactPhone", e.target.value)} /></div>
                  <div><Label>Adresa</Label><Input value={form.registeredAddress} onChange={(e) => update("registeredAddress", e.target.value)} /></div>
                </div>
              </Card>

              <Card className="mt-5 p-6">
                <h2 className="text-xl font-black text-navy-900">Licence</h2>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div><Label>Varianta</Label><Select value={form.licensePlan} onChange={(e) => updatePlan(e.target.value)}><option value="paid_monthly">1 990 Kč měsíčně</option><option value="paid_annual">12 měsíců placených</option><option value="classroom_free_12m">12 měsíců zdarma – učebna</option></Select></div>
                  <div><Label>Stav smlouvy</Label><Select value={form.contractStatus} onChange={(e) => update("contractStatus", e.target.value)}><option value="pending">Čeká na potvrzení</option><option value="accepted">Potvrzeno</option></Select></div>
                  <div><Label>Platnost od</Label><Input type="date" value={form.licenseStartedAt} onChange={(e) => update("licenseStartedAt", e.target.value)} /></div>
                  <div><Label>Platnost do</Label><Input type="date" disabled={form.licensePlan === "paid_monthly"} value={form.licenseValidUntil} onChange={(e) => update("licenseValidUntil", e.target.value)} /></div>
                  <div><Label>Fakturace</Label><Select disabled={form.licensePlan === "classroom_free_12m"} value={form.billingStatus} onChange={(e) => update("billingStatus", e.target.value)}><option value="pending">Čeká na úhradu</option><option value="paid">Uhrazeno</option><option value="not_applicable">Bez úhrady</option></Select></div>
                </div>
              </Card>

              <div className="mt-5 flex gap-3">
                <Button type="submit" disabled={saving}>{saving ? "Ukládám…" : "Uložit změny"}</Button>
                <Link href={`/portal/admin/obce/${organizationId}`}><Button type="button" variant="secondary">Zrušit</Button></Link>
              </div>
            </form>
          ) : null}
        </main>
      </div>
    </RequirePlatformAdmin>
  );
}
