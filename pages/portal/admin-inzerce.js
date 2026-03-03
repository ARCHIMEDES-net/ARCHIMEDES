import { useEffect, useState } from "react";
import Link from "next/link";
import RequireAuth from "../../components/RequireAuth";
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
      .select("id,type,category,title,location,is_archimedes,is_pinned,status,created_at,author_id,contact_email,contact_phone")
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
    const { error } = await supabase.from("marketplace_posts").update({ [field]: value }).eq("id", id);
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

  return (
    <RequireAuth>
      <PortalHeader title="Admin – Inzerce" />

      <div style={{ padding: 16, maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", marginBottom: 12 }}>
          <Link href="/portal">← Zpět do portálu</Link>
          <div style={{ marginLeft: "auto", display: "flex", gap: 12 }}>
            <Link href="/portal/inzerce/novy">+ Nový inzerát</Link>
            <button onClick={load} style={{ padding: "8px 12px", borderRadius: 12, border: "1px solid #ddd", cursor: "pointer" }}>
              Obnovit
            </button>
          </div>
        </div>

        {err ? (
          <div style={{ padding: 12, border: "1px solid #f3c2c2", background: "#fff4f4", borderRadius: 12, marginBottom: 12 }}>
            Chyba: {err}
          </div>
        ) : null}

        {loading ? (
          <div style={{ padding: 12, opacity: 0.7 }}>Načítám…</div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {rows.map((r) => (
              <div key={r.id} style={{ border: "1px solid #e6e6e6", borderRadius: 14, padding: 12 }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                  <div style={{ fontWeight: 800 }}>{r.title}</div>
                  <div style={{ fontSize: 12, opacity: 0.7 }}>
                    {r.category} • {r.type} • {r.status} • {new Date(r.created_at).toLocaleString("cs-CZ")}
                  </div>
                  <div style={{ marginLeft: "auto", display: "flex", gap: 10, alignItems: "center" }}>
                    <Link href={`/portal/inzerce/${r.id}`}>Detail</Link>

                    <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <input
                        type="checkbox"
                        checked={!!r.is_pinned}
                        onChange={(e) => toggle(r.id, "is_pinned", e.target.checked)}
                      />
                      TOP
                    </label>

                    <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <input
                        type="checkbox"
                        checked={!!r.is_archimedes}
                        onChange={(e) => toggle(r.id, "is_archimedes", e.target.checked)}
                      />
                      ARCHIMEDES
                    </label>

                    <button
                      onClick={() => remove(r.id)}
                      style={{ padding: "8px 10px", borderRadius: 12, border: "1px solid #ddd", cursor: "pointer" }}
                    >
                      Smazat
                    </button>
                  </div>
                </div>

                <div style={{ marginTop: 6, fontSize: 12, opacity: 0.7 }}>
                  Kontakt: {r.contact_email} • {r.contact_phone}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </RequireAuth>
  );
}
