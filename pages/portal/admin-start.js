import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import RequirePlatformAdmin from "../../components/RequirePlatformAdmin";
import PortalHeader from "../../components/PortalHeader";

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

      <div style={{ padding: 20 }}>
        <h1>START objednávky & školy</h1>

        {loading && <p>Načítám…</p>}

        {!loading && (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th>Datum</th>
                <th>Škola</th>
                <th>Město</th>
                <th>Objednatel</th>
                <th>Admin</th>
                <th>Onboarding</th>
                <th>Uživatelé</th>
                <th>Organizace</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((r) => (
                <tr key={r.id} style={{ borderBottom: "1px solid #ddd" }}>
                  <td>
                    {new Date(r.submitted_at).toLocaleDateString()}
                  </td>

                  <td>{r.school_name}</td>

                  <td>{r.city}</td>

                  <td>
                    {r.contact_name}
                    <br />
                    <small>{r.email}</small>
                  </td>

                  <td>
                    {r.admin_email}
                    {r.adminUserId ? " ✅" : " ❌"}
                  </td>

                  <td>
                    {r.onboarding_status === "completed" && "✅ hotovo"}
                    {r.onboarding_status === "pending" && "⏳ čeká"}
                    {!r.onboarding_status && "❌ chyba"}
                  </td>

                  <td>{r.usersCount}</td>

                  <td>
                    {r.organization ? "✅ vytvořena" : "❌ nevznikla"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </RequirePlatformAdmin>
  );
}
