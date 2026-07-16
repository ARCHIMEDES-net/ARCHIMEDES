import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  Check,
  FlaskConical,
  Globe2,
  GraduationCap,
  HeartPulse,
  History,
  Languages,
  Leaf,
  MonitorPlay,
  Radio,
  School,
  Users,
} from "lucide-react";
import Footer from "../components/Footer";
import SectionEyebrow from "../components/home/SectionEyebrow";
import { Button } from "../components/ui/button";

const benefits = [
  {
    icon: Radio,
    title: "Živý host přímo ve třídě",
    text: "Žáci se setkají s odborníkem, autorem nebo člověkem z praxe a mohou se aktivně zapojit.",
  },
  {
    icon: MonitorPlay,
    title: "Snadné zapojení do výuky",
    text: "Učitel otevře pořad přímo z portálu. Není potřeba instalovat další složitý systém.",
  },
  {
    icon: BookOpen,
    title: "Materiály a záznamy",
    text: "Je-li u pořadu k dispozici pracovní list nebo zveřejněný záznam, učitel jej najde v portálu.",
  },
];

const categories = [
  { icon: School, title: "1. stupeň ZŠ" },
  { icon: GraduationCap, title: "2. stupeň ZŠ" },
  { icon: FlaskConical, title: "Věda a objevy" },
  { icon: Leaf, title: "Příroda a ekologie" },
  { icon: History, title: "Historie a archeologie" },
  { icon: HeartPulse, title: "Wellbeing" },
  { icon: BriefcaseBusiness, title: "Kariérní poradenství" },
  { icon: Globe2, title: "Svět v souvislostech" },
  { icon: Languages, title: "Vysílání v angličtině" },
  { icon: BookOpen, title: "Čtenářský klub" },
];

const steps = [
  {
    number: "01",
    title: "Obec zapojí školu do programu",
    text: "Škola se registruje pod aktivní partnerskou obcí ARCHIMEDES Live. Jedna obecní licence tak slouží škole i dalším místním organizacím.",
  },
  {
    number: "02",
    title: "Učitelé získají vlastní přístup",
    text: "Škola obdrží svůj přístupový kód. Jednotliví učitelé se připojí ke škole a ve svém profilu si vyberou témata, která je zajímají.",
  },
  {
    number: "03",
    title: "Na vhodný pořad přijde pozvánka",
    text: "Učitel najde vysílání v portálu a připojí třídu jedním kliknutím. Žáci pořad sledují společně a podle formátu se mohou ptát hosta.",
  },
];

const practicalFacts = [
  "program pro 1. i 2. stupeň základních škol",
  "přístup pro všechny zapojené učitele školy",
  "použití na počítači, projektoru nebo interaktivní tabuli",
  "pozvánky podle témat vybraných konkrétním učitelem",
  "pracovní listy a navazující materiály, jsou-li u pořadu připravené",
  "zveřejněné záznamy dostupné v neveřejném archivu",
];

export default function SkolyPage() {
  return (
    <>
      <Head>
        <title>Živý program pro školy | ARCHIMEDES Live</title>
        <meta
          name="description"
          content="Živé vstupy s odborníky, témata z praxe, pracovní listy a záznamy pro základní školy zapojené do ARCHIMEDES Live."
        />
      </Head>

      <main className="bg-white text-slate-900">
        <section className="overflow-hidden bg-[#edf5fb]">
          <div className="mx-auto grid min-h-[620px] max-w-[1280px] lg:grid-cols-[0.92fr_1.08fr]">
            <div className="flex items-center px-5 py-16 sm:px-10 lg:px-12 lg:py-20">
              <div className="max-w-[610px]">
                <SectionEyebrow>ARCHIMEDES Live pro školy</SectionEyebrow>
                <h1 className="text-[clamp(44px,6vw,72px)] font-[950] leading-[0.96] tracking-[-0.055em] text-navy-900">
                  Živé vstupy, které propojují výuku s reálným světem
                </h1>
                <p className="mt-6 max-w-[580px] text-lg leading-relaxed text-slate-700 sm:text-xl">
                  Přinášíme do tříd inspirativní hosty, odborníky a témata
                  z praxe. Žáci se mohou ptát, hledat souvislosti a lépe chápat,
                  proč se učí.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Button href="/program#vysilani">
                    Zobrazit aktuální program
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Button>
                  <Link
                    href="#zapojeni-skoly"
                    className="inline-flex h-12 items-center rounded-full border border-slate-300 bg-white px-5 text-sm font-black text-navy-900"
                  >
                    Jak zapojit školu
                  </Link>
                </div>
              </div>
            </div>

            <div className="relative min-h-[420px] lg:min-h-full">
              <Image
                src="/jak-funguje-trida.webp"
                alt="Žáci se s nadšením zapojují do programu ARCHIMEDES Live"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 54vw"
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#edf5fb]/45 via-transparent to-transparent lg:from-[#edf5fb]/60" />
            </div>
          </div>
        </section>

        <section className="border-b border-slate-200 bg-white">
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
          <div className="mx-auto max-w-[1180px] px-5">
            <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
              <div className="max-w-md lg:sticky lg:top-28">
                <SectionEyebrow>Programové oblasti</SectionEyebrow>
                <h2 className="text-[clamp(34px,4vw,50px)] font-[950] leading-[1.03] tracking-[-0.045em] text-navy-900">
                  Témata pro různé ročníky i potřeby školy
                </h2>
                <p className="mt-5 text-base leading-relaxed text-slate-600">
                  Každý učitel si v profilu označí oblasti, které ho zajímají.
                  Dostává tak pozvánky na pořady vhodné pro jeho žáky a výuku.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {categories.map((item) => {
                  const Icon = item.icon;
                  return (
                    <article
                      key={item.title}
                      className="flex min-h-[82px] items-center gap-4 rounded-[18px] border border-slate-200 bg-white px-5 py-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]"
                    >
                      <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-[#eaf1f8] text-brand">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <h3 className="text-base font-black text-navy-900">{item.title}</h3>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#f3f7fb] py-16 sm:py-20">
          <div className="mx-auto grid max-w-[1180px] gap-10 px-5 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[28px] bg-slate-200">
              <Image
                src="/jak-funguje-online.webp"
                alt="Odbornice se živě připojuje na obrazovku ve třídě"
                fill
                sizes="(max-width: 1024px) 100vw, 52vw"
                className="object-cover"
              />
            </div>
            <div>
              <SectionEyebrow>Jak vypadá živý vstup</SectionEyebrow>
              <h2 className="text-[clamp(34px,4vw,50px)] font-[950] leading-[1.03] tracking-[-0.045em] text-navy-900">
                Hotový formát, který učitel snadno zařadí do hodiny
              </h2>
              <p className="mt-5 text-base leading-relaxed text-slate-600">
                ARCHIMEDES připraví téma, hosta, moderaci i technické vysílání.
                Učitel pracuje se svou třídou a podle konkrétního pořadu může
                využít také navazující materiál nebo zveřejněný záznam.
              </p>
              <p className="mt-4 text-base leading-relaxed text-slate-600">
                Nejde jen o pasivní video. Hodnotou je živé setkání s člověkem,
                který tématu skutečně rozumí, a možnost reagovat přímo během
                vysílání.
              </p>
            </div>
          </div>
        </section>

        <section id="zapojeni-skoly" className="scroll-mt-24 py-16 sm:py-20">
          <div className="mx-auto max-w-[1180px] px-5">
            <div className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
              <div className="lg:sticky lg:top-28">
                <SectionEyebrow>Zapojení školy</SectionEyebrow>
                <h2 className="max-w-md text-[clamp(34px,4vw,50px)] font-[950] leading-[1.03] tracking-[-0.045em] text-navy-900">
                  Škola je součástí programu své obce
                </h2>
                <p className="mt-5 max-w-md text-base leading-relaxed text-slate-600">
                  ARCHIMEDES Live funguje jako společný program pro obec. Škola
                  proto nemusí pořizovat oddělenou licenci a zapojuje se pod
                  registračním číslem partnerské obce.
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

        <section className="bg-navy-900 py-16 text-white sm:py-20">
          <div className="mx-auto grid max-w-[1180px] gap-9 px-5 lg:grid-cols-[1fr_0.9fr] lg:items-center">
            <div>
              <span className="text-xs font-black uppercase tracking-[0.18em] text-[#efbd58]">Co škola získá</span>
              <h2 className="mt-4 max-w-xl text-[clamp(34px,4vw,50px)] font-[950] leading-[1.03] tracking-[-0.045em]">
                Praktický program pro celou školu
              </h2>
              <ul className="mt-7 grid gap-3 sm:grid-cols-2">
                {practicalFacts.map((item) => (
                  <li key={item} className="flex gap-3 text-[15px] leading-relaxed text-white/78">
                    <Check className="mt-0.5 h-5 w-5 flex-none text-[#efbd58]" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-[28px] bg-white p-7 text-slate-900 sm:p-9">
              <Users className="h-7 w-7 text-brand" aria-hidden="true" />
              <h3 className="mt-4 text-2xl font-[950] tracking-[-0.035em] text-navy-900">
                Chcete zapojit svou školu?
              </h3>
              <p className="mt-3 text-[15px] leading-relaxed text-slate-600">
                Pokud už je vaše obec v ARCHIMEDES Live aktivní, můžete školu
                rovnou zaregistrovat. Pokud ještě zapojená není, ozvěte se nám
                a společně připravíme další postup pro školu i zřizovatele.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button href="/registrace-skoly">
                  Registrovat školu
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Button>
                <Button href="/kontakt" variant="secondary">
                  Kontaktovat nás
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
