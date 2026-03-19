import Head from "next/head";
import Link from "next/link";
import Footer from "../components/Footer";

const heroImg = "/ucebna.jpg"; // použij nejlepší reálnou fotku!

export default function Home() {
  return (
    <>
      <Head>
        <title>ARCHIMEDES Live</title>
        <meta
          name="description"
          content="Živý vzdělávací program pro školy a obce. Výuka, která dává smysl."
        />
      </Head>

      <main className="bg-white text-slate-900">

        {/* HERO */}
        <section className="relative overflow-hidden">
          <div className="mx-auto max-w-7xl px-6 pt-20 pb-16 grid lg:grid-cols-2 gap-12 items-center">

            {/* TEXT */}
            <div className="max-w-xl">
              <p className="text-sm text-slate-500 mb-4">
                ARCHIMEDES Live pro školy a obce
              </p>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold leading-tight tracking-tight">
                Když škola ožije
              </h1>

              <p className="mt-6 text-lg text-slate-600">
                Živý program s hosty z praxe, pracovními listy a archivem.
                Pro výuku, komunitu i život obce.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link
                  href="/poptavka"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition"
                >
                  Chci ukázku programu
                </Link>

                <Link
                  href="/program"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-xl border border-slate-300 text-sm font-medium hover:bg-slate-50 transition"
                >
                  Prohlédnout program
                </Link>
              </div>

              <p className="mt-6 text-sm text-slate-400">
                Pro školy • obce • komunitní život
              </p>
            </div>

            {/* IMAGE */}
            <div className="relative">
              <img
                src={heroImg}
                alt="ARCHIMEDES učebna"
                className="rounded-2xl w-full h-[420px] object-cover shadow-xl"
              />

              {/* jemný overlay badge */}
              <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur px-4 py-2 rounded-lg text-sm shadow">
                Živá výuka v reálném prostředí
              </div>
            </div>
          </div>
        </section>

        {/* JAK TO FUNGUJE */}
        <section className="py-20 border-t border-slate-100">
          <div className="mx-auto max-w-5xl px-6 text-center">

            <h2 className="text-3xl font-semibold mb-4">
              Jednoduchý princip, který funguje
            </h2>

            <p className="text-slate-600 mb-12">
              Neřešíte nový projekt. Získáte hotový program.
            </p>

            <div className="grid sm:grid-cols-3 gap-8 text-left">
              <div>
                <h3 className="font-semibold mb-2">1 třída</h3>
                <p className="text-sm text-slate-600">
                  Zapojíte běžnou výuku bez složité přípravy.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">1 živý vstup</h3>
                <p className="text-sm text-slate-600">
                  Host z praxe přináší reálný svět do školy.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">1 pracovní list</h3>
                <p className="text-sm text-slate-600">
                  Žáci aktivně pracují s tématem.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* PROGRAM */}
        <section className="py-20 bg-slate-50">
          <div className="mx-auto max-w-6xl px-6">

            <h2 className="text-3xl font-semibold mb-10 text-center">
              Co program přináší
            </h2>

            <div className="grid md:grid-cols-3 gap-8">

              <div className="p-6 bg-white rounded-xl shadow-sm">
                <h3 className="font-semibold mb-2">Pro školu</h3>
                <p className="text-sm text-slate-600">
                  Moderní výuka, hosté z praxe a hotové materiály.
                </p>
              </div>

              <div className="p-6 bg-white rounded-xl shadow-sm">
                <h3 className="font-semibold mb-2">Pro obec</h3>
                <p className="text-sm text-slate-600">
                  Program pro komunitu, seniory a společné aktivity.
                </p>
              </div>

              <div className="p-6 bg-white rounded-xl shadow-sm">
                <h3 className="font-semibold mb-2">Pro lidi</h3>
                <p className="text-sm text-slate-600">
                  Smysluplný obsah, který spojuje generace.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* SOCIAL PROOF / DŮVĚRA */}
        <section className="py-20">
          <div className="mx-auto max-w-5xl px-6 text-center">

            <h2 className="text-3xl font-semibold mb-6">
              Ověřeno v praxi
            </h2>

            <p className="text-slate-600 mb-10">
              ARCHIMEDES funguje ve školách a obcích napříč Českem.
            </p>

            <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-500">
              <span>20+ učeben</span>
              <span>stovky zapojených žáků</span>
              <span>spolupráce s partnery</span>
            </div>

          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-slate-900 text-white text-center">
          <div className="mx-auto max-w-3xl px-6">

            <h2 className="text-3xl font-semibold mb-4">
              Chcete to vidět na vlastní oči?
            </h2>

            <p className="text-slate-300 mb-8">
              Ukážeme vám, jak ARCHIMEDES Live funguje přímo ve výuce.
            </p>

            <Link
              href="/poptavka"
              className="inline-flex px-6 py-3 bg-white text-slate-900 rounded-xl font-medium hover:bg-slate-100 transition"
            >
              Domluvit ukázku
            </Link>

          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}
