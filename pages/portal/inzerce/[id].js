import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Link from "next/link";
import RequireAuth from "../../../components/RequireAuth";
import PortalHeader from "../../../components/PortalHeader";
import { supabase } from "../../../lib/supabaseClient";

const BUCKET = "marketplace";
const ADMIN_EMAIL = "antonin.koplik@eduvision.cz";

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
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    async function init() {
      if (!id) return;

      const { data: userData } = await supabase.auth.getUser();
      setCurrentUser(userData?.user || null);

      const { data, error } = await supabase
        .from("marketplace_posts")
        .select(
          `
          *,
          marketplace_attachments (
            file_path,
            is_image
          )
        `
        )
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

    init();
  }, [id]);

  function getPublicUrl(path) {
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return data?.publicUrl || null;
  }

  async function closePost() {
    if (!confirm("Opravdu chcete inzerát uzavřít?")) return;

    setBusy(true);
    const { error } = await supabase
      .from("marketplace_posts")
      .update({ status: "closed", is_closed: true })
      .eq("id", row.id);
    setBusy(false);

    if (error) {
      alert(error.message || "Nepodařilo se uzavřít inzerát.");
      return;
    }

    router.push("/portal/inzerce");
  }

  async function togglePinned(nextPinned) {
    setBusy(true);

    const { data, error } = await supabase
      .from("marketplace_posts")
      .update({ is_pinned: nextPinned })
      .eq("id", row.id)
      .select("is_pinned")
      .single();

    setBusy(false);

    if (error) {
      alert(error.message || "Nepodařilo se změnit připnutí.");
      return;
    }

    setRow((r) => ({ ...r, is_pinned: data?.is_pinned }));
  }

  if (loading) return <div className="p-6">Načítám…</div>;
  if (err) return <div className="p-6 text-red-600">{err}</div>;
  if (!row) return <div className="p-6">Inzerát nenalezen.</div>;

  const images = row.marketplace_attachments?.filter((a) => a.is_image) || [];
  const isOwner = currentUser?.id === row.author_id;
  const isAdmin = (currentUser?.email || "").toLowerCase() === ADMIN_EMAIL.toLowerCase();

  return (
    <RequireAuth>
      <PortalHeader />

      <div className="max-w-5xl mx-auto px-4 py-6">
        <Link href="/portal/inzerce" className="text-sm text-slate-500 hover:underline">
          ← Zpět na inzerci
        </Link>

        <div className="mt-4 bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
          <div className="flex justify-between items-start mb-4 gap-3 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-3 py-1 text-xs rounded-full ${typeBadge(row.type)}`}>
                {typeLabel(row.type)}
              </span>

              {row.is_pinned && (
                <span className="px-3 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                  ★ Doporučeno
                </span>
              )}

              {row.category && <span className="text-xs text-slate-500">{row.category}</span>}

              {row.location && <span className="text-xs text-slate-500">• {row.location}</span>}
            </div>

            <div className="flex gap-2">
              {isAdmin && (
                <button
                  disabled={busy}
                  onClick={() => togglePinned(!row.is_pinned)}
                  className={`text-sm px-3 py-1 border rounded-lg hover:bg-slate-100 ${
                    row.is_pinned ? "border-yellow-300" : "border-slate-200"
                  }`}
                  title="Připnutí ovládá pouze admin"
                >
                  {row.is_pinned ? "Odepnout" : "⭐ Připnout"}
                </button>
              )}

              {isOwner && (
                <>
                  <Link
                    href={`/portal/inzerce/edit/${row.id}`}
                    className="text-sm px-3 py-1 border rounded-lg hover:bg-slate-100"
                  >
                    ✏ Upravit
                  </Link>

                  <button
                    disabled={busy}
                    onClick={closePost}
                    className="text-sm px-3 py-1 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
                  >
                    Uzavřít
                  </button>
                </>
              )}
            </div>
          </div>

          <h1 className="text-2xl font-semibold mb-4">{row.title}</h1>

          {images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              {images.map((img, i) => (
                <img
                  key={i}
                  src={getPublicUrl(img.file_path)}
                  alt=""
                  className="rounded-xl object-cover w-full h-48 border border-slate-200"
                />
              ))}
            </div>
          )}

          <div className="text-slate-700 mb-6 whitespace-pre-wrap">{row.description}</div>

          <div className="border-t pt-4 text-sm text-slate-600 space-y-1">
            {row.contact_name && (
              <div>
                <strong>Kontakt:</strong> {row.contact_name}
              </div>
            )}
            {row.contact_email && (
              <div>
                <strong>E-mail:</strong>{" "}
                <a href={`mailto:${row.contact_email}`} className="text-slate-900 hover:underline">
                  {row.contact_email}
                </a>
              </div>
            )}
            {row.contact_phone && (
              <div>
                <strong>Telefon:</strong>{" "}
                <a href={`tel:${row.contact_phone}`} className="text-slate-900 hover:underline">
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
