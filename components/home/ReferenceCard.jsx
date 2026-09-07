import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import PhotoWithFallback from "../PhotoWithFallback";
import { Card } from "../ui/card";

export default function ReferenceCard({ reference }) {
  const r = reference;

  return (
    <Link
      href={r.storyHref || "/ucebna#oceneni"}
      className="block h-full rounded-card-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-4"
      aria-label={`${r.name}: ${r.badge}`}
    >
      <Card className="group flex h-full flex-col overflow-hidden border-slate-200 p-0 transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_42px_rgba(15,23,42,0.14)]">
        <div className="flex h-[190px] items-center justify-center border-b border-slate-200 bg-[#f3f7fb] p-5 sm:h-[205px]">
          <PhotoWithFallback
            src={r.photo}
            alt={r.photoAlt || `Obec ${r.name}`}
            fallbackLabel={r.name}
            style={{ width: "100%", height: "100%" }}
            imgStyle={{
              objectFit: "contain",
              width: "100%",
              height: "100%",
              transition: "transform .35s ease",
            }}
          />
        </div>

        <div className="flex flex-1 flex-col bg-[#153a63] p-5 text-white">
          <span className="text-[11px] font-black uppercase leading-snug tracking-[0.12em] text-[#efbd58]">
            {r.name} · {r.region}
          </span>
          <span className="mt-2 text-xs font-bold uppercase tracking-[0.08em] text-white/65">
            {r.awardMeta || r.badge}
          </span>
          <h3 className="mt-3 text-xl font-[950] leading-[1.16] tracking-[-0.025em] text-white">
            {r.awardTitle || r.badge}
          </h3>
          {r.description ? (
            <p className="mt-3 text-sm leading-relaxed text-white/75">{r.description}</p>
          ) : null}
          <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-black text-[#efbd58]">
            Více o ocenění
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
          </span>
        </div>
      </Card>
    </Link>
  );
}
