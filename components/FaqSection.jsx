import { Plus } from "lucide-react";
import SectionEyebrow from "./home/SectionEyebrow";

export function createFaqStructuredData(items) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export default function FaqSection({ title, intro, items }) {
  return (
    <section id="faq" className="scroll-mt-24 border-t border-slate-200 bg-[#f3f7fb] py-16 sm:py-20">
      <div className="mx-auto grid max-w-[1180px] gap-10 px-5 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
        <div className="max-w-md lg:sticky lg:top-28">
          <SectionEyebrow>Časté otázky</SectionEyebrow>
          <h2 className="text-[clamp(34px,4vw,50px)] font-[950] leading-[1.03] tracking-[-0.045em] text-navy-900">
            {title}
          </h2>
          <p className="mt-5 text-base leading-relaxed text-slate-600">{intro}</p>
        </div>

        <div className="overflow-hidden rounded-[26px] border border-slate-200 bg-white px-5 shadow-[0_18px_50px_rgba(15,35,65,0.06)] sm:px-7">
          {items.map((item) => (
            <details key={item.question} className="group border-b border-slate-200 last:border-b-0">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-5 py-6 text-left text-lg font-black leading-snug text-navy-900 marker:content-none">
                <span>{item.question}</span>
                <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-blue-50 text-brand">
                  <Plus
                    className="h-4 w-4 transition-transform duration-200 group-open:rotate-45"
                    aria-hidden="true"
                  />
                </span>
              </summary>
              <p className="max-w-3xl pb-6 pr-10 text-[15px] leading-[1.75] text-slate-600">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
