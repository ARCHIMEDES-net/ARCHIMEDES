import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import RequireAuth from "../../components/RequireAuth";
import PortalHeader from "../../components/PortalHeader";
import { supabase } from "../../lib/supabaseClient";

const BUCKET = "portal-posts";
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024;

function slugFileName(name = "") {
  return name.replace(/\s+/g, "-").toLowerCase();
}

export default function AdminPrispevkyPage() {
  const router = useRouter();
  const postId = router.query.id;

  const section = useMemo(() => {
    return router.query.section === "contests" ? "contests" : "community";
  }, [router.query.section]);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPublished, setIsPublished] = useState(true);

  const [imageFile, setImageFile] = useState(null);
  const [attachmentFile, setAttachmentFile] = useState(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // LOAD POST FOR EDIT
  useEffect(() => {
    if (!postId) return;

    async function load() {
      const { data } = await supabase
        .from("portal_posts")
        .select("*")
        .eq("id", postId)
        .single();

      if (data) {
        setTitle(data.title || "");
        setContent(data.content || "");
        setIsPublished(!!data.is_published);
      }
    }

    load();
  }, [postId]);

  async function uploadFiles() {
    let imagePath = null;
    let attachmentPath = null;
    let attachmentName = null;

    if (imageFile) {
      const path = `${section}/${Date.now()}-${slugFileName(imageFile.name)}`;
      const { error } = await supabase.storage.from(BUCKET).upload(path, imageFile);
      if (error) throw error;
      imagePath = path;
    }

    if (attachmentFile) {
      const path = `${section}/${Date.now()}-${slugFileName(attachmentFile.name)}`;
      const { error } = await supabase.storage.from(BUCKET).upload(path, attachmentFile);
      if (error) throw error;
      attachmentPath = path;
      attachmentName = attachmentFile.name;
    }

    return {
      imagePath,
      attachmentPath,
      attachmentName,
      uploadedFiles: [imagePath, attachmentPath].filter(Boolean),
    };
  }

  function validate() {
    if (imageFile) {
      if (!imageFile.type.startsWith("image/")) {
        throw new Error("Neplatný obrázek");
      }
      if (imageFile.size > MAX_IMAGE_SIZE) {
        throw new Error("Obrázek je moc velký");
      }
    }

    if (attachmentFile && attachmentFile.size > MAX_ATTACHMENT_SIZE) {
      throw new Error("Příloha je moc velká");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (saving) return;

    setSaving(true);
    setError("");
    setMessage("");

    let uploadedFiles = [];

    try {
      const cleanTitle = title.trim();
      const cleanContent = content.trim();

      if (!cleanTitle) throw new Error("Vyplň nadpis");
      if (!cleanContent) throw new Error("Vyplň text");

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!postId) {
        validate();

        const {
          imagePath,
          attachmentPath,
          attachmentName,
          uploadedFiles: files,
        } = await uploadFiles();

        uploadedFiles = files;

        const res = await fetch("/api/portal-posts-create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            section,
            title: cleanTitle,
            content: cleanContent,
            is_published: isPublished,
            image_path: imagePath,
            attachment_path: attachmentPath,
            attachment_name: attachmentName,
          }),
        });

        const result = await res.json();
        if (!res.ok) throw new Error(result.error);
      } else {
        const res = await fetch("/api/portal-posts-update", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            id: postId,
            title: cleanTitle,
            content: cleanContent,
            is_published: isPublished,
          }),
        });

        const result = await res.json();
        if (!res.ok) throw new Error(result.error);
      }

      setMessage("Uloženo");

      if (!postId) {
        setTitle("");
        setContent("");
        setImageFile(null);
        setAttachmentFile(null);
      }
    } catch (e) {
      if (uploadedFiles.length) {
        await supabase.storage.from(BUCKET).remove(uploadedFiles);
      }
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <RequireAuth>
      <PortalHeader title={postId ? "Upravit příspěvek" : "Přidat příspěvek"} />

      <div style={{ padding: 20, maxWidth: 600 }}>
        {error && <div style={{ color: "red" }}>{error}</div>}
        {message && <div style={{ color: "green" }}>{message}</div>}

        <form onSubmit={handleSubmit}>
          <input
            placeholder="Nadpis"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ width: "100%", marginBottom: 10 }}
          />

          <textarea
            placeholder="Text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={{ width: "100%", height: 150, marginBottom: 10 }}
          />

          {!postId && (
            <>
              <input type="file" onChange={(e) => setImageFile(e.target.files[0])} />
              <input type="file" onChange={(e) => setAttachmentFile(e.target.files[0])} />
            </>
          )}

          <label>
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
            />
            Publikovat
          </label>

          <button disabled={saving}>
            {saving ? "Ukládám..." : "Uložit"}
          </button>
        </form>
      </div>
    </RequireAuth>
  );
}
