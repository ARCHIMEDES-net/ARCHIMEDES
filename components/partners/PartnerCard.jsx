import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { Card } from "../ui/card";

function isSvg(src) {
  return typeof src === "string" && src.toLowerCase().endsWith(".svg");
}

export default function PartnerCard({ partner }) {
  return (
    <Card className="flex h-full flex-col p-6">
      <div className="flex h-14 items-center">
        {isSvg(partner.logo) ? (
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
        )}
      </div>

      <h3 className="mt-4 text-lg font-bold leading-tight tracking-tight text-navy-900">
        {partner.name}
      </h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{partner.description}</p>

      {partner.website ? (
        <a
          href={partner.website}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex w-fit items-center gap-1.5 text-sm font-bold text-brand hover:text-navy-900"
        >
          Web organizace <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      ) : null}
    </Card>
  );
}
