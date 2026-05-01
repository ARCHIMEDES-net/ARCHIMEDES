import Head from "next/head";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { track } from "@vercel/analytics";
import Footer from "../components/Footer";
import { supabase } from "../lib/supabaseClient";

// ... (ponechány původní importy a pomocné funkce VideoCard, formatEventDate)

export default function Home() {
  // ... (ponechán původní state pro loadNextEvent)

  return (
    <>
      <Head>
        <title>ARCHIMEDES Live | Moderní výuka pro školy bez přípravy</title>
        <meta
          name="description"
          content="Přiveďte do třídy odborníky a inspirativní hosty. Program START pro ZŠ: hotové hodiny na klíč, které lze hradit ze šablon."
        />
      </Head>

      <main className="page">
        <section className="hero">
          <div className="heroMedia">
            <img src={heroImg} alt="ARCHIMEDES Live ve škole" />
            <div className="heroOverlay" />
          </div>

          <div className="heroContentWrap">
            <div className="container">
              <div className="heroGrid">
                <div className="heroContent">
                  <div className="eyebrow">Šablony OP JAK • Jednoduché zapojení</div>

                  <h1>
                    Moderní výuka, kterou
                    <br />
                    děti milují. <span>Bez přípravy.</span>
                  </h1>

                  <p className="heroIntro">
                    Program START přináší do vašich hodin živé vstupy odborníků a hotové pracovní listy. 
                    Učitel jen „zapne a učí“, ředitel modernizuje školu s nulovou administrativou.
                  </p>

                  <div className="heroActions">
                    {/* HLAVNÍ KONVERZNÍ CÍL - Výrazně odlišený */}
                    <ButtonLink
                      href="/start"
                      variant="primary-highlight"
                      eventName="klik_home_start_main"
                    >
                      Objednat program START
                    </ButtonLink>

                    <ButtonLink
                      href="/demo"
                      variant="secondary"
                      eventName="klik_home_demo"
                    >
                      Vyzkoušet DEMO zdarma
                    </ButtonLink>
                    
                    {/* Ostatní odkazy patří do menu nebo níže, ne do Hero sekce */}
                  </div>

                  <div className="trustBadge">
                    <img src="/check-icon.svg" alt="check" /> 
                    <span>Lze hradit z finančních prostředků šablon OP JAK</span>
                  </div>
                </div>

                <div className="heroAside">
                   {/* Ponechána karta nejbližšího vysílání jako "Social Proof" že to žije */}
                   {/* ... (Kód pro nextBroadcastCard) */}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* NOVÁ SEKCE: Rychlá segmentace (Ředitel vs Učitel) */}
        <section className="section sectionSegment">
          <div className="container">
            <div className="segmentGrid">
              <div className="segmentCard">
                <h3>Pro ředitele</h3>
                <ul>
                  <li>✅ Splnění cílů digitalizace a modernizace</li>
                  <li>✅ Fakturace na míru (šablony, projekty)</li>
                  <li>✅ Prestiž školy v očích rodičů</li>
                </ul>
              </div>
              <div className="segmentCard">
                <h3>Pro učitele</h3>
                <ul>
                  <li>✅ 0 minut přípravy na hodinu</li>
                  <li>✅ Hotové metodiky a pracovní listy</li>
                  <li>✅ Hosté, které byste do třídy sami nedostali</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ... (Ponechány sekce Jak to funguje a Ukázky, ale s texty mířícími na BALÍČEK START) */}

        <section id="ukazky-vysilani" className="section sectionShowcase">
          <div className="container">
            <div className="showcaseShell">
              <div className="sectionIntro">
                <h2>Podívejte se, co dostanete v balíčku START</h2>
                <p>Učitelé oceňují hlavně interaktivitu a napojení na reálnou praxi.</p>
              </div>
              {/* ... (Videa) */}
            </div>
          </div>
        </section>

        <section className="ctaSection">
          <div className="container">
            <div className="ctaBox">
              <div className="ctaMain">
                <h2>Nejjednodušší cesta k moderní škole</h2>
                <p>
                  Balíček START obsahuje vše pro první rok: licenci k archivu, 
                  živé vstupy a metodickou podporu. Vše vyřídíme jednou fakturou.
                </p>
              </div>

              <div className="ctaSide">
                <div className="ctaActions">
                  <ButtonLink
                    href="/start"
                    variant="light"
                    eventName="klik_home_cta_start"
                  >
                    Chci cenovou nabídku pro školu
                  </ButtonLink>
                </div>
                <div className="ctaNote">
                  Platba na fakturu • Podpora šablon
                </div>
              </div>
            </div>
          </div>
        </section>

        <Footer />

        <style jsx>{`
          /* ... (Původní styly) */

          /* ÚPRAVY PRO KONVERZI */
          h1 span {
            color: #4e84df;
          }

          .heroActions {
            gap: 16px;
            margin-bottom: 24px;
          }

          .trustBadge {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 14px;
            color: rgba(255,255,255,0.8);
            font-weight: 600;
          }

          .segmentGrid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-top: -40px; /* Překrytí s hero pro dynamiku */
            position: relative;
            z-index: 10;
          }

          .segmentCard {
            background: white;
            padding: 30px;
            border-radius: 20px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          }

          .segmentCard h3 { margin-top: 0; color: #0f172a; }
          .segmentCard ul { list-style: none; padding: 0; }
          .segmentCard li { margin: 10px 0; color: #5a6474; }

          @media (max-width: 768px) {
            .segmentGrid { grid-template-columns: 1fr; margin-top: 20px; }
          }
        `}</style>

        <style jsx global>{`
          /* Nová barva pro hlavní akci */
          .al-btn-primary-highlight {
            background: #2563eb;
            color: #ffffff;
            border: none;
            box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4);
            font-size: 17px;
            padding: 0 32px;
            min-height: 56px;
          }
          .al-btn-primary-highlight:hover {
            background: #1d4ed8;
            transform: translateY(-2px);
          }
        `}</style>
      </main>
    </>
  );
}
