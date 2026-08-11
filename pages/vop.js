import Link from "next/link";
import LegalPageLayout from "../components/LegalPageLayout";
import {
  LEGAL_DOCUMENT_EFFECTIVE_DATE_CS,
  LEGAL_DOCUMENT_VERSION,
} from "../lib/legalDocuments";

export default function VopPage() {
  return (
    <LegalPageLayout
      title="Všeobecné obchodní podmínky"
      description="Všeobecné obchodní podmínky programu ARCHIMEDES Live pro obce, školy, spolky a další právnické osoby."
      eyebrow="VOP"
      updatedAt={`Účinné od ${LEGAL_DOCUMENT_EFFECTIVE_DATE_CS} · verze ${LEGAL_DOCUMENT_VERSION}`}
    >
      <h2>1. Poskytovatel a působnost podmínek</h2>
      <p>
        Poskytovatelem programu ARCHIMEDES Live je <strong>EduVision s.r.o.</strong>,
        Purkyňova 649/127, Medlánky, 612 00 Brno, IČ: 17803039, DIČ:
        CZ17803039, zapsaná v obchodním rejstříku vedeném Krajským soudem v
        Brně, oddíl C, vložka 131579 (dále jen „poskytovatel“).
      </p>
      <p>
        Tyto podmínky se vztahují výhradně na smlouvy uzavírané s obcí, školou,
        spolkem nebo jinou právnickou osobou v souvislosti s její činností
        (dále jen „zákazník“). Program není prostřednictvím objednávkového
        formuláře nabízen spotřebitelům.
      </p>
      <p>
        Kontaktní e-mail poskytovatele je{" "}
        <a href="mailto:zive@archimedeslive.com">zive@archimedeslive.com</a>.
      </p>

      <h2>2. Program ARCHIMEDES Live</h2>
      <p>
        ARCHIMEDES Live je online vzdělávací a komunitní program poskytovaný
        prostřednictvím internetu. Podle aktuální nabídky a zaměření zákazníka
        může zahrnovat zejména živá vysílání, přístup k archivu, pracovní listy,
        doprovodné materiály, komunitní funkce a provozní podporu.
      </p>
      <p>
        Konkrétní varianta, datum zahájení, fakturační režim a případné odlišné
        součásti programu jsou uvedeny v písemném potvrzení objednávky. Toto
        potvrzení má v případě rozporu přednost před VOP.
      </p>
      <p>
        U obecního programu může poskytovatel po ověření propojit s licencí obce
        její místní školy, knihovny, spolky a další organizace. Každá propojená
        organizace zůstává samostatným subjektem s vlastními uživateli a daty.
        Propojením nevzniká organizaci právo převádět licenci na další osoby.
      </p>

      <h2>3. Objednávka a vznik smlouvy</h2>
      <p>
        Odesláním formuláře zákazník předkládá závaznou objednávku zvolené
        varianty programu a potvrzuje, že se před odesláním seznámil s těmito
        VOP a se smlouvou o zpracování osobních údajů (DPA).
      </p>
      <p>
        <strong>
          Smlouva vzniká až písemným přijetím objednávky poskytovatelem,
        </strong>{" "}
        které následuje po ověření zákazníka, fakturačních údajů a oprávnění
        kontaktní osoby jednat za zákazníka. Automatické potvrzení o přijetí
        formuláře není přijetím objednávky ani aktivací programu.
      </p>
      <p>
        Poskytovatel může před přijetím objednávky vyžádat doplnění údajů nebo
        doložení oprávnění kontaktní osoby. Objednávku může odmítnout, zejména
        pokud údaje nelze ověřit, objednávka odporuje účelu programu nebo
        technickým možnostem služby.
      </p>

      <h2>4. Cena, DPH a fakturace</h2>
      <p>
        Standardní cena jednoho programu činí <strong>1 990 Kč bez DPH za
        každý měsíc</strong>. K ceně se připočítává DPH v zákonné výši.
      </p>
      <p>
        Zákazník si může zvolit měsíční fakturaci, nebo úhradu celé ceny za
        dvanáct měsíců najednou. Volba měsíční fakturace nemění minimální dobu
        trvání smlouvy podle článku 5. Splatnost faktury je 14 dnů, není-li v
        potvrzení objednávky nebo na faktuře uvedena delší lhůta.
      </p>
      <p>
        Obec s realizovanou učebnou ARCHIMEDES může po ověření získat prvních
        dvanáct měsíců programu bez úhrady. Bezplatné období se automaticky
        nemění na placené. Pokračování vyžaduje novou písemnou dohodu.
      </p>

      <h2>5. Doba trvání</h2>
      <p>
        Placená smlouva se uzavírá na dobu určitou dvanácti měsíců ode dne
        zahájení programu uvedeného v potvrzení objednávky. Není-li datum
        uvedeno, začíná doba běžet dnem aktivace licence.
      </p>
      <p>
        Smlouva se po uplynutí sjednané doby <strong>automaticky
        neprodlužuje</strong>. Další období vyžaduje písemné potvrzení obou
        stran. Tím není dotčeno právo stran sjednat v individuální nabídce jiný
        režim.
      </p>

      <h2>6. Licence a pravidla užívání</h2>
      <p>
        Zákazník získává po dobu aktivní licence nevýhradní, nepřevoditelné a
        územně neomezené oprávnění užívat program pro vlastní nekomerční
        vzdělávací a komunitní činnost a pro oprávněné uživatele zapojené v
        rámci sjednaného programu.
      </p>
      <p>Zákazník ani uživatel zejména nesmí:</p>
      <ul>
        <li>sdílet přístupové údaje s neoprávněnými osobami,</li>
        <li>obcházet technická nebo přístupová omezení,</li>
        <li>
          bez písemného souhlasu kopírovat, veřejně šířit, prodávat nebo
          sublicencovat záznamy, pracovní listy a další obsah,
        </li>
        <li>
          používat program k protiprávnímu jednání nebo k zásahu do práv jiných
          osob.
        </li>
      </ul>

      <h2>7. Účty, správci a bezpečnost</h2>
      <p>
        Zákazník odpovídá za správnost údajů o svých uživatelích, určení
        vlastních správců, včasné odebrání přístupu osobám, které jej již
        nepotřebují, a ochranu přístupových údajů. Každý uživatel má používat
        vlastní účet.
      </p>
      <p>
        Zákazník oznámí poskytovateli bez zbytečného odkladu podezření na
        zneužití účtu nebo bezpečnostní incident. Poskytovatel může v naléhavém
        případě účet dočasně omezit, je-li to nezbytné k ochraně služby, dat
        nebo uživatelů.
      </p>

      <h2>8. Provoz a dostupnost</h2>
      <p>
        Poskytovatel usiluje o řádnou a bezpečnou dostupnost programu, nezaručuje
        však nepřetržitý provoz bez jednotlivých výpadků. Může provádět údržbu,
        bezpečnostní zásahy a přiměřené technické změny. Plánované zásahy s
        významným dopadem oznámí s přiměřeným předstihem, je-li to možné.
      </p>
      <p>
        Poskytovatel neodpovídá za připojení k internetu, zařízení nebo
        nastavení na straně zákazníka ani za výpadek nezávislé služby třetí
        strany, který nemohl rozumně ovlivnit. Poskytovatel však poskytne
        přiměřenou součinnost při řešení problému.
      </p>

      <h2>9. Programový a uživatelský obsah</h2>
      <p>
        Autorská a jiná práva k obsahu vytvořenému nebo licencovanému
        poskytovatelem zůstávají poskytovateli nebo příslušným autorům. Licence
        zákazníka je omezena na rozsah článku 6.
      </p>
      <p>
        Vloží-li zákazník nebo jeho uživatel do portálu vlastní text, fotografii,
        soubor nebo jiný obsah, zachovává si k němu svá práva a uděluje
        poskytovateli nevýhradní bezúplatné oprávnění obsah technicky ukládat,
        zobrazovat a zpracovat pouze v rozsahu nezbytném pro provoz programu.
        Zákazník odpovídá za to, že je k vložení obsahu oprávněn.
      </p>
      <p>
        Poskytovatel může po upozornění, a v naléhavém případě ihned, omezit
        obsah, který je zjevně protiprávní, ohrožuje bezpečnost nebo závažně
        porušuje účel a pravidla portálu. Zákazník může požádat o přezkoumání na
        kontaktním e-mailu.
      </p>

      <h2>10. Vysílání, záznamy a externí služby</h2>
      <p>
        Podrobnosti k pořizování a zpřístupnění záznamů stanoví{" "}
        <Link href="/pravidla-zaznamu">Pravidla záznamů</Link>. Zákazník
        odpovídá za to, že osoby, které sám aktivně zapojí obrazem nebo zvukem,
        byly řádně informovány a že pro jejich zapojení existuje odpovídající
        právní titul.
      </p>
      <p>
        Pro živá vysílání, hosting, databázi, e-mail a další provozní funkce
        mohou být použity služby třetích stran. Zpracování osobních údajů těmito
        dodavateli upravuje DPA a informace o zpracování osobních údajů.
      </p>

      <h2>11. Ochrana osobních údajů</h2>
      <p>
        Zpracování, při němž poskytovatel vystupuje jako zpracovatel jménem
        zákazníka, se řídí{" "}
        <Link href="/dpa">Smlouvou o zpracování osobních údajů (DPA)</Link>,
        která je součástí smlouvy. Zpracování, při němž poskytovatel vystupuje
        jako samostatný správce, popisují{" "}
        <Link href="/ochrana-osobnich-udaju">
          Informace o zpracování osobních údajů
        </Link>.
      </p>
      <p>
        Organizace propojená pod obecní licencí uzavírá DPA samostatně, pokud je
        ve vztahu ke svým uživatelům nebo dalším osobám samostatným správcem.
      </p>

      <h2>12. Prodlení a pozastavení služby</h2>
      <p>
        Je-li zákazník v prodlení s úhradou déle než 15 dnů, může poskytovatel
        po předchozí výzvě přiměřeně omezit přístup k placeným částem programu.
        Omezení nezbavuje zákazníka povinnosti uhradit cenu za sjednanou dobu.
        Přístup bude obnoven bez zbytečného odkladu po úhradě dlužné částky.
      </p>

      <h2>13. Předčasné ukončení</h2>
      <p>
        Každá strana může smlouvu písemně ukončit, poruší-li druhá strana
        podstatným způsobem své povinnosti a nezjedná nápravu ani do 15 dnů od
        doručení písemné výzvy. Lhůta se nevyžaduje, pokud náprava není možná,
        došlo k úmyslnému zneužití služby nebo závažnému bezpečnostnímu incidentu.
      </p>
      <p>
        Zákazník může smlouvu ukončit také tehdy, pokud nesouhlasí s oznámenou
        podstatnou změnou VOP nebo programu, a to nejpozději ke dni účinnosti
        změny. V takovém případě má nárok na poměrné vrácení předplacené ceny za
        nevyužité období.
      </p>

      <h2>14. Odpovědnost</h2>
      <p>
        Každá strana odpovídá za škodu způsobenou porušením svých smluvních nebo
        zákonných povinností. Poskytovatel neodpovídá za nepřímou újmu a ušlý
        zisk vzniklé v důsledku okolností mimo jeho rozumnou kontrolu.
      </p>
      <p>
        Žádné ustanovení těchto VOP nevylučuje ani neomezuje odpovědnost, kterou
        podle právních předpisů nelze předem vyloučit nebo omezit, zejména újmu
        způsobenou úmyslně nebo z hrubé nedbalosti a újmu na přirozených právech
        člověka.
      </p>

      <h2>15. Podpora a reklamace</h2>
      <p>
        Provozní požadavky, vady služby a reklamace lze oznámit na{" "}
        <a href="mailto:zive@archimedeslive.com">zive@archimedeslive.com</a>.
        Oznámení má obsahovat zákazníka, kontaktní osobu a popis problému.
        Poskytovatel potvrdí přijetí a vyřídí reklamaci bez zbytečného odkladu,
        nejpozději do 30 dnů, nebrání-li tomu mimořádná technická složitost.
      </p>

      <h2>16. Vyšší moc</h2>
      <p>
        Strana není v prodlení po dobu, kdy jí splnění povinnosti brání
        mimořádná, nepředvídatelná a nepřekonatelná překážka vzniklá nezávisle
        na její vůli. Dotčená strana druhou stranu bez zbytečného odkladu
        informuje a přijme přiměřená opatření ke zmírnění dopadů.
      </p>

      <h2>17. Změny podmínek</h2>
      <p>
        Poskytovatel může VOP přiměřeně změnit z důvodu změny právních předpisů,
        bezpečnosti, použité technologie nebo rozvoje programu. Podstatnou změnu
        oznámí zákazníkovi na evidovaný e-mail nejméně 30 dnů před účinností a
        popíše její povahu i právo zákazníka změnu odmítnout podle článku 13.
        Cena se během sjednané doby bez dohody stran nemění.
      </p>

      <h2>18. Komunikace, právo a závěrečná ustanovení</h2>
      <p>
        Smluvní komunikace může probíhat elektronicky na adresy uvedené v
        objednávce nebo v zákaznickém účtu. Zákazník oznámí změnu kontaktního
        e-mailu bez zbytečného odkladu.
      </p>
      <p>
        Smlouva se řídí právem České republiky. Strany se nejprve pokusí spor
        vyřešit dohodou; nedojde-li k ní, rozhodnou jej věcně a místně příslušné
        soudy České republiky.
      </p>
      <p>
        Je-li některé ustanovení neplatné nebo neúčinné, nemá to vliv na ostatní
        ustanovení. Nedílnou součástí smlouvy jsou potvrzená objednávka, tyto VOP
        a DPA. Aktuální i dřívější verze jsou evidovány poskytovatelem podle
        čísla verze.
      </p>
    </LegalPageLayout>
  );
}
