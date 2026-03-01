import Link from "next/link";
import RequireAuth from "../../components/RequireAuth";

export default function PortalHome() {
  return (
    <RequireAuth>
      <div style={{ maxWidth: 900, margin: "40px auto", fontFamily: "system-ui", padding: 16 }}>
        <h1>Portál – registrovaná část</h1>

    <ul>
  <li><a href="/portal/kalendar">Kalendář</a></li>
  <li><a href="/portal/program">Program</a></li>
  <li><a href="/portal/archiv">Archiv</a></li>
  <li><a href="/portal/pracovni-listy">Pracovní listy</a></li>
  <li><a href="/portal/inzerce">Inzerce</a></li>
  <li><a href="/portal/clenove">Databáze členů</a></li>
  <li><a href="/portal/admin/udalosti">Admin – události</a></li>
  <li><a href="/logout">Odhlásit se</a></li>
</ul>
        <p style={{ marginTop: 18 }}>
          <Link href="/">Zpět na veřejnou část</Link>
        </p>
      </div>
    </RequireAuth>
  );
}
