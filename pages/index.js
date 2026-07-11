import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { track } from "@vercel/analytics";
import Footer from "../components/Footer";
import PhotoWithFallback from "../components/PhotoWithFallback";
import PublicMonthCalendar from "../components/PublicMonthCalendar";
import PublicEventCard from "../components/PublicEventCard";
import { fetchPublicUpcomingEvents } from "../lib/publicEvents";
import {
  hero,
  heroStats,
  liveSection,
  partnersSection,
  partners,
  featuresSection,
  featureCards,
  communitySection,
  atmosphereSection,
  atmospherePhotos,
  referencesSection,
  references,
  ctaBand,
} from "../content/homepage";

const FEATURE_ICONS = {
  graduation: "🎓",
  link: "🔗",
  chat: "💬",
  growth: "📈",
  megaphone: "📣",
  archive: "🗂️",
};

function CtaButton({ href, children, variant = "primary", eventName }) {
  return (
    <Link
      href={href}
      className={`cta cta-${variant}`}
      onClick={() => eventName && track(eventName)}
    >
      {children}
    </Link>
  );
}

export default function Home() {
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetchPublicUpcomingEvents().then((res) => {
      if (cancelled) return;
      setEvents(res.events);
      setEventsLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const visibleStats = heroStats.filter((s) => s.visible);
  const visiblePartners = partners.filter((p) => p.visible);
  const visibleFeatures = featureCards.filter((f) => f.visible);
  const visibleAtmospherePhotos = atmospherePhotos.filter((p) => p.visible);
  const visibleReferences = references.filter((r) => r.visible);
  const upcomingCards = events.slice(0, 3);

  return (
    <>
      <Head>
        <title>ARCHIMEDES Live | Silná komunita. Úspěšná obec.</title>
        <meta
          name="description"
          content="ARCHIMEDES Live spojuje všechny, kdo tvoří život vaší obce — školy, spolky, seniory, rodiče i národní organizace — do jednoho celoročního programu."
        />
      </Head>

      <main className="page">
        {/* HERO */}
        <section className="hero">
          <div className="container heroGrid">
            <div className="heroContent">
              <div className="eyebrow">{hero.eyebrow}</div>

              <h1>
                {hero.titleLine1}
                <br />
                <span className="heroAccent">{hero.titleLine2}</span>
              </h1>

              <p className="heroSubtitle">{hero.subtitle}</p>
              <p className="heroLead">{hero.lead}</p>

              <div className="heroActions">
                <CtaButton href={hero.primaryCta.href} eventName="klik_home_cta_primary">
                  {hero.primaryCta.label}
                </CtaButton>
                <CtaButton
                  href={hero.secondaryCta.href}
                  variant="secondary"
                  eventName="klik_home_jak_to_funguje"
                >
                  {hero.secondaryCta.label} <span aria-hidden="true">▶</span>
                </CtaButton>
              </div>
            </div>

            <div className="heroPhotoWrap">
              <PhotoWithFallback
                src={hero.photo}
                alt={hero.photoAlt}
                fallbackLabel="ARCHIMEDES Live"
                style={{ width: "100%", height: "100%", minHeight: 360 }}
                imgStyle={{ objectFit: "cover", objectPosition: "25% center" }}
                className="heroPhoto"
              />

              {hero.floatingCard.visible ? (
                <div className="floatingCard">
                  <span className="floatingIcon" aria-hidden="true">
                    👥
                  </span>
                  <div>
                    <strong>{hero.floatingCard.title}</strong>
                    <span>{hero.floatingCard.text}</span>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {visibleStats.length ? (
            <div className="statsBar">
              <div className="container statsGrid">
                {visibleStats.map((s) => (
                  <div key={s.id} className="statItem">
                    <span className="statValue">{s.value}</span>
                    <span className="statLabel">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </section>

        {/* LIVE + CALENDAR */}
        <section id="kalendar" className="section sectionLive">
          <div className="container liveGrid">
            <div className="liveMain">
              <div className="eyebrow dark">{liveSection.eyebrow}</div>
              <h2>
                {liveSection.title} <span className="liveDot" aria-hidden="true" />
              </h2>
              <p className="sectionLead">{liveSection.subtitle}</p>

              {eventsLoading ? (
                <div className="liveLoading">Načítám nadcházející vysílání…</div>
              ) : upcomingCards.length ? (
                <div className="liveCards">
                  {upcomingCards.map((event) => (
                    <PublicEventCard key={event.id} event={event} compact />
                  ))}
                </div>
              ) : (
                <div className="liveLoading">Zatím žádné naplánované vysílání.</div>
              )}

              <Link href="/kalendar" className="liveLink">
                {liveSection.showAllLabel} <span aria-hidden="true">→</span>
              </Link>
            </div>

            <div className="liveAside">
              <PublicMonthCalendar
                events={events}
                lockedNote={liveSection.calendarLockedNote}
                onNavigate={() => router.push("/kalendar")}
              />
            </div>
          </div>
        </section>

        {/* PARTNERS */}
        {visiblePartners.length ? (
          <section className="section sectionPartners">
            <div className="container">
              <div className="partnersHead">
                <div>
                  <div className="eyebrow dark">{partnersSection.eyebrow}</div>
                  <h2 className="partnersTitle">{partnersSection.title}</h2>
                </div>
                <Link href={partnersSection.showAllHref} className="liveLink">
                  {partnersSection.showAllLabel} <span aria-hidden="true">→</span>
                </Link>
              </div>

              <div className="partnersRow">
                {visiblePartners.map((p) => (
                  <div key={p.id} className="partnerItem">
                    <PhotoWithFallback
                      src={p.logo}
                      alt={p.name}
                      fallbackLabel={p.name}
                      style={{ width: 40, height: 40 }}
                      rounded
                    />
                    <span>{p.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {/* FEATURES */}
        <section id="jak-to-funguje" className="section sectionFeatures">
          <div className="container">
            <div className="featuresHead">
              <div className="featuresIntro">
                <div className="eyebrow dark">{featuresSection.eyebrow}</div>
                <h2>{featuresSection.title}</h2>
              </div>

              {featuresSection.photo ? (
                <div className="featuresPhotoWrap">
                  <PhotoWithFallback
                    src={featuresSection.photo}
                    alt={featuresSection.photoAlt}
                    fallbackLabel="ARCHIMEDES Live"
                    style={{ width: "100%", height: "100%" }}
                    imgStyle={{ objectFit: "cover" }}
                  />
                </div>
              ) : null}
            </div>

            <div className="featuresGrid">
              {visibleFeatures.map((f) => (
                <div key={f.id} className="featureCard">
                  <div className="featureIcon" aria-hidden="true">
                    {FEATURE_ICONS[f.icon] || "✅"}
                  </div>
                  <h3>{f.title}</h3>
                  <p>{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* COMMUNITY & SENIORS */}
        {communitySection.visible ? (
          <section className="section sectionCommunity">
            <div className="container communityGrid">
              <div className="communityPhotoWrap">
                <PhotoWithFallback
                  src={communitySection.photo}
                  alt={communitySection.photoAlt}
                  fallbackLabel="ARCHIMEDES Live"
                  style={{ width: "100%", height: "100%" }}
                  imgStyle={{ objectFit: "cover" }}
                />
              </div>

              <div className="communityContent">
                <div className="eyebrow dark">{communitySection.eyebrow}</div>
                <h2>{communitySection.title}</h2>
                <p className="sectionLead">{communitySection.text}</p>
                <Link href={communitySection.cta.href} className="liveLink">
                  {communitySection.cta.label} <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </section>
        ) : null}

        {/* ATMOSPHERE / EVENTS */}
        {atmosphereSection.visible && visibleAtmospherePhotos.length ? (
          <section className="section sectionAtmosphere">
            <div className="container">
              <div className="eyebrow dark">{atmosphereSection.eyebrow}</div>
              <h2>{atmosphereSection.title}</h2>
              <p className="sectionLead">{atmosphereSection.subtitle}</p>

              <div className="atmosphereGrid">
                {visibleAtmospherePhotos.map((p, i) => (
                  <div
                    key={p.id}
                    className={`atmospherePhotoWrap${i === 0 ? " atmosphereMain" : ""}`}
                  >
                    <PhotoWithFallback
                      src={p.src}
                      alt={p.alt}
                      fallbackLabel="ARCHIMEDES Live"
                      style={{ width: "100%", height: "100%" }}
                      imgStyle={{ objectFit: "cover", objectPosition: p.objectPosition || "center" }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {/* REFERENCES */}
        {visibleReferences.length ? (
          <section id="reference" className="section sectionReferences">
            <div className="container">
              <div className="partnersHead">
                <div>
                  <div className="eyebrow dark">{referencesSection.eyebrow}</div>
                  <h2 className="partnersTitle">{referencesSection.title}</h2>
                </div>
                <Link href={referencesSection.showAllHref} className="liveLink">
                  {referencesSection.showAllLabel} <span aria-hidden="true">→</span>
                </Link>
              </div>

              <div className="referencesGrid">
                {visibleReferences.map((r) => (
                  <article key={r.id} className="refCard">
                    <div className="refPhotoWrap">
                      <PhotoWithFallback
                        src={r.photo}
                        alt={r.photoAlt || `Obec ${r.name}`}
                        fallbackLabel={r.name}
                        style={{ width: "100%", height: "100%" }}
                        imgStyle={
                          r.photoFit === "contain"
                            ? { objectFit: "contain", padding: 24 }
                            : { objectFit: "cover" }
                        }
                      />
                      {r.crest ? (
                        <div className="refCrest">
                          <PhotoWithFallback
                            src={r.crest}
                            alt={r.crestAlt || `Znak obce ${r.name}`}
                            fallbackLabel={r.name}
                            style={{ width: 40, height: 40 }}
                            rounded
                          />
                        </div>
                      ) : null}
                      <div className="refBadge">{r.badge}</div>
                    </div>

                    <div className="refBody">
                      <strong>{r.name}</strong>
                      <span className="refRegion">{r.region}</span>
                      <p>&bdquo;{r.quote}&ldquo;</p>
                      <Link href={r.storyHref} className="liveLink">
                        {referencesSection.readStoryLabel} <span aria-hidden="true">→</span>
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {/* CTA BAND */}
        {ctaBand.visible ? (
          <section className="ctaSection">
            <div className="container ctaBandBox">
              <div className="ctaBandMain">
                <span className="ctaBandIcon" aria-hidden="true">
                  👥
                </span>
                <div>
                  <h2>{ctaBand.title}</h2>
                  <p>{ctaBand.subtitle}</p>
                </div>
              </div>
              <CtaButton href={ctaBand.cta.href} variant="light" eventName="klik_home_cta_band">
                {ctaBand.cta.label} <span aria-hidden="true">→</span>
              </CtaButton>
            </div>
          </section>
        ) : null}

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

          .eyebrow {
            display: inline-flex;
            align-items: center;
            min-height: 30px;
            padding: 0 12px;
            border-radius: 999px;
            font-size: 12px;
            font-weight: 900;
            letter-spacing: 0.06em;
            text-transform: uppercase;
            margin-bottom: 12px;
            background: #e7eef9;
            color: #1e3a5f;
          }

          .eyebrow.dark {
            background: #eef2f8;
            color: #1e3a5f;
          }

          /* HERO */
          .hero {
            padding: 40px 0 0;
          }

          .heroGrid {
            display: grid;
            grid-template-columns: minmax(0, 1.05fr) minmax(320px, 0.95fr);
            gap: 36px;
            align-items: center;
            padding-bottom: 40px;
          }

          h1 {
            margin: 0;
            font-size: 58px;
            line-height: 1;
            letter-spacing: -0.045em;
            font-weight: 950;
            color: #0f172a;
          }

          .heroAccent {
            color: #1d4ed8;
          }

          .heroSubtitle {
            margin: 18px 0 0;
            font-size: 20px;
            font-weight: 800;
            color: #172033;
            letter-spacing: -0.01em;
          }

          .heroLead {
            margin: 12px 0 0;
            font-size: 16.5px;
            line-height: 1.7;
            color: #5a6474;
            max-width: 560px;
          }

          .heroActions {
            margin-top: 26px;
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
          }

          .heroPhotoWrap {
            position: relative;
            border-radius: 28px;
            overflow: hidden;
            aspect-ratio: 4 / 3.1;
            box-shadow: 0 24px 60px rgba(15, 23, 42, 0.14);
          }

          .heroPhotoWrap :global(.heroPhoto) {
            border-radius: 0 !important;
          }

          .floatingCard {
            position: absolute;
            right: 16px;
            bottom: 16px;
            left: 16px;
            max-width: 300px;
            margin-left: auto;
            display: flex;
            align-items: center;
            gap: 12px;
            background: #ffffff;
            border-radius: 18px;
            padding: 14px 16px;
            box-shadow: 0 14px 34px rgba(15, 23, 42, 0.18);
          }

          .floatingIcon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 40px;
            height: 40px;
            border-radius: 999px;
            background: #1d4ed8;
            color: #ffffff;
            font-size: 18px;
            flex: 0 0 auto;
          }

          .floatingCard strong {
            display: block;
            font-size: 14px;
            color: #0f172a;
          }

          .floatingCard span {
            display: block;
            margin-top: 3px;
            font-size: 12.5px;
            color: #64748b;
            line-height: 1.4;
          }

          .statsBar {
            border-top: 1px solid rgba(15, 23, 42, 0.06);
            border-bottom: 1px solid rgba(15, 23, 42, 0.06);
            background: #f8fafc;
          }

          .statsGrid {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 16px;
            padding: 22px 20px;
          }

          .statItem {
            display: flex;
            align-items: baseline;
            gap: 8px;
          }

          .statValue {
            font-size: 24px;
            font-weight: 950;
            color: #0f172a;
            letter-spacing: -0.02em;
          }

          .statLabel {
            font-size: 13.5px;
            font-weight: 700;
            color: #64748b;
          }

          /* SECTIONS */
          .section {
            padding: 56px 0;
          }

          h2 {
            margin: 0;
            font-size: 32px;
            line-height: 1.12;
            letter-spacing: -0.03em;
            font-weight: 950;
            color: #0f172a;
          }

          .sectionLead {
            margin: 10px 0 0;
            font-size: 15.5px;
            line-height: 1.6;
            color: #5a6474;
            max-width: 480px;
          }

          .liveDot {
            display: inline-block;
            width: 10px;
            height: 10px;
            border-radius: 999px;
            background: #22c55e;
            margin-left: 6px;
          }

          .liveGrid {
            display: grid;
            grid-template-columns: minmax(0, 1.5fr) minmax(300px, 1fr);
            gap: 28px;
            align-items: start;
          }

          .liveCards {
            margin-top: 22px;
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 14px;
          }

          .liveLoading {
            margin-top: 22px;
            color: #64748b;
            font-size: 15px;
          }

          .sectionPartners {
            background: #f8fafc;
            border-top: 1px solid rgba(15, 23, 42, 0.06);
            border-bottom: 1px solid rgba(15, 23, 42, 0.06);
          }

          .partnersHead {
            display: flex;
            align-items: flex-end;
            justify-content: space-between;
            gap: 16px;
            flex-wrap: wrap;
          }

          .partnersTitle {
            max-width: 620px;
          }

          .partnersRow {
            margin-top: 26px;
            display: flex;
            flex-wrap: wrap;
            gap: 28px 34px;
          }

          .partnerItem {
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 14px;
            font-weight: 800;
            color: #334155;
          }

          .featuresHead {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 28px;
            flex-wrap: wrap;
          }

          .featuresIntro {
            flex: 1 1 360px;
            max-width: 620px;
          }

          .featuresPhotoWrap {
            flex: 0 0 auto;
            width: 300px;
            aspect-ratio: 16 / 10;
            border-radius: 22px;
            overflow: hidden;
            box-shadow: 0 14px 34px rgba(15, 23, 42, 0.12);
          }

          .featuresGrid {
            margin-top: 26px;
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 18px;
          }

          .featureCard {
            background: #ffffff;
            border: 1px solid rgba(15, 23, 42, 0.07);
            border-radius: 22px;
            padding: 22px;
          }

          .featureIcon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 46px;
            height: 46px;
            border-radius: 14px;
            background: #e8f8ee;
            font-size: 22px;
            margin-bottom: 14px;
          }

          .featureCard h3 {
            margin: 0;
            font-size: 17px;
            letter-spacing: -0.02em;
            color: #0f172a;
          }

          .featureCard p {
            margin: 8px 0 0;
            font-size: 14.5px;
            line-height: 1.6;
            color: #5b6676;
          }

          .sectionCommunity {
            background: #f8fafc;
            border-top: 1px solid rgba(15, 23, 42, 0.06);
            border-bottom: 1px solid rgba(15, 23, 42, 0.06);
          }

          .communityGrid {
            display: grid;
            grid-template-columns: minmax(0, 0.9fr) minmax(320px, 1.1fr);
            gap: 36px;
            align-items: center;
          }

          .communityPhotoWrap {
            border-radius: 28px;
            overflow: hidden;
            aspect-ratio: 4 / 3.1;
            box-shadow: 0 24px 60px rgba(15, 23, 42, 0.14);
          }

          .communityContent .sectionLead {
            max-width: 480px;
          }

          .sectionAtmosphere .sectionLead {
            max-width: 560px;
          }

          .atmosphereGrid {
            margin-top: 26px;
            display: grid;
            grid-template-columns: 1.4fr 1fr;
            grid-template-rows: repeat(2, minmax(160px, 1fr));
            gap: 16px;
            height: 420px;
          }

          .atmospherePhotoWrap {
            position: relative;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 14px 34px rgba(15, 23, 42, 0.1);
          }

          .atmosphereMain {
            grid-row: span 2;
          }

          .referencesGrid {
            margin-top: 26px;
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 18px;
          }

          .refCard {
            border: 1px solid rgba(15, 23, 42, 0.08);
            border-radius: 22px;
            overflow: hidden;
            background: #ffffff;
          }

          .refPhotoWrap {
            position: relative;
            aspect-ratio: 4 / 3;
            background: #eef2f8;
          }

          .refCrest {
            position: absolute;
            left: 12px;
            bottom: -20px;
            border-radius: 999px;
            box-shadow: 0 6px 16px rgba(15, 23, 42, 0.2);
            border: 3px solid #ffffff;
          }

          .refBadge {
            position: absolute;
            right: 10px;
            top: 10px;
            max-width: 120px;
            padding: 6px 10px;
            border-radius: 12px;
            background: rgba(15, 23, 42, 0.82);
            color: #ffffff;
            font-size: 10.5px;
            font-weight: 900;
            line-height: 1.3;
            text-align: center;
          }

          .refBody {
            padding: 28px 16px 18px;
          }

          .refBody strong {
            display: block;
            font-size: 16px;
            color: #0f172a;
          }

          .refRegion {
            display: block;
            margin-top: 2px;
            font-size: 12.5px;
            color: #94a3b8;
            font-weight: 700;
          }

          .refBody p {
            margin: 10px 0 0;
            font-size: 13.5px;
            line-height: 1.55;
            color: #475569;
          }

          .ctaSection {
            padding: 0 0 64px;
          }

          .ctaBandBox {
            background: #eef4ff;
            border-radius: 26px;
            padding: 30px 30px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 20px;
            flex-wrap: wrap;
          }

          .ctaBandMain {
            display: flex;
            align-items: center;
            gap: 16px;
          }

          .ctaBandIcon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 52px;
            height: 52px;
            border-radius: 999px;
            background: #1d4ed8;
            color: #ffffff;
            font-size: 22px;
            flex: 0 0 auto;
          }

          .ctaBandBox h2 {
            font-size: 22px;
          }

          .ctaBandBox p {
            margin: 6px 0 0;
            font-size: 14.5px;
            color: #45536b;
          }

          @media (max-width: 1080px) {
            .heroGrid {
              grid-template-columns: 1fr;
            }

            .liveGrid {
              grid-template-columns: 1fr;
            }

            .liveCards {
              grid-template-columns: repeat(3, minmax(0, 1fr));
            }

            .referencesGrid {
              grid-template-columns: repeat(2, minmax(0, 1fr));
            }

            .featuresGrid {
              grid-template-columns: repeat(2, minmax(0, 1fr));
            }

            .featuresPhotoWrap {
              width: 240px;
            }

            .communityGrid {
              grid-template-columns: 1fr;
            }
          }

          @media (max-width: 720px) {
            h1 {
              font-size: 42px;
            }

            .statsGrid {
              grid-template-columns: repeat(2, minmax(0, 1fr));
            }

            .liveCards {
              grid-template-columns: 1fr;
            }

            .referencesGrid {
              grid-template-columns: 1fr;
            }

            .featuresGrid {
              grid-template-columns: 1fr;
            }

            .featuresPhotoWrap {
              width: 100%;
            }

            .atmosphereGrid {
              grid-template-columns: 1fr;
              grid-template-rows: none;
              height: auto;
            }

            .atmospherePhotoWrap {
              aspect-ratio: 4 / 3;
            }

            .atmosphereMain {
              grid-row: auto;
              aspect-ratio: 4 / 3;
            }

            .ctaBandBox {
              flex-direction: column;
              align-items: flex-start;
            }
          }
        `}</style>

        <style jsx global>{`
          .liveLink {
            margin-top: 20px;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            text-decoration: none;
            font-size: 14.5px;
            font-weight: 900;
            color: #1d4ed8;
          }

          .liveLink:hover {
            color: #0f172a;
          }

          .refBody .liveLink {
            margin-top: 10px;
            font-size: 13px;
          }

          .cta {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            justify-content: center;
            min-height: 48px;
            padding: 0 20px;
            border-radius: 999px;
            text-decoration: none;
            font-weight: 900;
            font-size: 15px;
            transition: transform 0.16s ease, box-shadow 0.16s ease;
          }

          .cta-primary {
            background: #1d4ed8;
            color: #ffffff;
            box-shadow: 0 14px 30px rgba(29, 78, 216, 0.24);
          }

          .cta-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 18px 36px rgba(29, 78, 216, 0.3);
          }

          .cta-secondary {
            background: #ffffff;
            color: #0f172a;
            border: 1px solid rgba(15, 23, 42, 0.12);
          }

          .cta-secondary:hover {
            transform: translateY(-2px);
            border-color: rgba(29, 78, 216, 0.28);
          }

          .cta-light {
            background: #ffffff;
            color: #0f172a;
          }

          .cta-light:hover {
            transform: translateY(-2px);
          }
        `}</style>
      </main>
    </>
  );
}
