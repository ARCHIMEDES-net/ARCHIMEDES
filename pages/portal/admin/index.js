import Link from "next/link";
import RequirePlatformAdmin from "../../../components/RequirePlatformAdmin";
import PortalHeader from "../../../components/PortalHeader";
import { administrationGroups } from "../../../lib/portalNavigation";

export default function AdminHome() {
  return <RequirePlatformAdmin><PortalHeader /><main className="mx-auto max-w-[1100px] px-4 py-6">
    <h1 className="text-3xl font-black text-navy-900">Správa platformy</h1>
    <p className="mt-2 text-slate-600">Vysílání, organizace a provoz ARCHIMEDES Live.</p>
    <div className="mt-5 flex flex-wrap gap-3"><Link href="/portal/admin/organizace" className="inline-flex min-h-11 items-center rounded-xl bg-navy-900 px-4 py-2 font-bold text-white">Vyhledat organizaci</Link><Link href="/portal/admin/udalosti" className="inline-flex min-h-11 items-center rounded-xl border border-slate-300 bg-white px-4 py-2 font-bold">Správa vysílání</Link></div>
    <div className="mt-6 grid gap-5 md:grid-cols-3">{administrationGroups.map(group=><section key={group.title} className="rounded-2xl border border-slate-200 bg-white p-4"><h2 className="mb-3 text-lg font-bold text-navy-900">{group.title}</h2><div className="grid gap-1">{group.links.map(([label,href])=><Link key={href} href={href} className="flex min-h-11 items-center rounded-xl px-3 py-2 text-base font-semibold text-slate-700 hover:bg-slate-100">{label} →</Link>)}</div></section>)}</div>
  </main></RequirePlatformAdmin>;
}
