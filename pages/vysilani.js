import { useMemo, useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import SectionEyebrow from "../components/home/SectionEyebrow";

const posters = Array.from({ length: 30 }, (_, i) => ({
  id: i + 1,
  src: `/pl${i + 1}.webp`,
  alt: `Plakát ARCHIMEDES Live ${i + 1}`,
  label: `Plakát ${i + 1}`,
}));

const heroPosters = ["/pl50.webp", "/pl51.webp", "/pl52.webp", "/pl53.jpg"];

export default function ProbehlaVysilaniPage() {
  const [activePoster, setActivePoster] = useState(null);
  const totalCount = useMemo(() => posters.length, []);

  return (
    <>
      <main className="min-h-screen bg-slate-50 px-5 pb-16 pt-10">
        <div className="mx-auto max-w-[1180px]">
          <Card className="overflow-hidden p-0">
            <div className="grid grid-cols-1 items-stretch lg:grid-cols-[1.02fr_1fr]">
              <div className="p-6 sm:p-9">
                <SectionEyebrow>ARCHIMEDES Live</SectionEyebrow>

                <h1 className="text-[clamp(36px,5vw,58px)] font-[950] leading-[1.02] tracking-[-0.04em] text-navy-900">
                  Naši hosté a témata
                </h1>

                <p className="mt-5 max-w-[620px] text-xl leading-relaxed text-slate-700">
                  Podívejte se na výběr z vysílání, která už v programu
                  ARCHIMEDES Live proběhla.
                </p>

                <div className="mb-6 mt-6 flex flex-wrap gap-3.5">
                  <div className="min-w-[170px] rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="mb-2 text-[13px] font-bold uppercase tracking-[0.08em] text-slate-500">
                      Plakátů
                    </div>
                    <div className="text-[34px] font-[950] leading-none text-navy-900">
                      {totalCount}
                    </div>
                  </div>

                  <div className="min-w-[260px] rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="mb-2 text-[13px] font-bold uppercase tracking-[0.08em] text-slate-500">
                      Veřejná ukázka
                    </div>
                    <div className="text-lg font-bold leading-snug text-slate-700">
                      hostů, témat a programu
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button href="/program">Zobrazit program</Button>
                  <Button href="/zadost" variant="secondary">
                    Chci zapojit obec, školu nebo spolek
                  </Button>
                </div>
              </div>

              <div className="border-t border-slate-200 bg-gradient-to-b from-blue-50 to-slate-50 p-5 lg:border-l lg:border-t-0">
                <div className="grid h-full grid-cols-2 gap-3">
                  {heroPosters.map((src, index) => (
                    <div key={src} className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-slate-200">
                      <Image
                        src={src}
                        alt={`Ukázkový plakát ${index + 1}`}
                        fill
                        sizes="(max-width: 1024px) 45vw, 240px"
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <section className="mt-16">
            <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
              <div>
                <SectionEyebrow>Galerie plakátů</SectionEyebrow>
                <h2 className="text-[clamp(28px,4vw,42px)] font-[950] leading-[1.1] tracking-[-0.03em] text-navy-900">
                  Přehled proběhlých vysílání
                </h2>
              </div>
              <p className="max-w-[560px] text-[17px] leading-relaxed text-muted">
                Kliknutím na libovolný plakát otevřete větší náhled.
              </p>
            </div>

            <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-5">
              {posters.map((poster) => (
                <button
                  key={poster.id}
                  type="button"
                  onClick={() => setActivePoster(poster)}
                  className="block overflow-hidden rounded-card-md border border-slate-200 bg-white text-left shadow-[0_12px_36px_rgba(15,23,42,0.08)] transition-all hover:-translate-y-1 hover:shadow-[0_18px_42px_rgba(15,23,42,0.13)]"
                >
                  <div className="aspect-[3/4] overflow-hidden bg-eyebrow">
                    <img
                      src={poster.src}
                      alt={poster.alt}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="p-4">
                    <div className="mb-1.5 text-base font-bold text-navy-900">{poster.label}</div>
                    <div className="text-sm leading-relaxed text-slate-500">Otevřít větší náhled</div>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section className="mt-16">
            <div className="grid grid-cols-1 items-center gap-6 rounded-card-lg border border-slate-200 bg-white p-7 shadow-[0_18px_46px_rgba(15,23,42,0.08)] sm:p-9 lg:grid-cols-[1.15fr_0.85fr]">
              <div>
                <SectionEyebrow>Chcete vidět víc?</SectionEyebrow>
                <h3 className="mb-3 text-[clamp(26px,3vw,36px)] font-[950] leading-[1.12] tracking-[-0.03em] text-navy-900">
                  Kompletní archiv je určen pro zapojené školy a obce
                </h3>
                <p className="max-w-[720px] text-[17px] leading-relaxed text-muted">
                  Tato stránka ukazuje veřejný výběr proběhlých vysílání.
                  Kompletní záznamy, navazující obsah a přístup do portálu jsou
                  součástí programu ARCHIMEDES Live pro školy, obce a další
                  partnery.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button href="/zadost">Chci zapojit obec, školu nebo spolek</Button>
                <Button href="/ucebna" variant="secondary">
                  Více o učebně
                </Button>
              </div>
            </div>
          </section>
        </div>
      </main>

      {activePoster && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setActivePoster(null)}
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-navy-900/82 p-6"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-[min(92vw,860px)] max-h-[90vh] overflow-hidden rounded-card-lg bg-white shadow-[0_30px_100px_rgba(0,0,0,0.35)]"
          >
            <button
              type="button"
              onClick={() => setActivePoster(null)}
              aria-label="Zavřít"
              className="absolute right-3.5 top-3.5 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-navy-900/72 text-white"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>

            <div className="bg-slate-50">
              <img
                src={activePoster.src}
                alt={activePoster.alt}
                className="block max-h-[90vh] w-full bg-slate-50 object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
