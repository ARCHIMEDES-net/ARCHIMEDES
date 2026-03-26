// pages/portal/komunita.js
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import RequireAuth from "../../components/RequireAuth";
import PortalHeader from "../../components/PortalHeader";
import { supabase } from "../../lib/supabaseClient";

const BUCKET = "portal-posts";

function formatDateCS(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("cs-CZ");
}

function getPublicUrl(path) {
  if (!path) return "";
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data?.publicUrl || "";
}

export default function KomunitaPage() {
  const router = useRouter();

  const [posts, setPosts] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    async function load() {
      const { data: admin } = await supabase.rpc("is_admin");
      setIsAdmin(!!admin);

      const { data } = await supabase
        .from("portal_posts")
        .select("*")
        .eq("section", "community")
        .order("created_at", { ascending: false });

      setPosts(data || []);
    }
    load();
  }, []);

  async function handleDelete(id) {
    if (!confirm("Opravdu smazat?")) return;

    setDeletingId(id);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    await fetch("/api/portal-posts-delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ id }),
    });

    setPosts((prev) => prev.filter((p) => p.id !== id));
    setDeletingId(null);
  }

  return (
    <RequireAuth>
      <PortalHeader title="Komunita" />

      <div style={{ padding: 20 }}>
        {posts.map((post) => (
          <div key={post.id} style={{ marginBottom: 30 }}>
            <h2>{post.title}</h2>
            <p>{post.content}</p>

            {post.image_path && (
              <img
                src={getPublicUrl(post.image_path)}
                style={{ width: 300 }}
              />
            )}

            {isAdmin && (
              <div style={{ display: "flex", gap: 10 }}>
                {/* 🔥 NOVÉ TLAČÍTKO */}
                <button
                  onClick={() =>
                    router.push(
                      `/portal/admin-prispevky?id=${post.id}&section=community`
                    )
                  }
                >
                  Upravit
                </button>

                <button onClick={() => handleDelete(post.id)}>
                  {deletingId === post.id ? "Mažu..." : "Smazat"}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </RequireAuth>
  );
}
