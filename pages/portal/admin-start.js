import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Clock } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import RequirePlatformAdmin from "../../components/RequirePlatformAdmin";
import PortalHeader from "../../components/PortalHeader";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../../components/ui/table";

export default function AdminStartPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);

    // 1. objednávky
    const { data: orders, error } = await supabase
      .from("orders_start")
      .select("*")
      .order("submitted_at", { ascending: false });

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    // 2. načti organizace
    const orgIds = orders
      .map((o) => o.organization_id)
      .filter(Boolean);

    const { data: orgs } = await supabase
      .from("organizations")
      .select("*")
      .in("id", orgIds.length ? orgIds : [""]);

    // 3. načti členy
    const { data: members } = await supabase
      .from("organization_members")
      .select("*")
      .in("organization_id", orgIds.length ? orgIds : [""]);

    // 4. spojení dat
    const result = orders.map((o) => {
      const org = orgs?.find((x) => x.id === o.organization_id);

      const orgMembers =
        members?.filter((m) => m.organization_id === o.organization_id) || [];

      const admin = orgMembers.find(
        (m) => m.role_in_org === "organization_admin"
      );

      return {
        ...o,
        organization: org,
        usersCount: orgMembers.length,
        adminUserId: admin?.user_id || null,
      };
    });

    setRows(result);
    setLoading(false);
  }

  return (
    <RequirePlatformAdmin>
      <PortalHeader />

      <div className="mx-auto max-w-[1200px] px-5 py-6">
        <h1 className="text-2xl font-black text-navy-900">START objednávky &amp; školy</h1>

        {loading ? <p className="mt-4 text-muted">Načítám…</p> : null}

        {!loading && (
          <div className="mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Datum</TableHead>
                  <TableHead>Škola</TableHead>
                  <TableHead>Město</TableHead>
                  <TableHead>Objednatel</TableHead>
                  <TableHead>Admin</TableHead>
                  <TableHead>Onboarding</TableHead>
                  <TableHead>Uživatelé</TableHead>
                  <TableHead>Organizace</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{new Date(r.submitted_at).toLocaleDateString()}</TableCell>
                    <TableCell>{r.school_name}</TableCell>
                    <TableCell>{r.city}</TableCell>
                    <TableCell>
                      {r.contact_name}
                      <br />
                      <span className="text-xs text-slate-500">{r.email}</span>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1.5">
                        {r.admin_email}
                        {r.adminUserId ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-label="admin účet existuje" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" aria-label="admin účet chybí" />
                        )}
                      </span>
                    </TableCell>
                    <TableCell>
                      {r.onboarding_status === "completed" ? (
                        <span className="inline-flex items-center gap-1.5 text-emerald-700">
                          <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> hotovo
                        </span>
                      ) : r.onboarding_status === "pending" ? (
                        <span className="inline-flex items-center gap-1.5 text-amber-600">
                          <Clock className="h-4 w-4" aria-hidden="true" /> čeká
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-red-600">
                          <XCircle className="h-4 w-4" aria-hidden="true" /> chyba
                        </span>
                      )}
                    </TableCell>
                    <TableCell>{r.usersCount}</TableCell>
                    <TableCell>
                      {r.organization ? (
                        <span className="inline-flex items-center gap-1.5 text-emerald-700">
                          <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> vytvořena
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-red-600">
                          <XCircle className="h-4 w-4" aria-hidden="true" /> nevznikla
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </RequirePlatformAdmin>
  );
}
