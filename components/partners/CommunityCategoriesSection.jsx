import Link from "next/link";
import {
  Flame,
  Dumbbell,
  TreePine,
  Hexagon,
  Sprout,
  Fish,
  PawPrint,
  Music,
  Palette,
  Users,
  Baby,
  GraduationCap,
  HeartPulse,
  Church,
  TreeDeciduous,
  Building,
} from "lucide-react";
import SectionEyebrow from "../home/SectionEyebrow";
import { Card } from "../ui/card";
import {
  communityCategoriesSection,
  communityCategoriesCta,
  communityCategories,
} from "../../content/communityCategories";

const ICONS = {
  flame: Flame,
  dumbbell: Dumbbell,
  "tree-pine": TreePine,
  hexagon: Hexagon,
  sprout: Sprout,
  fish: Fish,
  "paw-print": PawPrint,
  music: Music,
  palette: Palette,
  users: Users,
  baby: Baby,
  "graduation-cap": GraduationCap,
  "heart-pulse": HeartPulse,
  church: Church,
  "tree-deciduous": TreeDeciduous,
  building: Building,
};

export default function CommunityCategoriesSection() {
  const visible = communityCategories.filter((c) => c.visible).sort((a, b) => a.order - b.order);

  if (!visible.length) return null;

  return (
    <section className="py-14">
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

        <div className="mt-8 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          {visible.map((c) => {
            const Icon = ICONS[c.icon] || Users;
            return (
              <Card key={c.code} className="flex items-center gap-3 p-4">
                <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-eyebrow text-navy-600">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="text-sm font-bold leading-tight text-navy-900">{c.label}</span>
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
