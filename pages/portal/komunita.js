// pages/portal/komunita.js
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import RequireAuth from "../../components/RequireAuth";
import PortalHeader from "../../components/PortalHeader";
import { supabase } from "../../lib/supabaseClient";

const BUCKET = "portal-posts";
const TEXT_PREVIEW_LENGTH = 260;

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

function getPreviewText(text, maxLength = TEXT_PREVIEW_LENGTH) {
  const clean = String(text || "");
  if (clean.length <= maxLength) return clean;

  const sliced = clean.slice(0, maxLength);
  const lastSpace = sliced.lastIndexOf(" ");
  if (lastSpace > 120) {
    return `${sliced.slice(0, lastSpace)}…`;
  }
  return `${sliced}…`;
}

export default function KomunitaPage() {
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [lightboxImage, setLightboxImage] = useState("");
  const [expandedPostIds, setExpandedPostIds] = useState({});

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
          .eq("section", "community")
          .eq("is_published", true)
          .order("created_at", { ascending: false });

        if (error) throw error;
        if (!alive) return;

        setPosts(data || []);
      } catch (e) {
        if (!alive) return;
        setError(e?.message || "Nepodařilo se načíst příspěvky.");
      } finally {
        if (alive) setLoading(false);
      }
    }

    loadData();

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape") setLightboxImage("");
    }

    if (lightboxImage) {
      window.addEventListener("keydown", onKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [lightboxImage]);

  function toggleExpanded(postId) {
    setExpandedPostIds((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  }

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
      setExpandedPostIds((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    } catch (e) {
      setError(e?.message || "Chyba při mazání příspěvku.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <RequireAuth>
      <PortalHeader title="Komunita" />

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
                  ARCHIMEDES Live • komunita
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
                  Co se děje v síti
                  <br />
                  ARCHIMEDES Live
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
                  Novinky, fotografie, krátké zprávy a inspirace od členů sítě,
                  škol, obcí a partnerů.
                </p>
              </div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <Link href="/portal/kalendar" style={secondaryBtnStyle}>
                  Program
                </Link>

                {isAdmin ? (
                  <Link href="/portal/admin-prispevky?section=community" style={primaryBtnStyle}>
                    Přidat příspěvek
                  </Link>
                ) : null}
              </div>
            </div>
          </section>

          {error ? <div style={errorBoxStyle}>Chyba: {error}</div> : null}

          {loading ? <div style={emptyBoxStyle}>Načítám příspěvky…</div> : null}

          {!loading && !error && posts.length === 0 ? (
            <div style={emptyBoxStyle}>
              Zatím tu nejsou žádné příspěvky. Jakmile správce přidá první novinku,
              objeví se tady jako nástěnka komunity.
            </div>
          ) : null}

          {posts.map((post) => {
            const imageUrl = getPublicUrl(post.image_path);
            const attachmentUrl = getPublicUrl(post.attachment_path);
            const isExpanded = !!expandedPostIds[post.id];
            const fullText = String(post.content || "");
            const previewText = getPreviewText(fullText);
            const isLongText = fullText.length > TEXT_PREVIEW_LENGTH;

            return (
              <article key={post.id} style={postRowStyle}>
                <div style={postInnerStyle}>
                  <div style={mediaColStyle}>
                    {post.image_path ? (
                      <button
                        type="button"
                        onClick={() => setLightboxImage(imageUrl)}
                        style={imageButtonStyle}
                        aria-label={`Zvětšit obrázek: ${post.title}`}
                      >
                        <div style={imageFrameStyle}>
                          <img
                            src={imageUrl}
                            alt={post.title}
                            style={imageStyle}
                          />
                        </div>
                      </button>
                    ) : (
                      <div style={imagePlaceholderStyle}>Bez obrázku</div>
                    )}
                  </div>

                  <div style={contentColStyle}>
                    <div style={dateBadgeStyle}>{formatDateCS(post.created_at)}</div>

                    <h2
                      style={{
                        margin: "12px 0 10px",
                        fontSize: 32,
                        lineHeight: 1.12,
                        color: "#0f172a",
                      }}
                    >
                      {post.title}
                    </h2>

                    <div
                      style={{
                        fontSize: 16,
                        lineHeight: 1.72,
                        color: "rgba(15,23,42,0.76)",
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {isExpanded ? fullText : previewText}
                    </div>

                    {isLongText ? (
                      <button
                        type="button"
                        onClick={() => toggleExpanded(post.id)}
                        style={readMoreBtnStyle}
                      >
                        {isExpanded ? "Zobrazit méně" : "Číst více"}
                      </button>
                    ) : null}

                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 18 }}>
                      {post.attachment_path ? (
                        <a
                          href={attachmentUrl}
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
                                `/portal/admin-prispevky?id=${post.id}&section=community`
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
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {lightboxImage ? (
        <div
          onClick={() => setLightboxImage("")}
          style={lightboxOverlayStyle}
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            onClick={() => setLightboxImage("")}
            style={lightboxCloseStyle}
            aria-label="Zavřít náhled"
          >
            ×
          </button>

          <div
            onClick={(e) => e.stopPropagation()}
            style={lightboxContentStyle}
          >
            <img
              src={lightboxImage}
              alt="Zvětšený obrázek"
              style={lightboxImageStyle}
            />
          </div>
        </div>
      ) : null}
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

const readMoreBtnStyle = {
  marginTop: 10,
  padding: 0,
  border: "none",
  background: "transparent",
  color: "#2563eb",
  fontWeight: 800,
  cursor: "pointer",
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

const postRowStyle = {
  background: "white",
  border: "1px solid rgba(15,23,42,0.08)",
  borderRadius: 24,
  boxShadow: "0 14px 36px rgba(15,23,42,0.04)",
  marginBottom: 18,
  overflow: "hidden",
};

const postInnerStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: 24,
  padding: 22,
  alignItems: "flex-start",
};

const mediaColStyle = {
  flex: "0 0 320px",
  maxWidth: 320,
  width: "100%",
};

const contentColStyle = {
  flex: "1 1 420px",
  minWidth: 0,
};

const imageButtonStyle = {
  display: "block",
  width: "100%",
  padding: 0,
  border: "none",
  background: "transparent",
  cursor: "zoom-in",
};

const imageFrameStyle = {
  width: "100%",
  height: 260,
  background: "#ffffff",
  borderRadius: 18,
  border: "1px solid rgba(15,23,42,0.08)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
};

const imagePlaceholderStyle = {
  width: "100%",
  height: 260,
  background: "#f8fafc",
  borderRadius: 18,
  border: "1px dashed rgba(15,23,42,0.14)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "rgba(15,23,42,0.45)",
  fontWeight: 700,
};

const imageStyle = {
  width: "100%",
  height: "100%",
  objectFit: "contain",
  objectPosition: "center",
  display: "block",
  padding: 18,
  boxSizing: "border-box",
};

const lightboxOverlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(2,6,23,0.82)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 24,
  zIndex: 9999,
};

const lightboxContentStyle = {
  maxWidth: "92vw",
  maxHeight: "88vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const lightboxImageStyle = {
  maxWidth: "92vw",
  maxHeight: "88vh",
  objectFit: "contain",
  borderRadius: 16,
  background: "white",
};

const lightboxCloseStyle = {
  position: "fixed",
  top: 18,
  right: 22,
  width: 44,
  height: 44,
  borderRadius: 999,
  border: "none",
  background: "rgba(255,255,255,0.12)",
  color: "white",
  fontSize: 30,
  lineHeight: 1,
  cursor: "pointer",
};
