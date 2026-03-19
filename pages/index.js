import Head from "next/head";
import Link from "next/link";
import Footer from "../components/Footer";

const heroImg = "/hero-vyuka.jpg";
const lessonImg = "/jak-funguje-trida.jpg";
const boardImg = "/jak-funguje-tabule.jpg";
const onlineImg = "/jak-funguje-online.jpg";
const classroomImg = "/ucebna2.webp";

const benefits = [
  {
    title: "Živý program bez složité přípravy",
    text: "Škola získává hotový formát, který lze snadno zařadit do běžné výuky a který přináší do třídy nové impulzy.",
  },
  {
    title: "Reální hosté a skutečná témata",
    text: "Žáci se setkávají s lidmi z praxe, autory, odborníky i inspirativními osobnostmi, které otevírají témata s přesahem.",
  },
  {
    title: "Propojení výuky s praxí a komunitou",
    text: "ARCHIMEDES Live může využívat škola, obec i širší komunita. Vysílání tak získává širší smysl a dopad.",
  },
];

export default function HomePage() {
  return (
    <>
      <Head>
        <title>ARCHIMEDES Live | Živý program pro školy a obce</title>
        <meta
          name="description"
          content="ARCHIMEDES Live přináší školám a obcím živý program s odborníky, reálnými tématy a propojením výuky s praxí."
        />
      </Head>

      <main className="bg-[#f6f7f9] text-slate-900">
        {/* HERO */}
        <section className="border-b border-slate-200">
          <div className="mx-auto max-w-7xl px-6 py-14 sm:px-8 lg:px-10 lg:py-20">
            <div className="grid items-center gap-10 lg:grid-cols-[1.02fr_0.98fr]">
              <div className="max-w-2xl">
                <h1 className="text-5xl font-extrabold leading-[0.98] tracking-[-0.04em] text-slate-900 sm:text-6xl lg:text-[4.5rem]">
                  ARCHIMEDES Live přináší
                  <br />
                  <span className="text-emerald-600">živý program do výuky</span>
                </h1>

                <p className="mt-8 max-w-xl text-xl leading-9 text-slate-600 sm:text-[1.65rem] sm:leading-[1.45] lg:text-[2.05rem] lg:leading-[1.42]">
                  Žáci sledují živé vstupy odborníků, pracují s tématem a zapojují se do výuky jinak než dříve.
                </p>

                <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
                  <Link
                    href="/program#ukazky-vysilani"
                    className="inline-flex items-center justify-center rounded-2xl bg-[#0d1b44] px-7 py-4 text-lg font-semibold text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-xl"
                  >
                    Ukázková hodina
                  </Link>

                  <Link
                    href="/demo"
                    className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-7 py-4 text-lg font-semibold text-slate-900 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-slate-900 hover:shadow-xl"
                  >
                    Chci DEMO
                  </Link>

                  <Link
                    href="/aktualni-pozvanky"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-7 py-4 text-lg font-semibold text-slate-900 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-emerald-500 hover:text-emerald-700 hover:shadow-xl"
                  >
                    <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    Co se chystá teď
                  </Link>
                </div>
              </div>

              <div className="relative">
                <div className="overflow-hidden rounded-[34px] bg-white shadow-[0_22px_60px_rgba(15,23,42,0.12)]">
                  <img
                    src={heroImg}
                    alt="ARCHIMEDES Live ve výuce"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* JAK VYPADÁ JEDNA HODINA */}
        <section className="border-b border-slate-200">
          <div className="mx-auto max-w-7xl px-6 py-14 sm:px-8 lg:px-10 lg:py-20">
            <div className="grid items-center gap-10 lg:grid-cols-[0.98fr_1.02fr]">
              <div className="overflow-hidden rounded-[34px] bg-white shadow-[0_18px_50px_rgba(15,23,42,0.1)]">
                <img
                  src={boardImg}
                  alt="Ukázka vysílání ve třídě"
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="max-w-2xl">
                <h2 className="text-4xl font-extrabold leading-tight tracking-[-0.04em] text-slate-900 sm:text-5xl">
                  Jak vypadá jedna hodina
                </h2>

                <p className="mt-6 text-xl leading-9 text-slate-600">
                  Jedna třída, jeden vstup, jeden pracovní list. Výuka, která dává smysl a zapojuje žáky.
                </p>

                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="text-sm font-bold text-emerald-700">1</div>
                    <h3 className="mt-2 text-lg font-bold text-slate-900">Živý vstup</h3>
                    <p className="mt-2 text-sm leading-7 text-slate-600">
                      Host přichází přímo do výuky a otevírá téma srozumitelně a živě.
                    </p>
                  </div>

                  <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="text-sm font-bold text-emerald-700">2</div>
                    <h3 className="mt-2 text-lg font-bold text-slate-900">Třída reaguje</h3>
                    <p className="mt-2 text-sm leading-7 text-slate-600">
                      Žáci sledují, přemýšlejí, kladou otázky a zapojují se do tématu.
                    </p>
                  </div>

                  <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="text-sm font-bold text-emerald-700">3</div>
                    <h3 className="mt-2 text-lg font-bold text-slate-900">Návaznost</h3>
                    <p className="mt-2 text-sm leading-7 text-slate-600">
                      Výuka pokračuje pracovním listem, diskuzí nebo návratem k záznamu.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* JAK TO FUNGUJE */}
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-6 py-14 sm:px-8 lg:px-10 lg:py-20">
            <div className="mx-auto max-w-3xl text-center">
              <div className="inline-flex items-center rounded-full bg-slate-100 px-4 py-1 text-sm font-semibold text-slate-700">
                Jak to funguje
              </div>
              <h2 className="mt-5 text-4xl font-extrabold tracking-[-0.04em] text-slate-900 sm:text-5xl">
                Jednoduchý model, který škola zvládne hned
              </h2>
              <p className="mt-6 text-lg leading-8 text-slate-600">
                Nejde o další složitý systém. Jde o připravený program, který se snadno zapojí do běžné výuky a přináší do školy skutečné lidi, skutečná témata a skutečné souvislosti.
              </p>
            </div>

            <div className="mt-12 grid gap-8 lg:grid-cols-3">
              <article className="overflow-hidden rounded-[30px] border border-slate-200 bg-[#f8fafc] shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
                <img
                  src={onlineImg}
                  alt="Živý host na obrazovce"
                  className="h-64 w-full object-cover"
                />
                <div className="p-7">
                  <div className="text-sm font-bold text-emerald-700">1</div>
                  <h3 className="mt-3 text-2xl font-bold tracking-[-0.02em] text-slate-900">
                    Živý host přímo ve třídě
                  </h3>
                  <p className="mt-4 text-base leading-8 text-slate-600">
                    Škola se připojí k živému vstupu a děti se setkají s odborníkem, autorem nebo člověkem z reálné praxe.
                  </p>
                </div>
              </article>

              <article className="overflow-hidden rounded-[30px] border border-slate-200 bg-[#f8fafc] shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
                <img
                  src={lessonImg}
                  alt="Žáci ve třídě sledují vysílání"
                  className="h-64 w-full object-cover"
                />
                <div className="p-7">
                  <div className="text-sm font-bold text-emerald-700">2</div>
                  <h3 className="mt-3 text-2xl font-bold tracking-[-0.02em] text-slate-900">
                    Žáci sledují a reagují
                  </h3>
                  <p className="mt-4 text-base leading-8 text-slate-600">
                    Výuka není pasivní. Děti se zapojují, sledují, přemýšlejí a pracují s tématem přímo ve třídě.
                  </p>
                </div>
              </article>

              <article className="overflow-hidden rounded-[30px] border border-slate-200 bg-[#f8fafc] shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
                <img
                  src={classroomImg}
                  alt="Učebna ARCHIMEDES"
                  className="h-64 w-full object-cover"
                />
                <div className="p-7">
                  <div className="text-sm font-bold text-emerald-700">3</div>
                  <h3 className="mt-3 text-2xl font-bold tracking-[-0.02em] text-slate-900">
                    Návaznost do výuky i komunity
                  </h3>
                  <p className="mt-4 text-base leading-8 text-slate-600">
                    Škola má k dispozici pracovní listy, návaznost do výuky i možnost vracet se k tématům v archivu.
                  </p>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* PŘÍNOSY */}
        <section className="border-b border-slate-200">
          <div className="mx-auto max-w-7xl px-6 py-14 sm:px-8 lg:px-10 lg:py-20">
            <div className="max-w-3xl">
              <div className="inline-flex items-center rounded-full bg-slate-100 px-4 py-1 text-sm font-semibold text-slate-700">
                Co to přináší
              </div>
              <h2 className="mt-5 text-4xl font-extrabold tracking-[-0.04em] text-slate-900 sm:text-5xl">
                Program, který dává hodnotu škole i obci
              </h2>
            </div>

            <div className="mt-12 grid gap-6 lg:grid-cols-3">
              {benefits.map((item) => (
                <article
                  key={item.title}
                  className="rounded-[28px] border border-slate-200 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <h3 className="text-2xl font-bold tracking-[-0.02em] text-slate-900">
                    {item.title}
                  </h3>
                  <p className="mt-4 text-base leading-8 text-slate-600">
                    {item.text}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* DŮVĚRA */}
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-6 py-14 sm:px-8 lg:px-10 lg:py-20">
            <div className="overflow-hidden rounded-[34px] bg-[#0d1b44] px-7 py-8 text-white shadow-[0_22px_60px_rgba(15,23,42,0.18)] sm:px-10 sm:py-10 lg:px-12 lg:py-12">
              <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
                <div>
                  <div className="inline-flex items-center rounded-full bg-white/10 px-4 py-1 text-sm font-semibold text-white/90">
                    Ověřeno v praxi
                  </div>
                  <h2 className="mt-5 text-4xl font-extrabold tracking-[-0.04em] text-white sm:text-5xl">
                    ARCHIMEDES už funguje v desítkách škol a obcí
                  </h2>
                  <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-200">
                    Nejde o teorii. Jde o model, který je možné ukázat v provozu a který už má za sebou konkrétní zkušenosti z terénu.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
                  <div className="rounded-[24px] bg-white/10 p-5">
                    <div className="text-3xl font-extrabold">20+</div>
                    <div className="mt-2 text-sm text-slate-200">míst v síti ARCHIMEDES</div>
                  </div>
                  <div className="rounded-[24px] bg-white/10 p-5">
                    <div className="text-3xl font-extrabold">živě</div>
                    <div className="mt-2 text-sm text-slate-200">pro školy i komunitu</div>
                  </div>
                  <div className="rounded-[24px] bg-white/10 p-5">
                    <div className="text-3xl font-extrabold">reálně</div>
                    <div className="mt-2 text-sm text-slate-200">ověřeno ve výuce</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section>
          <div className="mx-auto max-w-7xl px-6 py-14 sm:px-8 lg:px-10 lg:py-20">
            <div className="overflow-hidden rounded-[34px] bg-white px-7 py-8 shadow-[0_18px_50px_rgba(15,23,42,0.08)] sm:px-10 sm:py-10 lg:px-12 lg:py-12">
              <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
                <div>
                  <div className="inline-flex items-center rounded-full bg-slate-100 px-4 py-1 text-sm font-semibold text-slate-700">
                    Chcete živý program ve vlastní škole?
                  </div>
                  <h2 className="mt-5 text-4xl font-extrabold tracking-[-0.04em] text-slate-900 sm:text-5xl">
                    Podívejte se na ARCHIMEDES Live v praxi
                  </h2>
                  <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
                    Prohlédněte si ukázkovou hodinu nebo si domluvte DEMO. Uvidíte, jak může ARCHIMEDES Live fungovat přímo u vás.
                  </p>
                </div>

                <div className="flex flex-col gap-4 lg:items-end">
                  <div className="flex flex-col gap-4 sm:flex-row lg:flex-col lg:w-full">
                    <Link
                      href="/program#ukazky-vysilani"
                      className="inline-flex items-center justify-center rounded-2xl bg-[#0d1b44] px-7 py-4 text-lg font-semibold text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-xl"
                    >
                      Ukázková hodina
                    </Link>

                    <Link
                      href="/demo"
                      className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-7 py-4 text-lg font-semibold text-slate-900 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-slate-900 hover:shadow-xl"
                    >
                      Chci DEMO
                    </Link>
                  </div>

                  <div className="text-sm text-slate-500">
                    bez závazku • online nebo přímo ve škole
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}
