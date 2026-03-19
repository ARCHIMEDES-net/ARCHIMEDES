import LegalPageLayout from "../components/LegalPageLayout";

export default function VopPage() {
  return (
    <LegalPageLayout
      title="Všeobecné obchodní podmínky"
      description="Všeobecné obchodní podmínky služby ARCHIMEDES Live pro školy, obce a další organizace."
      eyebrow="VOP"
    >
      <h2>1. Úvodní ustanovení</h2>
      <p>
        Tyto Všeobecné obchodní podmínky upravují práva a povinnosti mezi
        společností EduVision s.r.o. jako poskytovatelem služby ARCHIMEDES Live
        a zákazníkem, který službu objednává a využívá.
      </p>
      <p>
        ARCHIMEDES Live je poskytován jako online služba a program dostupný
        prostřednictvím internetu, bez instalace softwaru na zařízení zákazníka.
      </p>

      <div className="noteBox">
        <p>
          Dodavatel: <strong>EduVision s.r.o.</strong>, Purkyňova 649/127,
          Medlánky, 612 00 Brno, IČ: 17803039, DIČ: CZ17803039, zapsána pod
          značkou C 131579/KSBR Krajským soudem v Brně.
        </p>
      </div>

      <h2>2. Předmět služby</h2>
      <p>Služba ARCHIMEDES Live může zahrnovat zejména:</p>
      <ul>
        <li>živé online vstupy a vysílání,</li>
        <li>archiv záznamů pro registrované uživatele,</li>
        <li>pracovní listy a doprovodné materiály,</li>
        <li>metodickou nebo provozní podporu,</li>
        <li>obsah pro školy, obce a komunitní aktivity.</li>
      </ul>

      <h2>3. Objednávka a uzavření smlouvy</h2>
      <p>
        Odesláním online objednávky a potvrzením příslušných souhlasů dochází k
        uzavření smlouvy o poskytování služby ARCHIMEDES Live v rozsahu zvoleného
        balíčku.
      </p>
      <p>
        Zákazník odesláním objednávky potvrzuje, že je oprávněn jednat jménem
        školy, obce nebo jiné organizace, případně že jedná na základě jejího
        pověření.
      </p>

      <h2>4. Cena a fakturace</h2>
      <p>
        Cena služby je uvedena v objednávce nebo na příslušné objednávkové
        stránce. Na základě přijaté objednávky bude zákazníkovi vystavena faktura.
      </p>
      <p>
        Není-li uvedeno jinak, jsou ceny uváděny bez DPH a k ceně bude připočtena
        DPH v zákonné výši.
      </p>

      <h2>5. Rozsah oprávnění k užívání</h2>
      <p>
        Zákazník získává nevýhradní, nepřevoditelné a časově omezené oprávnění
        užívat službu ARCHIMEDES Live v rozsahu sjednaného balíčku.
      </p>
      <p>
        Zákazník není oprávněn bez souhlasu poskytovatele službu, záznamy,
        pracovní listy nebo další obsah dále šířit, prodávat, sublicencovat nebo
        zpřístupňovat mimo sjednaný okruh oprávněných uživatelů.
      </p>

      <h2>6. Technické zajištění a třetí strany</h2>
      <p>
        Služba může být poskytována s využitím nástrojů třetích stran, zejména
        videokonferenčních nebo komunikačních platforem.
      </p>
      <p>
        Poskytovatel neodpovídá za výpadky internetu na straně zákazníka, vady
        zařízení zákazníka ani za výpadky nebo omezení služeb třetích stran,
        pokud je nezpůsobil přímo poskytovatel.
      </p>

      <h2>7. Záznamy a archiv</h2>
      <p>
        V rámci služby mohou být pořizovány obrazové, zvukové nebo audiovizuální
        záznamy živých vysílání, online vstupů a dalších programových částí.
      </p>
      <p>
        Tyto záznamy mohou být zpřístupněny registrovaným uživatelům v archivu
        služby v rozsahu odpovídajícím konkrétnímu programu a nastavení služby.
      </p>

      <h2>8. Ochrana osobních údajů</h2>
      <p>
        Tam, kde zákazník používá službu pro práci s osobními údaji svých žáků,
        zaměstnanců nebo dalších osob, vystupuje zákazník typicky jako správce a
        poskytovatel jako zpracovatel. Podrobnosti upravuje samostatná smlouva o
        zpracování osobních údajů (DPA).
      </p>

      <h2>9. Práva k obsahu</h2>
      <p>
        Veškerý obsah služby, zejména videa, záznamy, pracovní listy, texty,
        vizuální prvky a struktura služby, je chráněn právem duševního vlastnictví.
      </p>
      <p>
        Bez předchozího písemného souhlasu poskytovatele není dovoleno tento
        obsah kopírovat, veřejně šířit nebo využívat mimo účel služby.
      </p>

      <h2>10. Omezení odpovědnosti</h2>
      <p>
        Poskytovatel odpovídá pouze za škodu způsobenou prokazatelným porušením
        svých povinností. Neodpovídá za nepřímou škodu, ušlý zisk ani za vady
        způsobené třetími stranami nebo zákazníkem.
      </p>

      <h2>11. Změny podmínek</h2>
      <p>
        Poskytovatel je oprávněn tyto podmínky přiměřeně měnit zejména z důvodu
        změny právních předpisů, technického řešení služby nebo provozních potřeb.
      </p>

      <h2>12. Závěrečná ustanovení</h2>
      <p>
        Tyto obchodní podmínky tvoří nedílnou součást smluvního vztahu mezi
        zákazníkem a poskytovatelem.
      </p>
      <p className="muted">
        Tato webová verze slouží jako veřejně dostupné znění podmínek pro
        objednávkový proces ARCHIMEDES Live.
      </p>
    </LegalPageLayout>
  );
}
