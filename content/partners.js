/**
 * Single source of truth for the confirmed public collaboration list on
 * /pro-organizace.
 *
 * All partners are equal. There is no ranking, tier, featured subset or
 * homepage selection. Every record in this file must render in the public
 * list. Add an organization only after its collaboration is confirmed.
 *
 * Logos live in /public/partners. The `mark` field is reserved for a
 * deliberately generic category such as "ZŠ", never as a substitute
 * for the unverified logo of a specific organization.
 */

export const partnersSection = {
  eyebrow: "Spolupráce",
  title: "Organizace, se kterými spolupracujeme",
  subtitle:
    "Potvrzené spolupráce, na kterých stavíme společný program pro školy, obce a místní komunity.",
  closing:
    "…a další školy, obce a organizace zapojené do programu ARCHIMEDES Live.",
};

export const partnersCta = {
  title: "Zastupujete národní svaz nebo organizaci?",
  subtitle:
    "Pomůžeme vám připravit odborné vysílání a oslovit členy i školy přímo v zapojených obcích.",
  cta: { label: "Zapojit naši organizaci", href: "/pro-organizace" },
  visible: true,
};

export const partners = [
  {
    slug: "sh-cms",
    name: "SH ČMS",
    fullName: "Sdružení hasičů Čech, Moravy a Slezska",
    website: "https://www.dh.cz",
    logo: "/partners/sh-cms.png",
    description: "Sbory dobrovolných hasičů a záchranářský dorost po celé republice.",
  },
  {
    slug: "rada-senioru",
    name: "Rada seniorů České republiky",
    website: "https://www.rscr.cz",
    logo: "/partners/rada-senioru.png",
    description: "Kluby a spolky seniorů, mezigenerační program a osvěta pro aktivní stárnutí.",
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
  {
    slug: "kridla-pro-budoucnost",
    name: "Nadační fond Křídla pro budoucnost",
    website: "https://nfkridlaprobudoucnost.cz",
    logo: "/partners/kridla-pro-budoucnost.png",
    description:
      "Podporuje mladé lidi při přechodu z dětských domovů do samostatného života — vzděláváním, mentoringem a dlouhodobou podporou.",
  },
  {
    slug: "zakladni-skoly",
    name: "Základní školy",
    mark: "ZŠ",
    description:
      "Zapojené základní školy, které využívají živé vstupy, témata z praxe a navazující vzdělávací program.",
  },
];
