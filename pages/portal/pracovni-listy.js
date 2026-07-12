import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { FileText, ArrowRight } from "lucide-react";
import RequireAuth from "../../components/RequireAuth";
import PortalHeader from "../../components/PortalHeader";
import { supabase } from "../../lib/supabaseClient";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Select } from "../../components/ui/select";
import { Label } from "../../components/ui/label";
import { Alert } from "../../components/ui/alert";

function safeDate(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function formatDateTimeCS(date) {
  return date.toLocaleString("cs-CZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function normalizeGroups(row) {
  if (Array.isArray(row?.audience_groups) && row.audience_groups.length) return row.audience_groups;
  const aud = row?.audience;
  if (!aud) return [];
  if (Array.isArray(aud)) return aud;
  return String(aud)
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

export default function PracovniListy() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [filterCategory, setFilterCategory] = useState("Vše");
  const [filterAudience, setFilterAudience] = useState("Vše");
  const [q, setQ] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setLoading(true);
      setErr("");

      const { data, error } = await supabase
        .from("events")
        .select(
          "id,title,starts_at,category,audience_groups,audience,worksheet_url,is_published,poster_url"
        )
        .order("starts_at", { ascending: false });

      if (!isMounted) return;

      if (error) {
        setErr(error.message || "Chyba načítání");
        setRows([]);
      } else {
        setRows(Array.isArray(data) ? data : []);
      }
      setLoading(false);
    }

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const prepared = useMemo(() => {
    return rows
      .filter((r) => r.is_published !== false)
      .map((r) => ({ ...r, _d: safeDate(r.starts_at), _groups: normalizeGroups(r) }));
  }, [rows]);

  const categories = useMemo(() => {
    const set = new Set();
    prepared.forEach((r) => {
      if (r.category) set.add(r.category);
    });
    return ["Vše", ...Array.from(set).sort((a, b) => a.localeCompare(b, "cs"))];
  }, [prepared]);

  const audiences = useMemo(() => {
    const set = new Set();
    prepared.forEach((r) => (r._groups || []).forEach((g) => set.add(g)));
    return ["Vše", ...Array.from(set).sort((a, b) => a.localeCompare(b, "cs"))];
  }, [prepared]);

  const visible = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return prepared
      .filter((r) => !!r.worksheet_url)
      .filter((r) => (filterCategory === "Vše" ? true : r.category === filterCategory))
      .filter((r) => (filterAudience === "Vše" ? true : (r._groups || []).includes(filterAudience)))
      .filter((r) => (qq ? String(r.title || "").toLowerCase().includes(qq) : true));
  }, [prepared, filterCategory, filterAudience, q]);

  return (
    <RequireAuth>
      <PortalHeader />

      <main className="mx-auto max-w-[1100px] px-4 py-5">
        <h1 className="text-2xl font-black text-navy-900">Pracovní listy</h1>
        <p className="mt-1.5 text-muted">Přehled událostí, které mají vložený pracovní list.</p>

        <Card className="mt-3.5 grid grid-cols-1 gap-2.5 p-3 sm:grid-cols-3">
          <div>
            <Label>Hledat</Label>
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Název události…" />
          </div>

          <div>
            <Label>Rubrika</Label>
            <Select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label>Cílovka</Label>
            <Select value={filterAudience} onChange={(e) => setFilterAudience(e.target.value)}>
              {audiences.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </Select>
          </div>
        </Card>

        {err ? (
          <Alert variant="error" className="mt-3.5">
            <b>Chyba:</b> {err}
          </Alert>
        ) : null}

        {loading ? <p className="mt-4 text-muted">Načítám…</p> : null}

        {!loading && !err ? (
          <section className="mt-4">
            {visible.length === 0 ? (
              <Alert variant="neutral">Žádné pracovní listy podle zvolených filtrů.</Alert>
            ) : (
              <div className="grid gap-3">
                {visible.map((r) => (
                  <Card key={r.id} className="grid grid-cols-[120px_1fr] items-start gap-3 p-3">
                    {r.poster_url ? (
                      <img
                        src={r.poster_url}
                        alt=""
                        className="h-[90px] w-[120px] rounded-xl border border-slate-200 bg-slate-50 object-cover"
                      />
                    ) : (
                      <div className="flex h-[90px] w-[120px] items-center justify-center rounded-xl border border-dashed border-slate-300 text-xs font-bold text-slate-500">
                        Bez plakátu
                      </div>
                    )}

                    <div>
                      <Link href={`/portal/udalost/${r.id}`} className="text-navy-900 no-underline">
                        <div className="cursor-pointer text-base font-black">{r.title}</div>
                      </Link>

                      <div className="mt-1.5 text-sm text-slate-700">
                        {r._d ? formatDateTimeCS(r._d) : "—"}
                        {r.category ? <span> &nbsp;•&nbsp; {r.category}</span> : null}
                        {(r._groups || []).length ? <span> &nbsp;•&nbsp; {r._groups.join(", ")}</span> : null}
                      </div>

                      <div className="mt-2.5 flex flex-wrap gap-4">
                        <a
                          href={r.worksheet_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm font-bold text-brand hover:underline"
                        >
                          <FileText className="h-4 w-4" aria-hidden="true" /> Otevřít pracovní list
                        </a>
                        <Link
                          href="/portal/kalendar"
                          className="inline-flex items-center gap-1 text-sm font-bold text-navy-900 hover:underline"
                        >
                          Program <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                        </Link>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </section>
        ) : null}
      </main>
    </RequireAuth>
  );
}
