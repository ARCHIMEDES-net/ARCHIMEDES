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
  titleLine1: "Silná komunita",
  titleLine2: "Úspěšná obec",
  subtitle: "Živý program pro celou obec.",
  lead:
    "Přinášíme obcím pravidelný živý program pro školy, spolky, seniory i další místní komunity. Program, při kterém se lidé setkávají, vzdělávají a sbližují.",
  primaryCta: { label: "Připojte svou obec", href: "/zadost" },
  secondaryCta: { label: "Jak to funguje", href: "#jak-to-funguje" },
  photo: "/hero-komunita-dsc00554.webp",
  photoAlt: "Mezigenerační komunitní setkání před učebnou ARCHIMEDES Live",
  floatingCard: {
    title: "Staňte se partnerskou obcí",
    text: "Připojte se k obcím, které budují aktivní komunitu.",
    visible: true,
  },
};

// Only verified experience and an explicit product fact belong here.
// Do not use addressable-market or target-network figures as proof.
export const stats = [
  {
    id: "zive-vysilani",
    value: "350+",
    label: "škol už sledovalo naše živé vysílání",
    description: "Doložená zkušenost s živým programem pro školy.",
    visible: true,
  },
  {
    id: "hodiny-programu",
    value: "1 000+",
    label: "hodin živého programu",
    description: "Zkušenost s pravidelným vysíláním a moderovaným obsahem.",
    visible: true,
  },
  {
    id: "oblasti-obce",
    value: "16",
    label: "oblastí života v obci",
    description: "Program pokrývá témata důležitá pro školy, spolky, rodiny i seniory.",
    visible: true,
  },
  {
    id: "generace",
    value: "3 generace",
    label: "v jednom programu",
    description: "Děti, dospělí i senioři získávají společný prostor pro vzdělávání a setkávání.",
    visible: true,
  },
];

export const patronageSection = {
  eyebrow: "Důvěra",
  title: "Projekt ARCHIMEDES pod významnými záštitami",
  items: [
    {
      id: "eva-pavlova",
      mark: "EP",
      name: "Eva Pavlová",
      role: "manželka prezidenta České republiky",
      visible: true,
    },
    {
      id: "mmr",
      mark: "MMR",
      name: "Ministerstvo pro místní rozvoj",
      role: "České republiky",
      visible: true,
    },
    {
      id: "mpo",
      mark: "MPO",
      name: "Ministerstvo průmyslu",
      role: "a obchodu",
      visible: true,
    },
    {
      id: "mzp",
      mark: "MŽP",
      name: "Ministerstvo životního prostředí",
      role: "České republiky",
      visible: true,
    },
  ],
};

export const referencesSection = {
  eyebrow: "Výsledky projektu ARCHIMEDES",
  title: "Obce, kterým projekt ARCHIMEDES pomohl k významnému ocenění",
  showAllLabel: "Zobrazit všechny reference",
  showAllHref: "/ucebna#oceneni",
  readStoryLabel: "Přečíst příběh",
};

export const references = [
  {
    id: "cejc",
    name: "Čejč",
    region: "Jihomoravský kraj",
    badge: "1. místo Vesnice roku 2026 JMK",
    crest: null,
    crestAlt: null,
    photo: "/cejc.jpg",
    photoAlt: "Obec Čejč, oceněná 1. místem v soutěži Vesnice roku 2026 JMK",
    storyHref: "/ucebna#oceneni",
    visible: true,
  },
  {
    id: "krenov",
    name: "Křenov",
    region: "Jihomoravský kraj",
    badge: "1. místo Obec 2030 ČR",
    crest: "/obec2030.jpeg",
    crestAlt: "Ocenění Obec 2030 ČR pro obec Křenov",
    photo: "/krenov.jpg",
    photoAlt: "Obec Křenov, vítěz ocenění Obec 2030 ČR",
    storyHref: "/ucebna#oceneni",
    visible: true,
  },
  {
    id: "hodonin",
    name: "Hodonín",
    region: "Jihomoravský kraj",
    badge: "3. místo Zdravá města ČR",
    crest: "/hodonin-erb.jpg",
    crestAlt: "Znak města Hodonín",
    photo: "/zdravamesta.jpg",
    photoAlt: "Ocenění Zdravá města ČR pro Hodonín",
    storyHref: "/ucebna#oceneni",
    visible: true,
  },
  {
    id: "provodov-sonov",
    name: "Provodov-Šonov",
    region: "Královéhradecký kraj",
    badge: "Bílá stuha, Vesnice roku 2026",
    crest: null,
    crestAlt: null,
    photo: "/provodov-sonov.png",
    photoAlt: "Znak obce Provodov-Šonov, oceněné Bílou stuhou v soutěži Vesnice roku 2026",
    photoFit: "contain",
    storyHref: "/ucebna#oceneni",
    visible: true,
  },
];

export const ctaBand = {
  title: "Přineste společný živý program i do své obce",
  subtitle: "Probereme s vámi, jak mohou program využívat místní školy, spolky a senioři.",
  cta: { label: "Chci program pro naši obec", href: "/zadost" },
  visible: true,
};

export const footerContent = {
  legalName: "EduVision s.r.o.",
  tagline:
    "Pravidelný živý program pro školy, spolky, seniory a další komunity v obci.",
  columns: [
    {
      title: "ARCHIMEDES Live",
      links: [
        { label: "Program", href: "/program" },
        { label: "Pro obce", href: "/obec" },
        { label: "Pro školy", href: "/skoly" },
        { label: "Pro spolky", href: "/spolky" },
        { label: "Pro svazy", href: "/pro-organizace" },
      ],
    },
    {
      title: "ARCHIMEDES",
      links: [
        { label: "Učebna ARCHIMEDES", href: "/ucebna" },
        { label: "ARCHIMEDES DAY", href: "/archimedes-day" },
        { label: "Média a realizace", href: "/media" },
        { label: "Naše vize", href: "/o-nas" },
        { label: "Kontakt", href: "/kontakt" },
      ],
    },
    {
      title: "Přístup",
      links: [
        { label: "Přihlášení", href: "/login" },
        { label: "Žádost o program", href: "/zadost" },
      ],
    },
  ],
  social: [
    {
      label: "ARCHIMEDES Live na Facebooku",
      href: "https://www.facebook.com/profile.php?id=61566688307686&locale=cs_CZ",
      icon: "facebook",
      visible: true,
    },
    {
      label: "ARCHIMEDES Live na Instagramu",
      href: "https://www.instagram.com/archimedes_live/",
      icon: "instagram",
      visible: true,
    },
    {
      label: "ARCHIMEDES Live na LinkedIn",
      href: "https://www.linkedin.com/company/108554477/",
      icon: "linkedin",
      visible: true,
    },
  ],
  legalLinks: [
    { label: "Ochrana osobních údajů", href: "/ochrana-osobnich-udaju" },
    { label: "Obchodní podmínky", href: "/vop" },
  ],
};
