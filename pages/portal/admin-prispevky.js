import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import RequireAuth from "../../components/RequireAuth";
import PortalHeader from "../../components/PortalHeader";
import { supabase } from "../../lib/supabaseClient";

const BUCKET = "portal-posts";

export default function AdminPrispevky() {
  const router = useRouter();
  const { id, section } = router.query;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPublished, setIsPublished] = useState(true);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;

    async function loadPost() {
      const { data } = await supabase
        .from("portal_posts")
        .select("*")
        .eq("id", id)
        .single();

      if (data) {
        setTitle(data.title || "");
        setContent(data.content || "");
        setIsPublished(data.is_published);

        if (data.image_path) {
          const { data: urlData } = supabase.storage
            .from(BUCKET)
            .getPublicUrl(data.image_path);

          setImagePreview(urlData.publicUrl);
        }
      }
    }

    loadPost();
  }, [id]);

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function uploadImage(file) {
    const ext = file.name.split(".").pop();
    const fileName = `${Date.now()}.${ext}`;

    const path = `${section}/${fileName}`;

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, file);

    if (error) throw error;

    return path;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      let imagePath = null;

      if (imageFile) {
        imagePath = await uploadImage(imageFile);
      }

      if (id) {
        // UPDATE
        await supabase
          .from("portal_posts")
          .update({
            title,
            content,
            is_published: isPublished,
            ...(imagePath && { image_path: imagePath }),
          })
          .eq("id", id);
      } else {
        // INSERT
        await supabase.from("portal_posts").insert({
          title,
          content,
          section,
          is_published: isPublished,
          image_path: imagePath,
        });
      }

      router.push(section === "contests" ? "/portal/souteze" : "/portal/komunita");
    } catch (err) {
      alert(err.message);
    }

    setLoading(false);
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

          {/* IMAGE UPLOAD */}
          <div style={{ marginBottom: 10 }}>
            <input type="file" accept="image/*" onChange={handleImageChange} />
          </div>

          {imagePreview && (
            <img
              src={imagePreview}
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
