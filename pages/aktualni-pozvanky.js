// pages/aktualni-pozvanky.js
import Head from "next/head";
import Footer from "../components/Footer";

const FALLBACK_POSTS = [
  "https://www.instagram.com/p/DYXe4YaxhVA/",
  "https://www.instagram.com/p/DYUSiaYFrjQ/",
  "https://www.instagram.com/p/DXuOQIJCDlG/",
];

function getEmbedUrl(url) {
  if (!url) return "";
  return `${url}embed`;
}

export default function AktualniPozvankyPage() {
  return (
    <>
      <Head>
        <title>Aktuální pozvánky | ARCHIMEDES Live</title>
      </Head>

      <main className="mx-auto max-w-[1200px] px-5 py-10">
        <h1 className="text-[32px] font-[950] tracking-[-0.03em] text-navy-900">
          Aktuální pozvánky
        </h1>

        <p className="mb-7 mt-2 text-muted">
          Podívejte se, co se právě chystá v ARCHIMEDES Live.
        </p>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-5">
          {FALLBACK_POSTS.map((url, index) => (
            <div key={index} className="w-full">
              <iframe
                src={getEmbedUrl(url)}
                width="100%"
                height="480"
                frameBorder="0"
                scrolling="no"
                allowTransparency="true"
                className="rounded-2xl"
              />
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </>
  );
}
