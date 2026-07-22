import { useEffect, useState } from "react";
import RequirePlatformAdmin from "../../../components/RequirePlatformAdmin";
import PortalHeader from "../../../components/PortalHeader";
import { supabase } from "../../../lib/supabaseClient";
import { cn } from "../../../lib/utils";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Alert } from "../../../components/ui/alert";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Select } from "../../../components/ui/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../../../components/ui/table";

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("cs-CZ");
}

function inputDate(value = new Date()) {
  const date = new Date(value);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function oneYearAfter(value) {
  const date = new Date(`${value}T12:00:00`);
  date.setFullYear(date.getFullYear() + 1);
  date.setDate(date.getDate() - 1);
  return inputDate(date);
}

const ORGANIZATION_LABELS = {
  municipality: "Obec",
  obec: "Obec",
  school: "Škola",
  association: "Spolek",
  spolek: "Spolek",
};

const LICENSE_LABELS = {
  paid_monthly: "Měsíční",
  paid_annual: "Roční",
  classroom_free_12m: "12 měsíců zdarma – učebna",
};

function createDraft() {
  return {
    licensePlan: "paid_monthly",
    licenseStartedAt: inputDate(),
    licenseValidUntil: "",
    contractAccepted: false,
    billingStatus: "pending",
  };
}

export default function AdminObcePage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activatingId, setActivatingId] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [draft, setDraft] = useState(createDraft);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadRows();
  }, []);

  async function loadRows() {
    setLoading(true);
    setError("");
    setMessage("");

    const { data, error: loadError } = await supabase
      .from("organizations")
      .select(
        "id, name, org_type, parent_organization_id, registration_number, license_status, requested_license_plan, license_plan, license_started_at, license_valid_until, contract_status, billing_status, status, contact_name, contact_email, contact_phone, created_at"
      )
      .in("org_type", [
        "municipality",
        "obec",
        "school",
        "association",
        "spolek",
      ])
      .is("parent_organization_id", null)
      .order("created_at", { ascending: false });

    if (loadError) {
      setError("Zákazníky se nepodařilo načíst.");
      setLoading(false);
      return;
    }

    setRows(data || []);
    setLoading(false);
  }

  function openActivation(row) {
    setSelectedCustomer(row);
    setError("");
    setMessage("");
    const nextDraft = createDraft();
    if (LICENSE_LABELS[row.requested_license_plan]) {
      nextDraft.licensePlan = row.requested_license_plan;
      if (["paid_annual", "classroom_free_12m"].includes(row.requested_license_plan)) {
        nextDraft.licenseValidUntil = oneYearAfter(nextDraft.licenseStartedAt);
      }
      if (row.requested_license_plan === "classroom_free_12m") {
        nextDraft.billingStatus = "not_applicable";
      }
    }
    setDraft(nextDraft);
  }

  function updatePlan(licensePlan) {
    setDraft((current) => {
      const needsEnd = ["paid_annual", "classroom_free_12m"].includes(licensePlan);
      return {
        ...current,
        licensePlan,
        licenseValidUntil: needsEnd
          ? current.licenseValidUntil || oneYearAfter(current.licenseStartedAt)
          : "",
        billingStatus:
          licensePlan === "classroom_free_12m"
            ? "not_applicable"
            : current.billingStatus === "not_applicable"
              ? "pending"
              : current.billingStatus,
      };
    });
  }

  function updateStart(licenseStartedAt) {
    setDraft((current) => ({
      ...current,
      licenseStartedAt,
      licenseValidUntil: ["paid_annual", "classroom_free_12m"].includes(
        current.licensePlan
      )
        ? oneYearAfter(licenseStartedAt)
        : current.licenseValidUntil,
    }));
  }

  async function activateCustomer() {
    const row = selectedCustomer;
    if (!row) return;

    if (!draft.contractAccepted) {
      setError("Před aktivací potvrďte, že je smlouva uzavřena.");
      return;
    }

    if (
      ["paid_annual", "classroom_free_12m"].includes(draft.licensePlan) &&
      !draft.licenseValidUntil
    ) {
      setError("U roční nebo bezplatné licence vyplňte datum konce.");
      return;
    }

    const typeLabel = ORGANIZATION_LABELS[row.org_type] || "Organizace";
    const confirmed = window.confirm(
      `Aktivovat: ${typeLabel.toLowerCase()} „${row.name}“ s variantou ${LICENSE_LABELS[draft.licensePlan]}?`
    );
    if (!confirmed) return;

    setActivatingId(row.id);
    setError("");
    setMessage("");

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      setError("Přihlášení vypršelo. Přihlaste se znovu.");
      setActivatingId("");
      return;
    }

    try {
      const response = await fetch("/api/admin/activate-municipality", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          organizationId: row.id,
          licensePlan: draft.licensePlan,
          licenseStartedAt: draft.licenseStartedAt,
          licenseValidUntil: draft.licenseValidUntil || null,
          contractStatus: "accepted",
          billingStatus: draft.billingStatus,
        }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error || "Aktivaci se nepodařilo uložit.");
      }

      setRows((previous) =>
        previous.map((item) =>
          item.id === row.id
            ? {
                ...item,
                license_status: "active",
                status: "active",
                license_plan: draft.licensePlan,
                license_started_at: draft.licenseStartedAt,
                license_valid_until: draft.licenseValidUntil || null,
                contract_status: "accepted",
                billing_status: draft.billingStatus,
              }
            : item
        )
      );

      setMessage(
        `${typeLabel} „${row.name}“ byla aktivována. ${result.invitationSent ? "Kontaktní osobě byla odeslána pozvánka k účtu." : "Stávající účet kontaktní osoby byl zachován."} ${result.onboardingEmailSent ? "Onboardingový e-mail byl odeslán." : "Onboardingový e-mail se nepodařilo odeslat; aktivace je přesto platná."}`
      );
      setSelectedCustomer(null);
    } catch (activationError) {
      setError(
        activationError?.message || "Aktivaci se nepodařilo dokončit."
      );
    } finally {
      setActivatingId("");
    }
  }

  return (
    <RequirePlatformAdmin>
      <div className="min-h-screen bg-slate-50">
        <PortalHeader title="Admin • zákazníci" />

        <main className="mx-auto max-w-[1320px] px-6 py-10">
          <h1 className="text-2xl font-black text-navy-900">Zákazníci</h1>
          <p className="mt-2.5 max-w-[940px] text-muted">
            Nový subjekt získá přístup až po kontrole smlouvy, varianty
            licence, platnosti a fakturace.
          </p>

          {error ? <Alert variant="error" className="mt-4">{error}</Alert> : null}
          {message ? <Alert variant="success" className="mt-4">{message}</Alert> : null}

          {selectedCustomer ? (
            <Card className="mt-5 p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-bold uppercase tracking-wide text-slate-500">
                    Aktivace zákazníka
                  </div>
                  <h2 className="mt-1 text-2xl font-black text-navy-900">
                    {selectedCustomer.name}
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    {selectedCustomer.contact_name} • {selectedCustomer.contact_email}
                  </p>
                </div>
                <Button type="button" variant="secondary" onClick={() => setSelectedCustomer(null)}>
                  Zavřít
                </Button>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div>
                  <Label>Varianta licence</Label>
                  <Select value={draft.licensePlan} onChange={(event) => updatePlan(event.target.value)}>
                    <option value="paid_monthly">1 990 Kč měsíčně</option>
                    <option value="paid_annual">12 měsíců placených najednou</option>
                    {["municipality", "obec"].includes(selectedCustomer.org_type) ? (
                      <option value="classroom_free_12m">12 měsíců zdarma – obec s učebnou</option>
                    ) : null}
                  </Select>
                </div>
                <div>
                  <Label>Platnost od</Label>
                  <Input type="date" value={draft.licenseStartedAt} onChange={(event) => updateStart(event.target.value)} />
                </div>
                <div>
                  <Label>Platnost do</Label>
                  <Input
                    type="date"
                    value={draft.licenseValidUntil}
                    disabled={draft.licensePlan === "paid_monthly"}
                    onChange={(event) => setDraft((current) => ({ ...current, licenseValidUntil: event.target.value }))}
                  />
                </div>
                <div>
                  <Label>Fakturace</Label>
                  <Select
                    value={draft.billingStatus}
                    disabled={draft.licensePlan === "classroom_free_12m"}
                    onChange={(event) => setDraft((current) => ({ ...current, billingStatus: event.target.value }))}
                  >
                    <option value="pending">Čeká na úhradu</option>
                    <option value="paid">Uhrazeno</option>
                    <option value="not_applicable">Bez úhrady</option>
                  </Select>
                </div>
              </div>

              <label className="mt-5 flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <input
                  type="checkbox"
                  checked={draft.contractAccepted}
                  onChange={(event) => setDraft((current) => ({ ...current, contractAccepted: event.target.checked }))}
                  className="mt-1 h-4 w-4"
                />
                <span className="text-sm leading-relaxed text-slate-700">
                  Potvrzuji, že byla ověřena totožnost zákazníka, oprávnění
                  kontaktní osoby a uzavření příslušné smlouvy.
                </span>
              </label>

              <div className="mt-5">
                <Button
                  type="button"
                  disabled={activatingId === selectedCustomer.id}
                  onClick={activateCustomer}
                >
                  {activatingId === selectedCustomer.id ? "Aktivuji…" : "Aktivovat zákazníka"}
                </Button>
              </div>
            </Card>
          ) : null}

          <Card className="mt-5 overflow-hidden p-0">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-900/[0.08] p-3.5">
              <div className="font-bold text-navy-900">Celkem zákazníků: {rows.length}</div>
              <Button type="button" onClick={loadRows} disabled={loading} variant="secondary" size="sm">
                {loading ? "Načítám..." : "Obnovit"}
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Datum</TableHead>
                  <TableHead>Typ</TableHead>
                  <TableHead>Název</TableHead>
                  <TableHead>Reg. číslo</TableHead>
                  <TableHead>Kontakt</TableHead>
                  <TableHead>Licence</TableHead>
                  <TableHead>Stav</TableHead>
                  <TableHead>Akce</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? <TableRow><TableCell colSpan={8}>Načítám…</TableCell></TableRow> : null}
                {!loading && rows.length === 0 ? (
                  <TableRow><TableCell colSpan={8}>Zatím žádní zákazníci.</TableCell></TableRow>
                ) : null}

                {rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{formatDate(row.created_at)}</TableCell>
                    <TableCell>{ORGANIZATION_LABELS[row.org_type] || row.org_type}</TableCell>
                    <TableCell><div className="font-bold">{row.name}</div></TableCell>
                    <TableCell>{row.registration_number || "—"}</TableCell>
                    <TableCell>
                      {row.contact_name ? <div className="font-semibold">{row.contact_name}</div> : null}
                      {row.contact_email ? <a href={`mailto:${row.contact_email}`} className="mt-1 block text-navy-900">{row.contact_email}</a> : null}
                      {row.contact_phone ? <a href={`tel:${row.contact_phone}`} className="mt-1 block text-navy-900">{row.contact_phone}</a> : null}
                    </TableCell>
                    <TableCell>
                      {row.license_plan ? (
                        <>
                          <div className="font-semibold">{LICENSE_LABELS[row.license_plan] || row.license_plan}</div>
                          <div className="mt-1 text-xs text-slate-500">do {formatDate(row.license_valid_until)}</div>
                        </>
                      ) : "—"}
                    </TableCell>
                    <TableCell>
                      <span className={cn(
                        "inline-flex min-h-[28px] items-center rounded-full border px-2.5 text-xs font-bold",
                        row.license_status === "active"
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-slate-200 bg-slate-50 text-slate-600"
                      )}>
                        {row.license_status === "active" ? "Aktivní" : "Čeká na schválení"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        onClick={() => openActivation(row)}
                        disabled={row.license_status === "active"}
                        variant="secondary"
                        size="sm"
                      >
                        {row.license_status === "active" ? "Aktivní" : "Nastavit a aktivovat"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </main>
      </div>
    </RequirePlatformAdmin>
  );
}
