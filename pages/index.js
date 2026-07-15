import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { track } from "@vercel/analytics";
import {
  ArrowRight,
  Users,
  GraduationCap,
  Link2,
  MessageCircle,
  TrendingUp,
  Megaphone,
  Archive,
} from "lucide-react";
import Footer from "../components/Footer";
import PhotoWithFallback from "../components/PhotoWithFallback";
import PublicMonthCalendar from "../components/PublicMonthCalendar";
import PublicEventCard from "../components/PublicEventCard";
import { fetchPublicUpcomingEvents } from "../lib/publicEvents";
import { cn } from "../lib/utils";
import { Button } from "../components/ui/button";
import SectionEyebrow from "../components/home/SectionEyebrow";
import StatsSection from "../components/home/StatsSection";
import FeatureCard from "../components/home/FeatureCard";
import ReferenceCard from "../components/home/ReferenceCard";
import PartnersSection from "../components/partners/PartnersSection";
import {
  hero,
  liveSection,
  featuresSection,
  featureCards,
  communitySection,
  atmosphereSection,
  atmospherePhotos,
  referencesSection,
  references,
  ctaBand,
} from "../content/homepage";

const FEATURE_ICONS = {
  graduation: GraduationCap,
  link: Link2,
  chat: MessageCircle,
  growth: TrendingUp,
  megaphone: Megaphone,
  archive: Archive,
};

export default function Home() {
  const router = useRouter();
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

  const visibleFeatures = featureCards.filter((f) => f.visible);
  const visibleAtmospherePhotos = atmospherePhotos.filter((p) => p.visible);
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

        {/* LIVE + CALENDAR */}
        <section id="kalendar" className="py-12">
          <div className="mx-auto max-w-[1180px] px-5 grid gap-10 lg:grid-cols-[1.5fr_1fr] lg:items-start">
            <div>
              <SectionEyebrow>{liveSection.eyebrow}</SectionEyebrow>
              <h2 className="flex items-center gap-2.5 text-3xl font-[950] tracking-[-0.045em] text-navy-900">
                {liveSection.title}
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500"
                  aria-hidden="true"
                />
              </h2>
              <p className="mt-3 max-w-md text-[15.5px] leading-relaxed text-muted">
                {liveSection.subtitle}
              </p>

              {eventsLoading ? (
                <p className="mt-6 text-[15px] text-slate-500">Načítám nadcházející vysílání…</p>
              ) : upcomingCards.length ? (
                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {upcomingCards.map((event) => (
                    <PublicEventCard key={event.id} event={event} compact />
                  ))}
                </div>
              ) : (
                <p className="mt-6 text-[15px] text-slate-500">Zatím žádné naplánované vysílání.</p>
              )}

              <Link
                href="/kalendar"
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-brand hover:text-navy-900"
              >
                {liveSection.showAllLabel} <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>

            <div>
              <PublicMonthCalendar
                events={events}
                lockedNote={liveSection.calendarLockedNote}
                onNavigate={() => router.push("/kalendar")}
              />
            </div>
          </div>
        </section>

        {/* PARTNERS */}
        <PartnersSection />

        {/* FEATURES */}
        <section id="jak-to-funguje" className="py-12">
          <div className="mx-auto max-w-[1180px] px-5">
            <div className="flex flex-wrap items-center justify-between gap-8">
              <div className="max-w-2xl flex-1">
                <SectionEyebrow>{featuresSection.eyebrow}</SectionEyebrow>
                <h2 className="text-3xl font-[950] tracking-[-0.045em] text-navy-900">
                  {featuresSection.title}
                </h2>
              </div>

              {featuresSection.photo ? (
                <div className="aspect-video w-full max-w-[300px] flex-none overflow-hidden rounded-card-md shadow-[0_14px_34px_rgba(15,23,42,0.12)]">
                  <PhotoWithFallback
                    src={featuresSection.photo}
                    alt={featuresSection.photoAlt}
                    fallbackLabel="ARCHIMEDES Live"
                    style={{ width: "100%", height: "100%" }}
                    imgStyle={{ objectFit: "cover" }}
                  />
                </div>
              ) : null}
            </div>

            <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {visibleFeatures.map((f) => (
                <FeatureCard
                  key={f.id}
                  icon={FEATURE_ICONS[f.icon]}
                  title={f.title}
                  description={f.description}
                />
              ))}
            </div>
          </div>
        </section>

        {/* COMMUNITY & SENIORS */}
        {communitySection.visible ? (
          <section className="border-y border-slate-100 bg-slate-50 py-12">
            <div className="mx-auto max-w-[1180px] px-5 grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <div className="aspect-[4/3.1] overflow-hidden rounded-card-lg shadow-[0_24px_60px_rgba(15,23,42,0.14)]">
                <PhotoWithFallback
                  src={communitySection.photo}
                  alt={communitySection.photoAlt}
                  fallbackLabel="ARCHIMEDES Live"
                  style={{ width: "100%", height: "100%" }}
                  imgStyle={{ objectFit: "cover" }}
                />
              </div>

              <div>
                <SectionEyebrow>{communitySection.eyebrow}</SectionEyebrow>
                <h2 className="text-3xl font-[950] tracking-[-0.045em] text-navy-900">
                  {communitySection.title}
                </h2>
                <p className="mt-3 max-w-md text-[15.5px] leading-relaxed text-muted">
                  {communitySection.text}
                </p>
                <Link
                  href={communitySection.cta.href}
                  className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-brand hover:text-navy-900"
                >
                  {communitySection.cta.label} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </section>
        ) : null}

        {/* ATMOSPHERE / EVENTS */}
        {atmosphereSection.visible && visibleAtmospherePhotos.length ? (
          <section className="py-12">
            <div className="mx-auto max-w-[1180px] px-5">
              <SectionEyebrow>{atmosphereSection.eyebrow}</SectionEyebrow>
              <h2 className="text-3xl font-[950] tracking-[-0.045em] text-navy-900">
                {atmosphereSection.title}
              </h2>
              <p className="mt-3 max-w-lg text-[15.5px] leading-relaxed text-muted">
                {atmosphereSection.subtitle}
              </p>

              <div className="mt-10 grid gap-4 md:h-[420px] md:grid-cols-[1.4fr_1fr] md:grid-rows-2">
                {visibleAtmospherePhotos.map((p, i) => (
                  <div
                    key={p.id}
                    className={cn(
                      "relative aspect-[4/3] overflow-hidden rounded-card-md shadow-[0_14px_34px_rgba(15,23,42,0.1)] md:aspect-auto",
                      i === 0 && "md:row-span-2"
                    )}
                  >
                    <PhotoWithFallback
                      src={p.src}
                      alt={p.alt}
                      fallbackLabel="ARCHIMEDES Live"
                      style={{ width: "100%", height: "100%" }}
                      imgStyle={{ objectFit: "cover", objectPosition: p.objectPosition || "center" }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {/* REFERENCES */}
        {visibleReferences.length ? (
          <section id="reference" className="py-12">
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

              <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
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

        {/* CTA BAND */}
        {ctaBand.visible ? (
          <section className="pb-16">
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
