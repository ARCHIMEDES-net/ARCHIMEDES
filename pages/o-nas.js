import Head from "next/head";
import { ArrowRight, Building2, Radio, Users } from "lucide-react";
import Footer from "../components/Footer";
import { Button } from "../components/ui/button";
import SectionEyebrow from "../components/home/SectionEyebrow";

const principles = [
  {
    icon: Users,
    title: "Technologie podporuje osobní setkání",
    text: "Vysílání používáme jako společný program pro lidi v jednom místě, ne jako náhradu mezilidského kontaktu.",
  },
  {
    icon: Radio,
    title: "Obsah vzniká s odborníky",
    text: "Pořady připravujeme s hosty, školami, svazy a organizacemi, které tématu skutečně rozumějí.",
  },
  {
    icon: Building2,
    title: "Stavíme na zkušenosti z obcí",
    text: "ARCHIMEDES vychází z reálných učeben, živých vysílání a dlouhodobé spolupráce se školami a samosprávami.",
  },
];

export default function ONasPage() {
  return (
    <>
      <Head>
        <title>O projektu | ARCHIMEDES Live</title>
        <meta
          name="description"
          content="Kdo stojí za projektem ARCHIMEDES Live a proč využíváme živé vysílání k podpoře osobního setkávání v obcích."
        />
      </Head>

      <main className="bg-white text-slate-900">
        <section className="overflow-hidden bg-[#edf5fb]">
          <div className="mx-auto grid min-h-[610px] max-w-[1280px] lg:grid-cols-[0.9fr_1.1fr]">
            <div className="flex items-center px-5 py-16 sm:px-10 lg:px-12 lg:py-20">
              <div className="max-w-[600px]">
                <SectionEyebrow>O projektu</SectionEyebrow>
                <h1 className="text-[clamp(44px,6vw,70px)] font-[950] leading-[0.96] tracking-[-0.055em] text-navy-900">
                  Moderní technologie mají lidi přivádět k sobě
                </h1>
                <p className="mt-6 max-w-[570px] text-lg leading-relaxed text-slate-700 sm:text-xl">
                  ARCHIMEDES Live vzniká z jednoduché myšlenky: kvalitní živý
                  obsah může být důvodem, proč se lidé v obci pravidelně
                  setkávají, vzdělávají a sdílejí společný čas.
                </p>
              </div>
            </div>

            <div className="relative min-h-[410px] lg:min-h-full">
              <img
                src="/spolecna.jpg"
                alt="Lidé zapojení do projektu před učebnou ARCHIMEDES"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#edf5fb]/55 via-transparent to-transparent" />
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-20">
          <div className="mx-auto grid max-w-[1180px] gap-10 px-5 lg:grid-cols-[0.82fr_1.18fr]">
            <div>
              <SectionEyebrow>Kdo za projektem stojí</SectionEyebrow>
              <h2 className="max-w-md text-[clamp(34px,4vw,50px)] font-[950] leading-[1.03] tracking-[-0.045em] text-navy-900">
                Od učeben a školních vysílání k programu pro celou obec
              </h2>
            </div>
            <div className="space-y-5 text-[17px] leading-relaxed text-slate-700">
              <p>
                Projekt ARCHIMEDES rozvíjí společnost EduVision s.r.o. Naše
                zkušenost začala u moderních učeben a živých vzdělávacích pořadů
                pro školy. Postupně jsme ověřili, že stejný princip může přinášet
                hodnotu také seniorům, spolkům a dalším místním organizacím.
              </p>
              <p>
                ARCHIMEDES Live proto spojuje odbornou přípravu pořadu, živé
                vysílání a místní organizaci setkání. Obsah a technické řešení
                připravuje náš tým s odbornými partnery. Lidé se zapojují
                společně ve škole, klubovně, komunitním centru nebo učebně.
              </p>
              <p>
                Program nenahrazuje to, co už v obcích funguje. Nabízí místním
                komunitám další kvalitní důvod, proč se sejít.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-[#f3f7fb] py-16 sm:py-20">
          <div className="mx-auto max-w-[1180px] px-5">
            <SectionEyebrow>Naše principy</SectionEyebrow>
            <div className="mt-6 grid border-t border-slate-300 md:grid-cols-3 md:divide-x md:divide-slate-300">
              {principles.map((item) => {
                const Icon = item.icon;
                return (
                  <article key={item.title} className="border-b border-slate-300 py-7 md:px-7 first:md:pl-0 last:md:pr-0">
                    <Icon className="h-6 w-6 text-brand" aria-hidden="true" />
                    <h2 className="mt-4 text-xl font-black text-navy-900">{item.title}</h2>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.text}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto flex max-w-[1180px] flex-col items-start justify-between gap-6 px-5 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-2xl font-black tracking-[-0.03em] text-navy-900">Chcete poznat tým nebo probrat spolupráci?</h2>
              <p className="mt-2 text-sm text-slate-600">Na kontaktní stránce najdete správného člověka pro program, partnerství i učebny.</p>
            </div>
            <Button href="/kontakt">
              Kontakty na tým
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
