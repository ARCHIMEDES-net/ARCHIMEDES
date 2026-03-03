import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import RequireAuth from "../../../components/RequireAuth";
import PortalHeader from "../../../components/PortalHeader";
import { supabase } from "../../../lib/supabaseClient";

const BUCKET = "marketplace";

function typeBadge(type) {
  if (type === "offer")
    return "bg-green-100 text-green-800";
  if (type === "demand")
    return "bg-blue-100 text-blue-800";
  if (type === "partnership")
    return "bg-purple-100 text-purple-800";
  return "bg-slate-100 text-slate-700";
}

function typeLabel(type) {
  if (type === "offer") return "Nabídka";
  if (type === "demand") return "Poptávka";
  if (type === "partnership") return "Spolupráce";
  return type;
}

export default function Inzerce() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  async function load() {
    setLoading(true);
    setErr("");

    const { data, error } = await supabase
      .from("marketplace_posts")
      .select(`
        *,
        marketplace_attachments (
          file_path,
          is_image
        )
      `)
      .eq("status", "active")
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

  function getImage(row) {
    const img = row.marketplace_attachments?.find(a => a.is_image);
    if (!img?.file_path) return null;

    const { data } = supabase
      .storage
      .from(BUCKET)
      .getPublicUrl(img.file_path);

    return data?.publicUrl || null;
  }

  return (
    <RequireAuth>
      <PortalHeader />

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold">Inzerce</h1>
            <p className="text-slate-600 mt-1">
              Nabídky a poptávky v rámci komunity ARCHIMEDES.
            </p>
          </div>

          <Link
            href="/portal/inzerce/novy"
            className="px-4 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800"
          >
            + Nový inzerát
          </Link>
        </div>

        {err && (
          <div className="p-3 mb-4 rounded-xl bg-red-50 border border-red-200 text-red-700">
            {err}
          </div>
        )}

        {loading && <div>Načítám…</div>}

        <div className="space-y-4">
          {rows.map((row) => {
            const imgUrl = getImage(row);

            return (
              <div
                key={row.id}
                className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition flex overflow-hidden"
              >
                {/* Obrázek */}
                <div className="w-48 h-40 bg-slate-100 flex items-center justify-center overflow-hidden">
                  {imgUrl ? (
                    <img
                      src={imgUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xs text-slate-400">
                      bez fotky
                    </span>
                  )}
                </div>

                {/* Obsah */}
                <div className="flex-1 p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${typeBadge(
                          row.type
                        )}`}
                      >
                        {typeLabel(row.type)}
                      </span>

                      {row.category && (
                        <span className="text-xs text-slate-500">
                          {row.category}
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-semibold mb-1">
                      {row.title}
                    </h3>

                    <p className="text-sm text-slate-600 line-clamp-2">
                      {row.description}
                    </p>
                  </div>

                  <div className="flex justify-between items-center mt-4 text-xs text-slate-500">
                    <span>
                      Vloženo:{" "}
                      {new Date(row.created_at).toLocaleDateString("cs-CZ")}
                    </span>

                    <Link
                      href={`/portal/inzerce/${row.id}`}
                      className="text-slate-900 font-medium hover:underline"
                    >
                      Detail →
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {!loading && rows.length === 0 && (
          <div className="text-slate-500 mt-6">
            Zatím zde nejsou žádné aktivní inzeráty.
          </div>
        )}
      </div>
    </RequireAuth>
  );
}
