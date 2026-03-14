import Link from "next/link";
import Head from "next/head";

export default function FinancovaniSkolyPage() {
  return (
    <>
      <Head>
        <title>Financování programu pro školy | ARCHIMEDES Live</title>
        <meta
          name="description"
          content="Jak může škola využít program ARCHIMEDES Live v aktivitách financovaných z projektu Šablony OP JAK."
        />
      </Head>

      <main className="min-h-screen bg-white text-slate-900">

        {/* HERO */}

        <section className="border-b border-slate-200 bg-gradient-to-b from-slate-50 to-white">
          <div className="mx-auto max-w-7xl px-6 py-16 md:px-8">

            <div className="grid items-center gap-12 lg:grid-cols-2">

              <div>

                <div className="mb-4 inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-4 py-1 text-sm font-semibold text-blue-700">
                  Informace pro ředitele škol
                </div>

                <h1 className="text-4xl font-bold md:text-5xl leading-tight">
                  Jak může škola využít ARCHIMEDES Live v rámci projektu OP JAK
                </h1>

                <p className="mt-6 text-lg leading-8 text-slate-700">
                  ARCHIMEDES Live přináší do výuky inspirativní hosty, živé diskuse
                  a tematické vzdělávací programy pro žáky. Program je připraven tak,
                  aby jeho využití bylo pro školu jednoduché a dobře zapadalo
                  do aktivit realizovaných v projektech <strong>Šablony OP JAK</strong>.
                </p>

                <p className="mt-4 text-lg leading-8 text-slate-700">
                  V praxi může škola program využít například jako součást
                  <strong> inovativního vzdělávání žáků </strong>
                  nebo při zapojení <strong>externích odborníků do výuky</strong>.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">

                  <Link
                    href="/poptavka"
                    className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-6 py-3 text-base font-semibold text-white hover:bg-slate-800 transition"
                  >
                    Domluvit ukázkovou hodinu
                  </Link>

                  <Link
                    href="/program"
                    className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-6 py-3 text-base font-semibold text-slate-700 hover:bg-slate-50 transition"
                  >
                    Zpět na program
                  </Link>

                </div>

              </div>

              <div className="overflow-hidden rounded-3xl border border-slate-200 shadow-xl">

                <img
                  src="/sab7.jpeg"
                  alt="Výuka v učebně ARCHIMEDES"
                  className="w-full h-full object-cover"
                />

              </div>

            </div>

          </div>
        </section>

        {/* HLAVNÍ ARGUMENTY */}

        <section className="mx-auto max-w-7xl px-6 py-16 md:px-8">

          <div className="grid gap-6 md:grid-cols-3">

            <div className="rounded-2xl border border-slate-200 p-6">

              <h3 className="text-xl font-semibold">
                Jednoduché využití ve výuce
              </h3>

              <p className="mt-3 text-slate-700">
                Učitel pouze pustí vysílání ve třídě na interaktivním panelu
                nebo počítači. Program je připraven tak, aby byl okamžitě
                využitelný v běžné školní výuce.
              </p>

            </div>

            <div className="rounded-2xl border border-slate-200 p-6">

              <h3 className="text-xl font-semibold">
                Atraktivní program pro žáky
              </h3>

              <p className="mt-3 text-slate-700">
                Žáci sledují inspirativní hosty z různých oborů,
                diskutují o tématech a navazují na vysílání
                pomocí pracovních listů.
              </p>

            </div>

            <div className="rounded-2xl border border-slate-200 p-6">

              <h3 className="text-xl font-semibold">
                Minimální administrativní zátěž
              </h3>

              <p className="mt-3 text-slate-700">
                Program je připraven tak, aby jeho využití bylo pro školu
                organizačně jednoduché a dobře zapadalo do běžné
                realizace aktivit projektu OP JAK.
              </p>

            </div>

          </div>

        </section>

        {/* OP JAK */}

        <section className="bg-slate-50">

          <div className="mx-auto max-w-7xl px-6 py-16 md:px-8">

            <div className="grid gap-12 lg:grid-cols-2 items-center">

              <div>

                <h2 className="text-3xl font-bold">
                  Využití programu v rámci Šablon OP JAK
                </h2>

                <p className="mt-4 text-lg text-slate-700 leading-8">
                  Program ARCHIMEDES Live může škola využívat
                  jako součást aktivit realizovaných v projektu
                  <strong> Šablony OP JAK</strong>.
                </p>

                <p className="mt-4 text-lg text-slate-700 leading-8">
                  Program přirozeně zapadá zejména do aktivit
                  zaměřených na:
                </p>

                <ul className="mt-6 space-y-4 text-slate-700">

                  <li>
                    • inovativní vzdělávání žáků
                  </li>

                  <li>
                    • zapojení externích odborníků do výuky
                  </li>

                  <li>
                    • rozvoj kompetencí a motivace žáků
                  </li>

                </ul>

                <p className="mt-6 text-slate-700">
                  V praxi může škola využít jednotlivá vysílání
                  například jako tematickou vzdělávací hodinu,
                  projektovou výuku nebo diskusi s odborníkem z praxe.
                </p>

              </div>

              <div className="overflow-hidden rounded-3xl border border-slate-200 shadow-lg">

                <img
                  src="/sab2.webp"
                  alt="Výuka v učebně ARCHIMEDES"
                  className="w-full h-full object-cover"
                />

              </div>

            </div>

          </div>

        </section>

        {/* JAK TO FUNGUJE */}

        <section className="mx-auto max-w-7xl px-6 py-16 md:px-8">

          <div className="text-center max-w-3xl mx-auto">

            <h2 className="text-3xl font-bold">
              Jak to ve škole funguje v praxi
            </h2>

            <p className="mt-4 text-lg text-slate-700">
              Program je navržen tak, aby jeho realizace byla pro školu
              jednoduchá a dobře zapadala do běžného provozu výuky.
            </p>

          </div>

          <div className="mt-12 grid md:grid-cols-3 gap-6">

            <div className="rounded-2xl border border-slate-200 p-6">

              <h3 className="font-semibold text-lg">
                1. Učitel pustí vysílání
              </h3>

              <p className="mt-3 text-slate-700">
                Ve třídě na interaktivním panelu nebo počítači.
              </p>

            </div>

            <div className="rounded-2xl border border-slate-200 p-6">

              <h3 className="font-semibold text-lg">
                2. Žáci sledují hosta
              </h3>

              <p className="mt-3 text-slate-700">
                Diskuse s hostem přináší žákům inspiraci
                a propojení výuky s reálným světem.
              </p>

            </div>

            <div className="rounded-2xl border border-slate-200 p-6">

              <h3 className="font-semibold text-lg">
                3. Práce s pracovním listem
              </h3>

              <p className="mt-3 text-slate-700">
                Třída navazuje na vysílání a pracuje
                s připraveným materiálem.
              </p>

            </div>

          </div>

        </section>

        {/* FOTOGRAFIE */}

        <section className="bg-slate-50">

          <div className="mx-auto max-w-7xl px-6 py-16 md:px-8">

            <div className="text-center max-w-3xl mx-auto">

              <h2 className="text-3xl font-bold">
                Reálná výuka v učebnách ARCHIMEDES
              </h2>

              <p className="mt-4 text-lg text-slate-700">
                Program vzniká ve spolupráci se školami zapojenými
                do sítě ARCHIMEDES a je využíván přímo ve výuce.
              </p>

            </div>

            <div className="mt-10 grid md:grid-cols-3 gap-6">

              <img src="/sab7.jpeg" className="rounded-2xl shadow" />

              <img src="/sab2.webp" className="rounded-2xl shadow" />

              <img src="/sab3.webp" className="rounded-2xl shadow" />

            </div>

          </div>

        </section>

        {/* CTA */}

        <section className="bg-slate-900 text-white">

          <div className="mx-auto max-w-7xl px-6 py-16 md:px-8">

            <div className="grid lg:grid-cols-2 gap-8 items-center">

              <div>

                <h2 className="text-3xl font-bold">
                  Chcete si ověřit, jak by program fungoval ve vaší škole?
                </h2>

                <p className="mt-4 text-slate-300 text-lg">
                  Nejjednodušší je domluvit si krátkou ukázkovou hodinu.
                  Rádi vám ukážeme, jak může program fungovat
                  přímo ve výuce.
                </p>

              </div>

              <div className="flex gap-4">

                <Link
                  href="/poptavka"
                  className="bg-white text-slate-900 px-6 py-3 rounded-xl font-semibold"
                >
                  Domluvit ukázkovou hodinu
                </Link>

                <Link
                  href="/kontakt"
                  className="border border-white px-6 py-3 rounded-xl font-semibold"
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
