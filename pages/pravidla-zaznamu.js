import Link from "next/link";
import LegalPageLayout from "../components/LegalPageLayout";
import {
  LEGAL_DOCUMENT_EFFECTIVE_DATE_CS,
  LEGAL_DOCUMENT_VERSION,
} from "../lib/legalDocuments";

export default function RecordingRulesPage() {
  return (
    <LegalPageLayout
      title="Pravidla pořizování a zpřístupnění záznamů"
      description="Závazná pravidla pro pořizování, používání a zpřístupnění obrazových, zvukových a audiovizuálních záznamů v ARCHIMEDES Live."
      eyebrow="Záznamy a archiv"
      updatedAt={`Účinná od ${LEGAL_DOCUMENT_EFFECTIVE_DATE_CS} · verze ${LEGAL_DOCUMENT_VERSION}`}
    >
      <h2>1. Rozsah a závaznost pravidel</h2>
      <p>
        Tato pravidla upravují pořizování, přenos, ukládání a zpřístupnění
        obrazových, zvukových a audiovizuálních záznamů v programu ARCHIMEDES
        Live. Jsou součástí smluvních podmínek programu a použijí se společně s
        VOP, DPA a informacemi o zpracování osobních údajů.
      </p>
      <p>
        Zákazník zajistí, aby se s pravidly před aktivní účastí ve vysílání
        seznámili jeho uživatelé a další osoby, které do vysílání zapojuje.
      </p>

      <h2>2. Divák a aktivní účastník</h2>
      <p>
        Pouhé sledování programu z oprávněného účtu zpravidla nevede k zachycení
        obrazu ani hlasu diváka. Obraz nebo hlas mohou být přeneseny či zaznamenány
        pouze při aktivním vstupu, zejména po zapnutí kamery nebo mikrofonu,
        připojení hosta, použití chatu či odeslání jiného uživatelského obsahu.
      </p>
      <p>
        Zapnutí kamery nebo mikrofonu není běžnou podmínkou sledování programu.
        Uživatel je zapíná jen tehdy, pokud je k tomu oprávněn, byl předem
        informován a rozumí tomu, zda se pořizuje záznam.
      </p>

      <h2>3. Kdy může být záznam pořizován</h2>
      <p>
        Záznam lze pořídit jen pro předem určený a sdělený účel, zejména pro
        zpřístupnění programu oprávněným uživatelům v archivu, návaznou výuku,
        dokumentaci programu, ochranu práv nebo zajištění kvality a bezpečnosti.
        Před zahájením záznamu musí být aktivní účastníci srozumitelně upozorněni;
        během záznamu má být stav zřetelně označen dostupnými technickými
        prostředky.
      </p>
      <p>
        Rozsah záznamu musí být přiměřený účelu. Pokud není zachycení účastníka
        potřebné, má pořadatel použít vypnutou kameru či mikrofon, anonymní
        označení nebo jiný šetrnější postup.
      </p>

      <h2>4. Role EduVision a zákazníka</h2>
      <p>
        U pořadů, které EduVision samo dramaturgicky připravuje a u nichž určuje
        účely a způsob použití záznamu, vystupuje EduVision jako správce osobních
        údajů. Právní titul, oprávnění k užití projevu, podobizny a autorských
        příspěvků hosta nebo lektora se upravují podle povahy pořadu, zpravidla
        smlouvou, oprávněným zájmem nebo souhlasem, je-li potřebný.
      </p>
      <p>
        Pokud aktivní účastníky zapojuje obec, škola, spolek nebo jiný zákazník a
        sám určuje účel jejich účasti, je za informování, právní titul a interní
        oprávnění odpovědný tento zákazník. EduVision v takovém rozsahu jedná
        podle pokynů zákazníka jako zpracovatel dle <Link href="/dpa">DPA</Link>.
      </p>

      <h2>5. Děti a další zranitelné osoby</h2>
      <p>
        Při zapojení dětí musí škola nebo jiná odpovědná organizace předem určit
        právní základ, splnit informační povinnost vůči dětem a případně jejich
        zákonným zástupcům a dodržet školské, pracovněprávní a další použitelné
        předpisy. Nelze automaticky předpokládat, že obecný souhlas se školními
        aktivitami pokrývá veřejné nebo dlouhodobé použití záznamu.
      </p>
      <p>
        Do vysílání se nemají bez nezbytného důvodu sdělovat celá jména dětí,
        kontakty, zdravotní údaje ani jiné citlivé či snadno zneužitelné
        informace. Kamery a mikrofony zařízení používaných dětmi smí zapnout jen
        oprávněná osoba za odpovídajícího dohledu.
      </p>

      <h2>6. Archiv, přístup a doba uchování</h2>
      <p>
        Záznam může být zpřístupněn pouze okruhu uživatelů určenému u konkrétního
        programu, podle jejich role, organizace a licence. Veřejné zveřejnění se
        provede jen tehdy, pokud pro něj existuje samostatné oprávnění a dotčené
        osoby o něm byly informovány.
      </p>
      <p>
        Doba uchování se stanoví podle účelu a informací u pořadu nebo smlouvy s
        účastníkem. Není-li uvedeno jinak, záznam zůstává v archivu po dobu, kdy je
        součástí programu a trvá odpovídající právní titul; poté bude odstraněn
        nebo anonymizován, nebrání-li tomu zákonná povinnost či ochrana právních
        nároků. Zákazník může požádat o omezení přístupu nebo výmaz údajů, které
        EduVision zpracovává jeho jménem.
      </p>

      <h2>7. Zákaz neoprávněného pořizování a šíření</h2>
      <p>
        Uživatel nesmí bez oprávnění pořizovat vlastní kopii přenosu nebo záznamu,
        obcházet ochranu archivu, poskytovat přístup třetí osobě ani obsah
        stahovat, zveřejňovat, upravovat nebo dále šířit. Tím nejsou dotčena
        zákonná oprávnění, která nelze smluvně vyloučit.
      </p>
      <p>
        Zákazník odpovídá za přiměřené nastavení prostoru, zařízení a účtů tak,
        aby nebyly neúmyslně zachyceny osoby, dokumenty, obrazovky nebo rozhovory,
        které do vysílání nepatří.
      </p>

      <h2>8. Námitky, incidenty a kontakt</h2>
      <p>
        Osoba, která nechce být zachycena, má před aktivním vstupem kontaktovat
        pořadatele a využít možnost účasti bez obrazu či hlasu, je-li dostupná.
        Žádost o informace, omezení přístupu, opravu označení nebo výmaz lze
        zaslat na <a href="mailto:zive@archimedeslive.com">zive@archimedeslive.com</a>.
        EduVision žádost vyřídí jako správce, nebo ji předá příslušnému zákazníkovi,
        pokud jedná jen jako zpracovatel.
      </p>
      <p>
        Podezření na neoprávněný přístup, kopii nebo zveřejnění záznamu je nutné
        oznámit bez zbytečného odkladu. EduVision může přístup preventivně omezit,
        uchovat nezbytné důkazy a přijmout další bezpečnostní opatření.
      </p>
    </LegalPageLayout>
  );
}
