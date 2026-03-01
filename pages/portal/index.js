import { useEffect, useState } from "react";
import Link from "next/link";
import RequireAuth from "../../components/RequireAuth";
import { supabase } from "../../lib/supabaseClient"; // pokud máš jinou cestu, uprav

export default function PortalHome() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function checkAdmin() {
      const { data, error } = await supabase.rpc("is_platform_admin");
      if (!error && data === true) {
        setIsAdmin(true);
      }
    }
    checkAdmin();
  }, []);

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

          {isAdmin && (
            <li><a href="/portal/admin/udalosti">Admin – události</a></li>
          )}

          <li><a href="/logout">Odhlásit se</a></li>
        </ul>

        <p style={{ marginTop: 18 }}>
          <Link href="/">Zpět na veřejnou část</Link>
        </p>
      </div>
    </RequireAuth>
  );
}
