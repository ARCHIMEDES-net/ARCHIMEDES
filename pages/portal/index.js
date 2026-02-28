import Link from "next/link";
import RequireAuth from "../../components/RequireAuth";

export default function PortalHome() {
  return (
    <RequireAuth>
      <div style={{ maxWidth: 900, margin: "40px auto", fontFamily: "system-ui", padding: 16 }}>
        <h1>Portál – registrovaná část</h1>

        <ul>
          <li><Link href="/portal/kalendar">Kalendář</Link></li>
          <li><Link href="/portal/program">Program</Link></li>
          <li><Link href="/portal/archiv">Archiv</Link></li>
          <li><Link href="/portal/pracovni-listy">Pracovní listy</Link></li>
          <li><Link href="/portal/inzerce">Inzerce</Link></li>
          <li><Link href="/portal/clenove">Databáze členů</Link></li>
        </ul>

        <p style={{ marginTop: 18 }}>
          <Link href="/">Zpět na veřejnou část</Link>
        </p>
      </div>
    </RequireAuth>
  );
}
