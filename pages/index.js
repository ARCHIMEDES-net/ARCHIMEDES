import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import { track } from "@vercel/analytics";
import {
  ArrowRight,
  Users,
  GraduationCap,
  Megaphone,
  Building2,
} from "lucide-react";
import Footer from "../components/Footer";
import PhotoWithFallback from "../components/PhotoWithFallback";
import PublicEventCard from "../components/PublicEventCard";
import { fetchPublicUpcomingEvents } from "../lib/publicEvents";
import { Button } from "../components/ui/button";
import SectionEyebrow from "../components/home/SectionEyebrow";
import StatsSection from "../components/home/StatsSection";
import ReferenceCard from "../components/home/ReferenceCard";
import PartnersSection from "../components/partners/PartnersSection";
import {
  hero,
  liveSection,
  referencesSection,
  references,
  ctaBand,
} from "../content/homepage";

const AUDIENCES = [
  {
    title: "Pro obce",
    text: "Jedna licence propojí školu, spolky, seniory i místní komunitu.",
    href: "/obec",
    icon: Building2,
  },
  {
    title: "Pro spolky a organizace",
    text: "Společné vysílání, vzdělávání a setkávání členů v obci.",
    href: "/pro-organizace",
    icon: Users,
  },
  {
    title: "Pro národní organizace",
    text: "Obsah a hosté se dostanou přímo k místním komunitám.",
    href: "/pro-organizace",
    icon: Megaphone,
  },
  {
    title: "Pro školy",
    text: "Živé pořady, inspirativní hosté a program propojený s praxí.",
    href: "/program",
    icon: GraduationCap,
  },
];

export default function Home() {
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetchPublicUpcomingEvents().then((res) => {
      if (cancelled) return;
      setEvents(res.events);
      setEventsLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const visibleReferences = references.filter((r) => r.visible);
  const upcomingCards = events.slice(0, 3);

  return (
    <>
      <Head>
        <title>ARCHIMEDES Live | Silná komunita. Úspěšná obec.</title>
        <meta
          name="description"
          content="ARCHIMEDES Live spojuje všechny, kdo tvoří život vaší obce — školy, spolky, seniory, rodiče i národní organizace — do jednoho celoročního programu."
        />
      </Head>

      <main className="bg-white text-slate-900">
        {/* HERO */}
        <section className="relative min-h-[680px] overflow-hidden bg-[#153a63] text-white lg:min-h-[78vh]">
          <div className="absolute inset-0">
            <PhotoWithFallback
              src={hero.photo}
              alt={hero.photoAlt}
              fallbackLabel="ARCHIMEDES Live"
              style={{ width: "100%", height: "100%" }}
              imgStyle={{ objectFit: "cover", objectPosition: "center center" }}
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
                  Propojujeme školy, spolky, seniory, rodiče i národní organizace do jednoho celoročního programu.
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

        {/* LIVE PROGRAM */}
        <section id="kalendar" className="py-10">
          <div className="mx-auto grid max-w-[1180px] gap-7 px-5 lg:grid-cols-[280px_1fr] lg:items-start">
            <div>
              <SectionEyebrow>{liveSection.eyebrow}</SectionEyebrow>
              <h2 className="text-3xl font-[950] tracking-[-0.045em] text-navy-900">
                Program, který žije
              </h2>
              <p className="mt-3 text-[15px] leading-relaxed text-muted">
                Každý týden živé vysílání, vzdělávání a setkávání pro různé generace.
              </p>
              <Link href="/kalendar" className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-brand">
                Zobrazit celý program <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>

            {eventsLoading ? (
              <div className="rounded-[20px] border border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
                Načítám nadcházející vysílání…
              </div>
            ) : upcomingCards.length ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {upcomingCards.map((event) => (
                  <PublicEventCard key={event.id} event={event} compact />
                ))}
              </div>
            ) : (
              <div className="rounded-[20px] border border-slate-200 bg-slate-50 p-6">
                <strong className="text-navy-900">Nový program právě připravujeme.</strong>
                <p className="mt-1 text-sm text-muted">Všechny potvrzené termíny najdete průběžně v kalendáři.</p>
              </div>
            )}
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
                  Přinášíme společný program školám, spolkům, seniorům a dalším lidem, kteří tvoří život obce.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {["Připravíme živý program", "Místní organizace dostanou pozvání", "Lidé se setkají společně"].map((title, index) => (
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
                <Link
                  href={referencesSection.showAllHref}
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-brand hover:text-navy-900"
                >
                  {referencesSection.showAllLabel} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>

              <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {visibleReferences.map((r) => (
                  <ReferenceCard
                    key={r.id}
                    reference={r}
                    readStoryLabel={referencesSection.readStoryLabel}
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

        {/* PARTNERS */}
        <PartnersSection />

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
