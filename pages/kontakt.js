import Link from "next/link";
import Footer from "../components/Footer";

const team = [
  {
    name: "Antonín Koplík",
    role: "Jednatel společnosti, autor projektu",
    email: "antonin.koplik@eduvision.cz",
    phone: "",
  },
  {
    name: "Dominik Ševčík",
    role: "Ředitel realizací",
    email: "dominik.sevcik@eduvision.cz",
    phone: "+420 735 104 449",
  },
  {
    name: "Martina Lačňáková",
    role: "Manažerka zakázek",
    email: "martina.lacnakova@eduvision.cz",
    phone: "+420 732 827 210",
  },
  {
    name: "Natálie Lípová",
    role: "Manažerka programu a obsahu",
    email: "natalie.lipova@archimedeslive.com",
    phone: "+420 737 628 944",
  },
  {
    name: "Simona Gavlíková",
    role: "Manažerka komunity a partnerství",
    email: "simona.gavlikova@archimedeslive.com",
    phone: "+420 603 467 337",
  },
];

function ContactCard({ title, text, value, children }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="mb-2 text-xl font-semibold text-slate-900">{title}</h3>
      {text ? <p className="mb-3 text-sm leading-6 text-slate-500">{text}</p> : null}
      {value ? <div className="text-base font-semibold text-slate-900">{value}</div> : null}
      {children}
    </div>
  );
}

export default function KontaktPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <main>
        <section className="border-b border-slate-200 bg-gradient-to-b from-slate-50 via-white to-white">
          <div className="mx-auto max-w-6xl px-4 pb-14 pt-16 sm:px-6 lg:px-8 lg:pb-20 lg:pt-20">
            <div className="max-w-3xl">
              <span className="mb-4 inline-flex rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm font-medium text-slate-600">
                Kontakt
              </span>

              <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
                Spojte se s námi
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
                Máte zájem o program ARCHIMEDES Live pro školu, obec nebo komunitu?
                Ozvěte se nám. Rádi vám představíme projekt, možnosti zapojení i
                další postup.
              </p>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-3">
              <ContactCard
                title="E-mail"
                text="Kontaktní e-mail"
                value="info@eduvision.cz"
              />

              <ContactCard
                title="Telefon"
                text="Zavolejte nám"
                value="+420 732 827 210"
              />

              <ContactCard title="Provozovatel" text="EduVision s.r.o.">
                <div className="text-sm leading-7 text-slate-700">
                  Purkyňova 649/127
                  <br />
                  Medlánky
                  <br />
                  612 00 Brno
                </div>
              </ContactCard>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
          <div className="mb-8 max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Tým projektu
            </h2>
            <p className="mt-3 text-base leading-7 text-slate-600">
              Kontakty na členy týmu, kteří zajišťují realizace, program, partnerství
              i komunikaci s obcemi a školami.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {team.map((person) => (
              <div
                key={person.name}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-lg font-semibold text-slate-700">
                  {person.name
                    .split(" ")
                    .map((part) => part[0])
                    .slice(0, 2)
                    .join("")}
                </div>

                <h3 className="text-xl font-semibold text-slate-900">{person.name}</h3>

                <p className="mt-2 min-h-[48px] text-sm leading-6 text-slate-500">
                  {person.role}
                </p>

                <div className="mt-5 space-y-2 text-sm leading-6 text-slate-700">
                  <div className="break-all">
                    <span className="font-medium text-slate-900">E-mail:</span>{" "}
                    <a
                      href={`mailto:${person.email}`}
                      className="text-slate-700 underline decoration-slate-300 underline-offset-4 hover:text-slate-900"
                    >
                      {person.email}
                    </a>
                  </div>

                  {person.phone ? (
                    <div>
                      <span className="font-medium text-slate-900">Telefon:</span>{" "}
                      <a
                        href={`tel:${person.phone.replace(/\s+/g, "")}`}
                        className="text-slate-700 underline decoration-slate-300 underline-offset-4 hover:text-slate-900"
                      >
                        {person.phone}
                      </a>
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8 lg:pb-20">
          <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-10 text-center shadow-sm sm:px-10">
            <h3 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
              Máte zájem o program ARCHIMEDES Live?
            </h3>

            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600">
              Domluvte si krátkou ukázku programu nebo nám pošlete poptávku.
              Společně najdeme variantu, která bude dávat smysl pro vaši školu,
              obec nebo komunitu.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/poptavka"
                className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Odeslat poptávku
              </Link>

              <Link
                href="/program"
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-slate-50"
              >
                Zobrazit program
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
