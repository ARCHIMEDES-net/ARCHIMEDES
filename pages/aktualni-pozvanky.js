import Head from "next/head";
import Link from "next/link";
import Footer from "../components/Footer";

const invites = [
  {
    title: "Pozvánka",
    topic: "Osobní pozvánka hosta do vysílání",
    audience: "pro školy a žáky",
    href: "https://www.instagram.com/p/DVvUBXDCMYC/",
    embed: "https://www.instagram.com/p/DVvUBXDCMYC/embed",
  },
  {
    title: "Pozvánka",
    topic: "Osobní pozvánka hosta do vysílání",
    audience: "pro školy a žáky",
    href: "https://www.instagram.com/p/DVyqPmiiLKF/",
    embed: "https://www.instagram.com/p/DVyqPmiiLKF/embed",
  },
  {
    title: "Pozvánka",
    topic: "Osobní pozvánka hosta do vysílání",
    audience: "pro školy a žáky",
    href: "https://www.instagram.com/p/DVqEttcjpu0/",
    embed: "https://www.instagram.com/p/DVqEttcjpu0/embed",
  },
];

export default function AktualniPozvankyPage() {
  return (
    <>
      <Head>
        <title>Aktuální pozvánky | ARCHIMEDES Live</title>
        <meta
          name="description"
          content="Podívejte se, co se chystá v ARCHIMEDES Live. Aktuální pozvánky od hostů, kteří vstupují do výuky."
        />
      </Head>

      <main className="min-h-screen bg-white text-slate-900">
        <section className="border-b border-slate-200 bg-gradient-to-b from-slate-50 via-white to-white">
          <div className="mx-auto max-w-7xl px-6 py-12 sm:px-8 lg:px-10 lg:py-14">
            <div className="max-w-3xl">
              <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1 text-sm font-semibold text-emerald-700">
                Aktuální pozvánky
              </span>

              <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">
                Co se chystá teď
              </h1>

              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
                Podívejte se na aktuální pozvánky od hostů, kteří vstupují přímo
                do výuky.
              </p>

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
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-10 sm:px-8 lg:px-10 lg:py-12">
          <div className="mb-6 max-w-3xl">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Aktuální pozvánky od hostů
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
                    Osobní pozvánka hosta
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
            <div className="max-w-3xl">
              <h2 className="text-3xl font-bold sm:text-4xl">
                Nejde o další video
              </h2>

              <p className="mt-6 text-lg leading-8 text-slate-600">
                Žáci se setkávají s lidmi, kteří svou práci skutečně dělají.
                Mluví otevřeně, srozumitelně a bez učebnic.
              </p>

              <p className="mt-4 text-lg leading-8 text-slate-600">
                Právě osobní pozvánka od hosta vytváří první moment, kdy si škola
                dokáže představit, jak může taková hodina fungovat ve skutečné výuce.
              </p>
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
      </main>
    </>
  );
}
