import Head from "next/head";
import Link from "next/link";
import Footer from "../components/Footer";

const heroImg = "/hero-vyuka.jpg";
const stepOnlineImg = "/jak-funguje-online.jpg";
const stepClassImg = "/jak-funguje-trida.jpg";
const stepBoardImg = "/jak-funguje-tabule.jpg";

function PrimaryButton({ href, children }) {
  return (
    <Link href={href} className="primaryButton">
      {children}
    </Link>
  );
}

function SecondaryButton({ href, children }) {
  return (
    <Link href={href} className="secondaryButton">
      {children}
    </Link>
  );
}

function TertiaryButton({ href, children }) {
  return (
    <Link href={href} className="tertiaryButton">
      {children}
    </Link>
  );
}

function LightButton({ href, children }) {
  return (
    <Link href={href} className="lightButton">
      {children}
    </Link>
  );
}

export default function Home() {
  return (
    <>
      <Head>
        <title>ARCHIMEDES Live | Živý program pro školy a obce</title>
        <meta
          name="description"
          content="ARCHIMEDES Live přináší školám živé vstupy s odborníky, reálná témata a program, který propojuje výuku s praxí."
        />
      </Head>

      <main className="page">
        {/* HERO */}
        <section className="hero">
          <div className="heroMedia">
            <img src={heroImg} alt="ARCHIMEDES Live ve škole" />
            <div className="heroOverlay" />
          </div>

          <div className="heroContentWrap">
            <div className="container">
              <div className="heroContent">
                <div className="eyebrow">
                  ARCHIMEDES Live pro školy a obce
                </div>

                <h1>
                  Přinášíme
                  <br />
                  reálný svět
                  <br />
                  do výuky
                </h1>

                <p className="heroLead">
                  Živé vstupy s odborníky, reálná témata a přímé propojení školy
                  s praxí. Program, který dává smysl škole i obci.
                </p>

                <div className="heroActions">
                  <PrimaryButton href="/start">
                    Chci balíček START
                  </PrimaryButton>
                  <SecondaryButton href="/program#ukazky-vysilani">
                    Ukázková hodina
                  </SecondaryButton>
                  <TertiaryButton href="/demo">Chci DEMO</TertiaryButton>
                </div>

                {/* NEW GUEST CTA */}
                <div className="heroGuestAction">
                  <Link href="/guest" className="guestButton">
                    <span className="guestButtonTop">
                      Invited as a guest?
                    </span>
                    <span className="guestButtonBottom">
                      See how it works
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ZBYTEK STRÁNKY NECHÁVÁM BEZE ZMĚN */}

        <Footer />

        <style jsx>{`
          .heroGuestAction {
            margin-top: 22px;
          }

          .guestButton {
            display: inline-flex;
            flex-direction: column;
            align-items: flex-start;
            justify-content: center;
            min-height: 56px;
            padding: 10px 18px;
            border-radius: 16px;
            background: rgba(255, 255, 255, 0.12);
            border: 1px solid rgba(255, 255, 255, 0.22);
            color: rgba(255, 255, 255, 0.96);
            text-decoration: none;
            backdrop-filter: blur(6px);
            box-shadow: 0 10px 24px rgba(15, 23, 42, 0.14);
            transition: transform 0.18s ease, background 0.18s ease,
              border-color 0.18s ease, box-shadow 0.18s ease;
          }

          .guestButton:hover {
            transform: translateY(-1px);
            background: rgba(255, 255, 255, 0.16);
            border-color: rgba(255, 255, 255, 0.34);
            box-shadow: 0 14px 28px rgba(15, 23, 42, 0.18);
          }

          .guestButtonTop {
            font-size: 13px;
            line-height: 1.2;
            font-weight: 700;
            color: rgba(255, 255, 255, 0.82);
          }

          .guestButtonBottom {
            margin-top: 4px;
            font-size: 15px;
            line-height: 1.2;
            font-weight: 800;
            color: #ffffff;
          }

          @media (max-width: 640px) {
            .guestButton {
              width: 100%;
              align-items: center;
              text-align: center;
            }
          }
        `}</style>
      </main>
    </>
  );
}
