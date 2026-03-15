import Head from "next/head";
import Link from "next/link";
import PublicHeader from "../components/PublicHeader";
import Footer from "../components/Footer";

const heroImg = "/IMG_0228_hero.webp";
const panelImg = "/DJI_20260202_100827_288_content.webp";
const classImg = "/DJI_20260202_104516_998_content.webp";

const benefitCards = [
  {
    title: "Jasné využití ve výuce",
    text:
      "Škola získá hotový formát: živý vstup, inspirativního hosta, práci ve třídě a navazující pracovní list.",
  },
  {
    title: "Přirozené napojení na šablony",
    text:
      "Program je připraven tak, aby šel smysluplně využít v aktivitách inovativního vzdělávání žáků v ZŠ.",
  },
  {
    title: "Jednoduché pro učitele i vedení",
    text:
      "Nejde o další složitý projekt navíc. Učitel program pustí, žáci se zapojí a škola má jasně uchopitelnou aktivitu.",
  },
];

const fitItems = [
  "živé vzdělávací vstupy pro třídu",
  "projektové a tematické hodiny",
  "spolupráce s odborníkem z praxe",
  "rozvoj občanských, mediálních a sociálních kompetencí",
  "motivace žáků přes aktuální témata a reálný svět",
  "navazující práce s pracovním listem nebo diskusí",
];

const whyItems = [
  {
    title: "Ředitel nemusí vymýšlet nový formát",
    text:
      "ARCHIMEDES Live není jen technická platforma. Je to připravený program, který lze rovnou využít ve škole.",
  },
  {
    title: "Učitel nezůstává na vše sám",
    text:
      "Výuka dostává hosta, téma, strukturu a navazující materiál. To šetří čas a zvyšuje kvalitu hodiny.",
  },
  {
    title: "Žáci vnímají výuku jinak",
    text:
      "Když do hodiny vstoupí člověk z praxe nebo silné aktuální téma, pozornost třídy je úplně jiná než u běžného frontálního výkladu.",
  },
];

const practicalSteps = [
  {
    number: "1",
    title: "Škola si vybere vhodné vysílání",
    text:
      "Téma podle věku žáků, předmětu nebo aktuální potřeby školy.",
  },
  {
    number: "2",
    title: "Třída sleduje živý vstup",
    text:
      "Na interaktivním panelu nebo ve třídě přes běžné školní vybavení.",
  },
  {
    number: "3",
    title: "Učitel naváže prací s třídou",
    text:
      "Diskuse, reflexe, pracovní list nebo krátký projektový úkol.",
  },
];

function PrimaryButton({ href, children }) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-[52px] items-center justify-center rounded-2xl bg-slate-900 px-6 py-3 text-base font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-xl"
    >
      {children}
    </Link>
  );
}

function SecondaryButton({ href, children }) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-[52px] items-center justify-center rounded-2xl border border-slate-300 bg-white px-6 py-3 text-base font-extrabold text-slate-800 transition hover:-translate-y-0.5 hover:border-slate-400 hover:shadow-lg"
    >
      {children}
    </Link>
  );
}

export default function FinancovaniSkolyPage() {
  return (
    <>
      <Head>
        <title>Financování pro školy | ARCHIMEDES Live</title>
        <meta
          name="description"
          content="Může škola využít ARCHIMEDES Live v rámci Šablon OP JAK? Přehledně pro ředitele školy: co program přináší, jak funguje ve výuce a proč dává smysl."
        />
      </Head>

      <PublicHeader active="" />

      <main className="bg-white text-slate-900">
        <section className="border-b border-slate-200 bg-gradient-to-b from-slate-50 via-white to-white">
          <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6 md:px-8 md:py-16">
            <div className="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
              <div>
                <div className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700">
                  Pro ředitele základních škol
                </div>

                <h1 className="mt-5 max-w-4xl text-4xl font-black leading-tight tracking-tight text-slate-900 sm:text-5xl">
                  Lze hradit ARCHIMEDES Live ze Šablon OP JAK?
                </h1>

                <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-700 sm:text-xl">
                  <strong>Ano.</strong> Pokud má škola aktivní projekt{" "}
                  <strong>Šablony OP JAK</strong>, může program ARCHIMEDES Live
                  smysluplně využít v aktivitách inovativního vzdělávání.
                </p>

                <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">
                  Ředitel tak nezískává jen další službu navíc, ale hotový
                  vzdělávací program pro třídu: živý vstup, hosta z praxe,
                  jasnou strukturu hodiny a navazující práci s žáky.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <PrimaryButton href="/poptavka">
                    Chci ukázkovou hodinu pro naši školu
                  </PrimaryButton>
                  <SecondaryButton href="/program">
                    Podívat se na program
                  </SecondaryButton>
                </div>

                <div className="mt-8 rounded-3xl border border-emerald-200 bg-emerald-50/80 p-5">
                  <div className="text-sm font-extrabold uppercase tracking-wide text-emerald-700">
                    Co potřebuje ředitel vědět hned
                  </div>
                  <ul className="mt-3 space-y-3 text-sm leading-6 text-slate-700 sm:text-base">
                    <li>
                      • škola nemusí vymýšlet nový formát, program je připravený
                      rovnou do výuky
                    </li>
                    <li>
                      • využití dává smysl zejména tam, kde škola realizuje
                      inovativní vzdělávání
                    </li>
                    <li>
                      • cílem není „další administrativa“, ale kvalitní obsah
                      pro třídu
                    </li>
                  </ul>
                </div>
              </div>

              <div>
                <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl">
                  <img
                    src={heroImg}
                    alt="Žáci základní školy při projektové výuce v učebně ARCHIMEDES"
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="text-2xl font-black text-slate-900">1</div>
                    <div className="mt-1 text-sm font-bold text-slate-800">
                      živý vstup
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="text-2xl font-black text-slate-900">1</div>
                    <div className="mt-1 text-sm font-bold text-slate-800">
                      host nebo téma
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="text-2xl font-black text-slate-900">1</div>
                    <div className="mt-1 text-sm font-bold text-slate-800">
                      navazující práce
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-12 sm:px-6 md:px-8 md:py-16">
          <div className="grid gap-5 md:grid-cols-3">
            {benefitCards.map((item) => (
              <div
                key={item.title}
                className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <h2 className="text-xl font-black text-slate-900">
                  {item.title}
                </h2>
                <p className="mt-3 text-base leading-7 text-slate-600">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-slate-50">
          <div className="mx-auto max-w-7xl px-5 py-12 sm:px-6 md:px-8 md:py-16">
            <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
              <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-xl">
                <img
                  src={panelImg}
                  alt="Živé vysílání ARCHIMEDES Live na interaktivním panelu ve třídě"
                  className="h-full w-full object-cover"
                />
              </div>

              <div>
                <div className="inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700">
                  Proč to do šablon zapadá
                </div>

                <h2 className="mt-4 text-3xl font-black leading-tight text-slate-900 sm:text-4xl">
                  Neprodáváte učitelům technologii. Dáváte škole hotovou výukovou aktivitu.
                </h2>

                <p className="mt-5 text-base leading-8 text-slate-700 sm:text-lg">
                  Z pohledu ředitele je klíčové, že ARCHIMEDES Live není
                  „něco, co se možná jednou využije“. Je to konkrétní program
                  pro třídu, který lze zapojit do školního dne bez složité
                  přípravy.
                </p>

                <p className="mt-4 text-base leading-8 text-slate-700 sm:text-lg">
                  Nejlépe dává smysl tam, kde škola hledá obsah pro
                  inovativní vzdělávání, práci s aktuálními tématy a kontakt
                  žáků s lidmi z praxe.
                </p>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {fitItems.map((item) => (
                    <div
                      key={item}
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-12 sm:px-6 md:px-8 md:py-16">
          <div className="max-w-3xl">
            <div className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-bold text-amber-700">
              Co ocení vedení školy
            </div>
            <h2 className="mt-4 text-3xl font-black leading-tight text-slate-900 sm:text-4xl">
              Tři důvody, proč to řediteli dává smysl
            </h2>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {whyItems.map((item) => (
              <div
                key={item.title}
                className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-sm"
              >
                <h3 className="text-xl font-black text-slate-900">
                  {item.title}
                </h3>
                <p className="mt-3 text-base leading-7 text-slate-600">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white">
          <div className="mx-auto max-w-7xl px-5 py-12 sm:px-6 md:px-8 md:py-16">
            <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
              <div>
                <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-700">
                  Jak to funguje v praxi
                </div>
                <h2 className="mt-4 text-3xl font-black leading-tight text-slate-900 sm:text-4xl">
                  Jedna hodina. Jasný formát. Žádná zbytečná složitost.
                </h2>
                <p className="mt-5 text-base leading-8 text-slate-700 sm:text-lg">
                  To nejdůležitější pro ředitele i učitele je jednoduchost.
                  Program nemá komplikovat provoz školy, ale doplnit výuku o
                  silný obsah a větší motivaci žáků.
                </p>

                <div className="mt-8 space-y-4">
                  {practicalSteps.map((step) => (
                    <div
                      key={step.number}
                      className="flex gap-4 rounded-[24px] border border-slate-200 bg-slate-50 p-5"
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-lg font-black text-white">
                        {step.number}
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-slate-900">
                          {step.title}
                        </h3>
                        <p className="mt-1 text-base leading-7 text-slate-600">
                          {step.text}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-xl">
                <img
                  src={classImg}
                  alt="Projektová výuka dětí v učebně ARCHIMEDES"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="bg-slate-50">
          <div className="mx-auto max-w-7xl px-5 py-12 sm:px-6 md:px-8 md:py-16">
            <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
              <div className="rounded-[28px] border border-blue-200 bg-blue-50 p-6 sm:p-8">
                <div className="text-sm font-black uppercase tracking-wide text-blue-700">
                  Důležitá informace pro ředitele
                </div>
                <h2 className="mt-3 text-2xl font-black leading-tight text-slate-900 sm:text-3xl">
                  Smyslem stránky není slibovat zkratku, ale ukázat reálnou cestu.
                </h2>
                <p className="mt-4 text-base leading-7 text-slate-700">
                  Pokud má škola aktivní projekt Šablony OP JAK, dává ARCHIMEDES
                  Live smysl jako hotový program pro výuku. Nejlepší další krok
                  není dlouhá schůzka, ale krátká ukázková hodina a rychlé
                  posouzení, jak program ve škole využít.
                </p>
              </div>

              <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <div className="text-sm font-black uppercase tracking-wide text-slate-500">
                  Co doporučujeme jako další krok
                </div>
                <h2 className="mt-3 text-2xl font-black leading-tight text-slate-900 sm:text-3xl">
                  Domluvte si ukázku pro vaši školu
                </h2>
                <p className="mt-4 text-base leading-7 text-slate-600">
                  Na jedné ukázkové hodině uvidíte, jak program působí na žáky,
                  jak pracuje učitel a jestli je to vhodný model právě pro vaši
                  školu.
                </p>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <PrimaryButton href="/poptavka">
                    Chci ukázkovou hodinu
                  </PrimaryButton>
                  <SecondaryButton href="/kontakt">
                    Potřebuji se doptat
                  </SecondaryButton>
                </div>
              </div>
            </div>

            <p className="mt-6 text-sm leading-6 text-slate-500">
              Informativní stránka pro školy. Konkrétní způsob využití programu
              je vždy vhodné posoudit podle nastavení a průběhu projektu dané
              školy.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
