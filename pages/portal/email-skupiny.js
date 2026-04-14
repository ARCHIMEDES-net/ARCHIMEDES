import { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import PortalHeader from "../../components/PortalHeader";
import RequirePlatformAdmin from "../../components/RequirePlatformAdmin";

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

      <main className="pageWrap">
        <div className="pageInner">

          <div className="hero">
            <h1>E-mailové skupiny</h1>
            <p>Vyber skupinu a pošli jí pozvánku na vysílání.</p>
          </div>

          <section className="layout">

            {/* LEFT */}
            <aside className="sidebar">
              {countsLoading ? (
                <div>Načítám…</div>
              ) : (
                groups.map((group) => {
                  const active = group.slug === selectedGroup;

                  return (
                    <button
                      key={group.slug}
                      className={`item ${active ? "active" : ""}`}
                      onClick={() => handleSelectGroup(group.slug)}
                    >
                      <span>{GROUP_LABELS[group.slug] || group.slug}</span>
                      <b>{group.count}</b>
                    </button>
                  );
                })
              )}
            </aside>

            {/* RIGHT */}
            <section className="content">

              <div className="top">
                <h2>{selectedLabel}</h2>
                <button onClick={copyEmails} disabled={!users.length}>
                  Kopírovat e-maily
                </button>
              </div>

              {error && <div className="error">{error}</div>}

              <table>
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Notifikace</th>
                  </tr>
                </thead>
                <tbody>
                  {usersLoading ? (
                    <tr><td colSpan="2">Načítám…</td></tr>
                  ) : users.length === 0 ? (
                    <tr><td colSpan="2">Žádní uživatelé</td></tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u.id}>
                        <td>{u.email}</td>
                        <td>
                          {u.email_notifications_enabled === false
                            ? "Vypnuto"
                            : "Zapnuto"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

            </section>

          </section>
        </div>
      </main>

      <style jsx>{`
        .pageWrap { background:#f5f7fb; min-height:100vh; }
        .pageInner { max-width:1200px; margin:auto; padding:30px; }
        .hero h1 { margin:0; }
        .layout { display:grid; grid-template-columns:300px 1fr; gap:20px; }

        .sidebar { background:white; padding:10px; border-radius:12px; }
        .item {
          width:100%;
          display:flex;
          justify-content:space-between;
          padding:10px;
          margin-bottom:8px;
          border-radius:10px;
          border:1px solid #eee;
          cursor:pointer;
        }
        .item.active { background:black; color:white; }

        .content { background:white; padding:20px; border-radius:12px; }

        .top { display:flex; justify-content:space-between; align-items:center; }

        table { width:100%; margin-top:20px; border-collapse:collapse; }
        td, th { padding:10px; border-bottom:1px solid #eee; }

        .error { color:red; margin-top:10px; }
      `}</style>

    </RequirePlatformAdmin>
  );
}
