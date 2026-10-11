import Link from "next/link";
import { useEffect, useState } from "react";
import { trackConversion } from "../lib/conversionAnalytics";

export default function ArchimedesDayNotice() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const update = () => setVisible(Date.now() < Date.parse("2026-11-05T16:00:00Z"));
    update();
    const timer = setInterval(update, 60000);
    return () => clearInterval(timer);
  }, []);
  if (!visible) return null;
  return (
    <aside aria-label="Pozvánka na bezplatné vysílání" className="border-b border-amber-200 bg-amber-50 text-navy-900">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-relaxed"><strong>ARCHIMEDES DAY živě z Ratíškovic</strong><br />5. listopadu od 16:00 · Sledujte zdarma online.</p>
        <Link href="/archimedes-day/den-generaci" onClick={() => trackConversion("day_notice_click")} className="inline-flex min-h-11 items-center justify-center rounded-full border border-amber-300 bg-white px-5 py-2 text-center text-sm font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand">Podrobnosti a sledování zdarma →</Link>
      </div>
    </aside>
  );
}
