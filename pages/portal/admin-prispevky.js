import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import RequireAuth from "../../components/RequireAuth";
import PortalHeader from "../../components/PortalHeader";
import { supabase } from "../../lib/supabaseClient";

const BUCKET = "portal-posts";

export default function AdminPrispevky() {
  const router = useRouter();
  const { id } = router.query;

  const resolvedSection = useMemo(() => {
    const raw = String(router.query.section || "").trim().toLowerCase();
    if (raw === "contests") return "contests";
    return "community";
  }, [router.query.section]);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPublished, setIsPublished] = useState(true);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [existingImagePath, setExistingImagePath] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;

    async function loadPost() {
      const { data, error } = await supabase
        .from("portal_posts")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        alert(error.message || "Nepodařilo se načíst příspěvek.");
        return;
      }

      if (data) {
        setTitle(data.title || "");
        setContent(data.content || "");
        setIsPublished(Boolean(data.is_published));
        setExistingImagePath(data.image_path || "");

        if (data.image_path) {
          const { data: urlData } = supabase.storage
            .from(BUCKET)
            .getPublicUrl(data.image_path);

          setImagePreview(urlData?.publicUrl || "");
        } else {
          setImagePreview("");
        }
      }
    }

    loadPost();
  }, [id]);

  function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function uploadImage(file) {
    const ext = String(file.name.split(".").pop() || "jpg").toLowerCase();
    const fileName = `${Date.now()}.${ext}`;
    const path = `${resolvedSection}/${fileName}`;

    const { error } = await supabase.storage.from(BUCKET).upload(path, file);

    if (error) throw error;

    return path;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!router.isReady) {
      alert("Stránka ještě není plně načtená. Zkuste to prosím znovu.");
      return;
    }

    if (!title.trim()) {
      alert("Vyplňte nadpis.");
      return;
    }

    if (!content.trim()) {
      alert("Vyplňte text.");
      return;
    }

    setLoading(true);

    try {
      let imagePath = existingImagePath || null;

      if (imageFile) {
        imagePath = await uploadImage(imageFile);
      }

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) throw sessionError;
      if (!session?.access_token) {
        throw new Error("Nejste přihlášený.");
      }

      const endpoint = id
        ? "/api/portal-posts-update"
        : "/api/portal-posts-create";

      const payload = id
        ? {
            id,
            title: title.trim(),
            content: content.trim(),
            is_published: isPublished,
            image_path: imagePath,
          }
        : {
            section: resolvedSection,
            title: title.trim(),
            content: content.trim(),
            is_published: isPublished,
            image_path: imagePath,
          };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(result?.error || "Nepodařilo se uložit příspěvek.");
      }

      router.push(
        resolvedSection === "contests" ? "/portal/souteze" : "/portal/komunita"
      );
    } catch (err) {
      alert(err?.message || "Nepodařilo se uložit příspěvek.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <RequireAuth>
      <PortalHeader title="Admin - příspěvek" />

      <div style={{ padding: 20 }}>
        <form onSubmit={handleSubmit} style={{ maxWidth: 600 }}>
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
            style={{ width: "100%", height: 120, marginBottom: 10 }}
          />

          <div style={{ marginBottom: 10 }}>
            <input type="file" accept="image/*" onChange={handleImageChange} />
          </div>

          {imagePreview && (
            <img
              src={imagePreview}
              alt="Náhled obrázku"
              style={{ width: "100%", marginBottom: 10 }}
            />
          )}

          <label>
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
            />
            Publikovat
          </label>

          <br />

          <button type="submit" disabled={loading}>
            {loading ? "Ukládám..." : "Uložit"}
          </button>
        </form>
      </div>
    </RequireAuth>
  );
}
