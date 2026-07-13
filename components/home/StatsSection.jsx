import { statsSection, stats } from "../../content/homepage";

/**
 * Network-size proof section — every number here is the SIZE OF THE
 * TARGET NETWORK the platform is built for, not a claim of current
 * customers. Keep copy in content/homepage.js phrased accordingly
 * ("obcí, pro které platforma vzniká", not "zapojených obcí").
 */
export default function StatsSection() {
  const visibleStats = stats.filter((s) => s.visible);

  if (!visibleStats.length) return null;

  return (
    <section className="border-y border-slate-100 bg-slate-50 py-14">
      <div className="mx-auto max-w-[1180px] px-5">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-[950] tracking-[-0.045em] text-navy-900">
            {statsSection.title}
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-muted">{statsSection.subtitle}</p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {visibleStats.map((s) => (
            <div key={s.id} className="text-center sm:text-left">
              <div className="text-3xl font-[950] tracking-tight text-navy-900">{s.value}</div>
              <div className="mt-1 text-sm font-bold text-navy-900">{s.label}</div>
              <p className="mt-2 text-[13.5px] leading-relaxed text-muted">{s.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
