import Head from "next/head";
import Link from "next/link";
import { ArrowRight, User } from "lucide-react";
import Footer from "../components/Footer";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import SectionEyebrow from "../components/home/SectionEyebrow";

const heroImg = "/ceny.webp";

const team = [
  {
    name: "Zuzana Novotná",
    role: "Manažerka platformy",
    email: "zuzana.novotna@archimedeslive.com",
    phone: "+420 737 333 879",
    note: "Strategie, partnerství, rozvoj",
  },
  {
    name: "Roman Tuzar",
    role: "Ředitel pro strategická partnerství",
    email: "roman.tuzar@eduvision.cz",
    phone: "+420 736 457 835",
    note: "Spolupráce s institucemi, partnery a organizacemi",
  },
  {
    name: "Dominik Ševčík",
    role: "Výkonný ředitel",
    email: "dominik.sevcik@eduvision.cz",
    phone: "+420 735 104 449",
    note: "Realizace učeben, technické řešení",
  },
  {
    name: "Martina Lačňáková",
    role: "Manažerka zakázek",
    email: "martina.lacnakova@eduvision.cz",
    phone: "+420 732 827 210",
    note: "Obchodní komunikace, poptávky, zakázky",
  },
  {
    name: "Natálie Lípová",
    role: "Manažerka programu a obsahu",
    email: "natalie.lipova@archimedeslive.com",
    phone: "+420 737 628 944",
    note: "Program, vysílání, obsah platformy",
  },
  {
    name: "Simona Gavlíková",
    role: "Manažerka komunity a partnerství",
    email: "simona.gavlikova@archimedeslive.com",
    phone: "+420 603 467 337",
    note: "Komunita, spolupráce, partneři",
  },
];

function ContactCard({ title, text, value, href }) {
  return (
    <Card className="p-6">
      <div className="text-[13px] font-black uppercase tracking-[0.06em] text-slate-500">
        {title}
      </div>
      {text ? <p className="mb-3.5 mt-2.5 text-sm leading-relaxed text-muted">{text}</p> : null}
      {href ? (
        <a href={href} className="break-words text-lg font-bold leading-relaxed text-navy-900">
          {value}
        </a>
      ) : (
        <div className="text-lg font-bold leading-relaxed text-navy-900">{value}</div>
      )}
    </Card>
  );
}

function TeamCard({ person }) {
  return (
    <Card className="p-6 transition-colors hover:border-slate-300">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-eyebrow">
        <User className="h-6 w-6 text-brand" aria-hidden="true" />
      </div>
      <div className="mt-4 text-xl font-bold leading-tight text-navy-900">{person.name}</div>
      <div className="mt-1.5 text-sm font-bold text-slate-700">{person.role}</div>
      <div className="mt-2.5 min-h-[48px] text-sm leading-relaxed text-muted">{person.note}</div>
      <div className="mt-4 grid gap-2">
        <a href={`mailto:${person.email}`} className="break-words text-sm font-bold text-brand">
          {person.email}
        </a>
        {person.phone ? (
          <a href={`tel:${person.phone.replace(/\s+/g, "")}`} className="text-sm font-bold text-navy-900">
            {person.phone}
          </a>
        ) : null}
      </div>
    </Card>
  );
}

export default function KontaktPage() {
  return (
    <>
      <Head>
        <title>Kontakt | ARCHIMEDES Live</title>
        <meta
          name="description"
          content="Kontakt na tým ARCHIMEDES Live. Ozvěte se nám kvůli programu pro školy, obce, komunitní spolupráci nebo vzorové učebně."
        />
      </Head>

      <main className="min-h-screen bg-slate-50">
        <section className="mx-auto max-w-[1180px] px-5 pb-8 pt-12">
          <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
            <div>
              <SectionEyebrow>ARCHIMEDES Live • kontakt</SectionEyebrow>

              <h1 className="text-[42px] font-[950] leading-[1.05] tracking-[-0.03em] text-navy-900 sm:text-[52px]">
                Spojte se s týmem
                <br />
                ARCHIMEDES Live
              </h1>

              <p className="mt-4 max-w-[620px] text-lg leading-relaxed text-muted">
                Rádi vám představíme program pro školy, obce a komunitu,
                možnosti zapojení i vzorovou učebnu ARCHIMEDES®.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Button href="/zadost">
                  Chci program pro naši obec
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Button>
                <Button href="/program" variant="secondary">
                  Zobrazit program
                </Button>
              </div>

              <div className="mt-6 flex max-w-[640px] flex-wrap items-center gap-2.5">
                <Badge>1. místo • OBEC 2030</Badge>
                <Badge variant="outline">Finalista • E.ON Energy Globe</Badge>
              </div>
              <p className="mt-3 max-w-[640px] text-sm leading-relaxed text-muted">
                ARCHIMEDES Live je postaven na reálných realizacích,
                zkušenostech z obcí a živém programu pro vzdělávání i komunitní
                život.
              </p>
            </div>

            <div className="relative overflow-hidden rounded-card-lg border border-slate-900/[0.08] bg-white shadow-[0_24px_60px_rgba(15,23,42,0.12)]">
              <img
                src={heroImg}
                alt="Ocenění projektu ARCHIMEDES"
                className="aspect-[16/11] w-full object-cover"
              />
              <div className="absolute inset-x-4 bottom-4">
                <div className="inline-flex w-fit items-center rounded-full bg-white/95 px-3.5 py-2 text-[13px] font-black text-navy-900 shadow-[0_10px_24px_rgba(15,23,42,0.12)]">
                  Oceněný projekt pro školy a obce
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1180px] px-5 py-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <ContactCard
              title="E-mail"
              text="Napište nám kvůli programu, učebně nebo spolupráci."
              value="info@eduvision.cz"
              href="mailto:info@eduvision.cz"
            />
            <ContactCard
              title="Telefon"
              text="Nejrychlejší cesta pro domluvu schůzky nebo ukázky."
              value="+420 732 827 210"
              href="tel:+420732827210"
            />
            <ContactCard
              title="Provozovatel"
              value={
                <>
                  EduVision s.r.o.
                  <br />
                  Purkyňova 649/127
                  <br />
                  Medlánky
                  <br />
                  612 00 Brno
                </>
              }
            />
          </div>
        </section>

        <section className="mx-auto max-w-[1180px] px-5 py-8">
          <div className="mb-7 max-w-[760px]">
            <SectionEyebrow>Tým ARCHIMEDES Live</SectionEyebrow>
            <h2 className="text-[36px] font-[950] tracking-[-0.03em] text-navy-900">
              Lidé, kteří vám pomohou
            </h2>
            <p className="mt-3 text-lg leading-relaxed text-muted">
              Potřebujete řešit obchod, program, partnerství nebo realizaci
              učebny? Ozvěte se přímo správnému člověku.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {team.map((person) => (
              <TeamCard key={person.email} person={person} />
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-[1180px] px-5 pb-16 pt-4">
          <div className="overflow-hidden rounded-card-lg bg-gradient-to-br from-[#173b77] via-navy-900 to-[#081120] text-white shadow-[0_24px_60px_rgba(15,23,42,0.18)]">
            <div className="grid gap-6 p-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1.5 text-[13px] font-bold text-white/90">
                  Další krok
                </span>

                <h3 className="mt-3.5 text-[30px] font-[950] leading-[1.12] tracking-[-0.02em] text-white">
                  Chcete učebnu ARCHIMEDES &bdquo;na klíč&ldquo;?
                </h3>

                <p className="mt-3 max-w-[700px] text-lg leading-relaxed text-white/78">
                  Pošlete poptávku a ozveme se vám s dalším postupem, možností
                  online schůzky nebo návštěvy vzorové učebny.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/zadost"
                  className="inline-flex h-[52px] items-center justify-center whitespace-nowrap rounded-2xl bg-white px-5 font-black text-navy-900"
                >
                  Chci program pro naši obec
                </Link>
                <Link
                  href="/ucebna"
                  className="inline-flex h-[52px] items-center justify-center whitespace-nowrap rounded-2xl border border-white/26 px-5 font-bold text-white"
                >
                  Zobrazit učebnu
                </Link>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}
