import { useEffect, useState } from "react";
import RequirePlatformAdmin from "../../../components/RequirePlatformAdmin";
import PortalHeader from "../../../components/PortalHeader";
import { supabase } from "../../../lib/supabaseClient";
import { cn } from "../../../lib/utils";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Alert } from "../../../components/ui/alert";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../../../components/ui/table";

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("cs-CZ");
}

const ORGANIZATION_LABELS = {
  municipality: "Obec",
  obec: "Obec",
  school: "Škola",
  association: "Spolek",
  spolek: "Spolek",
};

export default function AdminObcePage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activatingId, setActivatingId] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadRows();
  }, []);

  async function loadRows() {
    setLoading(true);
    setError("");
    setMessage("");

    const { data, error } = await supabase
      .from("organizations")
      .select(
        "id, name, org_type, parent_organization_id, registration_number, license_status, status, contact_name, contact_email, contact_phone, created_at"
      )
      .in("org_type", ["municipality", "obec", "school", "association", "spolek"])
      .is("parent_organization_id", null)
      .order("created_at", { ascending: false });

    if (error) {
      setError("Zákazníky se nepodařilo načíst.");
      setLoading(false);
      return;
    }

    setRows(data || []);
    setLoading(false);
  }

  async function activateCustomer(row) {
    const typeLabel = ORGANIZATION_LABELS[row.org_type] || "Organizace";
    const confirmed = window.confirm(
      `Aktivovat: ${typeLabel.toLowerCase()} „${row.name}“ a přiřadit kontaktní osobu jako správce?`
    );
    if (!confirmed) return;

    setActivatingId(row.id);
    setError("");
    setMessage("");

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      setError("Přihlášení vypršelo. Přihlaste se znovu.");
      setActivatingId("");
      return;
    }

    const response = await fetch("/api/admin/activate-municipality", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ organizationId: row.id }),
    });
    const result = await response.json();

    if (!response.ok) {
      setError(result?.error || "Aktivaci se nepodařilo uložit.");
      setActivatingId("");
      return;
    }

    setRows((prev) =>
      prev.map((r) =>
        r.id === row.id ? { ...r, license_status: "active", status: "active" } : r
      )
    );
    setMessage(
      `${typeLabel} „${row.name}“ ${["association", "spolek"].includes(row.org_type) ? "byl aktivován" : "byla aktivována"}.${
        result.invitationSent ? " Kontaktní osobě byla odeslána pozvánka." : " Stávající účet kontaktní osoby byl zachován."
      }`
    );
    setActivatingId("");
  }

  return (
    <RequirePlatformAdmin>
      <div className="min-h-screen bg-slate-50">
        <PortalHeader title="Admin • zákazníci" />

        <main className="mx-auto max-w-[1240px] px-10 py-10">
          <h1 className="text-2xl font-black text-navy-900">Zákazníci</h1>

          <p className="mt-2.5 max-w-[900px] text-muted">
            Přehled obcí, škol a spolků založených přes /zadost. Nový subjekt
            vzniká se stavem „Čeká na schválení“ a přístup získá až po ručním
            ověření a aktivaci.
          </p>

          {error ? (
            <Alert variant="error" className="mt-4">
              {error}
            </Alert>
          ) : null}

          {message ? (
            <Alert variant="success" className="mt-4">
              {message}
            </Alert>
          ) : null}

          <Card className="mt-4 overflow-hidden p-0">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-900/[0.08] p-3.5">
              <div className="font-bold text-navy-900">Celkem zákazníků: {rows.length}</div>

              <Button type="button" onClick={loadRows} disabled={loading} variant="secondary" size="sm">
                {loading ? "Načítám..." : "Obnovit"}
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Datum</TableHead>
                  <TableHead>Typ</TableHead>
                  <TableHead>Název</TableHead>
                  <TableHead>Reg. číslo</TableHead>
                  <TableHead>Kontakt</TableHead>
                  <TableHead>Stav</TableHead>
                  <TableHead>Akce</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7}>Načítám…</TableCell>
                  </TableRow>
                ) : null}

                {!loading && rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7}>Zatím žádní zákazníci.</TableCell>
                  </TableRow>
                ) : null}

                {rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{formatDate(row.created_at)}</TableCell>

                    <TableCell>{ORGANIZATION_LABELS[row.org_type] || row.org_type}</TableCell>

                    <TableCell>
                      <div className="font-bold">{row.name}</div>
                    </TableCell>

                    <TableCell>{row.registration_number || "—"}</TableCell>

                    <TableCell>
                      {row.contact_name ? <div className="font-semibold">{row.contact_name}</div> : null}
                      {row.contact_email ? (
                        <a href={`mailto:${row.contact_email}`} className="mt-1 block text-navy-900">
                          {row.contact_email}
                        </a>
                      ) : null}
                      {row.contact_phone ? (
                        <a href={`tel:${row.contact_phone}`} className="mt-1 block text-navy-900">
                          {row.contact_phone}
                        </a>
                      ) : null}
                      {!row.contact_name && !row.contact_email && !row.contact_phone ? "—" : null}
                    </TableCell>

                    <TableCell>
                      <span
                        className={cn(
                          "inline-flex min-h-[28px] items-center rounded-full border px-2.5 text-xs font-bold",
                          row.license_status === "active"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-slate-200 bg-slate-50 text-slate-600"
                        )}
                      >
                        {row.license_status === "active" ? "Aktivní" : "Čeká na schválení"}
                      </span>
                    </TableCell>

                    <TableCell>
                      <Button
                        type="button"
                        onClick={() => activateCustomer(row)}
                        disabled={row.license_status === "active" || activatingId === row.id}
                        variant="secondary"
                        size="sm"
                      >
                        {activatingId === row.id
                          ? "Aktivuji..."
                          : row.license_status === "active"
                            ? "Aktivní"
                            : "Aktivovat"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </main>
      </div>
    </RequirePlatformAdmin>
  );
}
