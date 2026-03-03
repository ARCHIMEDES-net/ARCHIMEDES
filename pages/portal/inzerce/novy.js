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
  // očekáváme "YYYY-MM-DD"
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
  const [categories, setCategories] = useState([]);

  const [description, setDescription] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [expiresAt, setExpiresAt] = useState(""); // YYYY-MM-DD

  const canSubmit = useMemo(() => {
    return description.trim().length >= 10;
  }, [description]);

  async function loadCategories() {
    // vytáhneme existující rubriky z DB, ať je to pohodlné
    const { data, error } = await supabase
      .from("marketplace_posts")
      .select("category")
      .not("category", "is", null);

    if (error) return;

    const set = new Set();
    for (const r of data || []) {
      if (r?.category && String(r.category).trim()) set.add(String(r.category).trim());
    }
    setCategories(Array.from(set).sort((a, b) => a.localeCompare(b, "cs")));
  }

  useEffect(() => {
    loadCategories();
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");

    if (!canSubmit) {
      setErr("Popis musí mít alespoň 10 znaků.");
      return;
    }

    setLoading(true);

    // vezmeme přihlášeného uživatele jako author_id
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData?.user) {
      setErr("Nejste přihlášen.");
      setLoading(false);
      return;
    }

    const payload = {
      author_id: userData.user.id,
      kind, // nový typ inzerátu
      category: category?.trim() || null, // rubrika
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

    const { data, error } = await supabase
      .from("marketplace_posts")
      .insert(payload)
      .select("id")
      .single();

    if (error) {
      setErr(error.message || "Chyba při ukládání inzerátu.");
      setLoading(false);
      return;
    }

    // po vytvoření jdeme na detail (pokud detail ještě nemáš, klidně do /portal/inzerce)
    const newId = data?.id;
    if (newId) {
      router.push(`/portal/inzerce/${newId}?edit=1`);
    } else {
      router.push("/portal/inzerce");
    }
  }

  return (
    <RequireAuth>
      <PortalHeader />

      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-semibold">Nový inzerát</h1>
            <p className="text-slate-600 mt-1">
              Vyplň typ (nabídka/poptávka…), rubriku a popis. Fotky se doplní v detailu po uložení.
            </p>
          </div>

          <Link
            href="/portal/inzerce"
            className="px-4 py-2 rounded-xl border border-slate-200 hover:border-slate-300"
          >
            Zpět na inzerci
          </Link>
        </div>

        {err ? (
          <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700">
            {err}
          </div>
        ) : null}

        <form onSubmit={onSubmit} className="mt-6 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Typ */}
            <div>
              <label className="block text-sm font-medium text-slate-700">Typ inzerátu</label>
              <select
                className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                value={kind}
                onChange={(e) => setKind(e.target.value)}
              >
                {KIND_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-slate-500">
                Typ = nabídka/poptávka/služba… (nový sloupec <code>kind</code>)
              </p>
            </div>

            {/* Rubrika */}
            <div>
              <label className="block text-sm font-medium text-slate-700">Rubrika</label>
              <input
                className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="např. Vybavení školy"
                list="category-list"
              />
              <datalist id="category-list">
                {categories.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
              <p className="mt-1 text-xs text-slate-500">
                Rubrika = tematické členění (sloupec <code>category</code>)
              </p>
            </div>
          </div>

          {/* Popis */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-slate-700">Popis *</label>
            <textarea
              className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 min-h-[160px]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Napiš stručně co nabízíš / poptáváš, podmínky, cenu, kde, atd."
            />
            <p className="mt-1 text-xs text-slate-500">Minimálně 10 znaků.</p>
          </div>

          {/* Kontakt */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Kontaktní osoba</label>
              <input
                className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="Jméno"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">E-mail</label>
              <input
                className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="email@..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Telefon</label>
              <input
                className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+420 ..."
              />
            </div>
          </div>

          {/* Expirace */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-slate-700">Platnost do</label>
            <input
              type="date"
              className="mt-1 px-3 py-2 rounded-xl border border-slate-200"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
            />
            <p className="mt-1 text-xs text-slate-500">
              Když necháš prázdné, inzerát nebude automaticky expirovat.
            </p>
          </div>

          {/* Tlačítka */}
          <div className="mt-6 flex gap-2">
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

            <Link
              href="/portal/inzerce"
              className="px-4 py-2 rounded-xl border border-slate-200 hover:border-slate-300"
            >
              Zrušit
            </Link>
          </div>
        </form>
      </div>
    </RequireAuth>
  );
}
