// pages/poptavka.js
import { useState } from "react";
import Link from "next/link";
import PortalHeader from "../components/PortalHeader";
import { supabase } from "../lib/supabaseClient";

export default function Poptavka() {
  const [form, setForm] = useState({
    type: "obec",
    organization: "",
    contact_name: "",
    email: "",
    phone: "",
    note: "",
  });
  const [sending, setSending] = useState(false);
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState("");

  function set(k, v) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  async function submit(e) {
    e.preventDefault();
    setErr("");
    setOk(false);

    if (!form.organization.trim()) return setErr("Doplň název obce/školy.");
    if (!form.contact_name.trim()) return setErr("Doplň kontaktní osobu.");
    if (!form.email.trim()) return setErr("Doplň e-mail.");

    setSending(true);
    try {
      const payload = {
        ...form,
        organization: form.organization.trim(),
        contact_name: form.contact_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        note: form.note || "",
        source_path: typeof window !== "undefined" ? window.location.pathname : null,
      };

      // 1) Uložit do Supabase
      const { error } = await supabase.from("leads").insert(payload);
      if (error) throw new Error(error.message);

      // 2) Odeslat do Make webhooku (bez backendu)
      // POZOR: pokud by Make v budoucnu vyžadoval CORS, použijeme místo toho /api/make-lead
      const makeUrl = "https://hook.eu1.make.com/kh63p8nprtcq6dcf1sdfroktoqwdnduf";
      const r = await fetch(makeUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!r.ok) {
        const text = await r.text().catch(() => "");
        throw new Error(
          `Make webhook chyba: ${r.status} ${r.statusText}${text ? " – " + text.slice(0, 120) : ""}`
        );
      }

      setOk(true);
      setForm({
        type: "obec",
        organization: "",
        contact_name: "",
        email: "",
        phone: "",
        note: "",
      });
    } catch (e2) {
      setErr(e2?.message || "Odeslání se nepovedlo.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f6f7fb" }}>
      {/* sjednocená hlavička (stejné logo/pozice jako v portálu) */}
      <PortalHeader />

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "22px 16px 40px" }}>
        <h1 style={{ margin: "6px 0 10px", fontSize: 28 }}>Poptávka licence</h1>
        <div style={{ opacity: 0.8, marginBottom: 14 }}>
          Nech nám kontakt. Ozveme se a pošleme přístup / smluvní podklady.
        </div>

        {err ? (
          <div
            style={{
              background: "#fff3f3",
              border: "1px solid #ffd0d0",
              padding: 12,
              borderRadius: 12,
              marginBottom: 14,
              color: "#8a1f1f",
            }}
          >
            {err}
          </div>
        ) : null}

        {ok ? (
          <div
            style={{
              background: "#f1fff5",
              border: "1px solid #bff0c9",
              padding: 12,
              borderRadius: 12,
              marginBottom: 14,
              color: "#145f2a",
            }}
          >
            Děkujeme! Poptávka byla odeslána. Ozveme se co nejdřív.
          </div>
        ) : null}

        <form
          onSubmit={submit}
          style={{
            background: "white",
            border: "1px solid rgba(0,0,0,0.10)",
            borderRadius: 16,
            padding: 16,
          }}
        >
          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
            <label style={{ display: "grid", gap: 6 }}>
              <span>Typ licence*</span>
              <select
                value={form.type}
                onChange={(e) => set("type", e.target.value)}
                style={{
                  padding: 10,
                  borderRadius: 12,
                  border: "1px solid rgba(0,0,0,0.18)",
                  background: "white",
                }}
              >
                <option value="obec">Obec</option>
                <option value="skola">Škola</option>
                <option value="senior">Senior klub</option>
              </select>
            </label>

            <label style={{ display: "grid", gap: 6 }}>
              <span>Název obce / školy*</span>
              <input
                value={form.organization}
                onChange={(e) => set("organization", e.target.value)}
                style={{
                  padding: 10,
                  borderRadius: 12,
                  border: "1px solid rgba(0,0,0,0.18)",
                }}
              />
            </label>

            <label style={{ display: "grid", gap: 6 }}>
              <span>Kontaktní osoba*</span>
              <input
                value={form.contact_name}
                onChange={(e) => set("contact_name", e.target.value)}
                style={{
                  padding: 10,
                  borderRadius: 12,
                  border: "1px solid rgba(0,0,0,0.18)",
                }}
              />
            </label>

            <label style={{ display: "grid", gap: 6 }}>
              <span>E-mail*</span>
              <input
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                style={{
                  padding: 10,
                  borderRadius: 12,
                  border: "1px solid rgba(0,0,0,0.18)",
                }}
              />
            </label>

            <label style={{ display: "grid", gap: 6 }}>
              <span>Telefon (volitelné)</span>
              <input
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                style={{
                  padding: 10,
                  borderRadius: 12,
                  border: "1px solid rgba(0,0,0,0.18)",
                }}
              />
            </label>

            <div />
          </div>

          <label style={{ display: "grid", gap: 6, marginTop: 12 }}>
            <span>Poznámka</span>
            <textarea
              rows={4}
              value={form.note}
              onChange={(e) => set("note", e.target.value)}
              style={{
                padding: 10,
                borderRadius: 12,
                border: "1px solid rgba(0,0,0,0.18)",
                resize: "vertical",
              }}
            />
          </label>

          <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
            <button
              type="submit"
              disabled={sending}
              style={{
                padding: "10px 14px",
                borderRadius: 12,
                border: "1px solid rgba(0,0,0,0.18)",
                background: "black",
                color: "white",
                fontWeight: 900,
                cursor: sending ? "not-allowed" : "pointer",
              }}
            >
              {sending ? "Odesílám…" : "Odeslat poptávku"}
            </button>

            <Link
              href="/cenik"
              style={{
                textDecoration: "none",
                padding: "10px 14px",
                borderRadius: 12,
                border: "1px solid rgba(0,0,0,0.18)",
                background: "white",
                color: "black",
                fontWeight: 800,
              }}
            >
              Zpět na ceník
            </Link>
          </div>
        </form>

        <div style={{ marginTop: 14, opacity: 0.7, fontSize: 12 }}>
          Tip: až budeš chtít, přidáme admin stránku pro přehled poptávek.
        </div>
      </div>
    </div>
  );
}
