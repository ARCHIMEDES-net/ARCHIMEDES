import { useRouter } from "next/router";
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import RequireAuth from "../../../../components/RequireAuth";
import PortalHeader from "../../../../components/PortalHeader";
import { supabase } from "../../../../lib/supabaseClient";

const BUCKET = "marketplace";

const TYPE_OPTIONS = [
  { value: "nabidka", label: "Nabídka", dbType: "offer" },
  { value: "poptavka", label: "Poptávka", dbType: "demand" },
  { value: "spoluprace", label: "Spolupráce", dbType: "partnership" },
];

export default function EditInzerat() {
  const router = useRouter();
  const { id } = router.query;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [row, setRow] = useState(null);

  const [kind, setKind] = useState("nabidka");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [files, setFiles] = useState([]);

  const selectedType = useMemo(
    () => TYPE_OPTIONS.find((o) => o.value === kind) || TYPE_OPTIONS[0],
    [kind]
  );

  useEffect(() => {
    async function load() {
      if (!id) return;

      const { data, error } = await supabase
        .from("marketplace_posts")
        .select(`
          *,
          marketplace_attachments (*)
        `)
        .eq("id", id)
        .single();

      if (error) {
        setErr(error.message);
        setLoading(false);
        return;
      }

      setRow(data);
      setKind(data.kind);
      setCategory(data.category || "");
      setDescription(data.description || "");
      setContactName(data.contact_name || "");
      setContactEmail(data.contact_email || "");
      setContactPhone(data.contact_phone || "");
      setLoading(false);
    }

    load();
  }, [id]);

  function getPublicUrl(path) {
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return data?.publicUrl;
  }

  async function save() {
    setSaving(true);
    setErr("");

    const { error } = await supabase
      .from("marketplace_posts")
      .update({
        type: selectedType.dbType,
        kind: selectedType.value,
        category,
        description,
        contact_name: contactName,
        contact_email: contactEmail,
        contact_phone: contactPhone,
      })
      .eq("id", id);

    if (error) {
      setErr(error.message);
      setSaving(false);
      return;
    }

    // upload nové fotky
    for (const file of files) {
      const path = `${id}/${Date.now()}-${file.name}`;

      await supabase.storage.from(BUCKET).upload(path, file);

      await supabase.from("marketplace_attachments").insert({
        post_id: id,
        author_id: row.author_id,
        file_name: file.name,
        file_path: path,
        file_size: file.size,
        is_image: true,
        mime_type: file.type,
      });
    }

    router.push(`/portal/inzerce/${id}`);
  }

  async function deletePhoto(photoId, filePath) {
    if (!confirm("Smazat tuto fotku?")) return;

    await supabase.storage.from(BUCKET).remove([filePath]);
    await supabase
      .from("marketplace_attachments")
      .delete()
      .eq("id", photoId);

    setRow({
      ...row,
      marketplace_attachments: row.marketplace_attachments.filter(
        (p) => p.id !== photoId
      ),
    });
  }

  if (loading) return <div className="p-6">Načítám…</div>;
  if (!row) return <div className="p-6">Inzerát nenalezen.</div>;

  return (
    <RequireAuth>
      <PortalHeader />

      <div className="max-w-4xl mx-auto px-4 py-6">

        <Link
          href={`/portal/inzerce/${id}`}
          className="text-sm text-slate-500 hover:underline"
        >
          ← Zpět na detail
        </Link>

        <h1 className="text-2xl font-semibold mt-4 mb-6">
          Upravit inzerát
        </h1>

        {err && (
          <div className="p-3 mb-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
            {err}
          </div>
        )}

        <div className="space-y-4">

          <select
            className="w-full border rounded-xl p-2"
            value={kind}
            onChange={(e) => setKind(e.target.value)}
          >
            {TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>

          <input
            className="w-full border rounded-xl p-2"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Rubrika"
          />

          <textarea
            className="w-full border rounded-xl p-3 min-h-[150px]"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <input
            className="w-full border rounded-xl p-2"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            placeholder="Kontaktní osoba"
          />

          <input
            className="w-full border rounded-xl p-2"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            placeholder="E-mail"
          />

          <input
            className="w-full border rounded-xl p-2"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
            placeholder="Telefon"
          />

          <div>
            <label className="block mb-2">Nové fotky</label>
            <input
              type="file"
              multiple
              onChange={(e) => setFiles(Array.from(e.target.files))}
            />
          </div>

          {row.marketplace_attachments?.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {row.marketplace_attachments.map((p) => (
                <div key={p.id} className="relative">
                  <img
                    src={getPublicUrl(p.file_path)}
                    className="rounded-xl h-40 w-full object-cover"
                  />
                  <button
                    onClick={() => deletePhoto(p.id, p.file_path)}
                    className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded"
                  >
                    Smazat
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={save}
            disabled={saving}
            className="px-4 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800"
          >
            {saving ? "Ukládám…" : "Uložit změny"}
          </button>

        </div>
      </div>
    </RequireAuth>
  );
}
