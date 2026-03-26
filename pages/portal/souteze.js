// pages/portal/souteze.js
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
  return d.toLocaleDateString("cs-CZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getPublicUrl(path) {
  if (!path) return "";
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data?.publicUrl || "";
}

export default function SoutezePage() {
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    let alive = true;

    async function loadData() {
      try {
        setError("");

        const { data: adminData, error: adminError } = await supabase.rpc("is_admin");
        if (!alive) return;
        if (!adminError) setIsAdmin(!!adminData);

        const { data, error } = await supabase
          .from("portal_posts")
          .select(
            "id, title, content, image_path, attachment_path, attachment_name, created_at, is_published"
          )
          .eq("section", "contests")
          .eq("is_published", true)
          .order("created_at", { ascending: false });

        if (error) throw error;
        if (!alive) return;

        setPosts(data || []);
      } catch (e) {
        if (!alive) return;
        setError(e?.message || "Nepodařilo se načíst soutěže a projekty.");
      } finally {
        if (alive) setLoading(false);
      }
    }

    loadData();

    return () => {
      alive = false;
    };
  }, []);

  async function handleDelete(id) {
    if (!id || deletingId) return;
    if (!window.confirm("Opravdu chcete příspěvek smazat?")) return;

    try {
      setDeletingId(id);
      setError("");

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) throw sessionError;
      if (!session?.access_token) throw new Error("Nejste přihlášený.");

      const res = await fetch("/api/portal-posts-delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ id }),
      });

      const result = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(result?.error || "Nepodařilo se smazat příspěvek.");
      }

      setPosts((prev) => prev.filter((post) => post.id !== id));
    } catch (e) {
      setError(e?.message || "Chyba při mazání příspěvku.");
    } finally {
      setDeletingId(null);
    }
  }

  const featuredPost = useMemo(() => (posts.length > 0 ? posts[0] : null), [posts]);
  const otherPosts = useMemo(() => (posts.length > 1 ? posts.slice(1) : []), [posts]);

  return (
    <RequireAuth>
      <PortalHeader title="Soutěže a projekty" />

      <div style={{ background: "#f6f7fb", minHeight: "100vh" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "24px 16px 48px" }}>
          <section
            style={{
              background: "linear-gradient(180deg, #ffffff 0%, #f9fbff 100%)",
              border: "1px solid rgba(15,23,42,0.08)",
              borderRadius: 24,
              padding: "22px 22px 20px",
              boxShadow: "0 16px 40px rgba(15,23,42,0.05)",
              marginBottom: 18,
            }}
          >
            <div
              style={{
                display: "flex",
                gap: 16,
                alignItems: "flex-start",
                justifyContent: "space-between",
                flexWrap: "wrap",
              }}
            >
              <div style={{ minWidth: 0, flex: "1 1 620px" }}>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "6px 10px",
                    borderRadius: 999,
                    background: "rgba(15,23,42,0.06)",
                    color: "#0f172a",
                    fontSize: 12,
                    fontWeight: 800,
                    marginBottom: 12,
                  }}
                >
                  ARCHIMEDES Live • soutěže a projekty
                </div>

                <h1
                  style={{
                    margin: 0,
                    fontSize: 34,
                    lineHeight: 1.08,
                    color: "#0f172a",
                    letterSpacing: "-0.02em",
                  }}
                >
                  Aktivní výzvy,
                  <br />
                  projekty a inspirace
                </h1>

                <p
                  style={{
                    margin: "14px 0 0",
                    fontSize: 16,
                    lineHeight: 1.6,
                    color: "rgba(15,23,42,0.72)",
                    maxWidth: 760,
                  }}
                >
                  Přehled soutěží, projektových zadání, ukázek výstupů a inspirace
                  pro školy, obce i další členy sítě.
                </p>
              </div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <Link href="/portal/komunita" style={secondaryBtnStyle}>
                  Komunita
                </Link>

                {isAdmin ? (
                  <Link href="/portal/admin-prispevky?section=contests" style={primaryBtnStyle}>
                    Přidat příspěvek
                  </Link>
                ) : null}
              </div>
            </div>
          </section>

          {error ? <div style={errorBoxStyle}>Chyba: {error}</div> : null}

          {loading ? <div style={emptyBoxStyle}>Načítám soutěže a projekty…</div> : null}

          {!loading && !error && !featuredPost ? (
            <div style={emptyBoxStyle}>
              Zatím tu nejsou žádné příspěvky. Jakmile správce přidá první soutěž
              nebo projekt, objeví se zde jako hlavní výzva.
            </div>
          ) : null}

          {featuredPost ? (
            <section
              style={{
                background: "white",
                border: "1px solid rgba(15,23,42,0.08)",
                borderRadius: 24,
                overflow: "hidden",
                boxShadow: "0 14px 36px rgba(15,23,42,0.04)",
                marginBottom: 18,
              }}
            >
              {featuredPost.image_path ? (
                <img
                  src={getPublicUrl(featuredPost.image_path)}
                  alt={featuredPost.title}
                  style={{
                    width: "100%",
                    maxHeight: 460,
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              ) : null}

              <div style={{ padding: 22 }}>
                <div style={dateBadgeStyle}>{formatDateCS(featuredPost.created_at)}</div>

                <h2
                  style={{
                    margin: "12px 0 10px",
                    fontSize: 30,
                    lineHeight: 1.1,
                    color: "#0f172a",
                  }}
                >
                  {featuredPost.title}
                </h2>

                <div
                  style={{
                    fontSize: 16,
                    lineHeight: 1.7,
                    color: "rgba(15,23,42,0.76)",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {featuredPost.content}
                </div>

                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 16 }}>
                  {featuredPost.attachment_path ? (
                    <a
                      href={getPublicUrl(featuredPost.attachment_path)}
                      target="_blank"
                      rel="noreferrer"
                      style={{ ...secondaryBtnStyle, display: "inline-flex" }}
                    >
                      {featuredPost.attachment_name || "Otevřít přílohu"}
                    </a>
                  ) : null}

                  {isAdmin ? (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          router.push(
                            `/portal/admin-prispevky?id=${featuredPost.id}&section=contests`
                          )
                        }
                        style={secondaryButtonElementStyle}
                      >
                        Upravit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(featuredPost.id)}
                        disabled={deletingId === featuredPost.id}
                        style={dangerBtnStyle}
                      >
                        {deletingId === featuredPost.id ? "Mažu…" : "Smazat"}
                      </button>
                    </>
                  ) : null}
                </div>
              </div>
            </section>
          ) : null}

          {otherPosts.length > 0 ? (
            <section>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: 16,
                }}
              >
                {otherPosts.map((post) => (
                  <article key={post.id} style={postCardStyle}>
                    {post.image_path ? (
                      <img
                        src={getPublicUrl(post.image_path)}
                        alt={post.title}
                        style={{
                          width: "100%",
                          height: 200,
                          objectFit: "cover",
                          display: "block",
                        }}
                      />
                    ) : null}

                    <div style={{ padding: 18 }}>
                      <div style={dateBadgeStyle}>{formatDateCS(post.created_at)}</div>

                      <h3
                        style={{
                          margin: "12px 0 8px",
                          fontSize: 22,
                          lineHeight: 1.15,
                          color: "#0f172a",
                        }}
                      >
                        {post.title}
                      </h3>

                      <div
                        style={{
                          fontSize: 14,
                          lineHeight: 1.65,
                          color: "rgba(15,23,42,0.72)",
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {post.content}
                      </div>

                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14 }}>
                        {post.attachment_path ? (
                          <a
                            href={getPublicUrl(post.attachment_path)}
                            target="_blank"
                            rel="noreferrer"
                            style={{ ...secondaryBtnStyle, display: "inline-flex" }}
                          >
                            {post.attachment_name || "Otevřít přílohu"}
                          </a>
                        ) : null}

                        {isAdmin ? (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                router.push(
                                  `/portal/admin-prispevky?id=${post.id}&section=contests`
                                )
                              }
                              style={secondaryButtonElementStyle}
                            >
                              Upravit
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(post.id)}
                              disabled={deletingId === post.id}
                              style={dangerBtnStyle}
                            >
                              {deletingId === post.id ? "Mažu…" : "Smazat"}
                            </button>
                          </>
                        ) : null}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </RequireAuth>
  );
}

const primaryBtnStyle = {
  textDecoration: "none",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "12px 16px",
  borderRadius: 14,
  background: "#0f172a",
  color: "white",
  fontWeight: 900,
  whiteSpace: "nowrap",
};

const secondaryBtnStyle = {
  textDecoration: "none",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "12px 16px",
  borderRadius: 14,
  background: "white",
  color: "#0f172a",
  border: "1px solid rgba(15,23,42,0.12)",
  fontWeight: 900,
  whiteSpace: "nowrap",
};

const secondaryButtonElementStyle = {
  border: "1px solid rgba(15,23,42,0.12)",
  background: "white",
  color: "#0f172a",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "12px 16px",
  borderRadius: 14,
  fontWeight: 900,
  whiteSpace: "nowrap",
  cursor: "pointer",
};

const dangerBtnStyle = {
  border: "1px solid rgba(185,28,28,0.18)",
  background: "#fff5f5",
  color: "#b91c1c",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "12px 16px",
  borderRadius: 14,
  fontWeight: 900,
  whiteSpace: "nowrap",
  cursor: "pointer",
};

const postCardStyle = {
  background: "white",
  border: "1px solid rgba(15,23,42,0.08)",
  borderRadius: 24,
  overflow: "hidden",
  boxShadow: "0 14px 36px rgba(15,23,42,0.04)",
};

const emptyBoxStyle = {
  background: "white",
  border: "1px dashed rgba(15,23,42,0.16)",
  borderRadius: 24,
  padding: 24,
  color: "rgba(15,23,42,0.68)",
};

const errorBoxStyle = {
  background: "#fff3f3",
  border: "1px solid #ffd0d0",
  borderRadius: 18,
  padding: 16,
  color: "#8a1f1f",
  marginBottom: 18,
};

const dateBadgeStyle = {
  display: "inline-flex",
  padding: "6px 10px",
  borderRadius: 999,
  background: "rgba(15,23,42,0.06)",
  color: "rgba(15,23,42,0.72)",
  fontSize: 12,
  fontWeight: 800,
};
