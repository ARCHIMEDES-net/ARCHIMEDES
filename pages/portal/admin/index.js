import Link from "next/link";
import RequirePlatformAdmin from "../../../components/RequirePlatformAdmin";
import PortalHeader from "../../../components/PortalHeader";
import { Card, CardContent } from "../../../components/ui/card";

function AdminCard({ title, desc, children }) {
  return (
    <Card>
      <CardContent>
        <div className="text-base font-black text-navy-900">{title}</div>
        <div className="mt-1.5 text-sm text-muted">{desc}</div>
        <div className="mt-3">{children}</div>
      </CardContent>
    </Card>
  );
}

export default function AdminHome() {
  return (
    <RequirePlatformAdmin>
      <PortalHeader />

      <main className="mx-auto max-w-[1100px] px-4 py-5">
        <h1 className="text-2xl font-black text-navy-900">Admin</h1>
        <p className="mt-1.5 text-muted">
          Správa obsahu a zákazníků platformy ARCHIMEDES Live.
        </p>

        <section className="mt-4 grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-3">
          <AdminCard title="START objednávky" desc="Přehled nových škol, onboarding a uživatelů.">
            <Link href="/portal/admin-start" className="font-bold text-brand hover:underline">
              Otevřít START přehled
            </Link>
          </AdminCard>

          <AdminCard title="Události" desc="Správa vysílání a kalendáře (vkládání, úpravy, publikace).">
            <Link href="/portal/admin/udalosti" className="font-bold text-brand hover:underline">
              Otevřít admin událostí
            </Link>
          </AdminCard>

          <AdminCard title="Pracovní listy" desc="MVP: zatím odkazová sekce (bude rozšířeno).">
            <Link href="/portal/pracovni-listy" className="font-bold text-brand hover:underline">
              Otevřít pracovní listy
            </Link>
          </AdminCard>

          <AdminCard title="Inzerce" desc="MVP: jednoduchá stránka pro komunitní informace.">
            <Link href="/portal/admin-inzerce" className="font-bold text-brand hover:underline">
              Otevřít admin inzerce
            </Link>
          </AdminCard>

          <AdminCard title="Poptávky" desc="Přehled žádostí a jejich zpracování.">
            <Link href="/portal/admin-poptavky" className="font-bold text-brand hover:underline">
              Otevřít admin poptávek
            </Link>
          </AdminCard>

          <AdminCard title="Žádosti o přístup" desc="Vytvoření organizace a pozvání administrátora.">
            <Link href="/portal/admin/zadosti" className="font-bold text-brand hover:underline">
              Otevřít žádosti
            </Link>
          </AdminCard>

          <AdminCard title="Obce" desc="Aktivace obcí založených přes /zadost.">
            <Link href="/portal/admin/obce" className="font-bold text-brand hover:underline">
              Otevřít obce
            </Link>
          </AdminCard>
        </section>
      </main>
    </RequirePlatformAdmin>
  );
}
