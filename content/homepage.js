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
  primaryCta: { label: "Připojte svou obec", href: "/zadost" },
  secondaryCta: { label: "Jak to funguje", href: "#jak-to-funguje" },
  photo: "/hero-komunita-dsc00554.jpg",
  photoAlt: "Mezigenerační komunitní setkání před učebnou ARCHIMEDES Live",
  floatingCard: {
    title: "Staňte se partnerskou obcí",
    text: "Připojte se k obcím, které budují aktivní komunitu.",
    visible: true,
  },
};

export const statsSection = {
  title: "Budujeme digitální infrastrukturu pro české obce",
  subtitle:
    "ARCHIMEDES Live propojuje školy, spolky, seniory, rodiče i národní organizace do jednoho společného digitálního prostoru.",
};

// Every number here describes the SIZE OF THE NETWORK the platform is
// built for (target municipalities/schools, cumulative programme
// experience) — never a claim of current customers/active users. Do
// not phrase any of these as "zapojených obcí", "partnerských obcí",
// "aktivních uživatelů" or "registrovaných škol" unless that figure is
// provably backed by real signed/active accounts.
export const stats = [
  {
    id: "obce",
    value: "2 400+",
    label: "obcí, pro které platforma vzniká",
    description:
      "ARCHIMEDES Live je určen především českým obcím s přibližně 500 až 3 000 obyvateli.",
    visible: true,
  },
  {
    id: "zakladni-skoly",
    value: "2 500+",
    label: "základních škol",
    description:
      "Programy ARCHIMEDES Live mohou využívat základní školy v České republice i zahraničí.",
    visible: true,
  },
  {
    id: "zive-vysilani",
    value: "350+",
    label: "už sledovaly naše živé vysílání",
    description:
      "Do živého programu ARCHIMEDES se již zapojily školy ze stovek českých obcí.",
    visible: true,
  },
  {
    id: "hodiny-programu",
    value: "1 000+",
    label: "hodin živého programu",
    description:
      "Dlouhodobě ověřené zkušenosti s pravidelným živým vysíláním pro školy, obce a komunitní organizace.",
    visible: true,
  },
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

export const featuresSection = {
  eyebrow: "Proč ARCHIMEDES Live",
  title: "Podporujeme komunitní život ve vaší obci",
  photo: "/jak-funguje-online.webp",
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
    storyHref: "/reference",
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
    storyHref: "/reference",
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
    storyHref: "/reference",
    visible: true,
  },
  {
    id: "provodov-sonov",
    name: "Provodov-Šonov",
    region: "Královéhradecký kraj",
    badge: "Bílá stuha, Vesnice roku 2026",
    quote:
      "Máme tu učebnu ARCHIMEDES Live, která pomohla k ocenění za naši práci s mládeží a rodinami.",
    crest: null,
    crestAlt: null,
    photo: "/provodov-sonov.png",
    photoAlt: "Znak obce Provodov-Šonov, oceněné Bílou stuhou v soutěži Vesnice roku 2026",
    photoFit: "contain",
    storyHref: "/reference",
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
        { label: "Ceník", href: "/obec#cenik" },
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
