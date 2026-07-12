import Link from "next/link";
import { ArrowRight } from "lucide-react";
import SectionEyebrow from "../home/SectionEyebrow";
import PartnerCard from "./PartnerCard";
import { partnersSection, partnersCta, partners } from "../../content/partners";

/**
 * Compact, space-limited representative selection of partners — used on
 * the homepage, /obec, /reference and /pro-organizace. `showOnHomepage`
 * on each partner record is a placement flag only, not a ranking: this
 * is never presented as the complete partner list (that lives at
 * /pro-organizace#partnerske-organizace, linked via `showAllLink`).
 */
export default function PartnersSection({ showAllLink = true, showCta = true }) {
  const selectedPartners = partners.filter((p) => p.showOnHomepage);

  if (!selectedPartners.length) return null;

  return (
    <section className="border-y border-slate-100 bg-slate-50 py-14">
      <div className="mx-auto max-w-[1180px] px-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <SectionEyebrow>{partnersSection.eyebrow}</SectionEyebrow>
            <h2 className="max-w-2xl text-3xl font-[950] tracking-[-0.045em] text-navy-900">
              {partnersSection.title}
            </h2>
            <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted">
              {partnersSection.subtitle}
            </p>
          </div>

          {showAllLink ? (
            <Link
              href={partnersSection.showAllHref}
              className="inline-flex items-center gap-1.5 text-sm font-bold text-brand hover:text-navy-900"
            >
              {partnersSection.showAllLabel} <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          ) : null}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {selectedPartners.map((p) => (
            <PartnerCard key={p.slug} partner={p} />
          ))}
        </div>

        {showCta && partnersCta.visible ? (
          <div className="mt-10 flex flex-col items-start gap-5 rounded-card-lg bg-navy-900 p-7 text-white sm:flex-row sm:items-center sm:justify-between">
            <div>
              <strong className="block text-lg font-bold">{partnersCta.title}</strong>
              <span className="mt-1.5 block max-w-xl text-sm text-white/75">
                {partnersCta.subtitle}
              </span>
            </div>
            <Link
              href={partnersCta.cta.href}
              className="inline-flex h-12 flex-none items-center justify-center whitespace-nowrap rounded-full bg-white px-5 text-[15px] font-black text-navy-900"
            >
              {partnersCta.cta.label}
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}
