import Link from "next/link";
import Head from "next/head";

export default function FinancovaniSkolyPage() {
  return (
    <>
      <Head>
        <title>Financování pro školy | ARCHIMEDES Live</title>
        <meta
          name="description"
          content="Jak může škola využít program ARCHIMEDES Live v aktivitách financovaných z OP JAK."
        />
      </Head>

      <main className="min-h-screen bg-white text-slate-900">
        {/* HERO */}
        <section className="border-b border-slate-200 bg-gradient-to-b from-slate-50 to-white">
          <div className="mx-auto max-w-7xl px-6 py-14 md:px-8 md:py-20">
            <div className="grid items-center gap-10 lg:grid-cols-2">
              <div>
                <div className="mb-4 inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-4 py-1 text-sm font-semibold text-blue-700">
                  Pro ředitele škol
                </div>

                <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
                  Jak může škola jednoduše využít ARCHIMEDES Live v rámci OP JAK
                </h1>

                <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-700">
                  ARCHIMEDES Live přináší do výuky živé vstupy inspirativních hostů,
                  tematické vzdělávací programy a pracovní listy pro žáky. Pro řadu škol
                  je důležité hlavně to, že využití programu je praktické, jednoduché a
                  může zapadat do aktivit financovaných z projektu Šablony OP JAK.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/poptavka"
                    className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-6 py-3 text-base font-semibold text-white transition hover:bg-slate-800"
                  >
                    Domluvit ukázkovou hodinu
                  </Link>

                  <Link
                    href="/program"
                    className="inline-flex items-center justify-center rounded-2xl border border-slate-300 px-6 py-3 text-base font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                  >
                    Zpět na program
                  </Link>
                </div>
              </div>

              <div className="relative">
                <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-xl">
                  <img
                    src="/sab1.webp"
                    alt="Děti sledují výuku v učebně ARCHIMEDES"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* HLAVNÍ SDĚLENÍ */}
        <section className="mx-auto max-w-7xl px-6 py-14 md:px-8">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900">
                Je to reálně použitelné ve škole
              </h2>
              <p className="mt-3 text-slate-700">
                Učitel nemusí nic složitě nastavovat. Stačí pustit vysílání na
                interaktivním panelu nebo počítači a pracovat s připraveným obsahem.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900">
                Pro žáky je to atraktivní
              </h2>
              <p className="mt-3 text-slate-700">
                Děti sledují skutečné hosty, reagují na zajímavá témata a pracují s
                materiály, které rozšiřují běžnou výuku.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900">
                Ředitel vidí jednoduchý model
              </h2>
              <p className="mt-3 text-slate-700">
                Škola získá hotový program bez složité organizace. Právě tato jednoduchost
                je pro vedení školy často rozhodující.
              </p>
            </div>
          </div>
        </section>

        {/* OP JAK */}
        <section className="bg-slate-50">
          <div className="mx-auto max-w-7xl px-6 py-14 md:px-8">
            <div className="grid items-start gap-10 lg:grid-cols-2">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                  Kde program zapadá v rámci OP JAK
                </h2>
                <p className="mt-4 text-lg leading-8 text-slate-700">
                  Program ARCHIMEDES Live může škola využívat jako součást aktivit
                  financovaných z programu <strong>Šablony OP JAK</strong>, protože přináší
                  prvky, které školy běžně zařazují do inovativního vzdělávání a spolupráce
                  s odborníky z praxe.
                </p>

                <div className="mt-8 space-y-4">
                  <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                    <h3 className="font-semibold text-slate-900">
                      Inovativní vzdělávání žáků
                    </h3>
                    <p className="mt-2 text-slate-700">
                      Živé vstupy, tematické hodiny, diskuse a práce s připravenými
                      materiály přinášejí do školy nové formy práce se žáky.
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                    <h3 className="font-semibold text-slate-900">
                      Spolupráce školy s odborníky z praxe
                    </h3>
                    <p className="mt-2 text-slate-700">
                      Do programu vstupují autoři, vědci, podnikatelé a další hosté,
                      kteří žákům otevírají svět mimo běžnou třídu.
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                    <h3 className="font-semibold text-slate-900">
                      Motivace a rozvoj kompetencí žáků
                    </h3>
                    <p className="mt-2 text-slate-700">
                      Program podporuje komunikaci, kritické myšlení, orientaci ve světě
                      i zájem o další studium a profesní směřování.
                    </p>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-7 text-slate-700">
                  Důležité: na webu a v komunikaci doporučujeme používat formulaci, že
                  program <strong>může být využit v aktivitách financovaných z OP JAK</strong>.
                  To je věcně i komunikačně správné.
                </div>
              </div>

              <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-xl">
                <img
                  src="/sab2.webp"
                  alt="Výuka s velkým displejem v učebně ARCHIMEDES"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* JAK JE TO JEDNODUCHÉ */}
        <section className="mx-auto max-w-7xl px-6 py-14 md:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Jak to ve škole funguje v praxi
            </h2>
            <p className="mt-4 text-lg leading-8 text-slate-700">
              Právě jednoduchost je pro školu klíčová. Ředitel i učitel potřebují vědět,
              že zapojení programu nebude znamenat další složitou administrativu ani
              technické komplikace.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 p-6">
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-base font-bold text-white">
                1
              </div>
              <h3 className="text-xl font-semibold text-slate-900">
                Učitel pustí vysílání
              </h3>
              <p className="mt-3 text-slate-700">
                Na interaktivním panelu, velké obrazovce nebo počítači ve třídě.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 p-6">
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-base font-bold text-white">
                2
              </div>
              <h3 className="text-xl font-semibold text-slate-900">
                Žáci sledují hosta a téma
              </h3>
              <p className="mt-3 text-slate-700">
                Program je připraven tak, aby byl srozumitelný, inspirativní a použitelný
                v běžném školním provozu.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 p-6">
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-base font-bold text-white">
                3
              </div>
              <h3 className="text-xl font-semibold text-slate-900">
                Třída pracuje s pracovním listem
              </h3>
              <p className="mt-3 text-slate-700">
                Výuka má jasnou návaznost a učitel dostává hotovou oporu pro další práci.
              </p>
            </div>
          </div>
        </section>

        {/* FOTOGALERIE */}
        <section className="bg-slate-50">
          <div className="mx-auto max-w-7xl px-6 py-14 md:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                Reálná praxe ve škole
              </h2>
              <p className="mt-4 text-lg leading-8 text-slate-700">
                Ředitelé potřebují vidět, že nejde o teoretický koncept, ale o model,
                který už funguje ve skutečném školním prostředí.
              </p>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-3">
              <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
                <img
                  src="/sab1.webp"
                  alt="Děti sledují výuku v učebně ARCHIMEDES"
                  className="h-72 w-full object-cover"
                />
              </div>

              <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
                <img
                  src="/sab2.webp"
                  alt="Výuka přes velký displej v učebně ARCHIMEDES"
                  className="h-72 w-full object-cover"
                />
              </div>

              <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
                <img
                  src="/sab3.webp"
                  alt="Žáci v učebně ARCHIMEDES během programu"
                  className="h-72 w-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="mx-auto max-w-5xl px-6 py-14 md:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Co potřebuje ředitel školy vědět
            </h2>
          </div>

          <div className="mt-10 space-y-4">
            <div className="rounded-3xl border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900">
                Je zavedení programu technicky složité?
              </h3>
              <p className="mt-2 text-slate-700">
                Není. Program je připraven tak, aby jeho spuštění bylo pro školu co
                nejjednodušší. Stačí běžné vybavení, které už školy zpravidla mají.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900">
                Musí škola připravovat vlastní obsah?
              </h3>
              <p className="mt-2 text-slate-700">
                Nemusí. Škola dostává připravený program, hosty i návazné materiály pro
                práci ve třídě.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900">
                Je možné program využít v rámci OP JAK?
              </h3>
              <p className="mt-2 text-slate-700">
                Ano, program může být využit jako součást aktivit financovaných z projektu
                Šablony OP JAK, zejména tam, kde škola realizuje inovativní vzdělávání nebo
                spolupráci s odborníky z praxe.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900">
                Co je pro školu největší výhoda?
              </h3>
              <p className="mt-2 text-slate-700">
                Škola získá atraktivní a hotový program pro žáky bez složité organizace a
                bez vysoké časové zátěže pro učitele.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-slate-900">
          <div className="mx-auto max-w-7xl px-6 py-14 text-white md:px-8">
            <div className="grid items-center gap-8 lg:grid-cols-[1.2fr_0.8fr]">
              <div>
                <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                  Chcete si ověřit, jak by program fungoval právě u vás ve škole?
                </h2>
                <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-300">
                  Nejjednodušší je domluvit si ukázkovou hodinu nebo krátkou konzultaci.
                  Rádi škole vysvětlíme, jak program funguje a jak se dá prakticky využít.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
                <Link
                  href="/poptavka"
                  className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3 text-base font-semibold text-slate-900 transition hover:bg-slate-100"
                >
                  Domluvit ukázkovou hodinu
                </Link>
                <Link
                  href="/kontakt"
                  className="inline-flex items-center justify-center rounded-2xl border border-white/30 px-6 py-3 text-base font-semibold text-white transition hover:bg-white/10"
                >
                  Kontakt
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
