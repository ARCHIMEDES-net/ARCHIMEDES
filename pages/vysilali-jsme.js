import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import Footer from "../components/Footer";

const broadcasts = [
  ["2026-06-19", "19. 6. 2026", "ARCHIMEDES DAY", "Speciální vysílání", "/vysilali-jsme/2026-06-19-archimedes-day.webp"],
  ["2026-05-22", "22. 5. 2026", "Svět generace Z: Mozek vs. AI", "Wellbeing", "/vysilali-jsme/2026-05-22-svet-generace-z.webp"],
  ["2026-05-22a", "květen 2026", "Program na květen", "Přehled programu", "/vysilali-jsme/2026-05-program.webp"],
  ["2026-05-18", "18. 5. 2026", "Nejen za žirafami do Afrického domu", "1. stupeň", "/vysilali-jsme/2026-05-18-zoo-zirafy.webp"],
  ["2026-05-11", "11. 5. 2026", "Právnička, která ukazuje, že kariéra nemusí být jen jedna", "Kariéra", "/vysilali-jsme/2026-05-11-kariera-sandra-paskova.webp"],
  ["2026-05-07", "7. 5. 2026", "Co obnáší práce profesionálních hasičů?", "2. stupeň", "/vysilali-jsme/2026-05-07-hasici.webp"],
  ["2026-05-06a", "6. 5. 2026", "Komiks od nápadu k pointě", "2. stupeň", "/vysilali-jsme/2026-05-06-komiks.webp"],
  ["2026-05-06b", "6. 5. 2026", "Kroj jako příběh", "Senior klub", "/vysilali-jsme/2026-05-06-kroj-jako-pribeh.webp"],
  ["2026-05-06c", "6. 5. 2026", "Nepatrná ztráta osamělosti", "Čtenářský klub", "/vysilali-jsme/2026-05-06-nepatrna-ztrata-osamelosti.webp"],
  ["2026-04-20", "20. 4. 2026", "Kariérní poradenství jinak", "Kariéra", "/vysilali-jsme/2026-04-20-kariera-petrofova.webp"],
  ["2026-04-17", "17. 4. 2026", "Svět generace Z: Mozek vs. TikTok", "Wellbeing", "/vysilali-jsme/2026-04-17-generace-z-tiktok.webp"],
  ["2026-04-16", "16. 4. 2026", "Volně žijící živočichové", "1. stupeň", "/vysilali-jsme/2026-04-16-zoo-zivocichove.webp"],
  ["2026-04-08a", "8. 4. 2026", "Hvězda StarDance", "Senior klub", "/vysilali-jsme/2026-04-08-stardance.webp"],
  ["2026-04-08b", "8. 4. 2026", "Klikař Beny", "Čtenářský klub", "/vysilali-jsme/2026-04-08-ctenarsky-klub.webp"],
  ["2026-03-20", "20. 3. 2026", "Svět generace Z: Definice úspěchu", "Wellbeing", "/vysilali-jsme/2026-03-20-definice-uspechu.webp"],
  ["2026-03-16", "16. 3. 2026", "Česká cesta do vesmíru", "2. stupeň", "/vysilali-jsme/2026-03-16-ceska-cesta-do-vesmiru.webp"],
  ["2026-03-05", "5. 3. 2026", "Rekrut 244", "Čtenářský klub pro děti", "/vysilali-jsme/2026-03-05-rekrut-244.webp"],
  ["2026-03-04a", "4. 3. 2026", "Kriminalita na seniorech", "Senior klub", "/vysilali-jsme/2026-03-04-kriminalita-na-seniorech.webp"],
  ["2026-03-04b", "4. 3. 2026", "Život po Kafkovi", "Čtenářský klub", "/vysilali-jsme/2026-03-04-zivot-po-kafkovi.webp"],
  ["2026-02-09", "9. 2. 2026", "Kariérní poradenství s Lukášem Vlčkem", "Kariéra", "/pl5.webp"],
  ["2026-02-05", "5. 2. 2026", "Zvon s Martinem Čepou", "Čtenářský klub pro děti", "/pl4.webp"],
  ["2026-02-04", "4. 2. 2026", "Ekonomika důstojnosti ve stáří", "Senior klub", "/vysilali-jsme/2026-02-04-ekonomika-dustojnosti.webp"],
  ["2026-02-04b", "4. 2. 2026", "Vyhoření s Petrem Šestákem", "Čtenářský klub", "/pl30.webp"],
  ["2026-02-02", "2. 2. 2026", "Tvořivá dílna: Valentýnské přání", "1. stupeň", "/pl7.webp"],
  ["2026-01-31", "31. 1. 2026", "Christmas Carols", "Angličtina", "/pl8.webp"],
  ["2026-01-12", "12. 1. 2026", "ZOO Praha: Návrat divokých koní", "1. stupeň", "/pl9.webp"],
  ["2026-01-07", "7. 1. 2026", "Rozhovor s předsedkyní Rady seniorů", "Senior klub", "/pl11.webp"],
  ["2025-12-program", "prosinec 2025", "Program na prosinec", "Přehled programu", "/vysilali-jsme/2025-12-program.webp"],
  ["2025-12-09", "9. 12. 2025", "Setkání s Paulem Wadem", "Angličtina", "/pl13.webp"],
  ["2025-12-04a", "4. 12. 2025", "Fánek hvězdoplavec", "Čtenářský klub pro děti", "/vysilali-jsme/2025-12-04-fanek-hvezdoplavec.webp"],
  ["2025-12-04b", "4. 12. 2025", "Čistý, skromný život", "Čtenářský klub", "/vysilali-jsme/2025-12-04-cisty-skromny-zivot.webp"],
  ["2025-12-03a", "3. 12. 2025", "Pilot Marek ze Zrádců", "Kariéra", "/vysilali-jsme/2025-12-03-kariera-marek.webp"],
  ["2025-12-03b", "3. 12. 2025", "Prevence kardiovaskulárních onemocnění", "Senior klub", "/vysilali-jsme/2025-12-03-prevence-kardiovaskularnich-onemocneni.webp"],
  ["2025-12-workshop", "prosinec 2025", "Vánoční dílna pro 1. stupeň", "1. stupeň", "/vysilali-jsme/2025-12-vanocni-dilna.webp"],
  ["2025-11", "podzim 2025", "Co nám říká věda o dlouhověkosti ve zdraví?", "Senior klub", "/vysilali-jsme/2025-11-dlouhovekost.webp"],
  ["2025-10-01", "1. 10. 2025", "Pozitivní pohled na život a věk", "Senior klub", "/pl25.webp"],
  ["2025-09-21", "21. 9. 2025", "ScienceON živě z učebny ARCHIMEDES", "Věda a pokusy", "/pl26.webp"],
  ["2025-05-07", "7. 5. 2025", "Autonomní vozidla", "Senior klub", "/vysilali-jsme/2025-05-07-autonomni-auta.webp"],
  ["2025-04-02", "2. 4. 2025", "Umělá inteligence pro seniory", "Senior klub", "/pl28.webp"],
  ["2024-12-04", "4. 12. 2024", "Podvody na internetu", "Senior klub", "/vysilali-jsme/2024-12-04-podvody-na-internetu.webp"],
].map(([id, date, title, category, src]) => ({ id, date, title, category, src }));

export default function VysilaliJsmePage() {
  const [active, setActive] = useState(null);

  useEffect(() => {
    if (!active) return undefined;
    const close = (event) => {
      if (event.key === "Escape") setActive(null);
    };
    document.addEventListener("keydown", close);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", close);
      document.body.style.overflow = "";
    };
  }, [active]);

  return (
    <>
      <Head>
        <title>Vysílali jsme | ARCHIMEDES Live</title>
        <meta
          name="description"
          content="Výběr uskutečněných vzdělávacích a komunitních vysílání ARCHIMEDES."
        />
      </Head>

      <main className="min-h-screen bg-slate-50 text-navy-900">
        <nav aria-label="Odkazy pro hosty" className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-end gap-2 px-5 py-3 text-sm font-black">
            <Link href="/hoste" className="rounded-full px-4 py-2 text-slate-600 hover:bg-slate-100">
              Pro hosty česky
            </Link>
            <Link href="/guest" className="rounded-full px-4 py-2 text-slate-600 hover:bg-slate-100">
              For guests in English
            </Link>
          </div>
        </nav>

        <header className="bg-navy-900 py-16 text-white sm:py-24">
          <div className="mx-auto max-w-[900px] px-5 text-center">
            <span className="inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-black">
              ARCHIMEDES Live
            </span>
            <h1 className="mt-5 text-[44px] font-black leading-tight tracking-[-0.05em] sm:text-[68px]">
              Vysílali jsme
            </h1>
            <p className="mx-auto mt-5 max-w-[760px] text-lg leading-relaxed text-white/78 sm:text-2xl">
              Výběr živých vzdělávacích a komunitních pořadů. Nejnovější vysílání
              najdete vždy jako první.
            </p>
          </div>
        </header>

        <section className="py-12 sm:py-20">
          <div className="mx-auto max-w-[1260px] px-5">
            <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {broadcasts.map((broadcast) => (
                <article key={broadcast.id} className="min-w-0">
                  <button
                    type="button"
                    onClick={() => setActive(broadcast)}
                    aria-label={`Zvětšit plakát: ${broadcast.title}`}
                    className="group block w-full overflow-hidden rounded-[22px] bg-white text-left shadow-[0_12px_36px_rgba(15,23,42,0.08)] transition hover:-translate-y-1 hover:shadow-[0_18px_44px_rgba(15,23,42,0.14)] focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-500"
                  >
                    <span className="relative block aspect-[0.707/1] overflow-hidden bg-slate-200">
                      <Image
                        src={broadcast.src}
                        alt={`Plakát vysílání ${broadcast.title}`}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover object-top transition duration-300 group-hover:scale-[1.02]"
                      />
                    </span>
                    <span className="block p-5">
                      <span className="text-xs font-black uppercase tracking-[0.08em] text-blue-700">
                        {broadcast.category}
                      </span>
                      <span className="mt-2 block text-xl font-black leading-tight tracking-[-0.025em]">
                        {broadcast.title}
                      </span>
                      <span className="mt-2 block text-sm font-bold text-slate-500">{broadcast.date}</span>
                    </span>
                  </button>
                </article>
              ))}
            </div>
          </div>
        </section>

        <Footer />

        {active ? (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/88 p-4 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-label={active.title}
            onClick={(event) => {
              if (event.target === event.currentTarget) setActive(null);
            }}
          >
            <div className="relative max-h-[94vh] max-w-[min(94vw,900px)]">
              <img
                src={active.src}
                alt={`Plakát vysílání ${active.title}`}
                className="max-h-[94vh] max-w-full rounded-2xl object-contain shadow-2xl"
              />
              <button
                type="button"
                onClick={() => setActive(null)}
                aria-label="Zavřít plakát"
                className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full bg-white text-2xl font-black text-slate-950 shadow-lg"
              >
                ×
              </button>
            </div>
          </div>
        ) : null}
      </main>
    </>
  );
}
