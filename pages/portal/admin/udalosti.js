import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import RequireAuth from "../../../components/RequireAuth";
import { supabase } from "../../../lib/supabaseClient";

function toInputDateTime(value) {
  // value může být timestamptz => chceme "YYYY-MM-DDTHH:mm"
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

export default function AdminUdalosti() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  const [loadingList, setLoadingList] = useState(true);
  const [events, setEvents] = useState([]);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  // formulář
  const [title, setTitle] = useState("");
  const [startAt, setStartAt] = useState(""); // datetime-local
  const [audience, setAudience] = useState("");
  const [fullDescription, setFullDescription] = useState("");
  const [streamUrl, setStreamUrl] = useState("");
  const [worksheetUrl, setWorksheetUrl] = useState("");
  const [isPublished, setIsPublished] = useState(false);

  const canSave = useMemo(() => {
    return title.trim().length > 0;
  }, [title]);

  useEffect(() => {
    let mounted = true;
    async function check() {
      setCheckingAdmin(true);
      const { data, error } = await supabase.rpc("is_platform_admin");
      if (!mounted) return;
      setIsAdmin(!error && data === true);
      setCheckingAdmin(false);
    }
    check();
    return () => (mounted = false);
  }, []);

  async function loadEvents() {
    setLoadingList(true);
    setErr("");
    setMsg("");

    const { data, error } = await supabase
      .from("events")
      .select("id,title,start_at,audience,is_published,updated_at")
      .order("updated_at", { ascending: false });

    if (error) {
      setErr(error.message || "Nepodařilo se načíst seznam událostí.");
      setEvents([]);
    } else {
      setEvents(Array.isArray(data) ? data : []);
    }

    setLoadingList(false);
  }

  useEffect(() => {
    if (!checkingAdmin && isAdmin) {
      loadEvents();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkingAdmin, isAdmin]);

  async function saveEvent(e) {
    e.preventDefault();
    setErr("");
    setMsg("");

    if (!canSave) {
      setErr("Vyplň Název události.");
      return;
    }

    // startAt: pokud je vyplněno, pošleme jako ISO
    const start_at_value = startAt ? new Date(startAt).toISOString() : null;

    const payload = {
      title: title.trim(),
      start_at: start_at_value,
      audience: audience.trim() || null,
      full_description: fullDescription.trim() || null,
      stream_url: streamUrl.trim() || null,
      worksheet_url: worksheetUrl.trim() || null,
      is_published: !!isPublished,
    };

    const { error } = await supabase.from("events").insert(payload);

    if (error) {
      setErr(error.message || "Uložení selhalo.");
      return;
    }

    setMsg("Uloženo.");
    // vyčistit formulář
    setTitle("");
    setStartAt("");
    setAudience("");
    setFullDescription("");
    setStreamUrl("");
    setWorksheetUrl("");
    setIsPublished(false);

    await loadEvents();
  }

  async function togglePublished(id, current) {
    setErr("");
    setMsg("");

    const { error } = await supabase
      .from("events")
      .update({ is_published: !current })
      .eq("id", id);

    if (error) {
      setErr(error.message || "Změna publikace selhala.");
      return;
    }

    setMsg("Změněno.");
    await loadEvents();
  }

  if (checkingAdmin) {
    return (
      <RequireAuth>
        <div style={{ maxWidth: 980, margin: "40px auto", fontFamily: "system-ui", padding: 16 }}>
          <h1>Admin – události</h1>
          <p>Kontroluji oprávnění…</p>
        </div>
      </RequireAuth>
    );
  }

  if (!isAdmin) {
    return (
      <RequireAuth>
        <div style={{ maxWidth: 980, margin: "40px auto", fontFamily: "system-ui", padding: 16 }}>
          <h1>Admin – události</h1>
          <p style={{ color: "crimson" }}>Nemáš oprávnění pro administraci.</p>
          <p>
            <Link href="/portal">← Zpět do portálu</Link>
          </p>
        </div>
      </RequireAuth>
    );
  }

  return (
    <RequireAuth>
      <div style={{ maxWidth: 980, margin: "40px auto", fontFamily: "system-ui", padding: 16 }}>
        <h1>Admin – události</h1>

        <p style={{ marginTop: 8 }}>
          <Link href="/portal">← Zpět do portálu</Link> {" | "}
          <Link href="/portal/kalendar">Kalendář</Link>
        </p>

        {err && <p style={{ color: "crimson" }}>Chyba: {err}</p>}
        {msg && <p style={{ color: "green" }}>{msg}</p>}

        <h2 style={{ marginTop: 24 }}>Nová událost</h2>

        <form onSubmit={saveEvent}>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: "block", fontWeight: 700 }}>Název události*</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ width: "100%", padding: 10 }}
              placeholder="např. Wellbeing pro 1. stupeň"
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ display: "block", fontWeight: 700 }}>Datum a čas (start_at)</label>
            <input
              type="datetime-local"
              value={startAt}
              onChange={(e) => setStartAt(e.target.value)}
              style={{ padding: 10 }}
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ display: "block", fontWeight: 700 }}>Cílovka (audience)</label>
            <input
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              style={{ width: "100%", padding: 10 }}
              placeholder="1. stupeň / 2. stupeň / senioři / komunita…"
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ display: "block", fontWeight: 700 }}>Popis (full_description)</label>
            <textarea
              value={fullDescription}
              onChange={(e) => setFullDescription(e.target.value)}
              style={{ width: "100%", padding: 10, minHeight: 110 }}
              placeholder="Krátký popis události…"
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ display: "block", fontWeight: 700 }}>Odkaz na vysílání (stream_url)</label>
            <input
              value={streamUrl}
              onChange={(e) => setStreamUrl(e.target.value)}
              style={{ width: "100%", padding: 10 }}
              placeholder="https://meet.google.com/..."
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ display: "block", fontWeight: 700 }}>Pracovní list (worksheet_url)</label>
            <input
              value={worksheetUrl}
              onChange={(e) => setWorksheetUrl(e.target.value)}
              style={{ width: "100%", padding: 10 }}
              placeholder="https://..."
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
              />
              <span style={{ fontWeight: 700 }}>Publikovat (is_published = true)</span>
            </label>
            <div style={{ fontSize: 13, opacity: 0.75, marginTop: 4 }}>
              Když není publikováno, neuvidí se v kalendáři.
            </div>
          </div>

          <button
            type="submit"
            disabled={!canSave}
            style={{ padding: "10px 16px", cursor: canSave ? "pointer" : "not-allowed" }}
          >
            Uložit událost
          </button>
        </form>

        <h2 style={{ marginTop: 32 }}>Seznam událostí</h2>

        {loadingList ? (
          <p>Načítám…</p>
        ) : events.length === 0 ? (
          <p>Zatím žádné události.</p>
        ) : (
          <div style={{ marginTop: 10 }}>
            {events.map((e) => (
              <div
                key={e.id}
                style={{
                  borderTop: "1px solid #eee",
                  paddingTop: 12,
                  paddingBottom: 12,
                }}
              >
                <div style={{ fontWeight: 800 }}>
                  {e.title || "(bez názvu)"}{" "}
                  <span style={{ fontWeight: 600, opacity: 0.7 }}>
                    {e.start_at ? `— ${toInputDateTime(e.start_at).replace("T", " ")}` : ""}
                  </span>
                </div>

                {e.audience && <div style={{ opacity: 0.85 }}>Cílovka: {e.audience}</div>}

                <div style={{ marginTop: 6 }}>
                  <button
                    onClick={() => togglePublished(e.id, e.is_published)}
                    style={{ padding: "6px 10px", cursor: "pointer" }}
                  >
                    {e.is_published ? "Znepublikovat" : "Publikovat"}
                  </button>

                  <span style={{ marginLeft: 10, fontSize: 13, opacity: 0.8 }}>
                    Stav: {e.is_published ? "PUBLISHED" : "DRAFT"}
                  </span>

                  <span style={{ marginLeft: 12 }}>
                    {" | "}
                    <Link href={`/portal/udalost/${e.id}`}>Otevřít detail</Link>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </RequireAuth>
  );
}
