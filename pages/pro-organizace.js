import Head from "next/head";
import { ArrowRight } from "lucide-react";
import Footer from "../components/Footer";
import { Button } from "../components/ui/button";
import SectionEyebrow from "../components/home/SectionEyebrow";

export default function ProOrganizacePage() {
  return (
    <>
      <Head>
        <title>Pro organizace | ARCHIMEDES Live</title>
        <meta
          name="description"
          content="ARCHIMEDES Live propojuje národní svazy, spolky a organizace se školami, obcemi a jejich komunitami."
        />
      </Head>

      <main className="min-h-screen bg-slate-50 pb-16 pt-10">
        <div className="mx-auto max-w-[720px] px-5">
          <SectionEyebrow>Pro organizace</SectionEyebrow>
          <h1 className="text-[38px] font-[950] tracking-[-0.04em] text-navy-900">
            Partnerství pro svazy, spolky a organizace
          </h1>
          <p className="mt-4 text-[17px] leading-relaxed text-muted">
            Spolupracujeme s odbornými organizacemi, aby měl každý spolek přístup
            k nejlepšímu obsahu a nové cesty, jak oslovit školy, obce i veřejnost —
            od náboru nových členů po osvětu mezi mladší generací. O termínu,
            tématu a formě zapojení se domluvíme individuálně podle vašich možností.
          </p>

          <section className="mt-9">
            <h2 className="text-2xl font-black tracking-[-0.03em] text-navy-900">
              Pro národní svazy a organizace
            </h2>
            <p className="mt-3.5 text-base leading-relaxed text-muted">
              Pokud vedete celostátní svaz nebo organizaci, ARCHIMEDES Live vám
              otevírá cestu k lokálním pobočkám a řadovým členům v obcích,
              které vlastními kanály často nedosáhnete. Připravíme společně
              obsahový blok (živé vysílání, workshop, sérii setkání) a
              nabídneme ho obcím zapojeným do programu — setkání probíhají
              fyzicky přímo v obci, individuální připojení z domova je
              výjimka.
            </p>
            <Button href="/kontakt" className="mt-7">
              Chci probrat spolupráci
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </section>

          <section className="mt-9">
            <h2 className="text-2xl font-black tracking-[-0.03em] text-navy-900">
              Pro místní spolky a organizace v obci
            </h2>
            <p className="mt-3.5 text-base leading-relaxed text-muted">
              Hasiči, senioři, čtenářský klub, sportovní oddíl nebo jiný
              spolek ve vaší obci se do programu zapojí zdarma v rámci obecní
              licence. Stačí registrační číslo, které vaší obci přidělíme po
              zahájení programu — spolek se pak zaregistruje sám a získává
              pozvánky a obsah podle svého zaměření.
            </p>
            <Button href="/obec" className="mt-7">
              Zjistit, jestli má naše obec program
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}
