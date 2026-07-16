import Head from "next/head";
import Image from "next/image";
import { ArrowRight, Building2, Quote, Radio, Users } from "lucide-react";
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

const references = [
  {
    type: "Škola",
    organization: "ZŠ T. G. Masaryka a MŠ Hovorany",
    quote:
      "ARCHIMEDES nám do výuky přináší inspirativní osobnosti a příklady z reálného života. Žáci díky tomu lépe vnímají smysl probíraných témat a získávají nové pohledy na svět studia i práce. Oceňujeme kvalitní a snadno dostupný obsah propojený s cíli současného kurikula.",
    name: "Kateřina Riedlová",
    role: "ředitelka školy",
  },
  {
    type: "Škola",
    organization: "Základní škola Louny",
    quote:
      "Na programu ARCHIMEDES Live oceňujeme zejména možnost vybírat pořady z archivu podle aktuálních potřeb jednotlivých tříd. Učitelé tak mohou kvalitní obsah snadno zařadit do výuky právě ve chvíli, kdy nejlépe doplňuje probírané téma, a nabídnout žákům setkání s inspirativními lidmi z praxe.",
    name: "Vlastimil Lisse",
    role: "ředitel školy",
  },
  {
    type: "Obec",
    organization: "Obec Křenov",
    quote:
      "Jsme malá obec, a právě proto je pro nás důležité vytvářet příležitosti, které lidi přirozeně spojují. Jsme rádi, že jsme se rozhodli do projektu ARCHIMEDES zapojit. Učebna i program ARCHIMEDES Live výrazně posílily komunitní život v naší obci a přispěly také k našemu úspěchu v soutěži Obec 2030.",
    name: "Václav Dvořák",
    role: "starosta obce",
  },
  {
    type: "Obec",
    organization: "Obec Provodov-Šonov",
    quote:
      "ARCHIMEDES vytvořil prostor, ve kterém se přirozeně propojují škola, obec i místní komunita. Učebna a program ARCHIMEDES Live nám pomáhají rozvíjet společné aktivity, posilovat vztahy mezi lidmi a významně přispěly také k získání ocenění Bílá stuha v soutěži Vesnice roku.",
    name: "Ondřej Daněk",
    role: "místostarosta obce",
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
              <Image
                src="/spolecna.jpg"
                alt="Lidé při společném komunitním setkání ARCHIMEDES"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#edf5fb]/55 via-transparent to-transparent" />
            </div>
          </div>
        </section>

        <section className="bg-[#f3f7fb] py-16 sm:py-20">
          <div className="mx-auto max-w-[1180px] px-5">
            <div className="max-w-[760px]">
              <SectionEyebrow>Zkušenosti škol a obcí</SectionEyebrow>
              <h2 className="mt-4 text-[clamp(34px,4vw,50px)] font-[950] leading-[1.03] tracking-[-0.045em] text-navy-900">
                ARCHIMEDES v každodenní praxi
              </h2>
              <p className="mt-4 text-[17px] leading-relaxed text-slate-700">
                Školám přináší inspirativní obsah do výuky. Obcím pomáhá
                propojovat generace, rozvíjet komunitní život a vytvářet
                prostor pro společná setkávání.
              </p>
            </div>

            <div className="mt-9 grid gap-5 md:grid-cols-2">
              {references.map((reference) => (
                <figure
                  key={reference.organization}
                  className="flex h-full flex-col rounded-[26px] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,35,65,0.07)] sm:p-8"
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-brand">
                      {reference.type}
                    </span>
                    <Quote className="h-7 w-7 text-brand/25" aria-hidden="true" />
                  </div>
                  <blockquote className="mt-5 flex-1 text-[16px] leading-[1.75] text-slate-700">
                    „{reference.quote}“
                  </blockquote>
                  <figcaption className="mt-7 border-t border-slate-200 pt-5">
                    <p className="font-black text-navy-900">{reference.name}</p>
                    <p className="mt-1 text-sm text-slate-600">
                      {reference.role}, {reference.organization}
                    </p>
                  </figcaption>
                </figure>
              ))}
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
