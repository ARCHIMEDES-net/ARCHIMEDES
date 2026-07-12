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
    text: "Základní rámec zpracování osobních údajů mezi školou nebo organizací a společností EduVision s.r.o.",
  },
  {
    href: "/pravidla-zaznamu",
    title: "Pravidla pořizování a zpřístupnění záznamů",
    text: "Informace o tom, jak ARCHIMEDES Live pracuje se záznamy vysílání a archivem pro registrované uživatele.",
  },
  {
    href: "/ochrana-osobnich-udaju",
    title: "Informace o zpracování osobních údajů",
    text: "Základní informace o tom, jak EduVision s.r.o. zpracovává osobní údaje v souvislosti s webem a službou ARCHIMEDES Live.",
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
              Na této stránce najdete přehled základních právních dokumentů
              souvisejících se službou ARCHIMEDES Live, objednávkovým procesem,
              ochranou osobních údajů a prací se záznamy.
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
              Bez těchto cookies by nebylo možné portál řádně používat. Pokud budou
              do budoucna na web doplněny analytické nebo marketingové nástroje,
              bude tato část rozšířena o odpovídající správu souhlasů.
            </p>
            <div className="mb-3.5 mt-2 rounded-2xl border border-slate-900/[0.08] bg-slate-50 p-4 text-[15px] leading-relaxed text-slate-700">
              V případě dotazů k provozu portálu, ochraně osobních údajů nebo práci
              se záznamy můžete využít kontaktní stránku na hlavním webu.
            </div>
            <Link
              href="/kontakt"
              className="inline-flex items-center gap-1.5 text-[15px] font-black text-brand hover:text-navy-900"
            >
              Přejít na kontaktní stránku <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Card>
        </div>
      </main>

      <Footer />
    </>
  );
}
