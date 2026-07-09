/**
 * Data-driven content for the homepage (v2).
 *
 * Every list item has a `visible: true/false` flag. Set an item to
 * `visible: false` to hide it from the homepage without touching any
 * component code — no deploy-time logic changes needed, just edit this
 * file and redeploy (or merge to main once ready).
 */

export const hero = {
  eyebrow: "ARCHIMEDES Live pro obce",
  titleLine1: "Silná komunita.",
  titleLine2: "Úspěšná obec.",
  subtitle: "Spojujeme všechny, kdo tvoří život vaší obce.",
  lead:
    "Propojujeme školy, spolky, seniory, rodiče i národní organizace do jednoho celoročního programu. ARCHIMEDES Live vytváří páteř komunitního života obce, která usnadňuje komunikaci, podporuje spolupráci a pomáhá budovat aktivní obec, ve které se dobře žije dnes i budoucím generacím.",
  primaryCta: { label: "Chci program pro naši obec", href: "/zadost" },
  secondaryCta: { label: "Jak to funguje", href: "#jak-to-funguje" },
  photo: "/IMG_0228_hero.webp",
  photoAlt: "Děti ve venkovní učebně nadšeně ukazují své vyrobené valentýnky",
  floatingCard: {
    title: "Staňte se partnerskou obcí",
    text: "Připojte se k obcím, které budují aktivní komunitu.",
    visible: true,
  },
};

export const heroStats = [
  { id: "partnerske-obce", value: "28+", label: "partnerských obcí", visible: true },
  { id: "aktivni-organizace", value: "250+", label: "aktivních organizací", visible: true },
  { id: "zive-prenosy", value: "1 200+", label: "živých přenosů ročně", visible: true },
  { id: "zapojeni-obcane", value: "10 000+", label: "zapojených občanů", visible: true },
];

export const liveSection = {
  eyebrow: "Živé přenosy",
  title: "Co se děje v ARCHIMEDES Live",
  subtitle:
    "Sledujte živé přenosy, webináře a vzdělávací pořady pro školy, seniory i spolky.",
  calendarTitle: "Kalendář akcí",
  calendarLockedNote: "Plný přístup pro členy",
  showAllLabel: "Zobrazit celý kalendář",
  goToCalendarLabel: "Přejít do kalendáře",
};

export const partnersSection = {
  eyebrow: "Silní partneři",
  title: "Spolupracujeme s odborníky, aby měl každý spolek nejlepší obsah",
  showAllLabel: "Zobrazit všechny partnerské organizace",
  showAllHref: "/pro-organizace",
};

export const partners = [
  { id: "svaz-vcelaru", name: "Svaz včelařů ČR", logo: "/partners/svaz-vcelaru.png", visible: true },
  { id: "myslivecka-jednota", name: "Českomoravská myslivecká jednota", logo: "/partners/myslivecka-jednota.png", visible: true },
  { id: "sh-cms", name: "SH ČMS (Sdružení hasičů)", logo: "/partners/sh-cms.png", visible: true },
  { id: "rybarsky-svaz", name: "Český rybářský svaz", logo: "/partners/rybarsky-svaz.png", visible: true },
  { id: "svaz-zahradkaru", name: "Svaz zahrádkářů", logo: "/partners/svaz-zahradkaru.png", visible: true },
  { id: "junak", name: "Junák", logo: "/partners/junak.png", visible: true },
];

export const featuresSection = {
  eyebrow: "Proč ARCHIMEDES Live",
  title: "Podporujeme komunitní život ve vaší obci",
  photo: "/jak-funguje-online.jpg",
  photoAlt: "Živé online vysílání promítané v učebně ARCHIMEDES Live",
};

export const featureCards = [
  {
    id: "vzdelavani",
    icon: "graduation",
    title: "Vzdělávání pro všechny",
    description: "Programy pro školy, seniory i spolky na jednom místě.",
    visible: true,
  },
  {
    id: "propojeni",
    icon: "link",
    title: "Propojení komunity",
    description: "Spojujeme organizace, občany a národní svazy.",
    visible: true,
  },
  {
    id: "komunikace",
    icon: "chat",
    title: "Snadná komunikace",
    description: "Živé přenosy, pozvánky a sdílení informací.",
    visible: true,
  },
  {
    id: "rozvoj",
    icon: "growth",
    title: "Růst a rozvoj",
    description: "Inspirace, nové dovednosti a společné zážitky.",
    visible: true,
  },
  {
    id: "nabor",
    icon: "megaphone",
    title: "Nábor a osvěta",
    description: "Spolky získávají nové členy a zvyšují povědomí.",
    visible: true,
  },
  {
    id: "archiv",
    icon: "archive",
    title: "Archiv záznamů",
    description: "Záznamy všech akcí kdykoli k dispozici.",
    visible: true,
  },
];

export const communitySection = {
  eyebrow: "Komunita a senioři",
  title: "Prostor pro setkávání generací",
  text: "Senioři, rodiny i spolky se u nás pravidelně potkávají na společných programech. Pomáháme posilovat sousedské vztahy a mezigenerační sdílení zkušeností v obci.",
  cta: { label: "Program pro seniory", href: "/program" },
  photo: "/seni.webp",
  photoAlt: "Senioři na společném programu v učebně ARCHIMEDES Live",
  visible: true,
};

export const atmosphereSection = {
  eyebrow: "Atmosféra a akce",
  title: "Živá atmosféra společných akcí",
  subtitle:
    "Setkání, workshopy a živá vysílání, díky kterým pomáháme posilovat komunitní život v partnerských obcích.",
  visible: true,
};

export const atmospherePhotos = [
  {
    id: "atmos-spolecna",
    src: "/spolecna.jpg",
    alt: "Společná fotografie účastníků programu před učebnou ARCHIMEDES Live",
    visible: true,
  },
  {
    id: "atmos-tabule",
    src: "/atmos.webp",
    alt: "Žák pracuje s interaktivní tabulí během programu",
    visible: true,
  },
  {
    id: "atmos-lektor",
    src: "/doc2.jpg",
    alt: "Lektor představuje živé vysílání účastníkům",
    objectPosition: "center",
    visible: true,
  },
];

export const referencesSection = {
  eyebrow: "Reference",
  title: "Obce, kterým pomáháme posilovat komunitu",
  showAllLabel: "Zobrazit všechny reference",
  showAllHref: "/reference",
  readStoryLabel: "Přečíst příběh",
};

export const references = [
  {
    id: "cejc",
    name: "Čejč",
    region: "Jihomoravský kraj",
    badge: "1. místo Vesnice roku 2026 JMK",
    quote: "ARCHIMEDES Live nám pomohl propojit generace a oživit spolkový život v obci.",
    crest: null,
    crestAlt: null,
    photo: "/cejc.jpg",
    photoAlt: "Obec Čejč, oceněná 1. místem v soutěži Vesnice roku 2026 JMK",
    storyHref: "/zadost",
    visible: true,
  },
  {
    id: "krenov",
    name: "Křenov",
    region: "Jihomoravský kraj",
    badge: "1. místo Obec 2030 ČR",
    quote: "Díky programu se naše obec stala centrem komunitního dění.",
    crest: "/obec2030.jpeg",
    crestAlt: "Ocenění Obec 2030 ČR pro obec Křenov",
    photo: "/krenov.jpg",
    photoAlt: "Obec Křenov, vítěz ocenění Obec 2030 ČR",
    storyHref: "/zadost",
    visible: true,
  },
  {
    id: "hodonin",
    name: "Hodonín",
    region: "Jihomoravský kraj",
    badge: "3. místo Zdravá města ČR",
    quote: "Moderní komunikace se spolky a občany na jednom místě.",
    crest: "/hodonin-erb.jpg",
    crestAlt: "Znak města Hodonín",
    photo: "/zdravamesta.jpg",
    photoAlt: "Ocenění Zdravá města ČR pro Hodonín",
    storyHref: "/zadost",
    visible: true,
  },
  {
    id: "provodov-sonov",
    name: "Provodov-Šonov",
    region: "Královéhradecký kraj",
    badge: "Bílá stuha, Vesnice roku 2026",
    quote:
      "Máme tu učebnu ARCHIMEDES Live, která pomohla k ocenění za naši práci s mládeží a rodinami.",
    crest: "/provodov-sonov.png",
    crestAlt: "Znak obce Provodov-Šonov",
    photo: "/provodov-sonov.png",
    photoAlt: "Znak obce Provodov-Šonov, oceněné Bílou stuhou v soutěži Vesnice roku 2026",
    photoFit: "contain",
    storyHref: "/zadost",
    visible: true,
  },
];

export const ctaBand = {
  title: "Připojte se k obcím, které budují aktivní komunitu",
  subtitle: "Začněte ještě dnes a přineste moderní komunikaci do vaší obce.",
  cta: { label: "Chci program pro naši obec", href: "/zadost" },
  visible: true,
};

export const footerContent = {
  legalName: "EduVision s.r.o.",
  tagline: "Páteř komunitního života obce.",
  columns: [
    {
      title: "Program",
      links: [
        { label: "Pro školy", href: "/program" },
        { label: "Pro seniory", href: "/program" },
        { label: "Pro spolky", href: "/pro-organizace" },
      ],
    },
    {
      title: "Pro obec",
      links: [
        { label: "Jak to funguje", href: "/obec" },
        { label: "Ceník", href: "/zadost" },
      ],
    },
    {
      title: "O nás",
      links: [
        { label: "O společnosti", href: "/o-nas" },
        { label: "Partneři", href: "/pro-organizace" },
        { label: "Kontakt", href: "/kontakt" },
      ],
    },
  ],
  social: [
    { label: "Facebook", href: "https://www.facebook.com", icon: "facebook", visible: true },
    { label: "YouTube", href: "https://www.youtube.com", icon: "youtube", visible: true },
    { label: "LinkedIn", href: "https://www.linkedin.com", icon: "linkedin", visible: true },
  ],
  legalLinks: [
    { label: "Ochrana osobních údajů", href: "/ochrana-osobnich-udaju" },
    { label: "Obchodní podmínky", href: "/vop" },
  ],
};
