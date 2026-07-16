/**
 * Data for the full, unranked overview of every community area ARCHIMEDES
 * Live supports — the "úplný přehled" linked from every "Zobrazit
 * všechny partnerské organizace a oblasti" link, rendered on
 * /pro-organizace.
 *
 * Codes and titles are kept identical to the `activity_categories` DB
 * catalog (supabase/migrations/0002_blok_a_activity_categories.sql,
 * section 'spolky') so the public marketing copy always matches what
 * organizations pick from in the portal. The catalog's 17th entry,
 * "Jiné" (code 'jine'), is a registration-form catch-all only and is
 * intentionally NOT included here — it never appears on the public
 * marketing site.
 *
 * `partnerSlug` links an area to its confirmed contractual partner in
 * content/partners.js (single source of truth for that org's name/
 * logo/website — never duplicated here). Areas without a specific
 * partner organization carry an `icon` key instead (see
 * components/partners/icons.js) and are rendered with that icon, never
 * a fake logo or placeholder.
 */

export const communityCategoriesSection = {
  eyebrow: "Oblasti místního života",
  title: "Pro jaké místní organizace program vzniká",
  subtitle:
    "Přehled oblastí, podle kterých si místní organizace vybírají témata a pozvánky. Partnerská organizace je uvedena pouze tam, kde je spolupráce potvrzená.",
};

export const communityCategoriesCta = {
  title: "Zapojte celou obec",
  subtitle:
    "Vyplňte krátkou žádost a ozveme se vám s dalším postupem, jak zapojit spolky ve vaší obci.",
  cta: { label: "Chci program pro naši obec", href: "/zadost" },
  visible: true,
};

export const communityCategories = [
  {
    code: "hasici",
    title: "Požární ochrana",
    description: "Sbory dobrovolných hasičů a záchranářský dorost",
    partnerSlug: "sh-cms",
    order: 1,
  },
  {
    code: "sport",
    title: "Sport a tělovýchova",
    description: "Tělovýchovné jednoty, sportovní kluby, Sokol a místní oddíly",
    partnerSlug: null,
    icon: "Trophy",
    order: 2,
  },
  {
    code: "myslivost",
    title: "Myslivost",
    description: "Myslivecké spolky, péče o krajinu a zvěř",
    partnerSlug: "myslivecka-jednota",
    order: 3,
  },
  {
    code: "vcelarstvi",
    title: "Včelařství",
    description: "Včelařské spolky a osvěta o ochraně opylovačů",
    partnerSlug: "svaz-vcelaru",
    order: 4,
  },
  {
    code: "zahradkari",
    title: "Zahrádkáři a pěstitelé",
    description: "Zahrádkářské spolky a péče o obecní zeleň",
    partnerSlug: "svaz-zahradkaru",
    order: 5,
  },
  {
    code: "rybarstvi",
    title: "Rybářství",
    description: "Rybářské spolky a péče o vodní toky a revíry",
    partnerSlug: "rybarsky-svaz",
    order: 6,
  },
  {
    code: "chovatelstvi",
    title: "Chovatelství",
    description: "Místní organizace chovatelů a spolky drobného zvířectva",
    partnerSlug: null,
    icon: "PawPrint",
    order: 7,
  },
  {
    code: "folklor",
    title: "Folklor a tradice",
    description: "Chasy, národopisné soubory a nositelé místních tradic",
    partnerSlug: null,
    icon: "Music",
    order: 8,
  },
  {
    code: "kultura",
    title: "Kultura a umění",
    description: "Ochotníci, pěvecké sbory, kapely a muzejní spolky",
    partnerSlug: null,
    icon: "Palette",
    order: 9,
  },
  {
    code: "seniori",
    title: "Senioři",
    description: "Kluby seniorů a mezigenerační program",
    partnerSlug: "rada-senioru",
    order: 10,
  },
  {
    code: "rodice_deti",
    title: "Rodiče a děti",
    description: "Spolky rodičů, SRPŠ, rodinná a mateřská centra",
    partnerSlug: null,
    icon: "Baby",
    order: 11,
  },
  {
    code: "mladez",
    title: "Děti a mládež",
    description: "Skautské oddíly a další organizace pro děti a mládež",
    partnerSlug: "junak",
    order: 12,
  },
  {
    code: "socialni",
    title: "Sociální a zdravotní oblast",
    description: "Charity, Červený kříž, dobrovolníci a pečující organizace",
    partnerSlug: "kridla-pro-budoucnost",
    order: 13,
  },
  {
    code: "duchovni",
    title: "Duchovní společenství",
    description: "Farnosti, farní charity a místní duchovní komunity",
    partnerSlug: null,
    icon: "Church",
    order: 14,
  },
  {
    code: "komunita",
    title: "Okrašlovací a komunitní spolky",
    description: "Spolky pečující o veřejný prostor, sousedské vztahy a rozvoj obce",
    partnerSlug: null,
    icon: "TreeDeciduous",
    order: 15,
  },
  {
    code: "smart_city",
    title: "Chytrá obec",
    description: "Smart City kluby, inovace a sdílení dobré praxe",
    partnerSlug: "jinag",
    order: 16,
  },
];
