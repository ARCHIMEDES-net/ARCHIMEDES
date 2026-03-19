import LegalPageLayout from "../components/LegalPageLayout";

export default function DpaPage() {
  return (
    <LegalPageLayout
      title="Smlouva o zpracování osobních údajů (DPA)"
      description="Základní podmínky zpracování osobních údajů při využívání služby ARCHIMEDES Live."
      eyebrow="DPA"
    >
      <h2>1. Smluvní strany</h2>
      <p>
        Tato smlouva o zpracování osobních údajů upravuje vztah mezi zákazníkem
        jako správcem osobních údajů a společností EduVision s.r.o. jako
        zpracovatelem, pokud poskytovatel zpracovává osobní údaje jménem zákazníka
        v souvislosti s poskytováním služby ARCHIMEDES Live.
      </p>

      <h2>2. Předmět a účel zpracování</h2>
      <p>
        Předmětem zpracování jsou osobní údaje nezbytné pro poskytování služby
        ARCHIMEDES Live, zejména pro správu přístupů, realizaci živých vysílání,
        provoz archivu, technickou podporu, bezpečnost a související provozní
        agendu.
      </p>

      <h2>3. Kategorie subjektů údajů</h2>
      <ul>
        <li>žáci a studenti,</li>
        <li>pedagogičtí pracovníci,</li>
        <li>zaměstnanci a spolupracovníci zákazníka,</li>
        <li>další osoby zapojené zákazníkem do služby.</li>
      </ul>

      <h2>4. Kategorie osobních údajů</h2>
      <ul>
        <li>identifikační údaje,</li>
        <li>kontaktní údaje,</li>
        <li>přístupové a autentizační údaje,</li>
        <li>provozní logy a metadata,</li>
        <li>obrazové a zvukové záznamy, pokud jsou součástí služby.</li>
      </ul>

      <h2>5. Pokyny správce</h2>
      <p>
        Zpracovatel zpracovává osobní údaje pouze na základě doložených pokynů
        správce, ledaže mu zpracování ukládá právní předpis.
      </p>

      <h2>6. Povinnosti správce</h2>
      <p>Správce odpovídá zejména za to, že:</p>
      <ul>
        <li>má pro zpracování odpovídající právní titul,</li>
        <li>splnil informační povinnost vůči subjektům údajů,</li>
        <li>interně nastavil pravidla práce se službou a záznamy,</li>
        <li>je oprávněn zapojit konkrétní osoby do využívání služby.</li>
      </ul>

      <h2>7. Povinnosti zpracovatele</h2>
      <p>Zpracovatel se zavazuje zejména:</p>
      <ul>
        <li>zpracovávat údaje pouze v rozsahu nezbytném pro poskytování služby,</li>
        <li>zachovávat mlčenlivost,</li>
        <li>přijmout přiměřená technická a organizační opatření,</li>
        <li>poskytovat správci přiměřenou součinnost při plnění GDPR povinností.</li>
      </ul>

      <h2>8. Subzpracovatelé</h2>
      <p>
        Zpracovatel je oprávněn zapojit další zpracovatele, pokud je to nezbytné
        pro provoz služby, zejména poskytovatele hostingu, cloudových služeb,
        komunikačních nástrojů nebo e-mailových služeb.
      </p>

      <h2>9. Bezpečnost</h2>
      <p>
        Zpracovatel zavádí přiměřená opatření k zajištění důvěrnosti, integrity,
        dostupnosti a odolnosti systémů a služeb, včetně řízení přístupových práv,
        ochrany přenosů a interního řešení incidentů.
      </p>

      <h2>10. Incidenty</h2>
      <p>
        Zpracovatel oznámí správci bez zbytečného odkladu porušení zabezpečení
        osobních údajů, pokud může mít dopad na údaje zpracovávané pro správce.
      </p>

      <h2>11. Doba trvání a ukončení</h2>
      <p>
        Tato DPA trvá po dobu využívání služby a následně po dobu nezbytnou pro
        splnění zákonných povinností, bezpečnostních požadavků a retenčních pravidel.
      </p>

      <p className="muted">
        Toto veřejné znění slouží jako stručná webová verze DPA pro objednávkový
        proces. Plné smluvní znění může být součástí smluvní dokumentace.
      </p>
    </LegalPageLayout>
  );
}
