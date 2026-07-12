import Head from "next/head";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Footer from "../components/Footer";
import { Button } from "../components/ui/button";
import SectionEyebrow from "../components/home/SectionEyebrow";

export default function ONasPage() {
  return (
    <>
      <Head>
        <title>O nás | ARCHIMEDES Live</title>
        <meta
          name="description"
          content="ARCHIMEDES Live je program pro školy a obce, který provozuje EduVision s.r.o."
        />
      </Head>

      <main className="min-h-screen bg-slate-50 pb-16 pt-10">
        <div className="mx-auto max-w-[720px] px-5">
          <SectionEyebrow>O nás</SectionEyebrow>
          <h1 className="text-[38px] font-[950] tracking-[-0.04em] text-navy-900">
            Stavíme páteř komunitního života obce
          </h1>
          <p className="mt-4 text-[17px] leading-relaxed text-muted">
            ARCHIMEDES Live provozuje společnost EduVision s.r.o. spolu se sítí
            odborných hostů a partnerů. Spojujeme školy, spolky, seniory, rodiče
            i národní organizace do jednoho celoročního programu — cílem je
            pomáhat obcím budovat aktivní komunitu, kde se propojují generace,
            spolky i veřejná správa.
          </p>

          <section className="mt-9">
            <h2 className="text-2xl font-black tracking-[-0.03em] text-navy-900">Kdo jsme</h2>
            <p className="mt-3.5 text-base leading-relaxed text-muted">
              ARCHIMEDES Live provozuje EduVision s.r.o. se sídlem v Brně.
              Program vznikl na základě zkušenosti s venkovními a živými
              výukovými programy pro školy — postupně se rozšířil o komunitní
              část pro obce, seniory a spolky.
            </p>
          </section>

          <section className="mt-9">
            <h2 className="text-2xl font-black tracking-[-0.03em] text-navy-900">Proč to děláme</h2>
            <p className="mt-3.5 text-base leading-relaxed text-muted">
              Živé setkávání funguje líp než další kanál navíc — proto stavíme
              na fyzických setkáních přímo v obci, doplněných živým vysíláním
              a hotovým obsahem. Cílem je usnadnit spolkům, školám a obecním
              úřadům komunikaci a dát dohromady lidi, kteří by se jinak
              nepotkali.
            </p>
          </section>

          <section className="mt-9">
            <h2 className="text-2xl font-black tracking-[-0.03em] text-navy-900">
              Co už program obcím přinesl
            </h2>
            <p className="mt-3.5 text-base leading-relaxed text-muted">
              V obcích, kde máme učebnu, jsme pomohli k ocenění v soutěžích
              jako Vesnice roku nebo Obec 2030 — víc o konkrétních obcích
              najdete na stránce Reference.
            </p>
            <Link
              href="/reference"
              className="mt-3 inline-flex items-center gap-1.5 text-[15px] font-black text-brand hover:text-navy-900"
            >
              Zobrazit reference obcí <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </section>

          <section className="mt-9">
            <h2 className="text-2xl font-black tracking-[-0.03em] text-navy-900">Kontakt</h2>
            <Button href="/kontakt" className="mt-7">
              Kontaktovat nás
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}
