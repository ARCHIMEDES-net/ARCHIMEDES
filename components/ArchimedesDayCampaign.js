import Head from "next/head";
import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import Footer from "./Footer";
import css from "../styles/ArchimedesCampaign.module.css";

const photos = "/archimedes-day-2026/";
const email = "zuzana.novotna@archimedeslive.com";
const words = {
  cz: {
    navOne:"Den generací",navTwo:"Pro obce",navThree:"První ročník",
    eventTag:"PROBĚHLO 5. LISTOPADU 2026 | RATÍŠKOVICE",
    villageTag:"DEN GENERACÍ PRO OBCE A ŠKOLY",
    eventTitle:"Babi, dědo, pojďme objevovat!",
    villageTitle:"Věda, která spojí tři generace. Přímo u vás",
    eventIntro:"Den generací se uskutečnil 5. listopadu 2026 v učebně ARCHIMEDES v Ratíškovicích. Seniorský klub Ratíškovice uspořádal odpoledne pro seniory a vnoučata se Science ON a vědeckou show KLAM. Součástí byl veřejný přenos na ARCHIMEDES Live.",
    villageIntro:"Vyberete termín a místo. My se Science ON přivezeme vědeckou show a pokusy, při kterých se potkají děti, rodiče i prarodiče. Zábavný program, který má smysl pro celou obec.",
    eventPrimary:"Ohlédnutí za setkáním",
    eventSecondary:"Chci Den generací u nás",
    villagePrimary:"Chci nezávaznou nabídku",
    villageSecondary:"Ohlédnutí za Ratíškovicemi",
    eventNote:"Akce již proběhla. Program pro vaši obec připravíme po domluvě.",
    infoEvent:["5. listopadu 2026","Akce již proběhla","Ratíškovice + online","Science ON: KLAM"],
    infoVillage:["45 minut show","60 minut pokusů","Až 150 účastníků","Termín dle dohody"],
    secEvent:"Společné objevování v Ratíškovicích i online",
    secVillage:"Vyberete místo a datum. O program se postaráme",
    secEventIntro:"Odpoledne uspořádal Seniorský klub Ratíškovice pro seniory a vnoučata. Společné objevování se Science ON propojilo místní setkání s veřejným online přenosem.",
    secVillageIntro:"Program tvoří 45 minut živé show a 60 minut společných pokusů. Konkrétní podobu a kapacitu přizpůsobíme vašemu prostoru.",
    stepsEvent:[["01","Věříte vlastním očím?","Science ON představilo show KLAM plnou překvapivých ukázek a smyslových klamů."],["02","Pokusy se Science ON","Členové místního seniorklubu se zapojili do společného objevování a pokusů."],["03","Z Ratíškovic až k vám","Program jsme vysílali živě, aby společné objevování mohly sledovat i další rodiny a obce."]],
    stepsVillage:[["01","Navrhnete termín","Řeknete nám, kdy chcete rodiny ve své obci pozvat."],["02","Vyberete místo","Kulturní dům, škola nebo jiný vhodný prostor."],["03","Dostanete konkrétní nabídku","Ověříme dostupnost Science ON, technické podmínky a dopravu."],["04","Společně přivítáme generace","My se postaráme o program, obec pozve své rodiny."]],
    historyKicker:"OHLÉDNUTÍ | BRNO | 19. ČERVNA 2026",
    historyTitle:"Z Brna do Ratíškovic. A dál do dalších obcí",
    historyText:"První ARCHIMEDES DAY se uskutečnil v červnu 2026 na brněnském výstavišti. Science ON předvedlo vědecké pokusy, žáci se zapojili do programu a živý přenos propojil Brno s Museum Kotsanas v Řecku. V listopadu na něj navázal Den generací v Ratíškovicích.",
    historyLink:"Prohlédnout program a fotografie z Brna",
    photoNote:"ARCHIMEDES DAY · BVV Brno · 19. června 2026",
    imageOne:"Science ON během živého pokusu v Brně",
    imageTwo:"Žáci při programu ARCHIMEDES DAY",
    imageThree:"Hosté prvního ARCHIMEDES DAY na BVV",
    priceKicker:"ORIENTAČNÍ CENA ZA CELOU AKCI",
    price:"19 500 Kč",
    priceTax:"včetně DPH",
    priceText:"Uvedená cena je orientační. Po potvrzení termínu, místa a rozsahu akce připravíme konečnou nabídku včetně dopravy.",
    actionEventTitle:"Co kdyby příští Den generací byl u vás?",
    actionEventText:"Program Science ON a společné pokusy můžeme připravit i pro vaši obec, školu nebo seniorklub. Stačí vybrat termín a místo.",
    actionEventLink:"Prohlédnout nabídku pro obce",
    actionVillageTitle:"Chcete uspořádat Den generací?",
    actionVillageText:"Napište, pro jakou obec nebo školu akci plánujete. Termín ještě vědět nemusíte. Ozveme se a společně probereme možnosti.",
    actionVillageLink:"Požádat o nabídku",
    futureTitle:"Jeden den může být začátkem mnoha dalších objevů",
    futureText:"ARCHIMEDES DAY propojuje místní setkání s živým vysíláním a vzdělávacím programem ARCHIMEDES Live. Chceme, aby školy, obce a rodiny mohly objevovat společně — nejen jeden den v roce.",
    partner:"Na programu spolupracujeme se Science ON",
    mailSubject:"ARCHIMEDES DAY – poptávka pro obec",
    mailBody:"Dobrý den,\nrádi bychom uspořádali ARCHIMEDES DAY – Den generací.\n\nObec:\nNavrhované datum:\nMísto konání:\nPředpokládaný počet účastníků:\nKontaktní osoba a telefon:\n"
  },
  en: {
    navOne:"Generations Day",navTwo:"For municipalities",navThree:"First edition",
    eventTag:"HELD ON 5 NOVEMBER 2026 | RATÍŠKOVICE",
    villageTag:"GENERATIONS DAY FOR COMMUNITIES AND SCHOOLS",
    eventTitle:"Grandma, Grandpa — let's discover together!",
    villageTitle:"Science brings three generations together. Right in your community",
    eventIntro:"Generations Day took place on 5 November 2026 at the ARCHIMEDES classroom in Ratíškovice. Seniorský klub Ratíškovice organised an afternoon for seniors and grandchildren with Science ON and its KLAM science show, including a public broadcast on ARCHIMEDES Live.",
    villageIntro:"Choose a date and venue. Together with Science ON, we'll bring a science show and hands-on experiments that children, parents and grandparents can all enjoy. A meaningful day for your community.",
    eventPrimary:"About the gathering",
    eventSecondary:"Bring Generations Day to my town",
    villagePrimary:"Request a no-obligation offer",
    villageSecondary:"Look back at Ratíškovice",
    eventNote:"This event has ended. Contact us to arrange a programme for your community.",
    infoEvent:["5 November 2026","Past event","Ratíškovice + online","Science ON: KLAM"],
    infoVillage:["45-minute show","60 minutes of experiments","Up to 150 participants","Date by agreement"],
    secEvent:"Discover together in Ratíškovice and online",
    secVillage:"Choose the date and venue. We will take care of the programme",
    secEventIntro:"Seniorský klub Ratíškovice organised the afternoon for seniors and grandchildren. Shared discoveries with Science ON connected the local gathering with a public online broadcast.",
    secVillageIntro:"The programme combines a 45-minute science show and 60 minutes of hands-on experiments. We'll adapt the format and capacity to your venue.",
    stepsEvent:[["01","Can you trust your eyes?","Science ON's KLAM show was packed with surprising demonstrations and sensory illusions."],["02","Experiments with Science ON","Local senior-club members took part in shared discoveries and experiments."],["03","From Ratíškovice to you","We broadcast the programme live so other families and communities could share in the discoveries."]],
    stepsVillage:[["01","Suggest a date","Tell us when you'd like to invite families in your community."],["02","Choose a venue","A community hall, school or another suitable space."],["03","Receive a tailored offer","We check Science ON's availability, technical needs and travel costs."],["04","Bring generations together","We deliver the programme while you invite local families."]],
    historyKicker:"LOOKING BACK | BRNO | 19 JUNE 2026",
    historyTitle:"From Brno to Ratíškovice — and beyond",
    historyText:"The first ARCHIMEDES DAY took place at Brno Exhibition Centre in June 2026, with Science ON experiments and a live link to the Kotsanas Museum in Greece. Generations Day in Ratíškovice followed in November.",
    historyLink:"Explore the programme and photos from Brno",
    photoNote:"ARCHIMEDES DAY · Brno Exhibition Centre · 19 June 2026",
    imageOne:"Science ON performing a live experiment in Brno",
    imageTwo:"Schoolchildren at ARCHIMEDES DAY",
    imageThree:"Guests of the first ARCHIMEDES DAY",
    priceKicker:"INDICATIVE PRICE FOR THE COMPLETE EVENT",
    price:"CZK 19,500",
    priceTax:"VAT included",
    priceText:"The price shown is indicative. Once we know the date, location and requirements, we'll send a final quote including travel.",
    actionEventTitle:"What if the next Generations Day came to your town?",
    actionEventText:"We can bring Science ON and hands-on experiments to your town, school or seniors' club. You choose the date and venue.",
    actionEventLink:"Explore the offer for communities",
    actionVillageTitle:"Would you like to host Generations Day?",
    actionVillageText:"Tell us which town or school you are planning the event for. You do not need to know the date yet. Our team will get in touch to discuss the options.",
    actionVillageLink:"Request an offer",
    futureTitle:"One event can spark many more discoveries",
    futureText:"ARCHIMEDES DAY connects local events with live broadcasts and the year-round ARCHIMEDES Live programme. Our goal is to help schools, communities and families discover together throughout the year.",
    partner:"Programme developed in collaboration with Science ON",
    mailSubject:"ARCHIMEDES DAY – community enquiry",
    mailBody:"Hello,\nWe would like to organise ARCHIMEDES DAY – Generations Day.\n\nMunicipality:\nPreferred date:\nVenue:\nApproximate number of participants:\nContact person and phone:\n"
  }
};

function ScienceLogo() {
  return <span className={css.scienceLogo}><svg viewBox="490 345 550 415" role="img" aria-label="Science ON"><image href="/partners/science-on.png" width="1600" height="1131"/></svg></span>;
}

function InquiryForm({ lang }) {
  const en = lang === "en";
  const [state, setState] = useState("idle");
  const busy = useRef(false);
  const [error, setError] = useState("");
  async function submit(event) {
    event.preventDefault();
    if (busy.current) return;
    busy.current = true;
    setState("sending");
    setError("");
    const values = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const response = await fetch("/api/poptavka", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selectedOption: values.type,
          selectedLabel: "ARCHIMEDES DAY – Den generací",
          name: values.name, place: values.place, email: values.email,
          phone: values.phone, company: values.company,
          message: [
            "Poptávka ARCHIMEDES DAY – Den generací",
            "Termín: " + (values.date || "Zatím neurčen"),
            "Poznámka / místo / počet a věk účastníků: " + (values.message || "Neuvedeno"),
            "Zdroj: https://www.archimedeslive.com/archimedes-day/pro-obce",
            "Jazyk: " + lang
          ].join("\n")
        })
      });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.error || "Poptávku se nepodařilo uložit.");
      setState("success");
    } catch {
      setState("error");
      setError(en ? "We could not confirm receipt. Your entries are still here. Please contact us by email before sending again if you are unsure." : "Nepodařilo se potvrdit přijetí poptávky. Údaje zůstaly vyplněné. Pokud si nejste jistí odesláním, napište nám před opakováním e-mail.");
    } finally { busy.current = false; }
  }
  if (state === "success") return <div className={css.receipt} role="status"><h3>{en ? "Thank you. Your enquiry has been saved." : "Děkujeme. Vaše poptávka je uložená."}</h3><p>{en ? "Our team will contact you using the details you provided to discuss the date, venue and programme. This is not a binding booking." : "Náš tým se vám ozve na uvedený kontakt. Probereme termín, místo a podobu programu. Nejde o závaznou objednávku."}</p></div>;
  return <form className={css.inquiryForm} onSubmit={submit} aria-busy={state === "sending"}>
    <p className={css.formHint}>{en ? "Required fields are marked *. Date and phone number are optional." : "Povinná pole jsou označena *. Termín ani telefon vyplňovat nemusíte."}</p>
    <div className={css.formGrid}>
      <label>{en ? "I am enquiring for *" : "Poptávám za *"}<select name="type" defaultValue="obec" required><option value="obec">{en ? "Municipality" : "Obec / město"}</option><option value="skola">{en ? "School" : "Škola"}</option><option value="senior">{en ? "Seniors’ club" : "Seniorklub"}</option><option value="komunita">{en ? "Association / other" : "Spolek / jiné"}</option></select></label>
      <label>{en ? "Town / school / organisation *" : "Název obce / školy / organizace *"}<input name="place" required maxLength={180} autoComplete="organization"/></label>
      <label>{en ? "Contact name *" : "Kontaktní osoba *"}<input name="name" required minLength={2} maxLength={120} autoComplete="name"/></label>
      <label>{en ? "Email *" : "E-mail *"}<input name="email" type="email" required maxLength={254} autoComplete="email"/></label>
      <label>{en ? "Phone (optional)" : "Telefon (volitelné)"}<input name="phone" type="tel" maxLength={40} autoComplete="tel"/></label>
      <label>{en ? "Preferred date (optional)" : "Představa o termínu (volitelné)"}<input name="date" maxLength={100} placeholder={en ? "e.g. spring 2027 / not decided" : "Např. jaro 2027 / zatím nevíme"}/></label>
      <label className={css.fullField}>{en ? "Anything else? (optional)" : "Co bychom měli vědět? (volitelné)"}<textarea name="message" rows={4} maxLength={2500} placeholder={en ? "Venue, approximate audience size and ages, or your questions." : "Místo, přibližný počet a věk účastníků nebo vaše otázky."}/></label>
    </div>
    <div hidden aria-hidden="true"><label>Website<input name="company" tabIndex={-1} autoComplete="off"/></label></div>
    <p className={css.formHint}>{en ? "We use your details to handle this enquiry. " : "Údaje použijeme k vyřízení této poptávky. "}<Link href="/ochrana-osobnich-udaju">{en ? "Privacy information" : "Ochrana osobních údajů"}</Link></p>
    {error && <p className={css.formError} role="alert">{error}</p>}
    <button type="submit" className={css.primary} disabled={state === "sending"}>{state === "sending" ? (en ? "Sending…" : "Odesílám…") : (en ? "Send a no-obligation enquiry →" : "Odeslat nezávaznou poptávku →")}</button>
    <p className={css.formHint}>{en ? "Prefer email? " : "Raději e-mailem? "}<a href="mailto:zuzana.novotna@archimedeslive.com">zuzana.novotna@archimedeslive.com</a></p>
  </form>;
}

function PlatformMention({ text }) {
  return text.split("ARCHIMEDES Live").map((part, index) => <span key={index}>{index > 0 && <Link href="/" style={{color:"inherit",textDecoration:"underline",textUnderlineOffset:"3px"}}>ARCHIMEDES Live</Link>}{part}</span>);
}

function Participation({ lang }) {
  const en = lang === "en";
  return <section id="prenos" className={css.broadcast}><div className={css.wrap}>
    <p className={css.label}>5. 11. 2026 · {en ? "PAST EVENT" : "PROBĚHLÁ AKCE"}</p>
    <h2>{en ? "Generations Day in Ratíškovice" : "Den generací v Ratíškovicích"}</h2>
    <div className={css.participationGrid}>
      <article><p className={css.label}>{en ? "THE LOCAL GATHERING" : "MÍSTNÍ SETKÁNÍ"}</p><h3>{en ? "ARCHIMEDES® classroom in Ratíškovice" : "Učebna ARCHIMEDES® v Ratíškovicích"}</h3><p>{en ? "The event for seniors and grandchildren was organised by Seniorský klub Ratíškovice. Science ON brought its KLAM science show and shared experiments." : "Akci pro seniory a vnoučata uspořádal Seniorský klub Ratíškovice. Science ON přivezlo vědeckou show KLAM a společné pokusy."}</p><p>{en ? "The event and its live broadcast have ended." : "Akce i její živý přenos již skončily."}</p></article>
      <article><p className={css.label}>{en ? "NEXT TIME IN YOUR COMMUNITY" : "PŘÍŠTĚ VE VAŠÍ OBCI"}</p><h3>{en ? "Bring generations together" : "Pozvěte generace ke společnému objevování"}</h3><p>{en ? "Choose a date and venue. We will discuss the programme, technical arrangements and a tailored offer with you." : "Navrhněte termín a místo. Společně probereme podobu programu, technické zázemí a nabídku pro vaši obec."}</p><Link className={css.primary} href={"/archimedes-day/pro-obce" + (en ? "?lang=en" : "")}>{en ? "Explore the programme for communities →" : "Prohlédnout program pro obce →"}</Link></article>
    </div>
  </div></section>;
}

function PracticalInfo({lang}) {
  const en=lang==="en";
  const items=en ? [
    ["What do we provide?","Science ON’s science show and shared experiments. We will confirm the programme, capacity, technical requirements, preparation and travel in your individual offer."],
    ["What does the host arrange?","Propose a date and a suitable venue and invite local families. We will agree on equipment, seating, access and preparation before confirming the booking."],
    ["Can a school host the event?","Yes, you can enquire as a school. The programme creates opportunities to observe, ask questions, predict results and explore together. Tell us the children’s ages so we can confirm a suitable format."],
    ["Do we need a classroom or a licence?","No. Hosting the local programme does not require an ARCHIMEDES® classroom or an ARCHIMEDES Live licence. A community hall, school or another suitable venue is enough. We will agree on the technical arrangements together."],
    ["What does the price cover?","CZK 19,500 including VAT is an indicative price. The final scope and total including travel will be stated in your offer. Sending an enquiry does not confirm a booking."]
  ] : [
    ["Co zajistíme my?","Vědeckou show Science ON a společné pokusy. Konkrétní program, kapacitu, technické požadavky, přípravu a dopravu upřesníme v nabídce pro vaše místo."],
    ["Co připraví obec nebo škola?","Navrhnete termín a vhodný prostor a pozvete místní rodiny. Vybavení, sezení, přístup do prostoru a přípravu si společně odsouhlasíme před potvrzením akce."],
    ["Je program vhodný také pro školy?","Akci může poptat i škola. Program dává prostor pozorování, otázkám, odhadování výsledků a společnému objevování. Napište nám věk dětí, abychom potvrdili vhodnou podobu programu."],
    ["Potřebujeme učebnu ARCHIMEDES® nebo licenci?","Ne. K uspořádání místního programu nepotřebujete učebnu ARCHIMEDES® ani licenci ARCHIMEDES Live. Stačí kulturní dům, škola nebo jiný vhodný prostor. Technické zázemí domluvíme společně."],
    ["Co znamená orientační cena?","19 500 Kč včetně DPH je orientační částka. Přesný rozsah a konečnou cenu včetně dopravy uvedeme v nabídce. Odesláním poptávky si akci závazně neobjednáváte."]
  ];
  return <section className={css.practical}><div className={css.wrap}><p className={css.label}>{en?"BEFORE YOU DECIDE":"NEŽ SE ROZHODNETE"}</p><h2>{en?"Everything starts with your community":"Všechno začíná u vaší obce nebo školy"}</h2><div className={css.faq}>{items.map(([title,text])=><details key={title}><summary>{title}</summary><p>{text}</p></details>)}</div></div></section>;
}

export default function ArchimedesDayCampaign({ variant="event" }) {
  const router = useRouter();
  const lang = router.query.lang === "en" ? "en" : "cz";
  const t = words[lang];
  const isEvent = variant === "event";
  const path = isEvent ? "/archimedes-day/den-generaci" : "/archimedes-day/pro-obce";
  const to = (p) => p + (lang === "en" ? "?lang=en" : "");
  const change = (l) => router.replace({pathname:router.pathname,query:l==="en"?{lang:"en"}:{}},undefined,{shallow:true,scroll:false});
  const pageTitle = isEvent?t.eventTitle:t.villageTitle;
  const lead = isEvent?t.eventIntro:t.villageIntro;
  const items = isEvent?t.stepsEvent:t.stepsVillage;
  return <>
    <Head>
      <title>{pageTitle} | ARCHIMEDES DAY</title>
      <meta name="description" content={lead}/>
      <link rel="canonical" href={"https://www.archimedeslive.com"+path+(lang==="en"?"?lang=en":"")}/>
      <link rel="alternate" hrefLang="cs" href={"https://www.archimedeslive.com"+path}/>
      <link rel="alternate" hrefLang="en" href={"https://www.archimedeslive.com"+path+"?lang=en"}/>
      <meta property="og:type" content="website"/>
      <meta property="og:title" content={pageTitle}/>
      <meta property="og:description" content={lead}/>
      <meta property="og:image" content={"https://www.archimedeslive.com"+photos+"ales1.jpg"}/>
      <meta name="twitter:card" content="summary_large_image"/>
    </Head>
    <main className={css.root}>
      <header className={css.header}>
        <div className={css.headerInner}>
          <Link className={css.logo} href={to("/archimedes-day")}>ARCHIMEDES <span>DAY</span></Link>
          <nav aria-label="ARCHIMEDES DAY">
            <Link href={to("/archimedes-day/den-generaci")}>{t.navOne}</Link>
            <Link href={to("/archimedes-day/pro-obce")}>{t.navTwo}</Link>
            <Link href={to("/archimedes-day")+"#gallery"}>{t.navThree}</Link>
          </nav>
          <div className={css.languages}><button className={lang==="cz"?css.selected:""} type="button" aria-pressed={lang==="cz"} onClick={()=>change("cz")}>CZ</button><button className={lang==="en"?css.selected:""} type="button" aria-pressed={lang==="en"} onClick={()=>change("en")}>EN</button></div>
        </div>
      </header>
      <section className={css.hero}>
        <div className={css.heroGrid}>
          <div className={css.heroContent}>
            <div className={css.eyebrow}>{isEvent?t.eventTag:t.villageTag}</div>
            <p className={css.kicker}>ARCHIMEDES DAY · {isEvent?t.navOne:t.navTwo}</p>
            <h1>{pageTitle}</h1>
            <p className={css.lead}><PlatformMention text={lead}/></p>
            <div className={css.actions}>
              {isEvent?<><a className={css.primary} href="#prenos">{t.eventPrimary} ↓</a><Link className={css.secondary} href={to("/archimedes-day/pro-obce")}>{t.eventSecondary}</Link></>:<><a className={css.primary} href="#poptavka">{t.villagePrimary} ↗</a><Link className={css.secondary} href={to("/archimedes-day/den-generaci")}>{t.villageSecondary}</Link></>}
            </div>
            {isEvent ? <p className={css.streamNote}>{t.eventNote}</p> : <p className={css.streamNote}>{lang==="en"?"Indicative price: CZK 19,500 incl. VAT. Final quote depends on location and travel.":"Orientační cena: 19 500 Kč vč. DPH. Konečnou cenu potvrdíme podle místa a dopravy."}</p>}
          </div>
          <figure className={css.heroPhoto}>
            <Image src={photos+"ales2.jpg"} alt={lang==="en"?"A pupil and Science ON experimenting together in Brno":"Žák a Science ON při společném pokusu v Brně"} fill sizes="(max-width: 800px) 100vw, 45vw" priority style={{objectFit:"cover",objectPosition:"center 43%"}}/>
            <figcaption><ScienceLogo/><div className={css.photoCredit}><strong>ARCHIMEDES DAY</strong><small>{lang==="en"?"Brno · June 2026":"BVV Brno · červen 2026"}</small></div></figcaption>
          </figure>
        </div>
      </section>
      <section className={css.facts}><div className={css.factsInner}>{(isEvent?t.infoEvent:t.infoVillage).map((v,i)=><div key={v}><small>0{i+1}</small><strong>{v}</strong></div>)}</div></section>
      {isEvent && <Participation lang={lang}/>}
      <section className={css.section}>
        <div className={css.wrap}>
          <p className={css.label}>ARCHIMEDES DAY × SCIENCE ON</p>
          <h2>{isEvent?t.secEvent:t.secVillage}</h2>
          <p className={css.intro}>{isEvent?t.secEventIntro:t.secVillageIntro}</p>
          <div className={[css.cards,!isEvent ? css.fourCards : ""].join(" ")}>{items.map(([n,h,d])=><article key={n}><span>{n}</span><h3>{h}</h3><p>{d}</p></article>)}</div>
        </div>
      </section>
      {!isEvent && <PracticalInfo lang={lang}/>}
      <section className={css.history}><div className={css.historyInner}>
        <div><p className={css.label}>{t.historyKicker}</p><h2>{t.historyTitle}</h2><p>{t.historyText}</p><Link href={to("/archimedes-day")+"#gallery"} className={css.textLink}>{t.historyLink} ↗</Link><div className={css.partner}><ScienceLogo/><span>{t.partner}</span></div></div>
        <div className={css.gallery}>
          <Image src={photos+"spolecna.jpg"} alt={t.imageThree} width={1000} height={700} sizes="(max-width: 800px) 100vw, 48vw"/>
          <Image src={photos+"zaci1.jpg"} alt={t.imageTwo} width={700} height={920} sizes="(max-width: 800px) 49vw, 24vw"/>
          <Image src={photos+"ales2.jpg"} alt={t.imageOne} width={700} height={920} sizes="(max-width: 800px) 49vw, 24vw"/>
          <small>{t.photoNote}</small>
        </div>
      </div></section>
      {!isEvent&&<section className={css.priceSection}><div className={css.priceInner}><div><p className={css.label}>{t.priceKicker}</p><p>{t.priceText}</p></div><div className={css.price}>{t.price}<span>{t.priceTax}</span></div></div></section>}
      <section id={isEvent ? undefined : "poptavka"} className={css.conversion}><div className={css.conversionInner}>
        <p className={css.label}>{lang==="en"?"GENERATIONS DAY IN YOUR COMMUNITY":"DEN GENERACÍ U VÁS"}</p>
        <h2>{isEvent?t.actionEventTitle:t.actionVillageTitle}</h2>
        <p>{isEvent?t.actionEventText:t.actionVillageText}</p>
        {isEvent?<Link className={css.primary} href={to("/archimedes-day/pro-obce")}>{t.actionEventLink} ↗</Link>:<InquiryForm lang={lang}/>}
        {isEvent && <small><a href={"mailto:"+email}>{email}</a></small>}
      </div></section>
      {isEvent && <section className="bg-slate-50 px-5 py-12"><div className="mx-auto max-w-[1000px]"><h2 className="text-2xl font-black text-navy-900">{lang === "en" ? "Regular programmes for your community?" : "Chcete pravidelný program i pro svou obec?"}</h2><p className="mt-3 leading-relaxed text-slate-700">{lang === "en" ? "Discover the separate ARCHIMEDES Live subscription for schools, clubs and seniors." : "ARCHIMEDES Live nabízí samostatné předplatné pravidelných pořadů pro školy, spolky a seniory."}</p><Link href="/obec" className="mt-4 inline-flex min-h-11 items-center font-bold text-brand underline">{lang === "en" ? "Explore the programme for municipalities →" : "Prohlédnout program pro obec →"}</Link></div></section>}
      <section className={css.future}><div className={css.wrap}><h2>{t.futureTitle}</h2><p>{t.futureText}</p><a href="https://www.archimedeslive.com/" className={css.textLink}>ARCHIMEDES Live ↗</a></div></section>
    </main>
    <Footer/>
  </>;
}
