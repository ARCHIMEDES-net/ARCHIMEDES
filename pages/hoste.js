import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import Footer from "../components/Footer";

const benefits = [
  {
    title: "Skutečný dopad",
    text: "Nemluvíte jen do kamery. Mluvíte ke skutečným žákům a lidem v obcích, kteří poslouchají, reagují a ptají se.",
  },
  {
    title: "Smysluplný formát",
    text: "Moderovaný rozhovor pomůže předat vaše zkušenosti srozumitelně, lidsky a bez zbytečných technických komplikací.",
  },
  {
    title: "Dlouhodobá inspirace",
    text: "Jedno setkání může ovlivnit, jak mladý člověk přemýšlí o své budoucnosti, práci i světě kolem sebe.",
  },
];

const steps = [
  ["Domluvíme téma a termín", "Společně vybereme téma, které odpovídá vašim zkušenostem a našemu programu."],
  ["Připravíme strukturu", "Moderátor vás předem provede průběhem a pomůže vytvořit jasnou osnovu rozhovoru."],
  ["Jednoduše se připojíte", "Před vysíláním ověříme obraz a zvuk. K připojení stačí běžný počítač a stabilní internet."],
  ["Vysílání moderujeme", "Rozhovor obvykle trvá 30–45 minut a podle formátu zahrnuje také otázky diváků."],
];

export default function HostePage() {
  return (
    <>
      <Head>
        <title>Staňte se hostem | ARCHIMEDES Live</title>
        <meta
          name="description"
          content="Informace pro osobnosti a odborníky, které zveme jako hosty do živého vysílání ARCHIMEDES Live."
        />
      </Head>

      <main className="bg-white text-navy-900">
        <nav aria-label="Odkazy stránky pro hosty" className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-end gap-2 px-5 py-3 text-sm font-black">
            <span className="rounded-full bg-navy-900 px-4 py-2 text-white" aria-current="page">
              Česky
            </span>
            <Link href="/guest" className="rounded-full px-4 py-2 text-slate-600 hover:bg-slate-100">
              English
            </Link>
            <Link
              href="/vysilali-jsme"
              className="rounded-full border border-slate-200 px-4 py-2 text-navy-900 hover:bg-slate-50"
            >
              Vysílali jsme
            </Link>
          </div>
        </nav>

        <section className="relative">
          <div className="absolute inset-0 overflow-hidden">
            <Image
              src="/hero-vyuka.webp"
              alt="Žáci při vysílání ARCHIMEDES Live"
              fill
              priority
              sizes="100vw"
              style={{ objectFit: "cover" }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[rgba(9,16,32,0.86)] via-[rgba(9,16,32,0.68)] to-[rgba(9,16,32,0.44)]" />
          </div>

          <div className="relative z-[2] mx-auto flex min-h-[620px] max-w-[1180px] items-center px-5 py-16 text-white">
            <div className="max-w-[820px]">
              <span className="inline-flex rounded-full bg-white/15 px-4 py-2 text-sm font-black">
                ARCHIMEDES Live
              </span>
              <h1 className="mt-6 text-[42px] font-black leading-[1.02] tracking-[-0.05em] sm:text-[60px] lg:text-[72px]">
                Nejen mluvíte.
                <br />
                Pomáháte mladým lidem vidět svět jinak.
              </h1>
              <p className="mt-6 max-w-[760px] text-xl leading-[1.45] text-white/92 sm:text-[28px]">
                Propojujeme inspirativní osobnosti, odborníky a lidi se skutečnou
                zkušeností s žáky, školami a komunitami v obcích.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="#kontakt"
                  className="inline-flex min-h-[52px] items-center justify-center rounded-2xl bg-white px-6 font-black text-navy-900 shadow-lg"
                >
                  Domluvit vysílání
                </a>
                <a
                  href="#jak-to-probiha"
                  className="inline-flex min-h-[52px] items-center justify-center rounded-2xl border border-white/60 bg-white/10 px-6 font-black text-white"
                >
                  Jak to probíhá
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-[900px] px-5 text-center">
            <h2 className="text-[36px] font-black leading-tight tracking-[-0.04em] sm:text-[54px]">
              Co je ARCHIMEDES Live
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-slate-600 sm:text-2xl">
              ARCHIMEDES Live je pravidelný živý vzdělávací a komunitní program
              pro školy, obce, seniory a spolky. Vytváří skutečná setkání s lidmi,
              jejichž zkušenosti přesahují učebnice — s odborníky, tvůrci,
              osobnostmi veřejného života i lidmi s výjimečným příběhem.
            </p>
          </div>
        </section>

        <section className="bg-slate-50 py-16 sm:py-24">
          <div className="mx-auto max-w-[1180px] px-5">
            <div className="mx-auto max-w-[820px] text-center">
              <h2 className="text-[36px] font-black leading-tight tracking-[-0.04em] sm:text-[54px]">
                Proč přijmout naše pozvání
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-slate-600">
                Není to anonymní webinář. Je to připravené, moderované a lidské setkání.
              </p>
            </div>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {benefits.map((benefit) => (
                <article
                  key={benefit.title}
                  className="rounded-card-lg border border-slate-200 bg-white p-7 shadow-[0_12px_34px_rgba(15,23,42,0.05)]"
                >
                  <h3 className="text-2xl font-black tracking-[-0.03em]">{benefit.title}</h3>
                  <p className="mt-4 text-lg leading-relaxed text-slate-600">{benefit.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="jak-to-probiha" className="py-16 sm:py-24">
          <div className="mx-auto grid max-w-[1180px] items-center gap-10 px-5 lg:grid-cols-2">
            <div>
              <span className="inline-flex rounded-full bg-eyebrow px-4 py-2 text-sm font-black text-navy-600">
                Jednoduchý průběh
              </span>
              <h2 className="mt-5 text-[36px] font-black leading-tight tracking-[-0.04em] sm:text-[54px]">
                Jak vysílání probíhá
              </h2>
              <div className="mt-8 grid gap-5">
                {steps.map(([title, text], index) => (
                  <div key={title} className="grid grid-cols-[44px_1fr] gap-4">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-navy-900 font-black text-white">
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="text-xl font-black">{title}</h3>
                      <p className="mt-1.5 text-[17px] leading-relaxed text-slate-600">{text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative min-h-[380px] overflow-hidden rounded-card-lg shadow-xl sm:min-h-[560px]">
              <Image
                src="/jak-funguje-online.webp"
                alt="Průběh online vysílání ARCHIMEDES Live"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                style={{ objectFit: "cover" }}
              />
            </div>
          </div>
        </section>

        <section className="bg-navy-900 py-16 text-white sm:py-20">
          <div className="mx-auto max-w-[860px] px-5 text-center">
            <p className="text-[32px] font-black leading-tight tracking-[-0.04em] sm:text-[48px]">
              Žáci si nepamatují jen informace.
              <br />
              Pamatují si lidi.
            </p>
            <Link
              href="/vysilali-jsme"
              className="mt-8 inline-flex min-h-[52px] items-center justify-center rounded-2xl bg-white px-6 font-black text-navy-900"
            >
              Podívat se, co jsme vysílali
            </Link>
          </div>
        </section>

        <section id="kontakt" className="py-16 sm:py-24">
          <div className="mx-auto max-w-[860px] px-5">
            <div className="rounded-card-lg border border-slate-200 bg-gradient-to-br from-white to-blue-50 p-8 text-center shadow-sm sm:p-10">
              <span className="inline-flex rounded-full bg-eyebrow px-4 py-2 text-sm font-black text-navy-600">
                Kontakt
              </span>
              <h2 className="mt-4 text-[36px] font-black tracking-[-0.04em] sm:text-[54px]">
                Pojďme se domluvit
              </h2>
              <p className="mx-auto mt-4 max-w-[650px] text-lg leading-relaxed text-slate-600">
                Pokud jste obdrželi naše pozvání nebo máte téma, které může být
                pro žáky či komunity přínosné, ozvěte se týmu ARCHIMEDES Live.
              </p>
              <div className="mt-7 grid gap-2 text-lg font-black">
                <a href="mailto:zive@archimedeslive.com" className="hover:underline">
                  zive@archimedeslive.com
                </a>
                <a href="tel:+420732827210" className="hover:underline">
                  +420 732 827 210
                </a>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}
