import Head from "next/head";
import { User } from "lucide-react";
import Footer from "../components/Footer";
import { Card } from "../components/ui/card";
import SectionEyebrow from "../components/home/SectionEyebrow";

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

      <main className="min-h-screen bg-white">
        <section className="bg-[#edf5fb]">
          <div className="mx-auto grid max-w-[1180px] gap-10 px-5 py-14 lg:grid-cols-[1fr_0.9fr] lg:items-center lg:py-20">
            <div>
              <SectionEyebrow>Kontakt</SectionEyebrow>

              <h1 className="text-[42px] font-[950] leading-[1.05] tracking-[-0.03em] text-navy-900 sm:text-[52px]">
                Spojte se rovnou se správným člověkem
              </h1>

              <p className="mt-4 max-w-[620px] text-lg leading-relaxed text-muted">
                Program pro obec, spolupráce se svazem, obsah vysílání i realizace
                učebny mají vlastní odpovědnou osobu. Vyberte si kontakt podle
                toho, co právě potřebujete řešit.
              </p>
            </div>
            <div className="rounded-[26px] bg-white p-7 shadow-[0_20px_55px_rgba(15,23,42,0.08)]">
              <span className="text-xs font-black uppercase tracking-[0.14em] text-brand">Obecný kontakt</span>
              <a href="mailto:info@eduvision.cz" className="mt-4 block break-words text-2xl font-black text-navy-900">info@eduvision.cz</a>
              <a href="tel:+420732827210" className="mt-2 block text-lg font-bold text-slate-700">+420 732 827 210</a>
              <p className="mt-5 text-sm leading-relaxed text-slate-600">Pokud si nejste jistí, komu napsat, ozvěte se sem. Předáme zprávu správnému kolegovi.</p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1180px] px-5 py-10">
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

        <section className="mx-auto max-w-[1180px] px-5 pb-16 pt-8">
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

        <Footer />
      </main>
    </>
  );
}
