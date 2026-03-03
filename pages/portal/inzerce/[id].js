// pages/portal/inzerce/[id].js
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import RequireAuth from "../../../components/RequireAuth";
import PortalHeader from "../../../components/PortalHeader";
import { supabase } from "../../../lib/supabaseClient";

const BUCKET = "marketplace";

function typeLabel(t) {
  if (t === "offer") return "NABÍDKA";
  if (t === "demand") return "POPTÁVKA";
  if (t === "partnership") return "PARTNERSTVÍ";
  return t || "";
}

function isImageMime(m) {
  return typeof m === "string" && m.startsWith("image/");
}

export default function InzeratDetail() {
  const router = useRouter();
  const { id } = router.query;

  const [row, setRow] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [attUrls, setAttUrls] = useState({}); // attachmentId -> signedUrl
  const [comments, setComments] = useState([]);

  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);
  const [meId, setMeId] = useState(null);

  const [commentBody, setCommentBody] = useState("");
  const [sendingComment, setSendingComment] = useState(false);

  const isOwner = useMemo(() => (row?.author_id && meId ? row.author_id === meId : false), [row, meId]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      setMeId(data?.user?.id || null);
    })();
  }, []);

  async function loadAll(postId) {
    setLoading(true);
    setErr("");

    const { data: post, error: postErr } = await supabase
      .from("marketplace_posts")
      .select("*")
      .eq("id", postId)
      .single();

    if (postErr) {
      setErr(postErr.message || "Nepodařilo se načíst inzerát.");
      setRow(null);
      setLoading(false);
      return;
    }

    setRow(post);

    const { data: atts, error: attErr } = await supabase
      .from("marketplace_attachments")
      .select("id,file_path,file_name,mime_type,file_size,is_image,created_at,author_id")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });

    if (attErr) {
      setErr(attErr.message || "Nepodařilo se načíst přílohy.");
      setAttachments([]);
    } else {
      setAttachments(atts || []);
    }

    const { data: coms, error: comErr } = await supabase
      .from("marketplace_comments")
      .select("id,post_id,author_id,body,is_deleted,created_at")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });

    if (comErr) {
      setErr(comErr.message || "Nepodařilo se načíst reakce.");
      setComments([]);
    } else {
      setComments(coms || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    if (!id) return;
    loadAll(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    // vytvořit signed URL pro všechny přílohy
    (async () => {
      const next = {};
      for (const a of attachments) {
        // eslint-disable-next-line no-await-in-loop
        const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(a.file_path, 60 * 30);
        if (!error && data?.signedUrl) next[a.id] = data.signedUrl;
      }
      setAttUrls(next);
    })();
  }, [attachments]);

  async function setStatus(next) {
    if (!row) return;
    setErr("");

    const { error } = await supabase.from("marketplace_posts").update({ status: next }).eq("id", row.id);

    if (error) {
      setErr(error.message || "Nepodařilo se uložit změnu.");
      return;
    }
    setRow((r) => ({ ...r, status: next }));
  }

  async function addComment() {
    setErr("");
    const body = commentBody.trim();
    if (body.length < 2) {
      setErr("Napiš prosím krátkou reakci (min. 2 znaky).");
      return;
    }

    setSendingComment(true);

    const { data: auth } = await supabase.auth.getUser();
    const userId = auth?.user?.id;
    if (!userId) {
      setErr("Nejste přihlášen.");
      setSendingComment(false);
      return;
    }

    const payload = {
      post_id: row.id,
      author_id: userId,
      body,
    };

    const { error } = await supabase.from("marketplace_comments").insert(payload);
    if (error) {
      setErr(error.message || "Nepodařilo se odeslat reakci.");
      setSendingComment(false);
      return;
    }

    setCommentBody("");
    setSendingComment(false);
    loadAll(row.id);
  }

  async function softDeleteComment(commentId) {
    if (!confirm("Opravdu skrýt tuto reakci?")) return;
    setErr("");

    const { error } = await supabase
      .from("marketplace_comments")
      .update({ is_deleted: true })
      .eq("id", commentId);

    if (error) {
      setErr(error.message || "Nepodařilo se skrýt reakci.");
      return;
    }

    setComments((prev) => prev.map((c) => (c.id === commentId ? { ...c, is_deleted: true } : c)));
  }

  async function deleteAttachment(att) {
    if (!confirm("Opravdu smazat tuto přílohu?")) return;
    setErr("");

    // 1) smazat v storage
    const { error: delErr } = await supabase.storage.from(BUCKET).remove([att.file_path]);
    if (delErr) {
      setErr(delErr.message || "Nepodařilo se smazat soubor.");
      return;
    }

    // 2) smazat metadata
    const { error: metaErr } = await supabase.from("marketplace_attachments").delete().eq("id", att.id);
    if (metaErr) {
      setErr(metaErr.message || "Nepodařilo se smazat záznam přílohy.");
      return;
    }

    setAttachments((prev) => prev.filter((a) => a.id !== att.id));
  }

  const images = useMemo(
    () => attachments.filter((a) => a.is_image || isImageMime(a.mime_type)),
    [attachments]
  );
  const files = useMemo(
    () => attachments.filter((a) => !(a.is_image || isImageMime(a.mime_type))),
    [attachments]
  );

  const expired = useMemo(() => {
    if (!row?.expires_at) return false;
    return new Date(row.expires_at).getTime() <= Date.now();
  }, [row]);

  return (
    <RequireAuth>
      <PortalHeader title="Inzerce – detail" />

      <div style={{ padding: 16, maxWidth: 900, margin: "0 auto" }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", marginBottom: 12 }}>
          <Link href="/portal/inzerce">← Zpět na Inzerci</Link>
          {isOwner ? (
            <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
              {row?.status === "active" ? (
                <button onClick={() => setStatus("closed")} style={{ padding: "8px 12px", borderRadius: 12, border: "1px solid #ddd", cursor: "pointer" }}>
                  Označit jako uzavřené
                </button>
              ) : (
                <button onClick={() => setStatus("active")} style={{ padding: "8px 12px", borderRadius: 12, border: "1px solid #ddd", cursor: "pointer" }}>
                  Znovu otevřít
                </button>
              )}
            </div>
          ) : null}
        </div>

        {err ? (
          <div style={{ padding: 12, border: "1px solid #f3c2c2", background: "#fff4f4", borderRadius: 12, marginBottom: 12 }}>
            Chyba: {err}
          </div>
        ) : null}

        {loading ? (
          <div style={{ padding: 12, opacity: 0.7 }}>Načítám…</div>
        ) : row ? (
          <div style={{ border: "1px solid #e6e6e6", borderRadius: 14, padding: 12 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ fontSize: 12, padding: "4px 8px", borderRadius: 999, border: "1px solid #ddd" }}>
                {typeLabel(row.type)}
              </span>
              {row.category ? (
                <span style={{ fontSize: 12, padding: "4px 8px", borderRadius: 999, border: "1px solid #ddd" }}>
                  {row.category}
                </span>
              ) : null}
              {row.location ? (
                <span style={{ fontSize: 12, padding: "4px 8px", borderRadius: 999, border: "1px solid #ddd" }}>
                  {row.location}
                </span>
              ) : null}
              {row.is_archimedes ? (
                <span style={{ fontSize: 12, padding: "4px 8px", borderRadius: 999, border: "1px solid #ddd" }}>
                  ARCHIMEDES
                </span>
              ) : null}
              {row.is_pinned ? (
                <span style={{ fontSize: 12, padding: "4px 8px", borderRadius: 999, border: "1px solid #ddd" }}>
                  TOP
                </span>
              ) : null}
              {expired ? (
                <span style={{ fontSize: 12, padding: "4px 8px", borderRadius: 999, border: "1px solid #ddd" }}>
                  EXPIROVÁNO
                </span>
              ) : null}

              <div style={{ marginLeft: "auto", fontSize: 12, opacity: 0.7 }}>
                Stav: {row.status === "active" ? "Aktivní" : "Uzavřené"}
              </div>
            </div>

            <div style={{ marginTop: 10, fontSize: 20, fontWeight: 800 }}>{row.title}</div>

            {row.description ? (
              <div style={{ marginTop: 10, whiteSpace: "pre-wrap", lineHeight: 1.5 }}>
                {row.description}
              </div>
            ) : null}

            <div style={{ marginTop: 10, fontSize: 12, opacity: 0.7 }}>
              Vloženo: {new Date(row.created_at).toLocaleString("cs-CZ")}
              {row.expires_at ? ` • Expirace: ${new Date(row.expires_at).toLocaleString("cs-CZ")}` : ""}
            </div>

            {/* Galerie */}
            {images.length ? (
              <div style={{ marginTop: 16 }}>
                <div style={{ fontWeight: 800, marginBottom: 8 }}>Fotky</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 10 }}>
                  {images.map((a) => {
                    const url = attUrls[a.id];
                    return (
                      <div key={a.id} style={{ border: "1px solid #eee", borderRadius: 12, padding: 8 }}>
                        {url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <a href={url} target="_blank" rel="noreferrer">
                            <img
                              src={url}
                              alt={a.file_name}
                              style={{ width: "100%", height: 140, objectFit: "cover", borderRadius: 10 }}
                            />
                          </a>
                        ) : (
                          <div style={{ height: 140, borderRadius: 10, background: "#f5f5f5" }} />
                        )}
                        <div style={{ marginTop: 6, fontSize: 12, opacity: 0.8, wordBreak: "break-word" }}>
                          {a.file_name}
                        </div>
                        {(isOwner || false) ? (
                          <div style={{ marginTop: 6 }}>
                            <button
                              onClick={() => deleteAttachment(a)}
                              style={{ padding: "6px 10px", borderRadius: 12, border: "1px solid #ddd", cursor: "pointer" }}
                            >
                              Smazat
                            </button>
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {/* Přílohy */}
            {files.length ? (
              <div style={{ marginTop: 16 }}>
                <div style={{ fontWeight: 800, marginBottom: 8 }}>Přílohy</div>
                <div style={{ display: "grid", gap: 8 }}>
                  {files.map((a) => {
                    const url = attUrls[a.id];
                    return (
                      <div key={a.id} style={{ border: "1px solid #eee", borderRadius: 12, padding: 10, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                        <div style={{ fontWeight: 700, wordBreak: "break-word" }}>{a.file_name}</div>
                        <div style={{ fontSize: 12, opacity: 0.7 }}>
                          {a.mime_type || "soubor"}
                          {typeof a.file_size === "number" ? ` • ${Math.round(a.file_size / 1024)} KB` : ""}
                        </div>
                        <div style={{ marginLeft: "auto", display: "flex", gap: 10, alignItems: "center" }}>
                          {url ? (
                            <a href={url} target="_blank" rel="noreferrer" style={{ textDecoration: "underline" }}>
                              Otevřít / stáhnout
                            </a>
                          ) : (
                            <span style={{ fontSize: 12, opacity: 0.7 }}>generuji odkaz…</span>
                          )}
                          {isOwner ? (
                            <button
                              onClick={() => deleteAttachment(a)}
                              style={{ padding: "6px 10px", borderRadius: 12, border: "1px solid #ddd", cursor: "pointer" }}
                            >
                              Smazat
                            </button>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {/* Kontakt */}
            <div style={{ marginTop: 16, paddingTop: 12, borderTop: "1px solid #eee" }}>
              <div style={{ fontWeight: 800, marginBottom: 6 }}>Kontakt</div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                <a href={`mailto:${row.contact_email}`} style={{ textDecoration: "underline" }}>
                  {row.contact_email}
                </a>
                <a href={`tel:${row.contact_phone}`} style={{ textDecoration: "underline" }}>
                  {row.contact_phone}
                </a>
              </div>
            </div>

            {/* Reakce */}
            <div style={{ marginTop: 16, paddingTop: 12, borderTop: "1px solid #eee" }}>
              <div style={{ fontWeight: 800, marginBottom: 8 }}>Reakce</div>

              <div style={{ display: "grid", gap: 10 }}>
                {comments.length === 0 ? (
                  <div style={{ fontSize: 12, opacity: 0.7 }}>Zatím žádné reakce.</div>
                ) : (
                  comments.map((c) => (
                    <div key={c.id} style={{ border: "1px solid #eee", borderRadius: 12, padding: 10 }}>
                      {c.is_deleted ? (
                        <div style={{ fontSize: 12, opacity: 0.7 }}>Reakce byla skryta.</div>
                      ) : (
                        <div style={{ whiteSpace: "pre-wrap" }}>{c.body}</div>
                      )}
                      <div style={{ marginTop: 6, fontSize: 12, opacity: 0.7, display: "flex", gap: 10, flexWrap: "wrap" }}>
                        <span>{new Date(c.created_at).toLocaleString("cs-CZ")}</span>

                        {(meId && (c.author_id === meId)) ? (
                          <button
                            onClick={() => softDeleteComment(c.id)}
                            style={{ padding: "4px 8px", borderRadius: 10, border: "1px solid #ddd", cursor: "pointer" }}
                          >
                            Skrýt
                          </button>
                        ) : null}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 12, opacity: 0.7 }}>Napsat reakci</div>
                <textarea
                  value={commentBody}
                  onChange={(e) => setCommentBody(e.target.value)}
                  rows={4}
                  style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
                />
                <div style={{ marginTop: 8 }}>
                  <button
                    onClick={addComment}
                    disabled={sendingComment}
                    style={{ padding: "8px 12px", borderRadius: 12, border: "1px solid #ddd", cursor: "pointer" }}
                  >
                    {sendingComment ? "Odesílám…" : "Odeslat reakci"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ padding: 12, opacity: 0.7 }}>Inzerát nenalezen.</div>
        )}
      </div>
    </RequireAuth>
  );
}
