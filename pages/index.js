import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { track } from "@vercel/analytics";
import {
  ArrowRight,
  Users,
  GraduationCap,
  Megaphone,
  Building2,
  School,
} from "lucide-react";
import Footer from "../components/Footer";
import PhotoWithFallback from "../components/PhotoWithFallback";
import {
  createPublicEventStructuredData,
  fetchPublicProgramWindow,
  normalizeAudience,
  resolvePosterUrl,
  safeDate,
} from "../lib/publicEvents";
import { Button } from "../components/ui/button";
import SectionEyebrow from "../components/home/SectionEyebrow";
import StatsSection from "../components/home/StatsSection";
import PatronageStrip from "../components/home/PatronageStrip";
import ReferenceCard from "../components/home/ReferenceCard";
import { AREA_ICONS } from "../components/partners/icons";
import { communityCategories } from "../content/communityCategories";
import {
  hero,
  referencesSection,
  references,
  ctaBand,
} from "../content/homepage";

const AUDIENCES = [
  {
    title: "Pro obce",
    text: "Program pro školu, spolky i seniory pod jednou obecní licencí.",
    href: "/obec",
    icon: Building2,
  },
  {
    title: "Pro svazy",
    text: "Odborný obsah pro místní členy a popularizační pořady pro školy.",
    href: "/pro-organizace",
    icon: Megaphone,
  },
  {
    title: "Pro školy",
    text: "Živé pořady, inspirativní hosté a program propojený s praxí.",
    href: "/skoly",
    icon: GraduationCap,
  },
  {
    title: "Učebna ARCHIMEDES",
    text: "Celoroční prostor pro moderní výuku a komunitní program.",
    href: "/ucebna",
    icon: School,
  },
];

const CZ_MONTHS = [
  "ledna", "února", "března", "dubna", "května", "června",
  "července", "srpna", "září", "října", "listopadu", "prosince",
];

function formatProgrammeDate(value) {
  const date = safeDate(value);
  if (!date) return "Termín upřesníme";
  return `${date.getDate()}. ${CZ_MONTHS[date.getMonth()]} ${date.getFullYear()} · ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function ProgrammeRow({ event, isNearestFuture }) {
  const date = safeDate(event?.starts_at);
  const isPast = date ? date.getTime() < Date.now() : false;
  const posterUrl = resolvePosterUrl(event);
  const audience = normalizeAudience(event?.audience_groups);

  return (
    <article className="group grid grid-cols-[72px_1fr] items-center gap-4 border-b border-slate-200 py-4 last:border-b-0 sm:grid-cols-[104px_145px_minmax(0,1fr)_auto]">
      <div className="h-[58px] overflow-hidden rounded-xl bg-[#eaf1f8] sm:h-[72px]">
        {posterUrl ? (
          <img
            src={posterUrl}
            alt={event?.title || "Vysílání ARCHIMEDES Live"}
            loading="lazy"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[11px] font-black uppercase tracking-[0.12em] text-brand">
            Live
          </div>
        )}
      </div>

      <div className="hidden sm:block">
        <span className="block text-[13px] font-bold leading-snug text-slate-500">
          {formatProgrammeDate(event?.starts_at)}
        </span>
        <span className="mt-1 block text-[11px] font-black uppercase tracking-[0.12em] text-brand">
          {event?.category || "ARCHIMEDES Live"}
        </span>
      </div>

      <div className="min-w-0">
        <div className="sm:hidden">
          <span className="text-[12px] font-bold text-slate-500">{formatProgrammeDate(event?.starts_at)}</span>
        </div>
        <h3 className="mt-1 text-[17px] font-[900] leading-snug tracking-[-0.02em] text-navy-900 sm:mt-0 sm:text-[19px]">
          {event?.title || "Připravované vysílání"}
        </h3>
        {audience.length ? (
          <p className="mt-1 text-[13px] text-muted">{audience.slice(0, 2).join(" · ")}</p>
        ) : null}
      </div>

      <div className="col-start-2 justify-self-start sm:col-start-auto sm:justify-self-end">
        <span className={`inline-flex rounded-full px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.08em] ${
          isNearestFuture
            ? "bg-[#dff7e8] text-[#167344]"
            : isPast
              ? "bg-slate-100 text-slate-500"
              : "bg-[#eaf1ff] text-brand"
        }`}>
          {isNearestFuture ? "Nejbližší vysílání" : isPast ? "Proběhlo" : "Připravujeme"}
        </span>
      </div>
    </article>
  );
}

export default function Home({ initialEvents = [] }) {
  const [events, setEvents] = useState(initialEvents);

  useEffect(() => {
    let cancelled = false;

    fetchPublicProgramWindow(3).then((res) => {
      if (cancelled) return;
      if (!res.error) setEvents(res.events || []);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const visibleReferences = references.filter((r) => r.visible);
  const programmeItems = events.slice(0, 3);
  const eventStructuredData = createPublicEventStructuredData(
    programmeItems,
    "https://www.archimedeslive.com/program"
  );
  const communityAreas = [...communityCategories].sort((a, b) => a.order - b.order);

  return (
    <>
      <Head>
        <title>ARCHIMEDES Live | Živý program pro školy, obce a komunity</title>
        <meta
          name="description"
          content="Pravidelný živý program pro školy, spolky, seniory a další místní komunity. Lidé se při něm setkávají, vzdělávají a sbližují."
        />
        {eventStructuredData ? (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(eventStructuredData) }}
          />
        ) : null}
      </Head>

      <main className="bg-white text-slate-900">
        {/* HERO */}
        <section className="relative min-h-[680px] overflow-hidden bg-[#153a63] text-white lg:min-h-[78vh]">
          <div className="absolute inset-0">
            <Image
              src={hero.photo}
              alt={hero.photoAlt}
              fill
              priority
              quality={88}
              sizes="100vw"
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(12,49,87,0.9)_0%,rgba(12,49,87,0.72)_27%,rgba(12,49,87,0.28)_52%,rgba(12,49,87,0.04)_78%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(9,35,64,0.28)_0%,transparent_34%)]" />
          </div>

          <div className="relative mx-auto flex min-h-[680px] max-w-[1280px] items-center px-5 pb-28 pt-24 lg:min-h-[78vh] lg:pb-32 lg:pt-28">
            <div className="max-w-[620px]">
                <span className="mb-6 inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-white/90 backdrop-blur">
                  {hero.eyebrow}
                </span>

                <h1 className="text-5xl font-[950] leading-[0.94] tracking-[-0.055em] text-white sm:text-6xl lg:text-[72px]">
                  {hero.titleLine1}
                  <br />
                  <span className="text-[#efbd58]">{hero.titleLine2}</span>
                </h1>

                <p className="mt-7 max-w-xl text-xl font-bold tracking-tight text-white">
                  {hero.subtitle}
                </p>
                <p className="mt-3 max-w-xl text-base leading-relaxed text-white/78 sm:text-lg">
                  {hero.lead}
                </p>

                <div className="mt-9 flex flex-wrap gap-3">
                  <Button
                    href={hero.primaryCta.href}
                    className="bg-[#efbd58] text-slate-950 shadow-[0_16px_34px_rgba(239,189,88,0.24)] hover:bg-[#f5ca73]"
                    onClick={() => track("klik_home_cta_primary")}
                  >
                    {hero.primaryCta.label}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Button>
                  <Button
                    href={hero.secondaryCta.href}
                    variant="light"
                    className="border border-white/50 bg-white/5 text-white backdrop-blur hover:bg-white/15"
                    onClick={() => track("klik_home_jak_to_funguje")}
                  >
                    {hero.secondaryCta.label}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </div>
            </div>
          </div>
        </section>

        {/* NETWORK SIZE STATS */}
        <StatsSection />

        {/* PATRONAGE — compact trust signal without another navigation destination */}
        <PatronageStrip />

        {/* COMMUNITY AREAS — make the value for a mayor visible immediately */}
        <section className="overflow-hidden bg-[#f2f7fb] py-12 sm:py-14">
          <div className="mx-auto max-w-[1180px] px-5">
            <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
              <div className="max-w-md">
                <SectionEyebrow>Program pro život v obci</SectionEyebrow>
                <h2 className="text-[clamp(32px,4vw,46px)] font-[950] leading-[1.02] tracking-[-0.045em] text-navy-900">
                  Podpora pro spolky a komunity, které už u vás fungují
                </h2>
                <p className="mt-4 text-[15px] leading-relaxed text-slate-600">
                  Připravujeme živá vysílání pro různé oblasti místního života.
                  Každý spolek si vybírá témata, která odpovídají jeho činnosti,
                  a zve na ně své členy.
                </p>
                <Link href="/obec" className="mt-6 inline-flex items-center gap-1.5 text-sm font-black text-brand">
                  Co obec získá <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-x-3 gap-y-2 sm:grid-cols-3 lg:grid-cols-4">
                {communityAreas.map((area) => {
                  const Icon = AREA_ICONS[area.icon] || Users;
                  return (
                    <div
                      key={area.code}
                      className="flex min-h-[54px] items-center gap-2.5 rounded-[14px] border border-slate-900/[0.06] bg-white px-3 py-2.5"
                    >
                      <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-[#eaf1f8] text-brand">
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <strong className="text-[13px] leading-tight text-navy-900 sm:text-sm">
                        {area.title}
                      </strong>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* PROGRAMME — show the result, not an empty calendar */}
        <section id="program" className="py-12">
          <div className="mx-auto max-w-[1180px] px-5">
            <div className="grid gap-7 lg:grid-cols-[280px_1fr] lg:items-start">
              <div>
                <SectionEyebrow>Program ARCHIMEDES Live</SectionEyebrow>
                <h2 className="text-3xl font-[950] tracking-[-0.045em] text-navy-900">
                  Co vysíláme
                </h2>
                <p className="mt-3 text-[15px] leading-relaxed text-muted">
                  Konkrétní pořady, které mohou školy, spolky, senioři a další lidé v obci sledovat společně.
                </p>
                <Link href="/program#vysilani" className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-brand">
                  Zobrazit celý program <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>

              <div className="overflow-hidden rounded-[22px] border border-slate-200 bg-white px-5 shadow-[0_14px_38px_rgba(15,23,42,0.06)] sm:px-6">
                {programmeItems.length ? (
                  programmeItems.map((event, index) => {
                    const firstFutureIndex = programmeItems.findIndex(
                      (item) => (safeDate(item?.starts_at)?.getTime() || 0) >= Date.now()
                    );
                    return (
                      <ProgrammeRow
                        key={event.id}
                        event={event}
                        isNearestFuture={index === firstFutureIndex}
                      />
                    );
                  })
                ) : (
                  <div className="py-8">
                    <strong className="text-navy-900">Program právě doplňujeme.</strong>
                    <p className="mt-1 text-sm text-muted">Brzy zde uvidíte konkrétní připravovaná vysílání.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="jak-to-funguje" className="border-y border-slate-100 bg-[#f6f9fd] py-10">
          <div className="mx-auto max-w-[1180px] px-5">
            <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
              <div>
                <SectionEyebrow>Jak to funguje</SectionEyebrow>
                <h2 className="text-3xl font-[950] tracking-[-0.045em] text-navy-900">
                  Podporujeme to, co už ve vaší obci funguje.
                </h2>
                <p className="mt-3 max-w-md text-[15px] leading-relaxed text-muted">
                  Jedna obecní licence zpřístupní program škole, spolkům, seniorům i dalším místním komunitám. Obsah a vysílání připravíme my.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  "ARCHIMEDES připraví program a podklady",
                  "Obec předá pozvánky místním organizacím",
                  "Školy a spolky si vyberou a sledují společně",
                ].map((title, index) => (
                  <div key={title} className="rounded-[18px] bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.05)]">
                    <span className="text-sm font-black text-brand">0{index + 1}</span>
                    <strong className="mt-3 block text-base text-navy-900">{title}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* REFERENCES */}
        {visibleReferences.length ? (
          <section id="reference" className="py-10">
            <div className="mx-auto max-w-[1180px] px-5">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <SectionEyebrow>{referencesSection.eyebrow}</SectionEyebrow>
                  <h2 className="max-w-2xl text-3xl font-[950] tracking-[-0.045em] text-navy-900">
                    {referencesSection.title}
                  </h2>
                </div>
              </div>

              <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {visibleReferences.map((r) => (
                  <ReferenceCard
                    key={r.id}
                    reference={r}
                  />
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {/* AUDIENCES */}
        <section className="border-y border-slate-100 bg-[#f6f9fd] py-10">
          <div className="mx-auto max-w-[1180px] px-5">
            <h2 className="text-3xl font-[950] tracking-[-0.045em] text-navy-900">
              Pro koho je ARCHIMEDES Live
            </h2>
            <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {AUDIENCES.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.title} href={item.href} className="group rounded-[18px] bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.05)] transition hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(15,23,42,0.09)]">
                    <Icon className="h-6 w-6 text-brand" aria-hidden="true" />
                    <strong className="mt-4 block text-base text-navy-900">{item.title}</strong>
                    <p className="mt-2 text-sm leading-relaxed text-muted">{item.text}</p>
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-brand">
                      Zjistit více <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA BAND */}
        {ctaBand.visible ? (
          <section className="pb-12 pt-8">
            <div className="mx-auto max-w-[1180px] px-5">
              <div className="flex flex-col items-start gap-6 rounded-card-lg bg-eyebrow p-8 sm:flex-row sm:items-center sm:justify-between sm:p-10">
                <div className="flex items-center gap-4">
                  <span className="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-navy-900 text-white">
                    <Users className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <div>
                    <h2 className="text-xl font-[950] tracking-[-0.045em] text-navy-900">
                      {ctaBand.title}
                    </h2>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted">
                      {ctaBand.subtitle}
                    </p>
                  </div>
                </div>
                <Button
                  href={ctaBand.cta.href}
                  variant="light"
                  className="border border-slate-200"
                  onClick={() => track("klik_home_cta_band")}
                >
                  {ctaBand.cta.label} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            </div>
          </section>
        ) : null}

        <Footer />
      </main>
    </>
  );
}

export async function getStaticProps() {
  try {
    const result = await fetchPublicProgramWindow(3);
    return {
      props: { initialEvents: result.events || [] },
      revalidate: 300,
    };
  } catch {
    return {
      props: { initialEvents: [] },
      revalidate: 300,
    };
  }
}
