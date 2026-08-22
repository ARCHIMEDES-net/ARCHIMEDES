import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import RequirePlatformAdmin from "../../../components/RequirePlatformAdmin";
import PortalHeader from "../../../components/PortalHeader";
import { supabase } from "../../../lib/supabaseClient";
import { Alert } from "../../../components/ui/alert";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";

const CATEGORY = {
  internal_no_email: ["Bez e-mailu", "Interní nebo testovací účet."],
  identity_review: ["Ověřit identitu", "Chybí jednoznačná organizace, Auth účet nebo existuje možná duplicita."],
  repair_password_flag: ["Opravit data", "Uživatel se přihlásil, ale účet stále požaduje nastavení hesla."],
  fresh_access_candidate: ["Nový přístup", "Po schválení lze poslat jeden nový aktuální odkaz."],
  profile_reminder_candidate: ["Doplnění profilu", "Po schválení lze poslat jedno upozornění bez odkazu na heslo."],
  close_without_email: ["Uzavřít", "Účet už nemá důvod k dalšímu e-mailu."],
};

function formatDateTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString("cs-CZ");
}

async function authenticatedRequest(url, options = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error("Přihlášení vypršelo. Přihlaste se znovu.");
  const response = await fetch(url, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      Authorization: `Bearer ${session.access_token}`,
      ...options.headers,
    },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || "Operace se nezdařila.");
  return body;
}

export default function ProfileReminderCasesPage() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [selected, setSelected] = useState(null);
  const [reason, setReason] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadCases = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const body = await authenticatedRequest("/api/admin/profile-reminder-cases");
      setCases(body.cases || []);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadCases(); }, [loadCases]);

  const summary = useMemo(() => cases.reduce((result, item) => {
    result[item.category] = (result[item.category] || 0) + 1;
    return result;
  }, {}), [cases]);

  function startAction(item, action, organizationId = "") {
    setSelected({ item, action, organizationId });
    setReason("");
    setConfirmation("");
    setError("");
    setMessage("");
  }

  async function submitAction() {
    if (!selected) return;
    setSubmitting(true);
    setError("");
    setMessage("");
    try {
      if (selected.action === "close") {
        await authenticatedRequest("/api/admin/resolve-profile-reminder", {
          method: "POST",
          body: JSON.stringify({
            sourceAttemptId: selected.item.id,
            resolutionReason: reason,
            confirmation,
          }),
        });
        setMessage("Případ byl uzavřen bez odeslání e-mailu.");
      } else if (selected.action === "enable") {
        await authenticatedRequest("/api/admin/profile-reminder-organization", {
          method: "POST",
          body: JSON.stringify({
            organizationId: selected.organizationId,
            enabled: true,
            reason,
            confirmation,
          }),
        });
        setMessage("Organizace byla auditovaně povolena. Žádný e-mail se neposlal.");
      } else {
        await authenticatedRequest("/api/admin/retry-profile-reminder", {
          method: "POST",
          body: JSON.stringify({
            sourceAttemptId: selected.item.id,
            resolutionReason: reason,
            action: selected.action,
            confirmation,
          }),
        });
        setMessage("Provider přijal právě jeden schválený e-mail; stav doručení potvrdí webhook.");
      }
      setSelected(null);
      await loadCases();
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmitting(false);
    }
  }

  const requiredConfirmation = selected?.action === "close"
    ? "RESOLVE_WITHOUT_RESEND"
    : selected?.action === "enable"
      ? "ENABLE_PROFILE_EMAILS"
      : selected?.action === "approved_fresh_access"
        ? "SEND_ONE_FRESH_ACCESS_EMAIL"
        : "SEND_ONE_PROFILE_EMAIL";

  return (
    <RequirePlatformAdmin>
      <PortalHeader />
      <main className="mx-auto max-w-[1180px] px-4 py-5">
        <Link href="/portal/admin" className="text-sm font-bold text-brand hover:underline">← Zpět do administrace</Link>
        <h1 className="mt-3 text-2xl font-black text-navy-900">Kontrola starších profilových případů</h1>
        <p className="mt-1.5 max-w-3xl text-muted">
          Žádná hromadná akce zde není. Každý případ se kontroluje samostatně a e-mail lze poslat až po schválení organizace, uvedení důvodu a opsání přesného potvrzení.
        </p>

        <Alert variant="info" className="mt-4">
          Výchozí stav všech organizací je „e-maily zakázány“. Samotné povolení nic neposílá, ale po budoucím zapnutí automatiky dovolí ověřené připomínky i dalším způsobilým účtům této organizace. Povolujte proto až po kontrole celé organizace.
        </Alert>
        {error ? <Alert variant="error" className="mt-3">{error}</Alert> : null}
        {message ? <Alert variant="success" className="mt-3">{message}</Alert> : null}

        <div className="mt-4 flex flex-wrap gap-2">
          {Object.entries(CATEGORY).map(([key, [label]]) => (
            <Badge key={key} variant="outline">{label}: {summary[key] || 0}</Badge>
          ))}
        </div>

        {selected ? (
          <Card className="mt-4 border-amber-300">
            <CardContent>
              <h2 className="font-black text-navy-900">Potvrzení jedné operace</h2>
              <p className="mt-2 text-sm text-muted">
                Účet: {selected.item.profile?.full_name || "bez jména"} ({selected.item.recipient_email})
              </p>
              {selected.action === "enable" ? (
                <Alert variant="info" className="mt-3">
                  Tímto schvalujete pravidlo pro celou organizaci, ne pouze tento účet. Teď se žádný e-mail neodešle.
                </Alert>
              ) : null}
              <div className="mt-4">
                <Label htmlFor="review-reason">Konkrétní ověřený důvod (20–1000 znaků)</Label>
                <Textarea id="review-reason" rows={4} value={reason} onChange={(event) => setReason(event.target.value)} />
              </div>
              <div className="mt-4">
                <Label htmlFor="review-confirmation">Pro potvrzení opište: {requiredConfirmation}</Label>
                <Input id="review-confirmation" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} autoComplete="off" />
              </div>
              <div className="mt-4 flex gap-2">
                <Button type="button" disabled={submitting || reason.trim().length < 20 || confirmation !== requiredConfirmation} onClick={submitAction}>
                  {submitting ? "Provádím…" : "Potvrdit jednu operaci"}
                </Button>
                <Button type="button" variant="secondary" disabled={submitting} onClick={() => setSelected(null)}>Zrušit</Button>
              </div>
            </CardContent>
          </Card>
        ) : null}

        <section className="mt-5 space-y-3">
          {loading ? <p className="text-muted">Načítám kontrolní frontu…</p> : null}
          {!loading && !cases.length ? <Alert variant="success">Nejsou žádné nevyřešené starší případy.</Alert> : null}
          {cases.map((item) => {
            const [label, description] = CATEGORY[item.category] || CATEGORY.identity_review;
            const availableOrganization = item.organizations.find((organization) =>
              organization.status === "active" && organization.is_test !== true
            );
            return (
              <Card key={item.id}>
                <CardContent>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="font-black text-navy-900">{item.profile?.full_name || "Bez jména"}</div>
                      <div className="text-sm text-muted">{item.recipient_email}</div>
                    </div>
                    <Badge>{label}</Badge>
                  </div>
                  <p className="mt-3 text-sm text-slate-700">{description}</p>
                  <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
                    <div><dt className="font-bold">Organizace</dt><dd>{item.organizations.map((org) => org.name).join(", ") || "—"}</dd></div>
                    <div><dt className="font-bold">Přihlášení</dt><dd>{formatDateTime(item.lastSignInAt)}</dd></div>
                    <div><dt className="font-bold">Starý pokus</dt><dd>{item.status} / {item.client_delivery_status}</dd></div>
                    <div><dt className="font-bold">Schválení organizace</dt><dd>{item.organizationApproved ? "Ano" : "Ne"}</dd></div>
                  </dl>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button type="button" size="sm" variant="secondary" onClick={() => startAction(item, "close")}>Uzavřít bez e-mailu</Button>
                    {!item.organizationApproved && availableOrganization && ["fresh_access_candidate", "profile_reminder_candidate"].includes(item.category) ? (
                      <Button type="button" size="sm" variant="secondary" onClick={() => startAction(item, "enable", availableOrganization.id)}>Povolit organizaci</Button>
                    ) : null}
                    {item.emailActionAllowed && item.category === "fresh_access_candidate" ? (
                      <Button type="button" size="sm" onClick={() => startAction(item, "approved_fresh_access")}>Poslat 1 nový přístup</Button>
                    ) : null}
                    {item.emailActionAllowed && item.category === "profile_reminder_candidate" ? (
                      <Button type="button" size="sm" onClick={() => startAction(item, "approved_profile_reminder")}>Poslat 1 výzvu k profilu</Button>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </section>
      </main>
    </RequirePlatformAdmin>
  );
}
