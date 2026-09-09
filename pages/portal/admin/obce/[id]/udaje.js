import Link from "next/link";
import { useRouter } from "next/router";
import RequirePlatformAdmin from "../../../../../components/RequirePlatformAdmin";
import PortalHeader from "../../../../../components/PortalHeader";
import MunicipalityCardForm from "../../../../../components/MunicipalityCardForm";

export default function MunicipalityDetails() {
  const router = useRouter();
  const id = typeof router.query.id === "string" ? router.query.id : null;
  return <RequirePlatformAdmin><div className="min-h-screen bg-slate-50">
    <PortalHeader title="Admin • údaje obce" />
    <main className="mx-auto max-w-[900px] px-4 py-8 sm:px-6">
      <Link href={id ? `/portal/admin/obce/${id}` : "/portal/admin/obce"} className="underline">← Zpět na kartu obce</Link>
      <h1 className="mt-3 text-3xl font-black text-navy-900">Doplnit údaje obce</h1>
      <p className="mt-2 text-slate-600">Doplnění údajů zachová registrační číslo a existující licenci. U dosud neaktivované obce lze zvlášť potvrdit první bezplatnou licenci.</p>
      {router.isReady && id ? <MunicipalityCardForm organizationId={id} /> : null}
    </main>
  </div></RequirePlatformAdmin>;
}
