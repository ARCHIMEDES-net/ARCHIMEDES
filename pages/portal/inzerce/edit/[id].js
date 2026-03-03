import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
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

const CATEGORY_OPTIONS = [
  "Vybavení školy",
  "Učebnice a pomůcky",
  "Technologie a IT",
  "Nábytek",
  "Sportovní vybavení",
  "Knihy a čtenářský klub",
  "Kultura a akce",
  "Partnerství",
  "Volnočasové kroužky",
  "Wellbeing",
  "Senior klub",
  "Komunita a spolky",
  "Služby",
  "Ostatní",
];

function clsx(...xs) {
  return xs.filter(Boolean).join(" ");
}
function inputCls() {
  return "mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-slate-300";
}
function labelCls() {
  return "block text-sm font-medium text-slate-700";
}
function helpCls() {
  return "mt-1 text-xs text-slate-500";
}

function isValidEmail(email) {
  const e = String(email || "").trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}
function isImageFile(file) {
  if (!file) return false;
  if (file.type && file.type.startsWith("image/")) return true;
  const n = (file.name || "").toLowerCase();
  return n.endsWith(".png") || n.endsWith(".jpg") || n.endsWith(".jpeg") || n.endsWith(".webp") || n.endsWith(".gif");
}

export default function EditInzerat() {
  const router = useRouter();
  const { id } = router.query;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const [row, setRow] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  const [kind, setKind] = useState("nabidka");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState(""); // ✅ nové
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

      setLoading(true);
      setErr("");

      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user || null;
      setCurrentUser(user);

      const { data, error } = await supabase
        .from("marketplace_posts")
        .select(
          `
          *,
          marketplace_attachments (
            id,
            file_path,
            file_name,
            file_size,
            is_image,
            mime_type
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

      // ✅ jen autor může editovat
      if (!user || data.author_id !== user.id) {
        router.replace(`/portal/inzerce/${id}`);
        return;
      }

      setRow(data);
      setKind(data.kind || "nabidka");
      setCategory(data.category || "");
      setLocation(data.location || ""); // ✅
      setDescription(data.description || "");
      setContactName(data.contact_name || "");
      setContactEmail(data.contact_email || "");
      setContactPhone(data.contact_phone || "");
      setLoading(false);
    }

    load();
  }, [id, router]);

  function getPublicUrl(path) {
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return data?.publicUrl || null;
  }

  async function save(e) {
    e?.preventDefault?.();
    if (!row) return;

    setErr("");

    if (!description.trim()) {
      setErr("Prosím vyplň popis.");
      return;
    }
    if (!isValidEmail(contactEmail)) {
      setErr("Prosím vyplň platný e-mail (je povinný).");
      return;
    }
    if (contactPhone.trim().length > 0 && contactPhone.trim().length < 6) {
      setErr("Telefon musí mít alespoň 6 znaků, nebo ho nech prázdný.");
      return;
    }

    setSaving(true);

    const cat = category?.trim() || "";
    const loc = location?.trim() || "";

    const { error } = await supabase
      .from("marketplace_posts")
      .update({
        type: selectedType.dbType,
        kind: selectedType.value,
        category: cat || null,
        location: loc || null, // ✅
        description: description.trim(),
        contact_name: contactName?.trim() || null,
        contact_email: contactEmail.trim(),
        contact_phone: contactPhone?.trim() || null,
      })
      .eq("id", row.id);

    if (error) {
      setErr(error.message);
      setSaving(false);
      return;
    }

    // upload nové fotky
    const uploadErrors = [];
    for (const file of files || []) {
      const safeName = (file.name || "soubor").replace(/\s+/g, "_");
      const path = `${row.id}/${Date.now()}-${safeName}`;

      const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type || "application/octet-stream",
      });

      if (upErr) {
        uploadErrors.push(`Upload ${safeName}: ${upErr.message}`);
        continue;
      }

      const { error: attErr } = await supabase.from("marketplace_attachments").insert({
        post_id: row.id,
        author_id: row.author_id,
        file_name: file.name || safeName,
        file_path: path,
        file_size: typeof file.size === "number" ? file.size : null,
        is_image: isImageFile(file),
        mime_type: file.type || null,
      });

      if (attErr) uploadErrors.push(`DB attachment ${safeName}: ${attErr.message}`);
    }

    if (uploadErrors.length) {
      setErr("Změny byly uloženy, ale některé fotky se nepodařilo uložit:\n" + uploadErrors.join("\n"));
      setSaving(false);
      return;
    }

    router.push(`/portal/inzerce/${row.id}`);
  }

  async function deletePhoto(photoId, filePath) {
    if (!confirm("Smazat tuto fotku?")) return;

    setBusy(true);

    const { error: sErr } = await supabase.storage.from(BUCKET).remove([filePath]);
    const { error: dErr } = await supabase.from("marketplace_attachments").delete().eq("id", photoId);

    setBusy(false);

    if (sErr || dErr) {
      alert((sErr || dErr)?.message || "Nepodařilo se smazat fotku.");
      return;
    }

    setRow((r) => ({
      ...r,
      marketplace_attachments: (r.marketplace_attachments || []).filter((p) => p.id !== photoId),
    }));
  }

  if (loading) return <div className="p-6">Načítám…</div>;
  if (err && !row) return <div className="p-6 text-red-600">{err}</div>;
  if (!row) return <div className="p-6">Inzerát nenalezen.</div>;

  const photos = (row.marketplace_attachments || []).filter((a) => a.is_image);

  return (
    <RequireAuth>
      <PortalHeader />

      <div className="max-w-4xl mx-auto px-4 py-6">
        <Link href={`/portal/inzerce/${row.id}`} className="text-sm text-slate-500 hover:underline">
          ← Zpět na detail
        </Link>

        <div className="flex items-start justify-between gap-4 flex-wrap mt-4">
          <div>
            <h1 className="text-2xl font-semibold">Upravit inzerát</h1>
            <p className="text-slate-600 mt-1">Uprav texty, lokalitu a spravuj fotky.</p>
          </div>
        </div>

        {err ? (
          <pre className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 whitespace-pre-wrap">
            {err}
          </pre>
        ) : null}

        <form onSubmit={save} className="mt-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <div className="p-5 md:p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelCls()}>Typ inzerátu</label>
                <select className={inputCls()} value={kind} onChange={(e) => setKind(e.target.value)}>
                  {TYPE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <p className={helpCls()}>
                  Ukládá se jako <code>type</code> ({selectedType.dbType}) a <code>kind</code> ({selectedType.value}).
                </p>
              </div>

              <div>
                <label className={labelCls()}>Rubrika</label>
                <input
                  className={inputCls()}
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="např. Vybavení školy"
                  list="category-list"
                />
                <datalist id="category-list">
                  {CATEGORY_OPTIONS.map((c) => (<option key={c} value={c} />))}
                </datalist>
              </div>
            </div>

            <div>
              <label className={labelCls()}>Lokalita</label>
              <input
                className={inputCls()}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="např. Hodonín / Křenov / Praha"
              />
              <p className={helpCls()}>Inzerce je globální – lokalita pomáhá orientaci.</p>
            </div>

            <div>
              <label className={labelCls()}>Popis *</label>
              <textarea
                className={inputCls() + " min-h-[180px]"}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className={labelCls()}>Kontaktní osoba</label>
                <input className={inputCls()} value={contactName} onChange={(e) => setContactName(e.target.value)} />
              </div>
              <div>
                <label className={labelCls()}>E-mail *</label>
                <input className={inputCls()} value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
              </div>
              <div>
                <label className={labelCls()}>Telefon</label>
                <input className={inputCls()} value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
                <p className={helpCls()}>Volitelné (když vyplníš, min. 6 znaků).</p>
              </div>
            </div>

            <div>
              <label className={labelCls()}>Přidat nové fotky</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => setFiles(Array.from(e.target.files || []))}
                className="mt-2 block"
              />
              <p className={helpCls()}>Můžeš vybrat více souborů.</p>
            </div>

            {photos.length > 0 && (
              <div>
                <div className="text-sm font-medium text-slate-700 mb-2">Existující fotky</div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {photos.map((p) => (
                    <div key={p.id} className="relative">
                      <img
                        src={getPublicUrl(p.file_path)}
                        alt=""
                        className="rounded-xl h-40 w-full object-cover border border-slate-200"
                      />
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => deletePhoto(p.id, p.file_path)}
                        className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded-lg hover:bg-red-700"
                      >
                        Smazat
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="px-5 md:px-6 py-4 border-t border-slate-200 bg-slate-50 rounded-b-2xl flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className={clsx(
                "px-4 py-2 rounded-xl text-white",
                saving ? "bg-slate-400" : "bg-slate-900 hover:bg-slate-800"
              )}
            >
              {saving ? "Ukládám…" : "Uložit změny"}
            </button>

            <Link
              href={`/portal/inzerce/${row.id}`}
              className="px-4 py-2 rounded-xl border border-slate-200 hover:border-slate-300 bg-white"
            >
              Zrušit
            </Link>
          </div>
        </form>
      </div>
    </RequireAuth>
  );
}
