import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import RequireAuth from "../../components/RequireAuth";
import PortalHeader from "../../components/PortalHeader";
import { supabase } from "../../lib/supabaseClient";

function safeDate(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function formatDateTimeCS(value) {
  const d = safeDate(value);
  if (!d) return "Bez data";
  return d.toLocaleString("cs-CZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function normalizeAudienceGroups(val) {
  // DB čeká typicky text[] (array). Při nečistých datech to může být string.
  if (!val) return [];
  if (Array.isArray(val)) return val.filter(Boolean).map(String);
  const s = String(val).trim();
  if (!s) return [];
  // podpora "a, b, c"
  return s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

export default function AdminUdalosti() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  async function load() {
    setLoading(true);
    setErr("");

    const { data, error } = await supabase
      .from("events")
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

  async function duplicateEvent(row) {
    if (!confirm("Duplikovat tuto událost?")) return;

    // Audience groups: musí být neprázdné pole (kvůli constraintu)
    const aud = normalizeAudienceGroups(row.audience_groups);
    const audience_groups = aud.length ? aud : ["komunita"]; // bezpečný fallback

    // starts_at: DB má NOT NULL => dáme aktuální čas jako draft,
    // ať to vždy projde. Uživatel si pak datum upraví.
    const starts_at = new Date().toISOString();

    // category: ponecháme jen pokud existuje (null obvykle projde, ale nebudeme riskovat chybnou hodnotu)
    const category = row.category ? row.category : null;

    const payload = {
      title: row.title ? `${row.title} (KOPIE)` : "Nová událost (KOPIE)",
      category,
      audience_groups,
      description: row.description || "",
      full_description: row.full_description || "",
      stream_url: row.stream_url || "",
      worksheet_url: row.worksheet_url || "",
      is_published: false,
      starts_at,
      // poster_path záměrně NEKOPÍRUJEME, aby nebyly zmatky s plakáty
      // a aby se hned poznalo, že je to nový draft.
    };

    const { data, error } = await supabase
      .from("events")
      .insert(payload)
      .select("id")
      .single();

    if (error) {
      alert(error.message);
      return;
    }

    window.location.href = `/portal/admin-udalosti/${data.id}`;
  }

  async function deleteEvent(id) {
    if (!confirm("Opravdu smazat událost?")) return;

    const { error } = await supabase.from("events").delete().eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    load();
  }

  const stats = useMemo(() => {
    const total = rows.length;
    const published = rows.filter((r) => !!r.is_published).length;
    const draft = total - published;
    return { total, published, draft };
  }, [rows]);

  return (
    <RequireAuth>
      <PortalHeader />

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Admin – Události</h1>
            <p className="text-slate-600 mt-1">Správa programu ARCHIMEDES Live</p>

            <div className="mt-2 text-xs text-slate-500">
              Celkem: <b>{stats.total}</b> · Publikováno: <b>{stats.published}</b> · Koncept:{" "}
              <b>{stats.draft}</b>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={load}
              className="px-4 py-2 border rounded-xl hover:bg-slate-100"
            >
              Obnovit
            </button>

            <Link
              href="/portal/admin-udalosti/novy"
              className="px-4 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800"
            >
              + Nová událost
            </Link>
          </div>
        </div>

        {loading && <div>Načítám…</div>}
        {err && <div className="text-red-600">{err}</div>}

        <div className="space-y-4">
          {rows.map((row) => (
            <div
              key={row.id}
              className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5"
            >
              <div className="flex justify-between items-start gap-3 flex-wrap">
                <div className="min-w-[260px]">
                  <div className="text-sm text-slate-500">
                    {formatDateTimeCS(row.starts_at)}
                  </div>

                  <div className="text-lg font-semibold mt-1">{row.title}</div>

                  <div className="mt-2 flex items-center gap-2 text-xs flex-wrap">
                    {row.is_published ? (
                      <span className="px-2 py-1 rounded-full bg-green-100 text-green-800">
                        Publikováno
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded-full bg-slate-200 text-slate-700">
                        Koncept
                      </span>
                    )}

                    {row.category && (
                      <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-700">
                        {row.category}
                      </span>
                    )}

                    {Array.isArray(row.audience_groups) && row.audience_groups.length > 0 && (
                      <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-700">
                        {row.audience_groups.join(", ")}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => duplicateEvent(row)}
                    className="text-sm px-3 py-1 border rounded-lg hover:bg-slate-100"
                  >
                    🧬 Duplikovat TEST
                  </button>

                  <Link
                    href={`/portal/admin-udalosti/${row.id}`}
                    className="text-sm px-3 py-1 border rounded-lg hover:bg-slate-100"
                  >
                    ✏ Upravit
                  </Link>

                  <button
                    onClick={() => deleteEvent(row.id)}
                    className="text-sm px-3 py-1 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
                  >
                    Smazat
                  </button>
                </div>
              </div>
            </div>
          ))}

          {!loading && !err && rows.length === 0 && (
            <div className="text-slate-600">Zatím tu nejsou žádné události.</div>
          )}
        </div>
      </div>
    </RequireAuth>
  );
}
