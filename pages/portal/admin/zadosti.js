import { useEffect, useState } from "react";
import RequireAuth from "../../../components/RequireAuth";
import PortalHeader from "../../../components/PortalHeader";
import { supabase } from "../../../lib/supabaseClient";

const STATUS_OPTIONS = [
  { value: "new", label: "Nová" },
  { value: "contacted", label: "Kontaktováno" },
  { value: "approved", label: "Schváleno" },
  { value: "rejected", label: "Zamítnuto" },
];

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("cs-CZ");
}

function mapLicenseTypeToOrgType(value) {
  const v = String(value || "").toLowerCase().trim();

  if (["skola", "škola", "school"].includes(v)) return "school";
  if (["obec", "mesto", "město", "municipality"].includes(v)) return "municipality";
  if (["senior", "senior-klub", "senior klub"].includes(v)) return "senior_club";

  return "community_center";
}

function makeJoinCode() {
  return "ORG-" + Math.random().toString(36).substring(2, 8).toUpperCase();
}

export default function AdminZadostiPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creatingOrgId, setCreatingOrgId] = useState("");
  const [savingId, setSavingId] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadRows();
  }, []);

  async function loadRows() {
    setLoading(true);

    const { data, error } = await supabase
      .from("access_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setError("Žádosti se nepodařilo načíst.");
      setLoading(false);
      return;
    }

    setRows(data || []);
    setLoading(false);
  }

  async function updateStatus(id, status) {
    setSavingId(id);

    const { error } = await supabase
      .from("access_requests")
      .update({ status })
      .eq("id", id);

    if (error) {
      setError("Stav se nepodařilo uložit.");
      setSavingId("");
      return;
    }

    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );

    setSavingId("");
  }

  async function createOrganizationFromRequest(row) {
    setCreatingOrgId(row.id);

    try {
      if (row.organization_id) {
        setMessage("Organizace už existuje.");
        return;
      }

      const joinCode = makeJoinCode();

      const { data: org, error: orgError } = await supabase
        .from("organizations")
        .insert({
          name: row.organization,
          org_type: mapLicenseTypeToOrgType(row.license_type),
          status: "active",
          join_code: joinCode,
        })
        .select()
        .single();

      if (orgError) throw orgError;

      await supabase
        .from("access_requests")
        .update({ organization_id: org.id })
        .eq("id", row.id);

      setRows((prev) =>
        prev.map((r) =>
          r.id === row.id ? { ...r, organization_id: org.id } : r
        )
      );

      setMessage(`Organizace "${org.name}" byla vytvořena.`);
    } catch (e) {
      setError("Nepodařilo se vytvořit organizaci.");
    }

    setCreatingOrgId("");
  }

  async function inviteOrganizationAdmin(row) {
    if (!row.organization_id) {
      alert("Nejdříve vytvoř organizaci.");
      return;
    }

    const email = prompt(
      "Zadej e-mail administrátora:",
      row.admin_invited_email || row.email || ""
    );

    if (!email) return;

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: "https://archimedeslive.com/login",
      },
    });

    if (error) {
      alert("Pozvánku se nepodařilo odeslat.");
      return;
    }

    await supabase
      .from("access_requests")
      .update({
        admin_invited_email: email,
      })
      .eq("id", row.id);

    setRows((prev) =>
      prev.map((r) =>
        r.id === row.id ? { ...r, admin_invited_email: email } : r
      )
    );

    setMessage(`Pozvánka odeslána na ${email}`);
  }

  const actionButtonStyle = {
    padding: "8px 10px",
    borderRadius: 10,
    border: "1px solid rgba(0,0,0,0.12)",
    background: "#fff",
    fontWeight: 700,
    cursor: "pointer",
  };

  return (
    <RequireAuth>
      <div style={{ minHeight: "100vh", background: "#f6f7fb" }}>
        <PortalHeader title="Admin • žádosti" />

        <main style={{ maxWidth: 1200, margin: "0 auto", padding: 40 }}>
          <h1>Žádosti o přístup</h1>

          {error && <div style={{ color: "red" }}>{error}</div>}
          {message && <div style={{ color: "green" }}>{message}</div>}

          <table style={{ width: "100%", marginTop: 20 }}>
            <thead>
              <tr>
                <th>Datum</th>
                <th>Jméno</th>
                <th>Organizace</th>
                <th>Email</th>
                <th>Stav</th>
                <th>Akce</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>{formatDate(row.created_at)}</td>

                  <td>{row.contact_name}</td>

                  <td>{row.organization}</td>

                  <td>{row.email}</td>

                  <td>
                    <select
                      value={row.status || "new"}
                      disabled={savingId === row.id}
                      onChange={(e) =>
                        updateStatus(row.id, e.target.value)
                      }
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <button
                        style={actionButtonStyle}
                        onClick={() => createOrganizationFromRequest(row)}
                        disabled={row.organization_id}
                      >
                        {row.organization_id
                          ? "Organizace existuje"
                          : "Vytvořit organizaci"}
                      </button>

                      <button
                        style={actionButtonStyle}
                        onClick={() => inviteOrganizationAdmin(row)}
                        disabled={!row.organization_id}
                      >
                        {row.admin_invited_email
                          ? "Pozvat znovu admina"
                          : "Pozvat administrátora"}
                      </button>

                      {row.admin_invited_email && (
                        <div style={{ fontSize: 12 }}>
                          Pozvánka: {row.admin_invited_email}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </main>
      </div>
    </RequireAuth>
  );
}
