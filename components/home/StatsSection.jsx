import { stats } from "../../content/homepage";

/** Verified experience and one explicit product fact — no target-market figures. */
export default function StatsSection() {
  const visibleStats = stats.filter((s) => s.visible);

  if (!visibleStats.length) return null;

  return (
    <section className="relative z-20 -mt-20 pb-8">
      <div className="mx-auto max-w-[1180px] px-5">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[22px] border border-slate-200/80 bg-slate-200/80 shadow-[0_24px_60px_rgba(15,23,42,0.16)] lg:grid-cols-4">
          {visibleStats.map((s) => (
            <div key={s.id} className="bg-white px-5 py-6 text-left sm:px-7">
              <div className="text-2xl font-[950] tracking-tight text-navy-900 sm:text-3xl">{s.value}</div>
              <div className="mt-1 text-xs font-bold leading-snug text-slate-600 sm:text-sm">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
