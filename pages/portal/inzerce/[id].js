import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Link from "next/link";
import RequireAuth from "../../../components/RequireAuth";
import PortalHeader from "../../../components/PortalHeader";
import { supabase } from "../../../lib/supabaseClient";

const BUCKET = "marketplace";

function typeLabel(type) {
  if (type === "offer") return "Nabídka";
  if (type === "demand") return "Poptávka";
  if (type === "partnership") return "Spolupráce";
  return type;
}

function typeBadge(type) {
  if (type === "offer") return "bg-green-100 text-green-800";
  if (type === "demand") return "bg-blue-100 text-blue-800";
  if (type === "partnership") return "bg-purple-100 text-purple-800";
  return "bg-slate-100 text-slate-700";
}

export default function DetailInzeratu() {
  const router = useRouter();
  const { id } = router.query;

  const [row, setRow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  async function load() {
    if (!id) return;

    const { data, error } = await supabase
      .from("marketplace_posts")
      .select(`
        *,
        marketplace_attachments (
          file_path,
          is_image
        )
      `)
      .eq("id", id)
      .single();

    if (error) {
      setErr(error.message);
      setLoading(false);
      return;
    }

    setRow(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [id]);

  function getPublicUrl(path) {
    const { data } = supabase
      .storage
      .from(BUCKET)
      .getPublicUrl(path);

    return data?.publicUrl;
  }

  if (loading) return <div>Načítám…</div>;
  if (err) return <div className="text-red-600">{err}</div>;
  if (!row) return <div>Inzerát nenalezen.</div>;

  const images = row.marketplace_attachments?.filter(a => a.is_image) || [];

  return (
    <RequireAuth>
      <PortalHeader />

      <div className="max-w-5xl mx-auto px-4 py-6">

        <Link
          href="/portal/inzerce"
          className="text-sm text-slate-500 hover:underline"
        >
          ← Zpět na inzerci
        </Link>

        <div className="mt-4 bg-white border border-slate-200 rounded-2xl shadow-sm p-6">

          <div className="flex items-center gap-2 mb-3">
            <span className={`px-3 py-1 text-xs rounded-full ${typeBadge(row.type)}`}>
              {typeLabel(row.type)}
            </span>

            {row.category && (
              <span className="text-xs text-slate-500">
                {row.category}
              </span>
            )}
          </div>

          <h1 className="text-2xl font-semibold mb-4">
            {row.title}
          </h1>

          {/* Galerie */}
          {images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              {images.map((img, i) => (
                <img
                  key={i}
                  src={getPublicUrl(img.file_path)}
                  alt=""
                  className="rounded-xl object-cover w-full h-48"
                />
              ))}
            </div>
          )}

          <div className="prose max-w-none text-slate-700 mb-6">
            {row.description}
          </div>

          {/* Kontakt */}
          <div className="border-t pt-4 text-sm text-slate-600 space-y-1">
            {row.contact_name && (
              <div><strong>Kontakt:</strong> {row.contact_name}</div>
            )}
            {row.contact_email && (
              <div>
                <strong>E-mail:</strong>{" "}
                <a
                  href={`mailto:${row.contact_email}`}
                  className="text-slate-900 hover:underline"
                >
                  {row.contact_email}
                </a>
              </div>
            )}
            {row.contact_phone && (
              <div>
                <strong>Telefon:</strong>{" "}
                <a
                  href={`tel:${row.contact_phone}`}
                  className="text-slate-900 hover:underline"
                >
                  {row.contact_phone}
                </a>
              </div>
            )}
          </div>

        </div>
      </div>
    </RequireAuth>
  );
}
