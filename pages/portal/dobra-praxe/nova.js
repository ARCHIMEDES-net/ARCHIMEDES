import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import RequireAuth from "../../../components/RequireAuth";
import PortalHeader from "../../../components/PortalHeader";
import { supabase } from "../../../lib/supabaseClient";

const BUCKET = "dobra-praxe";
const MAX_TITLE_LEN = 80;
const MAX_BODY_LEN = 2000;
const MAX_PHOTOS = 5;

const CATEGORY_LABELS = {
  obec: "Obec",
  spolek: "Spolek",
  skola: "Škola",
  seniori: "Senioři",
};

const STATUS_LABELS = {
  pending: "Čeká na schválení",
  approved: "Schváleno",
  rejected: "Zamítnuto",
};

function orgTypeToCategory(orgType) {
  const t = String(orgType || "").toLowerCase();
  if (t === "obec" || t === "municipality") return "obec";
  if (t === "school") return "skola";
  if (t === "senior_club") return "seniori";
  // spolek, association, community_center, partner, diaspora — nejbližší
  // shoda je "spolek" (obecná komunitní organizace mimo obec/školu/seniory).
  return "spolek";
}

function isAllowedPhoto(file) {
  const type = (file?.type || "").toLowerCase();
  if (type === "image/jpeg" || type === "image/webp") return true;
  const name = (file?.name || "").toLowerCase();
  return name.endsWith(".jpg") || name.endsWith(".jpeg") || name.endsWith(".webp");
}

function inputCls() {
  return "mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-slate-300";
}
function labelCls() {
  return "block text-sm font-medium text-slate-700";
}

export default function NovaDobraPraxe() {
  const router = useRouter();
  const editId = typeof router.query.id === "string" ? router.query.id : "";

  const [loadingContext, setLoadingContext] = useState(true);
  const [user, setUser] = useState(null);
  const [org, setOrg] = useState(null);
  const [isOrgAdmin, setIsOrgAdmin] = useState(false);

  const [myPosts, setMyPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [existingPhotos, setExistingPhotos] = useState([]); // storage paths kept from edited post
  const [newFiles, setNewFiles] = useState([]);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [notice, setNotice] = useState("");

  const category = useMemo(() => orgTypeToCategory(org?.org_type), [org?.org_type]);

  useEffect(() => {
    let alive = true;

    async function loadContext() {
      try {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();
        if (!alive) return;
        setUser(authUser || null);
        if (!authUser) return;

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("active_organization_id")
          .eq("id", authUser.id)
          .maybeSingle();
        if (profileError) throw profileError;
        if (!alive) return;

        if (!profile?.active_organization_id) {
          setLoadingContext(false);
          return;
        }

        const [{ data: membership }, { data: orgRow }] = await Promise.all([
          supabase
            .from("organization_members")
            .select("role_in_org, status")
            .eq("user_id", authUser.id)
            .eq("organization_id", profile.active_organization_id)
            .eq("status", "active")
            .maybeSingle(),
          supabase
            .from("organizations")
            .select("id, name, org_type")
            .eq("id", profile.active_organization_id)
            .maybeSingle(),
        ]);
        if (!alive) return;

        setIsOrgAdmin(membership?.role_in_org === "organization_admin");
        setOrg(orgRow || null);
      } catch (e) {
        if (!alive) return;
        setErr(e?.message || "Nepodařilo se načíst organizaci.");
      } finally {
        if (alive) setLoadingContext(false);
      }
    }

    loadContext();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;

    async function loadMyPosts() {
      if (!org?.id) {
        setLoadingPosts(false);
        return;
      }
      setLoadingPosts(true);
      const { data, error } = await supabase
        .from("best_practice_posts")
        .select("id, title, body, photo_paths, status, created_at")
        .eq("organization_id", org.id)
        .order("created_at", { ascending: false });
      if (!alive) return;
      if (!error) setMyPosts(data || []);
      setLoadingPosts(false);
    }

    loadMyPosts();
    return () => {
      alive = false;
    };
  }, [org?.id, saving]);

  useEffect(() => {
    if (!editId || !myPosts.length) return;
    const post = myPosts.find((p) => p.id === editId);
    if (!post) return;
    if (post.status !== "pending") return;
    setTitle(post.title || "");
    setBody(post.body || "");
    setExistingPhotos(post.photo_paths || []);
  }, [editId, myPosts]);

  function getPhotoUrl(path) {
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return data?.publicUrl || "";
  }

  function onFilesChange(e) {
    const files = Array.from(e.target.files || []);
    const invalid = files.filter((f) => !isAllowedPhoto(f));
    if (invalid.length) {
      setErr("Fotky musí být ve formátu jpg nebo webp.");
      return;
    }
    setErr("");
    setNewFiles(files);
  }

  function resetForm() {
    setTitle("");
    setBody("");
    setExistingPhotos([]);
    setNewFiles([]);
    router.replace("/portal/dobra-praxe/nova");
  }

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setNotice("");

    if (!title.trim()) {
      setErr("Vyplňte nadpis.");
      return;
    }
    if (title.trim().length > MAX_TITLE_LEN) {
      setErr(`Nadpis může mít nejvýš ${MAX_TITLE_LEN} znaků.`);
      return;
    }
    if (!body.trim()) {
      setErr("Vyplňte text příspěvku.");
      return;
    }
    if (body.trim().length > MAX_BODY_LEN) {
      setErr(`Text může mít nejvýš ${MAX_BODY_LEN} znaků.`);
      return;
    }

    const totalPhotos = existingPhotos.length + newFiles.length;
    if (totalPhotos < 1) {
      setErr("Přidejte alespoň jednu fotku.");
      return;
    }
    if (totalPhotos > MAX_PHOTOS) {
      setErr(`Nejvýš ${MAX_PHOTOS} fotek.`);
      return;
    }

    setSaving(true);
    try {
      const uploadedPaths = [];
      for (let i = 0; i < newFiles.length; i += 1) {
        const file = newFiles[i];
        const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
        const path = `${org.id}/${Date.now()}-${i}.${ext}`;
        const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type || "image/jpeg",
        });
        if (upErr) throw upErr;
        uploadedPaths.push(path);
      }

      const photo_paths = [...existingPhotos, ...uploadedPaths];

      if (editId) {
        const { error: updErr } = await supabase
          .from("best_practice_posts")
          .update({ title: title.trim(), body: body.trim(), photo_paths })
          .eq("id", editId);
        if (updErr) throw updErr;
        setNotice("Příspěvek byl upraven.");
      } else {
        const { error: insErr } = await supabase.from("best_practice_posts").insert({
          organization_id: org.id,
          author_user_id: user.id,
          title: title.trim(),
          body: body.trim(),
          photo_paths,
          category,
          status: "pending",
          is_featured: false,
        });
        if (insErr) throw insErr;
        setNotice("Příspěvek byl odeslán ke schválení.");
      }

      resetForm();
    } catch (e) {
      setErr(e?.message || "Nepodařilo se uložit příspěvek.");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(postId) {
    if (!window.confirm("Opravdu smazat tento příspěvek?")) return;
    const { error } = await supabase.from("best_practice_posts").delete().eq("id", postId);
    if (error) {
      setErr(error.message || "Nepodařilo se smazat příspěvek.");
      return;
    }
    setMyPosts((prev) => prev.filter((p) => p.id !== postId));
  }

  if (loadingContext) {
    return (
      <RequireAuth>
        <PortalHeader />
        <div className="max-w-3xl mx-auto px-4 py-10">Načítám…</div>
      </RequireAuth>
    );
  }

  if (!isOrgAdmin) {
    return (
      <RequireAuth>
        <PortalHeader />
        <div className="max-w-3xl mx-auto px-4 py-10">
          <p className="text-slate-700">
            Přidávat příspěvky dobré praxe může jen kontaktní osoba organizace.
          </p>
          <Link href="/portal/dobra-praxe" className="text-blue-700 underline mt-2 inline-block">
            Zpět na Dobrou praxi
          </Link>
        </div>
      </RequireAuth>
    );
  }

  return (
    <RequireAuth>
      <PortalHeader />

      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-semibold">
              {editId ? "Upravit příspěvek" : "Nový příspěvek dobré praxe"}
            </h1>
            <p className="text-slate-600 mt-1">
              {org?.name} · kategorie {CATEGORY_LABELS[category]}
            </p>
          </div>
          <Link
            href="/portal/dobra-praxe"
            className="px-4 py-2 rounded-xl border border-slate-200 hover:border-slate-300 bg-white"
          >
            Zpět na feed
          </Link>
        </div>

        {err ? (
          <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 whitespace-pre-wrap">
            {err}
          </div>
        ) : null}
        {notice ? (
          <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700">
            {notice}
          </div>
        ) : null}

        <form onSubmit={onSubmit} className="mt-6 bg-white border border-slate-200 rounded-2xl shadow-sm p-5 md:p-6">
          <div>
            <label className={labelCls()}>Nadpis</label>
            <input
              className={inputCls()}
              value={title}
              maxLength={MAX_TITLE_LEN}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Např. Jak jsme rozjeli čtenářský klub"
            />
            <p className="mt-1 text-xs text-slate-500">{title.length}/{MAX_TITLE_LEN} znaků</p>
          </div>

          <div className="mt-4">
            <label className={labelCls()}>Text</label>
            <textarea
              className={inputCls()}
              rows={8}
              value={body}
              maxLength={MAX_BODY_LEN}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Co jste udělali, jak to probíhalo, co to přineslo…"
            />
            <p className="mt-1 text-xs text-slate-500">{body.length}/{MAX_BODY_LEN} znaků</p>
          </div>

          <div className="mt-4">
            <label className={labelCls()}>Fotky (1–5, jpg/webp)</label>

            {existingPhotos.length ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {existingPhotos.map((path) => (
                  <div key={path} className="relative">
                    <img src={getPhotoUrl(path)} alt="" className="w-20 h-20 object-cover rounded-lg border border-slate-200" />
                    <button
                      type="button"
                      onClick={() => setExistingPhotos((prev) => prev.filter((p) => p !== path))}
                      className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-slate-800 text-white text-xs leading-5"
                      aria-label="Odebrat fotku"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            ) : null}

            <input
              className="mt-2 block w-full text-sm"
              type="file"
              accept="image/jpeg,image/webp"
              multiple
              onChange={onFilesChange}
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="mt-6 px-5 py-2.5 rounded-xl bg-blue-700 text-white font-semibold disabled:opacity-50"
          >
            {saving ? "Ukládám…" : editId ? "Uložit změny" : "Odeslat ke schválení"}
          </button>
        </form>

        <h2 className="text-lg font-semibold mt-10">Moje příspěvky</h2>
        {loadingPosts ? (
          <p className="text-slate-500 mt-2">Načítám…</p>
        ) : myPosts.length ? (
          <ul className="mt-3 space-y-2">
            {myPosts.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-200 bg-white">
                <div>
                  <div className="font-medium">{p.title}</div>
                  <div className="text-xs text-slate-500">{STATUS_LABELS[p.status] || p.status}</div>
                </div>
                {p.status === "pending" ? (
                  <div className="flex gap-2 shrink-0">
                    <Link
                      href={`/portal/dobra-praxe/nova?id=${p.id}`}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 text-sm"
                    >
                      Upravit
                    </Link>
                    <button
                      type="button"
                      onClick={() => onDelete(p.id)}
                      className="px-3 py-1.5 rounded-lg border border-red-200 text-red-700 hover:border-red-300 text-sm"
                    >
                      Smazat
                    </button>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-slate-500 mt-2">Zatím žádné příspěvky.</p>
        )}
      </div>
    </RequireAuth>
  );
}
