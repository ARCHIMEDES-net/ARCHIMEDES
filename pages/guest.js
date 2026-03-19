import Head from "next/head";
import Link from "next/link";
import Footer from "../components/Footer";

const heroImg = "/ucebna.jpg"; // dej nejživější fotku s lidmi
const liveImg = "/vyuka.jpeg"; // detail vysílání / interakce

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

      <main className="bg-white text-slate-900">

        {/* HERO */}
        <section
          className="relative text-white"
          style={{
            backgroundImage: `url(${heroImg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-black/60" />

          <div className="relative mx-auto max-w-6xl px-6 py-28">
            <div className="max-w-3xl">

              <div className="inline-block mb-6 px-4 py-1 rounded-full bg-white/20 text-sm font-semibold">
                ARCHIMEDES Live
              </div>

              <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
                You do not just speak.
                <br />
                You shape how young people see the world.
              </h1>

              <p className="mt-6 text-lg md:text-xl text-white/90 leading-relaxed">
                ARCHIMEDES Live connects exceptional personalities with real
                students through live, moderated sessions across schools and
                communities.
              </p>

              <a
                href="#contact"
                className="inline-block mt-8 px-6 py-4 bg-white text-black rounded-xl font-bold hover:-translate-y-1 transition"
              >
                Become a guest speaker
              </a>
            </div>
          </div>
        </section>

        {/* WHAT IT IS */}
        <section className="py-20">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-6">
              What is ARCHIMEDES Live
            </h2>

            <p className="text-lg text-slate-600 leading-relaxed">
              ARCHIMEDES Live is a live educational program connecting schools,
              communities and inspiring personalities across Europe.
            </p>

            <p className="mt-4 text-lg text-slate-600 leading-relaxed">
              We create real moments where students meet people with experience
              that goes beyond textbooks.
            </p>
          </div>
        </section>

        {/* WOW QUOTE */}
        <section className="py-20 bg-slate-50">
          <div className="mx-auto max-w-4xl px-6 text-center">
            <h2 className="text-3xl md:text-5xl font-extrabold leading-tight">
              Students do not remember information.
              <br />
              They remember people.
            </h2>
          </div>
        </section>

        {/* WHY JOIN */}
        <section className="py-20">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-12">
              Why join us
            </h2>

            <div className="grid md:grid-cols-3 gap-6">

              <div className="bg-white p-8 rounded-2xl shadow">
                <h3 className="font-bold text-xl mb-3">Real impact</h3>
                <p className="text-slate-600">
                  You are not speaking into a camera. You are speaking to real
                  students who are listening.
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow">
                <h3 className="font-bold text-xl mb-3">Meaningful format</h3>
                <p className="text-slate-600">
                  A moderated discussion that makes your message clear, human
                  and memorable.
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow">
                <h3 className="font-bold text-xl mb-3">Lasting influence</h3>
                <p className="text-slate-600">
                  One session can stay with students for years.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="py-20 bg-slate-50">
          <div className="mx-auto max-w-3xl px-6">
            <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-10">
              How it works
            </h2>

            <div className="space-y-6">

              {[ 
                "A focused 30–45 minute live session",
                "Moderated discussion with students",
                "Interactive questions via chat",
                "Simple online connection (Google Meet)"
              ].map((text, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold">
                    {i + 1}
                  </div>
                  <p className="text-lg text-slate-700">{text}</p>
                </div>
              ))}

            </div>
          </div>
        </section>

        {/* LIVE IMAGE */}
        <section className="py-20">
          <div className="mx-auto max-w-5xl px-6">
            <img
              src={liveImg}
              alt="Live session"
              className="rounded-2xl shadow"
            />

            <p className="mt-6 text-center text-lg text-slate-600">
              A real live session connecting students with a guest speaker.
            </p>
          </div>
        </section>

        {/* CTA / CONTACT */}
        <section id="contact" className="py-24 bg-slate-900 text-white">
          <div className="mx-auto max-w-3xl px-6 text-center">

            <h2 className="text-3xl md:text-4xl font-extrabold mb-6">
              If you believe experience matters,
              <br />
              this is where it can truly make a difference.
            </h2>

            <p className="text-white/80 text-lg mb-10">
              We would be honored to welcome you to ARCHIMEDES Live.
            </p>

            <div className="bg-white/10 rounded-2xl p-8">
              <div className="text-xl font-bold">Natálie Lípová</div>
              <div className="text-white/70 mb-4">
                Program & Content Manager
              </div>

              <div className="space-y-2">
                <a
                  href="mailto:natalie.lipova@archimedeslive.com"
                  className="block hover:underline"
                >
                  natalie.lipova@archimedeslive.com
                </a>

                <div>+420 737 628 944</div>
              </div>
            </div>

          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}
