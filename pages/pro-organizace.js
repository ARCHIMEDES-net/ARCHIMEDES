import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, GraduationCap, MapPin, Radio, Users } from "lucide-react";
import Footer from "../components/Footer";
import { Button } from "../components/ui/button";
import SectionEyebrow from "../components/home/SectionEyebrow";
import PartnersSection from "../components/partners/PartnersSection";
import CommunityCategoriesSection from "../components/partners/CommunityCategoriesSection";

const benefits = [
  {
    icon: Users,
    title: "Silnější členská základna",
    text: "Odborný obsah národního svazu se dostane k základním organizacím a členům přímo v jejich obcích.",
  },
  {
    icon: GraduationCap,
    title: "Budoucnost vašeho oboru",
    text: "Popularizační a náborové pořady představí činnost svazu školám a pomohou oslovit mladou generaci.",
  },
  {
    icon: Radio,
    title: "Minimální organizační zátěž",
    text: "Témata připravíme společně; dramaturgii, moderaci, vysílání a podklady pro distribuci zajistí ARCHIMEDES.",
  },
];

const cooperation = [
  ["Priority", "Vedení svazu určí důležitá témata, cílové skupiny a doporučí odborníky."],
  ["Produkce", "ARCHIMEDES připraví dramaturgii, moderaci, termín, vysílání a komunikační podklady."],
  ["Distribuce", "Svaz předá pozvánku své síti; ARCHIMEDES ji propojí s obcemi a zapojenými školami."],
  ["Dopad", "Místní organizace získají odborný program a vybraná témata představí obor mladé generaci."],
];

export default function ProOrganizacePage() {
  return (
    <>
      <Head>
        <title>Pro svazy a národní organizace | ARCHIMEDES Live</title>
        <meta
          name="description"
          content="Partnerství pro svazy a národní organizace, které chtějí vysílat k místním členům a přiblížit svou činnost školám."
        />
      </Head>

      <main className="bg-white text-slate-900">
        <section className="overflow-hidden bg-navy-900 text-white">
          <div className="mx-auto grid min-h-[600px] max-w-[1280px] lg:grid-cols-[0.94fr_1.06fr]">
            <div className="flex items-center px-5 py-16 sm:px-10 lg:px-12 lg:py-20">
              <div className="max-w-[610px]">
                <span className="text-xs font-black uppercase tracking-[0.18em] text-[#efbd58]">Pro svazy a národní organizace</span>
                <h1 className="mt-5 text-[clamp(44px,6vw,70px)] font-[950] leading-[0.96] tracking-[-0.055em]">
                  Spojte celý svaz. Oslovte novou generaci.
                </h1>
                <p className="mt-6 max-w-[570px] text-lg leading-relaxed text-white/78 sm:text-xl">
                  Pomáháme celorepublikovým svazům dostat odborný obsah k místním
                  organizacím a současně představovat jejich obor školám a mladé
                  generaci. ARCHIMEDES zajistí produkci a propojí program s obcemi.
                </p>
                <Button href="/kontakt" className="mt-8 bg-[#efbd58] text-slate-950 hover:bg-[#f5ca73]">
                  Probrat partnerství
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            </div>

            <div className="relative min-h-[400px] lg:min-h-full">
              <Image
                src="/program-vysilani.webp"
                alt="Živé odborné vysílání ARCHIMEDES v učebně"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 53vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-navy-900/70 via-navy-900/10 to-transparent" />
            </div>
          </div>
        </section>

        <section className="border-b border-slate-200">
          <div className="mx-auto grid max-w-[1180px] divide-y divide-slate-200 px-5 md:grid-cols-3 md:divide-x md:divide-y-0">
            {benefits.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.title} className="py-8 md:px-7 first:md:pl-0 last:md:pr-0">
                  <Icon className="h-6 w-6 text-brand" aria-hidden="true" />
                  <h2 className="mt-4 text-lg font-black text-navy-900">{item.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.text}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="py-16 sm:py-20">
          <div className="mx-auto grid max-w-[1180px] gap-10 px-5 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <SectionEyebrow>Jak spolupráce funguje</SectionEyebrow>
              <h2 className="max-w-md text-[clamp(34px,4vw,50px)] font-[950] leading-[1.03] tracking-[-0.045em] text-navy-900">
                Od priorit vedení svazu k dopadu v celé republice
              </h2>
              <p className="mt-5 max-w-md text-base leading-relaxed text-slate-600">
                Nejde o reklamní prostor, ale o dlouhodobé obsahové partnerství.
                Svaz dodá odbornost a svou síť, ARCHIMEDES převezme produkci a
                pomůže dostat program k členům, obcím i školám.
              </p>
              <div className="mt-6 inline-flex rounded-full bg-[#e9f6ef] px-4 py-2 text-sm font-black text-[#167344]">
                Spolupráce je pro svazy bezplatná
              </div>
            </div>

            <div className="border-t border-slate-200">
              {cooperation.map(([title, text], index) => (
                <article key={title} className="grid gap-3 border-b border-slate-200 py-6 sm:grid-cols-[56px_120px_1fr] sm:items-start">
                  <span className="text-sm font-black text-brand">0{index + 1}</span>
                  <h3 className="font-black text-navy-900">{title}</h3>
                  <p className="text-[15px] leading-relaxed text-slate-600">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#f3f7fb] py-12 sm:py-14">
          <div className="mx-auto grid max-w-[1180px] gap-8 px-5 lg:grid-cols-[0.72fr_1.28fr] lg:items-center">
            <div className="max-w-md">
              <SectionEyebrow>Pro školy i členskou základnu</SectionEyebrow>
              <h2 className="max-w-xl text-[clamp(34px,4vw,48px)] font-[950] leading-[1.03] tracking-[-0.045em] text-navy-900">
                Jedno partnerství, dva přirozené formáty
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-slate-600">
                Odborný obsah svazu pomáhá místním členům a zároveň přibližuje
                jejich činnost mladé generaci.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[22px] border border-slate-900/[0.06] border-t-[3px] border-t-brand bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.045)]">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eaf1f8] text-brand">
                    <MapPin className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="text-xl font-black text-navy-900">Pro místní členy</h3>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-slate-600">Odborná témata, vzdělávání a společné diskuse v obcích.</p>
              </div>
              <div className="rounded-[22px] border border-slate-900/[0.06] border-t-[3px] border-t-brand bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.045)]">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eaf1f8] text-brand">
                    <GraduationCap className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="text-xl font-black text-navy-900">Pro základní školy</h3>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-slate-600">Dvakrát ročně popularizační nebo náborový pořad pro mladou generaci.</p>
                <Link href="/skoly" className="mt-4 inline-flex items-center gap-1.5 text-sm font-black text-brand">
                  Jak funguje program pro školy <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <PartnersSection showCta={false} />
        <CommunityCategoriesSection showCta={false} />

        <section className="pb-16 pt-6">
          <div className="mx-auto flex max-w-[1180px] flex-col items-start justify-between gap-5 px-5 sm:flex-row sm:items-center">
            <div>
              <strong className="text-xl font-black text-navy-900">Jste místní spolek nebo klub?</strong>
              <p className="mt-1 text-sm text-slate-600">Místní organizace se zapojují pod registračním číslem své obce.</p>
            </div>
            <Link href="/obec" className="inline-flex items-center gap-2 text-sm font-black text-brand">
              Jak funguje program pro obce <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
