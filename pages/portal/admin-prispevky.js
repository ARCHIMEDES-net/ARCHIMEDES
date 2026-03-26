// pages/portal/admin-prispevky.js
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import RequireAuth from "../../components/RequireAuth";
import PortalHeader from "../../components/PortalHeader";
import { supabase } from "../../lib/supabaseClient";

export default function AdminPrispevkyPage() {
  const router = useRouter();

  const postId = router.query.id;

  const section = useMemo(() => {
    const raw = String(router.query.section || "").toLowerCase();
    return raw === "contests" ? "contests" : "community";
  }, [router.query.section]);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPublished, setIsPublished] = useState(true);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // 🔥 NAČTENÍ PŘÍSPĚVKU PRO EDITACI
  useEffect(() => {
    if (!postId) return;

    async function loadPost() {
      const { data, error } = await supabase
        .from("portal_posts")
        .select("*")
        .eq("id", postId)
        .single();

      if (!error && data) {
        setTitle(data.title || "");
        setContent(data.content || "");
        setIsPublished(!!data.is_published);
      }
    }

    loadPost();
  }, [postId]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (saving) return;

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const cleanTitle = title.trim();
      const cleanContent = content.trim();

      if (!cleanTitle) throw new Error("Vyplň nadpis");
      if (!cleanContent) throw new Error("Vyplň text");

      const {
        data: { session },
      } = await supabase.auth.getSession();

      const endpoint = postId
        ? "/api/portal-posts-update"
        : "/api/portal-posts-create";

      const body = postId
        ? {
            id: postId,
            title: cleanTitle,
            content: cleanContent,
            is_published: isPublished,
          }
        : {
            section,
            title: cleanTitle,
            content: cleanContent,
            is_published: isPublished,
          };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(body),
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.error);

      setMessage(postId ? "Uloženo" : "Vytvořeno");

      if (!postId) {
        setTitle("");
        setContent("");
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <RequireAuth>
      <PortalHeader title={postId ? "Upravit příspěvek" : "Přidat příspěvek"} />

      <div style={{ padding: 20, maxWidth: 600 }}>
        <form onSubmit={handleSubmit}>
          {error && <div style={{ color: "red" }}>{error}</div>}
          {message && <div style={{ color: "green" }}>{message}</div>}

          <div>
            <label>Nadpis</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ width: "100%" }}
            />
          </div>

          <div>
            <label>Text</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              style={{ width: "100%", height: 150 }}
            />
          </div>

          <div>
            <label>
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
              />
              Publikovat
            </label>
          </div>

          <button disabled={saving}>
            {saving ? "Ukládám..." : "Uložit"}
          </button>
        </form>
      </div>
    </RequireAuth>
  );
}
