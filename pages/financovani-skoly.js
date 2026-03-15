
import Link from "next/link";
import Footer from "../components/Footer";

export default function FinancovaniSkoly() {
  return (
    <main>

      {/* HERO */}

      <section className="section hero">
        <div className="container hero-grid">

          <div className="hero-text">

            <div className="badge">
              Pro ředitele základních škol
            </div>

            <h1>
              ARCHIMEDES Live pro školy se Šablonami OP JAK
            </h1>

            <p className="lead">
              Pokud vaše škola pracuje s projektem <strong>Šablony OP JAK</strong>, 
              můžete do výuky zapojit hotový vzdělávací program s živými vstupy, 
              hosty z praxe a navazující prací se žáky.
            </p>

            <p>
              ARCHIMEDES Live není další administrativní povinnost.  
              Je to připravený formát výuky, který můžete jednoduše 
              zapojit do běžné práce školy.
            </p>

            <div className="hero-buttons">

              <Link href="/poptavka" className="btn-primary">
                Chci ukázkovou hodinu pro naši školu
              </Link>

              <Link href="/program" className="btn-secondary">
                Podívat se na program
              </Link>

            </div>

          </div>

          <div className="hero-image">
            <img src="/ucebna-deti.webp" alt="Výuka v učebně ARCHIMEDES" />
          </div>

        </div>
      </section>


      {/* CO PROGRAM PŘINÁŠÍ */}

      <section className="section benefits">
        <div className="container">

          <h2>
            Co program přináší do výuky
          </h2>

          <div className="grid-3">

            <div className="card">
              <div className="number">1</div>
              <h3>živý vstup</h3>
              <p>
                Do výuky vstupuje odborník z praxe – vědec, autor,
                podnikatel nebo inspirativní osobnost.
              </p>
            </div>

            <div className="card">
              <div className="number">1</div>
              <h3>silné téma</h3>
              <p>
                Každé vysílání se věnuje aktuálnímu tématu,
                které pomáhá žákům chápat svět v souvislostech.
              </p>
            </div>

            <div className="card">
              <div className="number">1</div>
              <h3>práce s třídou</h3>
              <p>
                Učitel dostává pracovní list a strukturu hodiny,
                takže lze program okamžitě využít ve výuce.
              </p>
            </div>

          </div>

        </div>
      </section>


      {/* ŠABLONY */}

      <section className="section funding">
        <div className="container funding-grid">

          <div className="funding-image">
            <img src="/panel-vysilani.webp" alt="Vysílání ARCHIMEDES Live ve škole" />
          </div>

          <div>

            <h2>
              Jak lze program využít ve Šablonách OP JAK
            </h2>

            <p>
              Školy často hledají smysluplné aktivity, které budou 
              skutečně přínosné pro žáky i učitele.
            </p>

            <p>
              ARCHIMEDES Live lze využít například v oblastech:
            </p>

            <ul className="list">

              <li>
                inovativní výuka
              </li>

              <li>
                projektové vzdělávání
              </li>

              <li>
                propojování školy s praxí
              </li>

              <li>
                rozvoj kompetencí žáků
              </li>

              <li>
                spolupráce mezi školami
              </li>

            </ul>

            <p>
              Program je připraven tak, aby jej bylo možné 
              snadno zapojit do běžného školního provozu.
            </p>

          </div>

        </div>
      </section>


      {/* PROČ TO DÁVÁ SMYSL */}

      <section className="section why">
        <div className="container">

          <h2>
            Proč školy ARCHIMEDES Live využívají
          </h2>

          <div className="grid-3">

            <div className="card">
              <h3>Inspirace pro žáky</h3>
              <p>
                Žáci se setkávají s lidmi z praxe a vidí,
                jak mohou znalosti využít v reálném životě.
              </p>
            </div>

            <div className="card">
              <h3>Podpora pro učitele</h3>
              <p>
                Učitel získává připravenou strukturu hodiny
                a kvalitní obsah bez zbytečné přípravy navíc.
              </p>
            </div>

            <div className="card">
              <h3>Propojení škol</h3>
              <p>
                Školy se zapojují do společné sítě a sdílejí
                zkušenosti i inspiraci.
              </p>
            </div>

          </div>

        </div>
      </section>


      {/* CTA */}

      <section className="section cta">
        <div className="container center">

          <h2>
            Chcete vidět, jak může ARCHIMEDES Live fungovat ve vaší škole?
          </h2>

          <p>
            Rádi vám ukážeme ukázkovou hodinu, kterou můžete
            vyzkoušet se svou třídou.
          </p>

          <Link href="/poptavka" className="btn-primary big">
            Domluvit ukázkovou hodinu
          </Link>

        </div>
      </section>


      <Footer />

    </main>
  );
}
