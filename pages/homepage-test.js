import Head from "next/head";
import Link from "next/link";

const monthlyProgram = [
  {
    title: "Živé vysílání pro I. stupeň ZŠ",
    text: "příroda, svět kolem nás, zvířata, věda a objevování",
  },
  {
    title: "Živé vysílání pro II. stupeň ZŠ",
    text: "souvislosti, profese, společnost, technologie a aktuální témata",
  },
  {
    title: "Wellbeing program pro žáky",
    text: "duševní pohoda, vztahy, motivace a práce se stresem",
  },
  {
    title: "Kariérní poradenství jinak",
    text: "rozhovory s lidmi z praxe a ukázky reálných profesí",
  },
  {
    title: "Čtenářský klub Magnesia Litera",
    text: "knihy, autoři, příběhy a práce s textem",
  },
  {
    title: "Rozhovory s hosty v angličtině",
    text: "živá angličtina v reálném kontextu",
  },
  {
    title: "Vysílání přímo z vaší školy",
    text: "možnost zapojit školu do programu ARCHIMEDES Live",
  },
];

const lessonSteps = [
  {
    title: "1. Učitel vybere téma",
    text: "Vybere vysílání podle ročníku, předmětu nebo aktuální potřeby školy.",
  },
  {
    title: "2. Pustí ho ve třídě",
    text: "Bez instalace a složité přípravy. Stačí interaktivní tabule nebo projektor.",
  },
  {
    title: "3. Žáci pracují s obsahem",
    text: "Téma navazuje na reálný svět, hosta, příběh nebo pracovní list.",
  },
];

export default function HomepageTest() {
  return (
    <>
      <Head>
        <title>ARCHIMEDES Live | Program pro školy</title>
        <meta
          name="description"
          content="ARCHIMEDES Live je živý vzdělávací program pro školy. Přináší dětem reálný svět do výuky formou živých vysílání, hostů, pracovních listů a konkrétních témat."
        />
      </Head>

      <main className="min-h-screen bg-[#f7f4ee] text-slate-900">
        {/* HERO */}
        <section className="mx-auto max-w-7xl px-5 py-8 md:px-8 md:py-14">
          <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <div className="mb-5 inline-flex rounded-full bg-white px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm">
                ARCHIMEDES Live pro základní školy
              </div>

              <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight md:text-6xl">
                Pusťte dětem výuku z reálného světa během jedné hodiny
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-700">
                Žáci často nevidí, k čemu jim škola bude v životě dobrá.
                ARCHIMEDES Live jim ukazuje reálný svět, inspirativní hosty,
                profese, přírodu, vědu i témata z praxe.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/start"
                  className="rounded-2xl bg-emerald-600 px-6 py-4 text-center text-base font-bold text-white shadow-md transition hover:bg-emerald-700"
                >
                  Začít s balíčkem START
                </Link>

                <Link
                  href="/program"
                  className="rounded-2xl border border-slate-300 bg-white px-6 py-4 text-center text-base font-bold text-slate-900 shadow-sm transition hover:bg-slate-50"
                >
                  Zobrazit program
                </Link>
              </div>

              <p className="mt-5 text-sm text-slate-600">
                Bez složité přípravy. Bez instalace. Funguje na každé
                interaktivní tabuli.
              </p>
            </div>

            <div className="relative">
              <div className="overflow-hidden rounded-[2rem] bg-white shadow-xl">
                <img
                  src="/ucebna-exterier.webp"
                  alt="ARCHIMEDES Live ve škole"
                  className="h-[300px] w-full object-cover sm:h-[420px] lg:h-[520px]"
                />
              </div>

              <div className="mt-5 rounded-3xl bg-white p-5 shadow-lg lg:absolute lg:bottom-6 lg:left-6 lg:right-6 lg:mt-0">
                <p className="text-sm font-semibold text-emerald-700">
                  Akční nabídka START
                </p>
                <p className="mt-1 text-3xl font-bold">4 990 Kč bez DPH</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Přístup pro celou školu do 31. 12. 2026. Na každou
                  interaktivní tabuli, bez omezení počtu tříd.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* BENEFITS */}
        <section className="bg-white py-12 md:py-16">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-3xl bg-[#f7f4ee] p-6">
                <h3 className="text-lg font-bold">Stačí pustit</h3>
                <p className="mt-3 leading-7 text-slate-700">
                  Učitel nemusí nic složitě připravovat. Vybere vysílání,
                  pustí ho ve třídě a pracuje s připraveným tématem.
                </p>
              </div>

              <div className="rounded-3xl bg-[#f7f4ee] p-6">
                <h3 className="text-lg font-bold">Reálný svět ve výuce</h3>
                <p className="mt-3 leading-7 text-slate-700">
                  Zoo Praha, věda, příroda, profese, podnikání, angličtina,
                  wellbeing i rozhovory s odborníky.
                </p>
              </div>

              <div className="rounded-3xl bg-[#f7f4ee] p-6">
                <h3 className="text-lg font-bold">Pro celou školu</h3>
                <p className="mt-3 leading-7 text-slate-700">
                  Jedna licence platí pro celou školu. Program může využívat
                  více tříd, učitelů i interaktivních tabulí.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* MONTHLY PROGRAM */}
        <section className="py-12 md:py-16">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <div className="grid items-start gap-10 lg:grid-cols-[0.8fr_1.2fr]">
              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-emerald-700">
                  Měsíční program
                </p>
                <h2 className="mt-3 text-3xl font-bold md:text-4xl">
                  Co získá vaše škola každý měsíc
                </h2>
                <p className="mt-5 text-lg leading-8 text-slate-700">
                  Každý měsíc máte připravené konkrétní hodiny, které můžete
                  rovnou pustit ve třídě – bez přípravy, bez instalace.
                </p>
              </div>

              <div className="rounded-[2rem] bg-white p-5 shadow-lg md:p-8">
                <div className="grid gap-4 sm:grid-cols-2">
                  {monthlyProgram.map((item) => (
                    <div
                      key={item.title}
                      className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
                    >
                      <h3 className="text-base font-bold text-slate-900">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {item.text}
                      </p>
                    </div>
                  ))}
                </div>

                <p className="mt-6 rounded-2xl bg-emerald-50 p-4 text-sm font-bold leading-6 text-emerald-800">
                  Stačí pustit. Jedna licence pro celou školu, bez omezení
                  počtu tříd.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ONE LESSON */}
        <section className="bg-white py-12 md:py-16">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-bold uppercase tracking-wider text-emerald-700">
                Jak to funguje ve škole
              </p>
              <h2 className="mt-3 text-3xl font-bold md:text-4xl">
                Jak vypadá jedna hodina s ARCHIMEDES Live
              </h2>
              <p className="mt-5 text-lg leading-8 text-slate-700">
                Program je postavený tak, aby ho škola mohla jednoduše zařadit
                do běžné výuky.
              </p>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {lessonSteps.map((step) => (
                <div
                  key={step.title}
                  className="rounded-3xl bg-[#f7f4ee] p-6 shadow-sm"
                >
                  <h3 className="text-lg font-bold">{step.title}</h3>
                  <p className="mt-3 leading-7 text-slate-700">{step.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PROGRAM IMAGE */}
        <section className="py-12 md:py-16">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <div className="grid items-center gap-10 lg:grid-cols-2">
              <div className="overflow-hidden rounded-[2rem] bg-white shadow-lg">
                <img
                  src="/program.jpg"
                  alt="Aktuální program ARCHIMEDES Live"
                  className="h-auto w-full object-cover"
                />
              </div>

              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-emerald-700">
                  Konkrétní témata
                </p>
                <h2 className="mt-3 text-3xl font-bold md:text-4xl">
                  Co děti skutečně uvidí ve výuce
                </h2>
                <p className="mt-5 text-lg leading-8 text-slate-700">
                  Každé vysílání má jasné téma, hosta nebo příběh. Děti se
                  nepotkávají jen s teorií, ale s lidmi, místy a situacemi,
                  které dávají škole smysl.
                </p>

                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/program"
                    className="rounded-2xl bg-slate-900 px-6 py-4 text-center font-bold text-white transition hover:bg-slate-800"
                  >
                    Zobrazit program
                  </Link>

                  <Link
                    href="/start"
                    className="rounded-2xl border border-slate-300 bg-white px-6 py-4 text-center font-bold text-slate-900 transition hover:bg-slate-50"
                  >
                    Začít s balíčkem START
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="bg-white py-12 md:py-16">
          <div className="mx-auto max-w-5xl px-5 text-center md:px-8">
            <h2 className="text-3xl font-bold md:text-4xl">
              Připojte školu do programu ARCHIMEDES Live
            </h2>
            <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-slate-700">
              Balíček START je jednoduchý způsob, jak si program vyzkoušet ve
              škole do konce roku 2026.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/start"
                className="rounded-2xl bg-emerald-600 px-8 py-4 text-center text-base font-bold text-white shadow-md transition hover:bg-emerald-700"
              >
                Začít s balíčkem START
              </Link>

              <Link
                href="/program"
                className="rounded-2xl border border-slate-300 bg-white px-8 py-4 text-center text-base font-bold text-slate-900 shadow-sm transition hover:bg-slate-50"
              >
                Zobrazit program
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
