import Image from "next/image";
import { useEffect, useState } from "react";
import { Maximize2, X } from "lucide-react";

const broadcasts = [
  {
    src: "/pl25.webp",
    alt: "Senior Klub s Chantal Poullain",
    category: "Senior Klub",
    title: "Chantal Poullain",
  },
  {
    src: "/pl15.webp",
    alt: "Kariérní vysílání s Markem ze Zrádců",
    category: "Kariéra",
    title: "Marek ze Zrádců",
  },
  {
    src: "/pl14.webp",
    alt: "Senior Klub s profesorem Janem Pirkem",
    category: "Senior Klub",
    title: "Prof. Jan Pirk",
  },
  {
    src: "/pl53.jpg",
    alt: "Živé vysílání ze Zoo Praha o žirafách",
    category: "Pro děti a školy",
    title: "Živě ze Zoo Praha",
  },
  {
    src: "/pl6.webp",
    alt: "Senior Klub s profesorem Janem Švejnarem",
    category: "Senior Klub",
    title: "Prof. Jan Švejnar",
  },
];

export default function MunicipalityBroadcastGallery() {
  const [activeBroadcast, setActiveBroadcast] = useState(null);

  useEffect(() => {
    if (!activeBroadcast) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") setActiveBroadcast(null);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeBroadcast]);

  return (
    <section aria-labelledby="vysilali-jsme-title" className="border-y border-slate-100 bg-white pb-16 pt-8 sm:pb-20 sm:pt-10">
      <div className="mx-auto max-w-[1180px] px-5">
        <div className="max-w-3xl">
          <span className="text-xs font-black uppercase tracking-[0.16em] text-brand">
            Konkrétní program
          </span>
          <h2
            id="vysilali-jsme-title"
            className="mt-3 text-[clamp(34px,4vw,50px)] font-[950] leading-[1.03] tracking-[-0.045em] text-navy-900"
          >
            Vysílali jsme…
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600">
            Známé osobnosti, špičkoví odborníci i živé vstupy z míst, kam se
            běžně nedostanete. Program, na který mohou obce pozvat seniory,
            rodiny, školy i místní spolky.
          </p>
        </div>

        <div className="mt-9 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-5">
          {broadcasts.map((broadcast) => (
            <article key={broadcast.src} className="group min-w-0">
              <button
                type="button"
                onClick={() => setActiveBroadcast(broadcast)}
                className="relative block aspect-[3/4] w-full overflow-hidden rounded-[18px] border border-slate-200 bg-slate-50 text-left shadow-[0_10px_30px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_42px_rgba(15,23,42,0.15)] focus:outline-none focus-visible:ring-4 focus-visible:ring-brand/25"
                aria-label={`Zvětšit plakát: ${broadcast.title}`}
              >
                <Image
                  src={broadcast.src}
                  alt={broadcast.alt}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 220px"
                  className="object-contain"
                />
                <span className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-navy-900/90 text-white opacity-90 shadow-lg transition group-hover:scale-105">
                  <Maximize2 className="h-4 w-4" aria-hidden="true" />
                </span>
              </button>
              <p className="mt-3 text-[11px] font-black uppercase tracking-[0.12em] text-brand">
                {broadcast.category}
              </p>
              <h3 className="mt-1 text-base font-black leading-tight text-navy-900">
                {broadcast.title}
              </h3>
            </article>
          ))}
        </div>
      </div>

      {activeBroadcast ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-sm sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label={activeBroadcast.title}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setActiveBroadcast(null);
          }}
        >
          <div className="relative flex max-h-[92vh] max-w-[92vw] items-center justify-center">
            <Image
              src={activeBroadcast.src}
              alt={activeBroadcast.alt}
              width={1240}
              height={1754}
              sizes="92vw"
              priority
              className="h-auto max-h-[92vh] w-auto max-w-[92vw] rounded-xl object-contain shadow-2xl"
            />
            <button
              type="button"
              onClick={() => setActiveBroadcast(null)}
              className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full bg-white text-navy-900 shadow-lg transition hover:scale-105 focus:outline-none focus-visible:ring-4 focus-visible:ring-white/40"
              aria-label="Zavřít zvětšený plakát"
              autoFocus
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
