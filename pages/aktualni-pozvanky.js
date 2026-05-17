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

      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 20px" }}>
        <h1 style={{ fontSize: 32, marginBottom: 10 }}>
          Aktuální pozvánky
        </h1>

        <p style={{ marginBottom: 30, color: "#555" }}>
          Podívejte se, co se právě chystá v ARCHIMEDES Live.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 20,
          }}
        >
          {FALLBACK_POSTS.map((url, index) => (
            <div key={index} style={{ width: "100%" }}>
              <iframe
                src={getEmbedUrl(url)}
                width="100%"
                height="480"
                frameBorder="0"
                scrolling="no"
                allowTransparency="true"
                style={{ borderRadius: 12 }}
              />
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </>
  );
}
