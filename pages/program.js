import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ArrowRight, X } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { cn } from "../lib/utils";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import SectionEyebrow from "../components/home/SectionEyebrow";

const FALLBACK_POSTER = "/ucebna-exterier.webp";
const MAY_PROGRAM_IMAGE = "/program-card.webp";

const schoolItems = [
  {
    title: "Živé vysílání pro I. stupeň ZŠ",
    text: "poznávání světa, přírody a společnosti ve spolupráci s odborníky a inspirativními partnery",
  },
  {
    title: "Živé vysílání pro II. stupeň ZŠ",
    text: "aktuální témata, rozhovory a exkurze v angličtině ze zahraničí, výuka živě z praxe",
  },
  {
    title: "Wellbeing žáků",
    text: "duševní zdraví, bezpečné klima ve třídě a témata důležitá pro dnešní žáky",
  },
  {
    title: "Kariérní poradenství jinak",
    text: "setkání s lidmi z praxe a inspirace pro další studium i životní směřování",
  },
  {
    title: "Čtenářský klub Magnesia Litera",
    text: "společné čtení a živé debaty s autory knih a osobnostmi spojenými s literaturou",
  },
  {
    title: "Živý rozhovor s hostem v angličtině",
    text: "inspirativní vstupy ze zahraničí a přirozený kontakt s jazykem v reálném kontextu",
  },
  {
    title: "Možnost vysílání přímo z vaší školy",
    text: "škola může být aktivní součástí programu a zapojit se i jako místo živého vstupu",
  },
];

const communityItems = [
  {
    title: "Senior klub",
    text: "interaktivní rozhovory s inspirativními hosty, aktuální témata, vzdělávání, partnerství a pravidelná setkávání",
  },
  {
    title: "Čtenářský klub",
    text: "společné čtení a živé debaty s autory knih",
  },
  {
    title: "Vzdělávání dobrovolných hasičů",
    text: "praktický obsah a online vstupy využitelné pro místní jednotky i vedení obce",
  },
  {
    title: "Smart City klub",
    text: "program pro deváťáky a mladé lidi, kteří chtějí přemýšlet o budoucnosti své obce",
  },
  {
    title: "Servis pro zastupitele a komunitu",
    text: "sdílení dobré praxe, inspirace a témata pro rozvoj obce a komunitního života",
  },
  {
    title: "Letní filmový klub s Aerofilms",
    text: "výběr kvalitních filmů s úvodem hostů a možností společného zážitku v obci",
  },
];

const svazyItems = [
  {
    title: "Svaz včelařů ČR",
    text: "poznávání včelařství a ochrany přírody, workshopy a besedy pro školy i veřejnost",
  },
  {
    title: "Českomoravská myslivecká jednota",
    text: "myslivost, péče o krajinu a vztah k přírodě pro děti i dospělé",
  },
  {
    title: "Český rybářský svaz",
    text: "rybářství, vodní ekosystémy a ochrana přírody u vody",
  },
  {
    title: "Svaz zahrádkářů",
    text: "zahrádkaření, pěstitelství a sdílení zkušeností mezi generacemi",
  },
  {
    title: "Junák – český skaut",
    text: "oddílová činnost, dobrodružství a výchova k samostatnosti",
  },
];

const programBlocks = [...schoolItems, ...communityItems, ...svazyItems];

function SectionTitle({ eyebrow, title, text, center = false }) {
  return (
    <div className={cn("max-w-[900px]", center ? "mx-auto mb-7 text-center" : "mb-7")}>
      {eyebrow ? <SectionEyebrow>{eyebrow}</SectionEyebrow> : null}
      <h2 className="text-[clamp(30px,4vw,48px)] font-[950] leading-[1.08] tracking-[-0.02em] text-navy-900">
        {title}
      </h2>
      {text ? <p className="mt-4 text-lg leading-relaxed text-muted">{text}</p> : null}
    </div>
  );
}

function ProgramBlockCard({ title, text }) {
  return (
    <Card className="p-5">
      <div className="text-[16.5px] font-bold leading-snug text-navy-900">{title}</div>
      <div className="mt-2 text-[15px] leading-relaxed text-muted">{text}</div>
    </Card>
  );
}

function formatEventDate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";

  return d.toLocaleString("cs-CZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isAbsoluteUrl(value) {
  return typeof value === "string" && /^https?:\/\//i.test(value);
}

function getPosterUrl(event) {
  if (!event) return FALLBACK_POSTER;

  if (event.poster_url && isAbsoluteUrl(event.poster_url)) return event.poster_url;

  if (event.poster_url && typeof event.poster_url === "string") {
    const normalizedPosterUrl = event.poster_url.replace(/^\/+/, "");
    const { data } = supabase.storage.from("posters").getPublicUrl(normalizedPosterUrl);
    return data?.publicUrl || FALLBACK_POSTER;
  }

  if (event.poster_path && typeof event.poster_path === "string") {
    const normalizedPosterPath = event.poster_path.replace(/^\/+/, "");
    const { data } = supabase.storage.from("posters").getPublicUrl(normalizedPosterPath);
    return data?.publicUrl || FALLBACK_POSTER;
  }

  return FALLBACK_POSTER;
}

function EventBadge({ children, variant = "default" }) {
  if (variant === "accent") {
    return (
      <span className="inline-flex min-h-[28px] items-center rounded-full border border-purple-200 bg-purple-100 px-2.5 text-[13px] font-bold text-purple-700">
        {children}
      </span>
    );
  }
  return <Badge variant="outline">{children}</Badge>;
}

function UpcomingEventItem({ event, onPosterClick }) {
  const badges = Array.isArray(event.audience_groups) ? event.audience_groups : [];
  const posterUrl = getPosterUrl(event);

  return (
    <div className="grid grid-cols-[78px_1fr] items-start gap-3.5 rounded-card-md border border-slate-200 bg-white p-3.5 shadow-[0_10px_26px_rgba(15,23,42,0.05)] sm:grid-cols-[88px_1fr]">
      <button
        type="button"
        onClick={() =>
          onPosterClick({
            src: posterUrl,
            alt: event.title || "Plakát vysílání",
          })
        }
        title="Zvětšit plakát"
        className="group block h-[106px] w-[78px] overflow-hidden rounded-2xl border-0 bg-transparent p-0 shadow-[0_8px_18px_rgba(15,23,42,0.1)] sm:h-[118px] sm:w-[88px]"
      >
        <img
          src={posterUrl}
          alt={event.title || "Plakát vysílání"}
          className="h-full w-full rounded-2xl bg-slate-200 object-cover transition-transform duration-200 group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = FALLBACK_POSTER;
          }}
        />
      </button>

      <div>
        <div className="mb-1.5 text-[13px] font-bold leading-relaxed text-slate-500">
          {formatEventDate(event.starts_at)}
        </div>

        <div className="text-[19px] font-bold leading-[1.32] tracking-[-0.02em] text-navy-900">
          {event.title}
        </div>

        {event.category ? (
          <div className="mt-2.5">
            <EventBadge>{event.category}</EventBadge>
          </div>
        ) : null}

        {badges.length ? (
          <div className="mt-2.5 flex flex-wrap gap-2">
            {badges.slice(0, 4).map((badge, i) => (
              <EventBadge key={`${badge}-${i}`} variant={badge === "Komunita" ? "accent" : "default"}>
                {badge}
              </EventBadge>
            ))}
          </div>
        ) : null}

        <div className="mt-3">
          <Link
            href="/start"
            className="inline-flex h-10 items-center justify-center rounded-xl bg-navy-900 px-3.5 text-sm font-black text-white shadow-[0_10px_22px_rgba(15,23,42,0.16)]"
          >
            Odkaz na vysílání
          </Link>
        </div>
      </div>
    </div>
  );
}

function CurrentProgramCard({ onOpen }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="grid w-full grid-cols-1 items-center gap-4 rounded-card-lg border border-blue-100 bg-gradient-to-br from-white/96 to-blue-50/96 p-4 text-left shadow-[0_18px_40px_rgba(37,99,235,0.12)] transition-transform hover:-translate-y-0.5 sm:grid-cols-[118px_1fr]"
    >
      <div className="relative h-[150px] overflow-hidden rounded-2xl bg-white shadow-[0_12px_28px_rgba(15,23,42,0.12)]">
        <Image
          src={MAY_PROGRAM_IMAGE}
          alt="Aktuální program květen 2026"
          fill
          sizes="118px"
          style={{ objectFit: "cover", objectPosition: "top" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-navy-900/0 from-40% to-navy-900/58" />
        <div className="absolute bottom-2.5 left-2.5 rounded-full bg-red-500 px-2.5 py-1 text-xs font-black text-white">
          live
        </div>
      </div>

      <div>
        <span className="mb-2.5 inline-flex items-center rounded-full bg-blue-100 px-2.5 py-1.5 text-[13px] font-black text-brand">
          Aktuálně
        </span>

        <h2 className="text-[clamp(24px,3vw,34px)] font-[950] leading-[1.08] tracking-[-0.03em] text-navy-900">
          Aktuální program
          <br />
          KVĚTEN 2026
        </h2>

        <p className="mt-2.5 text-base leading-snug text-muted">
          Kliknutím zobrazíte celý měsíční přehled akcí ve větším náhledu.
        </p>

        <div className="mt-3.5 inline-flex h-[42px] items-center gap-1.5 rounded-xl bg-navy-900 px-3.5 text-sm font-black text-white shadow-[0_10px_22px_rgba(15,23,42,0.16)]">
          Zvětšit program <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </div>
      </div>
    </button>
  );
}

function ImageModal({ image, onClose }) {
  useEffect(() => {
    if (!image) return;

    function handleKeyDown(e) {
      if (e.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [image, onClose]);

  if (!image) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-navy-900/84 p-4 sm:p-5"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex max-h-[94vh] w-[min(920px,96vw)] items-center justify-center"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Zavřít náhled"
          className="absolute -right-3 -top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-navy-900 text-white shadow-[0_14px_34px_rgba(0,0,0,0.35)]"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>

        <img
          src={image.src}
          alt={image.alt || "Zvětšený náhled"}
          className="block max-h-[94vh] max-w-full rounded-2xl bg-white object-contain shadow-[0_30px_90px_rgba(0,0,0,0.42)]"
        />
      </div>
    </div>
  );
}

export default function ProgramPage() {
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [modalImage, setModalImage] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function loadUpcomingEvents() {
      setEventsLoading(true);

      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from("events")
        .select("id, title, starts_at, poster_url, poster_path, audience_groups, category, is_published")
        .eq("is_published", true)
        .gte("starts_at", now)
        .order("starts_at", { ascending: true })
        .limit(5);

      if (!mounted) return;

      if (error) {
        console.error("Nepodařilo se načíst nadcházející vysílání:", error);
        setUpcomingEvents([]);
        setEventsLoading(false);
        return;
      }

      setUpcomingEvents(data || []);
      setEventsLoading(false);
    }

    loadUpcomingEvents();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <>
      <main className="min-h-screen bg-slate-50 px-5 pb-16 pt-10">
        <div className="mx-auto max-w-[1180px]">
          <Card className="overflow-hidden p-0">
            <div className="grid grid-cols-1 items-stretch lg:grid-cols-[1.02fr_1fr]">
              <div className="p-6 sm:p-9">
                <SectionEyebrow>Živý program pro školu a komunitu</SectionEyebrow>

                <h1 className="text-[clamp(36px,5vw,58px)] font-[950] leading-[1.02] tracking-[-0.04em] text-navy-900">
                  Co je v programu ARCHIMEDES Live
                </h1>

                <p className="mt-5 max-w-[620px] text-xl leading-relaxed text-slate-700">
                  Pravidelná živá vysílání a hotový obsah pro školu, seniory,
                  spolky i celou obec — v jedné licenci, po celý rok.
                </p>

                <div className="mt-7">
                  <Button href="/zadost">
                    Chci program pro naši obec
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </div>

                <div className="mt-7">
                  <CurrentProgramCard
                    onOpen={() =>
                      setModalImage({
                        src: MAY_PROGRAM_IMAGE,
                        alt: "Aktuální program květen 2026",
                      })
                    }
                  />
                </div>
              </div>

              <div className="border-t border-slate-200 bg-gradient-to-b from-blue-50 to-slate-50 p-5 lg:border-l lg:border-t-0">
                <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-navy-900/[0.82] px-3.5 py-2.5 text-sm font-bold text-white shadow-[0_10px_24px_rgba(15,23,42,0.14)]">
                  Nadcházející vysílání
                </span>

                <div className="events-scroll grid gap-3.5 pr-1 lg:max-h-[760px] lg:overflow-auto">
                  {eventsLoading ? (
                    <Card className="p-4 text-[15px] leading-relaxed text-slate-500">
                      Načítám nadcházející vysílání…
                    </Card>
                  ) : upcomingEvents.length > 0 ? (
                    upcomingEvents.map((event) => (
                      <UpcomingEventItem key={event.id} event={event} onPosterClick={setModalImage} />
                    ))
                  ) : (
                    <Card className="p-4 text-[15px] leading-relaxed text-slate-500">
                      Aktuálně zde nejsou zveřejněna žádná nadcházející vysílání.
                    </Card>
                  )}
                </div>
              </div>
            </div>
          </Card>

          <section id="varianty" className="mt-16">
            <SectionTitle
              title="Osmnáct programových bloků pod jednou licencí obce"
              text="Každý blok připravuje ARCHIMEDES Live ve spolupráci s odborníky a partnery — obec jen zapojí zájemce."
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {programBlocks.map((block) => (
                <ProgramBlockCard key={block.title} {...block} />
              ))}
            </div>
          </section>

          <section id="cena" className="mt-12">
            <div className="rounded-card-lg bg-navy-900 p-7 text-white sm:p-9">
              <h2 className="text-[clamp(26px,3.4vw,36px)] font-[950] leading-[1.15] tracking-[-0.03em]">
                Jedna licence, jedna cena pro celou obec
              </h2>

              <p className="mt-4 max-w-[680px] text-[17px] leading-relaxed text-white/82">
                Všech osmnáct bloků je součástí jedné obecní licence za 1 990
                Kč/měsíc — bez příplatků za jednotlivé spolky nebo organizace.
                Podrobnosti a přihlášku najdete na stránce Pro obce.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/obec"
                  className="inline-flex h-[50px] items-center justify-center rounded-2xl bg-white px-5 text-[15.5px] font-bold text-navy-900"
                >
                  Podrobnosti a ceník
                </Link>

                <Link
                  href="/zadost"
                  className="inline-flex h-[50px] items-center justify-center rounded-2xl border border-white/40 px-5 text-[15.5px] font-bold text-white"
                >
                  Chci program pro naši obec
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>

      <ImageModal image={modalImage} onClose={() => setModalImage(null)} />

      <style jsx global>{`
        .events-scroll::-webkit-scrollbar {
          width: 8px;
        }
        .events-scroll::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 999px;
        }
      `}</style>
    </>
  );
}
