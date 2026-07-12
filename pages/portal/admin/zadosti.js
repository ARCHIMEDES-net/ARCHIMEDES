import { useEffect, useState } from "react";
import RequirePlatformAdmin from "../../../components/RequirePlatformAdmin";
import PortalHeader from "../../../components/PortalHeader";
import { supabase } from "../../../lib/supabaseClient";
import { cn } from "../../../lib/utils";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Alert } from "../../../components/ui/alert";
import { Select } from "../../../components/ui/select";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../../../components/ui/table";

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

export default function AdminZadostiPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creatingOrgId, setCreatingOrgId] = useState("");
  const [savingId, setSavingId] = useState("");
  const [invitingId, setInvitingId] = useState("");
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
    setError("");
    setMessage("");

    const { error } = await supabase
      .from("access_requests")
      .update({ status })
      .eq("id", id);

    if (error) {
      setError("Stav se nepodařilo uložit.");
      setSavingId("");
      return;
    }

    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    setMessage("Stav žádosti byl uložen.");
    setSavingId("");
  }

  async function createOrganizationFromRequest(row) {
    setCreatingOrgId(row.id);
    setError("");
    setMessage("");

    try {
      if (row.organization_id) {
        setMessage("Organizace už existuje.");
        return;
      }

      const [
        {
          data: { user },
          error: userError,
        },
        {
          data: { session },
          error: sessionError,
        },
      ] = await Promise.all([
        supabase.auth.getUser(),
        supabase.auth.getSession(),
      ]);

      if (userError) throw userError;
      if (sessionError) throw sessionError;

      const accessToken = session?.access_token;

      if (!user || !accessToken) {
        throw new Error("Nejste přihlášen.");
      }

      const response = await fetch("/api/admin/create-organization-from-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          requestId: row.id,
          organizationName: row.organization,
          licenseType: row.license_type,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error || "Nepodařilo se vytvořit organizaci.");
      }

      setRows((prev) =>
        prev.map((r) =>
          r.id === row.id
            ? {
                ...r,
                organization_id: result.organization?.id || r.organization_id,
              }
            : r
        )
      );

      setMessage(
        `Organizace „${result.organization?.name || row.organization}“ byla vytvořena.`
      );
    } catch (e) {
      setError(e.message || "Nepodařilo se vytvořit organizaci.");
    } finally {
      setCreatingOrgId("");
    }
  }

  async function inviteOrganizationAdmin(row) {
    setInvitingId(row.id);
    setError("");
    setMessage("");

    try {
      if (!row.organization_id) {
        throw new Error("Nejdříve vytvoř organizaci.");
      }

      const email = window.prompt(
        "Zadej e-mail skutečného administrátora organizace:",
        row.admin_invited_email || row.email || ""
      );

      if (!email) return;

      const trimmedEmail = email.trim().toLowerCase();
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail);

      if (!emailOk) {
        throw new Error("Zadej platný e-mail administrátora.");
      }

      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: trimmedEmail,
        options: {
          emailRedirectTo: "https://archimedeslive.com/login",
        },
      });

      if (otpError) {
        throw new Error(otpError.message || "Pozvánku se nepodařilo odeslat.");
      }

      const { error: updateError } = await supabase
        .from("access_requests")
        .update({
          admin_invited_email: trimmedEmail,
        })
        .eq("id", row.id);

      if (updateError) {
        throw new Error(
          updateError.message ||
            "Pozvánka odešla, ale nepodařilo se uložit e-mail administrátora."
        );
      }

      setRows((prev) =>
        prev.map((r) =>
          r.id === row.id ? { ...r, admin_invited_email: trimmedEmail } : r
        )
      );

      setMessage(`Pozvánka administrátorovi byla odeslána na ${trimmedEmail}.`);
    } catch (e) {
      setError(e.message || "Pozvánku se nepodařilo odeslat.");
    } finally {
      setInvitingId("");
    }
  }

  return (
    <RequirePlatformAdmin>
      <div className="min-h-screen bg-slate-50">
        <PortalHeader title="Admin • žádosti" />

        <main className="mx-auto max-w-[1240px] px-10 py-10">
          <h1 className="text-2xl font-black text-navy-900">Žádosti o přístup</h1>

          <p className="mt-2.5 max-w-[900px] text-muted">
            Přehled zájemců o vstup do ARCHIMEDES Live. Z této stránky můžeš měnit
            stav žádosti, vytvořit organizaci a pozvat konkrétního administrátora.
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
              <div className="font-bold text-navy-900">Celkem žádostí: {rows.length}</div>

              <Button type="button" onClick={loadRows} disabled={loading} variant="secondary" size="sm">
                {loading ? "Načítám..." : "Obnovit"}
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Datum</TableHead>
                  <TableHead>Jméno</TableHead>
                  <TableHead>Organizace</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Telefon</TableHead>
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
                    <TableCell colSpan={7}>Zatím žádné žádosti.</TableCell>
                  </TableRow>
                ) : null}

                {rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{formatDate(row.created_at)}</TableCell>

                    <TableCell>
                      <div className="font-bold">{row.contact_name || "—"}</div>
                      {row.address ? <div className="mt-1.5 text-slate-500">{row.address}</div> : null}
                      {row.message ? (
                        <div className="mt-1.5 max-w-[260px] whitespace-pre-wrap text-slate-500">
                          {row.message}
                        </div>
                      ) : null}
                    </TableCell>

                    <TableCell>
                      {row.organization || "—"}
                      <div className="mt-2">
                        <span
                          className={cn(
                            "inline-flex min-h-[28px] items-center rounded-full border px-2.5 text-xs font-bold",
                            row.organization_id
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-slate-200 bg-slate-50 text-slate-600"
                          )}
                        >
                          {row.organization_id ? "Organizace vytvořena" : "Bez organizace"}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      {row.email ? (
                        <a href={`mailto:${row.email}`} className="text-navy-900">
                          {row.email}
                        </a>
                      ) : (
                        "—"
                      )}

                      {row.admin_invited_email ? (
                        <div className="mt-2 text-xs text-slate-500">
                          Pozvánka: {row.admin_invited_email}
                        </div>
                      ) : null}
                    </TableCell>

                    <TableCell>
                      {row.phone ? (
                        <a href={`tel:${row.phone}`} className="text-navy-900">
                          {row.phone}
                        </a>
                      ) : (
                        "—"
                      )}
                    </TableCell>

                    <TableCell>
                      <Select
                        value={row.status || "new"}
                        disabled={savingId === row.id}
                        onChange={(e) => updateStatus(row.id, e.target.value)}
                        className="h-10 min-w-[150px]"
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                      </Select>
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-col gap-2">
                        <Button
                          type="button"
                          onClick={() => createOrganizationFromRequest(row)}
                          disabled={!!row.organization_id || creatingOrgId === row.id}
                          variant="secondary"
                          size="sm"
                        >
                          {creatingOrgId === row.id
                            ? "Vytvářím..."
                            : row.organization_id
                              ? "Organizace existuje"
                              : "Vytvořit organizaci"}
                        </Button>

                        <Button
                          type="button"
                          onClick={() => inviteOrganizationAdmin(row)}
                          disabled={!row.organization_id || invitingId === row.id}
                          variant="secondary"
                          size="sm"
                        >
                          {invitingId === row.id
                            ? "Odesílám..."
                            : row.admin_invited_email
                              ? "Pozvat znovu admina"
                              : "Pozvat administrátora"}
                        </Button>
                      </div>
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
