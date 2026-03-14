import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { supabase } from "../lib/supabaseClient";
import Footer from "../components/Footer";

const SchoolsMap = dynamic(() => import("../components/SchoolsMap"), {
  ssr: false,
});

const BUCKET = "schools";

// Obrázky stejně jako v původní homepage ze ZIPu
const heroImg = "/ucebna.jpg";
const lessonImg = "/vyuka.jpeg";
const guestImg = "/ctenarsky.jpg";
const communityImg = "/smart.jpg";
const kidsImg = "/praxe.webp";

// fallback pouze pro případ, že by API dočasně nevrátilo data
const fallbackPosts = [
  { type: "p", id: "DVyqPmiiLKF" },
  { type: "p", id: "DVvUBXDCMYC" },
  { type: "p", id: "DVqEttcjpu0" },
];

const mediaLinks = [
  {
    label: "BVV / URBIS",
    domain: "bvv.cz",
    href: "https://www.bvv.cz/urbis/aktuality/archimedes-r-zahajil-eru-living-lab-na-vystavisti",
  },
  {
    label: "iDNES",
    domain: "idnes.cz",
    href: "https://www.idnes.cz/brno/zpravy/venkovni-ucebna-archimedes-moderni-vyuka-antonin-koplik.A240403_092205_brno-zpravy_krut",
  },
  {
    label: "RTVJ",
    domain: "rtvj.cz",
    href: "https://www.rtvj.cz/hovorany-sazeji-na-nejmodernejsi-technologie-ve-vzdelavani/",
  },
  {
    label: "Česká televize",
    domain: "ceskatelevize.cz",
    href: "https://www.ceskatelevize.cz/porady/10253066674-zpravy-ve-12/223411012000328/",
  },
  {
    label: "iDNES 2",
    domain: "idnes.cz",
    href: "https://www.idnes.cz/brno/zpravy/venkovni-ucebna-skola-vyuka-zaci-hodonin-archimedes-skolstvi.A230717_122219_brno-zpravy_krut",
  },
  {
    label: "Blesk",
    domain: "blesk.cz",
    href: "https://www.blesk.cz/clanek/regiony-brno-brno-zpravy/748154/prevrat-ve-skolstvi-v-hodonine-vymysleli-unikatni-ucebny-chteji-je-na-celem-svete.html",
  },
  {
    label: "CzechCrunch",
    domain: "cc.cz",
    href: "https://cc.cz/cech-vymyslel-specialni-ucebnu-deti-diky-ni-mohou-pozorovat-co-se-deje-v-ptaci-budce-nebo-u-pyramid/",
  },
  {
    label: "ExportMag",
    domain: "exportmag.cz",
    href: "https://www.exportmag.cz/pribery-exporteru/ve-svete-vznikne-sit-chytrych-uceben-archimedes-s-ceskymi-technologiemi/",
  },
  {
    label: "iBrno",
    domain: "ibrno.cz",
    href: "https://www.ibrno.cz/business/67259-living-lab-na-brnenskem-vystavisti-nabidne-prostor-pro-inovace-a-spolupraci.html",
  },
  {
    label: "Mikulov",
    domain: "mikulov.cz",
    href: "https://www.mikulov.cz/obcan/aktuality/702-mikulovsti-zaci-dostali-moderni-venkovni-venkovni-ucebnu-archimedes",
  },
];

function publicUrlFromPath(path) {
  if (!path) return null;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data?.publicUrl || null;
}

function toNumberOrNull(v) {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function normalizeLatLng(row) {
  const lat = toNumberOrNull(row?.latitude) ?? toNumberOrNull(row?.lat) ?? null;
  const lng =
    toNumberOrNull(row?.longitude) ?? toNumberOrNull(row?.lng) ?? null;

  return {
    ...row,
    lat: typeof lat === "number" ? lat : null,
    lng: typeof lng === "number" ? lng : null,
  };
}

function PrimaryButton({ href, children }) {
  return (
    <Link
      href={href}
      style={{
        textDecoration: "none",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 50,
        padding: "0 22px",
        borderRadius: 14,
        background: "#0f172a",
        color: "white",
        fontWeight: 800,
        border: "1px solid #0f172a",
        boxShadow: "0 10px 24px rgba(15,23,42,0.14)",
        transition: "transform 0.15s ease, box-shadow 0.15s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 14px 28px rgba(15,23,42,0.18)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 10px 24px rgba(15,23,42,0.14)";
      }}
    >
      {children}
    </Link>
  );
}

function WhiteButton({ href, children }) {
  return (
    <Link
      href={href}
      style={{
        textDecoration: "none",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 50,
        padding: "0 22px",
        borderRadius: 14,
        background: "white",
        color: "#0f172a",
        fontWeight: 900,
        border: "1px solid rgba(255,255,255,0.2)",
        transition: "transform 0.15s ease, box-shadow 0.15s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 12px 26px rgba(0,0,0,0.16)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {children}
    </Link>
  );
}

function OutlineLightButton({ href, children }) {
  return (
    <Link
      href={href}
      style={{
        textDecoration: "none",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 50,
        padding: "0 22px",
        borderRadius: 14,
        border: "1px solid rgba(255,255,255,0.3)",
        color: "white",
        fontWeight: 800,
        background: "transparent",
        transition:
          "transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.background = "rgba(255,255,255,0.06)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.background = "transparent";
      }}
    >
      {children}
    </Link>
  );
}

function getInstagramEmbedUrl(id, type) {
  if (type === "reel") {
    return `https://www.instagram.com/reel/${id}/embed`;
  }
  return `https://www.instagram.com/p/${id}/embed/captioned`;
}

function getInstagramPostUrl(id, type) {
  if (type === "reel") {
    return `https://www.instagram.com/reel/${id}/`;
  }
  return `https://www.instagram.com/p/${id}/`;
}

function InstagramEmbed({ id, type }) {
  const src = getInstagramEmbedUrl(id, type);
  const href = getInstagramPostUrl(id, type);

  return (
    <div
      style={{
        background: "white",
        border: "1px solid rgba(15,23,42,0.08)",
        borderRadius: 26,
        overflow: "hidden",
        boxShadow: "0 10px 30px rgba(15,23,42,0.05)",
      }}
    >
      <iframe
        src={src}
        title={`Instagram ${id}`}
        width="100%"
        height="470"
        frameBorder="0"
        scrolling="no"
        allowTransparency="true"
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
        style={{ display: "block", width: "100%", background: "white" }}
      />
      <div
        style={{
          padding: "12px 16px 16px",
          borderTop: "1px solid rgba(15,23,42,0.06)",
          background: "#fff",
        }}
      >
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          style={{
            textDecoration: "none",
            color: "#0f172a",
            fontWeight: 800,
            fontSize: 15,
          }}
        >
          Otevřít příspěvek na Instagramu →
        </a>
      </div>
    </div>
  );
}

function MediaLogoButton({ label, domain, href }) {
  const logoSrc = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="mediaLink"
      aria-label={label}
      title={label}
    >
      <span className="mediaLogoCard">
        <img
          src={logoSrc}
          alt={label}
          className="mediaLogoImg"
          loading="lazy"
        />
        <span className="mediaLogoText">{label}</span>
      </span>
    </a>
  );
}

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [instagramReady, setInstagramReady] = useState(false);

  const [schoolRows, setSchoolRows] = useState([]);
  const [mapLoading, setMapLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadInstagram() {
      try {
        const res = await fetch(`/api/instagram?t=${Date.now()}`, {
          cache: "no-store",
        });

        if (!res.ok) throw new Error("Instagram API failed");

        const data = await res.json();

        if (!cancelled && Array.isArray(data) && data.length) {
          setPosts(data.slice(0, 3));
          setInstagramReady(true);
          return;
        }

        if (!cancelled) {
          setPosts(fallbackPosts);
          setInstagramReady(true);
        }
      } catch (e) {
        if (!cancelled) {
          setPosts(fallbackPosts);
          setInstagramReady(true);
        }
      }
    }

    async function loadSchools() {
      try {
        const { data, error } = await supabase
          .from("schools")
          .select("*")
          .eq("is_published", true)
          .order("created_at", { ascending: false });

        if (error) throw error;

        const rows = (data || []).map(normalizeLatLng).map((row) => ({
          ...row,
          photo_url: row.photo_url || publicUrlFromPath(row.photo_path),
        }));

        if (!cancelled) {
          setSchoolRows(rows);
          setMapLoading(false);
        }
      } catch (e) {
        if (!cancelled) {
          setSchoolRows([]);
          setMapLoading(false);
        }
      }
    }

    loadInstagram();
    loadSchools();

    return () => {
      cancelled = true;
    };
  }, []);

  const renderedPosts = useMemo(() => {
    if (posts.length >= 3) return posts.slice(0, 3);
    return fallbackPosts;
  }, [posts]);

  const schoolsWithCoords = useMemo(() => {
    return schoolRows.filter(
      (r) => typeof r.lat === "number" && typeof r.lng === "number"
    );
  }, [schoolRows]);

  return (
    <div
      style={{
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
        background: "#f6f7fb",
        minHeight: "100vh",
      }}
    >
      <main>
        <section
          style={{ maxWidth: 1180, margin: "0 auto", padding: "56px 16px 32px" }}
        >
          <div className="heroGrid">
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 14px",
                  borderRadius: 999,
                  background: "rgba(15,23,42,0.06)",
                  color: "#0f172a",
                  fontSize: 13,
                  fontWeight: 800,
                  marginBottom: 18,
                }}
              >
                ARCHIMEDES Live • program + učebna + komunita
              </div>

              <h1
                style={{
                  fontSize: 56,
                  lineHeight: 1.04,
                  letterSpacing: "-0.03em",
                  color: "#0f172a",
                  margin: "0 0 18px",
                }}
              >
                Program, který propojuje
                <br />
                školu s životem obce
              </h1>

              <p
                style={{
                  fontSize: 21,
                  lineHeight: 1.55,
                  color: "rgba(15,23,42,0.76)",
                  maxWidth: 700,
                  margin: 0,
                }}
              >
                ARCHIMEDES® propojuje venkovní učebnu, inspirativní hosty a živý program pro děti,
                učitele, seniory i komunitu obce. Škola získává inspirativní výuku a
                obec živý program pro své obyvatele.
              </p>

              <div
                style={{
                  display: "grid",
                  gap: 10,
                  marginTop: 22,
                  maxWidth: 640,
                  color: "#0f172a",
                  fontSize: 17,
                  lineHeight: 1.5,
                }}
              >
                <div>• hosté z Akademie věd, kultury, odborné praxe i ze zahraničí</div>
                <div>• využití pro školu, komunitu obce i společné akce</div>
                <div>• síť reálných učeben ARCHIMEDES® po celé republice</div>
              </div>
            </div>

            <div>
              <div
                style={{
                  borderRadius: 26,
                  overflow: "hidden",
                  boxShadow: "0 24px 60px rgba(15,23,42,0.12)",
                  background: "white",
                }}
              >
                <img
                  src={heroImg}
                  alt="Venkovní učebna ARCHIMEDES®"
                  style={{
                    width: "100%",
                    display: "block",
                    aspectRatio: "16/10",
                    objectFit: "cover",
                  }}
                />
              </div>
              <div
                style={{
                  marginTop: 10,
                  fontSize: 14,
                  color: "rgba(15,23,42,0.62)",
                  fontWeight: 700,
                }}
              >
                Venkovní učebna ARCHIMEDES® – reálná realizace v síti projektu
              </div>
            </div>
          </div>
        </section>

        <section
          style={{ maxWidth: 1180, margin: "0 auto", padding: "0 16px 24px" }}
        >
          <div style={{ background: "transparent", borderRadius: 28 }}>
            <div style={{ marginBottom: 18 }}>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 800,
                  color: "rgba(15,23,42,0.56)",
                  marginBottom: 8,
                }}
              >
                ARCHIMEDES Live aktuálně:
              </div>
            </div>

            <div className="instagramGrid">
              {(instagramReady ? renderedPosts : fallbackPosts).map((post, index) => (
                <InstagramEmbed
                  key={`${post.type}-${post.id}-${index}`}
                  id={post.id}
                  type={post.type}
                />
              ))}
            </div>
          </div>
        </section>

        <section
          style={{ maxWidth: 1180, margin: "0 auto", padding: "6px 16px 22px" }}
        >
          <div
            style={{
              background: "white",
              border: "1px solid rgba(15,23,42,0.08)",
              borderRadius: 28,
              padding: "28px 24px",
              boxShadow: "0 10px 30px rgba(15,23,42,0.05)",
            }}
          >
            <div style={{ marginBottom: 18 }}>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 800,
                  color: "rgba(15,23,42,0.56)",
                  marginBottom: 8,
                }}
              >
                Síť učeben ARCHIMEDES®
              </div>
              <div
                style={{
                  fontSize: 30,
                  lineHeight: 1.1,
                  fontWeight: 900,
                  color: "#0f172a",
                }}
              >
                Učebny už fungují v konkrétních městech a obcích
              </div>
            </div>

            <div
              style={{
                borderRadius: 22,
                overflow: "hidden",
                minHeight: 440,
              }}
            >
              {mapLoading ? (
                <div
                  style={{
                    minHeight: 440,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "rgba(15,23,42,0.6)",
                    fontWeight: 700,
                  }}
                >
                  Načítám mapu…
                </div>
              ) : (
                <SchoolsMap items={schoolsWithCoords} />
              )}
            </div>
          </div>
        </section>

        <section
          style={{ maxWidth: 1180, margin: "0 auto", padding: "18px 16px 18px" }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
              flexWrap: "wrap",
              marginBottom: 16,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 800,
                  color: "rgba(15,23,42,0.56)",
                  marginBottom: 8,
                }}
              >
                Jak vypadá jedna hodina
              </div>
              <div
                style={{
                  fontSize: 36,
                  lineHeight: 1.08,
                  fontWeight: 900,
                  color: "#0f172a",
                  letterSpacing: "-0.02em",
                }}
              >
                1 třída – 1 živý vstup – 1 pracovní list
              </div>
            </div>
          </div>

          <div className="howGrid">
            <InfoCard
              number="1"
              title="Živý vstup s hostem"
              text="Děti se připojí k živému vysílání a setkají se s odborníkem, autorem nebo inspirativní osobností."
            />
            <InfoCard
              number="2"
              title="Připravené pracovní listy"
              text="Pro vysílání jsou připraveny materiály pro další práci ve třídě."
            />
            <InfoCard
              number="3"
              title="Přínos i pro obec"
              text="Platforma nabízí program také seniorům, komunitě a veřejným akcím v obci."
            />
          </div>
        </section>

        <section
          style={{ maxWidth: 1180, margin: "0 auto", padding: "8px 16px 18px" }}
        >
          <div className="dualGrid">
            <div
              style={{
                background: "white",
                border: "1px solid rgba(15,23,42,0.08)",
                borderRadius: 28,
                overflow: "hidden",
                boxShadow: "0 12px 34px rgba(15,23,42,0.05)",
              }}
            >
              <img
                src={lessonImg}
                alt="Ukázka programu ARCHIMEDES®"
                style={{
                  width: "100%",
                  display: "block",
                  aspectRatio: "16/10",
                  objectFit: "cover",
                }}
              />
              <div style={{ padding: 22 }}>
                <div
                  style={{
                    fontSize: 30,
                    lineHeight: 1.1,
                    fontWeight: 900,
                    color: "#0f172a",
                  }}
                >
                  Program, který lze využít okamžitě
                </div>
                <p
                  style={{
                    margin: "12px 0 0",
                    fontSize: 17,
                    lineHeight: 1.6,
                    color: "rgba(15,23,42,0.72)",
                  }}
                >
                  Škola i obec získají pravidelný program bez složité přípravy.
                  Stačí se připojit a využít připravený obsah.
                </p>
              </div>
            </div>

            <div
              style={{
                background: "white",
                border: "1px solid rgba(15,23,42,0.08)",
                borderRadius: 28,
                overflow: "hidden",
                boxShadow: "0 12px 34px rgba(15,23,42,0.05)",
              }}
            >
              <img
                src={kidsImg}
                alt="Hosté v programu ARCHIMEDES®"
                style={{
                  width: "100%",
                  display: "block",
                  aspectRatio: "16/10",
                  objectFit: "cover",
                }}
              />
              <div style={{ padding: 22 }}>
                <div
                  style={{
                    fontSize: 30,
                    lineHeight: 1.1,
                    fontWeight: 900,
                    color: "#0f172a",
                  }}
                >
                  Děti se setkávají s lidmi z praxe
                </div>
                <p
                  style={{
                    margin: "12px 0 0",
                    fontSize: 17,
                    lineHeight: 1.6,
                    color: "rgba(15,23,42,0.72)",
                  }}
                >
                  V programu se propojuje škola s vědou, kulturou, veřejným životem
                  i odbornými partnery.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section
          style={{ maxWidth: 1180, margin: "0 auto", padding: "14px 16px 20px" }}
        >
          <div
            style={{
              background: "white",
              border: "1px solid rgba(15,23,42,0.08)",
              borderRadius: 28,
              padding: "26px 24px",
              boxShadow: "0 12px 34px rgba(15,23,42,0.05)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
                gap: 16,
                flexWrap: "wrap",
                marginBottom: 16,
              }}
            >
              <div>
                <div style={{ fontSize: 28, fontWeight: 900, color: "#0f172a" }}>
                  Program ARCHIMEDES Live
                </div>
                <div
                  style={{
                    marginTop: 8,
                    fontSize: 16,
                    color: "rgba(15,23,42,0.68)",
                  }}
                >
                  Ukázka formátů, které dávají smysl škole i komunitě obce.
                </div>
              </div>
              <PrimaryButton href="/program">Zobrazit program</PrimaryButton>
            </div>

            <div className="programGrid">
              <ProgramCard
                title="Science ON"
                text="Živá věda, pokusy a hosté z odborné praxe."
                img="/media/stem-microscopes.webp"
              />
              <ProgramCard
                title="Smart City klub"
                text="Jak přemýšlet o městě, obci a prostoru kolem nás."
                img={communityImg}
              />
              <ProgramCard
                title="Čtenářský klub"
                text="Autoři, knihy a společné čtenářské zážitky."
                img={guestImg}
              />
              <ProgramCard
                title="Senior klub"
                text="Pravidelný program pro starší generaci a komunitní propojení."
                img="/senior.jpg"
              />
            </div>
          </div>
        </section>

        <section
          style={{ maxWidth: 1180, margin: "0 auto", padding: "14px 16px 12px" }}
        >
          <div
            style={{
              background: "white",
              border: "1px solid rgba(15,23,42,0.08)",
              borderRadius: 28,
              padding: "24px",
              boxShadow: "0 12px 34px rgba(15,23,42,0.05)",
            }}
          >
            <div
              style={{
                fontSize: 14,
                fontWeight: 800,
                color: "rgba(15,23,42,0.56)",
                marginBottom: 12,
              }}
            >
              ARCHIMEDES v médiích
            </div>

            <div className="mediaStrip">
              {mediaLinks.map((item) => (
                <MediaLogoButton
                  key={`${item.label}-${item.href}`}
                  label={item.label}
                  domain={item.domain}
                  href={item.href}
                />
              ))}
            </div>

            <div style={{ marginTop: 16 }}>
              <a
                href="https://www.archimedes-net.com/media/"
                target="_blank"
                rel="noreferrer"
                style={{
                  fontWeight: 800,
                  color: "#0f172a",
                  textDecoration: "none",
                }}
              >
                Všechna média →
              </a>
            </div>
          </div>
        </section>

        <section
          style={{ maxWidth: 1180, margin: "0 auto", padding: "20px 16px 70px" }}
        >
          <div
            style={{
              background: "linear-gradient(135deg, #0f172a 0%, #111827 100%)",
              color: "white",
              borderRadius: 30,
              padding: "34px 28px",
              boxShadow: "0 26px 60px rgba(15,23,42,0.18)",
            }}
          >
            <div className="ctaGrid">
              <div>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 800,
                    opacity: 0.78,
                    marginBottom: 10,
                  }}
                >
                  Chcete ukázku pro školu nebo obec?
                </div>
                <div
                  style={{
                    fontSize: 38,
                    lineHeight: 1.08,
                    fontWeight: 900,
                    letterSpacing: "-0.02em",
                  }}
                >
                  Ukážeme vám program i venkovní učebnu v praxi
                </div>
                <div
                  style={{
                    marginTop: 12,
                    fontSize: 18,
                    lineHeight: 1.6,
                    opacity: 0.9,
                    maxWidth: 740,
                  }}
                >
                  ARCHIMEDES® dodává licenci programu i samotnou stavbu učebny.
                  Pomůžeme vám vybrat model, který bude dávat smysl právě pro vaši
                  školu nebo obec.
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 14,
                  flexWrap: "wrap",
                  justifyContent: "flex-end",
                  alignItems: "center",
                }}
              >
                <WhiteButton href="/poptavka">Chci více informací</WhiteButton>
                <OutlineLightButton href="/ucebna">
                  Prohlédnout učebnu
                </OutlineLightButton>
              </div>
            </div>
          </div>
        </section>

        <style jsx global>{`
          .heroGrid {
            display: grid;
            grid-template-columns: minmax(0, 1.05fr) minmax(360px, 0.95fr);
            gap: 36px;
            align-items: center;
          }

          .instagramGrid {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 16px;
          }

          .howGrid {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 16px;
          }

          .dualGrid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 16px;
          }

          .programGrid {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 16px;
          }

          .ctaGrid {
            display: grid;
            grid-template-columns: minmax(0, 1fr) auto;
            gap: 20px;
            align-items: center;
          }

          .mediaStrip {
            display: grid;
            grid-template-columns: repeat(5, minmax(0, 1fr));
            gap: 12px;
          }

          .mediaLink {
            text-decoration: none;
          }

          .mediaLogoCard {
            display: flex;
            align-items: center;
            gap: 12px;
            min-height: 58px;
            width: 100%;
            padding: 0 16px;
            border-radius: 18px;
            background: #f8fafc;
            border: 1px solid rgba(15, 23, 42, 0.08);
            color: #0f172a;
            transition: transform 0.15s ease, box-shadow 0.15s ease,
              background 0.15s ease;
            box-sizing: border-box;
          }

          .mediaLogoImg {
            width: 26px;
            height: 26px;
            flex: 0 0 26px;
            border-radius: 6px;
            background: white;
          }

          .mediaLogoText {
            font-weight: 800;
            font-size: 15px;
            line-height: 1.1;
          }

          .mediaLink:hover .mediaLogoCard {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(15, 23, 42, 0.08);
            background: white;
          }

          @media (max-width: 1100px) {
            .heroGrid,
            .dualGrid,
            .ctaGrid,
            .instagramGrid {
              grid-template-columns: 1fr;
            }

            .programGrid {
              grid-template-columns: repeat(2, minmax(0, 1fr));
            }

            .mediaStrip {
              grid-template-columns: repeat(3, minmax(0, 1fr));
            }
          }

          @media (max-width: 760px) {
            .howGrid,
            .programGrid,
            .mediaStrip {
              grid-template-columns: 1fr;
            }
          }
        `}</style>
      </main>

      <Footer />
    </div>
  );
}

function InfoCard({ number, title, text }) {
  return (
    <div
      style={{
        background: "white",
        border: "1px solid rgba(15,23,42,0.08)",
        borderRadius: 26,
        padding: 22,
        boxShadow: "0 10px 30px rgba(15,23,42,0.05)",
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 999,
          background: "#0f172a",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 900,
          marginBottom: 16,
        }}
      >
        {number}
      </div>
      <div
        style={{
          fontSize: 22,
          lineHeight: 1.15,
          fontWeight: 900,
          color: "#0f172a",
        }}
      >
        {title}
      </div>
      <div
        style={{
          marginTop: 10,
          fontSize: 16,
          lineHeight: 1.6,
          color: "rgba(15,23,42,0.72)",
        }}
      >
        {text}
      </div>
    </div>
  );
}

function ProgramCard({ title, text, img }) {
  return (
    <div
      style={{
        background: "white",
        border: "1px solid rgba(15,23,42,0.08)",
        borderRadius: 24,
        overflow: "hidden",
        boxShadow: "0 10px 30px rgba(15,23,42,0.05)",
      }}
    >
      <img
        src={img}
        alt={title}
        style={{
          width: "100%",
          display: "block",
          aspectRatio: "4/3",
          objectFit: "cover",
        }}
      />
      <div style={{ padding: 18 }}>
        <div
          style={{
            fontSize: 21,
            lineHeight: 1.15,
            fontWeight: 900,
            color: "#0f172a",
          }}
        >
          {title}
        </div>
        <div
          style={{
            marginTop: 8,
            fontSize: 15,
            lineHeight: 1.55,
            color: "rgba(15,23,42,0.7)",
          }}
        >
          {text}
        </div>
      </div>
    </div>
  );
}
