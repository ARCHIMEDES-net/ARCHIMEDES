// pages/portal/komunita.js
import Link from "next/link";
import RequireAuth from "../../components/RequireAuth";
import PortalHeader from "../../components/PortalHeader";

const communityBlocks = [
  {
    icon: "🤝",
    title: "Sdílení dobré praxe",
    text:
      "Místo pro inspiraci mezi školami, obcemi a dalšími zapojenými partnery. Postupně zde mohou být ukázky aktivit, projektů a nápadů z různých míst.",
    note: "Postupně rozšiřujeme",
  },
  {
    icon: "🏫",
    title: "Propojení škol a obcí",
    text:
      "ARCHIMEDES Live může být prostorem, kde se nepotkává jen výuka, ale také komunita, zřizovatel a místní spolupráce.",
  },
  {
    icon: "🌍",
    title: "Živá síť ARCHIMEDES",
    text:
      "Cílem je, aby portál nebyl jen místem pro sledování programu, ale také prostředím pro sdílení, inspiraci a spolupráci.",
  },
];

const clubCards = [
  {
    icon: "📖",
    title: "Čtenářský klub",
    text:
      "Společné čtení, doporučené knihy, setkání nad texty a kulturní přesah pro děti i dospělé.",
    href: "/portal/kalendar",
    cta: "Zobrazit program",
    note: "Klub",
  },
  {
    icon: "🧓",
    title: "Senior klub",
    text:
      "Pravidelný program pro seniory zaměřený na aktivní život, setkávání, inspiraci a nové podněty.",
    href: "/portal/kalendar",
    cta: "Zobrazit program",
    note: "Komunita",
  },
  {
    icon: "🏙️",
    title: "Smart City klub",
    text:
      "Program pro žáky, kteří chtějí přemýšlet o městě, obci, veřejném prostoru a budoucnosti svého okolí.",
    href: "/portal/kalendar",
    cta: "Zobrazit program",
    note: "Projekty",
  },
];

export default function KomunitaPage() {
  return (
    <RequireAuth>
      <PortalHeader title="Komunita" />

      <div style={{ background: "#f6f7fb", minHeight: "100vh" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "24px 16px 48px" }}>

          {/* HERO */}
          <section
            style={{
              background: "linear-gradient(180deg, #ffffff 0%, #f9fbff 100%)",
              border: "1px solid rgba(15,23,42,0.08)",
              borderRadius: 24,
              padding: "22px",
              boxShadow: "0 16px 40px rgba(15,23,42,0.05)",
              marginBottom: 18,
            }}
          >
            <div style={{ maxWidth: 760 }}>
              <div
                style={{
                  display: "inline-flex",
                  padding: "6px 10px",
                  borderRadius: 999,
                  background: "rgba(15,23,42,0.06)",
                  fontSize: 12,
                  fontWeight: 800,
                  marginBottom: 12,
                }}
              >
                ARCHIMEDES Live • komunita
              </div>

              <h1 style={{ margin: 0, fontSize: 34, fontWeight: 900 }}>
                Komunita není doplněk.
                <br />
                Je to součást programu.
              </h1>

              <p style={{ marginTop: 14, fontSize: 16, lineHeight: 1.6 }}>
                ARCHIMEDES Live nemá být jen místem sledování programu,
                ale také prostorem pro sdílení, spolupráci a inspiraci mezi školami a komunitami.
              </p>
            </div>
          </section>

          {/* OBSAH */}
          <div style={{ display: "grid", gap: 18 }}>

            {/* BLOKY */}
            <section style={cardStyle}>
              <h2 style={sectionTitle}>Komunitní rozměr portálu</h2>

              <div style={gridStyle}>
                {communityBlocks.map((item, i) => (
                  <Tile key={i} {...item} href="/portal/kalendar" highlight={i === 0} />
                ))}
              </div>
            </section>

            {/* KLUBY */}
            <section style={cardStyle}>
              <h2 style={sectionTitle}>Kluby a komunitní programy</h2>

              <div style={gridStyle}>
                {clubCards.map((item, i) => (
                  <Tile key={i} {...item} highlight={i === 0} />
                ))}
              </div>
            </section>

            {/* SIDEBAR / DALŠÍ KROKY */}
            <section style={cardStyle}>
              <h2 style={sectionTitle}>Co může přijít dál</h2>

              <div style={{ display: "grid", gap: 10 }}>
                <SideInfoCard title="Sdílení projektů" text="Ukázky aktivit škol a obcí." />
                <SideInfoCard title="Galerie dobré praxe" text="Inspirace z reálného použití." />
                <SideInfoCard title="Komunitní výzvy" text="Jednoduché aktivity pro zapojení." />
              </div>

              <Link href="/portal/souteze" style={ctaStyle}>
                Přejít na Soutěže a projekty
              </Link>
            </section>

          </div>
        </div>
      </div>
    </RequireAuth>
  );
}

/* STYLY */
const cardStyle = {
  background: "white",
  border: "1px solid rgba(15,23,42,0.08)",
  borderRadius: 24,
  padding: 18,
};

const sectionTitle = {
  fontSize: 26,
  fontWeight: 900,
  marginBottom: 14,
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: 14,
};

const ctaStyle = {
  display: "block",
  marginTop: 16,
  padding: "14px",
  textAlign: "center",
  borderRadius: 14,
  background: "#0f172a",
  color: "white",
  fontWeight: 900,
  textDecoration: "none",
};

/* KOMPONENTY */
function Tile({ icon, title, text, href, highlight }) {
  return (
    <Link href={href} style={{
      display: "block",
      padding: 16,
      borderRadius: 18,
      border: highlight ? "2px solid #0f172a" : "1px solid rgba(15,23,42,0.1)",
      textDecoration: "none",
      color: "#0f172a"
    }}>
      <div style={{ fontSize: 24 }}>{icon}</div>
      <div style={{ fontWeight: 900, marginTop: 8 }}>{title}</div>
      <div style={{ fontSize: 14, marginTop: 6 }}>{text}</div>
    </Link>
  );
}

function SideInfoCard({ title, text }) {
  return (
    <div style={{ padding: 12, border: "1px solid rgba(15,23,42,0.1)", borderRadius: 14 }}>
      <div style={{ fontWeight: 900 }}>{title}</div>
      <div style={{ fontSize: 14, marginTop: 4 }}>{text}</div>
    </div>
  );
}
