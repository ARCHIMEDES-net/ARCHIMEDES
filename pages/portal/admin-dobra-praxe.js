import { useEffect, useState } from "react";
import RequirePlatformAdmin from "../../components/RequirePlatformAdmin";
import PortalHeader from "../../components/PortalHeader";
import { supabase } from "../../lib/supabaseClient";

const BUCKET = "dobra-praxe";

const CATEGORY_LABELS = {
  obec: "Obec",
  spolek: "Spolek",
  skola: "Škola",
  seniori: "Senioři",
};

function formatDateCS(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("cs-CZ", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function getPhotoUrl(path) {
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data?.publicUrl || "";
}

function PostCard({ post, children }) {
  return (
    <li className="p-4 rounded-2xl border border-slate-200 bg-white">
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <span className="px-2 py-0.5 rounded-full bg-slate-100 font-semibold">
          {CATEGORY_LABELS[post.category] || post.category}
        </span>
        <span>{post.organizations?.name}</span>
        <span>·</span>
        <span>{formatDateCS(post.created_at)}</span>
      </div>
      <h3 className="mt-2 text-lg font-semibold">{post.title}</h3>
      <p className="mt-1 text-slate-700 whitespace-pre-wrap">{post.body}</p>
      {post.photo_paths?.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {post.photo_paths.map((path) => (
            <img
              key={path}
              src={getPhotoUrl(path)}
              alt=""
              className="w-20 h-20 object-cover rounded-lg border border-slate-200"
            />
          ))}
        </div>
      ) : null}
      {post.rejection_note ? (
        <p className="mt-2 text-xs text-red-600">Interní poznámka: {post.rejection_note}</p>
      ) : null}
      <div className="mt-3 flex gap-2 flex-wrap">{children}</div>
    </li>
  );
}

export default function AdminDobraPraxe() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");

  async function loadPosts() {
    setLoading(true);
    setError("");
    const { data, error } = await supabase
      .from("best_practice_posts")
      .select(
        "id, title, body, photo_paths, category, status, is_featured, rejection_note, created_at, organizations(name)"
      )
      .order("created_at", { ascending: false });

    if (error) {
      setError(error.message || "Nepodařilo se načíst příspěvky.");
    } else {
      setPosts(data || []);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadPosts();
  }, []);

  async function onApprove(id) {
    setBusyId(id);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("best_practice_posts")
      .update({ status: "approved", approved_by: user?.id || null, approved_at: new Date().toISOString() })
      .eq("id", id);
    setBusyId("");
    if (error) {
      setError(error.message || "Nepodařilo se schválit příspěvek.");
      return;
    }
    loadPosts();
  }

  async function onReject(id) {
    const note = window.prompt("Interní poznámka k zamítnutí (autor ji neuvidí):", "") || "";
    setBusyId(id);
    const { error } = await supabase
      .from("best_practice_posts")
      .update({ status: "rejected", rejection_note: note.trim() || null })
      .eq("id", id);
    setBusyId("");
    if (error) {
      setError(error.message || "Nepodařilo se zamítnout příspěvek.");
      return;
    }
    loadPosts();
  }

  async function onFeature(id) {
    setBusyId(id);
    const { error } = await supabase.rpc("set_featured_best_practice_post", { post_id: id });
    setBusyId("");
    if (error) {
      setError(error.message || "Nepodařilo se zveřejnit na webu.");
      return;
    }
    loadPosts();
  }

  const pending = posts.filter((p) => p.status === "pending");
  const approved = posts.filter((p) => p.status === "approved");
  const rejected = posts.filter((p) => p.status === "rejected");

  return (
    <RequirePlatformAdmin>
      <PortalHeader />

      <div className="max-w-3xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-semibold">Dobrá praxe — schvalování</h1>

        {error ? (
          <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700">{error}</div>
        ) : null}

        {loading ? (
          <p className="text-slate-500 mt-6">Načítám…</p>
        ) : (
          <>
            <h2 className="text-lg font-semibold mt-8">Čeká na schválení ({pending.length})</h2>
            {pending.length ? (
              <ul className="mt-3 space-y-4">
                {pending.map((p) => (
                  <PostCard key={p.id} post={p}>
                    <button
                      type="button"
                      disabled={busyId === p.id}
                      onClick={() => onApprove(p.id)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-sm disabled:opacity-50"
                    >
                      Schválit
                    </button>
                    <button
                      type="button"
                      disabled={busyId === p.id}
                      onClick={() => onReject(p.id)}
                      className="px-3 py-1.5 rounded-lg border border-red-200 text-red-700 text-sm disabled:opacity-50"
                    >
                      Zamítnout
                    </button>
                  </PostCard>
                ))}
              </ul>
            ) : (
              <p className="text-slate-500 mt-2">Nic nečeká na schválení.</p>
            )}

            <h2 className="text-lg font-semibold mt-10">Schválené ({approved.length})</h2>
            {approved.length ? (
              <ul className="mt-3 space-y-4">
                {approved.map((p) => (
                  <PostCard key={p.id} post={p}>
                    {p.is_featured ? (
                      <span className="px-3 py-1.5 rounded-lg bg-blue-100 text-blue-800 text-sm font-semibold">
                        Aktuálně na webu
                      </span>
                    ) : (
                      <button
                        type="button"
                        disabled={busyId === p.id}
                        onClick={() => onFeature(p.id)}
                        className="px-3 py-1.5 rounded-lg bg-blue-700 text-white text-sm disabled:opacity-50"
                      >
                        Zveřejnit na webu
                      </button>
                    )}
                  </PostCard>
                ))}
              </ul>
            ) : (
              <p className="text-slate-500 mt-2">Zatím žádné schválené příspěvky.</p>
            )}

            {rejected.length ? (
              <>
                <h2 className="text-lg font-semibold mt-10">Zamítnuté ({rejected.length})</h2>
                <ul className="mt-3 space-y-4">
                  {rejected.map((p) => (
                    <PostCard key={p.id} post={p} />
                  ))}
                </ul>
              </>
            ) : null}
          </>
        )}
      </div>
    </RequirePlatformAdmin>
  );
}
