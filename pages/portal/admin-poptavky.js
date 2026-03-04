import { useEffect, useState } from "react";
import Link from "next/link";
import RequireAuth from "../../components/RequireAuth";
import PortalHeader from "../../components/PortalHeader";
import { supabase } from "../../lib/supabaseClient";

export default function AdminPoptavky() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  async function load() {
    setLoading(true);

    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setErr(error.message);
      setLoading(false);
      return;
    }

    setRows(data || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <RequireAuth>
      <PortalHeader />

      <div style={{ padding: 30 }}>
        <h1>Admin – poptávky</h1>

        {err && <div style={{ color: "red" }}>{err}</div>}

        {loading && <div>Načítám...</div>}

        {!loading && rows.length === 0 && (
          <div>Zatím žádné poptávky.</div>
        )}

        {!loading && rows.length > 0 && (
          <table border="1" cellPadding="10">
            <thead>
              <tr>
                <th>Datum</th>
                <th>Typ</th>
                <th>Organizace</th>
                <th>Kontakt</th>
                <th>Email</th>
                <th>Telefon</th>
                <th>Poznámka</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{new Date(r.created_at).toLocaleString("cs-CZ")}</td>
                  <td>{r.type}</td>
                  <td>{r.organization}</td>
                  <td>{r.contact_name}</td>
                  <td>{r.email}</td>
                  <td>{r.phone}</td>
                  <td>{r.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </RequireAuth>
  );
}
