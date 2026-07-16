/**
 * Single source of truth for the complete public partner list on
 * /pro-organizace.
 *
 * All partners are equal. There is no ranking, tier, featured subset or
 * homepage selection. Every record in this file must render in the public
 * list. Add an organization only after its collaboration is confirmed.
 *
 * Logos live in /public/partners. A partner without a verified,
 * license-clear official logo asset has no `logo` field and instead
 * gets an `icon` fallback (see components/partners/icons.js) — never
 * an invented placeholder, initials circle, or unofficial substitute.
 */

export const partnersSection = {
  eyebrow: "Partnerské organizace",
  title: "Organizace zapojené do společného programu",
  subtitle:
    "Úplný, rovnocenný přehled potvrzených partnerů ARCHIMEDES Live. Seznam se průběžně rozšiřuje po potvrzení další spolupráce.",
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
  },
  {
    slug: "myslivecka-jednota",
    name: "Českomoravská myslivecká jednota",
    website: "https://www.cmmj.cz",
    logo: "/partners/myslivecka-jednota.svg",
    description:
      "Myslivecké spolky po celé republice, péče o krajinu, zvěř a vztah k přírodě.",
  },
  {
    slug: "sh-cms",
    name: "SH ČMS",
    fullName: "Sdružení hasičů Čech, Moravy a Slezska",
    website: "https://www.dh.cz",
    logo: "/partners/sh-cms.png",
    description: "Sbory dobrovolných hasičů a záchranářský dorost po celé republice.",
  },
  {
    slug: "rybarsky-svaz",
    name: "Český rybářský svaz",
    website: "https://www.rybsvaz.cz",
    logo: "/partners/rybarsky-svaz.svg",
    description: "Rybářské spolky a péče o revíry, vodní toky a mladé rybáře.",
  },
  {
    slug: "svaz-zahradkaru",
    name: "Český zahrádkářský svaz",
    website: "https://www.zahradkari.cz",
    logo: "/partners/svaz-zahradkaru.png",
    description: "Zahrádkářské spolky, pěstitelství a péče o veřejnou zeleň v obci.",
  },
  {
    slug: "rada-senioru",
    name: "Rada seniorů České republiky",
    website: "https://www.rscr.cz",
    logo: "/partners/rada-senioru.png",
    description: "Kluby a spolky seniorů, mezigenerační program a osvěta pro aktivní stárnutí.",
  },
  {
    slug: "junak",
    name: "Junák – český skaut",
    website: "https://www.skaut.cz",
    logo: "/partners/junak.png",
    description:
      "Skautské oddíly a výchova dětí a mládeže k samostatnosti a odpovědnosti.",
  },
  {
    slug: "kridla-pro-budoucnost",
    name: "Nadační fond Křídla pro budoucnost",
    website: "https://nfkridlaprobudoucnost.cz",
    logo: "/partners/kridla-pro-budoucnost.png",
    description:
      "Podporuje mladé lidi při přechodu z dětských domovů do samostatného života — vzděláváním, mentoringem a dlouhodobou podporou.",
  },
  {
    slug: "jinag",
    name: "JINAG",
    fullName: "Jihomoravská agentura pro veřejné inovace",
    website: "https://www.jinag.eu",
    logo: "/partners/jinag.png",
    description:
      "Podporuje obce a kraj při zavádění chytrých a inovativních řešení ve veřejné správě.",
  },
];
