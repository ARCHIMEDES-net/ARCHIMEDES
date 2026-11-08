import Link from "next/link";
import { trackConversion } from "../lib/conversionAnalytics";

export default function ArchimedesDayNotice() {
  return (
    <aside aria-label="ARCHIMEDES DAY pro obce" className="border-b border-amber-200 bg-amber-50 text-navy-900">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-relaxed"><strong>ARCHIMEDES DAY i ve vaší obci</strong><br />Vědecká show Science ON a společné pokusy pro děti, rodiče i prarodiče.</p>
        <Link href="/archimedes-day/pro-obce" onClick={() => trackConversion("day_notice_click")} className="inline-flex min-h-11 items-center justify-center rounded-full border border-amber-300 bg-white px-5 py-2 text-center text-sm font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand">Prohlédnout program pro obce →</Link>
      </div>
    </aside>
  );
}
