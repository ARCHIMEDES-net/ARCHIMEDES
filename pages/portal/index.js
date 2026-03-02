import Link from "next/link";
import RequireAuth from "../../components/RequireAuth";
import PortalHeader from "../../components/PortalHeader";

export default function PortalHome() {
  return (
    <RequireAuth>
      <PortalHeader />

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "18px 16px" }}>
        <h1 style={{ margin: "10px 0 6px" }}>ARCHIMEDES Live – Portál</h1>
        <p style={{ margin: 0, color: "#374151" }}>
          Vítej v registrované části. Primární je program vysílání (kalendář) a následně archiv a pracovní listy.
        </p>

        <section style={{ marginTop: 18, display: "grid", gap: 12 }}>
          <Card title="Program (Kalendář)" desc="Přehled nadcházejících vysílání a detail událostí.">
            <Link href="/portal/kalendar">Otevřít program</Link>
          </Card>

          <Card title="Archiv" desc="Záznamy vysílání (MVP zatím může být prázdný).">
            <Link href="/portal/archiv">Otevřít archiv</Link>
          </Card>

          <Card title="Pracovní listy" desc="Odkazy / materiály k událostem a výuce.">
            <Link href="/portal/pracovni-listy">Otevřít pracovní listy</Link>
          </Card>

          <Card title="Inzerce" desc="Pozvánky, nabídky kroužků, komunitní oznámení.">
            <Link href="/portal/inzerce">Otevřít inzerci</Link>
          </Card>

          <Card title="Admin" desc="Správa událostí, obsahu a dalších sekcí.">
            <Link href="/portal/admin">Otevřít admin</Link>
          </Card>
        </section>
      </main>
    </RequireAuth>
  );
}

function Card({ title, desc, children }) {
  return (
    <div style={{ border: "1px solid #e5e7eb", borderRadius: 14, padding: 14 }}>
      <div style={{ fontWeight: 800 }}>{title}</div>
      <div style={{ color: "#374151", marginTop: 6 }}>{desc}</div>
      <div style={{ marginTop: 10 }}>{children}</div>
    </div>
  );
}
