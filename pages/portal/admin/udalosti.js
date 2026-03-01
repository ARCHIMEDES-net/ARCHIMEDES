import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import RequireAuth from "../../../components/RequireAuth";
import { supabase } from "../../../lib/supabaseClient";

const ADMIN_EMAILS = [
  "antonin.koplik@gmail.com", // ty
  // sem pak doplníme další 2 admin e-maily
];

export default function AdminUdalosti() {
  const [userEmail, setUserEmail] = useState("");
  const [loadingUser, setLoadingUser] = useState(true);

  const [form, setForm] = useState({
    title: "",
    start_at: "",
    audience: "",
    full_description: "",
    stream_url: "",
    worksheet_url: "",
  });

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const isAdmin = useMemo(() => ADMIN_EMAILS.includes(userEmail), [userEmail]);

  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      setUserEmail(data?.user?.email || "");
      setLoadingUser(false);
    }
    loadUser();
  }, []);

  function update(key, val) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function saveEvent(e) {
    e.preventDefault();
    setMsg("");
    setSaving(true);

    const payload = {
      title: form.title.trim(),
      audience: form.audience.trim() || null,
      full_description: form.full_description.trim() || null,
      stream_url: form.stream_url.trim() || null,
      worksheet_url: form.worksheet_url.trim() || null,
      start_at: form.start_at ? new Date(form.start_at).toISOString() : null,
    };

    const { error } = await supabase.from("events").insert(payload);

    if (error) {
      setMsg("Chyba: " + (error.message || "nelze uložit"));
    } else {
      setMsg("✅ Událost uložena");
      setForm({
        title: "",
        start_at: "",
        audience: "",
        full_description: "",
        stream_url: "",
        worksheet_url: "",
      });
    }

    setSaving(false);
  }

  return (
    <RequireAuth>
      <div style={{ maxWidth: 900, margin: "40px auto", fontFamily: "system-ui", padding: 16 }}>
        <h1>Admin – události</h1>

        <p>
          <Link href="/portal">← Zpět do portálu</Link>{" "}
          <span style={{ opacity: 0.6 }}>|</span>{" "}
          <Link href="/portal/kalendar">Kalendář</Link>
        </p>

        {loadingUser && <p>Načítám uživatele…</p>}

        {!loadingUser && !isAdmin && (
          <p style={{ color: "crimson" }}>
            Nemáš oprávnění pro administraci. ({userEmail || "bez emailu"})
          </p>
        )}

        {!loadingUser && isAdmin && (
          <>
            <p style={{ opacity: 0.8 }}>Přihlášen jako: <strong>{userEmail}</strong></p>

            <form onSubmit={saveEvent} style={{ display: "grid", gap: 10 }}>
              <label>
                Název události*<br />
                <input
                  value={form.title}
                  onChange={(e) => update("title", e.target.value)}
                  required
                  style={{ width: "100%", padding: 10 }}
                />
              </label>

              <label>
                Datum a čas (start_at)<br />
                <input
                  type="datetime-local"
                  value={form.start_at}
                  onChange={(e) => update("start_at", e.target.value)}
                  style={{ width: "100%", padding: 10 }}
                />
              </label>

              <label>
                Cílovka (audience)<br />
                <input
                  value={form.audience}
                  onChange={(e) => update("audience", e.target.value)}
                  placeholder="1. stupeň / 2. stupeň / senioři / komunita…"
                  style={{ width: "100%", padding: 10 }}
                />
              </label>

              <label>
                Popis (full_description)<br />
                <textarea
                  value={form.full_description}
                  onChange={(e) => update("full_description", e.target.value)}
                  rows={5}
                  style={{ width: "100%", padding: 10 }}
                />
              </label>

              <label>
                Odkaz na vysílání (stream_url)<br />
                <input
                  value={form.stream_url}
                  onChange={(e) => update("stream_url", e.target.value)}
                  placeholder="https://..."
                  style={{ width: "100%", padding: 10 }}
                />
              </label>

              <label>
                Pracovní list (worksheet_url)<br />
                <input
                  value={form.worksheet_url}
                  onChange={(e) => update("worksheet_url", e.target.value)}
                  placeholder="https://..."
                  style={{ width: "100%", padding: 10 }}
                />
              </label>

              <button
                type="submit"
                disabled={saving}
                style={{ padding: "10px 14px", cursor: "pointer" }}
              >
                {saving ? "Ukládám…" : "Uložit událost"}
              </button>

              {msg && <div style={{ marginTop: 8 }}>{msg}</div>}
            </form>
          </>
        )}
      </div>
    </RequireAuth>
  );
}
