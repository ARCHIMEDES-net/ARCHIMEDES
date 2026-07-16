import { ShieldCheck } from "lucide-react";
import { patronageSection } from "../../content/homepage";

export default function PatronageStrip() {
  const visibleItems = patronageSection.items.filter((item) => item.visible);

  if (!visibleItems.length) return null;

  return (
    <section aria-labelledby="patronage-title" className="pb-10 pt-1">
      <div className="mx-auto max-w-[1180px] px-5">
        <div className="grid overflow-hidden rounded-[22px] border border-slate-200 bg-[#f7f9fc] lg:grid-cols-[270px_1fr]">
          <div className="flex items-center gap-4 border-b border-slate-200 px-5 py-6 sm:px-7 lg:border-b-0 lg:border-r">
            <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-white text-brand shadow-[0_5px_16px_rgba(20,50,80,0.08)]">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <span className="text-[11px] font-black uppercase tracking-[0.14em] text-brand">
                {patronageSection.eyebrow}
              </span>
              <h2 id="patronage-title" className="mt-1 text-lg font-[900] leading-tight tracking-[-0.025em] text-navy-900">
                {patronageSection.title}
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4">
            {visibleItems.map((item) => (
              <article
                key={item.id}
                className="flex min-h-[118px] flex-col justify-center border-b border-r border-slate-200 px-4 py-5 even:border-r-0 [&:nth-last-child(-n+2)]:border-b-0 sm:px-5 lg:border-b-0 lg:even:border-r lg:last:border-r-0"
              >
                <span className="text-[13px] font-[950] uppercase tracking-[0.08em] text-brand">
                  {item.mark}
                </span>
                <strong className="mt-2 text-sm leading-tight text-navy-900">
                  {item.name}
                </strong>
                <span className="mt-1 text-[11px] leading-snug text-slate-500">
                  {item.role}
                </span>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
