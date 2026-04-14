import { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import PortalHeader from "../../components/PortalHeader";
import RequirePlatformAdmin from "../../components/RequirePlatformAdmin";

const GROUPS = [
  { slug: "ucitele", label: "Učitelé" },
  { slug: "druhy-stupen", label: "2. stupeň" },
  { slug: "prvni-stupen", label: "1. stupeň" },
  { slug: "rodice", label: "Rodiče" },
  { slug: "seniori", label: "Senioři" },
  { slug: "komunita", label: "Komunita" },
  { slug: "karierni-poradenstvi", label: "Kariérní poradenství" },
  { slug: "filmovy-klub", label: "Filmový klub" },
  { slug: "wellbeing", label: "Wellbeing" },
  { slug: "english-live", label: "English Live" },
  { slug: "smart-city", label: "Smart City klub" },
  { slug: "ctenarsky-klub", label: "Čtenářský klub" },
  { slug: "veda-a-objevy", label: "Věda a objevy" },
  { slug: "svet-v-souvislostech", label: "Svět v souvislostech" },
  { slug: "zajmove-skupiny", label: "Zájmové skupiny" },
];

export default function EmailSkupinyPage() {
  const [selectedGroup, setSelectedGroup] = useState(GROUPS[0].slug);
  const [groupCounts, setGroupCounts] = useState({});
  const [countsLoading, setCountsLoading] = useState(true);

  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [error, setError] = useState("");

  const selectedLabel = useMemo(() => {
    return GROUPS.find((g) => g.slug === selectedGroup)?.label || selectedGroup;
  }, [selectedGroup]);

  async function loadGroupCounts() {
    setCountsLoading(true);
    try {
      const results = await Promise.all(
        GROUPS.map(async (group) => {
          try {
            const res = await fetch(`/api/admin/group-users?group=${encodeURIComponent(group.slug)}`);
            const json = await res.json();
            return [group.slug, json?.count || 0];
          } catch {
            return [group.slug, 0];
          }
        })
      );

      const countsMap = Object.fromEntries(results);
      setGroupCounts(countsMap);
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
      alert("Ve vybrané skupině nejsou žádné e-maily ke kopírování.");
      return;
    }

    try {
      await navigator.clipboard.writeText(emails);
      alert("E-mailové adresy byly zkopírovány.");
    } catch {
      alert("Nepodařilo se zkopírovat e-maily.");
    }
  }

  useEffect(() => {
    loadGroupCounts();
    loadUsers(selectedGroup);
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
            <div>
              <p className="eyebrow">Admin</p>
              <h1>E-mailové skupiny</h1>
              <p className="lead">
                Přehled skupin podle zájmu uživatelů. Vyberte skupinu a zobrazte si,
                komu lze poslat pozvánku na vysílání.
              </p>
            </div>
          </div>

          <section className="layout">
            <aside className="sidebarCard">
              <div className="sidebarHeader">
                <h2>Skupiny</h2>
                <button
                  type="button"
                  className="ghostBtn"
                  onClick={loadGroupCounts}
                  disabled={countsLoading}
                >
                  {countsLoading ? "Načítám..." : "Obnovit"}
                </button>
              </div>

              <div className="groupList">
                {GROUPS.map((group) => {
                  const active = group.slug === selectedGroup;
                  const count = groupCounts[group.slug];

                  return (
                    <button
                      key={group.slug}
                      type="button"
                      className={`groupItem ${active ? "active" : ""}`}
                      onClick={() => handleSelectGroup(group.slug)}
                    >
                      <span className="groupLabel">{group.label}</span>
                      <span className="groupCount">
                        {countsLoading ? "…" : count ?? 0}
                      </span>
                    </button>
                  );
                })}
              </div>
            </aside>

            <section className="contentCard">
              <div className="contentHeader">
                <div>
                  <p className="sectionKicker">Vybraná skupina</p>
                  <h2>{selectedLabel}</h2>
                  <p className="sectionSub">
                    {usersLoading
                      ? "Načítám příjemce…"
                      : `${users.length} příjemců se zapnutými nebo dosud nenastavenými e-mailovými notifikacemi.`}
                  </p>
                </div>

                <button
                  type="button"
                  className="primaryBtn"
                  onClick={copyEmails}
                  disabled={usersLoading || users.length === 0}
                >
                  Kopírovat e-maily
                </button>
              </div>

              {error ? <div className="errorBox">{error}</div> : null}

              <div className="tableWrap">
                <table>
                  <thead>
                    <tr>
                      <th>E-mail</th>
                      <th>Notifikace</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersLoading ? (
                      <tr>
                        <td colSpan={2} className="emptyCell">
                          Načítám…
                        </td>
                      </tr>
                    ) : users.length === 0 ? (
                      <tr>
                        <td colSpan={2} className="emptyCell">
                          Ve skupině zatím není žádný příjemce.
                        </td>
                      </tr>
                    ) : (
                      users.map((user) => (
                        <tr key={user.id}>
                          <td>{user.email || "—"}</td>
                          <td>
                            {user.email_notifications_enabled === false
                              ? "Vypnuto"
                              : user.email_notifications_enabled === true
                              ? "Zapnuto"
                              : "Nenastaveno"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </section>
        </div>
      </main>

      <style jsx>{`
        .pageWrap {
          min-height: 100vh;
          background: #f5f7fb;
        }

        .pageInner {
          max-width: 1320px;
          margin: 0 auto;
          padding: 32px 20px 48px;
        }

        .hero {
          margin-bottom: 20px;
        }

        .eyebrow {
          margin: 0 0 8px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #5b6474;
        }

        h1 {
          margin: 0 0 10px;
          font-size: 36px;
          line-height: 1.1;
          color: #0f172a;
        }

        .lead {
          margin: 0;
          max-width: 760px;
          font-size: 16px;
          line-height: 1.6;
          color: #475569;
        }

        .layout {
          display: grid;
          grid-template-columns: 340px 1fr;
          gap: 20px;
          align-items: start;
        }

        .sidebarCard,
        .contentCard {
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 24px;
          box-shadow: 0 12px 32px rgba(15, 23, 42, 0.06);
        }

        .sidebarCard {
          padding: 18px;
          position: sticky;
          top: 20px;
        }

        .contentCard {
          padding: 22px;
        }

        .sidebarHeader,
        .contentHeader {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
        }

        .sidebarHeader {
          margin-bottom: 14px;
        }

        h2 {
          margin: 0;
          font-size: 24px;
          color: #0f172a;
        }

        .sectionKicker {
          margin: 0 0 6px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #64748b;
        }

        .sectionSub {
          margin: 8px 0 0;
          color: #64748b;
          line-height: 1.5;
        }

        .groupList {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .groupItem {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 14px 16px;
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          background: #fff;
          cursor: pointer;
          text-align: left;
          transition: all 0.18s ease;
        }

        .groupItem:hover {
          border-color: #cbd5e1;
          transform: translateY(-1px);
        }

        .groupItem.active {
          background: #0f172a;
          border-color: #0f172a;
          color: #fff;
        }

        .groupLabel {
          font-weight: 600;
        }

        .groupCount {
          min-width: 34px;
          height: 34px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          background: rgba(15, 23, 42, 0.08);
          color: #0f172a;
          font-weight: 700;
          font-size: 13px;
        }

        .groupItem.active .groupCount {
          background: rgba(255, 255, 255, 0.16);
          color: #fff;
        }

        .ghostBtn,
        .primaryBtn {
          appearance: none;
          border: none;
          cursor: pointer;
          border-radius: 999px;
          padding: 11px 16px;
          font-weight: 700;
          font-size: 14px;
          transition: all 0.18s ease;
        }

        .ghostBtn {
          background: #eef2f7;
          color: #0f172a;
        }

        .ghostBtn:hover {
          background: #e2e8f0;
        }

        .primaryBtn {
          background: #0f172a;
          color: #fff;
        }

        .primaryBtn:hover {
          opacity: 0.92;
        }

        .primaryBtn:disabled,
        .ghostBtn:disabled {
          opacity: 0.55;
          cursor: default;
        }

        .errorBox {
          margin: 18px 0 0;
          padding: 14px 16px;
          border-radius: 16px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #991b1b;
          font-weight: 600;
        }

        .tableWrap {
          margin-top: 22px;
          overflow: hidden;
          border: 1px solid #e5e7eb;
          border-radius: 18px;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          background: #fff;
        }

        thead {
          background: #f8fafc;
        }

        th,
        td {
          padding: 14px 16px;
          text-align: left;
          border-bottom: 1px solid #e5e7eb;
          font-size: 14px;
        }

        th {
          color: #334155;
          font-weight: 700;
        }

        td {
          color: #0f172a;
        }

        tbody tr:last-child td {
          border-bottom: none;
        }

        .emptyCell {
          text-align: center;
          color: #64748b;
          padding: 28px 16px;
        }

        @media (max-width: 960px) {
          .layout {
            grid-template-columns: 1fr;
          }

          .sidebarCard {
            position: static;
          }

          .contentHeader,
          .sidebarHeader {
            flex-direction: column;
            align-items: stretch;
          }

          .primaryBtn,
          .ghostBtn {
            width: 100%;
          }
        }
      `}</style>
    </RequirePlatformAdmin>
  );
}
