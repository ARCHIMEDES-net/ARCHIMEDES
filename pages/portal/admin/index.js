import Link from "next/link";
import RequirePlatformAdmin from "../../../components/RequirePlatformAdmin";
import PortalHeader from "../../../components/PortalHeader";

export default function AdminHome() {
  return (
    <RequirePlatformAdmin>
      <PortalHeader />

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "18px 16px" }}>
        <h1 style={{ margin: "10px 0 6px" }}>Admin</h1>
        <p style={{ margin: 0, color: "#374151" }}>Správa obsahu živé platformy.</p>

        <section style={{ marginTop: 16, display: "grid", gap: 12 }}>
          <Card title="Události" desc="Správa vysílání a kalendáře (vkládání, úpravy, publikace).">
            <Link href="/portal/admin-udalosti">Otevřít admin událostí</Link>
          </Card>

          <Card title="Pracovní listy" desc="MVP: zatím odkazová sekce (bude rozšířeno).">
            <Link href="/portal/pracovni-listy">Otevřít pracovní listy</Link>
          </Card>

          <Card title="Inzerce" desc="MVP: jednoduchá stránka pro komunitní informace.">
            <Link href="/portal/admin-inzerce">Otevřít admin inzerce</Link>
          </Card>

          <Card title="Poptávky" desc="Přehled leadů a práce s demo schválením.">
            <Link href="/portal/admin-poptavky">Otevřít admin poptávek</Link>
          </Card>

          <Card title="Žádosti o přístup" desc="Vytvoření organizace a pozvání administrátora.">
            <Link href="/portal/admin/zadosti">Otevřít žádosti</Link>
          </Card>
        </section>
      </main>
    </RequirePlatformAdmin>
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
