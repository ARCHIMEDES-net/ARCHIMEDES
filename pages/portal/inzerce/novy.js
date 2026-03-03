import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import RequireAuth from "../../../components/RequireAuth";
import PortalHeader from "../../../components/PortalHeader";
import { supabase } from "../../../lib/supabaseClient";

const KIND_OPTIONS = [
  { value: "nabidka", label: "Nabídka" },
  { value: "poptavka", label: "Poptávka" },
  { value: "sluzba", label: "Služba" },
  { value: "pozvanka", label: "Pozvánka" },
  { value: "dobrovolnictvi", label: "Dobrovolnictví" },
  { value: "ztraty_a_nalezy", label: "Ztráty & nálezy" },
];

function toISODateOrNull(v) {
  if (!v) return null;
  const d = new Date(v + "T00:00:00");
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

export default function NovyInzerat() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [kind, setKind] = useState("nabidka");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState([]);

  const canSubmit = useMemo(() => description.trim().length >= 10, [description]);

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");

    if (!canSubmit) {
      setErr("Popis musí mít alespoň 10 znaků.");
      return;
    }

    setLoading(true);

    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;

    if (!user) {
      setErr("Nejste přihlášen.");
      setLoading(false);
      return;
    }

    // 1️⃣ Vytvořit inzerát
    const { data: post, error: postError } = await supabase
      .from("marketplace_posts")
      .insert({
        author_id: user.id,
        kind,
        category: category || null,
        description,
        status: "active",
        is_closed: false,
      })
      .select("id")
      .single();

    if (postError) {
      setErr(postError.message);
      setLoading(false);
      return;
    }

    const postId = post.id;

    // 2️⃣ Upload fotek
    for (let file of files) {
      const filePath = `${postId}/${Date.now()}-${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("marketplace")
        .upload(filePath, file);

      if (uploadError) continue;

      await supabase.from("marketplace_attachments").insert({
        post_id: postId,
        file_path: filePath,
        mime_type: file.type,
      });
    }

    router.push("/portal/inzerce");
  }

  return (
    <RequireAuth>
      <PortalHeader />

      <div className="max-w-3xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-semibold mb-4">Nový inzerát</h1>

        {err && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-xl">
            {err}
          </div>
        )}

        <form onSubmit={onSubmit} className="bg-white p-6 rounded-2xl shadow border">

          <div className="mb-4">
            <label className="block text-sm font-medium">Typ</label>
            <select
              className="mt-1 w-full border rounded-xl p-2"
              value={kind}
              onChange={(e) => setKind(e.target.value)}
            >
              {KIND_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium">Rubrika</label>
            <input
              className="mt-1 w-full border rounded-xl p-2"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="např. Vybavení školy"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium">Popis *</label>
            <textarea
              className="mt-1 w-full border rounded-xl p-3 min-h-[150px]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* 📷 Upload fotek */}
          <div className="mb-4">
            <label className="block text-sm font-medium">
              Fotky (můžeš vybrat více)
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => setFiles([...e.target.files])}
              className="mt-2"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-slate-900 text-white px-4 py-2 rounded-xl"
            >
              {loading ? "Ukládám..." : "Uložit inzerát"}
            </button>

            <Link
              href="/portal/inzerce"
              className="border px-4 py-2 rounded-xl"
            >
              Zrušit
            </Link>
          </div>

        </form>
      </div>
    </RequireAuth>
  );
}
