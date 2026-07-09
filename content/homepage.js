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
  photo: "/obec-hero.jpg",
  photoAlt: "Setkání komunity v obci s hasiči, rodinami a sousedy",
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

export const referencesSection = {
  eyebrow: "Reference",
  title: "Obce, které už s námi mění svou komunitu",
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
    crest: "/cejc.jpg",
    photo: "/reference/cejc.jpg",
    storyHref: "/zadost",
    visible: true,
  },
  {
    id: "krenov",
    name: "Křenov",
    region: "Jihomoravský kraj",
    badge: "1. místo Obec 2030 ČR",
    quote: "Díky programu se naše obec stala centrem komunitního dění.",
    crest: "/krenov.jpg",
    photo: "/reference/krenov.jpg",
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
    photo: "/reference/hodonin.jpg",
    storyHref: "/zadost",
    visible: true,
  },
  {
    id: "provodov-sonov",
    name: "Provodov-Šonov",
    region: "Královéhradecký kraj",
    badge: "Bílá stuha Vesnice roku 2026",
    quote: "Skvělá podpora našich hasičů, seniorů i dětí.",
    crest: "/reference/provodov-sonov-erb.png",
    photo: "/reference/provodov-sonov.jpg",
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
