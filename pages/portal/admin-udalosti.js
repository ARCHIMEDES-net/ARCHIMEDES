import { useEffect, useState } from "react";
import Link from "next/link";
import RequireAuth from "../../components/RequireAuth";
import PortalHeader from "../../components/PortalHeader";
import { supabase } from "../../lib/supabaseClient";

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

    const payload = {
      title: row.title,
      category: row.category,
      audience_groups: row.audience_groups,
      description: row.description,
      full_description: row.full_description,
      stream_url: row.stream_url,
      worksheet_url: row.worksheet_url,
      is_published: false,
      starts_at: null,
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

    const { error } = await supabase
      .from("events")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    load();
  }

  return (
    <RequireAuth>
      <PortalHeader />

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Admin – Události</h1>
            <p className="text-slate-600 mt-1">
              Správa programu ARCHIMEDES Live
            </p>
          </div>

          <Link
            href="/portal/admin-udalosti/novy"
            className="px-4 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800"
          >
            + Nová událost
          </Link>
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
                <div>
                  <div className="text-sm text-slate-500">
                    {row.starts_at
                      ? new Date(row.starts_at).toLocaleString("cs-CZ")
                      : "Bez data"}
                  </div>

                  <div className="text-lg font-semibold mt-1">
                    {row.title}
                  </div>

                  <div className="mt-2 flex items-center gap-2 text-xs">
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
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => duplicateEvent(row)}
                    className="text-sm px-3 py-1 border rounded-lg hover:bg-slate-100"
                  >
                    🧬 Duplikovat
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
        </div>
      </div>
    </RequireAuth>
  );
}
