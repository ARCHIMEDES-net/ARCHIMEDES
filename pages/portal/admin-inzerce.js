import { useEffect, useState } from "react";
import Link from "next/link";
import RequireAuth from "../../components/RequireAuth";
import PortalHeader from "../../components/PortalHeader";
import { supabase } from "../../lib/supabaseClient";

function AdminTopNav({ active }) {
  const baseBtn = {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 12px",
    borderRadius: 999,
    border: "1px solid #e5e7eb",
    background: "#fff",
    textDecoration: "none",
    color: "#111827",
    fontSize: 13,
    fontWeight: 900,
    lineHeight: 1,
    boxShadow: "0 1px 0 rgba(0,0,0,0.02)",
  };

  const activeBtn = {
    ...baseBtn,
    background: "#111827",
    border: "1px solid #111827",
    color: "#fff",
  };

  const btn = (key) => (active === key ? activeBtn : baseBtn);

  return (
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
      <Link href="/portal/admin-udalosti" style={btn("udalosti")}>
        Události
      </Link>
      <Link href="/portal/admin-inzerce" style={btn("inzerce")}>
        Inzerce
      </Link>
      <Link href="/portal/kalendar" style={btn("program")}>
        Program
      </Link>
      <Link href="/portal" style={btn("portal")}>
        Portál
      </Link>
    </div>
  );
}

function formatDateTimeCS(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString("cs-CZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

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
        "id,type,category,title,location,is_archimedes,is_pinned,status,created_at,author_id,contact_email,contact_phone"
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

  const card = {
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    padding: 14,
    background: "#fff",
  };

  const softBadge = {
    fontSize: 12,
    padding: "4px 8px",
    borderRadius: 999,
    background: "#f3f4f6",
    border: "1px solid #e5e7eb",
    fontWeight: 900,
    lineHeight: 1,
  };

  const btn = {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    background: "#fff",
    color: "#111827",
    fontWeight: 900,
    cursor: "pointer",
    textDecoration: "none",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
  };

  const btnDark = {
    ...btn,
    border: "1px solid #111827",
    background: "#111827",
    color: "#fff",
  };

  return (
    <RequireAuth>
      <PortalHeader />

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "18px 16px" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <div>
            <h1 style={{ margin: "10px 0 6px" }}>Admin – inzerce</h1>
            <div style={{ color: "#374151" }}>Moderace inzerátů, TOP a ARCHIMEDES štítků.</div>
          </div>

          <AdminTopNav active="inzerce" />
        </div>

        {/* Actions */}
        <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <Link href="/portal/inzerce/novy" style={btnDark}>
            + Nový inzerát
          </Link>

          <button onClick={load} style={btn}>
            Obnovit
          </button>

          <Link href="/portal/inzerce" style={btn}>
            Zobrazit veřejnou inzerci
          </Link>
        </div>

        {/* Error */}
        {err ? (
          <div
            style={{
              marginTop: 12,
              padding: 12,
              borderRadius: 12,
              border: "1px solid #fecaca",
              background: "#fef2f2",
            }}
          >
            <b>Chyba:</b> {err}
          </div>
        ) : null}

        {/* Content */}
        {loading ? (
          <div style={{ marginTop: 12, padding: 12, opacity: 0.7 }}>Načítám…</div>
        ) : (
          <section style={{ marginTop: 14 }}>
            <h2 style={{ margin: "0 0 10px" }}>Inzeráty (TOP nahoře, pak nejnovější)</h2>

            <div style={{ display: "grid", gap: 12 }}>
              {rows.map((r) => (
                <div key={r.id} style={card}>
                  <div
                    style={{
                      display: "flex",
                      gap: 12,
                      alignItems: "flex-start",
                      flexWrap: "wrap",
                      justifyContent: "space-between",
                    }}
                  >
                    <div style={{ minWidth: 260, flex: "1 1 520px" }}>
                      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                        <div style={{ fontWeight: 900, fontSize: 16 }}>{r.title}</div>

                        {r.is_pinned ? (
                          <span style={{ ...softBadge, background: "#111827", border: "1px solid #111827", color: "#fff" }}>
                            TOP
                          </span>
                        ) : null}

                        {r.is_archimedes ? (
                          <span style={softBadge}>ARCHIMEDES</span>
                        ) : null}

                        {r.status ? (
                          <span style={{ ...softBadge, background: "#f9fafb" }}>{r.status}</span>
                        ) : null}
                      </div>

                      <div style={{ marginTop: 6, color: "#374151", fontSize: 13 }}>
                        <b>{r.category || "—"}</b>
                        {"  "}•{"  "}
                        {r.type || "—"}
                        {r.location ? (
                          <>
                            {"  "}•{"  "}
                            {r.location}
                          </>
                        ) : null}
                      </div>

                      <div style={{ marginTop: 6, fontSize: 12, color: "#6b7280" }}>
                        Vloženo: {formatDateTimeCS(r.created_at)}
                      </div>

                      <div style={{ marginTop: 10, fontSize: 13, color: "#374151" }}>
                        <b>Kontakt:</b>{" "}
                        {r.contact_email ? (
                          <a href={`mailto:${r.contact_email}`}>{r.contact_email}</a>
                        ) : (
                          "—"
                        )}
                        {"  "}•{"  "}
                        {r.contact_phone ? <a href={`tel:${r.contact_phone}`}>{r.contact_phone}</a> : "—"}
                      </div>
                    </div>

                    {/* Controls */}
                    <div style={{ display: "grid", gap: 10, justifyItems: "end" }}>
                      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
                        <Link href={`/portal/inzerce/${r.id}`} style={btn}>
                          Detail
                        </Link>

                        <button
                          onClick={() => remove(r.id)}
                          style={{
                            ...btn,
                            border: "1px solid #fecaca",
                          }}
                        >
                          Smazat
                        </button>
                      </div>

                      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
                        <label style={{ display: "flex", gap: 8, alignItems: "center", fontWeight: 900 }}>
                          <input
                            type="checkbox"
                            checked={!!r.is_pinned}
                            onChange={(e) => toggle(r.id, "is_pinned", e.target.checked)}
                          />
                          TOP
                        </label>

                        <label style={{ display: "flex", gap: 8, alignItems: "center", fontWeight: 900 }}>
                          <input
                            type="checkbox"
                            checked={!!r.is_archimedes}
                            onChange={(e) => toggle(r.id, "is_archimedes", e.target.checked)}
                          />
                          ARCHIMEDES
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {rows.length === 0 ? (
                <div style={{ ...card, opacity: 0.8 }}>
                  Zatím tu nejsou žádné inzeráty.
                </div>
              ) : null}
            </div>
          </section>
        )}
      </main>
    </RequireAuth>
  );
}
