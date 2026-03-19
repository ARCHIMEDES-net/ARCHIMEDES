import Head from "next/head";
import Footer from "../components/Footer";

const heroImg = "/hero-vyuka.jpg";
const liveImgMain = "/jak-funguje-online.jpg";
const liveImgSecondary = "/jak-funguje-trida.jpg";
const guestImg = "/hoste.jpg";

export default function GuestPage() {
  return (
    <>
      <Head>
        <title>Become a Guest | ARCHIMEDES Live</title>
        <meta
          name="description"
          content="ARCHIMEDES Live connects exceptional personalities with real students through live, moderated sessions across schools and communities."
        />
      </Head>

      <main className="page">
        <section className="hero">
          <div className="heroMedia">
            <img src={heroImg} alt="ARCHIMEDES Live with students" />
            <div className="heroOverlay" />
          </div>

          <div className="heroContentWrap">
            <div className="container">
              <div className="heroContent">
                <div className="eyebrow">ARCHIMEDES Live</div>

                <h1>
                  You do not just speak.
                  <br />
                  You shape how young people
                  <br />
                  see the world.
                </h1>

                <p className="heroLead">
                  ARCHIMEDES Live connects exceptional personalities with real
                  students through live, moderated sessions across schools and
                  communities.
                </p>

                <div className="heroActions">
                  <a href="#contact" className="primaryButton">
                    Become a guest speaker
                  </a>
                  <a href="#live-format" className="secondaryButton">
                    See how it works
                  </a>
                </div>

                <div className="heroMeta">
                  <span>live sessions</span>
                  <span>real students</span>
                  <span>carefully selected guests</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section introSection">
          <div className="container narrow">
            <h2>What is ARCHIMEDES Live</h2>
            <p className="introText">
              ARCHIMEDES Live is a live educational program connecting schools,
              communities and inspiring personalities through carefully curated
              online sessions.
            </p>
            <p className="introText">
              We create real moments where students meet people with experience
              that goes beyond textbooks — leaders, creators, experts, public
              figures and voices worth hearing.
            </p>
          </div>
        </section>

        <section className="quoteSection">
          <div className="container narrow">
            <div className="quoteCard">
              <p>
                Students do not remember information.
                <br />
                They remember people.
              </p>
            </div>
          </div>
        </section>

        <section className="trustSection">
          <div className="container">
            <div className="trustGrid">
              <div className="trustCard trustCardDark">
                <div className="trustLabel">Why this matters</div>
                <h3>Real people. Real attention. Real influence.</h3>
                <p>
                  This is not a generic webinar. It is a moderated, human format
                  built to create attention, understanding and a lasting
                  impression.
                </p>
              </div>

              <div className="trustCard">
                <div className="statsGrid">
                  <div className="statItem">
                    <strong>Live</strong>
                    <span>moderated sessions</span>
                  </div>
                  <div className="statItem">
                    <strong>Schools</strong>
                    <span>and communities</span>
                  </div>
                  <div className="statItem">
                    <strong>Students</strong>
                    <span>engaged in real time</span>
                  </div>
                  <div className="statItem">
                    <strong>Guests</strong>
                    <span>carefully selected</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section whySection">
          <div className="container">
            <h2>Why join us</h2>

            <div className="cards3">
              <div className="benefitCard">
                <h3>Real impact</h3>
                <p>
                  You are not speaking into a camera. You are speaking to real
                  students who are listening, reacting and asking questions.
                </p>
              </div>

              <div className="benefitCard">
                <h3>Meaningful format</h3>
                <p>
                  A moderated discussion that makes your message clear, human
                  and memorable — without unnecessary complexity.
                </p>
              </div>

              <div className="benefitCard">
                <h3>Lasting influence</h3>
                <p>
                  One session can stay with students for years. A single voice
                  can shift how someone sees their future.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="inviteSection">
          <div className="container narrow">
            <div className="inviteBox">
              <div className="inviteLabel">Why we invite people like you</div>
              <p>
                We invite personalities who have something real to share —
                people who have built, led, created or changed something, and
                whose experience can genuinely inspire the next generation.
              </p>
            </div>
          </div>
        </section>

        <section className="section formatSection" id="live-format">
          <div className="container">
            <div className="formatGrid">
              <div className="formatLeft">
                <div className="eyebrow dark">Live format</div>
                <h2 className="leftTitle">How it works</h2>

                <div className="steps">
                  <div className="stepItem">
                    <span className="stepNumber">1</span>
                    <div>
                      <strong>A focused live session</strong>
                      <p>Usually 30–45 minutes, designed to keep attention.</p>
                    </div>
                  </div>

                  <div className="stepItem">
                    <span className="stepNumber">2</span>
                    <div>
                      <strong>Moderated discussion</strong>
                      <p>
                        Your message is introduced and guided in a clear,
                        human and respectful way.
                      </p>
                    </div>
                  </div>

                  <div className="stepItem">
                    <span className="stepNumber">3</span>
                    <div>
                      <strong>Student interaction</strong>
                      <p>
                        Questions and reactions can come through moderated chat
                        or discussion.
                      </p>
                    </div>
                  </div>

                  <div className="stepItem">
                    <span className="stepNumber">4</span>
                    <div>
                      <strong>Simple online connection</strong>
                      <p>
                        Participation is easy and technically straightforward.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="formatRight">
                <img
                  src={liveImgMain}
                  alt="ARCHIMEDES Live online session on screen"
                  className="mainVisual"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="section gallerySection">
          <div className="container">
            <div className="galleryHeader">
              <h2>What a live session feels like</h2>
              <p>
                Real attention. Real students. A format built for presence,
                clarity and connection.
              </p>
            </div>

            <div className="galleryGrid">
              <div className="galleryLarge">
                <img
                  src={liveImgSecondary}
                  alt="Students reacting during an ARCHIMEDES Live session"
                />
              </div>

              <div className="gallerySmallStack">
                <img
                  src={guestImg}
                  alt="Guests and ARCHIMEDES Live atmosphere"
                />

                <div className="galleryTextCard">
                  <div className="galleryTextLabel">What guests experience</div>
                  <h3>A carefully curated format</h3>
                  <p>
                    A calm, moderated environment where your message is given
                    space, attention and real human response.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="closingSection">
          <div className="container narrow">
            <div className="closingCard">
              <div className="closingLabel">A meaningful invitation</div>
              <h2>
                Your experience can change how
                <br />
                someone sees their future.
              </h2>
              <p>
                We carefully select our guest speakers. If your experience,
                perspective or story can make a real difference, we would be
                honored to welcome you to ARCHIMEDES Live.
              </p>
            </div>
          </div>
        </section>

        <section className="contactSection" id="contact">
          <div className="container narrow">
            <div className="contactCard">
              <div className="eyebrow dark">Contact</div>
              <h2>Let’s talk</h2>
              <p className="contactLead">
                If you are interested in joining ARCHIMEDES Live as a guest
                speaker, please contact:
              </p>

              <div className="contactPerson">
                <div className="contactName">Natálie Lípová</div>
                <div className="contactRole">Program & Content Manager</div>
                <div className="contactSubrole">
                  Program, broadcasting, platform content
                </div>
              </div>

              <div className="contactLinks">
                <a href="mailto:natalie.lipova@archimedeslive.com">
                  natalie.lipova@archimedeslive.com
                </a>
                <a href="tel:+420737628944">+420 737 628 944</a>
              </div>
            </div>
          </div>
        </section>

        <Footer />

        <style jsx>{`
          .page {
            background: #ffffff;
            color: #0f172a;
          }

          .container {
            max-width: 1180px;
            margin: 0 auto;
            padding: 0 20px;
          }

          .container.narrow {
            max-width: 860px;
          }

          .hero {
            position: relative;
          }

          .heroMedia {
            position: absolute;
            inset: 0;
            overflow: hidden;
          }

          .heroMedia img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
          }

          .heroOverlay {
            position: absolute;
            inset: 0;
            background: linear-gradient(
              90deg,
              rgba(9, 16, 32, 0.82) 0%,
              rgba(9, 16, 32, 0.66) 42%,
              rgba(9, 16, 32, 0.46) 100%
            );
          }

          .heroContentWrap {
            position: relative;
            z-index: 2;
            color: #ffffff;
          }

          .heroInner {
            min-height: 680px;
            display: flex;
            align-items: center;
            padding-top: 60px;
            padding-bottom: 60px;
          }

          .heroContent {
            max-width: 760px;
          }

          .eyebrow {
            display: inline-flex;
            align-items: center;
            min-height: 38px;
            padding: 0 14px;
            border-radius: 999px;
            background: rgba(255, 255, 255, 0.18);
            color: #ffffff;
            font-size: 13px;
            font-weight: 800;
            letter-spacing: 0.02em;
            margin-bottom: 22px;
          }

          .eyebrow.dark {
            background: #e9eef8;
            color: #223252;
          }

          h1 {
            margin: 0;
            font-size: 72px;
            line-height: 0.98;
            letter-spacing: -0.05em;
            font-weight: 900;
          }

          .heroLead {
            margin: 24px 0 0;
            font-size: 28px;
            line-height: 1.35;
            color: rgba(255, 255, 255, 0.92);
            max-width: 760px;
          }

          .heroActions {
            display: flex;
            flex-wrap: wrap;
            gap: 14px;
            margin-top: 34px;
          }

          .primaryButton,
          .secondaryButton {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-height: 52px;
            padding: 0 22px;
            border-radius: 14px;
            text-decoration: none;
            font-weight: 800;
            font-size: 16px;
            line-height: 1.2;
            white-space: nowrap;
            transition: transform 0.18s ease, box-shadow 0.18s ease,
              background 0.18s ease;
          }

          .primaryButton {
            background: #ffffff;
            color: #0f172a;
            box-shadow: 0 10px 24px rgba(15, 23, 42, 0.16);
          }

          .secondaryButton {
            background: rgba(255, 255, 255, 0.94);
            color: #0f172a;
            border: 1px solid rgba(255, 255, 255, 0.68);
            box-shadow: 0 10px 24px rgba(15, 23, 42, 0.12);
            backdrop-filter: blur(6px);
          }

          .primaryButton:hover,
          .secondaryButton:hover {
            transform: translateY(-2px);
          }

          .heroMeta {
            display: flex;
            flex-wrap: wrap;
            gap: 10px 12px;
            margin-top: 20px;
          }

          .heroMeta span {
            display: inline-flex;
            align-items: center;
            min-height: 34px;
            padding: 0 12px;
            border-radius: 999px;
            background: rgba(255, 255, 255, 0.14);
            border: 1px solid rgba(255, 255, 255, 0.2);
            color: rgba(255, 255, 255, 0.92);
            font-size: 13px;
            font-weight: 700;
          }

          .section {
            padding: 88px 0;
          }

          .introSection {
            padding-bottom: 72px;
          }

          .introSection h2,
          .whySection h2,
          .formatSection h2,
          .galleryHeader h2,
          .closingSection h2,
          .contactSection h2 {
            margin: 0;
            font-size: 54px;
            line-height: 1.02;
            letter-spacing: -0.045em;
            font-weight: 900;
            text-align: center;
            color: #0f172a;
          }

          .leftTitle {
            text-align: left !important;
          }

          .introText {
            margin: 18px 0 0;
            font-size: 25px;
            line-height: 1.55;
            color: #516076;
            text-align: center;
          }

          .quoteSection {
            padding: 0 0 84px;
            background: linear-gradient(to bottom, #ffffff 0%, #f7f8fb 100%);
          }

          .quoteCard {
            padding: 62px 38px;
            border-radius: 32px;
            background: #f4f6fa;
            border: 1px solid rgba(15, 23, 42, 0.06);
            box-shadow: 0 18px 40px rgba(15, 23, 42, 0.04);
          }

          .quoteCard p {
            margin: 0;
            text-align: center;
            font-size: 68px;
            line-height: 1.02;
            letter-spacing: -0.05em;
            font-weight: 900;
            color: #101b37;
          }

          .trustSection {
            padding: 0 0 88px;
            background: #f7f8fb;
          }

          .trustGrid {
            display: grid;
            grid-template-columns: 1.1fr 0.9fr;
            gap: 22px;
          }

          .trustCard {
            padding: 30px 28px;
            border-radius: 28px;
            background: #ffffff;
            border: 1px solid rgba(15, 23, 42, 0.08);
            box-shadow: 0 12px 34px rgba(15, 23, 42, 0.05);
          }

          .trustCardDark {
            background: #0f172a;
            color: #ffffff;
            box-shadow: 0 18px 40px rgba(15, 23, 42, 0.14);
          }

          .trustLabel {
            font-size: 13px;
            line-height: 1.4;
            font-weight: 800;
            letter-spacing: 0.04em;
            text-transform: uppercase;
            color: rgba(255, 255, 255, 0.62);
            margin-bottom: 12px;
          }

          .trustCard:not(.trustCardDark) .trustLabel {
            color: #5a6a84;
          }

          .trustCard h3 {
            margin: 0;
            font-size: 34px;
            line-height: 1.04;
            letter-spacing: -0.03em;
            font-weight: 900;
          }

          .trustCard p {
            margin: 16px 0 0;
            font-size: 19px;
            line-height: 1.65;
            color: rgba(255, 255, 255, 0.88);
          }

          .trustCard:not(.trustCardDark) p {
            color: #516076;
          }

          .statsGrid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 14px;
            height: 100%;
          }

          .statItem {
            padding: 18px 16px;
            border-radius: 18px;
            background: #f7f8fb;
            border: 1px solid rgba(15, 23, 42, 0.06);
            display: flex;
            flex-direction: column;
            gap: 6px;
            justify-content: center;
          }

          .statItem strong {
            font-size: 22px;
            line-height: 1.1;
            font-weight: 900;
            color: #101b37;
          }

          .statItem span {
            font-size: 15px;
            line-height: 1.45;
            color: #667085;
            font-weight: 700;
          }

          .whySection {
            padding-top: 88px;
            padding-bottom: 88px;
          }

          .cards3 {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 22px;
            margin-top: 40px;
          }

          .benefitCard {
            padding: 28px 26px;
            border-radius: 26px;
            background: #ffffff;
            border: 1px solid rgba(15, 23, 42, 0.08);
            box-shadow: 0 12px 34px rgba(15, 23, 42, 0.05);
          }

          .benefitCard h3 {
            margin: 0;
            font-size: 30px;
            line-height: 1.05;
            letter-spacing: -0.03em;
            font-weight: 900;
            color: #101b37;
          }

          .benefitCard p {
            margin: 16px 0 0;
            font-size: 18px;
            line-height: 1.7;
            color: #516076;
          }

          .inviteSection {
            padding: 0 0 88px;
          }

          .inviteBox {
            padding: 28px 30px;
            border-radius: 28px;
            background: linear-gradient(135deg, #eef6ff 0%, #f8fbff 100%);
            border: 1px solid rgba(37, 99, 235, 0.1);
            text-align: center;
          }

          .inviteLabel {
            font-size: 13px;
            line-height: 1.4;
            font-weight: 800;
            letter-spacing: 0.04em;
            text-transform: uppercase;
            color: #315594;
            margin-bottom: 10px;
          }

          .inviteBox p {
            margin: 0;
            font-size: 22px;
            line-height: 1.6;
            color: #31435f;
          }

          .formatSection {
            background: #f7f8fb;
          }

          .formatGrid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 28px;
            align-items: start;
          }

          .steps {
            display: grid;
            gap: 18px;
            margin-top: 28px;
          }

          .stepItem {
            display: grid;
            grid-template-columns: 40px 1fr;
            gap: 14px;
            align-items: start;
          }

          .stepNumber {
            width: 40px;
            height: 40px;
            border-radius: 999px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            background: #101b37;
            color: #ffffff;
            font-size: 15px;
            line-height: 1;
            font-weight: 900;
            margin-top: 2px;
          }

          .stepItem strong {
            display: block;
            font-size: 20px;
            line-height: 1.3;
            color: #101b37;
          }

          .stepItem p {
            margin: 6px 0 0;
            font-size: 17px;
            line-height: 1.65;
            color: #516076;
          }

          .formatRight {
            display: grid;
          }

          .mainVisual {
            width: 100%;
            height: 100%;
            min-height: 540px;
            object-fit: cover;
            border-radius: 30px;
            box-shadow: 0 18px 42px rgba(15, 23, 42, 0.12);
          }

          .gallerySection {
            padding-top: 88px;
            padding-bottom: 88px;
          }

          .galleryHeader {
            max-width: 840px;
            margin: 0 auto 34px;
            text-align: center;
          }

          .galleryHeader p {
            margin: 18px 0 0;
            font-size: 22px;
            line-height: 1.6;
            color: #516076;
          }

          .galleryGrid {
            display: grid;
            grid-template-columns: 1.25fr 0.75fr;
            gap: 22px;
            align-items: stretch;
          }

          .galleryLarge img,
          .gallerySmallStack img {
            width: 100%;
            display: block;
            object-fit: cover;
            border-radius: 28px;
            box-shadow: 0 14px 34px rgba(15, 23, 42, 0.08);
          }

          .galleryLarge img {
            height: 100%;
            min-height: 560px;
          }

          .gallerySmallStack {
            display: grid;
            gap: 22px;
          }

          .gallerySmallStack img {
            min-height: 269px;
          }

          .galleryTextCard {
            min-height: 269px;
            padding: 28px 24px;
            border-radius: 28px;
            background: linear-gradient(135deg, #0f172a 0%, #16213d 100%);
            color: #ffffff;
            box-shadow: 0 14px 34px rgba(15, 23, 42, 0.12);
            display: flex;
            flex-direction: column;
            justify-content: center;
          }

          .galleryTextLabel {
            font-size: 13px;
            line-height: 1.4;
            font-weight: 800;
            letter-spacing: 0.04em;
            text-transform: uppercase;
            color: rgba(255, 255, 255, 0.66);
            margin-bottom: 10px;
          }

          .galleryTextCard h3 {
            margin: 0;
            font-size: 28px;
            line-height: 1.08;
            letter-spacing: -0.03em;
            font-weight: 900;
          }

          .galleryTextCard p {
            margin: 14px 0 0;
            font-size: 17px;
            line-height: 1.65;
            color: rgba(255, 255, 255, 0.84);
          }

          .closingSection {
            padding: 0 0 88px;
          }

          .closingCard {
            padding: 34px 34px 36px;
            border-radius: 30px;
            background: #0f172a;
            color: #ffffff;
            box-shadow: 0 18px 42px rgba(15, 23, 42, 0.14);
            text-align: center;
          }

          .closingLabel {
            font-size: 13px;
            line-height: 1.4;
            font-weight: 800;
            letter-spacing: 0.04em;
            text-transform: uppercase;
            color: rgba(255, 255, 255, 0.64);
            margin-bottom: 14px;
          }

          .closingCard h2 {
            color: #ffffff;
          }

          .closingCard p {
            margin: 18px auto 0;
            max-width: 720px;
            font-size: 20px;
            line-height: 1.7;
            color: rgba(255, 255, 255, 0.84);
          }

          .contactSection {
            padding: 0 0 96px;
          }

          .contactCard {
            padding: 34px 30px;
            border-radius: 30px;
            background: linear-gradient(135deg, #ffffff 0%, #f8fbff 100%);
            border: 1px solid rgba(15, 23, 42, 0.08);
            box-shadow: 0 12px 34px rgba(15, 23, 42, 0.05);
            text-align: center;
          }

          .contactLead {
            margin: 18px 0 0;
            font-size: 20px;
            line-height: 1.7;
            color: #516076;
          }

          .contactPerson {
            margin-top: 26px;
          }

          .contactName {
            font-size: 32px;
            line-height: 1.08;
            letter-spacing: -0.03em;
            font-weight: 900;
            color: #101b37;
          }

          .contactRole {
            margin-top: 8px;
            font-size: 18px;
            line-height: 1.5;
            font-weight: 800;
            color: #315594;
          }

          .contactSubrole {
            margin-top: 6px;
            font-size: 16px;
            line-height: 1.6;
            color: #667085;
          }

          .contactLinks {
            display: grid;
            gap: 10px;
            margin-top: 22px;
          }

          .contactLinks a {
            color: #0f172a;
            text-decoration: none;
            font-size: 20px;
            line-height: 1.5;
            font-weight: 800;
          }

          .contactLinks a:hover {
            text-decoration: underline;
          }

          @media (max-width: 1100px) {
            h1 {
              font-size: 60px;
            }

            .heroLead {
              font-size: 24px;
            }

            .quoteCard p {
              font-size: 56px;
            }
          }

          @media (max-width: 980px) {
            .trustGrid,
            .cards3,
            .formatGrid,
            .galleryGrid {
              grid-template-columns: 1fr;
            }

            .galleryLarge img {
              min-height: 420px;
            }

            .gallerySmallStack img,
            .galleryTextCard {
              min-height: 260px;
            }

            .mainVisual {
              min-height: 420px;
            }

            .leftTitle {
              text-align: center !important;
            }
          }

          @media (max-width: 640px) {
            .container {
              padding: 0 16px;
            }

            .heroInner {
              min-height: 560px;
              padding-top: 44px;
              padding-bottom: 44px;
            }

            h1 {
              font-size: 42px;
              line-height: 1.02;
            }

            .heroLead {
              font-size: 19px;
            }

            .heroActions {
              flex-direction: column;
              align-items: stretch;
            }

            .primaryButton,
            .secondaryButton {
              width: 100%;
            }

            .section,
            .introSection,
            .whySection,
            .formatSection,
            .gallerySection {
              padding-top: 64px;
              padding-bottom: 64px;
            }

            .quoteSection,
            .trustSection,
            .inviteSection,
            .closingSection {
              padding-bottom: 64px;
            }

            .introSection h2,
            .whySection h2,
            .formatSection h2,
            .galleryHeader h2,
            .closingSection h2,
            .contactSection h2 {
              font-size: 36px;
            }

            .introText,
            .galleryHeader p,
            .inviteBox p,
            .contactLead,
            .closingCard p {
              font-size: 18px;
            }

            .quoteCard {
              padding: 34px 20px;
              border-radius: 24px;
            }

            .quoteCard p {
              font-size: 38px;
              line-height: 1.06;
            }

            .trustCard,
            .benefitCard,
            .inviteBox,
            .closingCard,
            .contactCard,
            .galleryTextCard {
              border-radius: 24px;
              padding-left: 20px;
              padding-right: 20px;
            }

            .statsGrid {
              grid-template-columns: 1fr;
            }

            .benefitCard h3,
            .trustCard h3,
            .galleryTextCard h3 {
              font-size: 28px;
            }

            .mainVisual,
            .galleryLarge img,
            .gallerySmallStack img,
            .galleryTextCard {
              min-height: 260px;
              border-radius: 22px;
            }

            .contactName {
              font-size: 28px;
            }

            .contactLinks a {
              font-size: 18px;
            }
          }
        `}</style>
      </main>
    </>
  );
}
