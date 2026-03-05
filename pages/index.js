// pages/index.js
import Link from "next/link";

export default function Home() {
  const MAX = 1120;

  return (
    <div style={{ fontFamily: "system-ui", background: "#f6f7fb", minHeight: "100vh" }}>
      {/* Hlavičku řeší pages/_app.js (PublicHeader) */}

      {/* HERO */}
      <section style={{ padding: "64px 16px 28px" }}>
        <div style={{ maxWidth: MAX, margin: "0 auto" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.2fr 0.8fr",
              gap: 28,
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
                <Pill tone="dark">Program pro školy</Pill>
                <Pill>Komunita obce</Pill>
                <Pill>Živé vstupy + záznamy</Pill>
              </div>

              <h1
                style={{
                  fontSize: 48,
                  lineHeight: 1.12,
                  margin: 0,
                  letterSpacing: -0.2,
                }}
              >
                ARCHIMEDES Live
                <br />
                vzdělávací program pro školy
                <br />
                a komunitu obce
              </h1>

              <p
                style={{
                  fontSize: 18,
                  opacity: 0.82,
                  maxWidth: 720,
                  margin: "18px 0 22px",
                  lineHeight: 1.6,
                }}
              >
                Pravidelné online vstupy odborníků do výuky, inspirativní setkání a materiály pro učitele.
                Škola může vysílání sledovat živě nebo využít záznam později – bez složité techniky.
              </p>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <Link
                  href="/program"
                  style={btnPrimary}
                >
                  Zobrazit program
                </Link>

                <Link
                  href="/poptavka"
                  style={btnSecondary}
                >
                  Domluvit ukázkovou hodinu
                </Link>

                <Link
                  href="/portal"
                  style={btnGhost}
                >
                  Portál pro registrované
                </Link>
              </div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 18 }}>
                <StatChip label="Učeben v ČR" value="21+" />
                <StatChip label="Pro školy i obce" value="ano" />
                <StatChip label="Důraz na jednoduchost" value="1 třída stačí" />
              </div>
            </div>

            {/* Pravý blok – vizuální placeholder */}
            <div
              style={{
                background: "white",
                borderRadius: 18,
                border: "1px solid rgba(0,0,0,0.08)",
                boxShadow: "0 18px 45px rgba(0,0,0,0.06)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: 220,
                  background:
                    "linear-gradient(135deg, rgba(17,24,39,0.08), rgba(17,24,39,0.02))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "rgba(0,0,0,0.55)",
                  fontWeight: 700,
                }}
              >
                Foto / vizuál (učebna / děti / host)
              </div>

              <div style={{ padding: 16 }}>
                <div style={{ fontWeight: 900, marginBottom: 6 }}>
                  Co ředitel potřebuje vědět:
                </div>
                <ul style={{ margin: 0, paddingLeft: 18, color: "rgba(0,0,0,0.78)", lineHeight: 1.7 }}>
                  <li>funguje to jednoduše ve třídě</li>
                  <li>učitel nemusí dlouze připravovat</li>
                  <li>lze využít i záznam</li>
                </ul>

                <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <Link href="/cenik" style={{ ...miniLink }}>
                    Ceník →
                  </Link>
                  <Link href="/poptavka" style={{ ...miniLink }}>
                    Nezávazně se zeptat →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DŮVĚRA */}
      <section style={{ padding: "10px 16px 28px" }}>
        <div style={{ maxWidth: MAX, margin: "0 auto" }}>
          <div style={sectionCard}>
            <div style={{ fontWeight: 900, fontSize: 16, marginBottom: 10 }}>
              Projekt ARCHIMEDES má podporu a ocenění
            </div>
            <div style={{ color: "rgba(0,0,0,0.72)", lineHeight: 1.6, marginBottom: 14 }}>
              Záštity a ocenění výrazně zvyšují důvěru – pro školy i pro obce. (Loga doplníme přesně podle finálních podkladů.)
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                gap: 12,
              }}
            >
              <LogoTile text="MŠMT" />
              <LogoTile text="MŽP" />
              <LogoTile text="MPO" />
              <LogoTile text="Záštita (E. Pavlová)" />
              <LogoTile text="Obec 2030" />
              <LogoTile text="Energy Globe / SDGs" />
            </div>
          </div>
        </div>
      </section>

      {/* GAME-CHANGER: Jak vypadá jedna hodina */}
      <section style={{ padding: "0 16px 28px" }}>
        <div style={{ maxWidth: MAX, margin: "0 auto" }}>
          <div style={sectionCard}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
              <h2 style={h2}>Jak vypadá jedna hodina s ARCHIMEDES Live</h2>
              <div style={{ color: "rgba(0,0,0,0.55)", fontSize: 13 }}>
                Ředitel musí vidět jednoduchost v praxi.
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: 16,
                marginTop: 12,
              }}
            >
              <StepCard
                num="1"
                title="Třída se připojí"
                text="Učitel otevře odkaz na vysílání (živě), nebo použije záznam, když se to do rozvrhu nehodí."
              />
              <StepCard
                num="2"
                title="Inspirativní setkání"
                text="Odborník / host přináší téma do výuky. Žáci mohou klást otázky a diskutovat."
              />
              <StepCard
                num="3"
                title="Navázání ve třídě"
                text="Krátká práce s materiálem (pracovní list / diskuse / projekt). Bez složité přípravy."
              />
            </div>

            <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Link href="/poptavka" style={btnPrimary}>
                Domluvit ukázkovou hodinu
              </Link>
              <Link href="/program" style={btnSecondary}>
                Podívat se na témata v programu
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* HOSTÉ */}
      <section style={{ padding: "0 16px 28px" }}>
        <div style={{ maxWidth: MAX, margin: "0 auto" }}>
          <div style={sectionCard}>
            <h2 style={h2}>Inspirativní hosté</h2>
            <p style={lead}>
              Školy nekupují technologii – kupují obsah, kvalitu a prestiž. Tady ukážeme hosty a instituce (doplníme konkrétní jména podle vašich podkladů).
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: 14,
              }}
            >
              <PersonTile name="Host / instituce" role="věda / praxe / kultura" />
              <PersonTile name="Host / instituce" role="věda / praxe / sport" />
              <PersonTile name="Host / instituce" role="kultura / autoři" />
              <PersonTile name="Host / instituce" role="příroda / planeta" />
              <PersonTile name="Host / instituce" role="smart cities" />
              <PersonTile name="Host / instituce" role="wellbeing / komunita" />
            </div>
          </div>
        </div>
      </section>

      {/* PROGRAM – ukázka */}
      <section style={{ padding: "0 16px 28px" }}>
        <div style={{ maxWidth: MAX, margin: "0 auto" }}>
          <div style={sectionCard}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <h2 style={h2}>Program ARCHIMEDES Live</h2>
              <Link href="/program" style={miniLink}>
                Zobrazit celý program →
              </Link>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: 16,
                marginTop: 12,
              }}
            >
              <ProgramCard title="Zoo / příroda" meta="téma pro výuku i projekty" />
              <ProgramCard title="Science / objevování" meta="věda srozumitelně a prakticky" />
              <ProgramCard title="Literární klub" meta="setkání s autorem / čtenářství" />
              <ProgramCard title="Města budoucnosti" meta="smart témata pro žáky" />
            </div>
          </div>
        </div>
      </section>

      {/* ARCHIV + PRACOVNÍ LISTY */}
      <section style={{ padding: "0 16px 28px" }}>
        <div style={{ maxWidth: MAX, margin: "0 auto" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 16,
            }}
          >
            <div style={sectionCard}>
              <h2 style={{ ...h2, marginBottom: 8 }}>Záznamy programu</h2>
              <p style={lead}>
                Když se to nehodí do rozvrhu, škola může využít záznam později – stejně jednoduše.
              </p>
              <Link href="/portal/archiv" style={btnSecondary}>
                Otevřít archiv v portálu
              </Link>
              <div style={{ marginTop: 10, fontSize: 12, color: "rgba(0,0,0,0.55)" }}>
                Pozn.: Záznamy jsou v části pro registrované.
              </div>
            </div>

            <div style={sectionCard}>
              <h2 style={{ ...h2, marginBottom: 8 }}>Materiály pro učitele</h2>
              <p style={lead}>
                Pracovní listy a podklady navazují na témata programu a pomáhají s pokračováním ve třídě.
              </p>
              <Link href="/portal/pracovni-listy" style={btnSecondary}>
                Pracovní listy v portálu
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SÍŤ UČEBEN */}
      <section style={{ padding: "0 16px 28px" }}>
        <div style={{ maxWidth: MAX, margin: "0 auto" }}>
          <div style={sectionCard}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <h2 style={h2}>Síť učeben ARCHIMEDES</h2>
              <Link href="/portal/skoly" style={miniLink}>
                Zobrazit síť učeben →
              </Link>
            </div>
            <p style={lead}>
              Učebny ARCHIMEDES fungují podle místních podmínek: někde jako komunitní centrum obce, jinde jako „další třída školy“.
              Síť slouží jako reference, inspirace a možnost sdílení dobré praxe.
            </p>
          </div>
        </div>
      </section>

      {/* KOMUNITA */}
      <section style={{ padding: "0 16px 28px" }}>
        <div style={{ maxWidth: MAX, margin: "0 auto" }}>
          <div style={sectionCard}>
            <h2 style={h2}>Propojení školy a obce</h2>
            <p style={lead}>
              ARCHIMEDES Live posiluje komunitu: sdílení zkušeností mezi školami, inspirativní setkání a programy, které lze využít i pro veřejnost (dle nastavení obce).
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: 14,
                marginTop: 12,
              }}
            >
              <InfoCard title="Škola" text="pravidelné vstupy do výuky, témata pro projektové dny" />
              <InfoCard title="Obec" text="program pro obyvatele, prestiž a dlouhodobý rytmus aktivit" />
              <InfoCard title="Senioři" text="smysluplné setkávání, prevence izolace, inspirace" />
              <InfoCard title="Síť" text="mapa učeben, sdílení praxe, inspirace mezi obcemi" />
            </div>
          </div>
        </div>
      </section>

      {/* FINANCOVÁNÍ (OP JAK) */}
      <section style={{ padding: "0 16px 36px" }}>
        <div style={{ maxWidth: MAX, margin: "0 auto" }}>
          <div style={sectionCard}>
            <h2 style={h2}>Financování a nákup</h2>
            <p style={lead}>
              V praxi často rozhodne ředitel školy (když program chce, obec ho obvykle podpoří).
              Část škol kupuje program přímo z vlastního rozpočtu, část řeší financování ve spolupráci s obcí nebo v rámci vzdělávacích projektů (např. OP JAK).
            </p>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
              <Pill>OP JAK: inovativní vzdělávání</Pill>
              <Pill>jednoduché použití</Pill>
              <Pill>ukázková hodina</Pill>
            </div>

            <div style={{ marginTop: 14, display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link href="/cenik" style={btnSecondary}>
                Ceník
              </Link>
              <Link href="/poptavka" style={btnPrimary}>
                Nezávazná poptávka
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FINÁLNÍ CTA */}
      <section style={{ padding: "0 16px 70px" }}>
        <div style={{ maxWidth: MAX, margin: "0 auto" }}>
          <div
            style={{
              background: "#0b1220",
              borderRadius: 18,
              padding: "34px 22px",
              color: "white",
              border: "1px solid rgba(255,255,255,0.10)",
              boxShadow: "0 18px 45px rgba(0,0,0,0.18)",
            }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 18, alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 26, fontWeight: 900, marginBottom: 8 }}>
                  Chcete zapojit svou školu nebo obec?
                </div>
                <div style={{ color: "rgba(255,255,255,0.82)", lineHeight: 1.6 }}>
                  Nejlepší je začít ukázkovou hodinou. Uvidíte, jak to funguje ve výuce a jak se dá program jednoduše používat dlouhodobě.
                </div>
              </div>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "flex-end" }}>
                <Link href="/poptavka" style={btnPrimaryLight}>
                  Domluvit ukázkovou hodinu
                </Link>
                <Link href="/program" style={btnGhostLight}>
                  Program
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ---------- UI helpers ---------- */

const btnPrimary = {
  background: "black",
  color: "white",
  padding: "14px 18px",
  borderRadius: 12,
  textDecoration: "none",
  fontWeight: 800,
  border: "1px solid rgba(0,0,0,0.20)",
  display: "inline-block",
};

const btnSecondary = {
  background: "white",
  color: "#111827",
  padding: "14px 18px",
  borderRadius: 12,
  textDecoration: "none",
  fontWeight: 800,
  border: "1px solid rgba(0,0,0,0.18)",
  display: "inline-block",
};

const btnGhost = {
  background: "transparent",
  color: "#111827",
  padding: "14px 18px",
  borderRadius: 12,
  textDecoration: "none",
  fontWeight: 800,
  border: "1px solid rgba(0,0,0,0.18)",
  display: "inline-block",
};

const btnPrimaryLight = {
  background: "white",
  color: "#0b1220",
  padding: "12px 16px",
  borderRadius: 12,
  textDecoration: "none",
  fontWeight: 900,
  border: "1px solid rgba(255,255,255,0.12)",
  display: "inline-block",
};

const btnGhostLight = {
  background: "transparent",
  color: "white",
  padding: "12px 16px",
  borderRadius: 12,
  textDecoration: "none",
  fontWeight: 900,
  border: "1px solid rgba(255,255,255,0.18)",
  display: "inline-block",
};

const sectionCard = {
  background: "white",
  borderRadius: 18,
  border: "1px solid rgba(0,0,0,0.08)",
  boxShadow: "0 14px 40px rgba(0,0,0,0.05)",
  padding: 20,
};

const h2 = {
  margin: 0,
  fontSize: 28,
  letterSpacing: -0.2,
};

const lead = {
  margin: "10px 0 0",
  color: "rgba(0,0,0,0.74)",
  lineHeight: 1.65,
};

const miniLink = {
  fontSize: 13,
  fontWeight: 900,
  textDecoration: "none",
  color: "#111827",
  padding: "8px 10px",
  borderRadius: 12,
  border: "1px solid rgba(0,0,0,0.16)",
  background: "white",
  display: "inline-block",
};

function Pill({ children, tone }) {
  const dark = tone === "dark";
  return (
    <span
      style={{
        fontSize: 12,
        fontWeight: 900,
        padding: "8px 10px",
        borderRadius: 999,
        border: dark ? "1px solid rgba(0,0,0,0.20)" : "1px solid rgba(0,0,0,0.12)",
        background: dark ? "#111827" : "rgba(17,24,39,0.04)",
        color: dark ? "white" : "rgba(0,0,0,0.78)",
      }}
    >
      {children}
    </span>
  );
}

function StatChip({ label, value }) {
  return (
    <div
      style={{
        background: "white",
        border: "1px solid rgba(0,0,0,0.10)",
        borderRadius: 999,
        padding: "8px 10px",
        display: "flex",
        gap: 8,
        alignItems: "baseline",
      }}
    >
      <div style={{ fontSize: 12, color: "rgba(0,0,0,0.60)", fontWeight: 800 }}>{label}</div>
      <div style={{ fontSize: 12, fontWeight: 900 }}>{value}</div>
    </div>
  );
}

function LogoTile({ text }) {
  return (
    <div
      style={{
        height: 52,
        borderRadius: 14,
        border: "1px solid rgba(0,0,0,0.10)",
        background: "rgba(17,24,39,0.03)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 900,
        color: "rgba(0,0,0,0.65)",
        fontSize: 13,
      }}
    >
      {text}
    </div>
  );
}

function StepCard({ num, title, text }) {
  return (
    <div
      style={{
        borderRadius: 16,
        border: "1px solid rgba(0,0,0,0.10)",
        background: "rgba(17,24,39,0.02)",
        padding: 16,
      }}
    >
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: 12,
            background: "#111827",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 900,
          }}
        >
          {num}
        </div>
        <div style={{ fontWeight: 900 }}>{title}</div>
      </div>
      <div style={{ color: "rgba(0,0,0,0.75)", lineHeight: 1.6 }}>{text}</div>
    </div>
  );
}

function PersonTile({ name, role }) {
  return (
    <div
      style={{
        borderRadius: 16,
        border: "1px solid rgba(0,0,0,0.10)",
        overflow: "hidden",
        background: "white",
      }}
    >
      <div
        style={{
          height: 120,
          background: "linear-gradient(135deg, rgba(17,24,39,0.10), rgba(17,24,39,0.02))",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "rgba(0,0,0,0.55)",
          fontWeight: 900,
          fontSize: 13,
        }}
      >
        Fotka
      </div>
      <div style={{ padding: 12 }}>
        <div style={{ fontWeight: 900, marginBottom: 4 }}>{name}</div>
        <div style={{ fontSize: 13, color: "rgba(0,0,0,0.65)" }}>{role}</div>
      </div>
    </div>
  );
}

function ProgramCard({ title, meta }) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: 16,
        border: "1px solid rgba(0,0,0,0.10)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: 110,
          background: "rgba(17,24,39,0.03)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "rgba(0,0,0,0.55)",
          fontWeight: 900,
          fontSize: 13,
        }}
      >
        Plakát / náhled
      </div>
      <div style={{ padding: 14 }}>
        <div style={{ fontWeight: 900, marginBottom: 6 }}>{title}</div>
        <div style={{ color: "rgba(0,0,0,0.70)", lineHeight: 1.6 }}>{meta}</div>
      </div>
    </div>
  );
}

function InfoCard({ title, text }) {
  return (
    <div
      style={{
        background: "white",
        padding: 16,
        borderRadius: 16,
        border: "1px solid rgba(0,0,0,0.10)",
      }}
    >
      <div style={{ fontWeight: 900, marginBottom: 6 }}>{title}</div>
      <div style={{ color: "rgba(0,0,0,0.74)", lineHeight: 1.6 }}>{text}</div>
    </div>
  );
}
