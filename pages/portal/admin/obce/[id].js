import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import RequirePlatformAdmin from "../../../../components/RequirePlatformAdmin";
import PortalHeader from "../../../../components/PortalHeader";
import { supabase } from "../../../../lib/supabaseClient";
import { Card } from "../../../../components/ui/card";
import { Alert } from "../../../../components/ui/alert";
import { Button } from "../../../../components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../../../../components/ui/table";

const ORGANIZATION_LABELS = {
  municipality: "Obec",
  obec: "Obec",
  school: "Škola",
  association: "Spolek",
  spolek: "Spolek",
};

const LICENSE_LABELS = {
  paid_monthly: "1 990 Kč měsíčně",
  paid_annual: "12 měsíců placených najednou",
  classroom_free_12m: "12 měsíců zdarma – obec s učebnou",
};

const BILLING_LABELS = {
  pending: "Čeká na úhradu",
  paid: "Uhrazeno",
  not_applicable: "Bez úhrady",
};

const CONTRACT_LABELS = {
  pending: "Čeká na potvrzení",
  accepted: "Potvrzeno",
};

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

function InfoItem({ label, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1.5 break-words font-semibold text-navy-900">{children || "—"}</div>
    </div>
  );
}

export default function AdminMunicipalityDetailPage() {
  const router = useRouter();
  const organizationId = typeof router.query.id === "string" ? router.query.id : "";
  const [organization, setOrganization] = useState(null);
  const [children, setChildren] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!router.isReady || !organizationId) return;
    loadDetail();
  }, [router.isReady, organizationId]);

  async function loadDetail() {
    setLoading(true);
    setError("");

    try {
      const { data: organizationRow, error: organizationError } = await supabase
        .from("organizations")
        .select(
          "id, name, org_type, registration_number, ico, legal_identifier, registered_address, contact_name, contact_email, contact_phone, license_status, license_plan, license_started_at, license_valid_until, contract_status, billing_status, status, created_at, activated_at"
        )
        .eq("id", organizationId)
        .maybeSingle();

      if (organizationError) throw organizationError;
      if (!organizationRow) throw new Error("Organizace nebyla nalezena.");

      const [{ data: childRows, error: childrenError }, { data: membershipRows, error: membershipError }] =
        await Promise.all([
          supabase
            .from("organizations")
            .select("id, name, org_type, status, license_status, contact_name, contact_email")
            .eq("parent_organization_id", organizationId)
            .order("name", { ascending: true }),
          supabase
            .from("organization_members")
            .select("user_id, role_in_org, status, created_at")
            .eq("organization_id", organizationId)
            .eq("role_in_org", "organization_admin")
            .eq("status", "active")
            .order("created_at", { ascending: true }),
        ]);

      if (childrenError) throw childrenError;
      if (membershipError) throw membershipError;

      const userIds = (membershipRows || []).map((row) => row.user_id);
      let profileRows = [];

      if (userIds.length > 0) {
        const { data, error: profilesError } = await supabase
          .from("profiles")
          .select("id, full_name, email, is_active")
          .in("id", userIds);

        if (profilesError) throw profilesError;
        profileRows = data || [];
      }

      const profileById = new Map(profileRows.map((profile) => [profile.id, profile]));
      const adminRows = (membershipRows || []).map((membership) => ({
        ...membership,
        profile: profileById.get(membership.user_id) || null,
      }));

      setOrganization(organizationRow);
      setChildren(childRows || []);
      setAdmins(adminRows);
    } catch (loadError) {
      setError(loadError?.message || "Detail obce se nepodařilo načíst.");
      setOrganization(null);
      setChildren([]);
      setAdmins([]);
    } finally {
      setLoading(false);
    }
  }

  const identifier = useMemo(
    () => organization?.legal_identifier || organization?.ico || "—",
    [organization]
  );

  return (
    <RequirePlatformAdmin>
      <div className="min-h-screen bg-slate-50">
        <PortalHeader title="Admin • detail zákazníka" />

        <main className="mx-auto max-w-[1180px] px-4 py-8 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <Link
                href="/portal/admin/obce"
                className="text-sm font-bold text-slate-600 underline underline-offset-4"
              >
                ← Zpět na zákazníky
              </Link>
              <h1 className="mt-2 text-3xl font-black text-navy-900">
                {organization?.name || "Detail zákazníka"}
              </h1>
              {organization ? (
                <p className="mt-1 text-sm text-slate-600">
                  {ORGANIZATION_LABELS[organization.org_type] || organization.org_type} • registrační číslo {organization.registration_number || "—"}
                </p>
              ) : null}
            </div>

            <Button type="button" variant="secondary" onClick={loadDetail} disabled={loading}>
              {loading ? "Načítám…" : "Obnovit"}
            </Button>
          </div>

          {error ? <Alert variant="error" className="mt-5">{error}</Alert> : null}
          {loading ? <Card className="mt-5 p-6">Načítám detail…</Card> : null}

          {!loading && organization ? (
            <>
              <section className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <InfoItem label="Stav">
                  {organization.license_status === "active" ? "Aktivní" : "Čeká na schválení"}
                </InfoItem>
                <InfoItem label="Licence">
                  {LICENSE_LABELS[organization.license_plan] || organization.license_plan || "—"}
                </InfoItem>
                <InfoItem label="Platnost od">{formatDate(organization.license_started_at)}</InfoItem>
                <InfoItem label="Platnost do">{formatDate(organization.license_valid_until)}</InfoItem>
              </section>

              <Card className="mt-5 p-6">
                <h2 className="text-xl font-black text-navy-900">Základní údaje</h2>
                <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <InfoItem label="IČO">{identifier}</InfoItem>
                  <InfoItem label="Adresa">{organization.registered_address}</InfoItem>
                  <InfoItem label="Kontaktní osoba">{organization.contact_name}</InfoItem>
                  <InfoItem label="E-mail">
                    {organization.contact_email ? (
                      <a href={`mailto:${organization.contact_email}`} className="underline underline-offset-4">
                        {organization.contact_email}
                      </a>
                    ) : "—"}
                  </InfoItem>
                  <InfoItem label="Telefon">
                    {organization.contact_phone ? (
                      <a href={`tel:${organization.contact_phone}`} className="underline underline-offset-4">
                        {organization.contact_phone}
                      </a>
                    ) : "—"}
                  </InfoItem>
                  <InfoItem label="Založeno">{formatDate(organization.created_at)}</InfoItem>
                </div>
              </Card>

              <Card className="mt-5 p-6">
                <h2 className="text-xl font-black text-navy-900">Licence a aktivace</h2>
                <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <InfoItem label="Smlouva">
                    {CONTRACT_LABELS[organization.contract_status] || organization.contract_status || "—"}
                  </InfoItem>
                  <InfoItem label="Fakturace">
                    {BILLING_LABELS[organization.billing_status] || organization.billing_status || "—"}
                  </InfoItem>
                  <InfoItem label="Aktivováno">{formatDate(organization.activated_at)}</InfoItem>
                  <InfoItem label="Technický stav">{organization.status || "—"}</InfoItem>
                </div>
              </Card>

              <Card className="mt-5 overflow-hidden p-0">
                <div className="border-b border-slate-200 p-5">
                  <h2 className="text-xl font-black text-navy-900">Správci obce</h2>
                  <p className="mt-1 text-sm text-slate-600">Aktivní uživatelé s rolí administrátora této organizace.</p>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Jméno</TableHead>
                      <TableHead>E-mail</TableHead>
                      <TableHead>Stav účtu</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {admins.length === 0 ? (
                      <TableRow><TableCell colSpan={3}>Obec zatím nemá přiřazeného správce.</TableCell></TableRow>
                    ) : null}
                    {admins.map((admin) => (
                      <TableRow key={admin.user_id}>
                        <TableCell className="font-semibold">{admin.profile?.full_name || "—"}</TableCell>
                        <TableCell>
                          {admin.profile?.email ? (
                            <a href={`mailto:${admin.profile.email}`} className="underline underline-offset-4">
                              {admin.profile.email}
                            </a>
                          ) : "—"}
                        </TableCell>
                        <TableCell>{admin.profile?.is_active === false ? "Neaktivní" : "Aktivní"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>

              <Card className="mt-5 overflow-hidden p-0">
                <div className="border-b border-slate-200 p-5">
                  <h2 className="text-xl font-black text-navy-900">Organizace pod obcí</h2>
                  <p className="mt-1 text-sm text-slate-600">Školy, spolky a další organizace navázané na obec.</p>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Typ</TableHead>
                      <TableHead>Název</TableHead>
                      <TableHead>Kontakt</TableHead>
                      <TableHead>Stav</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {children.length === 0 ? (
                      <TableRow><TableCell colSpan={4}>Pod obcí zatím nejsou žádné organizace.</TableCell></TableRow>
                    ) : null}
                    {children.map((child) => (
                      <TableRow key={child.id}>
                        <TableCell>{ORGANIZATION_LABELS[child.org_type] || child.org_type}</TableCell>
                        <TableCell className="font-semibold">{child.name}</TableCell>
                        <TableCell>
                          {child.contact_name ? <div>{child.contact_name}</div> : null}
                          {child.contact_email ? (
                            <a href={`mailto:${child.contact_email}`} className="text-sm underline underline-offset-4">
                              {child.contact_email}
                            </a>
                          ) : null}
                          {!child.contact_name && !child.contact_email ? "—" : null}
                        </TableCell>
                        <TableCell>{child.status === "active" ? "Aktivní" : child.status || "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </>
          ) : null}
        </main>
      </div>
    </RequirePlatformAdmin>
  );
}
