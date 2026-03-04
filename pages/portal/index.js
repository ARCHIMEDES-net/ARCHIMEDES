// pages/portal/index.js
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import RequireAuth from "../../components/RequireAuth";
import PortalHeader from "../../components/PortalHeader";
import { supabase } from "../../lib/supabaseClient";

export default function PortalIndex() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        // Pokud existuje funkce public.is_admin() (SQL jsme ji vytvořili),
        // vrátí boolean. Když nebude existovat, ignorujeme a admin sekce se neskryje.
        const { data, error } = await supabase.rpc("is_admin");
        if (!error) setIsAdmin(!!data);
      } catch (e) {
        // no-op
      } finally {
        setCheckingAdmin(false);
      }
    })();
  }, []);

  async function onLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <RequireAuth>
      <PortalHeader title="Portál" />

      <div style={{ padding: 16, maxWidth: 900, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 12,
            flexWrap: "wrap",
          }}
        >
          <div style={{ fontSize: 14, opacity: 0.75 }}>
            Přístup k obsahu pro registrované.
          </div>

          <div style={{ marginLeft: "auto" }}>
            <button
              onClick={onLogout}
              style={{
                padding: "8px 12px",
                borderRadius: 12,
                border: "1px solid #ddd",
                cursor: "pointer",
              }}
            >
              Odhlásit
            </button>
          </div>
        </div>

        <div style={{ display: "grid", gap: 10 }}>
          <Section title="Program">
            <NavLink
              href="/portal/kalendar"
              title="Kalendář"
              desc="Přehled vysílání jako TV program + detail."
            />
            <NavLink
              href="/portal/archiv"
              title="Archiv"
              desc="Záznamy, materiály a pracovní listy (postupně doplníme)."
            />
          </Section>

          <Section title="Komunita">
            <NavLink
              href="/portal/inzerce"
              title="Inzerce"
              desc="Nabídky, poptávky a partnerství mezi školami a obcemi."
            />
          </Section>

          <Section title="Administrace">
            {checkingAdmin ? (
              <div style={{ padding: 12, opacity: 0.7 }}>Načítám práva…</div>
            ) : isAdmin ? (
              <>
                <NavLink
                  href="/portal/admin-udalosti"
                  title="Admin – Události"
                  desc="Vkládání, úpravy a správa programu."
                />
                <NavLink
                  href="/portal/admin-inzerce"
                  title="Admin – Inzerce"
                  desc="Moderace, TOP, ARCHIMEDES, mazání."
                />
                <NavLink
                  href="/portal/admin-poptavky"
                  title="Admin – Poptávky"
                  desc="Přehled poptávek z veřejného formuláře (export CSV)."
                />
              </>
            ) : (
              <div style={{ padding: 12, opacity: 0.7 }}>
                Administrace je dostupná jen správcům.
              </div>
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
    <div style={{ border: "1px solid #e6e6e6", borderRadius: 14, padding: 12 }}>
      <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 8 }}>{title}</div>
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
      }}
    >
      <div style={{ fontWeight: 800 }}>{title}</div>
      {desc ? (
        <div style={{ fontSize: 12, opacity: 0.75, marginTop: 2 }}>{desc}</div>
      ) : null}
    </Link>
  );
}
