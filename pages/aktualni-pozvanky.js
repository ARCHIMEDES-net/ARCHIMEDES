import Head from "next/head";
import Link from "next/link";
import Footer from "../components/Footer";

const invites = [
  {
    title: "Pozvánka 1",
    topic: "Osobní pozvánka hosta do vysílání",
    audience: "pro školy a žáky",
    href: "https://www.instagram.com/p/DVvUBXDCMYC/",
    embed: "https://www.instagram.com/p/DVvUBXDCMYC/embed",
  },
  {
    title: "Pozvánka 2",
    topic: "Osobní pozvánka hosta do vysílání",
    audience: "pro školy a žáky",
    href: "https://www.instagram.com/p/DVyqPmiiLKF/",
    embed: "https://www.instagram.com/p/DVyqPmiiLKF/embed",
  },
  {
    title: "Pozvánka 3",
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
          content="Podívejte se na aktuální pozvánky od hostů, kteří vstupují do výuky v rámci ARCHIMEDES Live."
        />
      </Head>

      <main className="min-h-screen bg-white text-slate-900">
        <section className="border-b border-slate-200 bg-gradient-to-b from-slate-50 via-white to-white">
          <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-10 lg:py-20">
            <div className="max-w-3xl">
              <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1 text-sm font-semibold text-emerald-700">
                Aktuální pozvánky
              </span>

              <h1 className="mt-6 max-w-4xl text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                Hosté, kteří vstupují do výuky
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
                Každé vysílání ARCHIMEDES Live začíná osobní pozvánkou od
                člověka z praxe. Podívejte se, koho zveme právě teď a jak
                může výuka získat nový impulz, nové téma a novou energii.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
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

        <section className="mx-auto max-w-7xl px-6 py-14 sm:px-8 lg:px-10 lg:py-18">
          <div className="mb-8 max-w-3xl">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Koho zveme právě teď
            </h2>
            <p className="mt-4 text-lg leading-8 text-slate-600">
              Aktuální pozvánky od hostů, kteří vstupují přímo do výuky.
              Každá z nich otevírá téma, které může žáky vtáhnout do diskuze,
              přemýšlení i další práce ve třídě.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
            {invites.map((item) => (
              <article
                key={item.href}
                className="group overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="border-b border-slate-100 bg-slate-50 px-6 py-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        {item.topic}
                      </p>
                    </div>

                    <span className="inline-flex shrink-0 items-center rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-rose-600">
                      pozvánka
                    </span>
                  </div>
                </div>

                <div className="bg-white px-4 pt-4">
                  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
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
                  <div className="space-y-2">
                    <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
                      Pro koho
                    </p>
                    <p className="text-base text-slate-700">{item.audience}</p>
                  </div>

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                    >
                      Otevřít na Instagramu
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
            <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                  Nejde o další video.
                </h2>
                <p className="mt-5 text-lg leading-8 text-slate-600">
                  Žáci se setkávají s lidmi, kteří svou práci skutečně dělají
                  a mluví o ní otevřeně, srozumitelně a bez učebnic. Právě to
                  dává vysílání ARCHIMEDES Live energii, autenticitu a
                  schopnost vtáhnout třídu do tématu.
                </p>
                <p className="mt-4 text-lg leading-8 text-slate-600">
                  Osobní pozvánka od hosta není jen upoutávka. Je to první
                  moment, kdy si škola dokáže představit, jak může taková
                  hodina vypadat ve skutečné výuce.
                </p>
              </div>

              <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
                <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
                  Pro školy a vedení
                </p>
                <h3 className="mt-3 text-2xl font-bold text-slate-900">
                  Co tím škola získává
                </h3>
                <ul className="mt-6 space-y-4 text-slate-700">
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
          <div className="overflow-hidden rounded-[32px] bg-slate-900 px-6 py-10 text-white shadow-xl sm:px-10 lg:px-12 lg:py-12">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">
                Další krok
              </p>
              <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                Podívejte se, jak vypadá celá hodina
              </h2>
              <p className="mt-5 text-lg leading-8 text-slate-200">
                Pozvánka je začátek. Vyberte si ukázkové vysílání a uvidíte,
                jak ARCHIMEDES Live zapadá přímo do výuky a jak může fungovat
                i u vás.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/program"
                  className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3 text-base font-semibold text-slate-900 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                >
                  Ukázková hodina
                </Link>

                <Link
                  href="/poptavka"
                  className="inline-flex items-center justify-center rounded-2xl border border-white/20 bg-white/10 px-6 py-3 text-base font-semibold text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-white/15 hover:shadow-lg"
                >
                  Chci DEMO
                </Link>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}
