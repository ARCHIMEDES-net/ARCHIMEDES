/**
 * Data-driven content for the partner presentation (homepage, /obec,
 * /reference, /pro-organizace, footer).
 *
 * All partners are equal, confirmed contractual partners of ARCHIMEDES
 * Live — there is no ranking or tier between them. `showOnHomepage` is
 * a *placement* flag only (does this org appear in the homepage's
 * space-limited representative selection), never a statement of
 * importance. The full, unranked list of every partner always lives
 * on /pro-organizace via content/communityCategories.js's `partnerSlug`
 * lookup against this file.
 *
 * Logos live in /public/partners. A partner without a verified,
 * license-clear official logo asset has no `logo` field and instead
 * gets an `icon` fallback (see components/partners/icons.js) — never
 * an invented placeholder, initials circle, or unofficial substitute.
 */

export const partnersSection = {
  eyebrow: "Partnerské organizace",
  title: "Společně propojujeme spolky a komunity napříč Českou republikou",
  subtitle:
    "Do ARCHIMEDES Live jsou zapojeny celostátní organizace i místní spolky z různých oblastí komunitního života.",
  showAllLabel: "Zobrazit všechny partnerské organizace a oblasti",
  showAllHref: "/pro-organizace#partnerske-organizace",
};

export const partnersCta = {
  title: "Zastupujete organizaci nebo svaz?",
  subtitle:
    "Pokud vedete celostátní svaz, spolek nebo místní organizaci, pomůžeme vám oslovit lidi přímo v zapojených obcích.",
  cta: { label: "Zapojit naši organizaci", href: "/pro-organizace" },
  visible: true,
};

export const partners = [
  {
    slug: "svaz-vcelaru",
    name: "Český svaz včelařů",
    website: "https://www.vcelarstvi.cz",
    logo: "/partners/svaz-vcelaru.png",
    description:
      "Národní organizace sdružující včelaře z celé České republiky. Obcím přináší osvětu o včelaření a ochraně opylovačů.",
    showOnHomepage: true,
  },
  {
    slug: "myslivecka-jednota",
    name: "Českomoravská myslivecká jednota",
    website: "https://www.cmmj.cz",
    logo: "/partners/myslivecka-jednota.svg",
    description:
      "Myslivecké spolky po celé republice, péče o krajinu, zvěř a vztah k přírodě.",
    showOnHomepage: true,
  },
  {
    slug: "sh-cms",
    name: "SH ČMS",
    fullName: "Sdružení hasičů Čech, Moravy a Slezska",
    website: "https://www.dh.cz",
    logo: "/partners/sh-cms.png",
    description: "Sbory dobrovolných hasičů a záchranářský dorost po celé republice.",
    showOnHomepage: true,
  },
  {
    slug: "rybarsky-svaz",
    name: "Český rybářský svaz",
    website: "https://www.rybsvaz.cz",
    logo: "/partners/rybarsky-svaz.svg",
    description: "Rybářské spolky a péče o revíry, vodní toky a mladé rybáře.",
    showOnHomepage: true,
  },
  {
    slug: "svaz-zahradkaru",
    name: "Český zahrádkářský svaz",
    website: "https://www.zahradkari.cz",
    logo: "/partners/svaz-zahradkaru.png",
    description: "Zahrádkářské spolky, pěstitelství a péče o veřejnou zeleň v obci.",
    showOnHomepage: true,
  },
  {
    slug: "rada-senioru",
    name: "Rada seniorů České republiky",
    website: "https://www.rscr.cz",
    logo: "/partners/rada-senioru.png",
    description: "Kluby a spolky seniorů, mezigenerační program a osvěta pro aktivní stárnutí.",
    showOnHomepage: true,
  },
  {
    slug: "junak",
    name: "Junák – český skaut",
    website: "https://www.skaut.cz",
    logo: "/partners/junak.png",
    description:
      "Skautské oddíly a výchova dětí a mládeže k samostatnosti a odpovědnosti.",
    showOnHomepage: false,
  },
  {
    slug: "kridla-pro-budoucnost",
    name: "Nadační fond Křídla pro budoucnost",
    website: "https://nfkridlaprobudoucnost.cz",
    logo: "/partners/kridla-pro-budoucnost.png",
    description:
      "Podporuje mladé lidi při přechodu z dětských domovů do samostatného života — vzděláváním, mentoringem a dlouhodobou podporou.",
    showOnHomepage: false,
  },
];
