import Link from "next/link";
import RequirePlatformAdmin from "../../../../components/RequirePlatformAdmin";
import PortalHeader from "../../../../components/PortalHeader";
import MunicipalityCardForm from "../../../../components/MunicipalityCardForm";

export default function NewClassroomMunicipality() {
  return <RequirePlatformAdmin><div className="min-h-screen bg-slate-50">
    <PortalHeader title="Admin • nová obec s učebnou" />
    <main className="mx-auto max-w-[900px] px-4 py-8 sm:px-6">
      <Link href="/portal/admin/obce" className="underline">← Zpět na obce</Link>
      <h1 className="mt-3 text-3xl font-black text-navy-900">Založit obec s učebnou ARCHIMEDES</h1>
      <MunicipalityCardForm />
    </main>
  </div></RequirePlatformAdmin>;
}
