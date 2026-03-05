import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import RequireAuth from "../../../components/RequireAuth";
import PortalHeader from "../../../components/PortalHeader";
import { supabase } from "../../../lib/supabaseClient";

const BUCKET = "schools";

function publicUrlFromPath(path) {
  if (!path) return null;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data?.publicUrl || null;
}

export default function SkolyIndex() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  async function load() {
    setLoading(true);
    setErr("");

    const { data, error } = await supabase
      .from("schools")
      .select(
        "id,name,city,region,country,website,school_type,short_description,photo_path,has_archimedes_classroom,is_published,archimedes_since,created_at"
      )
      .eq("has_archimedes_classroom", true)
      .eq("is_published", true)
      .order("created_at", { ascending: false });

    if (error) {
      setErr(error.message);
      setLoading(false);
      return;
    }

    setRows(data || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const items = useMemo(() => {
    return (rows || []).map((r) => ({
      ...r,
      photo_url: publicUrlFromPath(r.photo_path),
    }));
  }, [rows]);

  return (
    <RequireAuth>
      <PortalHeader />
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "18px 14px 40px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-end", marginBottom: 14 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 24, letterSpacing: -0.2 }}>Síť učeben ARCHIMEDES</h1>
            <div style={{ color: "rgba(0,0,0,0.65)", marginTop: 6, lineHeight: 1.35 }}>
              Přehled škol s učebnou ARCHIMEDES. Slouží jako reference, inspirace a možnost kontaktu.
            </div>
          </div>
          <div style={{ fontSize: 13, color: "rgba(0,0,0,0.55)" }}>
            Celkem: <b style={{ color: "rgba(0,0,0,0.85)" }}>{items.length}</b>
          </div>
        </div>

        {err ? (
          <div
            style={{
              background: "rgba(220,38,38,0.08)",
              border: "1px solid rgba(220,38,38,0.18)",
              borderRadius: 14,
              padding: 12,
              color: "rgba(0,0,0,0.85)",
              marginBottom: 14,
            }}
          >
            Chyba: {err}
          </div>
        ) : null}

        {loading ? (
          <div style={{ color: "rgba(0,0,0,0.65)" }}>Načítám…</div>
        ) : items.length === 0 ? (
          <div style={{ color: "rgba(0,0,0,0.65)" }}>Zatím zde nejsou žádné publikované školy.</div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 14,
              marginTop: 10,
            }}
          >
            {items.map((r) => (
              <Link key={r.id} href={`/portal/skoly/${r.id}`} style={{ textDecoration: "none" }}>
                <div
                  style={{
                    background: "white",
                    border: "1px solid rgba(0,0,0,0.08)",
                    borderRadius: 18,
                    overflow: "hidden",
                    boxShadow: "0 12px 30px rgba(0,0,0,0.06)",
                    transition: "transform 120ms ease",
                  }}
                >
                  <div style={{ height: 160, background: "rgba(0,0,0,0.04)" }}>
                    {r.photo_url ? (
                      <img
                        src={r.photo_url}
                        alt={r.name || "Učebna"}
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                      />
                    ) : (
                      <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(0,0,0,0.45)", fontSize: 13 }}>
                        Bez fotky
                      </div>
                    )}
                  </div>

                  <div style={{ padding: 14 }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: "rgba(0,0,0,0.88)", lineHeight: 1.25 }}>
                      {r.name || "—"}
                    </div>

                    <div style={{ marginTop: 6, fontSize: 13, color: "rgba(0,0,0,0.62)" }}>
                      {(r.city ? r.city : "—")}
                      {r.region ? ` • ${r.region}` : ""}
                      {r.country ? ` • ${r.country}` : ""}
                    </div>

                    {r.short_description ? (
                      <div style={{ marginTop: 10, fontSize: 13, color: "rgba(0,0,0,0.72)", lineHeight: 1.35 }}>
                        {r.short_description}
                      </div>
                    ) : null}

                    <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {r.school_type ? (
                        <span
                          style={{
                            fontSize: 12,
                            padding: "6px 10px",
                            borderRadius: 999,
                            background: "rgba(0,0,0,0.04)",
                            border: "1px solid rgba(0,0,0,0.08)",
                            color: "rgba(0,0,0,0.75)",
                          }}
                        >
                          {r.school_type}
                        </span>
                      ) : null}
                      {r.archimedes_since ? (
                        <span
                          style={{
                            fontSize: 12,
                            padding: "6px 10px",
                            borderRadius: 999,
                            background: "rgba(16,185,129,0.10)",
                            border: "1px solid rgba(16,185,129,0.20)",
                            color: "rgba(0,0,0,0.75)",
                          }}
                        >
                          Učebna od {new Date(r.archimedes_since).getFullYear()}
                        </span>
                      ) : null}
                    </div>

                    <div style={{ marginTop: 14, fontSize: 13, fontWeight: 700, color: "rgba(0,0,0,0.85)" }}>
                      Zobrazit detail →
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </RequireAuth>
  );
}
