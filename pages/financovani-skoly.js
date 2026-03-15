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

                <h1 className="mt-6 max-w-4xl text-4xl font-black leading-[1.02] tracking-tight text-slate-900 sm:text-5xl lg:text-[58px]">
                  Máte ve škole Šablony OP JAK?
                  <br />
                  ARCHIMEDES Live může být
                  <br />
                  smysluplnou součástí vaší výuky.
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
