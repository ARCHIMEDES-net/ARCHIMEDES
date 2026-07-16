import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, BookOpen, GraduationCap, Leaf, Radio, School, Users } from "lucide-react";
import Footer from "../components/Footer";
import PublicEventCard from "../components/PublicEventCard";
import SectionEyebrow from "../components/home/SectionEyebrow";
import { Button } from "../components/ui/button";
import { fetchPublicProgramWindow } from "../lib/publicEvents";

const formats = [
  {
    icon: GraduationCap,
    title: "Program pro školy",
    text: "Živí hosté, témata z praxe a navazující materiály pro žáky základních škol.",
  },
  {
    icon: Users,
    title: "Setkání pro seniory",
    text: "Rozhovory, vzdělávání a témata, kvůli kterým má smysl přijít společně.",
  },
  {
    icon: Leaf,
    title: "Pořady pro spolky",
    text: "Odborný obsah připravovaný se svazy pro jejich místní členy i veřejnost.",
  },
  {
    icon: BookOpen,
    title: "Kultura a čtenářství",
    text: "Setkání s autory, osobnostmi a tématy, která otevírají společnou diskusi.",
  },
  {
    icon: School,
    title: "Dobrá praxe z obcí",
    text: "Zkušenosti, inspirace a řešení využitelná ve škole i v životě obce.",
  },
  {
    icon: Radio,
    title: "Speciální vysílání",
    text: "Významné události, zahraniční hosté a společné programy napříč zapojenými místy.",
  },
];

export default function ProgramPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchPublicProgramWindow(8).then((result) => {
      if (cancelled) return;
      setEvents(result.events || []);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <Head>
        <title>Program a vysílání | ARCHIMEDES Live</title>
        <meta
          name="description"
          content="Konkrétní živá vysílání a program ARCHIMEDES Live pro školy, spolky, seniory a místní komunity."
        />
      </Head>

      <main className="bg-white text-slate-900">
        <section className="overflow-hidden bg-[#eef5fb]">
          <div className="mx-auto grid min-h-[610px] max-w-[1280px] lg:grid-cols-[0.9fr_1.1fr]">
            <div className="flex items-center px-5 py-16 sm:px-10 lg:px-12 lg:py-20">
              <div className="max-w-[590px]">
                <SectionEyebrow>Program ARCHIMEDES Live</SectionEyebrow>
                <h1 className="text-[clamp(44px,6vw,72px)] font-[950] leading-[0.95] tracking-[-0.055em] text-navy-900">
                  Živý obsah, který má pokračování v obci
                </h1>
                <p className="mt-6 max-w-[560px] text-lg leading-relaxed text-slate-700 sm:text-xl">
                  Připravujeme konkrétní pořady pro školy, spolky, seniory a
                  další místní komunity. Lidé se při nich setkávají, ptají se
                  hostů a sdílejí společný zážitek.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Button href="#vysilani">
                    Zobrazit vysílání
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Button>
                  <Link
                    href="/obec"
                    className="inline-flex h-12 items-center rounded-full border border-slate-300 bg-white px-5 text-sm font-black text-navy-900"
                  >
                    Program pro obec
                  </Link>
                </div>
              </div>
            </div>

            <div className="relative min-h-[410px] lg:min-h-full">
              <Image
                src="/program-hero.jpg"
                alt="Společné sledování živého programu ARCHIMEDES"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#eef5fb]/65 via-transparent to-transparent" />
            </div>
          </div>
        </section>

        <section id="vysilani" className="scroll-mt-24 py-16 sm:py-20">
          <div className="mx-auto max-w-[1180px] px-5">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <SectionEyebrow>Konkrétní program</SectionEyebrow>
                <h2 className="max-w-2xl text-[clamp(34px,4vw,50px)] font-[950] leading-[1.03] tracking-[-0.045em] text-navy-900">
                  Co jsme vysílali a co připravujeme
                </h2>
              </div>
              <p className="max-w-md text-sm leading-relaxed text-slate-600">
                Pokud ještě nejsou zveřejněné nové termíny, ukazujeme poslední
                uskutečněná vysílání. Nové pořady je postupně nahradí.
              </p>
            </div>

            {loading ? (
              <div className="mt-8 rounded-[22px] bg-[#f3f7fb] p-7 text-sm text-slate-500">Načítám program…</div>
            ) : events.length ? (
              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {events.map((event) => (
                  <PublicEventCard key={event.id} event={event} compact />
                ))}
              </div>
            ) : (
              <div className="mt-8 rounded-[22px] bg-[#f3f7fb] p-7">
                <strong className="text-navy-900">Nový program právě připravujeme.</strong>
                <p className="mt-1 text-sm text-slate-600">Potvrzené pořady zde zveřejníme ihned po stanovení termínu.</p>
              </div>
            )}
          </div>
        </section>

        <section className="bg-[#f3f7fb] py-16 sm:py-20">
          <div className="mx-auto max-w-[1180px] px-5">
            <div className="max-w-2xl">
              <SectionEyebrow>Podoby programu</SectionEyebrow>
              <h2 className="text-[clamp(34px,4vw,50px)] font-[950] leading-[1.03] tracking-[-0.045em] text-navy-900">
                Různá témata. Stejný princip společného setkání.
              </h2>
            </div>

            <div className="mt-10 grid gap-x-8 gap-y-0 border-t border-slate-300 md:grid-cols-2 lg:grid-cols-3">
              {formats.map((item) => {
                const Icon = item.icon;
                return (
                  <article key={item.title} className="border-b border-slate-300 py-7">
                    <Icon className="h-6 w-6 text-brand" aria-hidden="true" />
                    <h3 className="mt-4 text-xl font-black tracking-[-0.025em] text-navy-900">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.text}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="archiv" className="scroll-mt-24 py-16 sm:py-20">
          <div className="mx-auto grid max-w-[1180px] gap-8 px-5 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="grid grid-cols-3 gap-3">
              {["/pl50.webp", "/pl51.webp", "/pl52.webp"].map((src) => (
                <div key={src} className="aspect-[3/4] overflow-hidden rounded-[18px] bg-slate-100">
                  <img src={src} alt="Ukázka proběhlého vysílání ARCHIMEDES Live" className="h-full w-full object-cover" loading="lazy" />
                </div>
              ))}
            </div>
            <div>
              <SectionEyebrow>Archiv pro zapojené obce</SectionEyebrow>
              <h2 className="text-[clamp(32px,4vw,46px)] font-[950] leading-[1.04] tracking-[-0.045em] text-navy-900">
                Vysíláním program nekončí
              </h2>
              <p className="mt-5 text-base leading-relaxed text-slate-600">
                Je-li u pořadu k dispozici záznam nebo navazující materiál,
                najdou jej přihlášení uživatelé v portálu. Veřejná stránka ukazuje
                konkrétní témata, nikoli neveřejné odkazy k vysílání.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button href="/login">Přihlásit se do portálu</Button>
                <Button href="/zadost" variant="secondary">Chci program pro naši obec</Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
