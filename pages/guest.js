import Head from "next/head";
import Image from "next/image";
import Footer from "../components/Footer";

const heroImg = "/hero-vyuka.webp";
const liveImgMain = "/jak-funguje-online.webp";
const liveImgSecondary = "/jak-funguje-trida.webp";
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

      <main className="bg-white text-navy-900">
        <section className="relative">
          <div className="absolute inset-0 overflow-hidden">
            <Image
              src={heroImg}
              alt="ARCHIMEDES Live with students"
              fill
              priority
              sizes="100vw"
              style={{ objectFit: "cover" }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[rgba(9,16,32,0.82)] via-[rgba(9,16,32,0.66)] to-[rgba(9,16,32,0.46)]" />
          </div>

          <div className="relative z-[2] text-white">
            <div className="mx-auto max-w-[1180px] px-5">
              <div className="flex min-h-[560px] max-w-[760px] flex-col justify-center py-11 sm:min-h-[680px] sm:py-16">
                <span className="mb-5 inline-flex w-fit items-center rounded-full bg-white/18 px-3.5 py-2 text-[13px] font-bold">
                  ARCHIMEDES Live
                </span>

                <h1 className="text-[42px] font-black leading-[1.02] tracking-[-0.05em] sm:text-[60px] lg:text-[72px]">
                  You do not just speak.
                  <br />
                  You shape how young people
                  <br />
                  see the world.
                </h1>

                <p className="mt-6 max-w-[760px] text-lg leading-[1.35] text-white/92 sm:text-2xl lg:text-[28px]">
                  ARCHIMEDES Live connects exceptional personalities with real
                  students through live, moderated sessions across schools and
                  communities.
                </p>

                <div className="mt-8 flex flex-col gap-3.5 sm:flex-row sm:flex-wrap">
                  <a
                    href="#contact"
                    className="inline-flex h-[52px] items-center justify-center rounded-2xl bg-white px-5 font-black text-navy-900 shadow-[0_10px_24px_rgba(15,23,42,0.16)] transition-transform hover:-translate-y-0.5"
                  >
                    Become a guest speaker
                  </a>
                  <a
                    href="#live-format"
                    className="inline-flex h-[52px] items-center justify-center rounded-2xl border border-white/68 bg-white/94 px-5 font-black text-navy-900 shadow-[0_10px_24px_rgba(15,23,42,0.12)] transition-transform hover:-translate-y-0.5"
                  >
                    See how it works
                  </a>
                </div>

                <div className="mt-5 flex flex-wrap gap-2.5">
                  {["live sessions", "real students", "carefully selected guests"].map((item) => (
                    <span
                      key={item}
                      className="inline-flex h-[34px] items-center rounded-full border border-white/20 bg-white/14 px-3 text-[13px] font-bold text-white/92"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="pb-14 pt-16 sm:pt-[88px]">
          <div className="mx-auto max-w-[860px] px-5 text-center">
            <h2 className="text-[36px] font-black leading-[1.02] tracking-[-0.045em] text-navy-900 sm:text-[54px]">
              What is ARCHIMEDES Live
            </h2>
            <p className="mt-4 text-lg leading-[1.55] text-slate-600 sm:text-2xl">
              ARCHIMEDES Live is a live educational program connecting schools,
              communities and inspiring personalities through carefully curated
              online sessions.
            </p>
            <p className="mt-4 text-lg leading-[1.55] text-slate-600 sm:text-2xl">
              We create real moments where students meet people with experience
              that goes beyond textbooks — leaders, creators, experts, public
              figures and voices worth hearing.
            </p>
          </div>
        </section>

        <section className="bg-gradient-to-b from-white to-slate-50 pb-16 sm:pb-[84px]">
          <div className="mx-auto max-w-[860px] px-5">
            <div className="rounded-card-lg border border-slate-900/[0.06] bg-slate-100/80 px-5 py-10 shadow-[0_18px_40px_rgba(15,23,42,0.04)] sm:px-9 sm:py-[62px]">
              <p className="text-center text-[32px] font-black leading-[1.06] tracking-[-0.05em] text-[#101b37] sm:text-[56px] lg:text-[68px]">
                Students do not remember information.
                <br />
                They remember people.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-slate-50 pb-16 sm:pb-[88px]">
          <div className="mx-auto max-w-[1180px] px-5">
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-card-lg bg-navy-900 p-7 text-white shadow-[0_18px_40px_rgba(15,23,42,0.14)] sm:p-8">
                <div className="mb-3 text-[13px] font-black uppercase tracking-[0.04em] text-white/62">
                  Why this matters
                </div>
                <h3 className="text-[28px] font-black leading-[1.04] tracking-[-0.03em] sm:text-[34px]">
                  Real people. Real attention. Real influence.
                </h3>
                <p className="mt-4 text-lg leading-relaxed text-white/88">
                  This is not a generic webinar. It is a moderated, human format
                  built to create attention, understanding and a lasting
                  impression.
                </p>
              </div>

              <div className="rounded-card-lg border border-slate-900/[0.08] bg-white p-7 shadow-[0_12px_34px_rgba(15,23,42,0.05)]">
                <div className="grid h-full grid-cols-1 gap-3.5 sm:grid-cols-2">
                  {[
                    { strong: "Live", span: "moderated sessions" },
                    { strong: "Schools", span: "and communities" },
                    { strong: "Students", span: "engaged in real time" },
                    { strong: "Guests", span: "carefully selected" },
                  ].map((item) => (
                    <div
                      key={item.strong}
                      className="flex flex-col justify-center gap-1.5 rounded-2xl border border-slate-900/[0.06] bg-slate-50 p-4"
                    >
                      <strong className="text-[22px] font-black leading-[1.1] text-[#101b37]">
                        {item.strong}
                      </strong>
                      <span className="text-[15px] font-bold leading-snug text-slate-500">
                        {item.span}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-[88px]">
          <div className="mx-auto max-w-[1180px] px-5">
            <h2 className="text-center text-[36px] font-black leading-[1.02] tracking-[-0.045em] text-navy-900 sm:text-[54px]">
              Why join us
            </h2>

            <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-3">
              {[
                {
                  title: "Real impact",
                  text: "You are not speaking into a camera. You are speaking to real students who are listening, reacting and asking questions.",
                },
                {
                  title: "Meaningful format",
                  text: "A moderated discussion that makes your message clear, human and memorable — without unnecessary complexity.",
                },
                {
                  title: "Lasting influence",
                  text: "One session can stay with students for years. A single voice can shift how someone sees their future.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-card-lg border border-slate-900/[0.08] bg-white p-6 shadow-[0_12px_34px_rgba(15,23,42,0.05)]"
                >
                  <h3 className="text-[28px] font-black leading-[1.05] tracking-[-0.03em] text-[#101b37] sm:text-[30px]">
                    {item.title}
                  </h3>
                  <p className="mt-4 text-lg leading-relaxed text-slate-600">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="pb-16 sm:pb-[88px]">
          <div className="mx-auto max-w-[860px] px-5">
            <div className="rounded-card-lg border border-blue-600/10 bg-gradient-to-br from-blue-50 to-blue-50/40 p-7 text-center sm:p-8">
              <div className="mb-2.5 text-[13px] font-black uppercase tracking-[0.04em] text-[#315594]">
                Why we invite people like you
              </div>
              <p className="text-lg leading-relaxed text-[#31435f] sm:text-[22px]">
                We invite personalities who have something real to share —
                people who have built, led, created or changed something, and
                whose experience can genuinely inspire the next generation.
              </p>
            </div>
          </div>
        </section>

        <section id="live-format" className="bg-slate-50 py-16 sm:py-[88px]">
          <div className="mx-auto max-w-[1180px] px-5">
            <div className="grid grid-cols-1 items-start gap-7 lg:grid-cols-2">
              <div>
                <span className="mb-5 inline-flex items-center rounded-full bg-eyebrow px-3.5 py-2 text-[13px] font-black text-navy-600">
                  Live format
                </span>
                <h2 className="text-center text-[36px] font-black leading-[1.02] tracking-[-0.045em] text-navy-900 sm:text-[54px] lg:text-left">
                  How it works
                </h2>

                <div className="mt-7 grid gap-4">
                  {[
                    {
                      n: 1,
                      title: "A focused live session",
                      text: "Usually 30–45 minutes, designed to keep attention.",
                    },
                    {
                      n: 2,
                      title: "Moderated discussion",
                      text: "Your message is introduced and guided in a clear, human and respectful way.",
                    },
                    {
                      n: 3,
                      title: "Student interaction",
                      text: "Questions and reactions can come through moderated chat or discussion.",
                    },
                    {
                      n: 4,
                      title: "Simple online connection",
                      text: "Participation is easy and technically straightforward.",
                    },
                  ].map((step) => (
                    <div key={step.n} className="grid grid-cols-[40px_1fr] items-start gap-3.5">
                      <span className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-full bg-[#101b37] text-[15px] font-black text-white">
                        {step.n}
                      </span>
                      <div>
                        <strong className="block text-xl leading-snug text-[#101b37]">{step.title}</strong>
                        <p className="mt-1.5 text-[17px] leading-relaxed text-slate-600">{step.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative min-h-[260px] w-full overflow-hidden rounded-card-lg shadow-[0_18px_42px_rgba(15,23,42,0.12)] sm:min-h-[420px] lg:min-h-[540px]">
                <Image
                  src={liveImgMain}
                  alt="ARCHIMEDES Live online session on screen"
                  fill
                  sizes="(max-width: 1024px) 100vw, 700px"
                  style={{ objectFit: "cover" }}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-[88px]">
          <div className="mx-auto max-w-[1180px] px-5">
            <div className="mx-auto mb-8 max-w-[840px] text-center">
              <h2 className="text-[36px] font-black leading-[1.02] tracking-[-0.045em] text-navy-900 sm:text-[54px]">
                What a live session feels like
              </h2>
              <p className="mt-4 text-lg leading-[1.6] text-slate-600 sm:text-2xl">
                Real attention. Real students. A format built for presence,
                clarity and connection.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.25fr_0.75fr]">
              <div className="relative min-h-[260px] w-full overflow-hidden rounded-card-lg shadow-[0_14px_34px_rgba(15,23,42,0.08)] sm:min-h-[420px] lg:min-h-[560px]">
                <Image
                  src={liveImgSecondary}
                  alt="Students reacting during an ARCHIMEDES Live session"
                  fill
                  sizes="(max-width: 1024px) 100vw, 720px"
                  style={{ objectFit: "cover" }}
                />
              </div>

              <div className="grid gap-5">
                <img
                  src={guestImg}
                  alt="Guests and ARCHIMEDES Live atmosphere"
                  className="min-h-[260px] w-full rounded-card-lg object-cover shadow-[0_14px_34px_rgba(15,23,42,0.08)]"
                />

                <div className="flex min-h-[260px] flex-col justify-center rounded-card-lg bg-gradient-to-br from-navy-900 to-[#16213d] p-6 text-white shadow-[0_14px_34px_rgba(15,23,42,0.12)]">
                  <div className="mb-2.5 text-[13px] font-black uppercase tracking-[0.04em] text-white/66">
                    What guests experience
                  </div>
                  <h3 className="text-[28px] font-black leading-[1.08] tracking-[-0.03em]">
                    A carefully curated format
                  </h3>
                  <p className="mt-3.5 text-[17px] leading-relaxed text-white/84">
                    A calm, moderated environment where your message is given
                    space, attention and real human response.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="pb-16 sm:pb-[88px]">
          <div className="mx-auto max-w-[860px] px-5">
            <div className="rounded-card-lg bg-navy-900 p-8 text-center text-white shadow-[0_18px_42px_rgba(15,23,42,0.14)] sm:p-9">
              <div className="mb-3.5 text-[13px] font-black uppercase tracking-[0.04em] text-white/64">
                A meaningful invitation
              </div>
              <h2 className="text-[28px] font-black leading-[1.1] tracking-[-0.03em] text-white sm:text-[36px]">
                Your experience can change how
                <br />
                someone sees their future.
              </h2>
              <p className="mx-auto mt-4 max-w-[720px] text-lg leading-relaxed text-white/84">
                We carefully select our guest speakers. If your experience,
                perspective or story can make a real difference, we would be
                honored to welcome you to ARCHIMEDES Live.
              </p>
            </div>
          </div>
        </section>

        <section id="contact" className="pb-16 sm:pb-24">
          <div className="mx-auto max-w-[860px] px-5">
            <div className="rounded-card-lg border border-slate-900/[0.08] bg-gradient-to-br from-white to-blue-50/60 p-8 text-center shadow-[0_12px_34px_rgba(15,23,42,0.05)] sm:p-9">
              <span className="inline-flex items-center rounded-full bg-eyebrow px-3.5 py-2 text-[13px] font-black text-navy-600">
                Contact
              </span>
              <h2 className="mt-3 text-[36px] font-black leading-[1.02] tracking-[-0.045em] text-navy-900 sm:text-[54px]">
                Let&rsquo;s talk
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-slate-600 sm:text-xl">
                If you are interested in joining ARCHIMEDES Live as a guest
                speaker, please contact:
              </p>

              <div className="mt-6">
                <div className="text-[28px] font-black leading-[1.08] tracking-[-0.03em] text-[#101b37] sm:text-[32px]">
                  Tým ARCHIMEDES Live
                </div>
                <div className="mt-2 text-lg font-black text-[#315594]">Program & Content Manager</div>
                <div className="mt-1.5 text-base leading-relaxed text-slate-500">
                  Program, broadcasting, platform content
                </div>
              </div>

              <div className="mt-5 grid gap-2.5">
                <a
                  href="mailto:info@eduvision.cz"
                  className="text-lg font-black text-navy-900 hover:underline sm:text-xl"
                >
                  info@eduvision.cz
                </a>
                <a href="tel:+420732827210" className="text-lg font-black text-navy-900 hover:underline sm:text-xl">
                  +420 732 827 210
                </a>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}
