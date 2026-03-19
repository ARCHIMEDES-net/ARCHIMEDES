import Head from "next/head";
import Link from "next/link";
import Footer from "../components/Footer";

const heroImg = "/IMG_0228_hero.webp";
const panelImg = "/DJI_20260202_100827_288_content.webp";
const classImg = "/DJI_20260202_104516_998_content.webp";

export default function HomePage() {
  return (
    <>
      <Head>
        <title>ARCHIMEDES Live</title>
        <meta
          name="description"
          content="ARCHIMEDES Live přináší živý program do výuky škol a komunit."
        />
      </Head>

      <main className="bg-white text-slate-900">
        {/* HERO */}
        <section className="border-b border-slate-200 bg-gradient-to-b from-slate-50 via-white to-white">
          <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-10 lg:py-20">
            <div className="grid items-center gap-10 lg:grid-cols-2">
              
              {/* TEXT */}
              <div>
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                  ARCHIMEDES Live přináší
                  <br />
                  <span className="text-emerald-600">živý program do výuky</span>
                </h1>

                <p className="mt-6 text-lg leading-8 text-slate-600">
                  Žáci sledují živé vstupy odborníků, pracují s tématem a
                  zapojují se do výuky jinak než dříve.
                </p>

                {/* CTA tlačítka */}
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

                  <Link
                    href="/aktualni-pozvanky"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-300 bg-emerald-50 px-6 py-3 text-base font-semibold text-emerald-800 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-emerald-500 hover:bg-emerald-100 hover:shadow-lg"
                  >
                    <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    Co se chystá teď
                  </Link>
                </div>
              </div>

              {/* IMAGE */}
              <div className="relative">
                <img
                  src={heroImg}
                  alt="ARCHIMEDES učebna"
                  className="w-full rounded-[28px] object-cover shadow-xl"
                />
              </div>
            </div>
          </div>
        </section>

        {/* OBSAH */}
        <section className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-10 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-2">
            <img
              src={panelImg}
              alt="Výuka"
              className="rounded-[28px] shadow-lg"
            />

            <div>
              <h2 className="text-3xl font-bold sm:text-4xl">
                Jak vypadá jedna hodina
              </h2>

              <p className="mt-6 text-lg text-slate-600">
                Jedna třída, jeden vstup, jeden pracovní list. 
                Výuka, která dává smysl a zapojuje žáky.
              </p>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}
