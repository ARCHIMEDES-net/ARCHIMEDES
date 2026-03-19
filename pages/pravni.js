import Link from "next/link";
import Footer from "../components/Footer";

const documents = [
  {
    href: "/vop",
    title: "Všeobecné obchodní podmínky",
    text:
      "Podmínky poskytování služby ARCHIMEDES Live, objednávky, rozsah služby, odpovědnost a pravidla užívání.",
  },
  {
    href: "/dpa",
    title: "Smlouva o zpracování osobních údajů (DPA)",
    text:
      "Základní rámec zpracování osobních údajů mezi školou nebo organizací a společností EduVision s.r.o.",
  },
  {
    href: "/pravidla-zaznamu",
    title: "Pravidla pořizování a zpřístupnění záznamů",
    text:
      "Informace o tom, jak ARCHIMEDES Live pracuje se záznamy vysílání a archivem pro registrované uživatele.",
  },
  {
    href: "/ochrana-osobnich-udaju",
    title: "Informace o zpracování osobních údajů",
    text:
      "Základní informace o tom, jak EduVision s.r.o. zpracovává osobní údaje v souvislosti s webem a službou ARCHIMEDES Live.",
  },
];

export default function PravniPage() {
  return (
    <>
      <main style={styles.page}>
        <div style={styles.wrap}>
          <div style={styles.topNav}>
            <Link href="/" style={styles.backLink}>
              ← Zpět na web
            </Link>
          </div>

          <header style={styles.hero}>
            <span style={styles.badge}>ARCHIMEDES Live</span>
            <h1 style={styles.h1}>Právní informace</h1>
            <p style={styles.lead}>
              Na této stránce najdete přehled základních právních dokumentů
              souvisejících se službou ARCHIMEDES Live, objednávkovým procesem,
              ochranou osobních údajů a prací se záznamy.
            </p>
          </header>

          <section style={styles.grid}>
            {documents.map((doc) => (
              <article key={doc.href} style={styles.docCard}>
                <h2 style={styles.docTitle}>{doc.title}</h2>
                <p style={styles.docText}>{doc.text}</p>
                <Link href={doc.href} style={styles.docLink}>
                  Otevřít dokument →
                </Link>
              </article>
            ))}
          </section>

          <section style={styles.infoRow}>
            <div style={styles.cardLarge}>
              <h2 style={styles.h2}>Používání portálu ARCHIMEDES Live</h2>
              <p style={styles.p}>
                Portál ARCHIMEDES Live je online vzdělávací a komunitní prostředí
                určené pro školy, obce, organizace a další zapojené subjekty.
              </p>
              <p style={styles.p}>
                Uživatelé jsou povinni využívat portál v souladu s jeho účelem,
                nenarušovat jeho technické fungování a nešířit obsah, který je v
                rozporu s právními předpisy, dobrými mravy nebo pravidly slušné
                komunikace.
              </p>
              <p style={styles.p}>
                Provozovatel si vyhrazuje právo omezit nebo zrušit přístup
                uživateli, který tato pravidla porušuje.
              </p>
            </div>

            <div style={styles.cardSide}>
              <div style={styles.sideLabel}>Dodavatel služby</div>
              <div style={styles.sideCompany}>EduVision s.r.o.</div>
              <p style={styles.sideText}>
                Purkyňova 649/127, Medlánky
                <br />
                612 00 Brno
                <br />
                IČ: 17803039
                <br />
                DIČ: CZ17803039
              </p>
              <p style={styles.sideMeta}>
                zapsána pod značkou C 131579/KSBR
                <br />
                Krajským soudem v Brně
              </p>
            </div>
          </section>

          <section style={styles.card}>
            <h2 style={styles.h2}>Cookies</h2>
            <p style={styles.p}>
              Portál ARCHIMEDES Live používá nezbytné technické cookies, které
              slouží zejména k zajištění přihlášení uživatele, správnému fungování
              relace a zabezpečení přístupu k jednotlivým částem systému.
            </p>
            <p style={styles.p}>
              Bez těchto cookies by nebylo možné portál řádně používat. Pokud budou
              do budoucna na web doplněny analytické nebo marketingové nástroje,
              bude tato část rozšířena o odpovídající správu souhlasů.
            </p>
            <div style={styles.notice}>
              V případě dotazů k provozu portálu, ochraně osobních údajů nebo práci
              se záznamy můžete využít kontaktní stránku na hlavním webu.
            </div>
            <p style={styles.p}>
              <Link href="/kontakt" style={styles.inlineLink}>
                Přejít na kontaktní stránku →
              </Link>
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(180deg, #f7f8fb 0%, #eef2f7 45%, #ffffff 100%)",
    padding: "32px 20px 40px",
    color: "#0f172a",
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  wrap: {
    maxWidth: "1120px",
    margin: "0 auto",
  },
  topNav: {
    marginBottom: "18px",
  },
  backLink: {
    color: "#1d4ed8",
    textDecoration: "none",
    fontWeight: 700,
  },
  inlineLink: {
    color: "#1d4ed8",
    textDecoration: "none",
    fontWeight: 800,
  },
  hero: {
    background: "#ffffff",
    border: "1px solid rgba(15,23,42,0.08)",
    borderRadius: "28px",
    padding: "34px 30px",
    boxShadow: "0 20px 50px rgba(15,23,42,0.05)",
    marginBottom: "22px",
  },
  badge: {
    display: "inline-block",
    background: "#e9eef8",
    color: "#223252",
    fontWeight: 800,
    fontSize: "13px",
    padding: "8px 12px",
    borderRadius: "999px",
    marginBottom: "14px",
    letterSpacing: "0.02em",
  },
  h1: {
    margin: "0 0 12px",
    fontSize: "44px",
    lineHeight: 1.05,
    letterSpacing: "-0.04em",
    fontWeight: 900,
    color: "#0f172a",
  },
  lead: {
    margin: 0,
    fontSize: "18px",
    lineHeight: 1.75,
    color: "#475569",
    maxWidth: "860px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "18px",
    marginBottom: "22px",
  },
  docCard: {
    background: "#ffffff",
    border: "1px solid rgba(15,23,42,0.08)",
    borderRadius: "24px",
    padding: "26px 24px",
    boxShadow: "0 14px 40px rgba(15,23,42,0.05)",
  },
  docTitle: {
    margin: "0 0 10px",
    fontSize: "24px",
    lineHeight: 1.18,
    fontWeight: 900,
    color: "#0f172a",
  },
  docText: {
    margin: "0 0 14px",
    fontSize: "16px",
    lineHeight: 1.7,
    color: "#475569",
  },
  docLink: {
    color: "#1d4ed8",
    textDecoration: "none",
    fontWeight: 800,
    fontSize: "15px",
  },
  infoRow: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1.2fr) minmax(280px, 0.8fr)",
    gap: "18px",
    marginBottom: "18px",
  },
  cardLarge: {
    background: "#ffffff",
    border: "1px solid rgba(15,23,42,0.08)",
    borderRadius: "24px",
    padding: "28px",
    boxShadow: "0 14px 40px rgba(15,23,42,0.05)",
  },
  cardSide: {
    background: "#eef3fb",
    border: "1px solid rgba(30,64,175,0.08)",
    borderRadius: "24px",
    padding: "24px",
    boxShadow: "0 14px 40px rgba(15,23,42,0.05)",
  },
  sideLabel: {
    fontSize: "12px",
    lineHeight: 1.4,
    fontWeight: 800,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    color: "#1e3a8a",
    marginBottom: "10px",
  },
  sideCompany: {
    fontSize: "24px",
    lineHeight: 1.1,
    fontWeight: 900,
    color: "#0f172a",
    marginBottom: "10px",
  },
  sideText: {
    margin: "0 0 10px",
    fontSize: "15px",
    lineHeight: 1.7,
    color: "#223252",
  },
  sideMeta: {
    margin: 0,
    fontSize: "13px",
    lineHeight: 1.6,
    color: "#64748b",
  },
  card: {
    background: "#ffffff",
    border: "1px solid rgba(15,23,42,0.08)",
    borderRadius: "24px",
    padding: "28px",
    marginBottom: "18px",
    boxShadow: "0 14px 40px rgba(15,23,42,0.05)",
  },
  h2: {
    margin: "0 0 14px",
    fontSize: "28px",
    lineHeight: 1.15,
    fontWeight: 900,
    color: "#0f172a",
  },
  p: {
    margin: "0 0 14px",
    fontSize: "17px",
    lineHeight: 1.75,
    color: "#334155",
  },
  notice: {
    marginTop: "8px",
    background: "#f8fafc",
    border: "1px solid rgba(15,23,42,0.08)",
    color: "#334155",
    borderRadius: "16px",
    padding: "14px 16px",
    fontSize: "15px",
    lineHeight: 1.65,
  },
};
