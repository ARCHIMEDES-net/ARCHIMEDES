import Head from "next/head";
import Image from "next/image";
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
    image: "/team-zuzana.webp",
  },
  {
    name: "Roman Tuzar",
    role: "Ředitel pro strategická partnerství",
    email: "roman.tuzar@eduvision.cz",
    phone: "+420 736 457 835",
    note: "Spolupráce s institucemi, partnery a organizacemi",
    image: "/team-roman.webp",
  },
  {
    name: "Simona Gavlíková",
    role: "Manažerka komunity a partnerství",
    email: "simona.gavlikova@archimedeslive.com",
    phone: "+420 603 467 337",
    note: "Komunita, spolupráce, partneři",
    image: "/team-simona.webp",
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
];

function TeamCard({ person }) {
  return (
    <Card className="overflow-hidden p-0 transition-colors hover:border-slate-300">
      {person.image ? (
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
          <Image
            src={person.image}
            alt={`Portrét: ${person.name}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover object-[center_20%]"
          />
        </div>
      ) : null}

      <div className="p-6">
        {!person.image ? (
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-eyebrow">
            <User className="h-6 w-6 text-brand" aria-hidden="true" />
          </div>
        ) : null}
        <div className={`${person.image ? "" : "mt-4 "}text-xl font-bold leading-tight text-navy-900`}>{person.name}</div>
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
        <section className="overflow-hidden bg-[#edf5fb]">
          <div className="mx-auto grid min-h-[610px] max-w-[1280px] lg:grid-cols-[0.9fr_1.1fr]">
            <div className="flex items-center px-5 py-16 sm:px-10 lg:px-12 lg:py-20">
              <div className="max-w-[600px]">
              <SectionEyebrow>Kontakt</SectionEyebrow>

              <h1 className="text-[clamp(42px,5vw,64px)] font-[950] leading-[0.98] tracking-[-0.045em] text-navy-900">
                Spojte se rovnou se správným člověkem
              </h1>

              <p className="mt-4 max-w-[620px] text-lg leading-relaxed text-muted">
                Program pro obec, spolupráce se svazem, obsah vysílání i realizace
                učebny mají vlastní odpovědnou osobu. Vyberte si kontakt podle
                toho, co právě potřebujete řešit.
              </p>
              </div>
            </div>

            <div className="relative min-h-[470px] lg:min-h-full">
              <Image
                src="/spolecna.jpg"
                alt="Účastníci společného programu před učebnou ARCHIMEDES"
                fill
                priority
                quality={80}
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="object-cover object-[52%_center]"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#edf5fb]/45 via-transparent to-transparent lg:from-[#edf5fb]/35" />

              <div className="absolute bottom-5 left-5 right-5 max-w-[430px] rounded-[22px] bg-white/95 p-6 shadow-[0_20px_55px_rgba(15,23,42,0.18)] backdrop-blur sm:bottom-8 sm:left-8 sm:p-7">
                <span className="text-xs font-black uppercase tracking-[0.14em] text-brand">Obecný kontakt</span>
                <a href="mailto:zive@archimedeslive.com" className="mt-3 block break-words text-xl font-black text-navy-900 sm:text-2xl">zive@archimedeslive.com</a>
                <a href="tel:+420732827210" className="mt-1.5 block text-base font-bold text-slate-700 sm:text-lg">+420 732 827 210</a>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">Nevíte, komu napsat? Předáme zprávu správnému kolegovi.</p>
                <p className="mt-3 border-t border-slate-200 pt-3 text-xs leading-relaxed text-slate-500">
                  EduVision s.r.o. · Purkyňova 649/127, 612 00 Brno
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1180px] px-5 pb-16 pt-14 sm:pt-16">
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
