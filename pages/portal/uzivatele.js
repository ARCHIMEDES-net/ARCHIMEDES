import { useEffect, useState } from "react";
import RequireAuth from "../../components/RequireAuth";
import PortalHeader from "../../components/PortalHeader";
import { supabase } from "../../lib/supabaseClient";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Select } from "../../components/ui/select";
import { Label } from "../../components/ui/label";
import { Alert } from "../../components/ui/alert";
import { Badge } from "../../components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../../components/ui/table";

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

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, active_organization_id")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      const activeOrganizationId = profile?.active_organization_id || null;

      let membership = null;

      if (activeOrganizationId) {
        const { data: activeMembership, error: activeMembershipError } =
          await supabase
            .from("organization_members")
            .select("organization_id, role_in_org, status")
            .eq("user_id", user.id)
            .eq("organization_id", activeOrganizationId)
            .eq("status", "active")
            .maybeSingle();

        if (activeMembershipError) throw activeMembershipError;
        membership = activeMembership || null;
      }

      if (!membership) {
        const { data: fallbackMembership, error: fallbackMembershipError } =
          await supabase
            .from("organization_members")
            .select("organization_id, role_in_org, status")
            .eq("user_id", user.id)
            .eq("status", "active")
            .limit(1000);

        if (fallbackMembershipError) throw fallbackMembershipError;

        const fallbackRows = Array.isArray(fallbackMembership)
          ? fallbackMembership
          : [];

        if (activeOrganizationId) {
          membership =
            fallbackRows.find(
              (row) => row.organization_id === activeOrganizationId
            ) || null;
        }

        if (!membership && fallbackRows.length === 1) {
          membership = fallbackRows[0];
        }
      }

      if (!membership) {
        throw new Error("Uživatel není přiřazen k žádné organizaci.");
      }

      const { data: organization, error: organizationError } = await supabase
        .from("organizations")
        .select("id, name, join_code")
        .eq("id", membership.organization_id)
        .maybeSingle();

      if (organizationError) throw organizationError;
      if (!organization) throw new Error("Organizace uživatele nebyla nalezena.");

      setOrganizationId(organization.id);
      setOrganizationName(organization.name || "");
      setOrganizationJoinCode(organization.join_code || "");

      const admin = membership.role_in_org === "organization_admin";
      setIsOrgAdmin(admin);

      if (!admin) {
        setRows([]);
        return;
      }

      const { data: members, error: membersError } = await supabase
        .from("organization_members")
        .select("user_id, role_in_org, status, created_at")
        .eq("organization_id", organization.id)
        .order("created_at", { ascending: false })
        .limit(1000);

      if (membersError) throw membersError;

      const memberRows = Array.isArray(members) ? members : [];
      const userIds = [...new Set(memberRows.map((m) => String(m.user_id)).filter(Boolean))];

      let profilesById = {};

      if (userIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("id, full_name, email, is_active")
          .in("id", userIds)
          .limit(1000);

        if (profilesError) throw profilesError;

        (profiles || []).forEach((p) => {
          profilesById[String(p.id)] = p;
        });
      }

      const mergedRows = memberRows.map((m) => {
        const profileRow = profilesById[String(m.user_id)] || null;

        return {
          id: String(m.user_id),
          full_name: profileRow?.full_name || "",
          email: profileRow?.email || "",
          is_active: m.status === "active",
          role_in_org: m.role_in_org || "member",
          created_at: m.created_at || null,
        };
      });

      setRows(mergedRows);
    } catch (e) {
      setRows([]);
      setError(e.message || "Nepodařilo se načíst uživatele organizace.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateUser(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      if (!isOrgAdmin) {
        throw new Error("Tuto akci může provádět jen administrátor organizace.");
      }

      if (!newEmail.trim()) throw new Error("Vyplňte e-mail.");
      if (!newFullName.trim()) throw new Error("Vyplňte jméno a příjmení.");

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) throw sessionError;

      const accessToken = session?.access_token;
      const user = session?.user;

      if (!user || !accessToken) {
        throw new Error("Nejste přihlášen.");
      }

      const response = await fetch("/api/invite-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          email: newEmail.trim().toLowerCase(),
          fullName: newFullName.trim(),
          role: newRole,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error || "Nepodařilo se vytvořit uživatele.");
      }

      setNewEmail("");
      setNewFullName("");
      setNewRole("member");
      setMessage("Pozvánka byla odeslána a uživatel byl přidán do organizace.");

      await loadAll();
    } catch (e) {
      setError(e.message || "Nepodařilo se vytvořit uživatele.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(row) {
    setError("");
    setMessage("");

    try {
      const nextStatus = row.is_active ? "inactive" : "active";

      const { error: updateMembershipError } = await supabase
        .from("organization_members")
        .update({ status: nextStatus })
        .eq("organization_id", organizationId)
        .eq("user_id", row.id);

      if (updateMembershipError) throw updateMembershipError;

      const { error: updateProfileError } = await supabase
        .from("profiles")
        .update({ is_active: !row.is_active })
        .eq("id", row.id);

      if (updateProfileError) throw updateProfileError;

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
      if (!organizationJoinCode) return;
      await navigator.clipboard.writeText(organizationJoinCode);
      setCopyMessage("Kód organizace byl zkopírován.");
      setTimeout(() => setCopyMessage(""), 1800);
    } catch (_e) {
      setCopyMessage("Kód zkopírujte ručně.");
      setTimeout(() => setCopyMessage(""), 1800);
    }
  }

  function roleLabel(value) {
    if (value === "organization_admin") return "Administrátor organizace";
    return "Člen organizace";
  }

  if (loading) {
    return (
      <RequireAuth>
        <div className="min-h-screen bg-slate-50">
          <PortalHeader />
          <main className="mx-auto max-w-[1100px] px-4 py-8 text-muted">
            Načítám uživatele organizace…
          </main>
        </div>
      </RequireAuth>
    );
  }

  if (!isOrgAdmin) {
    return (
      <RequireAuth>
        <div className="min-h-screen bg-slate-50">
          <PortalHeader />
          <main className="mx-auto max-w-[900px] px-4 py-8">
            <Card className="p-6">
              <h1 className="text-2xl font-black text-navy-900">Uživatelé organizace</h1>
              <p className="mt-2 text-muted">
                Tato sekce je dostupná pouze administrátorovi organizace.
              </p>
              {organizationName ? (
                <p className="mt-2 text-sm text-slate-500">
                  Vaše organizace: <strong>{organizationName}</strong>
                </p>
              ) : null}
            </Card>
          </main>
        </div>
      </RequireAuth>
    );
  }

  return (
    <RequireAuth>
      <div className="min-h-screen bg-slate-50">
        <PortalHeader />

        <main className="mx-auto max-w-[1100px] px-4 py-8">
          <Card className="mb-5 p-6">
            <h1 className="text-[32px] font-black text-navy-900">Uživatelé organizace</h1>

            <p className="mt-2 text-muted">
              Zde může administrátor organizace vytvářet a spravovat přístupy pro další uživatele.
            </p>

            {organizationName ? (
              <p className="mt-2 text-sm text-slate-500">
                Organizace: <strong>{organizationName}</strong>
              </p>
            ) : null}

            {organizationJoinCode ? (
              <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-3.5">
                <div className="mb-1.5 text-sm text-slate-500">Kód organizace</div>
                <div className="mb-2 font-mono text-xl font-bold tracking-[0.04em] text-navy-900">
                  {organizationJoinCode}
                </div>

                <div className="mb-3 text-sm text-slate-600">
                  Kolegové se mohou připojit sami přes stránku <strong>/join</strong> pomocí tohoto
                  kódu, nebo jim můžete poslat pozvánku e-mailem níže.
                </div>

                <Button type="button" variant="secondary" size="sm" onClick={handleCopyCode}>
                  Zkopírovat kód
                </Button>

                {copyMessage ? <div className="mt-2.5 text-sm text-emerald-700">{copyMessage}</div> : null}
              </div>
            ) : null}

            <Alert variant="neutral" className="mt-4">
              Doporučený postup: nejprve pošlete kolegům <strong>kód organizace</strong> a až když
              budete potřebovat, využijte pozvánku e-mailem pro konkrétního uživatele.
            </Alert>

            {error ? (
              <Alert variant="error" className="mt-4">
                Chyba: {error}
              </Alert>
            ) : null}

            {message ? (
              <Alert variant="success" className="mt-4">
                {message}
              </Alert>
            ) : null}

            <form onSubmit={handleCreateUser} className="mt-5">
              <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-[1.2fr_1.2fr_1fr_auto]">
                <div>
                  <Label>E-mail</Label>
                  <Input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="uzivatel@organizace.cz"
                  />
                </div>

                <div>
                  <Label>Jméno a příjmení</Label>
                  <Input
                    type="text"
                    value={newFullName}
                    onChange={(e) => setNewFullName(e.target.value)}
                    placeholder="Např. Jana Nováková"
                  />
                </div>

                <div>
                  <Label>Role</Label>
                  <Select value={newRole} onChange={(e) => setNewRole(e.target.value)}>
                    <option value="member">Člen organizace</option>
                    <option value="organization_admin">Administrátor organizace</option>
                  </Select>
                </div>

                <div>
                  <Button type="submit" disabled={saving} className="whitespace-nowrap">
                    {saving ? "Odesílám…" : "Přidat uživatele"}
                  </Button>
                </div>
              </div>
            </form>
          </Card>

          <Card>
            <CardContent>
              <h2 className="mb-4 text-xl font-black text-navy-900">Seznam uživatelů</h2>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Jméno</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Stav</TableHead>
                    <TableHead>Akce</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>
                        {row.full_name || "—"}
                        {row.id === currentUserId ? (
                          <Badge className="ml-2 bg-indigo-100 text-indigo-800">vy</Badge>
                        ) : null}
                      </TableCell>
                      <TableCell>{row.email || "—"}</TableCell>
                      <TableCell>{roleLabel(row.role_in_org)}</TableCell>
                      <TableCell>{row.is_active ? "Aktivní" : "Neaktivní"}</TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => toggleActive(row)}
                          disabled={row.id === currentUserId}
                        >
                          {row.is_active ? "Deaktivovat" : "Aktivovat"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}

                  {rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-slate-500">
                        Zatím zde nejsou žádní další uživatelé.
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </main>
      </div>
    </RequireAuth>
  );
}
