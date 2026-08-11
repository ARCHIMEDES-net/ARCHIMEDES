import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Footer from "../components/Footer";
import { Card } from "../components/ui/card";
import SectionEyebrow from "../components/home/SectionEyebrow";

const documents = [
  {
    href: "/vop",
    title: "Všeobecné obchodní podmínky",
    text: "Podmínky poskytování služby ARCHIMEDES Live, objednávky, rozsah služby, odpovědnost a pravidla užívání.",
  },
  {
    href: "/dpa",
    title: "Smlouva o zpracování osobních údajů (DPA)",
    text: "Závazná smlouva mezi zákazníkem a EduVision včetně pokynů, zabezpečení, subzpracovatelů, incidentů a ukončení zpracování.",
  },
  {
    href: "/pravidla-zaznamu",
    title: "Pravidla pořizování a zpřístupnění záznamů",
    text: "Informace o tom, jak ARCHIMEDES Live pracuje se záznamy vysílání a archivem pro registrované uživatele.",
  },
  {
    href: "/ochrana-osobnich-udaju",
    title: "Informace o zpracování osobních údajů",
    text: "Podrobné informace o účelech, právních základech, příjemcích, době uchování a právech fyzických osob.",
  },
];

export default function PravniPage() {
  return (
    <>
      <main className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-100/60 to-white px-5 pb-10 pt-8">
        <div className="mx-auto max-w-[1120px]">
          <div className="mb-4">
            <Link href="/" className="text-sm font-bold text-brand hover:underline">
              ← Zpět na web
            </Link>
          </div>

          <Card className="mb-5 p-7 sm:p-8">
            <SectionEyebrow>ARCHIMEDES Live</SectionEyebrow>
            <h1 className="text-[34px] font-[950] leading-[1.05] tracking-[-0.04em] text-navy-900 sm:text-[44px]">
              Právní informace
            </h1>
            <p className="mt-3 max-w-[860px] text-lg leading-relaxed text-muted">
              Na této stránce najdete závazný smluvní a informační balíček pro
              ARCHIMEDES Live: VOP, DPA, pravidla záznamů a informace o
              zpracování osobních údajů.
            </p>
          </Card>

          <section className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {documents.map((doc) => (
              <Card key={doc.href} className="p-6">
                <h2 className="text-2xl font-black leading-[1.18] text-navy-900">{doc.title}</h2>
                <p className="mb-3.5 mt-2.5 text-base leading-relaxed text-muted">{doc.text}</p>
                <Link
                  href={doc.href}
                  className="inline-flex items-center gap-1.5 text-[15px] font-black text-brand hover:text-navy-900"
                >
                  Otevřít dokument <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Card>
            ))}
          </section>

          <section className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <Card className="p-7">
              <h2 className="text-[28px] font-black leading-[1.15] text-navy-900">
                Používání portálu ARCHIMEDES Live
              </h2>
              <p className="mb-3.5 mt-3.5 text-[17px] leading-relaxed text-slate-700">
                Portál ARCHIMEDES Live je online vzdělávací a komunitní prostředí
                určené pro školy, obce, organizace a další zapojené subjekty.
              </p>
              <p className="mb-3.5 text-[17px] leading-relaxed text-slate-700">
                Uživatelé jsou povinni využívat portál v souladu s jeho účelem,
                nenarušovat jeho technické fungování a nešířit obsah, který je v
                rozporu s právními předpisy, dobrými mravy nebo pravidly slušné
                komunikace.
              </p>
              <p className="text-[17px] leading-relaxed text-slate-700">
                Provozovatel si vyhrazuje právo omezit nebo zrušit přístup
                uživateli, který tato pravidla porušuje.
              </p>
            </Card>

            <Card className="border-blue-900/[0.08] bg-eyebrow p-6">
              <div className="mb-2.5 text-xs font-black uppercase tracking-[0.04em] text-navy-600">
                Dodavatel služby
              </div>
              <div className="mb-2.5 text-2xl font-black leading-[1.1] text-navy-900">
                EduVision s.r.o.
              </div>
              <p className="mb-2.5 text-[15px] leading-relaxed text-navy-600">
                Purkyňova 649/127, Medlánky
                <br />
                612 00 Brno
                <br />
                IČ: 17803039
                <br />
                DIČ: CZ17803039
              </p>
              <p className="text-[13px] leading-relaxed text-slate-500">
                zapsána pod značkou C 131579/KSBR
                <br />
                Krajským soudem v Brně
              </p>
            </Card>
          </section>

          <Card className="mb-4 p-7">
            <h2 className="text-[28px] font-black leading-[1.15] text-navy-900">Cookies</h2>
            <p className="mb-3.5 mt-3.5 text-[17px] leading-relaxed text-slate-700">
              Portál ARCHIMEDES Live používá nezbytné technické cookies, které
              slouží zejména k zajištění přihlášení uživatele, správnému fungování
              relace a zabezpečení přístupu k jednotlivým částem systému.
            </p>
            <p className="mb-3.5 text-[17px] leading-relaxed text-slate-700">
              Základní návštěvnost měříme také pomocí Vercel Web Analytics bez
              cookies a s anonymizovanými údaji. Google Analytics se aktivuje až
              po výslovném analytickém souhlasu. Souhlas lze kdykoli změnit na
              stránce s informacemi o zpracování osobních údajů.
            </p>
            <div className="mb-3.5 mt-2 rounded-2xl border border-slate-900/[0.08] bg-slate-50 p-4 text-[15px] leading-relaxed text-slate-700">
              V případě dotazů k provozu portálu, ochraně osobních údajů nebo práci
              se záznamy můžete využít kontaktní stránku na hlavním webu.
            </div>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/ochrana-osobnich-udaju"
                className="inline-flex items-center gap-1.5 text-[15px] font-black text-brand hover:text-navy-900"
              >
                Nastavení analytiky <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/kontakt"
                className="inline-flex items-center gap-1.5 text-[15px] font-black text-brand hover:text-navy-900"
              >
                Kontaktní stránka <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </>
  );
}
