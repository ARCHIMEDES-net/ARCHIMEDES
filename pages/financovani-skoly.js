import Head from "next/head";
import Link from "next/link";
import Footer from "../components/Footer";

const heroImg = "/IMG_0228_hero.webp";
const panelImg = "/DJI_20260202_100827_288_content.webp";
const classImg = "/DJI_20260202_104516_998_content.webp";

const benefitCards = [
  {
    title: "Neřešíte další projekt navíc",
    text:
      "Získáte hotový program, který můžete zařadit do výuky bez složité přípravy a bez vymýšlení nového formátu.",
  },
  {
    title: "Dává to smysl ve výuce",
    text:
      "Žáci sledují živý vstup, pracují s tématem a učitel má k dispozici navazující aktivitu pro třídu.",
  },
  {
    title: "Máte jasný argument pro školu",
    text:
      "Program propojuje školu s lidmi z praxe, aktuálními tématy a moderními formami výuky, které dnes školy hledají.",
  },
];

const fitItems = [
  "živý vstup do vyučování",
  "host z praxe nebo inspirativní osobnost",
  "práce s aktuálním tématem",
  "projektová nebo tematická hodina",
  "navazující pracovní list",
  "větší zapojení a pozornost žáků",
];

const practicalSteps = [
  {
    number: "1",
    title: "Vyberete vhodné vysílání",
    text:
      "Podle věku žáků, tématu nebo podle toho, co právě ve škole řešíte.",
  },
  {
    number: "2",
    title: "Pustíte program ve třídě",
    text:
      "Na interaktivním panelu nebo přes běžné školní vybavení, které už máte.",
  },
  {
    number: "3",
    title: "Navážete prací s třídou",
    text:
      "Krátká diskuse, reflexe nebo pracovní list promění sledování v plnohodnotnou vzdělávací aktivitu.",
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
        <title>Financování škol | ARCHIMEDES Live</title>
        <meta
          name="description"
          content="ARCHIMEDES Live může být smysluplnou součástí výuky škol zapojených do Šablon OP JAK."
        />
      </Head>

      <main className="bg-white text-slate-900">
        <section className="border-b border-slate-200 bg-gradient-to-b from-slate-50 via-white to-white">
          <div className="mx-auto max-w-7xl px-5 py-14 sm:px-6 md:px-8 md:py-16">
            <div className="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
              <div>
                <div className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700">
                  Pro ředitele základních škol
                </div>

                <h1 className="mt-6 max-w-2xl text-4xl font-bold leading-[1.15] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                  <span className="block text-3xl font-semibold text-slate-700 sm:text-4xl lg:text-5xl">
                    Šablony OP JAK ve škole?
                  </span>

                  <span className="block mt-3">
                    ARCHIMEDES Live přináší
                  </span>

                  <span className="block mt-3 font-extrabold">
                    hotový program do výuky.
                  </span>
                </h1>

                <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-700 sm:text-xl">
                  Pokud ve škole pracujete s projektem{" "}
                  <strong>Šablony OP JAK</strong>, pravděpodobně hledáte
                  aktivity, které budou pro žáky opravdu přínosné a pro učitele
                  reálně použitelné.
                </p>

                <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">
                  <strong>ARCHIMEDES Live</strong> přináší hotový formát do
                  výuky: živý vstup, hosta z praxe, jasnou strukturu hodiny a
                  navazující práci s žáky. Nejde o další složitou povinnost
                  navíc, ale o program, který můžete rovnou použít ve škole.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <PrimaryButton href="/poptavka">
                    Chci ukázkovou hodinu pro naši školu
                  </PrimaryButton>

                  <SecondaryButton href="/program">
                    Podívat se na program
                  </SecondaryButton>
                </div>
              </div>

              <div>
                <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl">
                  <img
                    src={heroImg}
                    alt="Výuka v učebně ARCHIMEDES"
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
                      silné téma
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="text-2xl font-black text-slate-900">1</div>
                    <div className="mt-1 text-sm font-bold text-slate-800">
                      práce s třídou
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-12 sm:px-6 md:px-8 md:py-16">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-black leading-tight text-slate-900 sm:text-4xl">
              Proč by vás to mělo jako ředitele zajímat
            </h2>
            <p className="mt-4 text-base leading-8 text-slate-700 sm:text-lg">
              Ve škole potřebujete obsah, který bude smysluplný pro žáky,
              použitelný pro učitele a obhajitelný před vedením i zřizovatelem.
              Právě v tom je ARCHIMEDES Live silný.
            </p>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {benefitCards.map((item) => (
              <div
                key={item.title}
                className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
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
                  Co ve škole skutečně kupujete
                </div>

                <h2 className="mt-4 text-3xl font-black leading-tight text-slate-900 sm:text-4xl">
                  Nekupujete technologii. Kupujete hotovou vzdělávací hodinu.
                </h2>

                <p className="mt-5 text-base leading-8 text-slate-700 sm:text-lg">
                  Z pohledu ředitele je důležité, že ARCHIMEDES Live není jen
                  nějaká platforma, kterou si škola pořídí a pak přemýšlí, co s
                  ní. Dostáváte konkrétní vzdělávací obsah, který lze použít ve
                  výuce.
                </p>

                <p className="mt-4 text-base leading-8 text-slate-700 sm:text-lg">
                  Největší přínos je v tom, že žáci nesledují pasivně video, ale
                  dostávají živý vstup, téma k přemýšlení a navazující práci ve
                  třídě.
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
          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
            <div>
              <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-700">
                Jak to vypadá v praxi
              </div>

              <h2 className="mt-4 text-3xl font-black leading-tight text-slate-900 sm:text-4xl">
                Pro vás jednoduché. Pro učitele použitelné. Pro žáky atraktivní.
              </h2>

              <p className="mt-5 text-base leading-8 text-slate-700 sm:text-lg">
                Ve škole potřebujete řešení, které nezatíží provoz a nebude
                stát na tom, že si jeden učitel všechno sám připraví od začátku.
                Proto je ARCHIMEDES Live postavený co nejjednodušeji.
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
        </section>

        <section className="bg-slate-50">
          <div className="mx-auto max-w-7xl px-5 py-12 sm:px-6 md:px-8 md:py-16">
            <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
              <div className="rounded-[28px] border border-blue-200 bg-blue-50 p-6 sm:p-8">
                <div className="text-sm font-black uppercase tracking-wide text-blue-700">
                  Stručně řečeno
                </div>
                <h2 className="mt-3 text-2xl font-black leading-tight text-slate-900 sm:text-3xl">
                  Pokud hledáte program, který bude ve škole opravdu žít, jste
                  na správném místě.
                </h2>
                <p className="mt-4 text-base leading-7 text-slate-700">
                  Jako ředitel nepotřebujete další složitý systém. Potřebujete
                  obsah, který bude fungovat ve třídě, bude přínosný pro žáky a
                  učitel ho zvládne bez zbytečné zátěže. Přesně tak je
                  ARCHIMEDES Live postavený.
                </p>
              </div>

              <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <div className="text-sm font-black uppercase tracking-wide text-slate-500">
                  Nejlepší další krok
                </div>
                <h2 className="mt-3 text-2xl font-black leading-tight text-slate-900 sm:text-3xl">
                  Podívejte se, jak by to mohlo fungovat právě u vás ve škole
                </h2>
                <p className="mt-4 text-base leading-7 text-slate-600">
                  Nejrychlejší je krátká ukázková hodina. Uvidíte reakci žáků,
                  práci učitele i to, jestli je tento model vhodný právě pro
                  vaši školu.
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
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
