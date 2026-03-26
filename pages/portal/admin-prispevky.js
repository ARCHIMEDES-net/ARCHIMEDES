// pages/portal/admin-prispevky.js
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import RequireAuth from "../../components/RequireAuth";
import PortalHeader from "../../components/PortalHeader";
import { supabase } from "../../lib/supabaseClient";

const BUCKET = "portal-posts";

function slugFileName(name = "") {
  return String(name)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9._-]/g, "")
    .toLowerCase();
}

export default function AdminPrispevkyPage() {
  const router = useRouter();

  const section = useMemo(() => {
    const raw = String(router.query.section || "").toLowerCase().trim();
    return raw === "contests" ? "contests" : "community";
  }, [router.query.section]);

  const backHref = section === "contests" ? "/portal/souteze" : "/portal/komunita";
  const sectionLabel = section === "contests" ? "Soutěže a projekty" : "Komunita";

  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPublished, setIsPublished] = useState(true);

  const [imageFile, setImageFile] = useState(null);
  const [attachmentFile, setAttachmentFile] = useState(null);

  useEffect(() => {
    let alive = true;

    async function checkAdmin() {
      try {
        const { data, error } = await supabase.rpc("is_admin");
        if (!alive) return;
        if (error) throw error;
        setIsAdmin(!!data);
      } catch (e) {
        if (!alive) return;
        setIsAdmin(false);
        setError(e?.message || "Nepodařilo se ověřit oprávnění.");
      } finally {
        if (alive) setChecking(false);
      }
    }

    checkAdmin();

    return () => {
      alive = false;
    };
  }, []);

  async function uploadOptionalFiles() {
    let imagePath = null;
    let attachmentPath = null;
    let attachmentName = null;

    if (imageFile) {
      const fileName = `${section}/${Date.now()}-${slugFileName(imageFile.name)}`;
      const { error: uploadImageError } = await supabase.storage
        .from(BUCKET)
        .upload(fileName, imageFile, { upsert: false });

      if (uploadImageError) throw uploadImageError;
      imagePath = fileName;
    }

    if (attachmentFile) {
      const fileName = `${section}/${Date.now()}-${slugFileName(attachmentFile.name)}`;
      const { error: uploadAttachmentError } = await supabase.storage
        .from(BUCKET)
        .upload(fileName, attachmentFile, { upsert: false });

      if (uploadAttachmentError) throw uploadAttachmentError;
      attachmentPath = fileName;
      attachmentName = attachmentFile.name;
    }

    return {
      imagePath,
      attachmentPath,
      attachmentName,
    };
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (saving) return;

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const cleanTitle = String(title || "").trim();
      const cleanContent = String(content || "").trim();

      if (!cleanTitle) throw new Error("Vyplňte nadpis.");
      if (!cleanContent) throw new Error("Vyplňte text příspěvku.");

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) throw sessionError;
      if (!session?.access_token) throw new Error("Nejste přihlášený.");

      const { imagePath, attachmentPath, attachmentName } = await uploadOptionalFiles();

      const response = await fetch("/api/portal-posts-create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          section,
          title: cleanTitle,
          content: cleanContent,
          is_published: !!isPublished,
          image_path: imagePath,
          attachment_path: attachmentPath,
          attachment_name: attachmentName,
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result?.error || "Nepodařilo se uložit příspěvek.");
      }

      setTitle("");
      setContent("");
      setIsPublished(true);
      setImageFile(null);
      setAttachmentFile(null);
      setMessage("Příspěvek byl uložen.");
    } catch (e) {
      setError(e?.message || "Nepodařilo se uložit příspěvek.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <RequireAuth>
      <PortalHeader title="Přidat příspěvek" />

      <div style={{ background: "#f6f7fb", minHeight: "100vh" }}>
        <div style={{ maxWidth: 860, margin: "0 auto", padding: "24px 16px 48px" }}>
          <section
            style={{
              background: "white",
              border: "1px solid rgba(15,23,42,0.08)",
              borderRadius: 24,
              padding: 22,
              boxShadow: "0 14px 36px rgba(15,23,42,0.04)",
            }}
          >
            {checking ? (
              <div style={infoBoxStyle}>Načítám oprávnění…</div>
            ) : !isAdmin ? (
              <div style={errorBoxStyle}>Tato stránka je dostupná jen správcům portálu.</div>
            ) : (
              <>
                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    marginBottom: 18,
                  }}
                >
                  <div>
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        padding: "6px 10px",
                        borderRadius: 999,
                        background: "rgba(15,23,42,0.06)",
                        color: "#0f172a",
                        fontSize: 12,
                        fontWeight: 800,
                        marginBottom: 12,
                      }}
                    >
                      {sectionLabel}
                    </div>

                    <h1
                      style={{
                        margin: 0,
                        fontSize: 32,
                        lineHeight: 1.08,
                        color: "#0f172a",
                        letterSpacing: "-0.02em",
                      }}
                    >
                      Přidat příspěvek
                    </h1>

                    <p
                      style={{
                        margin: "10px 0 0",
                        fontSize: 15,
                        lineHeight: 1.6,
                        color: "rgba(15,23,42,0.72)",
                        maxWidth: 720,
                      }}
                    >
                      Zadejte nadpis, text a případně přiložte obrázek nebo soubor.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => router.push(backHref)}
                    style={secondaryBtnStyle}
                  >
                    Zpět
                  </button>
                </div>

                {error ? <div style={errorBoxStyle}>{error}</div> : null}
                {message ? <div style={successBoxStyle}>{message}</div> : null}

                <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
                  <div>
                    <label style={labelStyle}>Nadpis</label>
                    <input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Např. Nový projekt, pozvánka, výzva, zpráva ze školy…"
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Text příspěvku</label>
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Napište obsah příspěvku…"
                      rows={8}
                      style={{ ...inputStyle, minHeight: 180, resize: "vertical" }}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Obrázek</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                    />
                    {imageFile ? <div style={hintStyle}>Vybraný soubor: {imageFile.name}</div> : null}
                  </div>

                  <div>
                    <label style={labelStyle}>Příloha</label>
                    <input
                      type="file"
                      onChange={(e) => setAttachmentFile(e.target.files?.[0] || null)}
                    />
                    {attachmentFile ? (
                      <div style={hintStyle}>Vybraný soubor: {attachmentFile.name}</div>
                    ) : null}
                  </div>

                  <label
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 10,
                      fontWeight: 700,
                      color: "#0f172a",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isPublished}
                      onChange={(e) => setIsPublished(e.target.checked)}
                    />
                    Publikovat ihned
                  </label>

                  <button type="submit" disabled={saving} style={primaryBtnStyle}>
                    {saving ? "Ukládám…" : "Uložit příspěvek"}
                  </button>
                </form>
              </>
            )}
          </section>
        </div>
      </div>
    </RequireAuth>
  );
}

const labelStyle = {
  display: "block",
  fontSize: 14,
  fontWeight: 800,
  color: "#0f172a",
  marginBottom: 8,
};

const inputStyle = {
  width: "100%",
  minHeight: 48,
  padding: "12px 14px",
  borderRadius: 14,
  border: "1px solid rgba(15,23,42,0.14)",
  background: "white",
  fontSize: 15,
  boxSizing: "border-box",
};

const primaryBtnStyle = {
  border: "none",
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
  cursor: "pointer",
};

const secondaryBtnStyle = {
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

const infoBoxStyle = {
  background: "white",
  border: "1px dashed rgba(15,23,42,0.16)",
  borderRadius: 18,
  padding: 16,
  color: "rgba(15,23,42,0.72)",
};

const errorBoxStyle = {
  background: "#fff3f3",
  border: "1px solid #ffd0d0",
  borderRadius: 16,
  padding: 14,
  color: "#8a1f1f",
  marginBottom: 16,
};

const successBoxStyle = {
  background: "#f3fff3",
  border: "1px solid #cfeecf",
  borderRadius: 16,
  padding: 14,
  color: "#166534",
  marginBottom: 16,
};

const hintStyle = {
  marginTop: 8,
  fontSize: 13,
  lineHeight: 1.5,
  color: "rgba(15,23,42,0.64)",
};
