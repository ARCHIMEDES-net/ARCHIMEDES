import LegalPageLayout from "../components/LegalPageLayout";
import {
  LEGAL_DOCUMENT_EFFECTIVE_DATE_CS,
  LEGAL_DOCUMENT_VERSION,
} from "../lib/legalDocuments";

export default function DpaPage() {
  return (
    <LegalPageLayout
      title="Smlouva o zpracování osobních údajů (DPA)"
      description="Závazné podmínky zpracování osobních údajů při využívání programu ARCHIMEDES Live."
      eyebrow="DPA"
      updatedAt={`Účinná od ${LEGAL_DOCUMENT_EFFECTIVE_DATE_CS} · verze ${LEGAL_DOCUMENT_VERSION}`}
    >
      <h2>1. Smluvní strany a závaznost</h2>
      <p>
        Tato smlouva o zpracování osobních údajů (dále jen „DPA“) se uzavírá
        mezi zákazníkem označeným v potvrzení objednávky jako správcem osobních
        údajů (dále jen „správce“) a společností <strong>EduVision s.r.o.</strong>,
        Purkyňova 649/127, Medlánky, 612 00 Brno, IČ: 17803039, jako
        zpracovatelem (dále jen „zpracovatel“).
      </p>
      <p>
        DPA je součástí smlouvy o poskytování programu ARCHIMEDES Live a je
        uzavřena písemně v elektronické podobě okamžikem, kdy poskytovatel
        písemně přijme objednávku odkazující na tuto konkrétní verzi DPA.
        Použije se pouze v rozsahu, v němž zpracovatel zpracovává osobní údaje
        jménem správce.
      </p>
      <p>
        Škola, spolek nebo jiná organizace propojená pod licencí obce je
        samostatným správcem, pokud sama určuje účely a prostředky zpracování
        údajů svých uživatelů, žáků, zaměstnanců nebo členů. V takovém případě
        přijímá DPA samostatně, i když cenu programu hradí obec.
      </p>

      <h2>2. Předmět, povaha, účel a doba zpracování</h2>
      <p>
        Předmětem je zpracování osobních údajů nezbytné pro provoz účtů a
        organizací, řízení přístupových oprávnění, realizaci živých vysílání,
        evidenci účasti, provoz archivu, ukládání zákaznického obsahu, technickou
        podporu, zabezpečení a obnovu služby.
      </p>
      <p>
        Zpracování může zahrnovat shromáždění, zaznamenání, uspořádání, uložení,
        vyhledání, zpřístupnění oprávněným uživatelům, omezení a výmaz. Probíhá
        po dobu účinnosti smlouvy a následně do vrácení nebo výmazu údajů podle
        článku 13.
      </p>

      <h2>3. Subjekty údajů a typy osobních údajů</h2>
      <p>Subjekty údajů mohou být zejména:</p>
      <ul>
        <li>žáci, studenti a jejich zákonní zástupci,</li>
        <li>pedagogičtí pracovníci a zaměstnanci správce,</li>
        <li>členové spolků, komunit a dalších organizací,</li>
        <li>hosté, lektoři, moderátoři a účastníci vysílání,</li>
        <li>správci účtů a další oprávnění uživatelé.</li>
      </ul>
      <p>Zpracovávané údaje mohou zahrnovat:</p>
      <ul>
        <li>jméno, příjmení, organizaci, funkci a interní identifikátory,</li>
        <li>e-mail, telefon a další kontaktní údaje,</li>
        <li>údaje o účtu, členství, rolích a přístupových oprávněních,</li>
        <li>údaje o účasti, čase připojení a provozní metadata,</li>
        <li>IP adresu, bezpečnostní a technické logy,</li>
        <li>
          obraz, hlas, chatové zprávy a audiovizuální záznam, pokud je subjekt
          aktivně zapojen do vysílání,
        </li>
        <li>obsah a soubory vložené správcem nebo jeho uživateli.</li>
      </ul>
      <p>
        Služba není určena k systematickému ukládání zvláštních kategorií údajů
        podle čl. 9 GDPR. Správce je bez předchozí písemné dohody nebude do
        služby vkládat. Nahodilý výskyt takového údaje v živé komunikaci oznámí
        zpracovateli, je-li třeba přijmout ochranné opatření.
      </p>

      <h2>4. Pokyny správce</h2>
      <p>
        Zpracovatel zpracovává osobní údaje pouze na základě doložených pokynů
        správce, včetně pokynů obsažených ve smlouvě, této DPA, nastavení účtů a
        oprávněných požadavků správce. To platí i pro předání do třetí země,
        ledaže zpracování ukládá právo Evropské unie nebo České republiky.
      </p>
      <p>
        Vyžaduje-li zpracování právní předpis, zpracovatel správce předem
        informuje, nebrání-li tomu zákonný zákaz. Zpracovatel správce bez
        zbytečného odkladu upozorní, pokud má za to, že pokyn porušuje GDPR nebo
        jiný předpis o ochraně osobních údajů, a může jeho provedení pozastavit
        do vyjasnění.
      </p>

      <h2>5. Povinnosti správce</h2>
      <p>Správce zejména:</p>
      <ul>
        <li>určuje účel a právní titul svého zpracování,</li>
        <li>plní informační povinnost vůči subjektům údajů,</li>
        <li>zadává pouze zákonné, přiměřené a doložitelné pokyny,</li>
        <li>
          udržuje správná přístupová oprávnění a bezodkladně odebírá nepotřebné
          účty,
        </li>
        <li>
          nevkládá údaje, které nejsou pro použití programu nezbytné nebo pro
          které nemá právní titul,
        </li>
        <li>
          samostatně posuzuje právní podmínky aktivního zapojení dětí a dalších
          osob obrazem nebo zvukem.
        </li>
      </ul>

      <h2>6. Povinnosti zpracovatele</h2>
      <p>Zpracovatel se zavazuje:</p>
      <ul>
        <li>zpracovávat údaje jen podle článku 4 a v nezbytném rozsahu,</li>
        <li>
          zajistit, aby osoby oprávněné zpracovávat údaje byly vázány
          mlčenlivostí,
        </li>
        <li>přijmout a udržovat opatření podle článku 8 a přílohy 2,</li>
        <li>
          s ohledem na povahu zpracování pomáhat správci technickými a
          organizačními opatřeními při vyřizování práv subjektů údajů,
        </li>
        <li>
          poskytovat přiměřenou součinnost při plnění povinností podle čl. 32 až
          36 GDPR, zejména při incidentech, posouzení vlivu a předchozí
          konzultaci s dozorovým úřadem,
        </li>
        <li>
          zpřístupnit správci informace nezbytné k doložení souladu a umožnit
          audity za podmínek článku 12,
        </li>
        <li>po skončení postupovat podle článku 13.</li>
      </ul>

      <h2>7. Subzpracovatelé</h2>
      <p>
        Správce uděluje obecné písemné povolení k zapojení subzpracovatelů
        uvedených v příloze 1. Zpracovatel zajistí, aby subzpracovatel převzal
        povinnosti na ochranu údajů nejméně v rozsahu vyžadovaném čl. 28 GDPR.
        Zpracovatel zůstává vůči správci odpovědný za plnění těchto povinností.
      </p>
      <p>
        Zamýšlené přidání nebo nahrazení subzpracovatele oznámí zpracovatel na
        evidovaný kontaktní e-mail správce nejméně 30 dnů předem. Správce může
        v této lhůtě vznést odůvodněnou námitku týkající se ochrany údajů.
        Strany se pokusí nalézt přiměřené řešení; není-li možné, může správce
        dotčenou službu nebo smlouvu ukončit ke dni zapojení nového
        subzpracovatele bez sankce a s poměrným vrácením nevyužité předplacené
        ceny.
      </p>

      <h2>8. Technická a organizační opatření</h2>
      <p>
        Zpracovatel udržuje opatření přiměřená riziku, povaze služby a stavu
        techniky. Základní rámec je uveden v příloze 2. Opatření může průběžně
        zlepšovat, nesmí však bez odpovídající náhrady podstatně snížit celkovou
        úroveň ochrany.
      </p>

      <h2>9. Porušení zabezpečení</h2>
      <p>
        Zpracovatel oznámí správci porušení zabezpečení osobních údajů bez
        zbytečného odkladu, podle možností nejpozději do 48 hodin poté, co se o
        něm dozví. Oznámení bude v rozsahu dostupných informací popisovat povahu
        incidentu, dotčené údaje a osoby, pravděpodobné důsledky, přijatá nebo
        navržená opatření a kontaktní místo. Nejsou-li všechny informace
        dostupné současně, budou doplňovány postupně.
      </p>

      <h2>10. Práva subjektů údajů</h2>
      <p>
        Obdrží-li zpracovatel žádost týkající se údajů zpracovávaných jménem
        správce, nebude o ní bez pokynu správce věcně rozhodovat a žádost
        bezodkladně předá správci. Zpracovatel poskytne přiměřenou součinnost,
        kterou správce nemůže rozumně zajistit prostřednictvím funkcí služby.
      </p>

      <h2>11. Předávání mimo EHP</h2>
      <p>
        Hlavní databázový projekt služby je provozován v regionu Evropské unie.
        Někteří dodavatelé nebo jejich subzpracovatelé však mohou zpracovávat
        omezené údaje i mimo Evropský hospodářský prostor. Takové předání může
        proběhnout pouze na základě rozhodnutí o odpovídající ochraně nebo
        vhodných záruk podle kapitoly V GDPR, zejména standardních smluvních
        doložek Evropské komise, případně s doplňkovými opatřeními odpovídajícími
        riziku.
      </p>
      <p>
        Informace o konkrétním mechanismu a kopii použitých záruk poskytne
        zpracovatel správci na odůvodněnou žádost v rozsahu, který neporušuje
        práva třetích osob a bezpečnostní důvěrnost.
      </p>

      <h2>12. Informace a audity</h2>
      <p>
        Zpracovatel na žádost poskytne dostupné bezpečnostní a smluvní podklady
        potřebné k doložení souladu. Správce může nejvýše jednou ročně, a dále
        při důvodném podezření na závažné porušení, provést audit sám nebo
        prostřednictvím nezávislého auditora vázaného mlčenlivostí.
      </p>
      <p>
        Audit se oznámí alespoň 15 pracovních dnů předem, proběhne v pracovní
        době a nesmí nepřiměřeně narušit provoz ani ohrozit údaje jiných
        zákazníků. Je-li možné požadavek splnit nezávislým auditním reportem
        dodavatele, použije se přednostně tento report. Každá strana nese své
        náklady; prokáže-li audit závažné porušení zpracovatele, nese přiměřené
        náklady zpracovatel.
      </p>

      <h2>13. Ukončení, vrácení a výmaz</h2>
      <p>
        Po skončení služby zpracovatel podle volby správce údaje zpracovávané
        jeho jménem vymaže nebo mu umožní jejich přiměřený export a následně je
        vymaže, není-li další uchování vyžadováno právním předpisem. Správce
        sdělí volbu nejpozději do 30 dnů od skončení; jinak se má za to, že volí
        výmaz.
      </p>
      <p>
        Výmaz z aktivních systémů bude proveden bez zbytečného odkladu, zpravidla
        do 60 dnů. Kopie v zabezpečených zálohách mohou přetrvat po omezenou dobu
        podle zálohovacího cyklu a do té doby nebudou používány k jinému účelu
        než obnově a bezpečnosti. Zákonné záznamy budou odděleny a chráněny po
        dobu povinného uchování.
      </p>

      <h2>14. Doba trvání a pořadí dokumentů</h2>
      <p>
        DPA nabývá účinnosti společně se smlouvou o programu a trvá do splnění
        povinností při ukončení zpracování. V otázkách ochrany osobních údajů má
        DPA přednost před VOP; standardní smluvní doložky pro mezinárodní předání
        mají přednost před oběma dokumenty.
      </p>

      <h2>Příloha 1 – schválení subzpracovatelé</h2>
      <ul>
        <li>
          <strong>Supabase Pte. Ltd.</strong> – databáze PostgreSQL,
          autentizace, úložiště a související cloudové služby; hlavní projekt
          ARCHIMEDES Live v regionu EU (eu-west-1), další omezené zpracování dle
          DPA a seznamu subzpracovatelů Supabase.
        </li>
        <li>
          <strong>Vercel Inc.</strong> – hosting webové aplikace, serverové
          funkce, doručování obsahu, provozní a anonymizovaná webová analytika;
          globální infrastruktura včetně USA, předání podle DPA a standardních
          smluvních doložek.
        </li>
        <li>
          <strong>Ag Art cz s.r.o., IČ: 28910613</strong> – systém
          WebMeeting.cz pro realizaci vysílání, připojení účastníků a související
          provozní údaje; Česká republika.
        </li>
        <li>
          <strong>Web4U s.r.o.</strong> – e-mailová infrastruktura a doručování
          provozních zpráv; Česká republika.
        </li>
      </ul>

      <h2>Příloha 2 – základní technická a organizační opatření</h2>
      <ul>
        <li>šifrovaný přenos prostřednictvím TLS,</li>
        <li>
          řízení přístupu podle rolí, oddělení organizací a princip nejmenších
          oprávnění,
        </li>
        <li>individuální účty a bezpečné mechanismy autentizace,</li>
        <li>
          omezení administrátorského přístupu na pověřené osoby a evidence
          významných provozních operací,
        </li>
        <li>logické oddělení produkční databáze a neveřejných tajných klíčů,</li>
        <li>pravidelné aktualizace aplikace a závislostí podle rizika,</li>
        <li>zálohování a postupy obnovy zajišťované cloudovými dodavateli,</li>
        <li>řízení bezpečnostních incidentů a oznamovací postup,</li>
        <li>řízení subdodavatelů a smluvní závazky mlčenlivosti,</li>
        <li>
          pravidelné přezkoumávání přístupů, retenčních pravidel a přiměřenosti
          opatření.
        </li>
      </ul>
    </LegalPageLayout>
  );
}
