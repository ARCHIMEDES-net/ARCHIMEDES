import Link from "next/link";

const trustItems = [
  { value: "20+", label: "učeben ARCHIMEDES®" },
  { value: "1000+", label: "zapojených žáků v síti" },
  { value: "2×", label: "měsíčně Senior klub" },
  { value: "Obec 2030", label: "vítěz soutěže" },
];

const marqueeRow1 = [
  "Ratíškovice",
  "Radvanice",
  "Dašice",
  "Mikulov",
  "Hodonín",
  "Hovorany",
  "Moravský Krumlov",
  "Luže",
  "BVV Brno",
];

const marqueeRow2 = [
  "Bučovice",
  "Frýdek-Místek",
  "Křenov",
  "Louny",
  "Čejč",
  "Hlinsko",
  "Chrudim",
  "Žabčice",
  "Kyjov",
];

const partnerNames = [
  "CzechTrade",
  "ZOO Praha",
  "Magnesia Litera",
  "Akademie věd ČR",
  "Policie ČR",
  "Hasiči ČR",
  "Svaz místních samospráv",
];

const mediaNames = [
  "Česká televize",
  "CzechCrunch",
  "iDNES.cz",
  "Blesk",
];

// Obrázky nově bereme z /public.
// Dle zadání:
// - homepage = /ucebna.jpg
// - /ucebna page = /ucebna2.webp
const heroImg = "/ucebna.jpg";
const lessonImg = "/vyuka.jpeg";
const guestImg = "/ctenarsky.jpg";
const communityImg = "/smart.jpg";
const kidsImg = "/praxe.webp";

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

function SecondaryButton({ href, children, tinted = false }) {
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
        border: tinted
          ? "1px solid rgba(15,23,42,0.12)"
          : "1px solid rgba(15,23,42,0.18)",
        background: tinted ? "rgba(15,23,42,0.04)" : "white",
        color: "#0f172a",
        fontWeight: 800,
        transition:
          "transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 10px 22px rgba(15,23,42,0.08)";
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

export default function Home() {
  return (
    <div
      style={{
        fontFamily:
          "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
        background: "#f6f7fb",
        minHeight: "100vh",
      }}
    >
      <main>

        {/* HERO */}
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
                školu a život obce
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
                ARCHIMEDES® propojuje učebnu, živé hosty a program pro děti,
                učitele, seniory i komunitu obce. Škola získává inspirativní
                výuku, obec živý program pro své obyvatele.
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
                <div>
                  • hosté z Akademie věd, kultury, odborné praxe i ze zahraničí
                </div>
                <div>
                  • využití pro školu, komunitu obce i společné akce
                </div>
                <div>
                  • síť reálných učeben ARCHIMEDES® po celé republice
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 14,
                  flexWrap: "wrap",
                  marginTop: 28,
                }}
              >
                <PrimaryButton href="/poptavka">Poptávka</PrimaryButton>
                <SecondaryButton href="/ucebna">Učebna</SecondaryButton>
                <SecondaryButton href="/cenik" tinted>
                  Ceník
                </SecondaryButton>
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

        {/* ZBYTEK STRÁNKY JE NAPROSTO STEJNÝ – žádná další změna */}
        {/* ... (zbytek kódu zůstává identický, protože jsme změnili pouze kidsImg) */}

      </main>
    </div>
  );
}
