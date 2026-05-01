import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-gray-900">

      {/* HERO */}
      <section className="max-w-6xl mx-auto px-4 py-12 grid md:grid-cols-2 gap-10 items-center">

        {/* TEXT */}
        <div>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-6">
            Pusťte dětem výuku z reálného světa během jedné hodiny
          </h1>

          <p className="text-lg text-gray-600 mb-6">
            Učitel pustí vysílání a děti se během jedné hodiny setkají s reálným světem:
          </p>

          <p className="font-medium mb-6">
            Zoo Praha • věda a příroda • profese a podnikání • rozhovory s odborníky • témata z praxe
          </p>

          <p className="text-gray-600 mb-8">
            Bez složité přípravy. Bez instalace. Funguje na každé interaktivní tabuli.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/start">
              <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold w-full sm:w-auto">
                Začít s balíčkem START
              </button>
            </Link>

            <Link href="/program">
              <button className="border border-gray-300 px-6 py-3 rounded-lg font-semibold w-full sm:w-auto">
                Zobrazit program
              </button>
            </Link>
          </div>
        </div>

        {/* IMAGE */}
        <div>
          <img
            src="/hero-classroom.jpg"
            alt="Výuka s ARCHIMEDES Live"
            className="rounded-xl shadow-md w-full object-cover"
          />
        </div>
      </section>

      {/* CO DETI UVIDI */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-semibold mb-6">
            Co děti skutečně uvidí ve výuce
          </h2>

          <p className="text-gray-700 text-lg">
            Reálný svět přenesený přímo do třídy. Žádná teorie bez souvislostí.
          </p>
        </div>
      </section>

      {/* PROGRAM */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-semibold mb-8 text-center">
          Co získá vaše škola každý měsíc
        </h2>

        <div className="grid md:grid-cols-2 gap-6 text-gray-800">

          <div>živé vysílání pro I. stupeň ZŠ</div>
          <div>živé vysílání pro II. stupeň ZŠ</div>
          <div>wellbeing program pro žáky</div>
          <div>kariérní poradenství jinak</div>
          <div>Čtenářský klub Magnesia Litera</div>
          <div>rozhovory s hosty v angličtině</div>
          <div className="md:col-span-2">
            možnost vysílání přímo z vaší školy
          </div>

        </div>

        <p className="text-center mt-8 font-medium">
          Stačí pustit. Jedna licence pro celou školu, bez omezení počtu tříd.
        </p>
      </section>

      {/* CTA BOTTOM */}
      <section className="bg-green-600 text-white py-12 text-center">
        <h2 className="text-2xl font-semibold mb-4">
          Vyzkoušejte ARCHIMEDES Live ve vaší škole
        </h2>

        <Link href="/start">
          <button className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold">
            Začít s balíčkem START
          </button>
        </Link>
      </section>

    </main>
  );
}
