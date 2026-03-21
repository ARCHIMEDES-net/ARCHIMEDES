import { useEffect, useState } from "react";
import Link from "next/link";
import RequirePlatformAdmin from "../../components/RequirePlatformAdmin";
import PortalHeader from "../../components/PortalHeader";
import { supabase } from "../../lib/supabaseClient";

export default function AdminInzerce() {
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setErr("");

    const { data, error } = await supabase
      .from("marketplace_posts")
      .select(
        "id,type,category,title,location,is_archimedes,is_pinned,status,created_at,expires_at,contact_email,contact_phone"
      )
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      setErr(error.message || "Chyba při načítání.");
      setRows([]);
      setLoading(false);
      return;
    }

    setRows(data || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function toggle(id, field, value) {
    setErr("");
    const { error } = await supabase
      .from("marketplace_posts")
      .update({ [field]: value })
      .eq("id", id);

    if (error) {
      setErr(error.message || "Nepodařilo se uložit změnu.");
      return;
    }

    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  }

  async function remove(id) {
    if (!confirm("Opravdu smazat inzerát?")) return;

    setErr("");
    const { error } = await supabase.from("marketplace_posts").delete().eq("id", id);

    if (error) {
      setErr(error.message || "Nepodařilo se smazat.");
      return;
    }

    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  const pillBtn = (active = false) => ({
    padding: "10px 12px",
    borderRadius: 999,
    border: "1px solid #e5e7eb",
    background: active ? "#111827" : "#fff",
    color: active ? "#fff" : "#111827",
    fontWeight: 900,
    textDecoration: "none",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
  });

  const small = { fontSize: 12, color: "#6b7280" };

  return (
    <RequirePlatformAdmin>
      <PortalHeader />

      <main style={{ padding: 16, maxWidth: 1100, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
            flexWrap: "wrap",
            marginBottom: 12,
          }}
        >
          <div>
            <h1 style={{ margin: "8px 0 4px" }}>Admin – inzerce</h1>
            <div style={{ color: "#374151" }}>
              Správa inzerátů (TOP, ARCHIMEDES, mazání).
            </div>
          </div>

          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <Link href="/portal" style={pillBtn(false)}>
              Portál
            </Link>
            <Link href="/portal/inzerce" style={pillBtn(false)}>
              Inzerce
            </Link>
            <Link href="/portal/inzerce/novy" style={pillBtn(false)}>
              + Nový inzerát
            </Link>
            <button
              onClick={load}
              style={{
                padding: "10px 12px",
                borderRadius: 999,
                border: "1px solid #e5e7eb",
                background: "#fff",
                fontWeight: 900,
                cursor: "pointer",
              }}
            >
              Obnovit
            </button>
          </div>
        </div>

        {err ? (
          <div
            style={{
              padding: 12,
              border: "1px solid #fecaca",
              background: "#fef2f2",
              borderRadius: 12,
              marginBottom: 12,
            }}
          >
            <b>Chyba:</b> {err}
          </div>
        ) : null}

        {loading ? (
          <div style={{ padding: 12, opacity: 0.7 }}>Načítám…</div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {rows.map((r) => (
              <div
                key={r.id}
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 16,
                  padding: 14,
                  background: "#fff",
                }}
              >
                <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                  <div style={{ fontWeight: 900, fontSize: 16 }}>{r.title}</div>

                  <div style={{ ...small, marginLeft: 6 }}>
                    {r.category} • {r.type} • {r.status} •{" "}
                    {new Date(r.created_at).toLocaleString("cs-CZ")}
                    {r.expires_at
                      ? ` • Expirace: ${new Date(r.expires_at).toLocaleString("cs-CZ")}`
                      : ""}
                  </div>

                  <div
                    style={{
                      marginLeft: "auto",
                      display: "flex",
                      gap: 12,
                      alignItems: "center",
                      flexWrap: "wrap",
                    }}
                  >
                    <Link href={`/portal/inzerce/${r.id}`} style={{ fontWeight: 900 }}>
                      Detail
                    </Link>

                    <label
                      style={{ display: "flex", gap: 6, alignItems: "center", fontWeight: 900 }}
                    >
                      <input
                        type="checkbox"
                        checked={!!r.is_pinned}
                        onChange={(e) => toggle(r.id, "is_pinned", e.target.checked)}
                      />
                      TOP
                    </label>

                    <label
                      style={{ display: "flex", gap: 6, alignItems: "center", fontWeight: 900 }}
                    >
                      <input
                        type="checkbox"
                        checked={!!r.is_archimedes}
                        onChange={(e) => toggle(r.id, "is_archimedes", e.target.checked)}
                      />
                      ARCHIMEDES
                    </label>

                    <button
                      onClick={() => remove(r.id)}
                      style={{
                        padding: "10px 12px",
                        borderRadius: 999,
                        border: "1px solid #fecaca",
                        background: "#fff",
                        fontWeight: 900,
                        cursor: "pointer",
                      }}
                    >
                      Smazat
                    </button>
                  </div>
                </div>

                <div style={{ marginTop: 6, ...small }}>
                  Kontakt: {r.contact_email || "—"} • {r.contact_phone || "—"}{" "}
                  {r.location ? `• ${r.location}` : ""}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </RequirePlatformAdmin>
  );
}
