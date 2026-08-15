import Link from "next/link";
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

  const datePart = String(value).slice(0, 10);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(datePart);
  if (match) {
    return `${Number(match[3])}. ${Number(match[2])}. ${match[1]}`;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("cs-CZ");
}

function formatDateTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString("cs-CZ");
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

const EMAIL_STATUS_LABELS = {
  pending: "Čeká na první pokus",
  sending: "Odesílání probíhá",
  sent: "Odesláno",
  failed: "Bezpečná chyba před odesláním",
  delivery_unknown: "Výsledek doručení není známý",
};

function createIdempotencyKey() {
  return globalThis.crypto?.randomUUID?.() || "";
}

function createDraft() {
  return {
    idempotencyKey: createIdempotencyKey(),
    licensePlan: "paid_monthly",
    licenseStartedAt: inputDate(),
    licenseValidUntil: "",
    contractAccepted: false,
    classroomEligibilityVerified: false,
    billingStatus: "pending",
    contactIsLocalAdmin: false,
    localAdminFullName: "",
    localAdminEmail: "",
  };
}

export default function AdminObcePage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activatingId, setActivatingId] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [emailCustomer, setEmailCustomer] = useState(null);
  const [emailState, setEmailState] = useState(null);
  const [emailReason, setEmailReason] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailSubmitting, setEmailSubmitting] = useState(false);
  const [draft, setDraft] = useState(createDraft);
  const [activationReviewOpen, setActivationReviewOpen] = useState(false);
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
        "id, name, org_type, parent_organization_id, registration_number, license_status, requested_license_plan, license_plan, license_started_at, license_valid_until, contract_status, billing_status, status, contact_name, contact_email, contact_phone, terms_accepted_at, created_at"
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
    setEmailCustomer(null);
    setEmailState(null);
    setSelectedCustomer(row);
    setActivationReviewOpen(false);
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

  async function authenticatedRequest(url, options = {}) {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.access_token) {
      throw new Error("Přihlášení vypršelo. Přihlaste se znovu.");
    }

    return fetch(url, {
      ...options,
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        Authorization: `Bearer ${session.access_token}`,
        ...options.headers,
      },
    });
  }

  async function loadEmailState(row, preserveError = false) {
    setEmailLoading(true);
    if (!preserveError) setError("");
    try {
      const response = await authenticatedRequest(
        `/api/admin/activate-municipality?organizationId=${encodeURIComponent(row.id)}`
      );
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error || "Audit e-mailu se nepodařilo načíst.");
      setEmailState(result.emailState);
    } catch (loadError) {
      setEmailState(null);
      setError(loadError?.message || "Audit e-mailu se nepodařilo načíst.");
    } finally {
      setEmailLoading(false);
    }
  }

  async function openEmailManagement(row, preserveMessages = false) {
    setSelectedCustomer(null);
    setEmailCustomer(row);
    setEmailReason("");
    if (!preserveMessages) setMessage("");
    await loadEmailState(row, preserveMessages);
  }

  async function performEmailAction(action) {
    if (!emailCustomer || emailReason.trim().length < 3) {
      setError("Uveďte auditní důvod alespoň třemi znaky.");
      return;
    }

    const confirmationText =
      action === "resolve_without_resend"
        ? "Uzavřít neznámé doručení bez dalšího e-mailu?"
        : action === "confirm_not_delivered_and_retry"
          ? "Potvrdit, že zpráva nebyla doručena, a vytvořit nový pokus?"
          : action === "retry_failed"
            ? "Vytvořit nový pokus po bezpečné chybě před odesláním?"
            : "Spustit první auditovaný e-mailový pokus?";
    if (!window.confirm(confirmationText)) return;

    setEmailSubmitting(true);
    setError("");
    setMessage("");
    try {
      const response = await authenticatedRequest(
        "/api/admin/activate-municipality",
        {
          method: "POST",
          body: JSON.stringify({
            organizationId: emailCustomer.id,
            action,
            reason: emailReason.trim(),
          }),
        }
      );
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error || "Akci se nepodařilo dokončit.");
      setEmailState(result.emailState);
      setEmailReason("");
      setMessage("E-mailový stav a audit byly bezpečně aktualizovány.");
    } catch (actionError) {
      setError(actionError?.message || "Akci se nepodařilo dokončit.");
      await loadEmailState(emailCustomer);
    } finally {
      setEmailSubmitting(false);
    }
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
        classroomEligibilityVerified: false,
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

  async function activateCustomer({ confirmed = false } = {}) {
    const row = selectedCustomer;
    if (!row) return;

    if (!draft.contractAccepted) {
      setError("Před aktivací potvrďte, že je smlouva uzavřena.");
      return;
    }

    if (!draft.idempotencyKey) {
      setError("Prohlížeč nedokázal vytvořit bezpečný identifikátor onboardingu. Obnovte stránku.");
      return;
    }

    if (
      draft.localAdminFullName.trim().length < 2 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.localAdminEmail.trim())
    ) {
      setError("Vyplňte jméno a e-mail lokálního správce platformy.");
      return;
    }

    if (
      ["paid_annual", "classroom_free_12m"].includes(draft.licensePlan) &&
      !draft.licenseValidUntil
    ) {
      setError("U roční nebo bezplatné licence vyplňte datum konce.");
      return;
    }

    if (
      draft.licensePlan === "classroom_free_12m" &&
      !draft.classroomEligibilityVerified
    ) {
      setError("Potvrďte ověření, že obec má učebnu ARCHIMEDES.");
      return;
    }

    const typeLabel = ORGANIZATION_LABELS[row.org_type] || "Organizace";
    if (!confirmed) {
      setActivationReviewOpen(true);
      return;
    }

    setActivationReviewOpen(false);

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
          idempotencyKey: draft.idempotencyKey,
          organizationId: row.id,
          licensePlan: draft.licensePlan,
          licenseStartedAt: draft.licenseStartedAt,
          licenseValidUntil: draft.licenseValidUntil || null,
          contractStatus: "accepted",
          billingStatus: draft.billingStatus,
          classroomEligibilityVerified: draft.classroomEligibilityVerified,
          localAdminFullName: draft.localAdminFullName,
          localAdminEmail: draft.localAdminEmail,
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

      const accountMessage = result.localAdminAccountCreated
        ? "Nový účet lokálního správce byl připraven."
        : "Existující účet lokálního správce byl zachován.";
      const centralMessage = ["municipality", "obec"].includes(row.org_type)
        ? ` Přidáno centrálních správců: ${result.centralAdminCount}.`
        : "";

      setMessage(
        `${typeLabel} „${row.name}“ byla atomicky aktivována. ${accountMessage}${centralMessage}`
      );
      if (result.emailManualReviewRequired) {
        setError(
          "Doručení onboardingového e-mailu má nejednoznačný výsledek. Obec je aktivní, ale před případným ručním opakováním ověřte doručenou poštu a audit, aby nevznikla duplicitní zpráva."
        );
        await openEmailManagement({ ...row, license_status: "active" }, true);
      } else if (result.onboardingEmailSent) {
        setSelectedCustomer(null);
        setActivationReviewOpen(false);
      } else if (result.emailDeliveryInProgress) {
        setMessage(
          `${typeLabel} „${row.name}“ byla aktivována a onboardingový e-mail právě zpracovává jiný identický požadavek.`
        );
        await openEmailManagement({ ...row, license_status: "active" }, true);
      } else {
        setError(
          "E-mail nebyl odeslán. Databázový onboarding zůstal platný; bezpečné opakování je dostupné v auditovaném panelu e-mailu."
        );
        await openEmailManagement({ ...row, license_status: "active" }, true);
      }
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
            Přehled hlavních zákazníků, jejich licence a navázaných organizací.
          </p>

          {error ? <Alert variant="error" className="mt-4">{error}</Alert> : null}
          {message ? <Alert variant="success" className="mt-4">{message}</Alert> : null}

          {emailCustomer ? (
            <Card className="mt-5 p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-bold uppercase tracking-wide text-slate-500">
                    Audit onboardingového e-mailu
                  </div>
                  <h2 className="mt-1 text-2xl font-black text-navy-900">
                    {emailCustomer.name}
                  </h2>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setEmailCustomer(null);
                    setEmailState(null);
                  }}
                >
                  Zavřít
                </Button>
              </div>

              {emailLoading ? <p className="mt-5 text-sm text-slate-600">Načítám audit…</p> : null}
              {!emailLoading && emailState ? (
                <>
                  <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="font-bold text-navy-900">
                      {EMAIL_STATUS_LABELS[emailState.email_status] || emailState.email_status}
                    </div>
                    <div className="mt-1 text-sm text-slate-600">
                      Lokální správce: {emailState.local_admin_full_name} • {emailState.local_admin_email}
                    </div>
                    <div className="mt-1 text-sm text-slate-600">
                      Počet pokusů: {emailState.email_attempt_count || 0}
                    </div>
                    {emailState.email_attempted_at ? (
                      <div className="mt-1 text-sm text-slate-600">
                        Poslední změna doručení: {formatDateTime(emailState.email_attempted_at)}
                      </div>
                    ) : null}
                    {emailState.email_resolution_action === "resolved_without_resend" ? (
                      <div className="mt-2 text-sm font-semibold text-emerald-700">
                        Ručně uzavřeno bez dalšího odeslání
                        {emailState.email_resolved_at
                          ? ` (${formatDateTime(emailState.email_resolved_at)})`
                          : ""}
                        : {emailState.email_resolution_reason}
                      </div>
                    ) : null}
                  </div>

                  {emailState.attempts?.length ? (
                    <div className="mt-5 space-y-2">
                      {emailState.attempts.map((attempt) => (
                        <div key={attempt.attempt_number} className="rounded-xl border border-slate-200 p-3 text-sm text-slate-700">
                          <div className="font-bold">
                            Pokus {attempt.attempt_number}: {EMAIL_STATUS_LABELS[attempt.status] || attempt.status}
                          </div>
                          <div className="mt-1">Důvod: {attempt.initiation_reason}</div>
                          <div className="mt-1 text-xs text-slate-500">
                            Převzato: {formatDateTime(attempt.claimed_at)}
                            {attempt.completed_at
                              ? ` • dokončeno: ${formatDateTime(attempt.completed_at)}`
                              : ""}
                          </div>
                          {attempt.previous_attempt_number ? (
                            <div className="mt-1 text-xs text-slate-500">
                              Navazuje na pokus {attempt.previous_attempt_number}
                            </div>
                          ) : null}
                          {attempt.resolution_reason ? (
                            <div className="mt-1 font-semibold">
                              Rozhodnutí{attempt.resolved_at ? ` (${formatDateTime(attempt.resolved_at)})` : ""}: {attempt.resolution_reason}
                            </div>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {["pending", "failed", "delivery_unknown"].includes(emailState.email_status) &&
                  emailState.email_resolution_action !== "resolved_without_resend" ? (
                    <div className="mt-5">
                      <Label>Auditní důvod rozhodnutí nebo nového pokusu</Label>
                      <Input
                        value={emailReason}
                        maxLength={500}
                        onChange={(event) => setEmailReason(event.target.value)}
                        placeholder="Např. potvrzeno telefonicky s příjemcem"
                      />
                    </div>
                  ) : null}

                  <div className="mt-5 flex flex-wrap gap-3">
                    {emailState.email_status === "pending" ? (
                      <Button type="button" disabled={emailSubmitting} onClick={() => performEmailAction("send_pending")}>Odeslat první pokus</Button>
                    ) : null}
                    {emailState.email_status === "failed" ? (
                      <Button type="button" disabled={emailSubmitting} onClick={() => performEmailAction("retry_failed")}>Bezpečně opakovat</Button>
                    ) : null}
                    {emailState.email_status === "delivery_unknown" &&
                    emailState.email_resolution_action !== "resolved_without_resend" ? (
                      <>
                        <Button type="button" disabled={emailSubmitting} onClick={() => performEmailAction("resolve_without_resend")}>Vyřešit bez odeslání</Button>
                        <Button type="button" variant="secondary" disabled={emailSubmitting} onClick={() => performEmailAction("confirm_not_delivered_and_retry")}>Potvrdit nedoručení a opakovat</Button>
                      </>
                    ) : null}
                    <Button type="button" variant="secondary" disabled={emailLoading || emailSubmitting} onClick={() => loadEmailState(emailCustomer)}>Obnovit stav</Button>
                  </div>
                </>
              ) : null}
            </Card>
          ) : null}

          {selectedCustomer ? (
            <Card className="mt-5 p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-bold uppercase tracking-wide text-slate-500">
                    Jednotný onboarding zákazníka
                  </div>
                  <h2 className="mt-1 text-2xl font-black text-navy-900">
                    {selectedCustomer.name}
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Kontakt obce: {selectedCustomer.contact_name || "—"} • {selectedCustomer.contact_email || "—"}
                  </p>
                </div>
                <Button type="button" variant="secondary" onClick={() => {
                  setActivationReviewOpen(false);
                  setSelectedCustomer(null);
                }}>
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

              <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
                <h3 className="text-lg font-black text-navy-900">
                  Lokální správce platformy
                </h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Kontaktní osoba obce není automaticky uživatelem ani správcem. Účet a
                  onboardingový e-mail vzniknou výhradně pro osobu uvedenou níže.
                </p>

                <label className="mt-4 flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <input
                    type="checkbox"
                    checked={draft.contactIsLocalAdmin}
                    onChange={(event) => {
                      const checked = event.target.checked;
                      setDraft((current) => ({
                        ...current,
                        contactIsLocalAdmin: checked,
                        localAdminFullName: checked
                          ? selectedCustomer.contact_name || ""
                          : "",
                        localAdminEmail: checked
                          ? selectedCustomer.contact_email || ""
                          : "",
                      }));
                    }}
                    className="mt-1 h-4 w-4"
                  />
                  <span className="text-sm font-semibold text-slate-700">
                    Kontaktní osoba je zároveň lokálním správcem platformy
                  </span>
                </label>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>Jméno lokálního správce</Label>
                    <Input
                      value={draft.localAdminFullName}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          contactIsLocalAdmin: false,
                          localAdminFullName: event.target.value,
                        }))
                      }
                      autoComplete="name"
                      required
                    />
                  </div>
                  <div>
                    <Label>Pracovní e-mail lokálního správce</Label>
                    <Input
                      type="email"
                      value={draft.localAdminEmail}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          contactIsLocalAdmin: false,
                          localAdminEmail: event.target.value,
                        }))
                      }
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>

                {["municipality", "obec"].includes(selectedCustomer.org_type) ? (
                  <p className="mt-4 text-sm leading-6 text-slate-600">
                    Současně budou přidáni centrální správci uvedení v bezpečné
                    serverové konfiguraci. Jejich jména ani účty nejsou v aplikaci
                    zapsány napevno.
                  </p>
                ) : null}
              </div>

              {draft.licensePlan === "classroom_free_12m" ? (
                <label className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                  <input
                    type="checkbox"
                    checked={draft.classroomEligibilityVerified}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        classroomEligibilityVerified: event.target.checked,
                      }))
                    }
                    className="mt-1 h-4 w-4"
                  />
                  <span className="text-sm font-semibold leading-relaxed text-amber-900">
                    Ověřil/a jsem, že obec má učebnu ARCHIMEDES a splňuje podmínku pro prvních 12 měsíců zdarma.
                  </span>
                </label>
              ) : null}

              <label className="mt-5 flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <input
                  type="checkbox"
                  checked={draft.contractAccepted}
                  onChange={(event) => setDraft((current) => ({ ...current, contractAccepted: event.target.checked }))}
                  className="mt-1 h-4 w-4"
                />
                <span className="text-sm leading-relaxed text-slate-700">
                  {selectedCustomer.terms_accepted_at
                    ? "Potvrzuji, že byla ověřena totožnost zákazníka a oprávnění objednatele. Při dokončení onboardingu systém nejprve odešle objednateli auditované písemné přijetí se zvolenou licencí, fakturací a datem zahájení; teprve po úspěšném odeslání aktivuje zákazníka."
                    : "Potvrzuji, že byla ověřena totožnost zákazníka, oprávnění kontaktní osoby a uzavření příslušné smlouvy."}
                </span>
              </label>

              <div className="mt-5">
                <Button
                  type="button"
                  disabled={activatingId === selectedCustomer.id}
                  onClick={() => activateCustomer()}
                >
                  {activatingId === selectedCustomer.id
                    ? "Dokončuji onboarding…"
                    : "Zkontrolovat a dokončit onboarding"}
                </Button>
              </div>

              {activationReviewOpen ? (
                <div
                  className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
                  role="presentation"
                >
                  <div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="activation-review-title"
                    className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl"
                  >
                    <div className="text-sm font-bold uppercase tracking-wide text-slate-500">
                      Finální kontrola
                    </div>
                    <h3 id="activation-review-title" className="mt-1 text-2xl font-black text-navy-900">
                      Potvrdit a dokončit onboarding?
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Nejdříve se odešle auditované písemné přijetí objednávky. Zákazník
                      se aktivuje až po jeho úspěšném odeslání.
                    </p>

                    <dl className="mt-5 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm md:grid-cols-2">
                      <div>
                        <dt className="font-semibold text-slate-500">Zákazník</dt>
                        <dd className="mt-1 font-bold text-navy-900">{selectedCustomer.name}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-slate-500">Varianta</dt>
                        <dd className="mt-1 font-bold text-navy-900">{LICENSE_LABELS[draft.licensePlan]}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-slate-500">Platnost</dt>
                        <dd className="mt-1 font-bold text-navy-900">
                          {draft.licenseStartedAt}
                          {draft.licenseValidUntil ? ` – ${draft.licenseValidUntil}` : ""}
                        </dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-slate-500">Fakturace</dt>
                        <dd className="mt-1 font-bold text-navy-900">
                          {draft.billingStatus === "paid"
                            ? "Uhrazeno"
                            : draft.billingStatus === "not_applicable"
                              ? "Bez úhrady"
                              : "Čeká na úhradu"}
                        </dd>
                      </div>
                      <div className="md:col-span-2">
                        <dt className="font-semibold text-slate-500">Lokální správce</dt>
                        <dd className="mt-1 font-bold text-navy-900">
                          {draft.localAdminFullName} • {draft.localAdminEmail.trim().toLowerCase()}
                        </dd>
                      </div>
                    </dl>

                    <div className="mt-6 flex flex-wrap justify-end gap-3">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => setActivationReviewOpen(false)}
                      >
                        Zpět k úpravám
                      </Button>
                      <Button
                        type="button"
                        disabled={activatingId === selectedCustomer.id}
                        onClick={() => activateCustomer({ confirmed: true })}
                      >
                        {activatingId === selectedCustomer.id
                          ? "Dokončuji onboarding…"
                          : "Potvrdit a aktivovat"}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : null}
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
                    <TableCell>
                      <Link
                        href={`/portal/admin/obce/${row.id}`}
                        className="font-bold text-navy-900 underline decoration-slate-300 underline-offset-4 hover:decoration-navy-900"
                      >
                        {row.name}
                      </Link>
                    </TableCell>
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
                          {row.license_valid_until ? (
                            <div className="mt-1 text-xs text-slate-500">do {formatDate(row.license_valid_until)}</div>
                          ) : null}
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
                      {row.license_status === "active" ? (
                        <div className="flex flex-wrap gap-2">
                          <Button href={`/portal/admin/obce/${row.id}`} variant="secondary" size="sm">
                            Detail
                          </Button>
                          <Button
                            type="button"
                            onClick={() => openEmailManagement(row)}
                            variant="secondary"
                            size="sm"
                          >
                            Onboardingový e-mail
                          </Button>
                        </div>
                      ) : (
                        <Button
                          type="button"
                          onClick={() => openActivation(row)}
                          variant="secondary"
                          size="sm"
                        >
                          Nastavit a aktivovat
                        </Button>
                      )}
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
