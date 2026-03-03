import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import RequireAuth from "../../../components/RequireAuth";
import PortalHeader from "../../../components/PortalHeader";
import { supabase } from "../../../lib/supabaseClient";

function typeLabel(t) {
  if (t === "offer") return "NABÍDKA";
  if (t === "demand") return "POPTÁVKA";
  if (t === "partnership") return "PARTNERSTVÍ";
  return t || "";
}

export default function InzeratDetail() {
  const router = useRouter();
  const { id } = router.query;

  const [row, setRow] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);
  const [meId, setMeId] = useState(null);

  const isOwner = useMemo(() => (row?.author_id && meId ? row.author_id === meId : false), [row, meId]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      setMeId(data?.user?.id || null);
    })();
  }, []);

  useEffect(() => {
    if (!id) return;

    (async () => {
      setLoading(true);
      setErr("");

      const { data, error } = await supabase
        .from("marketplace_posts")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        setErr(error.message || "Nepodařilo se načíst inzerát.");
        setRow(null);
        setLoading(false);
        return;
      }

      setRow(data);
      setLoading(false);
    })();
  }, [id]);

  async function setStatus(next) {
    if (!row) return;
    setErr("");

    const { error } = await supabase
      .from("marketplace_posts")
      .update({ status: next })
      .eq("id", row.id);

    if (error) {
      setErr(error.message || "Nepodařilo se uložit změnu.");
      return;
    }

    setRow((r) => ({ ...r, status: next }));
  }

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

            <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid #eee" }}>
              <div style={{ fontWeight: 800, marginBottom: 6 }}>Kontakt</div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                <a href={`mailto:${row.contact_email}`} style={{ textDecoration: "underline" }}>
                  {row.contact_email}
                </a>
                <a href={`tel:${row.contact_phone}`} style={{ textDecoration: "underline" }}>
                  {row.contact_phone}
                </a>
              </div>
              <div style={{ marginTop: 8, fontSize: 12, opacity: 0.7 }}>
                Vloženo: {new Date(row.created_at).toLocaleString("cs-CZ")}
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
