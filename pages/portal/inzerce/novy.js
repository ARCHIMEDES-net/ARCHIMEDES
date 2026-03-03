import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import RequireAuth from "../../../components/RequireAuth";
import PortalHeader from "../../../components/PortalHeader";
import { supabase } from "../../../lib/supabaseClient";

const BUCKET = "marketplace";

const KIND_OPTIONS = [
  { value: "nabidka", label: "Nabídka" },
  { value: "poptavka", label: "Poptávka" },
  { value: "sluzba", label: "Služba" },
  { value: "pozvanka", label: "Pozvánka" },
  { value: "dobrovolnictvi", label: "Dobrovolnictví" },
  { value: "ztraty_a_nalezy", label: "Ztráty & nálezy" },
];

// ✅ pevný seznam rubrik (můžeš kdykoli rozšířit)
const CATEGORY_OPTIONS = [
  "Vybavení školy",
  "Učebnice a pomůcky",
  "Technologie a IT",
  "Nábytek",
  "Sportovní vybavení",
  "Knihy a čtenářský klub",
  "Kultura a akce",
  "Volnočasové kroužky",
  "Wellbeing",
  "Senior klub",
  "Komunita a spolky",
  "Dobrovolnictví",
  "Služby",
  "Ostatní",
];

function toISODateOrNull(v) {
  if (!v) return null;
  const d = new Date(v + "T00:00:00");
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
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

export default function NovyInzerat() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [kind, setKind] = useState("nabidka");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");

  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  const [files, setFiles] = useState([]);

  // stačí cokoliv (ale ne prázdné)
  const canSubmit = useMemo(() => description.trim().length >= 1, [description]);

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");

    if (!canSubmit) {
      setErr("Prosím vyplň popis.");
      return;
    }

    setLoading(true);

    const { data: userData, error: userErr } = await supabase.auth.getUser();
    const user = userData?.user;

    if (userErr || !user) {
      setErr("Nejste přihlášen.");
      setLoading(false);
      return;
    }

    // ✅ důležité: posíláme i 'type' kvůli NOT NULL constraintu
    const payload = {
      author_id: user.id,
      kind,
      type: kind, // <- klíčová oprava
      category: category?.trim() || null,
      description: description.trim(),
      contact_name: contactName?.trim() || null,
      contact_email: contactEmail?.trim() || null,
      contact_phone: contactPhone?.trim() || null,
      expires_at: toISODateOrNull(expiresAt),
      status: "active",
      is_closed: false,
      is_pinned: false,
      is_archimedes: false,
    };

    const { data: post, error: postError } = await supabase
      .from("marketplace_posts")
      .insert(payload)
      .select("id")
      .single();

    if (postError) {
      setErr(postError.message || "Chyba při ukládání inzerátu.");
      setLoading(false);
      return;
    }

    const postId = post.id;

    // Upload fotek
    for (const file of files || []) {
      try {
        const safeName = file.name.replace(/\s+/g, "_");
        const path = `${postId}/${Date.now()}-${safeName}`;

        const up = await supabase.storage.from(BUCKET).upload(path, file, {
          cacheControl: "3600",
          upsert: false,
        });

        if (up.error) continue;

        await supabase.from("marketplace_attachments").insert({
          post_id: postId,
          file_path: path,
          mime_type: file.type || null,
        });
      } catch (e2) {}
    }

    router.push("/portal/inzerce");
  }

  return (
    <RequireAuth>
      <PortalHeader />

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-semibold">Nový inzerát</h1>
            <p className="text-slate-600 mt-1">
              Vyplň typ, rubriku, popis a případně přidej fotky.
            </p>
          </div>

          <Link
            href="/portal/inzerce"
            className="px-4 py-2 rounded-xl border border-slate-200 hover:border-slate-300 bg-white"
          >
            Zpět na inzerci
          </Link>
        </div>

        {err ? (
          <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700">
            {err}
          </div>
        ) : null}

        <form onSubmit={onSubmit} className="mt-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <div className="p-5 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelCls()}>Typ inzerátu</label>
                <select className={inputCls()} value={kind} onChange={(e) => setKind(e.target.value)}>
                  {KIND_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
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
                  {CATEGORY_OPTIONS.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
                <p className={helpCls()}>Vyber z nabídky nebo napiš vlastní.</p>
              </div>
            </div>

            <div className="mt-5">
              <label className={labelCls()}>Popis *</label>
              <textarea
                className={inputCls() + " min-h-[180px]"}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Napiš stručně co nabízíš / poptáváš, podmínky, cenu, kde, atd."
              />
            </div>

            <div className="mt-5">
              <label className={labelCls()}>Fotky</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => setFiles(Array.from(e.target.files || []))}
                className="mt-2 block"
              />
              <p className={helpCls()}>Můžeš vybrat více souborů.</p>
            </div>

            <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className={labelCls()}>Kontaktní osoba</label>
                <input className={inputCls()} value={contactName} onChange={(e) => setContactName(e.target.value)} />
              </div>
              <div>
                <label className={labelCls()}>E-mail</label>
                <input className={inputCls()} value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
              </div>
              <div>
                <label className={labelCls()}>Telefon</label>
                <input className={inputCls()} value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
              </div>
            </div>

            <div className="mt-5">
              <label className={labelCls()}>Platnost do</label>
              <input
                type="date"
                className={inputCls() + " w-auto"}
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
              />
              <p className={helpCls()}>Když necháš prázdné, inzerát nebude automaticky expirovat.</p>
            </div>
          </div>

          <div className="px-5 md:px-6 py-4 border-t border-slate-200 bg-slate-50 rounded-b-2xl flex gap-2">
            <button
              type="submit"
              disabled={!canSubmit || loading}
              className={[
                "px-4 py-2 rounded-xl text-white",
                !canSubmit || loading ? "bg-slate-400" : "bg-slate-900 hover:bg-slate-800",
              ].join(" ")}
            >
              {loading ? "Ukládám…" : "Uložit inzerát"}
            </button>

            <Link href="/portal/inzerce" className="px-4 py-2 rounded-xl border border-slate-200 hover:border-slate-300 bg-white">
              Zrušit
            </Link>
          </div>
        </form>
      </div>
    </RequireAuth>
  );
}
