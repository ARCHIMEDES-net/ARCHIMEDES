import Head from "next/head";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Footer from "../components/Footer";
import PhotoWithFallback from "../components/PhotoWithFallback";
import { Card } from "../components/ui/card";
import SectionEyebrow from "../components/home/SectionEyebrow";
import { referencesSection, references } from "../content/homepage";

export default function ReferencePage() {
  const visibleReferences = references.filter((r) => r.visible);

  return (
    <>
      <Head>
        <title>Reference | ARCHIMEDES Live</title>
        <meta
          name="description"
          content="Obce, kterým pomáháme posilovat komunitní život — Čejč, Křenov, Hodonín a Provodov-Šonov."
        />
      </Head>

      <main className="min-h-screen bg-slate-50 pb-16 pt-10">
        <div className="mx-auto max-w-[1100px] px-5">
          <SectionEyebrow>{referencesSection.eyebrow}</SectionEyebrow>
          <h1 className="max-w-[760px] text-[40px] font-[950] leading-[1.05] tracking-[-0.04em] text-navy-900">
            {referencesSection.title}
          </h1>
          <p className="mt-4 max-w-[680px] text-[17px] leading-relaxed text-muted">
            Za dobu vysílání se do programu ARCHIMEDES Live zapojily přes 2
            stovky obcí. Vybrané obce, kde ARCHIMEDES Live pomáhá propojit
            školy, spolky, seniory i veřejnou správu do jednoho aktivního
            komunitního života.
          </p>

          {visibleReferences.length ? (
            <div className="mt-9 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {visibleReferences.map((r) => (
                <Card key={r.id} className="overflow-hidden p-0">
                  <div className="relative aspect-[4/3] bg-eyebrow">
                    <PhotoWithFallback
                      src={r.photo}
                      alt={r.photoAlt || `Obec ${r.name}`}
                      fallbackLabel={r.name}
                      style={{ width: "100%", height: "100%" }}
                      imgStyle={
                        r.photoFit === "contain"
                          ? { objectFit: "contain", padding: 24 }
                          : { objectFit: "cover" }
                      }
                    />
                    {r.crest ? (
                      <div className="absolute -bottom-5 left-3 rounded-full border-4 border-white shadow-md">
                        <PhotoWithFallback
                          src={r.crest}
                          alt={r.crestAlt || `Znak obce ${r.name}`}
                          fallbackLabel={r.name}
                          style={{ width: 40, height: 40 }}
                          rounded
                        />
                      </div>
                    ) : null}
                    <div className="absolute right-2.5 top-2.5 max-w-[120px] rounded-lg bg-navy-900/[0.82] px-2.5 py-1.5 text-center text-[10.5px] font-bold leading-tight text-white">
                      {r.badge}
                    </div>
                  </div>

                  <div className="p-4 pt-7">
                    <strong className="block text-base font-bold text-navy-900">{r.name}</strong>
                    <span className="mt-0.5 block text-xs font-semibold text-slate-400">{r.region}</span>
                    <p className="mt-2.5 text-[13.5px] leading-relaxed text-muted">&bdquo;{r.quote}&ldquo;</p>
                  </div>
                </Card>
              ))}
            </div>
          ) : null}

          <div className="mt-10 flex flex-col items-start gap-5 rounded-card-lg bg-navy-900 p-7 text-white sm:flex-row sm:items-center sm:justify-between">
            <div>
              <strong className="block text-lg font-bold">Chcete být další referencí?</strong>
              <span className="mt-1.5 block text-sm text-white/75">
                Vyplňte krátkou žádost a ozveme se vám s dalším postupem.
              </span>
            </div>
            <Link
              href="/zadost"
              className="inline-flex h-12 flex-none items-center justify-center gap-2 whitespace-nowrap rounded-full bg-white px-5 text-[15px] font-black text-navy-900"
            >
              Chci program pro naši obec
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
