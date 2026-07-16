import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import RequirePlatformAdmin from "../../components/RequirePlatformAdmin";
import PortalHeader from "../../components/PortalHeader";
import { supabase } from "../../lib/supabaseClient";
import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Switch } from "../../components/ui/switch";
import { Button } from "../../components/ui/button";

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
    <RequirePlatformAdmin>
      <PortalHeader title="Admin - příspěvek" />

      <div className="min-h-screen bg-slate-50 p-5">
        <Card className="mx-auto max-w-[980px] p-6">
          <div className="mb-4">
            <Badge variant="dark" className="mb-3 normal-case tracking-normal">
              {resolvedSection === "contests"
                ? "ARCHIMEDES Live • soutěže a projekty"
                : "ARCHIMEDES Live • komunita"}
            </Badge>

            <h1 className="text-[30px] leading-tight text-navy-900">
              {id ? "Upravit příspěvek" : "Nový příspěvek"}
            </h1>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="flex flex-wrap gap-6">
              <div className="min-w-0 flex-1 basis-[520px]">
                <Input
                  placeholder="Nadpis"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mb-3"
                />

                <Textarea
                  placeholder="Text"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="mb-3 h-[220px]"
                />

                <div className="mb-3">
                  <input type="file" accept="image/*" onChange={handleImageChange} />
                </div>

                <label className="inline-flex items-center gap-2.5 font-bold text-navy-900">
                  <Switch checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} />
                  <span>Publikovat</span>
                </label>

                <div className="mt-5 flex flex-wrap gap-3">
                  <Button type="submit" disabled={loading} variant="primary">
                    {loading ? "Ukládám..." : "Uložit"}
                  </Button>

                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() =>
                      router.push(
                        resolvedSection === "contests" ? "/portal/souteze" : "/portal/komunita"
                      )
                    }
                  >
                    Zpět
                  </Button>
                </div>
              </div>

              <div className="w-full max-w-[320px] flex-none basis-[320px]">
                <div className="mb-2.5 text-xs font-black text-slate-500">Náhled obrázku</div>

                {imagePreview ? (
                  <div className="flex h-[260px] w-full items-center justify-center overflow-hidden rounded-2xl border border-slate-900/[0.08] bg-white">
                    <img
                      src={imagePreview}
                      alt="Náhled obrázku"
                      className="h-full w-full object-contain p-4"
                    />
                  </div>
                ) : (
                  <div className="flex h-[260px] w-full items-center justify-center rounded-2xl border border-dashed border-slate-900/[0.14] bg-slate-50 font-bold text-slate-400">
                    Zatím bez obrázku
                  </div>
                )}
              </div>
            </div>
          </form>
        </Card>
      </div>
    </RequirePlatformAdmin>
  );
}
