import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import RequireAuth from "../../../components/RequireAuth";
import { supabase } from "../../../lib/supabaseClient";

function safeDate(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function formatDay(date) {
  return date.toLocaleDateString("cs-CZ", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatTime(date) {
  return date.toLocaleTimeString("cs-CZ", { hour: "2-digit", minute: "2-digit" });
}

export default function UdalostDetail() {
  const router = useRouter();
  const { id } = router.query;

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [event, setEvent] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (!id) return;

      setLoading(true);
      setErr("");

      // zjistit admina (kvůli draftům)
      const adminRes = await supabase.rpc("is_platform_admin");
      const adminOk = !adminRes.error && adminRes.data === true;

      const { data, error } = await supabase
        .from("events")
        .select("id,title,start_at,audience,full_description,stream_url,worksheet_url,is_published")
        .eq("id", id)
        .maybeSingle();

      if (!mounted) return;

      setIsAdmin(adminOk);

      if (error) {
        setErr(error.message || "Nepodařilo se načíst událost.");
        setEvent(null);
        setLoading(false);
        return;
      }

      if (!data) {
        setErr("Událost nenalezena.");
        setEvent(null);
        setLoading(false);
        return;
      }

      // pokud není published a uživatel není admin -> stop
      if (!data.is_published && !adminOk) {
        setErr("Tato událost není publikovaná.");
        setEvent(null);
        setLoading(false);
        return;
      }

      setEvent(data);
      setLoading(false);
    }

    load();
    return () => (mounted = false);
  }, [id]);

  const d = safeDate(event?.start_at);

  return (
    <RequireAuth>
      <div style={{ maxWidth: 980, margin: "40px auto", fontFamily: "system-ui", padding: 16 }}>
        <h1>Detail události</h1>

        <p style={{ marginTop: 8 }}>
          <Link href="/portal/kalendar">← Zpět na kalendář</Link>{" "}
          {" | "}
          <Link href="/portal">Portál</Link>
        </p>

        {loading && <p>Načítám…</p>}

        {!loading && err && (
          <p style={{ color: "crimson" }}>
            {err}
          </p>
        )}

        {!loading && !err && event && (
          <div style={{ marginTop: 16 }}>
            <h2 style={{ marginBottom: 8 }}>{event.title || "(bez názvu)"}</h2>

            {d && (
              <p style={{ marginTop: 0, opacity: 0.9 }}>
                {formatDay(d)} — {formatTime(d)}
              </p>
            )}

            {event.audience && (
              <p>
                <strong>Cílovka:</strong> {event.audience}
              </p>
            )}

            {event.full_description && (
              <p style={{ whiteSpace: "pre-wrap" }}>{event.full_description}</p>
            )}

            {(event.stream_url || event.worksheet_url) && (
              <div style={{ marginTop: 12 }}>
                {event.stream_url && (
                  <p>
                    <a href={event.stream_url} target="_blank" rel="noreferrer">
                      Otevřít vysílání
                    </a>
                  </p>
                )}
                {event.worksheet_url && (
                  <p>
                    <a href={event.worksheet_url} target="_blank" rel="noreferrer">
                      Pracovní list
                    </a>
                  </p>
                )}
              </div>
            )}

            {isAdmin && (
              <p style={{ marginTop: 16, fontSize: 13, opacity: 0.8 }}>
                Admin info: {event.is_published ? "PUBLISHED" : "DRAFT"}
              </p>
            )}
          </div>
        )}
      </div>
    </RequireAuth>
  );
}
