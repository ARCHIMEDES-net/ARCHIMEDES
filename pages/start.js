import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import Footer from "../components/Footer";
import { supabase } from "../lib/supabaseClient";

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
  adminEmail: "",
  phone: "",
  note: "",
  agreeVop: false,
  agreeDpa: false,
  agreeRecordings: false,
  agreeAuthority: false,
  agreeContract: false,
};

function getBestContactName(user) {
  const meta = user?.user_metadata || {};
  return (
    meta.full_name ||
    meta.name ||
    [meta.first_name, meta.last_name].filter(Boolean).join(" ").trim() ||
    ""
  );
}

function getBestRole(user) {
  const meta = user?.user_metadata || {};
  return meta.role || "";
}

export default function StartPage() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [prefillLoading, setPrefillLoading] = useState(true);
  const [prefillReady, setPrefillReady] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [successMode, setSuccessMode] = useState("completed");
  const [successData, setSuccessData] = useState({
    orderingEmail: "",
    adminEmail: "",
    sameAdmin: true,
    orderingHasOwnAccess: true,
  });

  useEffect(() => {
    let mounted = true;

    async function loadPrefill() {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) throw userError;

        if (!user || !mounted) {
          if (mounted) {
            setPrefillLoading(false);
            setPrefillReady(false);
          }
          return;
        }

        const email = user.email || "";
        const contactName = getBestContactName(user);
        const role = getBestRole(user);

        let schoolName = "";
        const adminEmail = email;

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("id, active_organization_id")
          .eq("id", user.id)
          .maybeSingle();

        if (profileError) throw profileError;

        if (profile?.active_organization_id) {
          const { data: org, error: orgError } = await supabase
            .from("organizations")
            .select("id, name")
            .eq("id", profile.active_organization_id)
            .maybeSingle();

          if (orgError) throw orgError;

          const orgName = org?.name || "";
          schoolName = orgName === "ARCHIMEDES DEMO SKOLA" ? "" : orgName;
        }

        if (!mounted) return;

        setForm((prev) => ({
          ...prev,
          schoolName: prev.schoolName || schoolName,
          contactName: prev.contactName || contactName,
          role: prev.role || role,
          email: prev.email || email,
          adminEmail: prev.adminEmail || adminEmail,
        }));

        setPrefillReady(!!(schoolName || contactName || email));
      } catch (_err) {
        if (mounted) {
          setPrefillReady(false);
        }
      } finally {
        if (mounted) {
          setPrefillLoading(false);
        }
      }
    }

    loadPrefill();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!success) return;

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [success]);

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
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        throw sessionError;
      }

      const headers = {
        "Content-Type": "application/json",
      };

      const accessToken = session?.access_token;
      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
      }

      const res = await fetch("/api/start-order", {
        method: "POST",
        headers,
        body: JSON.stringify({
          ...form,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          data?.error ||
            "Objednávku se nepodařilo odeslat. Zkuste to prosím znovu."
        );
      }

      setSuccessData({
        orderingEmail: form.email.trim(),
        adminEmail: form.adminEmail.trim(),
        sameAdmin:
          form.email.trim().toLowerCase() === form.adminEmail.trim().toLowerCase(),
        orderingHasOwnAccess: true,
      });
      setSuccessMode(
        data?.onboardingStatus === "failed" ? "failed" : "completed"
      );
      setSuccess(true);
    } catch (err) {
      setError(
        err?.message ||
          "Objednávku se nepodařilo odeslat. Zkuste to prosím znovu."
      );
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    const isCompleted = successMode === "completed";

    return (
      <>
        <Head>
          <title>
            {isCompleted
              ? "Škola připravena | ARCHIMEDES Live"
              : "Objednávka přijata | ARCHIMEDES Live"}
          </title>
          <meta
            name="description"
            content="Potvrzení přijetí objednávky balíčku START programu ARCHIMEDES Live pro školy."
          />
        </Head>

        <main className="page">
          <section className="successSection">
            <div className="container narrow">
              <div className="successCard">
                <div className="eyebrow dark">
                  {isCompleted ? "Objednávka dokončena" : "Objednávka přijata"}
                </div>

                <h1>
                  {isCompleted
                    ? "Škola byla připravena"
                    : "Děkujeme, objednávka byla přijata"}
                </h1>

                <p className="lead">
                  {isCompleted ? (
                    <>
                      Objednávku jsme přijali a školu jsme připravili v systému
                      ARCHIMEDES Live. Přístup ke vysílání získáváte okamžitě po
                      dokončení navazujícího kroku v e-mailu, který jsme právě
                      odeslali.
                    </>
                  ) : (
                    <>
                      Objednávka balíčku START byla přijata. Přístup školy nyní
                      ještě vyžaduje naši krátkou kontrolu. Další instrukce
                      pošleme na uvedený e-mail co nejdříve, aby škola mohla
                      začít využívat program bez zbytečného čekání.
                    </>
                  )}
                </p>

                {isCompleted ? (
                  <>
                    <div className="statusGrid">
                      <div className="statusItem done">
                        <div className="statusIcon">✓</div>
                        <div>
                          <div className="statusTitle">Objednávka přijata</div>
                          <div className="statusText">
                            Balíček START byl úspěšně zapsán za akční cenu.
                          </div>
                        </div>
                      </div>

                      <div className="statusItem done">
                        <div className="statusIcon">✓</div>
                        <div>
                          <div className="statusTitle">Škola připravena</div>
                          <div className="statusText">
                            Škola byla připravena pro vstup do ARCHIMEDES Live
                            až do 31. 12. 2026.
                          </div>
                        </div>
                      </div>

                      <div className="statusItem waiting">
                        <div className="statusIcon">→</div>
                        <div>
                          <div className="statusTitle">Další krok</div>
                          <div className="statusText">
                            Otevřete e-mail a dokončete aktivaci přístupu.
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="successBox">
                      {successData.sameAdmin ? (
                        <>
                          Na e-mail <strong>{successData.orderingEmail || "—"}</strong>{" "}
                          jsme odeslali potvrzení objednávky i informace k přístupu.
                          Pokud už účet v ARCHIMEDES Live máte, pokračujete svými
                          dosavadními údaji. Pokud účet teprve vzniká, dokončíte
                          nejprve nastavení hesla přes e-mail. Jakmile tento krok
                          dokončíte, škola získává přístup k aktuálním vysíláním
                          a programu až do 31. 12. 2026.
                        </>
                      ) : (
                        <>
                          Potvrzení objednávky bylo odesláno na e-mail objednatele{" "}
                          <strong>{successData.orderingEmail || "—"}</strong>. Na
                          e-mail správce programu{" "}
                          <strong>{successData.adminEmail || "—"}</strong> jsme
                          poslali navazující přístupové informace. Po dokončení
                          aktivace získá škola přístup k vysílání a programu až
                          do 31. 12. 2026.
                        </>
                      )}
                    </div>

                    <div className="nextSteps">
                      <div className="nextStepsTitle">Jak pokračovat</div>
                      <ol className="stepsList">
                        <li>Otevřete e-mail, který jsme vám právě odeslali.</li>
                        <li>Pokud je to potřeba, nastavte si heslo.</li>
                        <li>Poté se přihlaste do ARCHIMEDES Live.</li>
                        <li>Po přihlášení můžete ihned sledovat aktuální vysílání a program.</li>
                      </ol>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="warningBox">
                      Objednávku jsme přijali, ale automatické dokončení přístupu
                      neproběhlo úplně správně. Nic se neztratilo — navážeme na vás
                      e-mailem a přístup dokončíme ručně, aby škola mohla začít
                      využívat program co nejdříve.
                    </div>

                    <div className="nextSteps">
                      <div className="nextStepsTitle">Co bude následovat</div>
                      <ul>
                        <li>Zašleme vám potvrzení objednávky.</li>
                        <li>Obratem vám vytvoříme přístup.</li>
                        <li>Odešleme fakturu a podklady.</li>
                        <li>Následně pošleme další organizační informace.</li>
                      </ul>
                    </div>
                  </>
                )}

                <p className="smallText">
                  Pokud e-mail během několika minut neobdržíte, zkontrolujte
                  prosím složku Hromadné nebo Spam.
                </p>

                <div className="successActions">
                  <Link href="/" className="primaryLink">
                    Zpět na hlavní stránku
                  </Link>

                  <Link href="/poptavka" className="secondaryLink">
                    Kontaktovat EduVision
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

            .statusGrid {
              margin-top: 24px;
              display: grid;
              gap: 14px;
            }

            .statusItem {
              display: grid;
              grid-template-columns: 48px 1fr;
              gap: 14px;
              align-items: start;
              padding: 18px 20px;
              border-radius: 18px;
              border: 1px solid rgba(15, 23, 42, 0.08);
            }

            .statusItem.done {
              background: #eefaf0;
              border-color: #cfe8d3;
            }

            .statusItem.waiting {
              background: #eef6ff;
              border-color: rgba(37, 99, 235, 0.12);
            }

            .statusIcon {
              width: 48px;
              height: 48px;
              display: inline-flex;
              align-items: center;
              justify-content: center;
              border-radius: 999px;
              font-size: 20px;
              font-weight: 900;
              background: #ffffff;
              color: #0f172a;
              box-shadow: inset 0 0 0 1px rgba(15, 23, 42, 0.08);
            }

            .statusTitle {
              font-size: 16px;
              line-height: 1.4;
              font-weight: 900;
              color: #0f172a;
            }

            .statusText {
              margin-top: 4px;
              font-size: 15px;
              line-height: 1.7;
              color: #334155;
            }

            .successBox {
              margin-top: 22px;
              padding: 18px 20px;
              border-radius: 18px;
              background: #f8fafc;
              border: 1px solid rgba(15, 23, 42, 0.08);
              color: #334155;
              font-size: 16px;
              line-height: 1.7;
              font-weight: 700;
            }

            .warningBox {
              margin-top: 22px;
              padding: 18px 20px;
              border-radius: 18px;
              background: #fff8e8;
              border: 1px solid #f0dfaf;
              color: #6b4f00;
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
              margin-bottom: 10px;
            }

            .nextSteps ul,
            .stepsList {
              margin: 0;
              padding-left: 20px;
              display: grid;
              gap: 8px;
            }

            .nextSteps li,
            .stepsList li {
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

              .statusItem {
                grid-template-columns: 40px 1fr;
                gap: 12px;
                padding: 16px 16px;
              }

              .statusIcon {
                width: 40px;
                height: 40px;
                font-size: 18px;
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
        <title>Balíček START | ARCHIMEDES Live</title>
        <meta
          name="description"
          content="Objednejte pro školu balíček START programu ARCHIMEDES Live až do 31. 12. 2026 za zvýhodněnou cenu při objednávce do 31. 8. 2026."
        />
      </Head>

      <main className="page">
        <section className="hero">
          <div className="container">
            <div className="heroCard">
              <div className="heroGrid">
                <div className="heroMain">
                  <div className="eyebrow dark">
                    Balíček START pro školy • objednávka do 31. 8. 2026 • přístup do 31. 12. 2026
                  </div>

                  <h1>Zapojte školu do programu ARCHIMEDES Live až do konce roku 2026</h1>

                  <p className="lead">
                    Balíček START je nejrychlejší cesta, jak školu zapojit do
                    programu ARCHIMEDES Live za zvýhodněnou cenu. Stačí odeslat
                    objednávku do 31. 8. 2026 a škola získá přístup až do
                    31. 12. 2026. Přístup k vysílání získáváte ihned po
                    objednání — čím dříve se zapojíte, tím více programu škola
                    využije.
                  </p>

                  <div className="quickBenefits">
                    <div className="benefitItem">přístup do programu až do 31. 12. 2026</div>
                    <div className="benefitItem">akční cena 4 990 Kč bez DPH při objednávce do 31. 8. 2026</div>
                    <div className="benefitItem">přístup k vysílání ihned po objednání</div>
                    <div className="benefitItem">čím dříve objednáte, tím více programu škola získá</div>
                    <div className="benefitItem">bez automatického prodloužení</div>
                    <div className="benefitItem">
                      potvrzení objednávky + faktura + přístup pro školu
                    </div>
                  </div>

                  <div className="howItWorksBox">
                    <div className="miniTitle">Jak to probíhá</div>
                    <div className="simpleSteps">
                      <div className="simpleStep">
                        <span className="stepNumber">1</span>
                        <p>Vyplníte údaje školy a odešlete objednávku do 31. 8. 2026.</p>
                      </div>
                      <div className="simpleStep">
                        <span className="stepNumber">2</span>
                        <p>Pošleme potvrzení objednávky a vytvoříme přístup pro školu.</p>
                      </div>
                      <div className="simpleStep">
                        <span className="stepNumber">3</span>
                        <p>Obratem obdržíte přístupové údaje a škola může začít sledovat vysílání.</p>
                      </div>
                    </div>
                  </div>

                  <div className="schoolAdminBox">
                    <div className="miniTitle">Podklady pro školu</div>
                    <p>
                      Zašleme potvrzení objednávky, fakturu, specifikaci plnění
                      a další podklady pro interní administraci školy.
                    </p>
                    <p className="smallLegal">
                      Zařazení programu do financování školy (šablony a pod.) posuzuje škola podle
                      své projektové a účetní dokumentace.
                    </p>
                  </div>

                  <div className="demoInline">
                    <span>Chcete se ještě vrátit do ukázkového prostředí?</span>
                    <Link href="/portal" className="demoGhostButton">
                      Zpět do portálu
                    </Link>
                  </div>
                </div>

                <div className="summaryColumn">
                  <div className="summaryCard">
                    <div className="summaryLabel">Balíček START</div>
                    <div className="summaryTitle">Do 31. 12. 2026</div>

                    <div className="summaryDeadline">
                      Akční cena při objednávce do 31. 8. 2026
                    </div>

                    <div className="priceHighlight">
                      <div className="priceTop">Cena za celé období</div>
                      <div className="priceNumbers">
                        <span className="priceOld">7.960 Kč</span>
                        <span className="priceArrow">→</span>
                        <span className="priceNew">4.990 Kč</span>
                      </div>
                      <div className="priceMeta">
                        cena bez DPH · jednorázově · bez automatického prodloužení
                      </div>
                    </div>

                    <div className="summaryBadge">
                      Přístup k vysílání získáváte ihned po objednání. Čím dříve
                      školu zapojíte, tím více programu do konce roku využijete.
                    </div>

                    <div className="summaryDivider" />

                    <div className="summaryContentLabel">Každý měsíc zažijete</div>
                    <ul className="summaryList summaryFeatureList">
                      <li>živé online vysílání pro I. stupeň ZŠ</li>
                      <li>živé online vysílání pro II. stupeň ZŠ</li>
                      <li>program zaměřený na wellbeing žáků</li>
                      <li>program zaměřený na kariérové poradenství</li>
                      <li>Čtenářský klub Magnesia Litera</li>
                      <li>živý rozhovor s hostem v angličtině</li>
                      <li>průběžně zveřejňovaný program do 31. 12. 2026</li>
                    </ul>

                    <p className="summaryNote">
                      Konkrétní termíny jsou zveřejňovány průběžně v programu
                      ARCHIMEDES Live. Balíček START umožňuje škole vstoupit do
                      programu okamžitě po objednání a využívat jej až do konce
                      roku 2026.
                    </p>
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
                    <label htmlFor="email">E-mail objednatele *</label>
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
                    <label htmlFor="adminEmail">E-mail správce programu *</label>
                    <input
                      id="adminEmail"
                      name="adminEmail"
                      type="email"
                      value={form.adminEmail}
                      onChange={handleChange}
                      placeholder="např. skola@skola.cz"
                      required
                    />
                    <div className="inlineHint">
                      Správce programu/admin je osoba, která bude spravovat přístup
                      školy v portálu. Pokud jste jí vy, uveďte stejný e-mail
                      jako u objednatele.
                    </div>
                  </div>
                </div>

                <div className="grid twoCols">
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
              </div>

              <div className="sectionBlock">
                <div className="submitInfoLine">
                  Po odeslání přijde objednateli potvrzení e-mailem a správci
                  programu informace k přístupu. Přístup k vysílání získává škola
                  ihned po objednání a dokončení aktivace.
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
                      včetně zpřístupnění záznamů registrovaným uživatelům v
                      archivu.
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
                      Odesláním objednávky závazně objednávám za školu /
                      organizaci balíček START ARCHIMEDES Live s přístupem do
                      31. 12. 2026 za akční cenu uvedenou na této stránce, a to
                      při objednávce nejpozději do 31. 8. 2026. Zároveň potvrzuji
                      povinnost uhradit vystavený daňový doklad.
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
                  Po odeslání objednávky vám přijde potvrzení e-mailem a škola
                  získá přístup k programu po dokončení aktivace.
                </p>
              </div>

              <div className="supplierFootnote">
                <strong>Dodavatel:</strong> EduVision s.r.o., Purkyňova 649/127,
                Medlánky, 612 00 Brno · IČ: 17803039 · DIČ: CZ17803039
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
            grid-template-columns: minmax(0, 1.18fr) minmax(340px, 0.82fr);
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

          .prefillInfo {
            margin-top: 18px;
            padding: 16px 18px;
            border-radius: 18px;
            font-size: 15px;
            line-height: 1.7;
          }

          .prefillInfo.loading {
            background: #f8fafc;
            border: 1px solid rgba(15, 23, 42, 0.08);
            color: #334155;
          }

          .prefillInfo.ready {
            background: #eef6ff;
            border: 1px solid rgba(37, 99, 235, 0.12);
            color: #1f3b75;
            font-weight: 700;
          }

          .prefillInfo.neutral {
            background: #f8fafc;
            border: 1px solid rgba(15, 23, 42, 0.08);
            color: #475467;
          }

          .quickBenefits {
            margin-top: 18px;
            display: grid;
            gap: 10px;
          }

          .benefitItem {
            position: relative;
            padding: 0 0 0 28px;
            font-size: 15px;
            line-height: 1.65;
            color: #334155;
            font-weight: 700;
          }

          .benefitItem::before {
            content: "✓";
            position: absolute;
            left: 0;
            top: 0;
            color: #16a34a;
            font-weight: 900;
          }

          .howItWorksBox,
          .schoolAdminBox {
            margin-top: 20px;
            padding: 20px 20px 18px;
            border-radius: 18px;
            background: #f8fafc;
            border: 1px solid rgba(15, 23, 42, 0.08);
          }

          .miniTitle {
            font-size: 15px;
            line-height: 1.5;
            font-weight: 800;
            color: #0f172a;
            margin-bottom: 12px;
          }

          .simpleSteps {
            display: grid;
            gap: 12px;
          }

          .simpleStep {
            display: grid;
            grid-template-columns: 32px 1fr;
            gap: 12px;
            align-items: start;
          }

          .stepNumber {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 32px;
            border-radius: 999px;
            background: #e9eef8;
            color: #223252;
            font-size: 14px;
            font-weight: 900;
            line-height: 1;
            box-shadow: inset 0 0 0 1px rgba(34, 50, 82, 0.08);
          }

          .simpleStep p,
          .schoolAdminBox p {
            margin: 0;
            color: #334155;
            font-size: 15px;
            line-height: 1.65;
          }

          .smallLegal {
            margin-top: 10px !important;
            color: #667085 !important;
            font-size: 14px !important;
          }

          .demoInline {
            display: flex;
            flex-wrap: wrap;
            gap: 10px 12px;
            align-items: center;
            margin-top: 18px;
            font-size: 14px;
            line-height: 1.6;
            color: #475467;
          }

          .demoGhostButton {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-height: 38px;
            padding: 0 14px;
            border-radius: 999px;
            text-decoration: none;
            font-weight: 800;
            font-size: 14px;
            line-height: 1;
            color: #223252;
            background: #ffffff;
            border: 1px solid rgba(15, 23, 42, 0.12);
            transition: transform 0.18s ease, box-shadow 0.18s ease,
              border-color 0.18s ease;
          }

          .demoGhostButton:hover {
            transform: translateY(-1px);
            border-color: rgba(34, 50, 82, 0.2);
            box-shadow: 0 8px 18px rgba(15, 23, 42, 0.08);
          }

          .summaryCard {
            border-radius: 26px;
            padding: 24px 22px;
            background:
              radial-gradient(circle at top right, rgba(59, 130, 246, 0.22), transparent 34%),
              linear-gradient(180deg, #0f172a 0%, #081122 100%);
            color: #ffffff;
            box-shadow: 0 18px 40px rgba(15, 23, 42, 0.16);
            overflow: hidden;
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

          .summaryDeadline {
            margin-top: 12px;
            display: inline-flex;
            align-items: center;
            min-height: 36px;
            padding: 0 12px;
            border-radius: 999px;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.14);
            color: #ffffff;
            font-size: 13px;
            line-height: 1.4;
            font-weight: 800;
          }

          .priceHighlight {
            margin-top: 18px;
            padding: 18px 18px 16px;
            border-radius: 18px;
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid rgba(255, 255, 255, 0.14);
            backdrop-filter: blur(8px);
          }

          .priceTop {
            font-size: 12px;
            line-height: 1.4;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            font-weight: 800;
            color: rgba(255, 255, 255, 0.72);
          }

          .priceNumbers {
            display: flex;
            flex-wrap: wrap;
            align-items: baseline;
            gap: 10px;
            margin-top: 10px;
          }

          .priceOld {
            font-size: 22px;
            line-height: 1;
            font-weight: 800;
            color: rgba(255, 255, 255, 0.45);
            text-decoration: line-through;
          }

          .priceArrow {
            font-size: 22px;
            line-height: 1;
            font-weight: 900;
            color: rgba(255, 255, 255, 0.7);
          }

          .priceNew {
            font-size: 36px;
            line-height: 1;
            font-weight: 900;
            letter-spacing: -0.03em;
            color: #ffffff;
          }

          .priceMeta {
            margin-top: 10px;
            font-size: 13px;
            line-height: 1.55;
            color: rgba(255, 255, 255, 0.72);
          }

          .summaryBadge {
            margin-top: 18px;
            padding: 14px 16px;
            border-radius: 16px;
            background: linear-gradient(
              135deg,
              rgba(255, 255, 255, 0.08) 0%,
              rgba(255, 255, 255, 0.04) 100%
            );
            border: 1px solid rgba(255, 255, 255, 0.12);
            color: #ffffff;
            font-size: 14px;
            line-height: 1.55;
            font-weight: 800;
          }

          .summaryDivider {
            height: 1px;
            background: rgba(255, 255, 255, 0.12);
            margin: 20px 0 16px;
          }

          .summaryContentLabel {
            font-size: 13px;
            line-height: 1.4;
            font-weight: 900;
            letter-spacing: 0.05em;
            text-transform: uppercase;
            margin-bottom: 14px;
            color: rgba(255, 255, 255, 0.82);
          }

          .summaryList {
            margin: 0;
            padding: 0;
            list-style: none;
            display: grid;
            gap: 10px;
          }

          .summaryFeatureList li {
            position: relative;
            padding: 11px 12px 11px 40px;
            border-radius: 14px;
            background: rgba(255, 255, 255, 0.06);
            border: 1px solid rgba(255, 255, 255, 0.08);
            color: #ffffff;
            font-size: 15px;
            line-height: 1.5;
            font-weight: 800;
          }

          .summaryFeatureList li::before {
            content: "✓";
            position: absolute;
            left: 14px;
            top: 50%;
            transform: translateY(-50%);
            width: 18px;
            height: 18px;
            border-radius: 999px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            background: rgba(34, 197, 94, 0.18);
            color: #86efac;
            font-size: 12px;
            font-weight: 900;
          }

          .summaryNote {
            margin: 16px 0 0;
            font-size: 13px;
            line-height: 1.65;
            color: rgba(255, 255, 255, 0.68);
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

          .inlineHint {
            margin-top: 4px;
            font-size: 14px;
            line-height: 1.55;
            color: #667085;
          }

          .submitInfoLine {
            padding: 18px 20px;
            border-radius: 18px;
            background: #f8fafc;
            border: 1px solid rgba(15, 23, 42, 0.08);
            font-size: 15px;
            line-height: 1.65;
            color: #334155;
            font-weight: 700;
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

          .supplierFootnote {
            margin-top: 28px;
            font-size: 13px;
            line-height: 1.7;
            color: #667085;
            padding-top: 18px;
            border-top: 1px solid rgba(15, 23, 42, 0.08);
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

            .priceNew {
              font-size: 30px;
            }

            .simpleStep {
              grid-template-columns: 28px 1fr;
              gap: 10px;
            }

            .stepNumber {
              width: 28px;
              height: 28px;
              font-size: 13px;
            }

            .summaryFeatureList li {
              padding: 10px 12px 10px 38px;
              font-size: 14px;
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
