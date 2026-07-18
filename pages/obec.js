import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, MapPin, Radio, Users } from "lucide-react";
import Footer from "../components/Footer";
import FaqSection, { createFaqStructuredData } from "../components/FaqSection";
import { Button } from "../components/ui/button";
import SectionEyebrow from "../components/home/SectionEyebrow";

const outcomes = [
  {
    icon: Radio,
    title: "Hotový živý program",
    text: "ARCHIMEDES připraví témata, hosty, vysílání i podklady k pozvánce.",
  },
  {
    icon: Users,
    title: "Program pro různé skupiny",
    text: "Škola, spolky i senioři využívají jeden společný program obce.",
  },
  {
    icon: MapPin,
    title: "Lidé se setkávají v obci",
    text: "Vysílání je příležitostí k osobnímu setkání, ne důvodem zůstat každý doma.",
  },
];

const steps = [
  {
    number: "01",
    title: "Obec vstoupí do programu",
    text: "Po uzavření spolupráce získá registrační číslo pro školu a spolky v obci.",
  },
  {
    number: "02",
    title: "Škola a spolky si vyberou témata",
    text: "Škola a jednotlivé spolky se zaregistrují pod obcí a označí oblasti, které je zajímají.",
  },
  {
    number: "03",
    title: "Na konkrétní pořad přijde pozvánka",
    text: "Kontaktní osoba svolá členy na jedno místo a společně se zapojí do živého programu.",
  },
];

const included = [
  "živá vysílání a moderovaný program",
  "pozvánky podle zaměření školy nebo spolku",
  "přístup školy, spolků i seniorů",
  "záznamy a navazující materiály, jsou-li u pořadu k dispozici",
  "jedno registrační číslo pro celou obec",
  "podpora při zapojení školy a spolků",
];

const municipalityFaqs = [
  {
    question: "Co obec v rámci ARCHIMEDES Live získá?",
    answer:
      "Obec získá pravidelný živý a moderovaný program, pozvánky podle zaměření školy a spolků a přístup pro školu, spolky, seniory i další zapojené skupiny. Součástí je také podpora při jejich zapojení a dostupné záznamy či materiály u vybraných pořadů.",
  },
  {
    question: "Kdo všechno může program v obci využívat?",
    answer:
      "Pod jedním registračním číslem obce se mohou zapojit škola, spolky a seniorské skupiny. Každý zapojený subjekt si zvolí oblasti zájmu a dostává pozvánky na relevantní pořady.",
  },
  {
    question: "Kolik stojí program pro obec?",
    answer:
      "Program stojí 1 990 Kč měsíčně pro celou obec. Za školu, spolky ani seniorské skupiny zapojené pod registračním číslem obce se nepřiplácí.",
  },
  {
    question: "Musí obec připravovat a organizovat vlastní pořady?",
    answer:
      "Nemusí. ARCHIMEDES Live zajišťuje téma, hosta, moderaci i technické vysílání. Obec, škola nebo spolek pouze vyberou vhodné pořady, pozvou účastníky a zajistí místo, kde se společně setkají.",
  },
  {
    question: "Je pro zapojení nutná venkovní učebna ARCHIMEDES?",
    answer:
      "Není. Program lze sledovat ve škole, klubovně, knihovně, komunitním centru nebo jiném vhodném prostoru s internetem a obrazovkou. Venkovní učebna ARCHIMEDES je samostatná možnost pro obce, které chtějí vytvořit trvalé zázemí pro výuku i komunitní život.",
  },
  {
    question: "Jak probíhá zapojení školy a spolků?",
    answer:
      "Po uzavření spolupráce získá obec registrační číslo. Škola a spolky se pod tímto číslem zaregistrují, nastaví si oblasti zájmu a následně dostávají pozvánky na vhodná živá vysílání.",
  },
  {
    question: "Jsou po vysílání dostupné záznamy?",
    answer:
      "Pokud je u konkrétního pořadu zveřejněný záznam, přihlášení uživatelé jej najdou v neveřejném archivu. Ne každý živý pořad musí mít záznam nebo navazující materiály k dispozici.",
  },
];

export default function ObecPage() {
  return (
    <>
      <Head>
        <title>Program pro obce | ARCHIMEDES Live</title>
        <meta
          name="description"
          content="Pravidelný živý program pro školu, spolky, seniory a další obyvatele v jednom předplatném pro celou obec."
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(createFaqStructuredData(municipalityFaqs)),
          }}
        />
      </Head>

      <main className="bg-white text-slate-900">
        <section className="overflow-hidden bg-[#edf5fb]">
          <div className="mx-auto grid min-h-[620px] max-w-[1280px] lg:grid-cols-[0.92fr_1.08fr]">
            <div className="flex items-center px-5 py-16 sm:px-10 lg:px-12 lg:py-20">
              <div className="max-w-[600px]">
                <SectionEyebrow>Pro obce</SectionEyebrow>
                <h1 className="text-[clamp(44px,6vw,72px)] font-[950] leading-[0.96] tracking-[-0.055em] text-navy-900">
                  Program, který přivede lidi ke společnému stolu
                </h1>
                <p className="mt-6 max-w-[570px] text-lg leading-relaxed text-slate-700 sm:text-xl">
                  Obec získá pravidelný živý program pro místní školu, spolky,
                  seniory a další obyvatele. Obsah připravíme my. Lidé se díky
                  němu potkají přímo ve své obci.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Button href="/zadost">
                    Chci program pro naši obec
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Button>
                  <Link
                    href="#jak-to-funguje"
                    className="inline-flex h-12 items-center rounded-full border border-slate-300 bg-white px-5 text-sm font-black text-navy-900"
                  >
                    Jak zapojení probíhá
                  </Link>
                </div>
              </div>
            </div>

            <div className="relative min-h-[420px] lg:min-h-full">
              <Image
                src="/ucebna-komunita.webp"
                alt="Společné komunitní setkání u učebny ARCHIMEDES"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 54vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#edf5fb]/35 via-transparent to-transparent lg:from-[#edf5fb]/55" />
            </div>
          </div>
        </section>

        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto grid max-w-[1180px] divide-y divide-slate-200 px-5 md:grid-cols-3 md:divide-x md:divide-y-0">
            {outcomes.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="py-8 md:px-7 first:md:pl-0 last:md:pr-0">
                  <Icon className="h-6 w-6 text-brand" aria-hidden="true" />
                  <h2 className="mt-4 text-lg font-black text-navy-900">{item.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.text}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section id="jak-to-funguje" className="scroll-mt-24 py-16 sm:py-20">
          <div className="mx-auto max-w-[1180px] px-5">
            <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
              <div className="lg:sticky lg:top-28">
                <SectionEyebrow>Jednoduché zapojení</SectionEyebrow>
                <h2 className="max-w-md text-[clamp(34px,4vw,50px)] font-[950] leading-[1.02] tracking-[-0.045em] text-navy-900">
                  Obec nemusí vytvářet další program sama
                </h2>
                <p className="mt-5 max-w-md text-base leading-relaxed text-slate-600">
                  ARCHIMEDES zajišťuje obsah a vysílání. Škola a spolky si
                  vybírají témata a svolávají žáky nebo členy na pořady, které
                  jsou pro ně užitečné.
                </p>
              </div>

              <div className="border-t border-slate-200">
                {steps.map((step) => (
                  <article key={step.number} className="grid gap-3 border-b border-slate-200 py-7 sm:grid-cols-[70px_1fr]">
                    <span className="text-sm font-black text-brand">{step.number}</span>
                    <div>
                      <h3 className="text-xl font-black tracking-[-0.025em] text-navy-900">{step.title}</h3>
                      <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-slate-600">{step.text}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#f3f7fb] py-16 sm:py-20">
          <div className="mx-auto grid max-w-[1180px] gap-8 px-5 lg:grid-cols-[1fr_0.9fr] lg:items-center">
            <div>
              <SectionEyebrow>Jedno předplatné pro obec</SectionEyebrow>
              <h2 className="max-w-xl text-[clamp(34px,4vw,50px)] font-[950] leading-[1.03] tracking-[-0.045em] text-navy-900">
                Jeden program pro školu, spolky i seniory
              </h2>
              <ul className="mt-7 grid gap-3 sm:grid-cols-2">
                {included.map((item) => (
                  <li key={item} className="flex gap-3 text-[15px] leading-relaxed text-slate-700">
                    <Check className="mt-0.5 h-5 w-5 flex-none text-brand" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div id="cenik" className="rounded-[28px] bg-white p-7 shadow-[0_22px_60px_rgba(15,23,42,0.08)] sm:p-9">
              <span className="text-xs font-black uppercase tracking-[0.16em] text-brand">Cena pro obec</span>
              <div className="mt-4 text-[46px] font-[950] tracking-[-0.05em] text-navy-900">
                1 990 Kč
                <span className="ml-2 text-base font-bold tracking-normal text-slate-500">/ měsíc</span>
              </div>
              <p className="mt-4 text-[15px] leading-relaxed text-slate-600">
                Jeden celý program pro obec, bez příplatku za školu a jednotlivé
                spolky zapojené pod jejím registračním číslem.
              </p>
              <Button href="/zadost" className="mt-7 w-full sm:w-auto">
                Nezávazně probrat zapojení
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          </div>
        </section>

        <FaqSection
          title="Co obce nejčastěji potřebují vědět"
          intro="Praktické odpovědi pro vedení obce, školu i spolky před zapojením do programu."
          items={municipalityFaqs}
        />
      </main>

      <Footer />
    </>
  );
}
