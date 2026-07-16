import Head from "next/head";
import Link from "next/link";
import Footer from "./Footer";
import { Card } from "./ui/card";
import SectionEyebrow from "./home/SectionEyebrow";

export default function LegalPageLayout({
  title,
  description,
  eyebrow = "Právní informace",
  updatedAt = "Aktualizováno: březen 2026",
  children,
}) {
  return (
    <>
      <Head>
        <title>{title} | ARCHIMEDES Live</title>
        <meta name="description" content={description} />
      </Head>

      <main className="min-h-screen bg-slate-50">
        <section className="pb-4 pt-9">
          <div className="mx-auto max-w-[980px] px-5">
            <Card className="rounded-card-lg bg-gradient-to-br from-white to-blue-50/60 p-7 sm:p-8">
              <SectionEyebrow>{eyebrow}</SectionEyebrow>
              <h1 className="text-[34px] font-[950] leading-[1.02] tracking-[-0.04em] text-navy-900 sm:text-[46px]">
                {title}
              </h1>
              <p className="mt-4 max-w-[760px] text-base leading-relaxed text-muted sm:text-lg">
                {description}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm font-bold text-slate-500">
                <span>{updatedAt}</span>
                <Link href="/" className="font-black text-brand hover:underline">
                  Zpět na hlavní stránku
                </Link>
              </div>
            </Card>
          </div>
        </section>

        <section className="pb-16 pt-2.5">
          <div className="mx-auto max-w-[980px] px-5">
            <Card className="legal-content rounded-card-lg p-6 sm:p-8">{children}</Card>
          </div>
        </section>

        <Footer />

        <style jsx global>{`
          .legal-content h2 {
            margin: 0 0 16px;
            font-size: 28px;
            line-height: 1.1;
            letter-spacing: -0.03em;
            font-weight: 950;
            color: #0f172a;
          }

          .legal-content h3 {
            margin: 28px 0 10px;
            font-size: 20px;
            line-height: 1.2;
            font-weight: 900;
            color: #0f172a;
          }

          .legal-content p {
            margin: 0 0 14px;
            font-size: 16px;
            line-height: 1.75;
            color: #334155;
          }

          .legal-content ul {
            margin: 0 0 16px;
            padding-left: 20px;
          }

          .legal-content li {
            margin-bottom: 8px;
            font-size: 16px;
            line-height: 1.7;
            color: #334155;
          }

          .legal-content .noteBox {
            margin: 18px 0 22px;
            padding: 16px 18px;
            border-radius: 16px;
            background: #eef3fb;
            border: 1px solid rgba(30, 64, 175, 0.08);
            color: #223252;
          }

          .legal-content .muted {
            color: #667085;
            font-size: 14px;
          }

          @media (max-width: 640px) {
            .legal-content h2 {
              font-size: 24px;
            }

            .legal-content h3 {
              font-size: 18px;
            }
          }
        `}</style>
      </main>
    </>
  );
}
