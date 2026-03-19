import Head from "next/head";
import Link from "next/link";
import Footer from "../components/Footer";

export default function GuestPage() {
  return (
    <>
      <Head>
        <title>Become a Guest | ARCHIMEDES Live</title>
        <meta
          name="description"
          content="Join ARCHIMEDES Live as a guest speaker and inspire students and communities across Europe."
        />
      </Head>

      <main className="page">

        {/* HERO */}
        <section className="hero">
          <div className="heroOverlay">
            <div className="container heroContent">
              <div className="badge">ARCHIMEDES Live</div>

              <h1>
                Share your story.<br />
                Inspire the next generation.
              </h1>

              <p className="lead">
                ARCHIMEDES Live connects exceptional personalities with real students
                and communities through live educational sessions.
              </p>

              <a href="#contact" className="ctaPrimary">
                Become a guest speaker
              </a>
            </div>
          </div>
        </section>

        {/* WHAT IS IT */}
        <section className="section">
          <div className="container narrow">
            <h2>What is ARCHIMEDES Live</h2>

            <p className="text">
              ARCHIMEDES Live is a live educational program connecting schools,
              communities and inspiring personalities across Europe.
            </p>

            <p className="text">
              We organize moderated live sessions where students meet real people
              with real experience – from science, culture, business, public life
              and beyond.
            </p>
          </div>
        </section>

        {/* WHY JOIN */}
        <section className="section alt">
          <div className="container">
            <h2>Why join us</h2>

            <div className="grid3">
              <div className="card">
                <h3>Real impact</h3>
                <p>
                  Speak directly to students and communities and influence how
                  they think about their future.
                </p>
              </div>

              <div className="card">
                <h3>Meaningful format</h3>
                <p>
                  A moderated discussion that makes your message clear,
                  understandable and engaging.
                </p>
              </div>

              <div className="card">
                <h3>International reach</h3>
                <p>
                  Be part of a growing educational network across cities,
                  schools and countries.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="section">
          <div className="container narrow">
            <h2>How it works</h2>

            <div className="steps">
              <div className="step">
                <span>1</span>
                <p>30–45 minute live session</p>
              </div>

              <div className="step">
                <span>2</span>
                <p>Moderated discussion with students</p>
              </div>

              <div className="step">
                <span>3</span>
                <p>Questions via chat interaction</p>
              </div>

              <div className="step">
                <span>4</span>
                <p>Simple online connection (Google Meet)</p>
              </div>
            </div>
          </div>
        </section>

        {/* VISUAL / PROOF */}
        <section className="visual">
          <div className="container">
            <div className="visualGrid">
              <img src="/ucebna.jpg" alt="ARCHIMEDES classroom" />
              <img src="/vyuka.jpeg" alt="Live session" />
              <img src="/hoste.jpg" alt="Guests" />
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="section highlight" id="contact">
          <div className="container narrow">
            <h2>Join the program</h2>

            <p className="text center">
              If you are interested in becoming a guest speaker, we would be happy
              to connect with you.
            </p>

            <div className="contactBox">
              <div className="contactName">Natálie Lípová</div>
              <div className="contactRole">
                Program & Content Manager
              </div>

              <div className="contactDetails">
                <a href="mailto:natalie.lipova@archimedeslive.com">
                  natalie.lipova@archimedeslive.com
                </a>
                <span>+420 737 628 944</span>
              </div>
            </div>
          </div>
        </section>

        <Footer />

        <style jsx>{`
          .page {
            font-family: system-ui, -apple-system, sans-serif;
            color: #0f172a;
          }

          .container {
            max-width: 1100px;
            margin: 0 auto;
            padding: 0 20px;
          }

          .container.narrow {
            max-width: 760px;
          }

          .hero {
            background-image: url("/ucebna.jpg");
            background-size: cover;
            background-position: center;
          }

          .heroOverlay {
            background: rgba(0, 0, 0, 0.55);
            padding: 120px 0;
          }

          .heroContent {
            color: white;
          }

          .badge {
            display: inline-block;
            background: rgba(255,255,255,0.15);
            padding: 6px 12px;
            border-radius: 999px;
            margin-bottom: 16px;
            font-weight: 600;
          }

          h1 {
            font-size: 48px;
            line-height: 1.1;
            font-weight: 800;
          }

          .lead {
            margin-top: 16px;
            font-size: 18px;
            max-width: 600px;
          }

          .ctaPrimary {
            display: inline-block;
            margin-top: 24px;
            background: white;
            color: black;
            padding: 14px 22px;
            border-radius: 10px;
            font-weight: 600;
            text-decoration: none;
          }

          .section {
            padding: 80px 0;
          }

          .section.alt {
            background: #f5f7fa;
          }

          .section.highlight {
            background: #0f172a;
            color: white;
          }

          h2 {
            font-size: 32px;
            margin-bottom: 20px;
          }

          .text {
            font-size: 17px;
            line-height: 1.7;
            margin-bottom: 16px;
          }

          .text.center {
            text-align: center;
          }

          .grid3 {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
          }

          .card {
            background: white;
            padding: 24px;
            border-radius: 16px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.05);
          }

          .steps {
            display: grid;
            gap: 16px;
          }

          .step {
            display: flex;
            gap: 12px;
            align-items: center;
          }

          .step span {
            width: 30px;
            height: 30px;
            border-radius: 50%;
            background: #0f172a;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
          }

          .visualGrid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
          }

          .visualGrid img {
            width: 100%;
            border-radius: 12px;
          }

          .contactBox {
            margin-top: 30px;
            text-align: center;
          }

          .contactName {
            font-size: 22px;
            font-weight: 700;
          }

          .contactRole {
            opacity: 0.8;
            margin-bottom: 12px;
          }

          .contactDetails {
            display: flex;
            flex-direction: column;
            gap: 6px;
          }

          .contactDetails a {
            color: white;
            text-decoration: none;
          }

          @media (max-width: 900px) {
            .grid3 {
              grid-template-columns: 1fr;
            }

            h1 {
              font-size: 34px;
            }
          }
        `}</style>
      </main>
    </>
  );
}
