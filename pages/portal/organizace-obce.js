import { useCallback, useEffect, useState } from "react";
import RequireAuth from "../../components/RequireAuth";
import PortalHeader from "../../components/PortalHeader";
import { supabase } from "../../lib/supabaseClient";
import { fetchMyOrganization } from "../../lib/myOrganizations";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Alert } from "../../components/ui/alert";
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

function memberRoleLabel(role) {
  return role === "organization_admin" ? "Správce školy" : "Učitel";
}

function memberStatusLabel(member) {
  if (member.membership_status !== "active" || member.is_active === false) {
    return "Neaktivní";
  }
  if (member.must_set_password) return "Čeká na nastavení hesla";
  if (!member.profile_completed) return "Profil není dokončený";
  return "Aktivní";
}

export default function MunicipalityOrganizationsPage() {
  const [session, setSession] = useState(null);
  const [organizationId, setOrganizationId] = useState("");
  const [municipality, setMunicipality] = useState(null);
  const [membershipRole, setMembershipRole] = useState("");
  const [organizations, setOrganizations] = useState([]);
  const [expandedOrganizations, setExpandedOrganizations] = useState({});
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadOverview = useCallback(async (currentSession, municipalityId) => {
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
  }, []);

  function toggleOrganization(organizationId) {
    setExpandedOrganizations((current) => ({
      ...current,
      [organizationId]: !current[organizationId],
    }));
  }

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
  }, [loadOverview]);

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
    await loadOverview(session, organizationId);
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
            Každou školu a spolek zakládá po ověření centrální tým ARCHIMEDES.
            Organizace zůstávají samostatnými subjekty s vlastními uživateli a daty.
          </p>

          {error ? <Alert variant="error" className="mt-4">{error}</Alert> : null}
          {message ? <Alert variant="success" className="mt-4">{message}</Alert> : null}

          {loading ? <Card className="mt-5 p-6">Načítám organizace obce…</Card> : null}

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
                <h2 className="text-2xl font-black text-navy-900">Zapojení další organizace</h2>
                <p className="mt-2 max-w-[850px] text-sm leading-relaxed text-slate-600">
                  Požadavek na přidání školy nebo spolku předejte týmu ARCHIMEDES.
                  Centrální tým organizaci ověří, samostatně založí a propojí s licencí obce.
                  Správce obce zde následně uvidí zapojené školy a stav jejich uživatelů.
                  Obsah školy a osobní nastavení uživatelů zůstávají oddělené.
                </p>
              </Card>

              <Card className="mt-5 p-6">
                <h2 className="text-2xl font-black text-navy-900">
                  Zapojené organizace ({organizations.length})
                </h2>
                <div className="mt-4 grid gap-3">
                  {organizations.map((organization) => {
                    const isSchool = organization.org_type === "school";
                    const members = Array.isArray(organization.members) ? organization.members : [];
                    const expanded = expandedOrganizations[organization.id] === true;

                    return (
                      <div key={organization.id} className="rounded-2xl border border-slate-200 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <div className="font-bold text-navy-900">{organization.name}</div>
                            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                              <span>{TYPE_LABELS[organization.org_type] || organization.org_type}</span>
                              {isSchool ? <span>• {members.length} {members.length === 1 ? "uživatel" : "uživatelů"}</span> : null}
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline">
                              {organization.status === "active" ? "Aktivní" : organization.status}
                            </Badge>
                            {isSchool ? (
                              <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                aria-expanded={expanded}
                                onClick={() => toggleOrganization(organization.id)}
                              >
                                {expanded
                                  ? "Skrýt učitele a správce"
                                  : `Zobrazit učitele a správce (${members.length})`}
                              </Button>
                            ) : null}
                          </div>
                        </div>

                        {isSchool && expanded ? (
                          <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
                            <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 font-bold text-navy-900">
                              Učitelé a správci školy
                            </div>
                            {members.length > 0 ? (
                              <div className="divide-y divide-slate-200">
                                {members.map((member) => (
                                  <div
                                    key={member.id}
                                    className="grid gap-2 px-4 py-3 sm:grid-cols-[1.1fr_1.4fr_0.9fr_1fr] sm:items-center"
                                  >
                                    <div className="font-bold text-navy-900">{member.full_name || "Bez uvedeného jména"}</div>
                                    <div className="break-all text-sm text-slate-600">{member.email || "E-mail neuveden"}</div>
                                    <div className="text-sm text-slate-600">{memberRoleLabel(member.role_in_org)}</div>
                                    <div className="text-sm font-semibold text-navy-900">{memberStatusLabel(member)}</div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="px-4 py-4 text-sm text-slate-500">
                                Ke škole zatím není přiřazen žádný učitel ani správce školy.
                              </div>
                            )}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                  {organizations.length === 0 ? <div className="text-slate-500">Zatím není zapojená žádná organizace.</div> : null}
                </div>
              </Card>

              <Card className="mt-5 p-6">
                <h2 className="text-2xl font-black text-navy-900">
                  Starší registrační pozvánky
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Nové registrační pozvánky už nelze vytvářet. Zbývající aktivní
                  pozvánku můžete preventivně zrušit.
                </p>
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
