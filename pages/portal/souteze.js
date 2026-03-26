// pages/portal/souteze.js
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import RequireAuth from "../../components/RequireAuth";
import PortalHeader from "../../components/PortalHeader";
import { supabase } from "../../lib/supabaseClient";

const BUCKET = "portal-posts";

function getPublicUrl(path) {
  if (!path) return "";
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data?.publicUrl || "";
}

export default function SoutezePage() {
  const router = useRouter();

  const [posts, setPosts] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: admin } = await supabase.rpc("is_admin");
      setIsAdmin(!!admin);

      const { data } = await supabase
        .from("portal_posts")
        .select("*")
        .eq("section", "contests")
        .order("created_at", { ascending: false });

      setPosts(data || []);
    }
    load();
  }, []);

  return (
    <RequireAuth>
      <PortalHeader title="Soutěže" />

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
              <button
                onClick={() =>
                  router.push(
                    `/portal/admin-prispevky?id=${post.id}&section=contests`
                  )
                }
              >
                Upravit
              </button>
            )}
          </div>
        ))}
      </div>
    </RequireAuth>
  );
}
