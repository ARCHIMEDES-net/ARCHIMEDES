import { useEffect, useState } from "react";
import RequireAuth from "../../components/RequireAuth";
import PortalHeader from "../../components/PortalHeader";
import { supabase } from "../../lib/supabaseClient";
import { fetchMyOrganization } from "../../lib/myOrganizations";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Alert } from "../../components/ui/alert";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select } from "../../components/ui/select";
import { Badge } from "../../components/ui/badge";

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("cs-CZ");
}

const TYPE_LABELS = {
  school: "Škola",
  association: "Spolek",
  spolek: "Spolek",
};

const STATUS_LABELS = {
  pending: "Čeká",
  used: "Použita",
  revoked: "Zrušena",
  expired: "Vypršela",
};

const LICENSE_LABELS = {
  paid_monthly: "1 990 Kč měsíčně",
  paid_annual: "12 měsíců placených najednou",
  classroom_free_12m: "12 měsíců zdarma – obec s učebnou",
};

export default function MunicipalityOrganizationsPage() {
  const [session, setSession] = useState(null);
  const [organizationId, setOrganizationId] = useState("");
  const [municipality, setMunicipality] = useState(null);
  const [membershipRole, setMembershipRole] = useState("");
  const [organizations, setOrganizations] = useState([]);
  const [invites, setInvites] = useState([]);
  const [organizationType, setOrganizationType] = useState("school");
  const [email, setEmail] = useState("");
  const [latestInviteUrl, setLatestInviteUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function initialize() {
      try {
        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession();

        if (!currentSession?.user) return;
        if (cancelled) return;
        setSession(currentSession);

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("active_organization_id")
          .eq("id", currentSession.user.id)
          .maybeSingle();

        if (profileError) throw profileError;
        if (!profile?.active_organization_id) {
          throw new Error("Nemáte zvolenou aktivní organizaci.");
        }

        const [organization, membershipResult] = await Promise.all([
          fetchMyOrganization(supabase, profile.active_organization_id),
          supabase
            .from("organization_members")
            .select("role_in_org, status")
            .eq("organization_id", profile.active_organization_id)
            .eq("user_id", currentSession.user.id)
            .eq("status", "active")
            .maybeSingle(),
        ]);

        if (membershipResult.error) throw membershipResult.error;
        if (cancelled) return;

        setMunicipality(organization);
        setMembershipRole(membershipResult.data?.role_in_org || "");
        setOrganizationId(profile.active_organization_id);

        if (
          !["municipality", "obec"].includes(organization?.org_type) ||
          membershipResult.data?.role_in_org !== "organization_admin"
        ) {
          setLoading(false);
          return;
        }

        await loadOverview(currentSession, profile.active_organization_id);
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError?.message || "Onboarding obce se nepodařilo načíst.");
          setLoading(false);
        }
      }
    }

    initialize();
    return () => {
      cancelled = true;
    };
  }, []);

  async function loadOverview(currentSession = session, municipalityId = organizationId) {
    if (!currentSession?.access_token || !municipalityId) return;

    const response = await fetch(
      `/api/municipality/organization-invites?municipalityId=${encodeURIComponent(municipalityId)}`,
      { headers: { Authorization: `Bearer ${currentSession.access_token}` } }
    );
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.error || "Přehled se nepodařilo načíst.");
    }

    setMunicipality((current) => ({ ...(current || {}), ...(data.municipality || {}) }));
    setOrganizations(data.organizations || []);
    setInvites(data.invites || []);
    setLoading(false);
  }

  async function createInvite(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    setLatestInviteUrl("");

    try {
      const response = await fetch("/api/municipality/organization-invites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          municipalityId: organizationId,
          organizationType,
          email: email.trim(),
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Pozvánku se nepodařilo vytvořit.");
      }

      setLatestInviteUrl(data.inviteUrl || "");
      setMessage(
        email.trim()
          ? data.emailSent
            ? "Pozvánka byla vytvořena a odeslána e-mailem."
            : "Pozvánka byla vytvořena, ale e-mail se nepodařilo odeslat. Zkopírujte odkaz ručně."
          : "Pozvánka byla vytvořena. Zkopírujte odkaz a předejte ho organizaci."
      );
      setEmail("");
      await loadOverview();
    } catch (inviteError) {
      setError(inviteError?.message || "Pozvánku se nepodařilo vytvořit.");
    } finally {
      setSaving(false);
    }
  }

  async function copyInviteUrl() {
    try {
      await navigator.clipboard.writeText(latestInviteUrl);
      setMessage("Jednorázový odkaz byl zkopírován.");
    } catch (_) {
      setMessage("Odkaz zkopírujte ručně.");
    }
  }

  async function revokeInvite(inviteId) {
    if (!window.confirm("Opravdu zrušit tuto pozvánku?")) return;

    const response = await fetch("/api/municipality/organization-invites", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ municipalityId: organizationId, inviteId }),
    });
    const data = await response.json();

    if (!response.ok) {
      setError(data?.error || "Pozvánku se nepodařilo zrušit.");
      return;
    }

    setMessage("Pozvánka byla zrušena.");
    await loadOverview();
  }

  const isMunicipalityAdmin =
    ["municipality", "obec"].includes(municipality?.org_type) &&
    membershipRole === "organization_admin";

  return (
    <RequireAuth>
      <div className="min-h-screen bg-slate-50">
        <PortalHeader title="Organizace obce" />

        <main className="mx-auto max-w-[1160px] px-4 py-9">
          <h1 className="text-[34px] font-[950] tracking-[-0.03em] text-navy-900">
            Školy a spolky obce
          </h1>
          <p className="mt-2 max-w-[850px] text-muted">
            Organizace se zapojují pouze jednorázovou pozvánkou správce obce.
            Registrační číslo identifikuje program obce, ale samo nezakládá přístup.
          </p>

          {error ? <Alert variant="error" className="mt-4">{error}</Alert> : null}
          {message ? <Alert variant="success" className="mt-4">{message}</Alert> : null}

          {loading ? <Card className="mt-5 p-6">Načítám onboarding obce…</Card> : null}

          {!loading && !isMunicipalityAdmin ? (
            <Card className="mt-5 p-6">
              Tato stránka je dostupná pouze správci aktivní obce.
            </Card>
          ) : null}

          {!loading && isMunicipalityAdmin ? (
            <>
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <Card className="p-5">
                  <div className="text-sm font-bold text-slate-500">Obec</div>
                  <div className="mt-1 text-xl font-black text-navy-900">{municipality?.name}</div>
                </Card>
                <Card className="p-5">
                  <div className="text-sm font-bold text-slate-500">Registrační číslo</div>
                  <div className="mt-1 font-mono text-2xl font-black text-navy-900">
                    {municipality?.registration_number || "—"}
                  </div>
                </Card>
                <Card className="p-5">
                  <div className="text-sm font-bold text-slate-500">Licence</div>
                  <div className="mt-1 font-black text-navy-900">
                    {LICENSE_LABELS[municipality?.license_plan] || "Aktivní program"}
                  </div>
                  <div className="mt-1 text-sm text-slate-500">
                    Platnost do {formatDate(municipality?.license_valid_until)}
                  </div>
                </Card>
              </div>

              <Card className="mt-5 p-6">
                <h2 className="text-2xl font-black text-navy-900">Vytvořit pozvánku</h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Odkaz je platný 14 dní a lze ho použít pouze jednou. Pokud
                  zadáte e-mail, pozvánka bude svázána s touto adresou.
                </p>

                <form onSubmit={createInvite} className="mt-5 grid items-end gap-4 md:grid-cols-[220px_1fr_auto]">
                  <div>
                    <Label>Typ organizace</Label>
                    <Select value={organizationType} onChange={(event) => setOrganizationType(event.target.value)}>
                      <option value="school">Škola</option>
                      <option value="association">Spolek</option>
                    </Select>
                  </div>
                  <div>
                    <Label>E-mail kontaktní osoby (doporučeno)</Label>
                    <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="kontakt@organizace.cz" />
                  </div>
                  <Button type="submit" disabled={saving}>
                    {saving ? "Vytvářím…" : "Vytvořit pozvánku"}
                  </Button>
                </form>

                {latestInviteUrl ? (
                  <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                    <div className="text-sm font-bold text-emerald-800">Jednorázový registrační odkaz</div>
                    <div className="mt-2 break-all font-mono text-sm text-emerald-950">{latestInviteUrl}</div>
                    <Button type="button" variant="secondary" size="sm" className="mt-3" onClick={copyInviteUrl}>
                      Zkopírovat odkaz
                    </Button>
                  </div>
                ) : null}
              </Card>

              <Card className="mt-5 p-6">
                <h2 className="text-2xl font-black text-navy-900">
                  Zapojené organizace ({organizations.length})
                </h2>
                <div className="mt-4 grid gap-3">
                  {organizations.map((organization) => (
                    <div key={organization.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 p-4">
                      <div>
                        <div className="font-bold text-navy-900">{organization.name}</div>
                        <div className="mt-1 text-sm text-slate-500">
                          {TYPE_LABELS[organization.org_type] || organization.org_type}
                          {organization.contact_email ? ` • ${organization.contact_email}` : ""}
                        </div>
                      </div>
                      <Badge variant="outline">{organization.status === "active" ? "Aktivní" : organization.status}</Badge>
                    </div>
                  ))}
                  {organizations.length === 0 ? <div className="text-slate-500">Zatím není zapojená žádná organizace.</div> : null}
                </div>
              </Card>

              <Card className="mt-5 p-6">
                <h2 className="text-2xl font-black text-navy-900">
                  Historie pozvánek
                </h2>
                <div className="mt-4 grid gap-3">
                  {invites.map((invite) => (
                    <div key={invite.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 p-4">
                      <div>
                        <div className="font-bold text-navy-900">
                          {TYPE_LABELS[invite.organization_type]} • {invite.invited_email || "bez určeného e-mailu"}
                        </div>
                        <div className="mt-1 text-sm text-slate-500">
                          Vytvořena {formatDate(invite.created_at)} • platí do {formatDate(invite.expires_at)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{STATUS_LABELS[invite.status] || invite.status}</Badge>
                        {invite.status === "pending" ? (
                          <Button type="button" variant="secondary" size="sm" onClick={() => revokeInvite(invite.id)}>
                            Zrušit
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  ))}
                  {invites.length === 0 ? <div className="text-slate-500">Zatím nebyla vytvořena žádná pozvánka.</div> : null}
                </div>
              </Card>
            </>
          ) : null}
        </main>
      </div>
    </RequireAuth>
  );
}
