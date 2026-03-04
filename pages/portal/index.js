// pages/portal/index.js
import { useEffect, useState } from "react";
import Link from "next/link";
import RequireAuth from "../../components/RequireAuth";
import PortalHeader from "../../components/PortalHeader";
import { supabase } from "../../lib/supabaseClient";

function safeDate(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function formatDateTimeCS(value) {
  const d = safeDate(value);
  if (!d) return "—";
  return d.toLocaleString("cs-CZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function PortalIndex() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  const [nextEvents, setNextEvents] = useState([]);
  const [eventsErr, setEventsErr] = useState("");

  useEffect(() => {
    (async () => {
      // 1) admin práva
      try {
        const { data, error } = await supabase.rpc("is_admin");
        if (!error) setIsAdmin(!!data);
      } catch (e) {
        // no-op
      } finally {
        setCheckingAdmin(false);
      }

      // 2) nejbližší vysílání (veřejně publikované, budoucí)
      try {
        setEventsErr("");
        const nowIso = new Date().toISOString();

        const { data, error } = await supabase
          .from("events")
          .select("id,title,starts_at,category")
          .eq("is_published", true)
          .gt("starts_at", nowIso)
          .order("starts_at", { ascending: true })
          .limit(3);

        if (error) {
          setEventsErr(error.message);
        } else {
          setNextEvents(data || []);
        }
      } catch (e) {
        setEventsErr(e?.message || "Nepodařilo se načíst nejbližší vysílání.");
      }
    })();
  }, []);

  return (
    <RequireAuth>
      <PortalHeader title="Portál" />

      <div style={{ padding: 16, maxWidth: 980, margin: "0 auto" }}>
        <div style={{ fontSize: 14, opacity: 0.75, marginBottom: 12 }}>
          Přístup k obsahu pro registrované.
        </div>

        {/* Horní přehledové dlaždice */}
        <div style={{ display: "grid", gap: 12 }}>
          <Section title="Program">
            <NavLink href="/portal/kalendar" title="Kalendář" desc="Přehled vysílání jako TV program + detail." />
            <NavLink href="/portal/archiv" title="Archiv" desc="Záznamy, materiály a pracovní listy (postupně doplníme)." />
          </Section>

          <Section title="Komunita">
            <NavLink href="/portal/inzerce" title="Inzerce" desc="Nabídky, poptávky a partnerství mezi školami a obcemi." />
          </Section>
        </div>

        {/* Nejbližší vysílání */}
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 900, marginBottom: 8 }}>Nejbližší vysílání</div>

          {eventsErr ? (
            <div
              style={{
                background: "#fff3f3",
                border: "1px solid #ffd0d0",
                padding: 12,
                borderRadius: 12,
                color: "#8a1f1f",
                marginBottom: 10,
                whiteSpace: "pre-wrap",
              }}
            >
              Chyba: {eventsErr}
            </div>
          ) : null}

          {nextEvents.length === 0 ? (
            <div
              style={{
                background: "white",
                border: "1px solid rgba(0,0,0,0.08)",
                borderRadius: 14,
                padding: 12,
                opacity: 0.75,
              }}
            >
              Zatím nejsou naplánované publikované události.
            </div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {nextEvents.map((e) => (
                <div
                  key={e.id}
                  style={{
                    background: "white",
                    border: "1px solid rgba(0,0,0,0.10)",
                    borderRadius: 14,
                    padding: 12,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 900, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {e.title || "—"}
                    </div>
                    <div style={{ fontSize: 12, opacity: 0.75, marginTop: 2 }}>
                      {formatDateTimeCS(e.starts_at)}
                      {e.category ? <span style={{ marginLeft: 10 }}>• {e.category}</span> : null}
                    </div>
                  </div>

                  <Link
                    href="/portal/kalendar"
                    style={{
                      textDecoration: "none",
                      padding: "8px 12px",
                      borderRadius: 12,
                      border: "1px solid rgba(0,0,0,0.18)",
                      background: "#111827",
                      color: "white",
                      fontWeight: 900,
                      whiteSpace: "nowrap",
                    }}
                  >
                    Otevřít
                  </Link>
                </div>
              ))}
            </div>
          )}

          <div style={{ marginTop: 8, fontSize: 12, opacity: 0.65 }}>
            Zobrazuji max. 3 nejbližší publikované události. Kompletní seznam je v Kalendáři.
          </div>
        </div>

        {/* Admin sekce – jen pro správce */}
        <div style={{ marginTop: 16 }}>
          <Section title="Administrace">
            {checkingAdmin ? (
              <div style={{ padding: 12, opacity: 0.7 }}>Načítám práva…</div>
            ) : isAdmin ? (
              <>
                <NavLink href="/portal/admin-udalosti" title="Admin – Události" desc="Vkládání, úpravy a správa programu." />
                <NavLink href="/portal/admin-inzerce" title="Admin – Inzerce" desc="Moderace, TOP, ARCHIMEDES, mazání." />
                <NavLink href="/portal/admin-poptavky" title="Admin – Poptávky" desc="Přehled poptávek z veřejného formuláře (export CSV)." />
              </>
            ) : (
              <div style={{ padding: 12, opacity: 0.7 }}>Administrace je dostupná jen správcům.</div>
            )}
          </Section>
        </div>

        <div style={{ marginTop: 14, fontSize: 12, opacity: 0.65 }}>
          Tip: pokud někde uvidíš chybu oprávnění, je to typicky role/RLS nebo přihlášení.
        </div>
      </div>
    </RequireAuth>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ border: "1px solid #e6e6e6", borderRadius: 14, padding: 12, background: "white" }}>
      <div style={{ fontSize: 14, fontWeight: 900, marginBottom: 8 }}>{title}</div>
      <div style={{ display: "grid", gap: 8 }}>{children}</div>
    </div>
  );
}

function NavLink({ href, title, desc }) {
  return (
    <Link
      href={href}
      style={{
        display: "block",
        padding: 12,
        borderRadius: 14,
        border: "1px solid #eee",
        textDecoration: "none",
        background: "white",
      }}
    >
      <div style={{ fontWeight: 900 }}>{title}</div>
      {desc ? <div style={{ fontSize: 12, opacity: 0.75, marginTop: 2 }}>{desc}</div> : null}
    </Link>
  );
}
