import { useMemo, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import RequireAuth from "../../../components/RequireAuth";
import PortalHeader from "../../../components/PortalHeader";
import { supabase } from "../../../lib/supabaseClient";

const BUCKET = "marketplace";

// UI (CZ) -> DB type (EN) + DB kind (CZ)
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
  "Partnerství", // ✅ nové
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

function toISODateOrNull(v) {
  if (!v) return null;
  const d = new Date(v + "T00:00:00");
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

function makeTitle(description, typeLabel, category) {
  const clean = String(description || "").trim().replace(/\s+/g, " ");
  const short = clean.slice(0, 80);
  const prefixParts = [];
  if (typeLabel) prefixParts.push(typeLabel);
  if (category) prefixParts.push(category);
  const prefix = prefixParts.length ? prefixParts.join(" · ") + " — " : "";
  return (prefix + short).slice(0, 120);
}

function isValidEmail(email) {
  // stačí rozumná klientská validace – DB má ještě svůj regex constraint
  const e = String(email || "").trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

export default function NovyInzerat() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // "kind" value = nabidka/poptavka/spoluprace (CZ)
  const [kind, setKind] = useState("nabidka");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");

  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  const [files, setFiles] = useState([]);

  const selectedType = useMemo(
    () => TYPE_OPTIONS.find((o) => o.value === kind) || TYPE_OPTIONS[0],
    [kind]
  );

  const canSubmit = useMemo(() => {
    if (description.trim().length < 1) return false;
    if (!isValidEmail(contactEmail)) return false;
    // telefon není povinný, ale pokud je vyplněn, min. 6 znaků (DB constraint)
    if (contactPhone.trim().length > 0 && contactPhone.trim().length < 6) return false;
    return true;
  }, [description, contactEmail, contactPhone]);

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");

    if (description.trim().length < 1) {
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

    setLoading(true);

    const { data: userData, error: userErr } = await supabase.auth.getUser();
    const user = userData?.user;

    if (userErr || !user) {
      setErr("Nejste přihlášen.");
      setLoading(false);
      return;
    }

    const cat = category?.trim() || "";
    const title = makeTitle(description, selectedType.label, cat);

    // ✅ DB CHECK: type musí být offer|demand|partnership
    // ✅ DB CHECK: kind je CZ (nabidka|poptavka|... podle marketplace_posts_kind_allowed)
    const payload = {
      author_id: user.id,
      type: selectedType.dbType, // offer / demand / partnership
      kind: selectedType.value,  // nabidka / poptavka / spoluprace
      title,
      category: cat || null,
      description: description.trim(),

      contact_name: contactName?.trim() || null,
      contact_email: contactEmail.trim(), // ✅ povinné
      contact_phone: contactPhone?.trim() || null, // volitelné (ale pokud vyplněno, DB chce min length)

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

    // Upload fotek + záznam do marketplace_attachments
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
      } catch {
        // nepadáme kvůli jedné fotce
      }
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
            <p className="text-slate-600 mt-1">Vyplň typ, rubriku, popis a případně přidej fotky.</p>
          </div>

          <Link
            href="/portal/inzerce"
            className="px-4 py-2 rounded-xl border border-slate-200 hover:border-slate-300 bg-white"
          >
            Zpět na inzerci
          </Link>
        </div>

        {err ? (
          <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700">{err}</div>
        ) : null}

        <form onSubmit={onSubmit} className="mt-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <div className="p-5 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelCls()}>Typ inzerátu</label>
                <select className={inputCls()} value={kind} onChange={(e) => setKind(e.target.value)}>
                  {TYPE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
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
              <p className={helpCls()}>Nadpis se vytvoří automaticky z popisu.</p>
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
                <label className={labelCls()}>E-mail *</label>
                <input
                  className={clsx(inputCls(), !isValidEmail(contactEmail) && contactEmail.length > 0 ? "border-red-300" : "")}
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="např. jan@obec.cz"
                />
                <p className={helpCls()}>E-mail je povinný.</p>
              </div>
              <div>
                <label className={labelCls()}>Telefon</label>
                <input
                  className={inputCls()}
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+420 ..."
                />
                <p className={helpCls()}>Volitelné (když vyplníš, min. 6 znaků).</p>
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
              className={clsx(
                "px-4 py-2 rounded-xl text-white",
                !canSubmit || loading ? "bg-slate-400" : "bg-slate-900 hover:bg-slate-800"
              )}
            >
              {loading ? "Ukládám…" : "Uložit inzerát"}
            </button>

            <Link
              href="/portal/inzerce"
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
