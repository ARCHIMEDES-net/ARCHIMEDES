import Head from "next/head";
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
    eventTag:"ČTVRTEK 5. LISTOPADU 2026 | 16:00 | RATÍŠKOVICE",
    villageTag:"ARCHIMEDES DAY LOCAL  |  PRO OBCE A MĚSTA",
    eventTitle:"Babi, dědo, pojďme objevovat!",
    villageTitle:"Věda, která spojí tři generace. Přímo u vás.",
    eventIntro:"V Ratíškovicích se u jednoho stolu potkají vnoučata a prarodiče. Science ON jim ukáže, jak snadno nás mohou oklamat vlastní smysly. Čeká je vědecká show KLAM i společné pokusy. Sledujte živě na ARCHIMEDES Live.",
    villageIntro:"Vyberete termín a místo. My se Science ON přivezeme vědeckou show a pokusy, při kterých se potkají děti, rodiče i prarodiče. Zábavný program, který má smysl pro celou obec.",
    eventPrimary:"Kde sledovat zdarma",
    eventSecondary:"Chci Den generací u nás",
    villagePrimary:"Nezávazně poptat termín",
    villageSecondary:"Podívat se na Den generací",
    eventNote:"Přímý odkaz na plánované bezplatné vysílání doplníme před akcí.",
    streamHeading:"Kde sledovat živé vysílání?",
    streamDetails:"5. listopadu od 16:00 plánujeme zpřístupnit speciální Den generací zdarma prostřednictvím ARCHIMEDES Live. Přímý odkaz na konkrétní vysílání doplníme sem ještě před akcí.",
    streamLink:"Prohlédnout kalendář vysílání",
    infoEvent:["5. listopadu 2026","Začátek v 16:00","Ratíškovice + online","Science ON: KLAM"],
    infoVillage:["45 minut show","60 minut pokusů","Až 150 účastníků","Termín dle dohody"],
    secEvent:"Babičky, dědečkové a vnoučata v jednom týmu",
    secVillage:"Vyberete místo a datum. O program se postaráme.",
    secEventIntro:"Nejen dívat se, ale zkusit něco společně. Vnoučata a prarodiče budou moci sdílet překvapení, vlastní objevy i společné zážitky.",
    secVillageIntro:"Program tvoří 45 minut živé show a 60 minut společných pokusů. Konkrétní podobu a kapacitu přizpůsobíme vašemu prostoru.",
    stepsEvent:[["01","Věříte vlastním očím?","Science ON představí show KLAM plnou překvapivých ukázek a smyslových klamů."],["02","Jeden pokus, dvě generace","Děti a prarodiče budou společně tipovat výsledky a zkoušet vybrané bezpečné aktivity."],["03","Z Ratíškovic až k vám","Program plánujeme vysílat živě, aby se mohly přidat další rodiny a obce."]],
    stepsVillage:[["01","Navrhnete termín","Řeknete nám, kdy chcete rodiny ve své obci pozvat."],["02","Vyberete místo","Kulturní dům, škola nebo jiný vhodný prostor."],["03","Dostanete konkrétní nabídku","Ověříme dostupnost Science ON, technické podmínky a dopravu."],["04","Společně přivítáme generace","My se postaráme o program, obec pozve své rodiny."]],
    historyKicker:"OHLÉDNUTÍ | BRNO | 19. ČERVNA 2026",
    historyTitle:"Z Brna do Ratíškovic. A dál do dalších obcí.",
    historyText:"První ARCHIMEDES DAY se uskutečnil v červnu 2026 na brněnském výstavišti. Science ON předvedlo vědecké pokusy, žáci se zapojili do programu a živý přenos propojil Brno s Museum Kotsanas v Řecku. Teď na tuto zkušenost navazujeme Dnem generací.",
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
    actionVillageText:"Pošlete nám název obce, navrhovaný termín a místo konání. Zuzana Novotná ověří možnosti a připraví nezávaznou nabídku.",
    actionVillageLink:"Požádat o nabídku",
    futureTitle:"Jeden den může být začátkem mnoha dalších objevů.",
    futureText:"ARCHIMEDES DAY propojuje místní setkání s živým vysíláním a vzdělávacím programem ARCHIMEDES Live. Chceme, aby školy, obce a rodiny mohly objevovat společně — nejen jeden den v roce.",
    partner:"Na programu spolupracujeme se Science ON",
    mailSubject:"ARCHIMEDES DAY – poptávka pro obec",
    mailBody:"Dobrý den,\nrádi bychom uspořádali ARCHIMEDES DAY – Den generací.\n\nObec:\nNavrhované datum:\nMísto konání:\nPředpokládaný počet účastníků:\nKontaktní osoba a telefon:\n"
  },
  en: {
    navOne:"Generations Day",navTwo:"For municipalities",navThree:"First edition",
    eventTag:"THURSDAY 5 NOVEMBER 2026 | 4:00 PM CET | RATÍŠKOVICE",
    villageTag:"ARCHIMEDES DAY LOCAL  |  FOR COMMUNITIES",
    eventTitle:"Grandma, Grandpa — let's discover together!",
    villageTitle:"Science brings three generations together. Right in your community.",
    eventIntro:"In Ratíškovice, grandparents and grandchildren will explore side by side. Science ON will show how easily our senses can fool us in its KLAM science show, followed by shared experiments. Join the live broadcast on ARCHIMEDES Live.",
    villageIntro:"Choose a date and venue. Together with Science ON, we'll bring a science show and hands-on experiments that children, parents and grandparents can all enjoy. A meaningful day for your community.",
    eventPrimary:"How to watch for free",
    eventSecondary:"Bring Generations Day to my town",
    villagePrimary:"Request a date",
    villageSecondary:"Explore Generations Day",
    eventNote:"The direct link to the planned free livestream will appear here before the event.",
    streamHeading:"Where can I watch live?",
    streamDetails:"A free ARCHIMEDES Live broadcast of Generations Day is planned for 5 November at 4:00 pm CET. The direct event link will be added here before the broadcast.",
    streamLink:"Browse the broadcast calendar",
    infoEvent:["5 November 2026","Starts at 16:00 CET","Ratíškovice + online","Science ON: KLAM"],
    infoVillage:["45-minute show","60 minutes of experiments","Up to 150 participants","Date by agreement"],
    secEvent:"Grandparents and grandchildren. One team.",
    secVillage:"Choose the date and venue. We'll take care of the programme.",
    secEventIntro:"More than watching a show: grandparents and grandchildren can share surprises, make discoveries and enjoy the experience together.",
    secVillageIntro:"The programme combines a 45-minute science show and 60 minutes of hands-on experiments. We'll adapt the format and capacity to your venue.",
    stepsEvent:[["01","Can you trust your eyes?","Science ON's KLAM show is packed with surprising demonstrations and sensory illusions."],["02","One experiment, two generations","Children and grandparents will predict results and try selected safe activities together."],["03","From Ratíškovice to you","We plan to broadcast the programme live so families and communities can join remotely."]],
    stepsVillage:[["01","Suggest a date","Tell us when you'd like to invite families in your community."],["02","Choose a venue","A community hall, school or another suitable space."],["03","Receive a tailored offer","We check Science ON's availability, technical needs and travel costs."],["04","Bring generations together","We deliver the programme while you invite local families."]],
    historyKicker:"LOOKING BACK | BRNO | 19 JUNE 2026",
    historyTitle:"From Brno to Ratíškovice — and beyond.",
    historyText:"The first ARCHIMEDES DAY took place at Brno Exhibition Centre in June 2026. Science ON presented live experiments, pupils joined the programme, and a live link connected Brno with the Kotsanas Museum in Greece. Generations Day builds on that experience.",
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
    actionVillageText:"Send us your town, preferred date and venue. Zuzana Novotná will check availability and prepare a no-obligation offer.",
    actionVillageLink:"Request an offer",
    futureTitle:"One event can spark many more discoveries.",
    futureText:"ARCHIMEDES DAY connects local events with live broadcasts and the year-round ARCHIMEDES Live programme. Our goal is to help schools, communities and families discover together throughout the year.",
    partner:"Programme developed in collaboration with Science ON",
    mailSubject:"ARCHIMEDES DAY – community enquiry",
    mailBody:"Hello,\nWe would like to organise ARCHIMEDES DAY – Generations Day.\n\nMunicipality:\nPreferred date:\nVenue:\nApproximate number of participants:\nContact person and phone:\n"
  }
};
export default function ArchimedesDayCampaign({ variant="event" }) {
  const router = useRouter();
  const lang = router.query.lang === "en" ? "en" : "cz";
  const t = words[lang];
  const isEvent = variant === "event";
  const path = isEvent ? "/archimedes-day/den-generaci" : "/archimedes-day/pro-obce";
  const to = (p) => p + (lang === "en" ? "?lang=en" : "");
  const change = (l) => router.replace({pathname:router.pathname,query:l==="en"?{lang:"en"}:{}},undefined,{shallow:true,scroll:false});
  const hrefMail = "mailto:"+email+"?subject="+encodeURIComponent(t.mailSubject)+"&body="+encodeURIComponent(t.mailBody);
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
            <Link href={to("/archimedes-day")}>{t.navThree}</Link>
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
            <p className={css.lead}>{lead}</p>
            <div className={css.actions}>
              {isEvent?<><a className={css.primary} href="#prenos">{t.eventPrimary} ↓</a><Link className={css.secondary} href={to("/archimedes-day/pro-obce")}>{t.eventSecondary}</Link></>:<><a className={css.primary} href={hrefMail}>{t.villagePrimary} ↗</a><Link className={css.secondary} href={to("/archimedes-day/den-generaci")}>{t.villageSecondary}</Link></>}
            </div>
            {isEvent ? <p className={css.streamNote}>{t.eventNote}</p> : <p className={css.streamNote}>{lang==="en"?"Indicative price: CZK 19,500 incl. VAT. Final quote depends on location and travel.":"Orientační cena: 19 500 Kč vč. DPH. Konečnou cenu potvrdíme podle místa a dopravy."}</p>}
          </div>
          <figure className={css.heroPhoto}>
            <Image src={photos+"ales1.jpg"} alt={t.imageOne} fill sizes="(max-width: 800px) 100vw, 45vw" priority style={{objectFit:"cover",objectPosition:"center top"}}/>
            <figcaption><Image src="/partners/science-on.png" alt="Science ON" width={116} height={66} style={{objectFit:"contain"}}/><div className={css.photoCredit}><strong>ARCHIMEDES DAY</strong><small>{lang==="en"?"Brno · June 2026":"BVV Brno · červen 2026"}</small></div></figcaption>
          </figure>
        </div>
      </section>
      <section className={css.facts}><div className={css.factsInner}>{(isEvent?t.infoEvent:t.infoVillage).map((v,i)=><div key={v}><small>0{i+1}</small><strong>{v}</strong></div>)}</div></section>
      {isEvent && <section id="prenos" className={css.broadcast}><div className={css.wrap}><p className={css.label}>ARCHIMEDES LIVE · 5. 11. 2026</p><h2>{t.streamHeading}</h2><p>{t.streamDetails}</p><Link href="/kalendar" className={css.broadcastLink}>{t.streamLink} ↗</Link></div></section>}
      <section className={css.section}>
        <div className={css.wrap}>
          <p className={css.label}>ARCHIMEDES DAY × SCIENCE ON</p>
          <h2>{isEvent?t.secEvent:t.secVillage}</h2>
          <p className={css.intro}>{isEvent?t.secEventIntro:t.secVillageIntro}</p>
          <div className={css.cards}>{items.map(([n,h,d])=><article key={n}><span>{n}</span><h3>{h}</h3><p>{d}</p></article>)}</div>
        </div>
      </section>
      <section className={css.history}><div className={css.historyInner}>
        <div><p className={css.label}>{t.historyKicker}</p><h2>{t.historyTitle}</h2><p>{t.historyText}</p><Link href={to("/archimedes-day")} className={css.textLink}>{t.historyLink} ↗</Link><div className={css.partner}><Image src="/partners/science-on.png" width={104} height={60} alt="Science ON" style={{objectFit:"contain"}}/><span>{t.partner}</span></div></div>
        <div className={css.gallery}>
          <Image src={photos+"spolecna.jpg"} alt={t.imageThree} width={1000} height={700} sizes="(max-width: 800px) 100vw, 48vw"/>
          <Image src={photos+"zaci1.jpg"} alt={t.imageTwo} width={700} height={920} sizes="(max-width: 800px) 49vw, 24vw"/>
          <Image src={photos+"ales2.jpg"} alt={t.imageOne} width={700} height={920} sizes="(max-width: 800px) 49vw, 24vw"/>
          <small>{t.photoNote}</small>
        </div>
      </div></section>
      {!isEvent&&<section className={css.priceSection}><div className={css.priceInner}><div><p className={css.label}>{t.priceKicker}</p><p>{t.priceText}</p></div><div className={css.price}>{t.price}<span>{t.priceTax}</span></div></div></section>}
      <section className={css.conversion}><div className={css.conversionInner}>
        <p className={css.label}>ARCHIMEDES DAY LOCAL</p>
        <h2>{isEvent?t.actionEventTitle:t.actionVillageTitle}</h2>
        <p>{isEvent?t.actionEventText:t.actionVillageText}</p>
        {isEvent?<Link className={css.primary} href={to("/archimedes-day/pro-obce")}>{t.actionEventLink} ↗</Link>:<a className={css.primary} href={hrefMail}>{t.actionVillageLink} ↗</a>}
        <small>{email}</small>
      </div></section>
      <section className={css.future}><div className={css.wrap}><h2>{t.futureTitle}</h2><p>{t.futureText}</p><a href="https://www.archimedeslive.com/" className={css.textLink}>ARCHIMEDES Live ↗</a></div></section>
    </main>
    <Footer/>
  </>;
}
