// pages/portal/uzivatele.js

import { useEffect, useState } from "react";
import RequireAuth from "../../components/RequireAuth";
import PortalHeader from "../../components/PortalHeader";
import { supabase } from "../../lib/supabaseClient";

export default function UzivateleSkolyPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isOrgAdmin, setIsOrgAdmin] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [organizationId, setOrganizationId] = useState(null);
  const [organizationName, setOrganizationName] = useState("");
  const [organizationJoinCode, setOrganizationJoinCode] = useState("");

  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [copyMessage, setCopyMessage] = useState("");

  const [newEmail, setNewEmail] = useState("");
  const [newFullName, setNewFullName] = useState("");
  const [newRole, setNewRole] = useState("member");

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    setLoading(true);
    setError("");
    setMessage("");
    setCopyMessage("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) throw new Error("Uživatel není přihlášen.");

      setCurrentUserId(user.id);

      const { data: membership, error: membershipError } = await supabase
        .from("organization_members")
        .select("organization_id, role_in_org, status")
        .eq("user_id", user.id)
        .eq("status", "active")
        .maybeSingle();

      if (membershipError) throw membershipError;
      if (!membership) throw new Error("Uživatel není přiřazen k žádné organizaci.");

      const { data: organization, error: organizationError } = await supabase
        .from("organizations")
        .select("id, name, join_code")
        .eq("id", membership.organization_id)
        .maybeSingle();

      if (organizationError) throw organizationError;
      if (!organization) throw new Error("Organizace nebyla nalezena.");

      setOrganizationId(organization.id);
      setOrganizationName(organization.name || "");
      setOrganizationJoinCode(organization.join_code || "");

      const admin = membership.role_in_org === "organization_admin";
      setIsOrgAdmin(admin);

      if (!admin) {
        setRows([]);
        setLoading(false);
        return;
      }

      const { data: members, error: membersError } = await supabase
        .from("organization_members")
        .select("user_id, role_in_org, status, created_at")
        .eq("organization_id", organization.id)
        .order("created_at", { ascending: false });

      if (membersError) throw membersError;

      const userIds = (members || []).map((m) => String(m.user_id));

      let profilesById = {};

      if (userIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("id, full_name, email, is_active")
          .in("id", userIds);

        if (profilesError) throw profilesError;

        (profiles || []).forEach((p) => {
          profilesById[String(p.id)] = p;
        });
      }

      const mergedRows = (members || []).map((m) => {
        const profile = profilesById[String(m.user_id)];

        return {
          id: m.user_id,
          full_name: profile?.full_name || "",
          email: profile?.email || "",
          is_active: m.status === "active",
          role_in_org: m.role_in_org,
          created_at: m.created_at,
        };
      });

      setRows(mergedRows);
    } catch (e) {
      setError(e.message || "Nepodařilo se načíst uživatele.");
    } finally {
      setLoading(false);
    }
  }

  async function toggleActive(row) {
    setError("");
    setMessage("");

    try {
      const nextStatus = row.is_active ? "inactive" : "active";

      const { error } = await supabase
        .from("organization_members")
        .update({ status: nextStatus })
        .eq("organization_id", organizationId)
        .eq("user_id", row.id);

      if (error) throw error;

      setMessage(
        row.is_active
          ? "Uživatel byl deaktivován."
          : "Uživatel byl znovu aktivován."
      );

      await loadAll();
    } catch (e) {
      setError(e.message || "Nepodařilo se změnit stav uživatele.");
    }
  }

  async function handleCopyCode() {
    try {
      await navigator.clipboard.writeText(organizationJoinCode);
      setCopyMessage("Kód byl zkopírován.");
      setTimeout(() => setCopyMessage(""), 2000);
    } catch {
      setCopyMessage("Kód zkopírujte ručně.");
    }
  }

  function roleLabel(role) {
    if (role === "organization_admin") return "Administrátor organizace";
    return "Člen organizace";
  }

  if (loading) {
    return (
      <RequireAuth>
        <PortalHeader />
        <main style={{ padding: 40 }}>Načítám…</main>
      </RequireAuth>
    );
  }

  return (
    <RequireAuth>
      <PortalHeader />

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: 32 }}>
        <h1>Uživatelé organizace</h1>

        {organizationJoinCode && (
          <div style={{ marginBottom: 24 }}>
            <strong>Kód organizace:</strong> {organizationJoinCode}
            <button
              onClick={handleCopyCode}
              style={{ marginLeft: 10 }}
            >
              Zkopírovat
            </button>
            {copyMessage && <div>{copyMessage}</div>}
          </div>
        )}

        {error && <div style={{ color: "red" }}>{error}</div>}
        {message && <div style={{ color: "green" }}>{message}</div>}

        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 20 }}>
          <thead>
            <tr>
              <th align="left">Jméno</th>
              <th align="left">E-mail</th>
              <th align="left">Role</th>
              <th align="left">Stav</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>
                  {row.full_name || "—"}
                  {row.id === currentUserId && (
                    <span style={{ marginLeft: 6, fontSize: 12 }}>vy</span>
                  )}
                </td>

                <td>{row.email || "—"}</td>

                <td>{roleLabel(row.role_in_org)}</td>

                <td>{row.is_active ? "Aktivní" : "Neaktivní"}</td>

                <td>
                  <button
                    disabled={row.id === currentUserId}
                    onClick={() => toggleActive(row)}
                  >
                    {row.is_active ? "Deaktivovat" : "Aktivovat"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </RequireAuth>
  );
}
