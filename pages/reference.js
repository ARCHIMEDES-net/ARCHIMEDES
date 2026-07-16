import Head from "next/head";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Footer from "../components/Footer";
import PhotoWithFallback from "../components/PhotoWithFallback";
import SectionEyebrow from "../components/home/SectionEyebrow";
import { references } from "../content/homepage";

export default function ReferencePage() {
  const visibleReferences = references.filter((reference) => reference.visible);

  return (
    <>
      <Head>
        <title>Výsledky projektu ARCHIMEDES v obcích</title>
        <meta
          name="description"
          content="Obce, ve kterých realizované učebny ARCHIMEDES přispěly k rozvoji vzdělávání, práce s mládeží a komunitního života."
        />
      </Head>

      <main className="min-h-screen bg-white pb-16 pt-12">
        <section className="mx-auto max-w-[1100px] px-5">
          <SectionEyebrow>Výsledky projektu ARCHIMEDES</SectionEyebrow>
          <h1 className="max-w-[780px] text-[clamp(38px,6vw,64px)] font-[950] leading-[0.98] tracking-[-0.05em] text-navy-900">
            Učebny, které pomáhají obcím uspět
          </h1>
          <p className="mt-5 max-w-[740px] text-[18px] leading-relaxed text-slate-600">
            V těchto obcích jsme realizovali učebnu ARCHIMEDES. Stala se součástí
            práce se školou, dětmi, rodinami a místní komunitou a přispěla k výsledkům,
            které ocenily také celostátní nebo krajské soutěže.
          </p>
          <p className="mt-3 max-w-[740px] text-sm font-semibold leading-relaxed text-slate-500">
            Uvedené příklady se vztahují k realizovaným učebnám ARCHIMEDES, nikoli k novému programu ARCHIMEDES Live.
          </p>
        </section>

        <section className="mx-auto mt-10 max-w-[1100px] px-5">
          <div className="divide-y divide-slate-200 border-y border-slate-200">
            {visibleReferences.map((reference, index) => (
              <article
                key={reference.id}
                className="grid gap-6 py-8 md:grid-cols-[280px_minmax(0,1fr)] md:items-center"
              >
                <div className="relative aspect-[4/3] overflow-hidden rounded-[20px] bg-[#eef3f8]">
                  <PhotoWithFallback
                    src={reference.photo}
                    alt={reference.photoAlt || `Obec ${reference.name}`}
                    fallbackLabel={reference.name}
                    style={{ width: "100%", height: "100%" }}
                    imgStyle={
                      reference.photoFit === "contain"
                        ? { objectFit: "contain", padding: 24 }
                        : { objectFit: "cover" }
                    }
                  />
                  <span className="absolute left-3 top-3 rounded-full bg-white/94 px-3 py-1.5 text-xs font-black text-navy-900 shadow-sm backdrop-blur">
                    0{index + 1}
                  </span>
                </div>

                <div>
                  <span className="text-sm font-bold text-brand">{reference.region}</span>
                  <h2 className="mt-1 text-3xl font-[950] tracking-[-0.04em] text-navy-900">
                    {reference.name}
                  </h2>
                  <div className="mt-4 inline-flex rounded-full bg-[#eaf1ff] px-4 py-2 text-sm font-black text-brand">
                    {reference.badge}
                  </div>
                  <dl className="mt-5 grid gap-3 text-[15px] leading-relaxed sm:grid-cols-2">
                    <div>
                      <dt className="font-black text-navy-900">Realizace</dt>
                      <dd className="mt-1 text-slate-600">Učebna ARCHIMEDES</dd>
                    </div>
                    <div>
                      <dt className="font-black text-navy-900">Výsledek</dt>
                      <dd className="mt-1 text-slate-600">{reference.badge}</dd>
                    </div>
                  </dl>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-10 flex flex-col items-start justify-between gap-5 rounded-[22px] bg-[#f2f6fb] p-7 sm:flex-row sm:items-center">
            <div>
              <strong className="block text-xl font-black text-navy-900">
                Poznejte učebnu ARCHIMEDES
              </strong>
              <span className="mt-1.5 block text-sm text-slate-600">
                Prostor pro moderní výuku, setkávání a život místní komunity.
              </span>
            </div>
            <Link
              href="/ucebna"
              className="inline-flex h-12 items-center gap-2 rounded-full bg-navy-900 px-5 text-sm font-black text-white"
            >
              Prohlédnout učebnu
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
