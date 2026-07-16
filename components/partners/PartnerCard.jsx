import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { Card } from "../ui/card";
import { AREA_ICONS } from "./icons";

function isSvg(src) {
  return typeof src === "string" && src.toLowerCase().endsWith(".svg");
}

export default function PartnerCard({ partner }) {
  const Icon = !partner.logo ? AREA_ICONS[partner.icon] || AREA_ICONS.Users : null;

  return (
    <Card className="flex h-full flex-col p-6">
      <div className="flex h-14 items-center">
        {partner.logo ? (
          isSvg(partner.logo) ? (
            <img
              src={partner.logo}
              alt={partner.name}
              className="h-full w-auto max-w-[160px] object-contain object-left"
            />
          ) : (
            <Image
              src={partner.logo}
              alt={partner.name}
              width={160}
              height={56}
              className="h-full w-auto max-w-[160px] object-contain object-left"
            />
          )
        ) : (
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-eyebrow text-navy-600">
            <Icon className="h-6 w-6" aria-hidden="true" />
          </span>
        )}
      </div>

      <h3 className="mt-4 text-lg font-bold leading-tight tracking-tight text-navy-900">
        {partner.name}
      </h3>
      {partner.fullName ? (
        <p className="mt-0.5 text-xs font-semibold text-slate-400">{partner.fullName}</p>
      ) : null}
      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{partner.description}</p>

      {partner.website ? (
        <a
          href={partner.website}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex w-fit items-center gap-1.5 text-sm font-bold text-brand hover:text-navy-900"
        >
          Web organizace <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      ) : null}
    </Card>
  );
}
