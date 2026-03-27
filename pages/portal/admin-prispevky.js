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

      <div style={{ background: "#f6f7fb", minHeight: "100vh", padding: 20 }}>
        <div
          style={{
            maxWidth: 980,
            margin: "0 auto",
            background: "white",
            borderRadius: 24,
            border: "1px solid rgba(15,23,42,0.08)",
            boxShadow: "0 14px 36px rgba(15,23,42,0.04)",
            padding: 24,
          }}
        >
          <div style={{ marginBottom: 18 }}>
            <div
              style={{
                display: "inline-flex",
                padding: "6px 10px",
                borderRadius: 999,
                background: "rgba(15,23,42,0.06)",
                color: "#0f172a",
                fontSize: 12,
                fontWeight: 800,
                marginBottom: 12,
              }}
            >
              {resolvedSection === "contests"
                ? "ARCHIMEDES Live • soutěže a projekty"
                : "ARCHIMEDES Live • komunita"}
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: 30,
                lineHeight: 1.1,
                color: "#0f172a",
              }}
            >
              {id ? "Upravit příspěvek" : "Nový příspěvek"}
            </h1>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 24 }}>
              <div style={{ flex: "1 1 520px", minWidth: 0 }}>
                <input
                  placeholder="Nadpis"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={inputStyle}
                />

                <textarea
                  placeholder="Text"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  style={textareaStyle}
                />

                <div style={{ marginBottom: 12 }}>
                  <input type="file" accept="image/*" onChange={handleImageChange} />
                </div>

                <label style={checkboxRowStyle}>
                  <input
                    type="checkbox"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                  />
                  <span>Publikovat</span>
                </label>

                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 20 }}>
                  <button type="submit" disabled={loading} style={saveBtnStyle}>
                    {loading ? "Ukládám..." : "Uložit"}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        resolvedSection === "contests" ? "/portal/souteze" : "/portal/komunita"
                      )
                    }
                    style={cancelBtnStyle}
                  >
                    Zpět
                  </button>
                </div>
              </div>

              <div style={{ flex: "0 0 320px", maxWidth: 320, width: "100%" }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 800,
                    color: "rgba(15,23,42,0.68)",
                    marginBottom: 10,
                  }}
                >
                  Náhled obrázku
                </div>

                {imagePreview ? (
                  <div style={previewFrameStyle}>
                    <img
                      src={imagePreview}
                      alt="Náhled obrázku"
                      style={previewImageStyle}
                    />
                  </div>
                ) : (
                  <div style={previewEmptyStyle}>Zatím bez obrázku</div>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </RequireAuth>
  );
}

const inputStyle = {
  width: "100%",
  marginBottom: 12,
  padding: "14px 16px",
  borderRadius: 14,
  border: "1px solid rgba(15,23,42,0.12)",
  fontSize: 16,
  outline: "none",
  boxSizing: "border-box",
};

const textareaStyle = {
  width: "100%",
  height: 220,
  marginBottom: 12,
  padding: "14px 16px",
  borderRadius: 14,
  border: "1px solid rgba(15,23,42,0.12)",
  fontSize: 16,
  outline: "none",
  boxSizing: "border-box",
  resize: "vertical",
};

const checkboxRowStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: 10,
  fontWeight: 700,
  color: "#0f172a",
};

const saveBtnStyle = {
  border: "none",
  background: "#0f172a",
  color: "white",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "12px 16px",
  borderRadius: 14,
  fontWeight: 900,
  cursor: "pointer",
};

const cancelBtnStyle = {
  border: "1px solid rgba(15,23,42,0.12)",
  background: "white",
  color: "#0f172a",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "12px 16px",
  borderRadius: 14,
  fontWeight: 900,
  cursor: "pointer",
};

const previewFrameStyle = {
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

const previewImageStyle = {
  width: "100%",
  height: "100%",
  objectFit: "contain",
  objectPosition: "center",
  display: "block",
  padding: 18,
  boxSizing: "border-box",
};

const previewEmptyStyle = {
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
