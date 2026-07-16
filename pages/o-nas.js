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
        <title>Naše vize | ARCHIMEDES Live</title>
        <meta
          name="description"
          content="Naší vizí jsou obce, ve kterých kvalitní živý program podporuje školy, spolky a komunity a přivádí lidi k osobnímu setkávání."
        />
      </Head>

      <main className="bg-white text-slate-900">
        <section className="overflow-hidden bg-[#edf5fb]">
          <div className="mx-auto grid min-h-[610px] max-w-[1280px] lg:grid-cols-[0.9fr_1.1fr]">
            <div className="flex items-center px-5 py-16 sm:px-10 lg:px-12 lg:py-20">
              <div className="max-w-[600px]">
                <SectionEyebrow>Naše vize</SectionEyebrow>
                <h1 className="text-[clamp(44px,6vw,70px)] font-[950] leading-[0.96] tracking-[-0.055em] text-navy-900">
                  Moderní technologie mají lidi přivádět k sobě
                </h1>
                <p className="mt-6 max-w-[570px] text-lg leading-relaxed text-slate-700 sm:text-xl">
                  Chceme, aby obce měly dostupný kvalitní program, který
                  podporuje jejich školy, spolky a komunity a dává lidem další
                  dobrý důvod setkávat se osobně.
                </p>
              </div>
            </div>

            <div className="relative min-h-[410px] lg:min-h-full">
              <img
                src="/spolecna.jpg"
                alt="Lidé při společném komunitním setkání ARCHIMEDES"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#edf5fb]/55 via-transparent to-transparent" />
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-20">
          <div className="mx-auto grid max-w-[1180px] gap-10 px-5 lg:grid-cols-[0.82fr_1.18fr]">
            <div>
              <SectionEyebrow>Naše mise</SectionEyebrow>
              <h2 className="max-w-md text-[clamp(34px,4vw,50px)] font-[950] leading-[1.03] tracking-[-0.045em] text-navy-900">
                Přinášet pravidelný živý program tam, kde lidé skutečně žijí
              </h2>
            </div>
            <div className="space-y-5 text-[17px] leading-relaxed text-slate-700">
              <p>
                Naší misí je připravovat živá vysílání, odborné hosty a témata,
                která mohou využívat školy, spolky, senioři i další místní
                komunity. Obec tak nemusí celý program vytvářet sama.
              </p>
              <p>
                ARCHIMEDES Live zajišťuje přípravu pořadu, živé vysílání a
                podklady pro pozvání účastníků. Místní organizace si vybírají
                užitečná témata a setkání pořádají ve škole, klubovně,
                komunitním centru nebo učebně.
              </p>
              <p>
                Vycházíme ze zkušeností společnosti EduVision s moderními
                učebnami, živým vzdělávacím programem a dlouhodobou spoluprací
                se školami a samosprávami. Nenahrazujeme to, co už v obcích
                funguje. Podporujeme to dalším kvalitním programem.
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
