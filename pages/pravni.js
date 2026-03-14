import Link from "next/link";

export default function PravniPage() {
  return (
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
            Tato stránka obsahuje základní informace o používání portálu,
            ochraně osobních údajů a používání cookies. Finální texty mohou být
            následně upraveny dle podkladů právního zástupce.
          </p>
        </header>

        <nav style={styles.toc}>
          <a href="#podminky" style={styles.tocLink}>Podmínky používání</a>
          <a href="#udaje" style={styles.tocLink}>Ochrana osobních údajů</a>
          <a href="#cookies" style={styles.tocLink}>Cookies</a>
          <a href="#obsah" style={styles.tocLink}>Audiovizuální obsah</a>
          <a href="#kontakt" style={styles.tocLink}>Kontakt</a>
        </nav>

        <section id="podminky" style={styles.card}>
          <h2 style={styles.h2}>1. Podmínky používání portálu ARCHIMEDES Live</h2>
          <p style={styles.p}>
            Portál ARCHIMEDES Live je online vzdělávací a komunitní prostředí
            určené pro školy, obce, organizace a jednotlivce zapojené do programu
            ARCHIMEDES.
          </p>
          <p style={styles.p}>Používáním portálu uživatel potvrzuje, že:</p>
          <ul style={styles.ul}>
            <li>využívá portál v souladu s jeho účelem,</li>
            <li>
              nebude šířit obsah, který je v rozporu s právními předpisy, dobrými
              mravy nebo pravidly slušné komunikace,
            </li>
            <li>
              nebude zneužívat přístup k portálu nebo narušovat jeho technické
              fungování.
            </li>
          </ul>
          <p style={styles.p}>
            Provozovatel portálu si vyhrazuje právo omezit nebo zrušit přístup
            uživateli, který tato pravidla porušuje.
          </p>
        </section>

        <section id="udaje" style={styles.card}>
          <h2 style={styles.h2}>2. Ochrana osobních údajů</h2>
          <p style={styles.p}>
            Správcem osobních údajů je provozovatel projektu ARCHIMEDES.
          </p>
          <p style={styles.p}>
            Osobní údaje mohou být zpracovávány zejména za účelem:
          </p>
          <ul style={styles.ul}>
            <li>vytvoření a správy uživatelského účtu,</li>
            <li>organizace vzdělávacích aktivit a vysílání,</li>
            <li>komunikace s uživateli portálu,</li>
            <li>zajištění technického provozu platformy.</li>
          </ul>
          <p style={styles.p}>
            Zpracovávané údaje mohou zahrnovat například:
          </p>
          <ul style={styles.ul}>
            <li>jméno a příjmení,</li>
            <li>e-mailovou adresu,</li>
            <li>organizaci nebo školu,</li>
            <li>technické údaje spojené s přihlášením do portálu.</li>
          </ul>
          <p style={styles.p}>
            Osobní údaje jsou zpracovávány pouze po dobu nezbytnou pro fungování
            služby a v souladu s platnými právními předpisy.
          </p>
          <p style={styles.p}>
            Uživatel má právo požádat o přístup ke svým údajům, jejich opravu,
            omezení nebo výmaz a o informace o způsobu jejich zpracování.
          </p>
        </section>

        <section id="cookies" style={styles.card}>
          <h2 style={styles.h2}>3. Používání cookies</h2>
          <p style={styles.p}>
            Portál ARCHIMEDES Live používá pouze nezbytné technické cookies.
          </p>
          <p style={styles.p}>Tyto cookies slouží k:</p>
          <ul style={styles.ul}>
            <li>zajištění přihlášení uživatele do portálu,</li>
            <li>správnému fungování uživatelské relace,</li>
            <li>zabezpečení přístupu k jednotlivým částem systému.</li>
          </ul>
          <p style={styles.p}>
            Bez těchto cookies by nebylo možné portál používat.
          </p>
          <p style={styles.p}>
            Tyto cookies neslouží k reklamě, remarketingu ani sledování uživatele
            na jiných webových stránkách.
          </p>
          <div style={styles.notice}>
            Pokud budou do budoucna na web doplněny analytické nebo marketingové
            nástroje, může být tato část rozšířena o správu souhlasů.
          </div>
        </section>

        <section id="obsah" style={styles.card}>
          <h2 style={styles.h2}>4. Audiovizuální obsah</h2>
          <p style={styles.p}>
            Některé aktivity projektu ARCHIMEDES mohou být přenášeny online,
            zaznamenávány nebo zpřístupněny v archivu platformy.
          </p>
          <p style={styles.p}>
            Účastníci konkrétních aktivit jsou o této skutečnosti informováni
            organizátorem dané akce.
          </p>
        </section>

        <section id="kontakt" style={styles.card}>
          <h2 style={styles.h2}>5. Kontakt</h2>
          <p style={styles.p}>
            V případě dotazů týkajících se provozu portálu, ochrany osobních údajů
            nebo používání cookies je možné kontaktovat provozovatele projektu
            ARCHIMEDES prostřednictvím kontaktních údajů uvedených na hlavním webu.
          </p>
        </section>
      </div>
    </main>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(180deg, #f7fbf8 0%, #eef7f1 45%, #ffffff 100%)",
    padding: "32px 20px 60px",
    color: "#163029",
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  wrap: {
    maxWidth: "980px",
    margin: "0 auto",
  },
  topNav: {
    marginBottom: "18px",
  },
  backLink: {
    color: "#1f6b53",
    textDecoration: "none",
    fontWeight: 600,
  },
  hero: {
    background: "#ffffff",
    border: "1px solid rgba(22,48,41,0.08)",
    borderRadius: "24px",
    padding: "32px 28px",
    boxShadow: "0 20px 50px rgba(22,48,41,0.06)",
    marginBottom: "22px",
  },
  badge: {
    display: "inline-block",
    background: "#e5f5ec",
    color: "#1f6b53",
    fontWeight: 700,
    fontSize: "13px",
    padding: "8px 12px",
    borderRadius: "999px",
    marginBottom: "14px",
  },
  h1: {
    margin: "0 0 12px",
    fontSize: "40px",
    lineHeight: 1.1,
  },
  lead: {
    margin: 0,
    fontSize: "18px",
    lineHeight: 1.7,
    color: "#45615a",
    maxWidth: "820px",
  },
  toc: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    marginBottom: "22px",
  },
  tocLink: {
    background: "#ffffff",
    color: "#184d3d",
    textDecoration: "none",
    border: "1px solid rgba(22,48,41,0.08)",
    borderRadius: "999px",
    padding: "10px 14px",
    fontWeight: 600,
  },
  card: {
    background: "#ffffff",
    border: "1px solid rgba(22,48,41,0.08)",
    borderRadius: "24px",
    padding: "28px",
    marginBottom: "18px",
    boxShadow: "0 14px 40px rgba(22,48,41,0.05)",
  },
  h2: {
    margin: "0 0 14px",
    fontSize: "28px",
    lineHeight: 1.2,
  },
  p: {
    margin: "0 0 14px",
    fontSize: "17px",
    lineHeight: 1.75,
    color: "#294740",
  },
  ul: {
    margin: "0 0 14px 0",
    paddingLeft: "22px",
    color: "#294740",
    lineHeight: 1.75,
    fontSize: "17px",
  },
  notice: {
    marginTop: "8px",
    background: "#f4fbf7",
    border: "1px solid #d7eee1",
    color: "#21483c",
    borderRadius: "16px",
    padding: "14px 16px",
    fontSize: "15px",
    lineHeight: 1.6,
  },
};
