// pages/portal/udalost/[id].js
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import RequireAuth from "../../../components/RequireAuth";
import { supabase } from "../../../lib/supabaseClient"; // pokud máš jinou cestu, uprav

export default function UdalostDetail() {
  const router = useRouter();
  const { id } = router.query;

  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!router.isReady) return;

    async function load() {
      setLoading(true);
      setErrorMsg("");
      setEvent(null);

      // 1) Admin check (nevadí když selže – jen admin práva budou false)
      const { data: adminData } = await supabase.rpc("is_platform_admin");
      const admin = adminData === true;
      setIsAdmin(admin);

      // 2) Event fetch
      const { data, error } = await supabase
        .from("events")
        .select("id,title,audience,full_description,stream_url,worksheet_url,start_at,is_published,created_at,updated_at")
        .eq("id", id)
        .maybeSingle();

      if (error) {
        setErrorMsg(`Chyba načítání: ${error.message}`);
        setLoading(false);
        return;
      }

      if (!data) {
        setErrorMsg("Událost nebyla nalezena (neexistuje nebo nemáš přístup).");
        setLoading(false);
        return;
      }

      // 3) Pokud není publikovaná a uživatel není admin → schovat
      if (!data.is_published && !admin) {
        setErrorMsg("Tato událost není publikovaná.");
        setLoading(false);
        return;
      }

      setEvent(data);
      setLoading(false);
    }

    load();
  }, [router.isReady, id]);

  return (
    <RequireAuth>
      <div style={{ maxWidth: 900, margin: "40px auto", fontFamily: "system-ui", padding: 16 }}>
        <p style={{ marginBottom: 10 }}>
          <Link href="/portal/kalendar">← Zpět do kalendáře</Link>
        </p>

        {loading && <p>Načítám…</p>}

        {!loading && errorMsg && (
          <div>
            <h1>Detail události</h1>
            <p style={{ color: "crimson" }}>{errorMsg}</p>
          </div>
        )}

        {!loading && event && (
          <div>
            <h1>{event.title}</h1>

            <p>
              <strong>Datum:</strong>{" "}
              {event.start_at ? new Date(event.start_at).toLocaleString("cs-CZ") : "—"}
            </p>

            {event.audience && (
              <p>
                <strong>Cílovka:</strong> {event.audience}
              </p>
            )}

            {event.full_description && (
              <div style={{ marginTop: 12, whiteSpace: "pre-wrap" }}>
                {event.full_description}
              </div>
            )}

            <div style={{ marginTop: 16 }}>
              {event.stream_url && (
                <p>
                  <strong>Vysílání:</strong>{" "}
                  <a href={event.stream_url} target="_blank" rel="noreferrer">
                    otevřít odkaz
                  </a>
                </p>
              )}

              {event.worksheet_url && (
                <p>
                  <strong>Pracovní list:</strong>{" "}
                  <a href={event.worksheet_url} target="_blank" rel="noreferrer">
                    otevřít odkaz
                  </a>
                </p>
              )}
            </div>

            <hr style={{ margin: "18px 0" }} />

            <p>
              <strong>Stav:</strong> {event.is_published ? "PUBLISHED" : "DRAFT"}
              {isAdmin ? " (admin)" : ""}
            </p>
          </div>
        )}
      </div>
    </RequireAuth>
  );
}
