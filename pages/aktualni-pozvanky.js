import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import Footer from "../components/Footer";

const invites = [
  {
    title: "Pozvánka",
    href: "https://www.instagram.com/p/DVvUBXDCMYC/",
    embed: "https://www.instagram.com/p/DVvUBXDCMYC/embed",
  },
  {
    title: "Pozvánka",
    href: "https://www.instagram.com/p/DVyqPmiiLKF/",
    embed: "https://www.instagram.com/p/DVyqPmiiLKF/embed",
  },
  {
    title: "Pozvánka",
    href: "https://www.instagram.com/p/DVqEttcjpu0/",
    embed: "https://www.instagram.com/p/DVqEttcjpu0/embed",
  },
];

export default function AktualniPozvankyPage() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Head>
        <title>Aktuální pozvánky | ARCHIMEDES Live</title>
        <meta
          name="description"
          content="Podívejte se, co se chystá v ARCHIMEDES Live. Aktuální pozvánky od hostů a přehled programu."
        />
      </Head>

      <main className="min-h-screen bg-white text-slate-900">
        <section className="border-b border-slate-200 bg-gradient-to-b from-slate-50 via-white to-white">
          <div className="mx-auto max-w-7xl px-6 py-10 sm:px-8 lg:px-10 lg:py-12">
            <div className="grid items-start gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10">
              <div className="max-w-3xl">
                <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1 text-sm font-semibold text-emerald-700">
                  Aktuální pozvánky
                </span>

                <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                  Co se chystá teď
                </h1>

                <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
                  Podívejte se na aktuální pozvánky od hostů, kteří vstupují
                  přímo do výuky.
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
                    wellbeing
                  </span>
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
                    kariérní poradenství
                  </span>
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
                    čtenářské kluby
                  </span>
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
                    inspirativní hosté
                  </span>
                </div>

                <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
                  <Link
                    href="/program"
                    className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-6 py-3 text-base font-semibold text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    Ukázková hodina
                  </Link>

                  <Link
                    href="/poptavka"
                    className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-6 py-3 text-base font-semibold text-slate-900 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-slate-900 hover:shadow-lg"
                  >
                    Chci DEMO
                  </Link>
                </div>
              </div>

              <div className="lg:pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(true)}
                  className="group block w-full overflow-hidden rounded-[24px] border border-slate-200 bg-white text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="relative">
                    <img
                      src="/program-aktualni.webp"
                      alt="Aktuální program ARCHIMEDES Live"
                      className="h-[240px] w-full object-cover object-top"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 via-transparent to-transparent opacity-90" />

                    <div className="absolute left-4 top-4">
                      <span className="inline-flex items-center rounded-full bg-white/92 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-800 shadow-sm">
                        Aktuální program
                      </span>
                    </div>

                    <div className="absolute bottom-4 right-4">
                      <span className="inline-flex items-center rounded-full bg-white/92 px-3 py-1 text-sm font-semibold text-slate-900 shadow-sm transition duration-200 group-hover:text-emerald-700">
                        Zobrazit větší
                      </span>
                    </div>
                  </div>

                  <div className="px-5 py-4">
                    <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
                      Program tohoto období
                    </p>
                    <p className="mt-1 text-base font-semibold text-slate-900">
                      Přehled vysílání a témat
                    </p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
          <div className="mb-5">
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
              Pozvánky od hostů
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Aktuální videopozvánky
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
            {invites.map((item) => (
              <article
                key={item.href}
                className="group overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="bg-white px-4 pt-4">
                  <div className="overflow-hidden rounded-2xl border border-slate-200">
                    <iframe
                      title={item.title}
                      src={item.embed}
                      className="h-[620px] w-full"
                      frameBorder="0"
                      scrolling="no"
                      allowTransparency="true"
                    />
                  </div>
                </div>

                <div className="px-6 py-6">
                  <p className="text-sm text-slate-500">
                    Osobní pozvánka hosta do vysílání
                  </p>

                  <div className="mt-6 flex flex-col gap-3">
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                    >
                      Zobrazit celé video
                    </a>

                    <Link
                      href="/poptavka"
                      className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-slate-900 hover:shadow-lg"
                    >
                      Chci DEMO
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="border-y border-slate-200 bg-slate-50">
          <div className="mx-auto max-w-7xl px-6 py-14 sm:px-8 lg:px-10 lg:py-18">
            <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
              <div className="max-w-3xl">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                  Nejde o další video
                </h2>

                <p className="mt-6 text-lg leading-8 text-slate-600">
                  Žáci se setkávají s lidmi, kteří svou práci skutečně dělají.
                  Mluví otevřeně, srozumitelně a bez učebnic.
                </p>

                <p className="mt-4 text-lg leading-8 text-slate-600">
                  Právě osobní pozvánka od hosta vytváří první moment, kdy si
                  škola dokáže představit, jak může taková hodina fungovat ve
                  skutečné výuce.
                </p>
              </div>

              <div className="rounded-[28px] border border-slate-200 bg-white p-7 shadow-sm">
                <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
                  Co tím škola získává
                </p>

                <ul className="mt-5 space-y-4 text-slate-700">
                  <li>• osobní kontakt žáků s inspirativními hosty</li>
                  <li>• živé téma, které otevírá diskuzi ve třídě</li>
                  <li>• konkrétní obsah bez složité přípravy učitele</li>
                  <li>• propojení výuky s reálným světem a praxí</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-10 lg:py-20">
          <div className="rounded-[32px] bg-slate-900 px-6 py-10 text-white shadow-xl sm:px-10 lg:px-12">
            <h2 className="text-3xl font-bold sm:text-4xl">
              Podívejte se, jak vypadá celá hodina
            </h2>

            <p className="mt-5 text-lg text-slate-200">
              Pozvánka je začátek. Vyberte si ukázkové vysílání a uvidíte,
              jak ARCHIMEDES Live zapadá přímo do výuky.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/program"
                className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3 font-semibold text-slate-900 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                Ukázková hodina
              </Link>

              <Link
                href="/poptavka"
                className="inline-flex items-center justify-center rounded-2xl border border-white/20 bg-white/10 px-6 py-3 font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-white/20 hover:shadow-lg"
              >
                Chci DEMO
              </Link>
            </div>
          </div>
        </section>

        <Footer />

        {isOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 px-4 py-6"
            onClick={() => setIsOpen(false)}
          >
            <div
              className="relative max-h-[92vh] w-full max-w-4xl overflow-auto rounded-[28px] bg-white p-3 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-xl font-bold text-slate-900 shadow-md transition hover:bg-slate-100"
                aria-label="Zavřít"
              >
                ×
              </button>

              <img
                src="/program-aktualni.webp"
                alt="Aktuální program ARCHIMEDES Live"
                className="h-auto w-full rounded-[20px]"
              />
            </div>
          </div>
        )}
      </main>
    </>
  );
}
