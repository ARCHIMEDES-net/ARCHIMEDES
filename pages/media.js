import { useEffect, useState } from "react";
import { ArrowRight, ArrowUpRight, X } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { cn } from "../lib/utils";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import SectionEyebrow from "../components/home/SectionEyebrow";

const heroImg = "/kamera.webp";
const aboutImg = "/detidoucebny.webp";

const galleryClassImg = "/ucitelka.jpeg";
const galleryTechImg = "/atmos.webp";
const galleryCommunityImg = "/ucebna-komunita.webp";
const galleryMediaImg = "/image-1.png";

const mediaSectionImg = "/ucebna-media.webp";
const galleryHeroImg = "/techn.webp";
const SCHOOLS_BUCKET = "schools";

const EXCLUDED_REFERENCE_CITIES = ["Břeclav", "Prešov", "Provodov", "Žleby", "Humpolec"];

const mediaPoints = [
  "realizace ve školách a v obcích",
  "reprezentativní prostor pro vzdělávání i komunitní život",
  "spojení kvalitní architektury, technologií a přírody",
  "silný vizuální i společenský přesah projektu",
];

const storyGallery = [
  {
    src: galleryHeroImg,
    title: "Exteriér učebny ARCHIMEDES®",
    text: "Reprezentativní venkovní učebna zasazená do přirozeného prostředí.",
    ratio: "wide",
  },
  {
    src: galleryClassImg,
    title: "Výuka v praxi",
    text: "ARCHIMEDES® jako živý prostor pro každodenní vzdělávání.",
    ratio: "standard",
  },
  {
    src: galleryTechImg,
    title: "Moderní technologie",
    text: "Interaktivní výuka, digitální vybavení a kvalitní zázemí.",
    ratio: "standard",
  },
  {
    src: galleryCommunityImg,
    title: "Komunitní život",
    text: "Prostor pro akce obce, setkávání i společné zážitky.",
    ratio: "standard",
  },
  {
    src: galleryMediaImg,
    title: "Veřejná a mediální pozornost",
    text: "Projekt, který vzbuzuje zájem odborníků i veřejnosti.",
    ratio: "standard",
  },
];

const mediaLinks = [
  {
    title: "BVV / URBIS",
    text: "ARCHIMEDES® zahájil éru Living Lab na brněnském výstavišti.",
    href: "https://www.bvv.cz/urbis/aktuality/archimedes-r-zahajil-eru-living-lab-na-vystavisti",
    domain: "bvv.cz",
  },
  {
    title: "iDNES",
    text: "Moderní venkovní učebna ARCHIMEDES® jako nový směr ve vzdělávání.",
    href: "https://www.idnes.cz/brno/zpravy/venkovni-ucebna-archimedes-moderni-vyuka-antonin-koplik.A240403_092205_brno-zpravy_krut",
    domain: "idnes.cz",
  },
  {
    title: "RTVJ",
    text: "Hovorany sázejí na nejmodernější technologie ve vzdělávání.",
    href: "https://www.rtvj.cz/hovorany-sazeji-na-nejmodernejsi-technologie-ve-vzdelavani/",
    domain: "rtvj.cz",
  },
  {
    title: "Česká televize",
    text: "Zpravodajský výstup věnovaný projektu ARCHIMEDES®.",
    href: "https://www.ceskatelevize.cz/porady/10253066674-zpravy-ve-12/223411012000328/",
    domain: "ceskatelevize.cz",
  },
  {
    title: "iDNES / Hodonín",
    text: "Venkovní učebna jako nová cesta, jak učit děti jinak.",
    href: "https://www.idnes.cz/brno/zpravy/venkovni-ucebna-skola-vyuka-zaci-hodonin-archimedes-skolstvi.A230717_122219_brno-zpravy_krut",
    domain: "idnes.cz",
  },
  {
    title: "Blesk",
    text: "Reportáž o unikátním konceptu učeben ARCHIMEDES®.",
    href: "https://www.blesk.cz/clanek/regiony-brno-brno-zpravy/748154/prevrat-ve-skolstvi-v-hodonine-vymysleli-unikatni-ucebny-chteji-je-na-celem-svete.html",
    domain: "blesk.cz",
  },
  {
    title: "CzechCrunch",
    text: "Český nápad, který přináší dětem nový typ vzdělávacího prostoru.",
    href: "https://cc.cz/cech-vymyslel-specialni-ucebnu-deti-diky-ni-mohou-pozorovat-co-se-deje-v-ptaci-budce-nebo-u-pyramid/",
    domain: "cc.cz",
  },
  {
    title: "ExportMag",
    text: "Vize sítě chytrých učeben ARCHIMEDES® s českými technologiemi.",
    href: "https://www.exportmag.cz/pribery-exporteru/ve-svete-vznikne-sit-chytrych-uceben-archimedes-s-ceskymi-technologiemi/",
    domain: "exportmag.cz",
  },
  {
    title: "iBrno",
    text: "Living Lab na brněnském výstavišti a prostor pro inovace.",
    href: "https://www.ibrno.cz/business/67259-living-lab-na-brnenskem-vystavisti-nabidne-prostor-pro-inovace-a-spolupraci.html",
    domain: "ibrno.cz",
  },
  {
    title: "Mikulov",
    text: "Mikulovští žáci dostali moderní venkovní učebnu ARCHIMEDES®.",
    href: "https://www.mikulov.cz/obcan/aktuality/702-mikulovsti-zaci-dostali-moderni-venkovni-ucebnu-archimedes",
    domain: "mikulov.cz",
  },
];

function publicUrlFromPath(path) {
  if (!path) return null;
  const { data } = supabase.storage.from(SCHOOLS_BUCKET).getPublicUrl(path);
  return data?.publicUrl || null;
}

function getFavicon(domain) {
  return `https://www.google.com/s2/favicons?sz=128&domain=${domain}`;
}

function normalizeText(value) {
  return (value || "")
    .toString()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

function isExcludedReference(row) {
  const city = normalizeText(row?.city);
  const name = normalizeText(row?.name);

  return EXCLUDED_REFERENCE_CITIES.some((excluded) => {
    const value = normalizeText(excluded);
    return (
      city.includes(value) || name.includes(value) || city.startsWith(value) || name.startsWith(value)
    );
  });
}

function SectionTitle({ children, className = "" }) {
  return (
    <h2
      className={cn(
        "mb-4 text-[42px] font-[950] leading-[1.02] tracking-[-0.04em] text-navy-900",
        className
      )}
    >
      {children}
    </h2>
  );
}

function SafeImage({ src, alt, className }) {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={(e) => {
        e.currentTarget.style.display = "none";
        const parent = e.currentTarget.parentElement;
        if (parent && !parent.querySelector(".img-fallback")) {
          const fallback = document.createElement("div");
          fallback.className =
            "img-fallback flex min-h-[220px] items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 p-6 text-center text-[15px] leading-relaxed text-slate-500";
          fallback.innerText = alt;
          parent.appendChild(fallback);
        }
      }}
    />
  );
}

export default function MediaPage() {
  const [activeImage, setActiveImage] = useState(null);
  const [realizace, setRealizace] = useState([]);
  const [loadingRealizace, setLoadingRealizace] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadRealizace() {
      setLoadingRealizace(true);

      const { data, error } = await supabase
        .from("schools")
        .select("id, name, city, photo_path, is_published, created_at")
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (!mounted) return;

      if (error) {
        console.error("Chyba při načítání referencí:", error.message);
        setRealizace([]);
        setLoadingRealizace(false);
        return;
      }

      const items = (data || [])
        .filter((row) => !isExcludedReference(row))
        .map((row) => ({
          id: row.id,
          city: row.city || row.name || "Realizace ARCHIMEDES",
          title: row.name || row.city || "ARCHIMEDES",
          img: publicUrlFromPath(row.photo_path),
        }))
        .filter((item) => item.img)
        .sort((a, b) => a.city.localeCompare(b.city, "cs"));

      setRealizace(items);
      setLoadingRealizace(false);
    }

    loadRealizace();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-50 to-slate-100">
      <main>
        <section className="mx-auto max-w-[1240px] px-5 pb-6 pt-14">
          <div className="grid grid-cols-1 items-center gap-9 lg:grid-cols-[1.02fr_0.98fr]">
            <div>
              <SectionEyebrow>ARCHIMEDES® • média a reference</SectionEyebrow>

              <h1 className="text-[46px] font-[950] leading-[0.98] tracking-[-0.05em] text-navy-900 sm:text-[58px]">
                Média a reference
                <br />
                ARCHIMEDES®
              </h1>

              <h2 className="mt-4 max-w-[720px] text-2xl font-bold leading-[1.22] text-slate-700">
                Podívejte se na projekt, který spojuje vzdělávání, architekturu a komunitní život.
              </h2>

              <p className="mt-4 max-w-[760px] text-xl leading-relaxed text-muted">
                ARCHIMEDES® je víc než stavba. Je to prostředí, které pomáhá školám
                i obcím vytvářet silnější vztah ke vzdělávání, místu a společnému
                prožívání. Na této stránce najdete reálné realizace i výběr mediálních
                výstupů, které ukazují jeho skutečné využití a veřejný přesah.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Button href="/ucebna">Zpět na stránku učebny</Button>
                <Button href="/zadost" variant="secondary">
                  Chci program pro naši obec
                </Button>
              </div>
            </div>

            <div className="overflow-hidden rounded-card-lg border border-slate-900/[0.08] bg-white shadow-[0_28px_80px_rgba(15,23,42,0.12)]">
              <SafeImage
                src={heroImg}
                alt="Venkovní učebna ARCHIMEDES®"
                className="aspect-[16/10] w-full object-cover"
              />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1240px] px-5 py-2">
          <Card className="p-7 sm:p-8">
            <div className="grid grid-cols-1 items-center gap-7 lg:grid-cols-[1fr_0.92fr]">
              <div>
                <SectionEyebrow>O projektu</SectionEyebrow>
                <SectionTitle>Co dělá ARCHIMEDES® výjimečným</SectionTitle>

                <p className="mb-4 text-lg leading-[1.78] text-muted">
                  ARCHIMEDES® vznikl jako odpověď na potřebu moderního,
                  reprezentativního a přitom lidského prostoru pro školy a obce.
                  Nejde jen o technické řešení. Jde o místo, které má atmosféru,
                  charakter a přirozeně zve děti i dospělé dovnitř.
                </p>

                <div className="grid gap-2.5 text-base leading-relaxed text-muted">
                  {mediaPoints.map((item) => (
                    <div key={item}>• {item}</div>
                  ))}
                </div>
              </div>

              <div className="overflow-hidden rounded-card-md border border-slate-900/[0.08] bg-white shadow-[0_16px_40px_rgba(15,23,42,0.07)]">
                <SafeImage
                  src={aboutImg}
                  alt="Výuka v učebně ARCHIMEDES®"
                  className="aspect-[16/11] w-full object-cover"
                />
              </div>
            </div>
          </Card>
        </section>

        <section id="reference" className="mx-auto max-w-[1240px] px-5 py-2">
          <Card className="p-7 sm:p-8">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
              <div>
                <SectionEyebrow>Reference</SectionEyebrow>
                <SectionTitle>Síť učeben ARCHIMEDES® v obcích a školách</SectionTitle>
                <p className="max-w-[900px] text-lg leading-[1.78] text-muted">
                  Níže vidíte realizace vybraných učeben ze sítě ARCHIMEDES®.
                </p>
              </div>

              <Button href="/zadost" variant="secondary">
                Chci program pro naši obec
              </Button>
            </div>

            {loadingRealizace ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-5 text-center text-base leading-relaxed text-muted">
                Načítám reference…
              </div>
            ) : realizace.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {realizace.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveImage(item)}
                    className="group relative overflow-hidden rounded-2xl border-0 bg-white p-0 shadow-[0_12px_30px_rgba(15,23,42,0.08)] transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_38px_rgba(15,23,42,0.12)]"
                  >
                    <img
                      src={item.img}
                      alt={item.city}
                      className="aspect-[16/10] w-full object-cover"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy-900/78 to-navy-900/0 px-4 pb-3.5 pt-4 text-left">
                      <span className="text-base font-bold leading-tight text-white">
                        {item.city}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-5 text-center text-base leading-relaxed text-muted">
                Reference se zatím nepodařilo načíst.
              </div>
            )}
          </Card>
        </section>

        <section className="mx-auto max-w-[1240px] px-5 py-2">
          <Card className="p-7 sm:p-8">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
              <div>
                <SectionEyebrow>Fotogalerie projektu</SectionEyebrow>
                <SectionTitle>Atmosféra, technologie a využití</SectionTitle>
              </div>

              <Button href="/kontakt" variant="secondary">
                Chci si domluvit návštěvu
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {storyGallery.map((item) => (
                <div
                  key={item.title}
                  className={cn(
                    "overflow-hidden rounded-card-md border border-slate-900/[0.08] bg-white shadow-[0_16px_40px_rgba(15,23,42,0.07)]",
                    item.ratio === "wide" && "sm:col-span-2"
                  )}
                >
                  <div className="overflow-hidden bg-eyebrow">
                    <SafeImage
                      src={item.src}
                      alt={item.title}
                      className={cn(
                        "w-full object-cover",
                        item.ratio === "wide" ? "aspect-video" : "aspect-[16/11]"
                      )}
                    />
                  </div>

                  <div className="p-5">
                    <div className="mb-2 text-xl font-black leading-[1.15] tracking-[-0.02em] text-navy-900">
                      {item.title}
                    </div>
                    <div className="text-sm leading-relaxed text-muted">{item.text}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </section>

        <section className="mx-auto max-w-[1240px] px-5 py-2">
          <Card className="p-7 sm:p-8">
            <div className="grid grid-cols-1 items-center gap-7 lg:grid-cols-[1fr_0.92fr]">
              <div>
                <SectionEyebrow>Mediální přesah</SectionEyebrow>
                <SectionTitle>Projekt, který je vidět</SectionTitle>

                <p className="mb-4 text-lg leading-[1.78] text-muted">
                  ARCHIMEDES® zaujme nejen svým vzhledem, ale především tím,
                  jak přirozeně propojuje vzdělávání, veřejný prostor a komunitní
                  využití. Díky tomu budí pozornost partnerů, návštěvníků i médií.
                </p>

                <p className="text-lg leading-[1.78] text-muted">
                  Každá realizace posiluje důvěru v to, že kvalitní prostředí má
                  ve vzdělávání i v životě obcí skutečný význam.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Button href="/zadost">
                    Chci program pro naši obec
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Button>
                  <Button href="/ucebna" variant="secondary">
                    Zobrazit technické varianty
                  </Button>
                </div>
              </div>

              <div className="overflow-hidden rounded-card-md border border-slate-900/[0.08] bg-white shadow-[0_16px_40px_rgba(15,23,42,0.07)]">
                <SafeImage
                  src={mediaSectionImg}
                  alt="Mediální pozornost projektu ARCHIMEDES®"
                  className="aspect-[16/11] w-full object-cover"
                />
              </div>
            </div>
          </Card>
        </section>

        <section className="mx-auto max-w-[1240px] px-5 py-2">
          <Card className="p-7 sm:p-8">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
              <div>
                <SectionEyebrow>ARCHIMEDES® v médiích</SectionEyebrow>
                <SectionTitle>Výběr článků a reportáží</SectionTitle>
              </div>

              <a
                href="https://www.archimedesoec.com/media/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-[52px] items-center gap-1.5 rounded-2xl border border-slate-900/10 bg-white/72 px-5 font-bold text-navy-900 shadow-[0_10px_24px_rgba(15,23,42,0.05)]"
              >
                Původní přehled médií <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {mediaLinks.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-2xl border border-slate-900/[0.08] bg-gradient-to-b from-white to-slate-50 p-5 shadow-[0_14px_34px_rgba(15,23,42,0.05)] transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_38px_rgba(15,23,42,0.08)]"
                >
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-900/[0.08] bg-white shadow-[0_8px_18px_rgba(15,23,42,0.05)]">
                    <img src={getFavicon(item.domain)} alt={item.title} className="h-7 w-7 object-contain" />
                  </div>

                  <div className="mb-2.5 text-[22px] font-black leading-[1.14] tracking-[-0.02em] text-navy-900">
                    {item.title}
                  </div>
                  <div className="text-sm leading-relaxed text-muted">{item.text}</div>
                  <div className="mt-3.5 inline-flex items-center gap-1 text-sm font-bold text-navy-900">
                    Otevřít článek <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </div>
                </a>
              ))}
            </div>
          </Card>
        </section>

        <section className="mx-auto max-w-[1240px] px-5 pb-16 pt-2">
          <Card className="bg-gradient-to-b from-white to-slate-50 p-8 text-center sm:p-9">
            <SectionEyebrow>Další krok</SectionEyebrow>
            <SectionTitle className="text-[36px] sm:text-[44px]">
              Chcete vidět, jak by ARCHIMEDES® fungoval u vás?
            </SectionTitle>

            <p className="mx-auto mb-6 max-w-[840px] text-lg leading-[1.72] text-muted">
              Rádi vám představíme vhodnou variantu, možnosti využití pro školu
              i obec a navrhneme řešení, které bude odpovídat vašemu prostoru,
              provozu i ambicím.
            </p>

            <div className="flex flex-wrap justify-center gap-3">
              <Button href="/zadost">Chci program pro naši obec</Button>
              <Button href="/kontakt" variant="secondary">
                Domluvit osobní konzultaci
              </Button>
            </div>
          </Card>
        </section>

        {activeImage && (
          <div
            onClick={() => setActiveImage(null)}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-navy-900/82 p-6"
          >
            <div onClick={(e) => e.stopPropagation()} className="relative w-full max-w-[1100px]">
              <button
                type="button"
                onClick={() => setActiveImage(null)}
                aria-label="Zavřít"
                className="absolute -right-2.5 -top-2.5 flex h-[42px] w-[42px] items-center justify-center rounded-full bg-white text-navy-900 shadow-[0_10px_24px_rgba(15,23,42,0.25)]"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>

              <img
                src={activeImage.img}
                alt={activeImage.city}
                className="block max-h-[82vh] w-full rounded-2xl bg-white object-contain"
              />

              <div className="mt-3 text-center text-lg font-bold text-white">{activeImage.city}</div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
