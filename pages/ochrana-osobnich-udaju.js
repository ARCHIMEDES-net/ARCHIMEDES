import LegalPageLayout from "../components/LegalPageLayout";

export default function PrivacyPage() {
  return (
    <LegalPageLayout
      title="Informace o zpracování osobních údajů"
      description="Základní informace o tom, jak EduVision s.r.o. zpracovává osobní údaje v souvislosti s webem a službou ARCHIMEDES Live."
      eyebrow="Ochrana osobních údajů"
    >
      <h2>1. Kdo je správcem</h2>
      <p>
        Správcem osobních údajů pro účely tohoto webu a související obchodní a
        provozní komunikace je společnost <strong>EduVision s.r.o.</strong>,
        Purkyňova 649/127, Medlánky, 612 00 Brno, IČ: 17803039, DIČ: CZ17803039.
      </p>

      <h2>2. Jaké údaje mohou být zpracovávány</h2>
      <ul>
        <li>identifikační údaje,</li>
        <li>kontaktní údaje,</li>
        <li>údaje z objednávek a poptávek,</li>
        <li>komunikační a provozní údaje,</li>
        <li>technické údaje o používání webu a služby.</li>
      </ul>

      <h2>3. Účely zpracování</h2>
      <ul>
        <li>vyřízení objednávky nebo poptávky,</li>
        <li>uzavření a plnění smlouvy,</li>
        <li>komunikace se zákazníkem,</li>
        <li>zajištění provozu, bezpečnosti a správy služby,</li>
        <li>plnění zákonných povinností.</li>
      </ul>

      <h2>4. Právní základy</h2>
      <p>
        Osobní údaje mohou být zpracovávány zejména z důvodu plnění smlouvy,
        plnění zákonných povinností, oprávněného zájmu správce nebo na základě
        souhlasu, pokud je v konkrétním případě vyžadován.
      </p>

      <h2>5. Příjemci a zpracovatelé</h2>
      <p>
        Osobní údaje mohou být zpřístupněny poskytovatelům technických,
        hostingových, komunikačních, e-mailových nebo administrativních služeb,
        pokud je to nezbytné pro provoz webu a služby.
      </p>

      <h2>6. Doba uchování</h2>
      <p>
        Údaje jsou uchovávány po dobu nezbytnou pro naplnění příslušného účelu,
        po dobu trvání smluvního vztahu a dále po dobu vyžadovanou právními
        předpisy nebo odpovídající oprávněným zájmům správce.
      </p>

      <h2>7. Vaše práva</h2>
      <ul>
        <li>právo na přístup k osobním údajům,</li>
        <li>právo na opravu nepřesných údajů,</li>
        <li>právo na výmaz, pokud jsou splněny zákonné podmínky,</li>
        <li>právo na omezení zpracování,</li>
        <li>právo vznést námitku,</li>
        <li>právo podat stížnost u Úřadu pro ochranu osobních údajů.</li>
      </ul>

      <h2>8. Specifická role u škol a organizací</h2>
      <p>
        Pokud je ARCHIMEDES Live využíván školou nebo jinou organizací pro práci
        s osobními údaji jejích žáků, zaměstnanců nebo dalších osob, může
        EduVision s.r.o. v tomto rozsahu vystupovat jako zpracovatel a škola nebo
        organizace jako správce. Podrobnosti pak upravuje samostatná DPA.
      </p>

      <h2>9. Kontaktní údaje</h2>
      <p>
        Dotazy k ochraně osobních údajů je možné směřovat na kontaktní e-mail
        používaný pro provoz služby ARCHIMEDES Live.
      </p>
    </LegalPageLayout>
  );
}
