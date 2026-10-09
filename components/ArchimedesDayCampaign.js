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
    navOne:"Den generací",navTwo:"Pro starosty",navThree:"První ročník",
    eventTag:"5. LISTOPADU 2026  |  16:00  |  RATÍŠKOVICE",
    villageTag:"ARCHIMEDES DAY LOCAL  |  PRO OBCE A MĚSTA",
    eventTitle:"Babi, dědo, pojďme objevovat!",
    villageTitle:"Den, který spojí generace ve vaší obci.",
    eventIntro:"Vnoučata, babičky a dědečkové u jednoho stolu. Science ON přijede do učebny ARCHIMEDES v Ratíškovicích s vědeckou show KLAM a společným objevováním. Buďte s námi živě.",
    villageIntro:"Přivezeme do vaší obce show Science ON a společné pokusy pro děti, rodiče i prarodiče. Vy určíte termín a místo. My připravíme program a postaráme se o realizaci.",
    eventPrimary:"Přejít na ARCHIMEDES Live",
    eventSecondary:"Chci Den generací v obci",
    villagePrimary:"Nezávazně poptat termín",
    villageSecondary:"Podívat se na listopadový pilot",
    eventNote:"Plánované vysílání zdarma. Přímý odkaz na tento pořad zveřejníme před akcí.",
    infoEvent:["5. listopadu 2026","Začátek v 16:00","Ratíškovice + online","Science ON: KLAM"],
    infoVillage:["45 minut show","60 minut pokusů","Až 150 účastníků","Termín dle dohody"],
    secEvent:"Věda, která spojuje generace",
    secVillage:"Jak to funguje?",
    secEventIntro:"Když se děti a prarodiče společně ptají, odhadují a zkoušejí nové věci, vzniká zážitek, na který se nezapomíná.",
    secVillageIntro:"Organizace je jednoduchá. Stačí navrhnout datum a místo – konkrétní podobu akce společně doladíme.",
    stepsEvent:[["01","Živá show KLAM","Science ON ukáže, proč vlastním smyslům nelze vždy věřit."],["02","Společné experimenty","Děti a senioři budou společně objevovat a zkoušet vybrané bezpečné aktivity."],["03","Přenos do dalších obcí","Program bude možné sledovat na platformě ARCHIMEDES Live."]],
    stepsVillage:[["01","Vyberete termín","Sdělíte nám datum, které vaší obci vyhovuje."],["02","Vyberete místo","Kulturní dům, škola, komunitní centrum nebo jiný vhodný prostor."],["03","Potvrdíme nabídku","Prověříme dostupnost Science ON, dopravu i požadavky místa."],["04","Přijedeme za vámi","Společně uspořádáme nezapomenutelný Den generací."]],
    historyKicker:"PRVNÍ ROČNÍK  |  BVV BRNO  |  19. 6. 2026",
    historyTitle:"Skutečná akce. Skutečné fotografie.",
    historyText:"ARCHIMEDES DAY odstartoval v červnu 2026 v Brně. Součástí byly živé pokusy Science ON, program pro školy a propojení s Museum Kotsanas v Řecku.",
    historyLink:"Prohlédnout celý první ročník",
    photoNote:"Fotografie pocházejí z červnového ARCHIMEDES DAY 2026, nikoliv z dosud připravované listopadové akce.",
    imageOne:"Science ON během živého pokusu v Brně",
    imageTwo:"Žáci při programu ARCHIMEDES DAY",
    imageThree:"Hosté prvního ARCHIMEDES DAY na BVV",
    priceKicker:"ORIENTAČNÍ CENA PROGRAMU",
    price:"19 500 Kč",
    priceTax:"včetně DPH",
    priceText:"Finální cenu ověříme podle místa konání, dopravy a konkrétní organizace akce. Cena je orientační, poptávka nezávazná.",
    actionEventTitle:"Chcete takový den ve své obci?",
    actionEventText:"ARCHIMEDES DAY – Den generací může přijet i k vám. Nabízíme připravený program pro obce, školy, seniorkluby i komunitní centra.",
    actionEventLink:"Zjistit nabídku pro obce",
    actionVillageTitle:"Vyberte si termín. Zbytek společně připravíme.",
    actionVillageText:"Napište nám název obce, termín, místo a přibližný počet účastníků. Zuzana Novotná vám připraví konkrétní nabídku.",
    actionVillageLink:"Poptat ARCHIMEDES DAY",
    futureTitle:"Jeden projekt. Mnoho míst. Společné objevování.",
    futureText:"ARCHIMEDES DAY propojuje školy, obce a generace prostřednictvím zážitků, vzdělávacích soutěží a živých vysílání ARCHIMEDES Live. Každý rok směřujeme k většímu zapojení komunit i partnerských institucí.",
    partner:"Vědecký program ve spolupráci se Science ON",
    mailSubject:"ARCHIMEDES DAY – poptávka pro obec",
    mailBody:"Dobrý den,\nrádi bychom uspořádali ARCHIMEDES DAY – Den generací.\n\nObec:\nNavrhované datum:\nMísto konání:\nPředpokládaný počet účastníků:\nKontaktní osoba a telefon:\n"
  },
  en: {
    navOne:"Generations Day",navTwo:"For municipalities",navThree:"First edition",
    eventTag:"5 NOVEMBER 2026  |  16:00 CET  |  RATÍŠKOVICE",
    villageTag:"ARCHIMEDES DAY LOCAL  |  FOR COMMUNITIES",
    eventTitle:"Grandma, Grandpa, let's discover together!",
    villageTitle:"A day that connects generations in your community.",
    eventIntro:"Grandchildren and grandparents discover side by side. Science ON will join us at the ARCHIMEDES classroom in Ratíškovice with the KLAM science show and hands-on exploration. Join us live.",
    villageIntro:"We bring a Science ON show and hands-on experiments for children, parents and grandparents to your town. You choose the date and venue. We help deliver the programme.",
    eventPrimary:"Visit ARCHIMEDES Live",
    eventSecondary:"Bring Generations Day to my town",
    villagePrimary:"Request a date",
    villageSecondary:"Explore the November pilot event",
    eventNote:"A free livestream is planned. The direct event link will be published before the broadcast.",
    infoEvent:["5 November 2026","Starts at 16:00 CET","Ratíškovice + online","Science ON: KLAM"],
    infoVillage:["45-minute show","60 minutes of experiments","Up to 150 participants","Date by agreement"],
    secEvent:"Science that brings generations together",
    secVillage:"How does it work?",
    secEventIntro:"When children and grandparents ask questions, make predictions and explore together, they create an experience worth remembering.",
    secVillageIntro:"Organising is simple. Suggest a date and venue, and we will work with you to finalise the event.",
    stepsEvent:[["01","Live KLAM science show","Science ON explores why we cannot always trust our senses."],["02","Hands-on discovery","Children and grandparents can discover and try selected safe activities together."],["03","Connect from anywhere","The programme will be available live through ARCHIMEDES Live."]],
    stepsVillage:[["01","Choose a date","Suggest the day that works best for your community."],["02","Choose a venue","A community hall, school or another suitable space."],["03","Confirm the details","We check Science ON availability, travel and technical needs."],["04","Enjoy the day","Together we create a memorable Generations Day."]],
    historyKicker:"FIRST EDITION  |  BRNO  |  19 JUNE 2026",
    historyTitle:"A real event. Real photographs.",
    historyText:"ARCHIMEDES DAY launched in Brno in June 2026, featuring live Science ON experiments, a school programme and a connection to Museum Kotsanas in Greece.",
    historyLink:"Explore the first edition",
    photoNote:"These photographs are from the June 2026 ARCHIMEDES DAY, not the upcoming November event.",
    imageOne:"Science ON performing a live experiment in Brno",
    imageTwo:"Schoolchildren at ARCHIMEDES DAY",
    imageThree:"Guests of the first ARCHIMEDES DAY",
    priceKicker:"INDICATIVE PROGRAMME PRICE",
    price:"CZK 19,500",
    priceTax:"VAT included",
    priceText:"We confirm final pricing based on travel, the venue and the event requirements. This price is indicative and enquiries are non-binding.",
    actionEventTitle:"Would you like this day in your town?",
    actionEventText:"ARCHIMEDES DAY – Generations Day can come to your community, school, seniors' club or community centre.",
    actionEventLink:"View the community offer",
    actionVillageTitle:"Choose a date. We'll help with the rest.",
    actionVillageText:"Send us your town, preferred date, venue and approximate number of participants. Zuzana Novotná will prepare a tailored offer.",
    actionVillageLink:"Enquire about ARCHIMEDES DAY",
    futureTitle:"One project. Many places. Discovering together.",
    futureText:"ARCHIMEDES DAY connects schools, municipalities and generations through shared experiences, educational challenges and ARCHIMEDES Live broadcasts. We aim to involve more communities and partners each year.",
    partner:"Science programme in collaboration with Science ON",
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
          <div className={css.languages}><button className={lang==="cz"?css.selected:""} onClick={()=>change("cz")}>CZ</button><button className={lang==="en"?css.selected:""} onClick={()=>change("en")}>EN</button></div>
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
              {isEvent?<><a className={css.primary} href="https://www.archimedeslive.com/">{t.eventPrimary} ↗</a><Link className={css.secondary} href={to("/archimedes-day/pro-obce")}>{t.eventSecondary}</Link></>:<><a className={css.primary} href={hrefMail}>{t.villagePrimary} ↗</a><Link className={css.secondary} href={to("/archimedes-day/den-generaci")}>{t.villageSecondary}</Link></>}
            </div>
            {isEvent&&<p className={css.streamNote}>{t.eventNote}</p>}
          </div>
          <figure className={css.heroPhoto}>
            <Image src={photos+"ales1.jpg"} alt={t.imageOne} fill sizes="(max-width: 800px) 100vw, 45vw" priority style={{objectFit:"cover"}}/>
            <figcaption>SCIENCE <strong>ON</strong><small>× ARCHIMEDES DAY</small></figcaption>
          </figure>
        </div>
      </section>
      <section className={css.facts}><div className={css.factsInner}>{(isEvent?t.infoEvent:t.infoVillage).map((v,i)=><div key={v}><small>0{i+1}</small><strong>{v}</strong></div>)}</div></section>
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
