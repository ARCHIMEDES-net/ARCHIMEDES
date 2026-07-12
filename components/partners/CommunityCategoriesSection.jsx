import Link from "next/link";
import Image from "next/image";
import SectionEyebrow from "../home/SectionEyebrow";
import { Card } from "../ui/card";
import { AREA_ICONS } from "./icons";
import {
  communityCategoriesSection,
  communityCategoriesCta,
  communityCategories,
} from "../../content/communityCategories";
import { partners } from "../../content/partners";

function isSvg(src) {
  return typeof src === "string" && src.toLowerCase().endsWith(".svg");
}

function AreaGlyph({ partner, iconKey }) {
  if (partner?.logo) {
    return isSvg(partner.logo) ? (
      <img src={partner.logo} alt="" className="h-7 w-7 object-contain" />
    ) : (
      <Image src={partner.logo} alt="" width={28} height={28} className="h-7 w-7 object-contain" />
    );
  }

  const Icon = AREA_ICONS[partner?.icon || iconKey] || AREA_ICONS.Users;
  return <Icon className="h-5 w-5" aria-hidden="true" />;
}

/**
 * The full, unranked overview of all 16 community areas — the "úplný
 * přehled" every "Zobrazit všechny partnerské organizace a oblasti"
 * link points to. Deliberately denser than the homepage's PartnersSection:
 * small glyph, one line of description max, no long copy, no carousel.
 * Areas are ordered by their fixed catalog `order`, never by partner
 * importance — most areas have no partner at all.
 */
export default function CommunityCategoriesSection() {
  const sorted = [...communityCategories].sort((a, b) => a.order - b.order);

  return (
    <section id="partnerske-organizace" className="scroll-mt-24 py-14">
      <div className="mx-auto max-w-[1180px] px-5">
        <div className="max-w-2xl">
          <SectionEyebrow>{communityCategoriesSection.eyebrow}</SectionEyebrow>
          <h2 className="text-3xl font-[950] tracking-[-0.045em] text-navy-900">
            {communityCategoriesSection.title}
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-muted">
            {communityCategoriesSection.subtitle}
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sorted.map((c) => {
            const partner = c.partnerSlug ? partners.find((p) => p.slug === c.partnerSlug) : null;

            return (
              <Card key={c.code} className="flex min-h-[96px] items-start gap-3 p-4">
                <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-eyebrow text-navy-600">
                  <AreaGlyph partner={partner} iconKey={c.icon} />
                </span>
                <div className="min-w-0">
                  <div className="text-sm font-bold leading-tight text-navy-900">{c.title}</div>
                  {partner ? (
                    <div className="mt-0.5 truncate text-xs font-semibold text-slate-500">
                      {partner.name}
                    </div>
                  ) : null}
                  <p className="mt-1 line-clamp-1 text-xs leading-snug text-muted">
                    {c.description}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>

        {communityCategoriesCta.visible ? (
          <div className="mt-10 flex flex-col items-start gap-5 rounded-card-lg bg-navy-900 p-7 text-white sm:flex-row sm:items-center sm:justify-between">
            <div>
              <strong className="block text-lg font-bold">{communityCategoriesCta.title}</strong>
              <span className="mt-1.5 block max-w-xl text-sm text-white/75">
                {communityCategoriesCta.subtitle}
              </span>
            </div>
            <Link
              href={communityCategoriesCta.cta.href}
              className="inline-flex h-12 flex-none items-center justify-center whitespace-nowrap rounded-full bg-white px-5 text-[15px] font-black text-navy-900"
            >
              {communityCategoriesCta.cta.label}
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}
