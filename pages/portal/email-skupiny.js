import { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import PortalHeader from "../../components/PortalHeader";
import RequirePlatformAdmin from "../../components/RequirePlatformAdmin";
import { cn } from "../../lib/utils";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Alert } from "../../components/ui/alert";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../../components/ui/table";

const GROUP_LABELS = {
  ucitele: "Učitelé",
  "druhy-stupen": "2. stupeň",
  "prvni-stupen": "1. stupeň",
  rodice: "Rodiče",
  seniori: "Senioři",
  komunita: "Komunita",
  "karierni-poradenstvi": "Kariérní poradenství",
  "filmovy-klub": "Filmový klub",
  wellbeing: "Wellbeing",
  "english-live": "English Live",
  "smart-city": "Smart City klub",
  "ctenarsky-klub": "Čtenářský klub",
  "veda-a-objevy": "Věda a objevy",
  "svet-v-souvislostech": "Svět v souvislostech",
  "zajmove-skupiny": "Zájmové skupiny",
};

export default function EmailSkupinyPage() {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [countsLoading, setCountsLoading] = useState(true);

  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [error, setError] = useState("");

  const selectedLabel = useMemo(() => {
    if (!selectedGroup) return "";
    return GROUP_LABELS[selectedGroup] || selectedGroup;
  }, [selectedGroup]);

  async function loadGroups() {
    setCountsLoading(true);
    try {
      const res = await fetch("/api/admin/group-counts");
      const json = await res.json();

      const safeGroups = Array.isArray(json) ? json : [];
      setGroups(safeGroups);

      if (safeGroups.length > 0) {
        const first = safeGroups[0].slug;
        setSelectedGroup(first);
        await loadUsers(first);
      }
    } finally {
      setCountsLoading(false);
    }
  }

  async function loadUsers(groupSlug) {
    setUsersLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/group-users?group=${encodeURIComponent(groupSlug)}`);
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json?.error || "Nepodařilo se načíst příjemce.");
      }

      const safeUsers = Array.isArray(json?.users) ? json.users : [];
      setUsers(safeUsers);
    } catch (err) {
      setUsers([]);
      setError(err.message || "Nepodařilo se načíst příjemce.");
    } finally {
      setUsersLoading(false);
    }
  }

  async function handleSelectGroup(groupSlug) {
    setSelectedGroup(groupSlug);
    await loadUsers(groupSlug);
  }

  async function copyEmails() {
    const emails = users
      .map((u) => u.email)
      .filter(Boolean)
      .join(", ");

    if (!emails) {
      alert("Ve vybrané skupině nejsou žádné e-maily.");
      return;
    }

    try {
      await navigator.clipboard.writeText(emails);
      alert("E-maily zkopírovány");
    } catch {
      alert("Nepodařilo se kopírovat");
    }
  }

  useEffect(() => {
    loadGroups();
  }, []);

  return (
    <RequirePlatformAdmin>
      <Head>
        <title>E-mailové skupiny | ARCHIMEDES Live</title>
      </Head>

      <PortalHeader />

      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-[1200px] px-5 py-8">
          <div>
            <h1 className="text-2xl font-black text-navy-900">E-mailové skupiny</h1>
            <p className="mt-1.5 text-muted">Vyber skupinu a pošli jí pozvánku na vysílání.</p>
          </div>

          <section className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[300px_1fr]">
            <Card className="p-2.5">
              {countsLoading ? (
                <div className="p-2 text-muted">Načítám…</div>
              ) : (
                groups.map((group) => {
                  const active = group.slug === selectedGroup;

                  return (
                    <button
                      key={group.slug}
                      onClick={() => handleSelectGroup(group.slug)}
                      className={cn(
                        "mb-2 flex w-full items-center justify-between rounded-xl border border-slate-200 px-3 py-2.5",
                        active ? "border-navy-900 bg-navy-900 text-white" : "bg-white text-navy-900"
                      )}
                    >
                      <span>{GROUP_LABELS[group.slug] || group.slug}</span>
                      <b>{group.count}</b>
                    </button>
                  );
                })
              )}
            </Card>

            <Card className="p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-navy-900">{selectedLabel}</h2>
                <Button onClick={copyEmails} disabled={!users.length} variant="secondary" size="sm">
                  Kopírovat e-maily
                </Button>
              </div>

              {error ? (
                <Alert variant="error" className="mt-2.5">
                  {error}
                </Alert>
              ) : null}

              <Table className="mt-5">
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Notifikace</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usersLoading ? (
                    <TableRow>
                      <TableCell colSpan={2}>Načítám…</TableCell>
                    </TableRow>
                  ) : users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={2}>Žádní uživatelé</TableCell>
                    </TableRow>
                  ) : (
                    users.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell>{u.email}</TableCell>
                        <TableCell>
                          {u.email_notifications_enabled === false ? "Vypnuto" : "Zapnuto"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          </section>
        </div>
      </main>
    </RequirePlatformAdmin>
  );
}
