import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import Footer from "../components/Footer";

const legalLinks = {
  vop: "/vop",
  dpa: "/dpa",
  recordings: "/pravidla-zaznamu",
  privacy: "/ochrana-osobnich-udaju",
};

const initialForm = {
  schoolName: "",
  ico: "",
  street: "",
  city: "",
  zip: "",
  contactName: "",
  role: "",
  email: "",
  phone: "",
  note: "",
  agreeVop: false,
  agreeDpa: false,
  agreeRecordings: false,
  agreeAuthority: false,
  agreeContract: false,
};

export default function StartPage() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/start-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data?.error || "Objednávku se nepodařilo odeslat. Zkuste to prosím znovu."
        );
      }

      setSuccess(true);
      setForm(initialForm);
    } catch (err) {
      setError(
        err?.message || "Objednávku se nepodařilo odeslat. Zkuste to prosím znovu."
      );
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <>
        <Head>
          <title>Objednávka přijata | ARCHIMEDES Live</title>
          <meta
            name="description"
            content="Potvrzení přijetí objednávky balíčku START ARCHIMEDES Live."
          />
        </Head>

        <main className="page">
          <section className="successSection">
            <div className="container narrow">
              <div className="successCard">
                <div className="eyebrow dark">Objednávka přijata</div>
                <h1>Děkujeme, objednávka byla přijata</h1>
                <p className="lead">
                  Na uvedený e-mail vám zašleme potvrzení objednávky, fakturační
                  podklady a další informace k zahájení programu ARCHIMEDES Live.
                </p>

                <div className="successBox">
                  Balíček START je jednorázový program na období duben–červen 2026
                  bez automatického prodloužení.
                </div>

                <div className="nextSteps">
                  <div className="nextStepsTitle">Co bude následovat:</div>
                  <ul>
                    <li>zašleme vám potvrzení objednávky,</li>
                    <li>obdržíte fakturační podklady,</li>
                    <li>následně získáte přístup k programu.</li>
                  </ul>
                </div>

                <p className="smallText">
                  Pokud e-mail během několika minut neobdržíte, zkontrolujte prosím
                  složku Hromadné nebo Spam.
                </p>

                <div className="successActions">
                  <Link href="/" className="primaryLink">
                    Zpět na hlavní stránku
                  </Link>
                  <Link href="/demo" className="secondaryLink">
                    Zobrazit DEMO
                  </Link>
                </div>
              </div>
            </div>
          </section>

          <Footer />

          <style jsx>{`
            .page {
              background: #f7f8fb;
              color: #0f172a;
              min-height: 100vh;
            }

            .container {
              max-width: 1180px;
              margin: 0 auto;
              padding: 0 20px;
            }

            .container.narrow {
              max-width: 920px;
            }

            .successSection {
              padding: 56px 0 84px;
            }

            .successCard {
              background: #ffffff;
              border: 1px solid rgba(15, 23, 42, 0.08);
              border-radius: 28px;
              padding: 34px 30px;
              box-shadow: 0 12px 34px rgba(15, 23, 42, 0.05);
            }

            .eyebrow {
              display: inline-flex;
              align-items: center;
              min-height: 36px;
              padding: 0 14px;
              border-radius: 999px;
              font-size: 13px;
              font-weight: 800;
              letter-spacing: 0.02em;
              margin-bottom: 18px;
            }

            .eyebrow.dark {
              background: #e9eef8;
              color: #223252;
            }

            h1 {
              margin: 0;
              font-size: 46px;
              line-height: 1.02;
              letter-spacing: -0.04em;
              font-weight: 900;
            }

            .lead {
              margin: 16px 0 0;
              font-size: 18px;
              line-height: 1.7;
              color: #4b5563;
              max-width: 760px;
            }

            .successBox {
              margin-top: 22px;
              padding: 18px 20px;
              border-radius: 18px;
              background: #eefaf0;
              border: 1px solid #cfe8d3;
              color: #166534;
              font-size: 16px;
              line-height: 1.7;
              font-weight: 700;
            }

            .nextSteps {
              margin-top: 22px;
              padding: 20px 22px;
              border-radius: 18px;
              background: #f8fafc;
              border: 1px solid rgba(15, 23, 42, 0.08);
            }

            .nextStepsTitle {
              font-size: 15px;
              line-height: 1.5;
              font-weight: 800;
              color: #0f172a;
              margin-bottom: 8px;
            }

            .nextSteps ul {
              margin: 0;
              padding-left: 18px;
              display: grid;
              gap: 8px;
            }

            .nextSteps li {
              color: #334155;
              font-size: 15px;
              line-height: 1.65;
            }

            .smallText {
              margin: 18px 0 0;
              font-size: 15px;
              line-height: 1.7;
              color: #667085;
            }

            .successActions {
              display: flex;
              flex-wrap: wrap;
              gap: 12px;
              margin-top: 28px;
            }

            .primaryLink,
            .secondaryLink {
              display: inline-flex;
              align-items: center;
              justify-content: center;
              min-height: 52px;
              padding: 0 20px;
              border-radius: 14px;
              text-decoration: none;
              font-weight: 800;
              font-size: 16px;
              line-height: 1.2;
              transition: transform 0.18s ease, box-shadow 0.18s ease;
            }

            .primaryLink {
              background: #0f172a;
              color: #ffffff;
              box-shadow: 0 10px 24px rgba(15, 23, 42, 0.16);
            }

            .secondaryLink {
              background: #ffffff;
              color: #0f172a;
              border: 1px solid rgba(15, 23, 42, 0.12);
              box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
            }

            .primaryLink:hover,
            .secondaryLink:hover {
              transform: translateY(-2px);
            }

            @media (max-width: 640px) {
              .container {
                padding: 0 16px;
              }

              .successSection {
                padding: 34px 0 64px;
              }

              .successCard {
                padding: 24px 20px;
                border-radius: 22px;
              }

              h1 {
                font-size: 34px;
              }

              .lead {
                font-size: 16px;
              }

              .successActions {
                flex-direction: column;
              }

              .primaryLink,
              .secondaryLink {
                width: 100%;
              }
            }
          `}</style>
        </main>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Objednávka balíčku START | ARCHIMEDES Live</title>
        <meta
          name="description"
          content="Objednávka balíčku START ARCHIMEDES Live pro školy a obce."
        />
      </Head>

      <main className="page">
        <section className="hero">
          <div className="container">
            <div className="heroCard">
              <div className="heroGrid">
                <div className="heroMain">
                  <div className="eyebrow dark">Balíček START duben–červen</div>
                  <h1>Objednávka balíčku START</h1>

                  <p className="lead">
                    Získejte přístup k programu ARCHIMEDES Live na období
                    duben–červen 2026. Balíček je připraven pro snadné zapojení do
                    výuky bez složité přípravy.
                  </p>

                  <div className="proofBox">
                    Program ARCHIMEDES Live je určen pro školy a organizace, které
                    chtějí rychle a přehledně zapojit živý program do výuky i
                    školního života.
                  </div>

                  <div className="noticeBox">
                    <strong>Odesláním objednávky objednáváte balíček START</strong>{" "}
                    na období duben–červen 2026. Po odeslání vám zašleme potvrzení
                    objednávky, fakturační podklady a další informace k zahájení
                    programu.
                  </div>

                  <div className="processBox">
                    <div className="processTitle">Jak to probíhá</div>
                    <ol>
                      <li>odesláním objednávky rezervujete místo v programu,</li>
                      <li>zašleme vám potvrzení a fakturační podklady,</li>
                      <li>následně získáte přístup do ARCHIMEDES Live,</li>
                      <li>můžete zapojit třídy do vysílání v období duben–červen.</li>
                    </ol>
                  </div>

                  <div className="supplierInline">
                    <div className="supplierInlineLabel">Dodavatel</div>
                    <div className="supplierInlineText">
                      <strong>EduVision s.r.o.</strong> · Purkyňova 649/127,
                      Medlánky, 612 00 Brno · IČ: 17803039 · DIČ: CZ17803039
                    </div>
                    <div className="supplierInlineMeta">
                      Poskytovatel programu a provozovatel služby ARCHIMEDES Live.{" "}
                      Zapsána pod značkou C 131579/KSBR Krajským soudem v Brně.
                    </div>
                  </div>

                  <div className="demoInline">
                    <span>Chcete si program nejprve prohlédnout?</span>
                    <Link href="/demo">Zobrazit DEMO</Link>
                  </div>
                </div>

                <div className="summaryColumn">
                  <div className="summaryCard">
                    <div className="summaryLabel">Objednávaný balíček</div>
                    <div className="summaryTitle">START duben–červen</div>

                    <div className="summaryRow">
                      <span>Období</span>
                      <strong>duben–červen 2026</strong>
                    </div>

                    <div className="summaryRow">
                      <span>Cena</span>
                      <strong>4.990,- Kč bez DPH</strong>
                    </div>

                    <div className="summaryRow">
                      <span>Forma</span>
                      <strong>online program</strong>
                    </div>

                    <div className="summaryRow">
                      <span>Doklady</span>
                      <strong>potvrzení objednávky, faktura</strong>
                    </div>

                    <div className="summaryRow">
                      <span>Závazek</span>
                      <strong>jednorázový balíček bez automatického prodloužení</strong>
                    </div>

                    <div className="summaryDivider" />

                    <div className="summaryContentLabel">Součást balíčku</div>
                    <ul className="summaryList">
                      <li>3× živý vstup pro I. stupeň ZŠ</li>
                      <li>3× živý vstup pro II. stupeň ZŠ</li>
                      <li>3× wellbeing program Generace Z</li>
                      <li>3× Kariérní poradenství jinak</li>
                      <li>1× speciální vysílání v angličtině</li>
                    </ul>

                    <p className="summaryNote">
                      Konkrétní termíny vysílání budou zveřejňovány průběžně v
                      programu ARCHIMEDES Live.
                    </p>

                    <div className="capacityHint">
                      Program začíná v dubnu. Doporučujeme rezervovat včas.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="formSection">
          <div className="container">
            <form className="formCard" onSubmit={handleSubmit}>
              <div className="sectionBlock">
                <h2>Údaje o škole / organizaci</h2>

                <div className="grid twoCols">
                  <div className="field">
                    <label htmlFor="schoolName">Název školy / organizace *</label>
                    <input
                      id="schoolName"
                      name="schoolName"
                      type="text"
                      value={form.schoolName}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="ico">IČO *</label>
                    <input
                      id="ico"
                      name="ico"
                      type="text"
                      value={form.ico}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="grid twoCols">
                  <div className="field">
                    <label htmlFor="street">Ulice a číslo *</label>
                    <input
                      id="street"
                      name="street"
                      type="text"
                      value={form.street}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="city">Město *</label>
                    <input
                      id="city"
                      name="city"
                      type="text"
                      value={form.city}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="grid oneColNarrow">
                  <div className="field">
                    <label htmlFor="zip">PSČ *</label>
                    <input
                      id="zip"
                      name="zip"
                      type="text"
                      value={form.zip}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="sectionBlock">
                <h2>Kontaktní osoba / objednatel</h2>

                <div className="grid twoCols">
                  <div className="field">
                    <label htmlFor="contactName">Jméno a příjmení *</label>
                    <input
                      id="contactName"
                      name="contactName"
                      type="text"
                      value={form.contactName}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="role">Funkce *</label>
                    <input
                      id="role"
                      name="role"
                      type="text"
                      value={form.role}
                      onChange={handleChange}
                      placeholder="např. ředitel školy"
                      required
                    />
                  </div>
                </div>

                <div className="grid twoCols">
                  <div className="field">
                    <label htmlFor="email">E-mail *</label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="phone">Telefon</label>
                    <input
                      id="phone"
                      name="phone"
                      type="text"
                      value={form.phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="field">
                  <label htmlFor="note">Poznámka</label>
                  <textarea
                    id="note"
                    name="note"
                    value={form.note}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Např. preferovaný způsob kontaktu nebo doplňující informace."
                  />
                </div>
              </div>

              <div className="sectionBlock">
                <div className="submitInfoBox">
                  <div className="submitInfoTitle">Před odesláním</div>
                  <ul>
                    <li>přístup do programu obdržíte e-mailem,</li>
                    <li>fakturace probíhá po potvrzení objednávky,</li>
                    <li>balíček START je určen na období duben–červen 2026.</li>
                  </ul>
                </div>
              </div>

              <div className="sectionBlock">
                <h2>Souhlasy a potvrzení</h2>

                <div className="checkboxList">
                  <label className="checkboxItem">
                    <input
                      type="checkbox"
                      name="agreeVop"
                      checked={form.agreeVop}
                      onChange={handleChange}
                      required
                    />
                    <span>
                      Potvrzuji, že jsem se seznámil/a se{" "}
                      <a href={legalLinks.vop} target="_blank" rel="noreferrer">
                        Všeobecnými obchodními podmínkami ARCHIMEDES Live
                      </a>
                      .
                    </span>
                  </label>

                  <label className="checkboxItem">
                    <input
                      type="checkbox"
                      name="agreeDpa"
                      checked={form.agreeDpa}
                      onChange={handleChange}
                      required
                    />
                    <span>
                      Potvrzuji, že jsem se seznámil/a se{" "}
                      <a href={legalLinks.dpa} target="_blank" rel="noreferrer">
                        Smlouvou o zpracování osobních údajů (DPA)
                      </a>
                      .
                    </span>
                  </label>

                  <label className="checkboxItem">
                    <input
                      type="checkbox"
                      name="agreeRecordings"
                      checked={form.agreeRecordings}
                      onChange={handleChange}
                      required
                    />
                    <span>
                      Beru na vědomí{" "}
                      <a
                        href={legalLinks.recordings}
                        target="_blank"
                        rel="noreferrer"
                      >
                        pravidla pořizování a zpřístupnění záznamů
                      </a>{" "}
                      v rámci služby ARCHIMEDES Live, včetně zpřístupnění záznamů
                      registrovaným uživatelům v archivu.
                    </span>
                  </label>

                  <label className="checkboxItem">
                    <input
                      type="checkbox"
                      name="agreeAuthority"
                      checked={form.agreeAuthority}
                      onChange={handleChange}
                      required
                    />
                    <span>
                      Potvrzuji, že jsem oprávněn/a tuto objednávku učinit jménem
                      školy nebo organizace, případně na základě jejího pověření.
                    </span>
                  </label>

                  <label className="checkboxItem checkboxItemStrong">
                    <input
                      type="checkbox"
                      name="agreeContract"
                      checked={form.agreeContract}
                      onChange={handleChange}
                      required
                    />
                    <span>
                      Odesláním objednávky objednávám za školu / organizaci balíček
                      START služby ARCHIMEDES Live na období duben–červen 2026 a
                      potvrzuji povinnost úhrady ceny podle objednávky.
                    </span>
                  </label>
                </div>

                <div className="helperLinks">
                  <a href={legalLinks.vop} target="_blank" rel="noreferrer">
                    VOP
                  </a>
                  <a href={legalLinks.dpa} target="_blank" rel="noreferrer">
                    DPA
                  </a>
                  <a
                    href={legalLinks.recordings}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Pravidla záznamů a archivu
                  </a>
                  <a
                    href={legalLinks.privacy}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Ochrana osobních údajů
                  </a>
                </div>
              </div>

              {error ? <div className="errorBox">{error}</div> : null}

              <div className="submitRow">
                <button type="submit" className="submitButton" disabled={loading}>
                  {loading ? "Odesíláme..." : "Objednat balíček START"}
                </button>

                <p className="submitNote">
                  Po odeslání objednávky vám přijde potvrzení e-mailem.
                </p>
              </div>
            </form>
          </div>
        </section>

        <Footer />

        <style jsx>{`
          .page {
            background: #f7f8fb;
            color: #0f172a;
            min-height: 100vh;
          }

          .container {
            max-width: 1180px;
            margin: 0 auto;
            padding: 0 20px;
          }

          .hero {
            padding: 44px 0 22px;
          }

          .heroCard {
            background: linear-gradient(135deg, #ffffff 0%, #f8fbff 100%);
            border: 1px solid rgba(15, 23, 42, 0.08);
            border-radius: 30px;
            padding: 34px 30px;
            box-shadow: 0 12px 34px rgba(15, 23, 42, 0.05);
          }

          .heroGrid {
            display: grid;
            grid-template-columns: minmax(0, 1.2fr) minmax(340px, 0.8fr);
            gap: 28px;
            align-items: start;
          }

          .heroMain {
            min-width: 0;
          }

          .summaryColumn {
            display: grid;
          }

          .eyebrow {
            display: inline-flex;
            align-items: center;
            min-height: 36px;
            padding: 0 14px;
            border-radius: 999px;
            font-size: 13px;
            font-weight: 800;
            letter-spacing: 0.02em;
            margin-bottom: 18px;
          }

          .eyebrow.dark {
            background: #e9eef8;
            color: #223252;
          }

          h1 {
            margin: 0;
            font-size: 50px;
            line-height: 1.02;
            letter-spacing: -0.045em;
            font-weight: 900;
            color: #0f172a;
          }

          .lead {
            margin: 16px 0 0;
            font-size: 18px;
            line-height: 1.72;
            color: #4b5563;
            max-width: 760px;
          }

          .proofBox {
            margin-top: 18px;
            padding: 16px 18px;
            border-radius: 18px;
            background: #eef6ff;
            border: 1px solid rgba(37, 99, 235, 0.12);
            color: #1f3b75;
            font-size: 15px;
            line-height: 1.7;
            font-weight: 700;
          }

          .noticeBox {
            margin-top: 18px;
            padding: 18px 20px;
            border-radius: 18px;
            background: #fff8e8;
            border: 1px solid #f0dfaf;
            color: #6b4f00;
            font-size: 15px;
            line-height: 1.7;
          }

          .noticeBox strong {
            font-weight: 900;
          }

          .processBox {
            margin-top: 18px;
            padding: 18px 20px;
            border-radius: 18px;
            background: #f8fafc;
            border: 1px solid rgba(15, 23, 42, 0.08);
          }

          .processTitle {
            font-size: 15px;
            line-height: 1.5;
            font-weight: 800;
            color: #0f172a;
            margin-bottom: 8px;
          }

          .processBox ol {
            margin: 0;
            padding-left: 18px;
            display: grid;
            gap: 8px;
          }

          .processBox li {
            color: #334155;
            font-size: 15px;
            line-height: 1.65;
          }

          .supplierInline {
            margin-top: 18px;
            padding: 16px 18px;
            border-radius: 18px;
            background: #eef3fb;
            border: 1px solid rgba(30, 64, 175, 0.1);
          }

          .supplierInlineLabel {
            font-size: 12px;
            line-height: 1.4;
            font-weight: 800;
            letter-spacing: 0.04em;
            text-transform: uppercase;
            color: #1e3a8a;
            margin-bottom: 8px;
          }

          .supplierInlineText {
            font-size: 14px;
            line-height: 1.65;
            color: #223252;
          }

          .supplierInlineText strong {
            color: #0f172a;
          }

          .supplierInlineMeta {
            margin-top: 6px;
            font-size: 13px;
            line-height: 1.55;
            color: #667085;
          }

          .demoInline {
            display: flex;
            flex-wrap: wrap;
            gap: 10px 12px;
            align-items: center;
            margin-top: 16px;
            font-size: 14px;
            line-height: 1.6;
            color: #475467;
          }

          .demoInline a {
            color: #1d4ed8;
            font-weight: 800;
            text-decoration: none;
          }

          .demoInline a:hover {
            text-decoration: underline;
          }

          .summaryCard {
            border-radius: 24px;
            padding: 24px 22px;
            background: #0f172a;
            color: #ffffff;
            box-shadow: 0 18px 40px rgba(15, 23, 42, 0.16);
          }

          .summaryLabel {
            font-size: 13px;
            line-height: 1.4;
            font-weight: 800;
            color: rgba(255, 255, 255, 0.72);
            text-transform: uppercase;
            letter-spacing: 0.04em;
          }

          .summaryTitle {
            margin-top: 10px;
            font-size: 28px;
            line-height: 1.05;
            font-weight: 900;
            letter-spacing: -0.03em;
          }

          .summaryRow {
            display: flex;
            justify-content: space-between;
            gap: 18px;
            padding: 14px 0;
            border-top: 1px solid rgba(255, 255, 255, 0.12);
            margin-top: 14px;
            font-size: 15px;
            line-height: 1.5;
          }

          .summaryRow span {
            color: rgba(255, 255, 255, 0.74);
          }

          .summaryRow strong {
            text-align: right;
            color: #ffffff;
            font-weight: 800;
          }

          .summaryDivider {
            height: 1px;
            background: rgba(255, 255, 255, 0.12);
            margin: 18px 0 16px;
          }

          .summaryContentLabel {
            font-size: 13px;
            line-height: 1.4;
            font-weight: 800;
            letter-spacing: 0.04em;
            text-transform: uppercase;
            margin-bottom: 12px;
            color: rgba(255, 255, 255, 0.72);
          }

          .summaryList {
            margin: 0;
            padding-left: 18px;
            display: grid;
            gap: 8px;
          }

          .summaryList li {
            color: #ffffff;
            font-size: 15px;
            line-height: 1.55;
            font-weight: 800;
          }

          .summaryNote {
            margin: 14px 0 0;
            font-size: 13px;
            line-height: 1.6;
            color: rgba(255, 255, 255, 0.68);
          }

          .capacityHint {
            margin-top: 18px;
            padding: 14px 16px;
            border-radius: 16px;
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid rgba(255, 255, 255, 0.12);
            color: #ffffff;
            font-size: 14px;
            line-height: 1.55;
            font-weight: 800;
          }

          .formSection {
            padding: 10px 0 84px;
          }

          .formCard {
            background: #ffffff;
            border: 1px solid rgba(15, 23, 42, 0.08);
            border-radius: 30px;
            padding: 34px 30px;
            box-shadow: 0 12px 34px rgba(15, 23, 42, 0.05);
          }

          .sectionBlock + .sectionBlock {
            margin-top: 34px;
          }

          h2 {
            margin: 0 0 18px;
            font-size: 30px;
            line-height: 1.08;
            letter-spacing: -0.03em;
            font-weight: 900;
            color: #0f172a;
          }

          .grid {
            display: grid;
            gap: 16px;
          }

          .twoCols {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .oneColNarrow {
            grid-template-columns: minmax(0, 240px);
          }

          .field {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }

          .field label {
            font-size: 14px;
            line-height: 1.5;
            font-weight: 800;
            color: #223252;
          }

          .field input,
          .field textarea {
            width: 100%;
            box-sizing: border-box;
            min-height: 54px;
            padding: 14px 16px;
            border-radius: 14px;
            border: 1px solid rgba(15, 23, 42, 0.14);
            background: #ffffff;
            color: #0f172a;
            font-size: 16px;
            line-height: 1.4;
            transition: border-color 0.18s ease, box-shadow 0.18s ease;
          }

          .field textarea {
            min-height: 120px;
            resize: vertical;
          }

          .field input:focus,
          .field textarea:focus {
            outline: none;
            border-color: rgba(27, 80, 156, 0.56);
            box-shadow: 0 0 0 4px rgba(27, 80, 156, 0.08);
          }

          .submitInfoBox {
            padding: 18px 20px;
            border-radius: 18px;
            background: #f8fafc;
            border: 1px solid rgba(15, 23, 42, 0.08);
          }

          .submitInfoTitle {
            font-size: 15px;
            line-height: 1.5;
            font-weight: 800;
            color: #0f172a;
            margin-bottom: 8px;
          }

          .submitInfoBox ul {
            margin: 0;
            padding-left: 18px;
            display: grid;
            gap: 8px;
          }

          .submitInfoBox li {
            color: #334155;
            font-size: 15px;
            line-height: 1.65;
          }

          .checkboxList {
            display: grid;
            gap: 14px;
          }

          .checkboxItem {
            display: grid;
            grid-template-columns: 22px 1fr;
            gap: 12px;
            align-items: start;
            padding: 14px 16px;
            border-radius: 16px;
            background: #f8fafc;
            border: 1px solid rgba(15, 23, 42, 0.08);
          }

          .checkboxItemStrong {
            background: #fff8e8;
            border-color: #f0dfaf;
          }

          .checkboxItem input {
            width: 18px;
            height: 18px;
            margin-top: 2px;
          }

          .checkboxItem span {
            font-size: 15px;
            line-height: 1.7;
            color: #334155;
          }

          .checkboxItem a,
          .helperLinks a {
            color: #1d4ed8;
            text-decoration: none;
            font-weight: 800;
          }

          .checkboxItem a:hover,
          .helperLinks a:hover {
            text-decoration: underline;
          }

          .helperLinks {
            display: flex;
            flex-wrap: wrap;
            gap: 10px 18px;
            margin-top: 18px;
            font-size: 14px;
            line-height: 1.6;
          }

          .errorBox {
            margin-top: 22px;
            padding: 16px 18px;
            border-radius: 16px;
            background: #fff1f2;
            border: 1px solid #fecdd3;
            color: #be123c;
            font-size: 15px;
            line-height: 1.6;
            font-weight: 700;
          }

          .submitRow {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
            margin-top: 30px;
          }

          .submitButton {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-height: 56px;
            padding: 0 24px;
            border: 0;
            border-radius: 14px;
            background: #0f172a;
            color: #ffffff;
            font-size: 16px;
            line-height: 1.2;
            font-weight: 800;
            cursor: pointer;
            box-shadow: 0 12px 28px rgba(15, 23, 42, 0.16);
            transition: transform 0.18s ease, box-shadow 0.18s ease,
              opacity 0.18s ease;
          }

          .submitButton:hover {
            transform: translateY(-2px);
            box-shadow: 0 16px 34px rgba(15, 23, 42, 0.2);
          }

          .submitButton:disabled {
            opacity: 0.72;
            cursor: wait;
            transform: none;
          }

          .submitNote {
            margin: 0;
            font-size: 14px;
            line-height: 1.6;
            color: #667085;
            font-weight: 700;
          }

          @media (max-width: 980px) {
            .heroGrid,
            .twoCols,
            .oneColNarrow {
              grid-template-columns: 1fr;
            }
          }

          @media (max-width: 640px) {
            .container {
              padding: 0 16px;
            }

            .hero {
              padding: 28px 0 18px;
            }

            .heroCard,
            .formCard {
              padding: 24px 20px;
              border-radius: 22px;
            }

            h1 {
              font-size: 36px;
            }

            h2 {
              font-size: 26px;
            }

            .lead {
              font-size: 16px;
            }

            .summaryTitle {
              font-size: 24px;
            }

            .summaryRow {
              flex-direction: column;
              gap: 4px;
            }

            .summaryRow strong {
              text-align: left;
            }

            .submitButton {
              width: 100%;
            }
          }
        `}</style>
      </main>
    </>
  );
}
