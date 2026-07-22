import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, Radio, Users, MapPin } from "lucide-react";
import Footer from "../components/Footer";
import SectionEyebrow from "../components/home/SectionEyebrow";
import { Button } from "../components/ui/button";

const benefits = [
  {
    icon: Radio,
    title: "Hotový odborný program",
    text: "ARCHIMEDES připraví téma, hosta, moderaci i technické vysílání.",
  },
  {
    icon: Users,
    title: "Společné setkání členů",
    text: "Spolek pozve své členy na jedno místo a zapojí se do pořadu společně.",
  },
  {
    icon: MapPin,
    title: "Přes obec nebo samostatně",
    text: "Spolek využije program své obce, nebo si stejný celý program objedná sám.",
  },
];

const included = [
  "živá vysílání a moderovaný program",
  "pozvánky podle zaměření spolku",
  "záznamy a navazující materiály, jsou-li k pořadu dostupné",
  "přístup pro určenou kontaktní osobu spolku",
  "stejný program a stejná cena jako pro obec nebo školu",
  "možnost pozdějšího zapojení pod partnerskou obec bez ztráty nastavení",
];

export default function SpolkyPage() {
  return (
    <>
      <Head>
        <title>Živý program pro spolky | ARCHIMEDES Live</title>
        <meta
          name="description"
          content="Živý odborný program ARCHIMEDES Live pro hasiče, včelaře, myslivce, rybáře, zahrádkáře, seniorské a další spolky."
        />
      </Head>

      <main className="bg-white text-slate-900">
        <section className="overflow-hidden bg-[#edf5fb]">
          <div className="mx-auto grid min-h-[600px] max-w-[1280px] lg:grid-cols-[0.92fr_1.08fr]">
            <div className="flex items-center px-5 py-16 sm:px-10 lg:px-12 lg:py-20">
              <div className="max-w-[600px]">
                <SectionEyebrow>ARCHIMEDES Live pro spolky</SectionEyebrow>
                <h1 className="text-[clamp(44px,6vw,70px)] font-[950] leading-[0.96] tracking-[-0.055em] text-navy-900">
                  Odborný program, který přivede členy ke společnému setkání
                </h1>
                <p className="mt-6 max-w-[570px] text-lg leading-relaxed text-slate-700 sm:text-xl">
                  Přinášíme živá témata pro hasiče, včelaře, myslivce,
                  rybáře, zahrádkáře, seniory i další spolky. Zapojit se můžete
                  prostřednictvím své obce nebo samostatně.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Button href="/zadost?type=spolek">
                    Chci program pro spolek
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Button>
                  <Link
                    href="/program#vysilani"
                    className="inline-flex h-12 items-center rounded-full border border-slate-300 bg-white px-5 text-sm font-black text-navy-900"
                  >
                    Zobrazit program
                  </Link>
                </div>
              </div>
            </div>

            <div className="relative min-h-[400px] lg:min-h-full">
              <Image
                src="/ucebna-komunita.webp"
                alt="Společné setkání členů komunity u programu ARCHIMEDES Live"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 54vw"
                className="object-cover"
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
          <div className="mx-auto grid max-w-[1180px] gap-9 px-5 lg:grid-cols-[1fr_0.9fr] lg:items-center">
            <div>
              <SectionEyebrow>Jeden program. Jedna cena.</SectionEyebrow>
              <h2 className="max-w-xl text-[clamp(34px,4vw,50px)] font-[950] leading-[1.03] tracking-[-0.045em] text-navy-900">
                Celý ARCHIMEDES Live pro váš spolek
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

            <div className="rounded-[28px] bg-[#f3f7fb] p-7 sm:p-9">
              <span className="text-xs font-black uppercase tracking-[0.16em] text-brand">Samostatné zapojení</span>
              <div className="mt-4 text-[46px] font-[950] tracking-[-0.05em] text-navy-900">
                1 990 Kč
                <span className="ml-2 text-base font-bold tracking-normal text-slate-500">/ měsíc</span>
              </div>
              <p className="mt-4 text-[15px] leading-relaxed text-slate-600">
                Pokud je vaše obec už zapojená, spolek může program využít bez
                samostatného předplatného. Správce obce mu vytvoří jednorázovou
                pozvánku.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button href="/zadost?type=spolek">Chci samostatné zapojení</Button>
                <span className="self-center text-sm leading-relaxed text-slate-500">
                  Registrační odkaz obdrží kontaktní osoba přímo od obce.
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
