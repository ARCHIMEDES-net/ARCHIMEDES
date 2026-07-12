import Link from "next/link";
import { ArrowRight } from "lucide-react";
import PhotoWithFallback from "../PhotoWithFallback";
import { Card } from "../ui/card";

export default function ReferenceCard({ reference, readStoryLabel }) {
  const r = reference;

  return (
    <Card className="overflow-hidden p-0">
      <div className="relative aspect-[4/3] bg-navy-50">
        <PhotoWithFallback
          src={r.photo}
          alt={r.photoAlt || `Obec ${r.name}`}
          fallbackLabel={r.name}
          style={{ width: "100%", height: "100%" }}
          imgStyle={
            r.photoFit === "contain"
              ? { objectFit: "contain", padding: 24 }
              : { objectFit: "cover" }
          }
        />

        {r.crest ? (
          <div className="absolute -bottom-5 left-3 rounded-full border-4 border-white shadow-md">
            <PhotoWithFallback
              src={r.crest}
              alt={r.crestAlt || `Znak obce ${r.name}`}
              fallbackLabel={r.name}
              style={{ width: 40, height: 40 }}
              rounded
            />
          </div>
        ) : null}

        <div className="absolute right-2.5 top-2.5 max-w-[130px] rounded-lg bg-navy-900/85 px-2.5 py-1.5 text-center text-[10.5px] font-bold leading-tight text-white">
          {r.badge}
        </div>
      </div>

      <div className="p-4 pt-7">
        <strong className="block text-base font-bold text-navy-900">{r.name}</strong>
        <span className="mt-0.5 block text-xs font-semibold text-slate-400">{r.region}</span>
        <p className="mt-2.5 text-[13.5px] leading-relaxed text-slate-600">&bdquo;{r.quote}&ldquo;</p>
        <Link
          href={r.storyHref}
          className="mt-2.5 inline-flex items-center gap-1.5 text-sm font-bold text-navy-700 hover:text-navy-900"
        >
          {readStoryLabel} <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>
    </Card>
  );
}
