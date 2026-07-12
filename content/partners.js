/**
 * Data-driven content for the partner presentation (homepage, /obec,
 * /reference, /pro-organizace, footer). Every partner is a confirmed
 * contractual partner of ARCHIMEDES Live — none of these are shown as
 * "candidate/pending" and all should render identically wherever the
 * partner section appears.
 *
 * Logos live in /public/partners — see README note in that folder for
 * source/license per file.
 */

export const partnersSection = {
  eyebrow: "Silní partneři",
  title: "Spolupracujeme s národními svazy, které znají život v obci nejlépe",
  subtitle:
    "Šest celostátních organizací nám pomáhá připravovat obsah pro spolky, školy i veřejnost — od hasičů po skauty.",
  showAllLabel: "Zobrazit všechny partnerské organizace",
  showAllHref: "/pro-organizace",
};

export const partnersCta = {
  title: "Chcete propojit svou organizaci s celou republikou?",
  subtitle:
    "Pokud vedete celostátní svaz nebo organizaci, pomůžeme vám oslovit lokální pobočky a členy přímo v zapojených obcích.",
  cta: { label: "Zapojit naši organizaci", href: "/pro-organizace" },
  visible: true,
};

export const partners = [
  {
    id: "svaz-vcelaru",
    slug: "cesky-svaz-vcelaru",
    name: "Český svaz včelařů",
    shortName: "ČSV",
    logo: "/partners/svaz-vcelaru.png",
    website: "https://www.vcelarstvi.cz",
    category: "vcelarstvi",
    description:
      "Národní organizace sdružující včelaře z celé České republiky. Přináší obcím obsah o včelaření, ochraně opylovačů a vztahu ke krajině.",
    featured: true,
    order: 1,
    visible: true,
  },
  {
    id: "myslivecka-jednota",
    slug: "cmmj",
    name: "Českomoravská myslivecká jednota",
    shortName: "ČMMJ",
    logo: "/partners/myslivecka-jednota.svg",
    website: "https://www.cmmj.cz",
    category: "myslivost",
    description:
      "Největší myslivecká organizace v zemi. Otevírá obcím vzdělávací obsah o myslivosti, ochraně přírody a vztahu člověka ke krajině.",
    featured: true,
    order: 2,
    visible: true,
  },
  {
    id: "sh-cms",
    slug: "sh-cms",
    name: "SH ČMS",
    shortName: "SH ČMS",
    logo: "/partners/sh-cms.png",
    website: "https://www.dh.cz",
    category: "hasici",
    description:
      "Sdružení hasičů Čech, Moravy a Slezska zastřešuje sbory dobrovolných hasičů po celé republice a pomáhá jim oslovit novou generaci členů.",
    featured: true,
    order: 3,
    visible: true,
  },
  {
    id: "rybarsky-svaz",
    slug: "crs",
    name: "Český rybářský svaz",
    shortName: "ČRS",
    logo: "/partners/rybarsky-svaz.svg",
    website: "https://www.rybsvaz.cz",
    category: "rybarstvi",
    description:
      "Největší rybářská organizace v ČR, pečující o rybí revíry a výchovu mladých rybářů. Přináší obcím obsah o rybářství a ochraně vodních toků.",
    featured: true,
    order: 4,
    visible: true,
  },
  {
    id: "svaz-zahradkaru",
    slug: "czs",
    name: "Český zahrádkářský svaz",
    shortName: "ČZS",
    logo: "/partners/svaz-zahradkaru.png",
    website: "https://www.zahradkari.cz",
    category: "zahradkari",
    description:
      "Celostátní organizace zahrádkářů a pěstitelů. Sdílí zkušenosti se zahradničením, sázením a péčí o veřejnou zeleň v obci.",
    featured: true,
    order: 5,
    visible: true,
  },
  {
    id: "junak",
    slug: "junak-cesky-skaut",
    name: "Junák – český skaut",
    shortName: "Junák",
    logo: "/partners/junak.png",
    website: "https://www.skaut.cz",
    category: "mladez",
    description:
      "Největší dětská a mládežnická organizace v ČR. Propojuje obce s aktivními oddíly a nabízí program pro výchovu dětí a mládeže.",
    featured: true,
    order: 6,
    visible: true,
  },
];
