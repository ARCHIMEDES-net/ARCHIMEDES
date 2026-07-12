/**
 * Data for the "16 komunitních oblastí" section on the homepage.
 *
 * Codes and labels are kept identical to the `activity_categories` DB
 * catalog (supabase/migrations/0002_blok_a_activity_categories.sql,
 * section 'spolky') so the public marketing copy always matches what
 * organizations pick from in the portal — see icon keys mapped in
 * components/partners/CommunityCategoriesSection.jsx.
 */

export const communityCategoriesSection = {
  eyebrow: "Komunita v obci",
  title: "16 komunitních oblastí, na kterých obci pomáháme stavět",
  subtitle:
    "Od hasičů po Smart City — každá oblast má vlastní obsah a organizace v ní najdou program šitý na míru.",
};

export const communityCategoriesCta = {
  title: "Zapojte celou obec",
  subtitle:
    "Vyplňte krátkou žádost a ozveme se vám s dalším postupem, jak zapojit spolky ve vaší obci.",
  cta: { label: "Chci program pro naši obec", href: "/zadost" },
  visible: true,
};

export const communityCategories = [
  { code: "hasici", label: "Požární ochrana", icon: "flame", order: 1, visible: true },
  { code: "sport", label: "Sport a tělovýchova", icon: "dumbbell", order: 2, visible: true },
  { code: "myslivost", label: "Myslivost", icon: "tree-pine", order: 3, visible: true },
  { code: "vcelarstvi", label: "Včelařství", icon: "hexagon", order: 4, visible: true },
  { code: "zahradkari", label: "Zahrádkáři a pěstitelé", icon: "sprout", order: 5, visible: true },
  { code: "rybarstvi", label: "Rybářství", icon: "fish", order: 6, visible: true },
  { code: "chovatelstvi", label: "Chovatelství", icon: "paw-print", order: 7, visible: true },
  { code: "folklor", label: "Folklor a tradice", icon: "music", order: 8, visible: true },
  { code: "kultura", label: "Kultura a umění", icon: "palette", order: 9, visible: true },
  { code: "seniori", label: "Senioři", icon: "users", order: 10, visible: true },
  { code: "rodice_deti", label: "Rodiče a děti", icon: "baby", order: 11, visible: true },
  { code: "mladez", label: "Děti a mládež", icon: "graduation-cap", order: 12, visible: true },
  { code: "socialni", label: "Sociální a zdravotní", icon: "heart-pulse", order: 13, visible: true },
  { code: "duchovni", label: "Duchovní společenství", icon: "church", order: 14, visible: true },
  { code: "komunita", label: "Okrašlovací a komunitní", icon: "tree-deciduous", order: 15, visible: true },
  { code: "smart_city", label: "Chytrá obec", icon: "building", order: 16, visible: true },
];
