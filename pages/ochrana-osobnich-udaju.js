import Link from "next/link";
import LegalPageLayout from "../components/LegalPageLayout";
import {
  LEGAL_DOCUMENT_EFFECTIVE_DATE_CS,
  LEGAL_DOCUMENT_VERSION,
} from "../lib/legalDocuments";
const ANALYTICS_CONSENT_KEY = "archimedes-analytics-consent";

export default function PrivacyPage() {
  function reopenAnalyticsSettings() {
    window.localStorage.removeItem(ANALYTICS_CONSENT_KEY);
    window.location.reload();
  }

  return (
    <LegalPageLayout
      title="Informace o zpracování osobních údajů"
      description="Informace o zpracování osobních údajů společností EduVision s.r.o. v souvislosti s webem a programem ARCHIMEDES Live."
      eyebrow="Ochrana osobních údajů"
      updatedAt={`Aktualizováno ${LEGAL_DOCUMENT_EFFECTIVE_DATE_CS} · verze ${LEGAL_DOCUMENT_VERSION}`}
    >
      <h2>1. Správce a kontakt</h2>
      <p>
        Správcem osobních údajů v rozsahu popsaném v tomto dokumentu je{" "}
        <strong>EduVision s.r.o.</strong>, Purkyňova 649/127, Medlánky, 612 00
        Brno, IČ: 17803039, DIČ: CZ17803039 (dále jen „EduVision“).
      </p>
      <p>
        Dotazy a žádosti lze zaslat na{" "}
        <a href="mailto:zive@archimedeslive.com">zive@archimedeslive.com</a>{" "}
        nebo na adresu sídla. Kontaktní údaje jsou určeny také pro uplatnění
        práv subjektů údajů.
      </p>

      <h2>2. Kdy je EduVision správcem a kdy zpracovatelem</h2>
      <p>
        EduVision je samostatným správcem zejména u údajů obchodních kontaktů,
        objednávek, fakturace, zákaznické komunikace, provozní bezpečnosti,
        vlastních hostů a lektorů a návštěvnosti veřejného webu.
      </p>
      <p>
        Pokud EduVision provozuje účty, organizace, přenos nebo archiv jménem
        obce, školy či spolku, může být v tomto rozsahu zpracovatelem a příslušná
        organizace správcem. Takové zpracování upravuje samostatná{" "}
        <Link href="/dpa">DPA</Link>. Organizace pod obecní licencí může být
        samostatným správcem, i když program hradí obec.
      </p>

      <h2>3. Objednávky, smlouvy a obchodní komunikace</h2>
      <p>Zpracováváme zejména:</p>
      <ul>
        <li>
          jméno, příjmení, funkci, organizaci, adresu, IČO a fakturační údaje,
        </li>
        <li>e-mail, telefon a obsah komunikace,</li>
        <li>
          zvolenou variantu, čas a verzi přijatých smluvních dokumentů a údaje o
          průběhu smlouvy.
        </li>
      </ul>
      <p>
        Účelem je jednání o smlouvě, ověření oprávnění kontaktní osoby, uzavření
        a plnění smlouvy, fakturace, zákaznická podpora a ochrana právních
        nároků. Právním základem je čl. 6 odst. 1 písm. b) GDPR, je-li fyzická
        osoba smluvní stranou, a jinak oprávněný zájem podle písm. f) na jednání
        s pověřenými zástupci zákazníka. Účetní a daňové údaje zpracováváme také
        podle písm. c) pro splnění zákonných povinností.
      </p>
      <p>
        Neuzavřenou poptávku a běžnou obchodní komunikaci uchováváme zpravidla
        nejdéle 3 roky od posledního jednání. Smluvní dokumentaci uchováváme po
        dobu smlouvy a zpravidla 10 let po jejím skončení kvůli právním nárokům.
        Účetní a daňové doklady uchováváme po dobu stanovenou právními předpisy,
        obvykle 10 let.
      </p>

      <h2>4. Účty a provoz programu</h2>
      <p>
        U správy vlastních provozních vztahů můžeme zpracovávat identifikační a
        kontaktní údaje, údaje o účtu, organizaci, roli, členství, přihlášení,
        nastavení, komunikaci s podporou a nezbytné technické logy. Účelem je
        poskytnutí programu, správa oprávnění, zabezpečení, předcházení zneužití
        a řešení incidentů.
      </p>
      <p>
        Právním základem je plnění smlouvy nebo oprávněný zájem EduVision a
        zákazníka na bezpečném provozu služby. Údaje účtu uchováváme po dobu
        aktivního vztahu a následně po omezenou dobu potřebnou k vypořádání a
        ochraně práv. Běžné provozní logy jsou uchovávány podle typu a
        bezpečnostního významu zpravidla nejvýše 12 měsíců; údaje související s
        incidentem mohou být uchovány po dobu jeho řešení a navazujících nároků.
      </p>

      <h2>5. Vysílání a záznamy</h2>
      <p>
        U hostů, lektorů, moderátorů a dalších osob aktivně zapojených do
        vysílání můžeme zpracovávat jméno, profesní údaje, podobiznu, hlas,
        audiovizuální záznam a související komunikaci. Konkrétní účel, právní
        titul, licence a doba použití se určují podle role osoby, smlouvy,
        oprávněného zájmu nebo souhlasu, je-li potřebný.
      </p>
      <p>
        U osob zapojených zákazníkem může EduVision vystupovat pouze jako
        zpracovatel. Podrobnosti stanoví DPA a{" "}
        <Link href="/pravidla-zaznamu">Pravidla záznamů</Link>.
      </p>

      <h2>6. Veřejný web, technické údaje a analytika</h2>
      <p>
        Při návštěvě webu se nezbytně zpracovávají technické údaje potřebné k
        doručení a zabezpečení stránky, například IP adresa, čas požadavku,
        požadovaná adresa, typ zařízení a základní informace o prohlížeči.
        Právním základem je oprávněný zájem na bezpečném a funkčním provozu.
      </p>
      <p>
        Web používá <strong>Vercel Web Analytics</strong>, která podle
        poskytovatele nepoužívá cookies a ukládá anonymizovaná data návštěvnosti.
        Slouží k základnímu měření výkonu webu na základě oprávněného zájmu.
      </p>
      <p>
        Google Tag Manager slouží jako technická vrstva pro správu značek.
        Výchozí stav úložišť Google je nastaven na „denied“. Google Analytics 4
        se pro analytické měření aktivuje až po výslovném souhlasu. Při souhlasu
        mohou být zpracovávány údaje o zařízení, navštívených stránkách, zdroji
        návštěvy a interakcích. Analytická data jsou v Google Analytics
        nastavena k uchování nejdéle 14 měsíců, není-li dříve vymazána.
      </p>
      <p>
        Souhlas je dobrovolný, jeho odmítnutí neomezuje základní funkce a lze jej
        kdykoli změnit. Odvolání nemá vliv na zákonnost předchozího zpracování.
      </p>
      <p>
        <button
          type="button"
          onClick={reopenAnalyticsSettings}
          style={{
            border: "1px solid #cbd5e1",
            borderRadius: "10px",
            background: "#ffffff",
            color: "#0f172a",
            padding: "10px 14px",
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          Změnit nastavení analytiky
        </button>
      </p>
      <p>
        Marketingové a reklamní technologie, včetně Meta Pixelu, nejsou v
        současnosti bez samostatného marketingového souhlasu aktivovány.
      </p>

      <h2>7. Příjemci a dodavatelé</h2>
      <p>
        Podle účelu mohou být údaje zpřístupněny pověřeným pracovníkům
        EduVision, zákazníkovi, jeho oprávněným správcům, účetním a právním
        poradcům, orgánům veřejné moci při splnění zákonné povinnosti a těmto
        hlavním technickým dodavatelům:
      </p>
      <ul>
        <li>Supabase – databáze, autentizace a úložiště,</li>
        <li>Vercel – hosting, serverové funkce a webová analytika,</li>
        <li>Ag Art cz s.r.o. / WebMeeting.cz – realizace online vysílání,</li>
        <li>Web4U s.r.o. – e-mailová infrastruktura,</li>
        <li>
          Google Ireland Limited a její smluvní dodavatelé – pouze při použití
          Google Analytics po udělení souhlasu.
        </li>
      </ul>

      <h2>8. Předávání mimo Evropský hospodářský prostor</h2>
      <p>
        Hlavní databáze programu je provozována v regionu Evropské unie.
        Vercel, Supabase, Google nebo jejich subdodavatelé však mohou omezené
        údaje zpracovávat i mimo EHP, zejména v USA. Předání probíhá pouze při
        splnění podmínek kapitoly V GDPR, zejména na základě rozhodnutí o
        odpovídající ochraně nebo standardních smluvních doložek Evropské
        komise a odpovídajících doplňkových opatření.
      </p>
      <p>
        Informaci o konkrétních zárukách nebo možnosti získat jejich kopii lze
        vyžádat na kontaktním e-mailu.
      </p>

      <h2>9. Odkud údaje získáváme a zda jsou povinné</h2>
      <p>
        Údaje získáváme přímo od dotčené osoby, od zákazníka nebo jeho správce,
        z veřejných rejstříků při ověřování organizace a automaticky při
        používání webu a programu. Kontaktní osoba zákazníka odpovídá za to, že
        je oprávněna předat údaje dalších osob a že je o tom informovala.
      </p>
      <p>
        Údaje označené ve formuláři jako povinné jsou nezbytné k vyřízení
        objednávky nebo poskytnutí příslušné funkce. Bez nich nelze objednávku
        ověřit nebo službu bezpečně provozovat. Analytický souhlas a údaje
        označené jako volitelné nejsou povinné.
      </p>

      <h2>10. Práva fyzických osob</h2>
      <p>Za podmínek GDPR má subjekt údajů právo:</p>
      <ul>
        <li>získat potvrzení a přístup ke svým údajům,</li>
        <li>požadovat opravu, výmaz nebo omezení zpracování,</li>
        <li>vznést námitku proti zpracování založenému na oprávněném zájmu,</li>
        <li>získat údaje v přenositelném formátu, je-li právo použitelné,</li>
        <li>kdykoli odvolat souhlas, je-li zpracování založeno na souhlasu,</li>
        <li>
          podat stížnost u Úřadu pro ochranu osobních údajů, Pplk. Sochora
          27, 170 00 Praha 7, <a href="https://uoou.gov.cz">uoou.gov.cz</a>.
        </li>
      </ul>
      <p>
        Pokud EduVision zpracovává údaje pouze jménem zákazníka, předá žádost
        příslušnému zákazníkovi jako správci a poskytne mu potřebnou součinnost.
      </p>

      <h2>11. Automatizované rozhodování</h2>
      <p>
        EduVision neprovádí rozhodování založené výhradně na automatizovaném
        zpracování, které by pro fyzickou osobu mělo právní nebo obdobně závažné
        účinky. Bezpečnostní filtry a omezení četnosti požadavků mohou
        automaticky dočasně zablokovat podezřelý technický požadavek; dotčená
        osoba může požádat o lidské přezkoumání.
      </p>

      <h2>12. Změny těchto informací</h2>
      <p>
        Dokument průběžně aktualizujeme podle změn služby a právních požadavků.
        Podstatné změny týkající se registrovaných uživatelů oznámíme vhodným
        způsobem. V záhlaví je vždy uvedeno datum a číslo aktuální verze.
      </p>
    </LegalPageLayout>
  );
}
