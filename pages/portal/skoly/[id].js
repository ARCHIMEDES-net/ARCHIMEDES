// pages/portal/skoly/[id].js
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import RequireAuth from "../../../components/RequireAuth";
import PortalHeader from "../../../components/PortalHeader";
import { supabase } from "../../../lib/supabaseClient";

const BUCKET = "schools";

function publicUrlFromPath(path) {
  if (!path) return null;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data?.publicUrl || null;
}

export default function SchoolDetail() {
  const router = useRouter();
  const { id } = router.query;

  const [row, setRow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      setErr("");

      const { data, error } = await supabase
        .from("schools")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) {
        setErr(error.message);
        setLoading(false);
        return;
      }

      if (!data) {
        setErr("Škola nebyla nalezena nebo není publikovaná.");
        setLoading(false);
        return;
      }

      setRow(data);
      setLoading(false);
    })();
  }, [id]);

  const photoUrl = useMemo(() => publicUrlFromPath(row?.photo_path), [row?.photo_path]);

  return (
    <RequireAuth>
      <PortalHeader title="Síť učeben" />

      <div style={{ background: "#f6f7fb", minHeight: "100vh" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "18px 16px 40px" }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12 }}>
            <Link href="/portal/skoly" style={{ textDecoration: "none", fontWeight: 800, color: "#111827" }}>
              ← Zpět na seznam
            </Link>
          </div>

          {loading ? (
            <div style={{ opacity: 0.7, padding: 12 }}>Načítám…</div>
          ) : err ? (
            <div
              style={{
                background: "#fff3f3",
                border: "1px solid #ffd0d0",
                padding: 12,
                borderRadius: 12,
                color: "#8a1f1f",
                whiteSpace: "pre-wrap",
              }}
            >
              Chyba: {err}
            </div>
          ) : (
            <div
              style={{
                background: "white",
                border: "1px solid rgba(0,0,0,0.08)",
                borderRadius: 18,
                overflow: "hidden",
              }}
            >
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr" }}>
                <div style={{ padding: 14 }}>
                  <div style={{ fontWeight: 900, fontSize: 22, lineHeight: 1.15 }}>{row?.name}</div>
                  <div style={{ marginTop: 6, fontSize: 13, opacity: 0.75 }}>
                    {(row?.address ? row.address + ", " : "")}
                    {row?.city || ""}
                    {row?.region ? ` • ${row.region}` : ""}
                  </div>

                  <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
                    {row?.website ? (
                      <a href={row.website} target="_blank" rel="noreferrer" style={{ fontWeight: 800 }}>
                        Web školy →
                      </a>
                    ) : null}

                    {row?.contact_name || row?.contact_email || row?.contact_phone ? (
                      <div style={{ borderTop: "1px solid rgba(0,0,0,0.08)", paddingTop: 10 }}>
                        <div style={{ fontWeight: 900, marginBottom: 6 }}>Kontakt</div>
                        {row?.contact_name ? <div>{row.contact_name}</div> : null}
                        {row?.contact_email ? <div>{row.contact_email}</div> : null}
                        {row?.contact_phone ? <div>{row.contact_phone}</div> : null}
                      </div>
                    ) : null}

                    {row?.short_description ? (
                      <div style={{ borderTop: "1px solid rgba(0,0,0,0.08)", paddingTop: 10 }}>
                        <div style={{ fontWeight: 900, marginBottom: 6 }}>O škole</div>
                        <div style={{ opacity: 0.85, lineHeight: 1.5 }}>{row.short_description}</div>
                      </div>
                    ) : null}

                    {row?.classroom_description ? (
                      <div style={{ borderTop: "1px solid rgba(0,0,0,0.08)", paddingTop: 10 }}>
                        <div style={{ fontWeight: 900, marginBottom: 6 }}>Popis učebny</div>
                        <div style={{ opacity: 0.85, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
                          {row.classroom_description}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>

                <div style={{ background: "rgba(0,0,0,0.03)", minHeight: 320, position: "relative" }}>
                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt={row?.name || "Fotka učebny"}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <div style={{ padding: 14, opacity: 0.7 }}>
                      Zatím bez fotky.
                      <div style={{ marginTop: 8, fontSize: 12 }}>
                        Tip: fotku doplníš v <b>Admin – Školy</b>.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <style jsx>{`
            @media (max-width: 900px) {
              div[style*="grid-template-columns: 1fr 1.2fr"] {
                grid-template-columns: 1fr !important;
              }
            }
          `}</style>
        </div>
      </div>
    </RequireAuth>
  );
}
