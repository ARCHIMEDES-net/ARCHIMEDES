import Link from "next/link";

function CTAButton({ href, label, primary = false }) {
  return (
    <Link
      href={href}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 48,
        padding: "0 20px",
        borderRadius: 14,
        textDecoration: "none",
        fontWeight: 700,
        fontSize: 16,
        boxSizing: "border-box",
        background: primary ? "#111827" : "#ffffff",
        color: primary ? "#ffffff" : "#111827",
        border: primary ? "1px solid #111827" : "1px solid rgba(17,24,39,0.14)",
        boxShadow: primary
          ? "0 10px 22px rgba(17,24,39,0.16)"
          : "0 8px 18px rgba(17,24,39,0.06)",
        transition: "transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {label}
    </Link>
  );
}

function StatCard({ value, label }) {
  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: 22,
        padding: 24,
        border: "1px solid rgba(17,24,39,0.08)",
        boxShadow: "0 10px 30px rgba(17,24,39,0.06)",
      }}
    >
      <div
        style={{
          fontSize: 30,
          fontWeight: 800,
          lineHeight: 1.05,
          color: "#111827",
          marginBottom: 8,
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: 15,
          lineHeight: 1.5,
          color: "#4b5563",
        }}
      >
        {label}
      </div>
    </div>
  );
}

function ProgramPill({ children }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "10px 14px",
        borderRadius: 999,
        background: "rgba(255,255,255,0.12)",
        border: "1px solid rgba(255,255,255,0.14)",
        color: "rgba(255,255,255,0.94)",
        fontSize: 14,
      }}
    >
      {children}
    </span>
  );
}

function FeatureCard({ image, title, text, href }) {
  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: 24,
        overflow: "hidden",
        border: "1px solid rgba(17,24,39,0.08)",
        boxShadow: "0 16px 40px rgba(17,24,39,0.08)",
      }}
    >
      <img
        src={image}
        alt={title}
        style={{
          display: "block",
          width: "100%",
          height: 220,
          objectFit: "cover",
        }}
      />

      <div style={{ padding: 22 }}>
        <h3
          style={{
            margin: "0 0 10px",
            fontSize: 24,
            lineHeight: 1.2,
            color: "#111827",
          }}
        >
          {title}
        </h3>

        <p
          style={{
            margin: "0 0 18px",
            fontSize: 16,
            lineHeight: 1.65,
            color: "#4b5563",
          }}
        >
          {text}
        </p>

        <CTAButton href={href} label="Zjistit více" />
      </div>
    </div>
  );
}

function SectionIntro({ eyebrow, title, text }) {
  return (
    <div style={{ maxWidth: 760, marginBottom: 28 }}>
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          padding: "8px 12px",
          borderRadius: 999,
          background: "rgba(16,185,129,0.12)",
          color: "#047857",
          fontWeight: 700,
          fontSize: 13,
          marginBottom: 14,
        }}
      >
        {eyebrow}
      </div>

      <h2
        style={{
          margin: "0 0 12px",
          fontSize: 40,
          lineHeight: 1.15,
          color: "#111827",
        }}
      >
        {title}
      </h2>

      {text ? (
        <p
          style={{
            margin: 0,
            fontSize: 17,
            lineHeight: 1.75,
            color: "#4b5563",
          }}
        >
          {text}
        </p>
      ) : null}
    </div>
  );
}

function SplitSection({
  image,
  eyebrow,
  title,
  text,
  bullets,
  primaryCta,
  secondaryCta,
  reverse = false,
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1.05fr 1fr",
        gap: 30,
        alignItems: "center",
      }}
    >
      <div style={{ order: reverse ? 2 : 1 }}>
        <img
          src={image}
          alt={typeof title === "string" ? title : "ARCHIMEDES Live"}
          style={{
            width: "100%",
            height: 430,
            objectFit: "cover",
            borderRadius: 28,
            display: "block",
            boxShadow: "0 20px 48px rgba(17,24,39,0.12)",
          }}
        />
      </div>

      <div style={{ order: reverse ? 1 : 2 }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "8px 12px",
            borderRadius: 999,
            background: "rgba(16,185,129,0.12)",
            color: "#047857",
            fontWeight: 700,
            fontSize: 13,
            marginBottom: 14,
          }}
        >
          {eyebrow}
        </div>

        <h2
          style={{
            margin: "0 0 14px",
            fontSize: 38,
            lineHeight: 1.16,
            color: "#111827",
          }}
        >
          {title}
        </h2>

        <p
          style={{
            margin: "0 0 16px",
            fontSize: 17,
            lineHeight: 1.75,
            color: "#4b5563",
          }}
        >
          {text}
        </p>

        <div style={{ marginBottom: 22 }}>
          {bullets.map((item) => (
            <div
              key={item}
              style={{
                display: "flex",
                gap: 10,
                alignItems: "flex-start",
                marginBottom: 10,
                color: "#111827",
                lineHeight: 1.55,
                fontSize: 16,
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 999,
                  background: "#10b981",
                  marginTop: 9,
                  flex: "0 0 auto",
                }}
              />
              <span>{item}</span>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          <CTAButton href={primaryCta.href} label={primaryCta.label} primary />
          <CTAButton href={secondaryCta.href} label={secondaryCta.label} />
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div
      style={{
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        background: "#f6f7fb",
        color: "#111827",
        minHeight: "100vh",
      }}
    >
      <section
        style={{
          maxWidth: 1180,
          margin: "0 auto",
          padding: "56px 16px 28px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.08fr 0.92fr",
            gap: 28,
            alignItems: "center",
          }}
        >
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "8px 12px",
                borderRadius: 999,
                background: "rgba(16,185,129,0.12)",
                color: "#047857",
                fontWeight: 700,
                fontSize: 13,
                marginBottom: 16,
              }}
            >
              Živý program pro školy a komunitu obce
            </div>

            <h1
              style={{
                margin: "0 0 18px",
                fontSize: 54,
                lineHeight: 1.06,
                letterSpacing: "-0.03em",
                color: "#111827",
              }}
            >
              Živá vzdělávací platforma
              <br />
              pro školy a obce
            </h1>

            <p
              style={{
                margin: "0 0 22px",
                fontSize: 19,
                lineHeight: 1.72,
                color: "#4b5563",
                maxWidth: 700,
              }}
            >
              Pravidelný živý obsah, inspirativní hosté, pracovní listy, komunitní
              programy a síť učeben ARCHIMEDES®. Jedna obec získá program pro děti,
              pedagogy, rodiče, seniory i místní komunitu.
            </p>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 12,
                marginBottom: 26,
              }}
            >
              <CTAButton href="/poptavka" label="Chci ukázku programu" primary />
              <CTAButton href="/program" label="Prohlédnout program" />
              <CTAButton href="/ucebna" label="Učebna ARCHIMEDES®" />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, minmax(0,1fr))",
                gap: 14,
              }}
            >
              <StatCard value="20+" label="učeben ARCHIMEDES®" />
              <StatCard value="2×" label="měsíčně Senior klub" />
              <StatCard value="Obec 2030" label="vítěz soutěže" />
              <StatCard value="Živě" label="hosté, program a komunita" />
            </div>
          </div>

          <div>
            <img
              src="/ucebna2.webp"
              alt="Učebna ARCHIMEDES"
              style={{
                width: "100%",
                height: 620,
                objectFit: "cover",
                borderRadius: 32,
                display: "block",
                boxShadow: "0 24px 56px rgba(17,24,39,0.16)",
              }}
            />
          </div>
        </div>
      </section>

      <section
        style={{
          maxWidth: 1180,
          margin: "0 auto",
          padding: "18px 16px 24px",
        }}
      >
        <div
          style={{
            background: "#ffffff",
            borderRadius: 26,
            padding: 24,
            border: "1px solid rgba(17,24,39,0.08)",
            boxShadow: "0 12px 30px rgba(17,24,39,0.06)",
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 800,
              color: "#047857",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: 10,
            }}
          >
            Důkaz důvěry
          </div>
          <p
            style={{
              margin: 0,
              fontSize: 18,
              lineHeight: 1.7,
              color: "#4b5563",
            }}
          >
            ARCHIMEDES Live propojuje konkrétní školy, obce i komunity a navazuje
            na síť reálně fungujících učeben ARCHIMEDES®. Program propojuje učebnu,
            živé hosty, pracovní listy a navazující aktivity do srozumitelného
            řešení pro ředitele školy i starostu.
          </p>
        </div>
      </section>

      <section
        style={{
          maxWidth: 1180,
          margin: "0 auto",
          padding: "46px 16px",
        }}
      >
        <SplitSection
          image="/vyuka.jpeg"
          eyebrow="Jak vypadá jedna hodina s ARCHIMEDES®"
          title={
            <>
              1 třída – 1 živý vstup –
              <br />
              1 pracovní list
            </>
          }
          text="Škola se jednoduše připojí do vysílání, žáci sledují hosta nebo lektora, pedagog dostane připravený pracovní list a obec vidí konkrétní přínos programu v praxi. Stejný princip může fungovat i pro seniory, rodiče nebo komunitní akce."
          bullets={[
            "Živí hosté z Akademie věd, kultury a odborné praxe",
            "Navazující pracovní listy a záznamy pro další využití",
            "Pravidelný rytmus programu bez složité organizace školy",
          ]}
          primaryCta={{ href: "/program", label: "Jak funguje program" }}
          secondaryCta={{ href: "/cenik", label: "Ceník pro školu a obec" }}
        />
      </section>

      <section
        style={{
          maxWidth: 1180,
          margin: "0 auto",
          padding: "18px 16px 20px",
        }}
      >
        <SectionIntro
          eyebrow="Program pro různé cílové skupiny"
          title={
            <>
              Jedna licence, více přínosů
              <br />
              pro školu i obec
            </>
          }
          text="ARCHIMEDES Live není jen vysílání. Je to živý program, který umí propojit děti, pedagogy, rodiče, seniory i místní komunitu."
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0,1fr))",
            gap: 22,
          }}
        >
          <FeatureCard
            image="/ctenarsky.jpg"
            title="Čtenářský klub"
            text="Setkávání nad knihami, inspirativní hosté, doporučené tituly a prostor pro děti i dospělé. Program, který podporuje čtenářství i komunitní život."
            href="/program"
          />

          <FeatureCard
            image="/senior.jpg"
            title="Senior klub"
            text="Pravidelný program pro seniory, který pomáhá proti izolaci, přináší nové podněty a dává obci smysluplnou službu pro starší generaci."
            href="/program"
          />

          <FeatureCard
            image="/smart.jpg"
            title="Smart City klub"
            text="Program pro deváťáky a mladé lidi, kteří chtějí přemýšlet o městě, obci a veřejném prostoru očima mladé generace."
            href="/program"
          />
        </div>
      </section>

      <section
        style={{
          maxWidth: 1180,
          margin: "0 auto",
          padding: "54px 16px 24px",
        }}
      >
        <SplitSection
          image="/deti.jpg"
          eyebrow="Program pro školy"
          title={
            <>
              Živý obsah, který školu
              <br />
              nezatěžuje
            </>
          }
          text="Škola nezískává další software navíc. Získává hotový program, který se dá snadno zařadit do výuky nebo školního života. Ředitel vidí konkrétní přínos, pedagog má připravené podklady a žáci zažijí kontakt s inspirativními osobnostmi."
          bullets={[
            "Vstupy pro 1. i 2. stupeň",
            "Tematické bloky, wellbeing, kariérní inspirace",
            "Archiv a pracovní listy pro další využití",
          ]}
          primaryCta={{ href: "/program", label: "Ukázka programu" }}
          secondaryCta={{ href: "/poptavka", label: "Domluvit ukázkovou hodinu" }}
        />
      </section>

      <section
        style={{
          maxWidth: 1180,
          margin: "0 auto",
          padding: "12px 16px 34px",
        }}
      >
        <SplitSection
          image="/hoste.jpg"
          eyebrow="Hosté a inspirace"
          title={
            <>
              Silní hosté dávají programu
              <br />
              důvěryhodnost i tah
            </>
          }
          text="Hosté z vědy, kultury a odborné praxe pomáhají dělat z programu něco, co obec skutečně odliší. Právě pravidelná kvalita obsahu je důvod, proč má ARCHIMEDES Live dlouhodobý smysl."
          bullets={[
            "Osobnosti z Akademie věd, kultury a odborné praxe",
            "Formát srozumitelný pro děti i dospělé",
            "Program použitelný pro školu i komunitu obce",
          ]}
          primaryCta={{ href: "/program", label: "Kdo v programu vystupuje" }}
          secondaryCta={{ href: "/cenik", label: "Jak se obec zapojí" }}
          reverse
        />
      </section>

      <section
        style={{
          maxWidth: 1180,
          margin: "0 auto",
          padding: "18px 16px 54px",
        }}
      >
        <SplitSection
          image="/komunita.jpg"
          eyebrow="Přínos pro obec"
          title={
            <>
              Program, který propojuje školu,
              <br />
              obec a komunitu
            </>
          }
          text="Starosta nekupuje jen přístup do systému. Kupuje program, který obec využije ve škole, při práci s rodiči, pro seniory i pro místní komunitu. To je hlavní rozdíl oproti běžným online nástrojům."
          bullets={[
            "Pravidelný obsah během roku",
            "Silnější komunitní život a nové aktivity v obci",
            "Srozumitelná hodnota pro školu, obec i veřejnost",
          ]}
          primaryCta={{ href: "/cenik", label: "Financování programu" }}
          secondaryCta={{ href: "/poptavka", label: "Mám zájem o ukázku" }}
        />
      </section>

      <section
        style={{
          maxWidth: 1180,
          margin: "0 auto",
          padding: "0 16px 70px",
        }}
      >
        <div
          style={{
            background:
              "linear-gradient(135deg, rgba(16,185,129,0.14) 0%, rgba(59,130,246,0.12) 100%)",
            borderRadius: 30,
            padding: "34px 28px",
            border: "1px solid rgba(17,24,39,0.08)",
          }}
        >
          <h2
            style={{
              margin: "0 0 12px",
              fontSize: 38,
              lineHeight: 1.14,
              color: "#111827",
            }}
          >
            Chcete vidět, jak může ARCHIMEDES Live
            <br />
            fungovat právě u vás?
          </h2>

          <p
            style={{
              margin: "0 0 22px",
              fontSize: 17,
              lineHeight: 1.75,
              color: "#4b5563",
              maxWidth: 820,
            }}
          >
            Nejlepší první krok je ukázková hodina nebo krátká online prezentace.
            Během ní rychle uvidíte, jak program funguje pro školu, obec i komunitu.
          </p>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            <CTAButton href="/poptavka" label="Chci ukázkovou hodinu" primary />
            <CTAButton href="/cenik" label="Zobrazit ceník" />
            <CTAButton href="/program" label="Projít program" />
          </div>
        </div>
      </section>
    </div>
  );
}
