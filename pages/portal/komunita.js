// pages/portal/komunita.js
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { X } from "lucide-react";
import RequireAuth from "../../components/RequireAuth";
import PortalHeader from "../../components/PortalHeader";
import { supabase } from "../../lib/supabaseClient";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Alert } from "../../components/ui/alert";
import SectionEyebrow from "../../components/home/SectionEyebrow";

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

      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-[1180px] px-4 py-6">
          <Card className="mb-4 bg-gradient-to-b from-white to-blue-50/40 p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 flex-[1_1_620px]">
                <SectionEyebrow>ARCHIMEDES Live • komunita</SectionEyebrow>

                <h1 className="text-[34px] font-[950] leading-[1.08] tracking-[-0.02em] text-navy-900">
                  Co se děje v komunitě
                  <br />
                  ARCHIMEDES Live
                </h1>

                <p className="mt-3.5 max-w-[760px] text-base leading-relaxed text-muted">
                  Novinky, fotografie, krátké zprávy a inspirace od členů,
                  škol, obcí a partnerů.
                </p>
              </div>

              <div className="flex flex-wrap gap-2.5">
                <Button href="/portal/kalendar" variant="secondary">
                  Program
                </Button>

                {isAdmin ? (
                  <Button href="/portal/admin-prispevky?section=community">Přidat příspěvek</Button>
                ) : null}
              </div>
            </div>
          </Card>

          {error ? (
            <Alert variant="error" className="mb-4">
              Chyba: {error}
            </Alert>
          ) : null}

          {loading ? <Alert variant="neutral">Načítám příspěvky…</Alert> : null}

          {!loading && !error && posts.length === 0 ? (
            <Alert variant="neutral">
              Zatím tu nejsou žádné příspěvky. Jakmile správce přidá první novinku,
              objeví se tady jako nástěnka komunity.
            </Alert>
          ) : null}

          {posts.map((post) => {
            const imageUrl = getPublicUrl(post.image_path);
            const attachmentUrl = getPublicUrl(post.attachment_path);
            const isExpanded = !!expandedPostIds[post.id];
            const fullText = String(post.content || "");
            const previewText = getPreviewText(fullText);
            const isLongText = fullText.length > TEXT_PREVIEW_LENGTH;

            return (
              <Card key={post.id} className="mb-4 overflow-hidden">
                <div className="flex flex-wrap items-start gap-6 p-5">
                  <div className="w-full flex-[0_0_320px] max-w-[320px]">
                    {post.image_path ? (
                      <button
                        type="button"
                        onClick={() => setLightboxImage(imageUrl)}
                        aria-label={`Zvětšit obrázek: ${post.title}`}
                        className="block w-full cursor-zoom-in border-0 bg-transparent p-0"
                      >
                        <div className="flex h-[260px] w-full items-center justify-center overflow-hidden rounded-2xl border border-slate-900/[0.08] bg-white">
                          <img
                            src={imageUrl}
                            alt={post.title}
                            className="box-border h-full w-full object-contain p-4"
                          />
                        </div>
                      </button>
                    ) : (
                      <div className="flex h-[260px] w-full items-center justify-center rounded-2xl border border-dashed border-slate-900/[0.14] bg-slate-50 font-bold text-slate-400">
                        Bez obrázku
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-[1_1_420px]">
                    <span className="inline-flex rounded-full bg-slate-900/[0.06] px-2.5 py-1.5 text-xs font-bold text-slate-600">
                      {formatDateCS(post.created_at)}
                    </span>

                    <h2 className="mb-2.5 mt-3 text-[32px] leading-[1.12] text-navy-900">{post.title}</h2>

                    <div className="whitespace-pre-wrap text-base leading-[1.72] text-slate-700">
                      {isExpanded ? fullText : previewText}
                    </div>

                    {isLongText ? (
                      <button
                        type="button"
                        onClick={() => toggleExpanded(post.id)}
                        className="mt-2.5 border-0 bg-transparent p-0 font-bold text-blue-600"
                      >
                        {isExpanded ? "Zobrazit méně" : "Číst více"}
                      </button>
                    ) : null}

                    <div className="mt-4 flex flex-wrap gap-3">
                      {post.attachment_path ? (
                        <a
                          href={attachmentUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-center rounded-2xl border border-slate-900/[0.12] bg-white px-4 py-3 font-black text-navy-900"
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
                            className="inline-flex items-center justify-center rounded-2xl border border-slate-900/[0.12] bg-white px-4 py-3 font-black text-navy-900"
                          >
                            Upravit
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(post.id)}
                            disabled={deletingId === post.id}
                            className="inline-flex items-center justify-center rounded-2xl border border-red-200 bg-red-50 px-4 py-3 font-black text-red-700"
                          >
                            {deletingId === post.id ? "Mažu…" : "Smazat"}
                          </button>
                        </>
                      ) : null}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {lightboxImage ? (
        <div
          onClick={() => setLightboxImage("")}
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/82 p-6"
        >
          <button
            type="button"
            onClick={() => setLightboxImage("")}
            aria-label="Zavřít náhled"
            className="fixed right-5 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/12 text-white"
          >
            <X className="h-6 w-6" aria-hidden="true" />
          </button>

          <div onClick={(e) => e.stopPropagation()} className="flex max-h-[88vh] max-w-[92vw] items-center justify-center">
            <img
              src={lightboxImage}
              alt="Zvětšený obrázek"
              className="max-h-[88vh] max-w-[92vw] rounded-2xl bg-white object-contain"
            />
          </div>
        </div>
      ) : null}
    </RequireAuth>
  );
}
