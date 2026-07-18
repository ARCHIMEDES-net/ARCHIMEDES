import { useEffect, useMemo, useState } from "react";
import RequirePlatformAdmin from "../../components/RequirePlatformAdmin";
import PortalHeader from "../../components/PortalHeader";
import { supabase } from "../../lib/supabaseClient";
import { cn } from "../../lib/utils";
import { Button } from "../../components/ui/button";
import { Alert } from "../../components/ui/alert";
import { Select } from "../../components/ui/select";
import { Input } from "../../components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../../components/ui/table";

function formatDateTimeCS(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("cs-CZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function norm(v) {
  return (v ?? "").toString().trim();
}

function statusLabel(s) {
  const v = (s || "").toLowerCase();
  if (v === "approved") return "Schváleno";
  if (v === "in_progress") return "Řeší se";
  if (v === "done") return "Vyřízeno";
  return "Nová";
}

function statusChipClass(s) {
  const v = (s || "").toLowerCase();
  if (v === "approved") return "border-cyan-200 bg-cyan-50";
  if (v === "done") return "border-emerald-200 bg-emerald-50";
  if (v === "in_progress") return "border-blue-200 bg-blue-50";
  return "border-amber-200 bg-amber-50";
}

function isDemoLead(row) {
  const type = norm(row?.type).toLowerCase();
  if (type === "demo") return true;

  const hay = [
    row?.type,
    row?.organization,
    row?.contact_name,
    row?.email,
    row?.phone,
    row?.note,
  ]
    .map((x) => norm(x).toLowerCase())
    .join(" | ");

  return hay.includes("demo");
}

export default function AdminPoptavky() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [q, setQ] = useState("");

  async function load() {
    setLoading(true);
    setErr("");

    const { data, error } = await supabase
      .from("leads")
      .select("id, created_at, type, organization, contact_name, email, phone, note, status")
      .order("created_at", { ascending: false });

    if (error) {
      setErr(error.message);
      setRows([]);
      setLoading(false);
      return;
    }

    setRows(data || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function setStatus(id, status) {
    const prev = rows;
    setRows((r) => r.map((x) => (x.id === id ? { ...x, status } : x)));

    const { error } = await supabase.from("leads").update({ status }).eq("id", id);

    if (error) {
      setRows(prev);
      alert("Nepodařilo se uložit stav: " + error.message);
    }
  }

  const filtered = useMemo(() => {
    let out = rows || [];

    if (typeFilter !== "all") {
      out = out.filter((r) => {
        const t = norm(r?.type).toLowerCase();
        const n = norm(r?.note).toLowerCase();

        if (typeFilter === "demo") {
          return t === "demo" || isDemoLead(r) || n.includes("demo");
        }

        if (typeFilter === "skola") {
          return (
            t.includes("skola") ||
            t.includes("škola") ||
            t.includes("zš") ||
            t.includes("zs")
          );
        }

        if (typeFilter === "senior") {
          return t.includes("senior");
        }

        if (typeFilter === "spolek") {
          return t.includes("spolek") || t.includes("komunita");
        }

        return t.includes("obec");
      });
    }

    if (statusFilter !== "all") {
      out = out.filter((r) => (r.status || "new") === statusFilter);
    }

    const qq = q.trim().toLowerCase();
    if (qq) {
      out = out.filter((r) => {
        const hay = [
          r.type,
          r.organization,
          r.contact_name,
          r.email,
          r.phone,
          r.note,
          r.status,
        ]
          .map((x) => norm(x).toLowerCase())
          .join(" | ");

        return hay.includes(qq);
      });
    }

    return out;
  }, [rows, typeFilter, statusFilter, q]);

  return (
    <RequirePlatformAdmin>
      <PortalHeader />

      <div className="mx-auto max-w-[1150px] px-4 py-6">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-black text-navy-900">Admin – poptávky</h1>

          <div className="ml-auto flex flex-wrap items-center gap-2.5">
            <Button href="/portal" variant="secondary" size="sm">
              ← Zpět do portálu
            </Button>
            <Button onClick={load} disabled={loading} variant="secondary" size="sm">
              Obnovit
            </Button>
          </div>
        </div>

        <p className="mt-1.5 text-sm text-muted">
          Přehled poptávek z formulářů <code>/poptavka</code> a <code>/zadost-o-pristup</code>.
          Řazeno podle nejnovějších.
        </p>

        {err ? (
          <Alert variant="error" className="mt-3.5">
            Chyba: {err}
          </Alert>
        ) : null}

        <div className="mt-3.5 flex flex-wrap items-center gap-2.5">
          <label className="flex items-center gap-2 text-sm text-slate-600">
            Typ:
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="h-10 w-auto"
            >
              <option value="all">Vše</option>
              <option value="demo">Demo</option>
              <option value="obec">Obec</option>
              <option value="skola">Škola</option>
              <option value="spolek">Spolek</option>
              <option value="senior">Senior</option>
            </Select>
          </label>

          <label className="flex items-center gap-2 text-sm text-slate-600">
            Stav:
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 w-auto"
            >
              <option value="all">Vše</option>
              <option value="new">Nová</option>
              <option value="in_progress">Řeší se</option>
              <option value="approved">Schváleno</option>
              <option value="done">Vyřízeno</option>
            </Select>
          </label>

          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Hledat (obec, email, poznámka…)…"
            className="h-10 min-w-[260px] flex-1"
          />

          <div className="ml-auto text-sm text-slate-600">
            Záznamů: <strong className="text-navy-900">{filtered.length}</strong>
          </div>
        </div>

        <div className="mt-3.5">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Datum</TableHead>
                <TableHead>Stav</TableHead>
                <TableHead>Typ</TableHead>
                <TableHead>Organizace</TableHead>
                <TableHead>Kontakt</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Telefon</TableHead>
                <TableHead>Poznámka</TableHead>
                <TableHead>Akce</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9}>Načítám…</TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9}>Zatím žádné poptávky.</TableCell>
                </TableRow>
              ) : (
                filtered.map((r) => {
                  const s = r.status || "new";
                  const demoLead = isDemoLead(r);

                  return (
                    <TableRow key={r.id}>
                      <TableCell className="whitespace-nowrap">
                        {formatDateTimeCS(r.created_at)}
                      </TableCell>

                      <TableCell>
                        <span
                          className={cn(
                            "inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-1.5 text-xs font-black",
                            statusChipClass(s)
                          )}
                        >
                          {statusLabel(s)}
                        </span>
                      </TableCell>

                      <TableCell>
                        {norm(r.type) || "—"}
                        {demoLead ? (
                          <div className="mt-1.5">
                            <span className="inline-flex rounded-full bg-indigo-100 px-2 py-1 text-[11px] font-black text-indigo-900">
                              demo
                            </span>
                          </div>
                        ) : null}
                      </TableCell>

                      <TableCell>{norm(r.organization) || "—"}</TableCell>
                      <TableCell>{norm(r.contact_name) || "—"}</TableCell>

                      <TableCell>
                        {norm(r.email) ? (
                          <a href={`mailto:${norm(r.email)}`} className="text-brand hover:underline">
                            {norm(r.email)}
                          </a>
                        ) : (
                          "—"
                        )}
                      </TableCell>

                      <TableCell>
                        {norm(r.phone) ? (
                          <a href={`tel:${norm(r.phone)}`} className="text-brand hover:underline">
                            {norm(r.phone)}
                          </a>
                        ) : (
                          "—"
                        )}
                      </TableCell>

                      <TableCell>
                        <span className="whitespace-pre-wrap">{norm(r.note) || "—"}</span>
                      </TableCell>

                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => setStatus(r.id, "new")}
                            title="Nastavit: Nová"
                            className={cn(
                              "rounded-lg border px-2.5 py-2 text-xs font-black",
                              s === "new"
                                ? "border-navy-900 bg-navy-900 text-white"
                                : "border-slate-200 bg-white text-navy-900"
                            )}
                          >
                            Nová
                          </button>

                          <button
                            onClick={() => setStatus(r.id, "in_progress")}
                            title="Nastavit: Řeší se"
                            className={cn(
                              "rounded-lg border px-2.5 py-2 text-xs font-black",
                              s === "in_progress"
                                ? "border-navy-900 bg-navy-900 text-white"
                                : "border-slate-200 bg-white text-navy-900"
                            )}
                          >
                            Řeší se
                          </button>

                          <button
                            onClick={() => setStatus(r.id, "done")}
                            title="Nastavit: Vyřízeno"
                            className={cn(
                              "rounded-lg border px-2.5 py-2 text-xs font-black",
                              s === "done"
                                ? "border-navy-900 bg-navy-900 text-white"
                                : "border-slate-200 bg-white text-navy-900"
                            )}
                          >
                            Vyřízeno
                          </button>

                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </RequirePlatformAdmin>
  );
}
