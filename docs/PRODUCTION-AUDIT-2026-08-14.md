# Read-only audit produkce – 14. srpna 2026

> **Datovaný důkaz, nikoli trvale živá instrukce.** Aktuální provozní zdroje a
> jejich pořadí určuje `docs/README.md`.

Audit byl proveden bez zápisu, mazání, odesílání e-mailů nebo deploymentu.
Přesná osobní data a interní UUID nejsou v repozitáři uvedena.

## Ověřeno jako zdravé

- Produkční Vercel deployment byl ve stavu `READY` a veřejné hlavní trasy
  vracely HTTP 200.
- Supabase projekt byl `ACTIVE_HEALTHY`.
- Databáze obsahovala 20 organizací, 89 profilů, 74 aktivních členství,
  36 událostí a 20 vysílacích relací.
- Nebyly nalezeny duplicity názvu organizace, IČO, profilového e-mailu,
  členství ani dvojice název školy + město.
- Auth a profily byly vzájemně úplné: žádný Auth účet bez profilu a žádný
  profil bez Auth účtu.
- Osm obecních organizací bylo aktivních, mělo registrační, kontaktní a
  licenční údaje a oba centrální správce.
- Čtyři onboardingové běhy měly audit e-mailu `sent`; tři přípravy Auth účtu
  byly uzavřené a konzistentní.
- Produkční migration ledger obsahoval 28 položek a přesně odpovídal souboru
  `supabase/production-migration-ledger.json` i aktivním lokálním migracím.
- PR #168 byl následně sloučen do `main` jako
  `23cebb54913e1bcbc28ebfe2945f60ad88340e0a`; produkční deployment byl `READY`.
  Po nasazení byly read-only ověřeny `/program`, `/kalendar`, programové karty,
  časové pásmo `Europe/Prague`, obrázky a absence relevantní hydration chyby.
  Nasazení neprovedlo databázovou změnu ani neodeslalo e-mail.

## Otevřené datové nálezy – bez automatické opravy

- Dva historické řádky `platform_admins` nemají odpovídající živý Auth účet
  ani profil. Odstranění vyžaduje přesný schválený seznam UUID a samostatnou
  produkční změnu.
- Jedna referenční obec nemá lokálního správce a její připojená škola nemá
  přímé aktivní členství. Je nutné rozhodnout, zda jde o záměrný provozní
  model, nebo chybějící přiřazení.
- Jedenáct z dvanácti škol nemá oba centrální správce jako přímé členy.
  Hromadné doplnění se nesmí provést bez schválené mapy škol a rolí.
- Osm samostatných škol má aktivní licenční stav, ale nemá vyplněný plán nebo
  konec platnosti. Současný runtime je proto považuje za časově neomezené.
  Doplnění vyžaduje obchodní rozhodnutí pro každou školu.
- Tři historické školní záznamy vyžadují ruční kontrolu identity nebo IČO:
  organizace pojmenovaná jako fyzická osoba, nesystémová testovací škola a
  škola s nestandardně dlouhým IČO.

## Technický dluh k samostatným PR

- Supabase advisories obsahovaly 36 bezpečnostních a 120 výkonnostních
  upozornění. Nešlo o aktuální produkční chybu onboardingu; zahrnují zejména
  záměrné deny-by-default RLS tabulky, klasifikaci `SECURITY DEFINER`, chybějící
  indexy cizích klíčů a vícenásobné permissive policies.
- Content Security Policy je zčásti pouze reportovací. Zpřísnění patří do
  samostatné změny s kontrolou všech veřejných i portálových tras.

## Požadované rozhodnutí před datovou opravou

Připravit zabezpečený přesný seznam cílových UUID a u každé položky jednu z
akcí `ponechat`, `doplnit`, `deaktivovat` nebo `odstranit`. Teprve poté lze
navrhnout malou, vratnou a samostatně auditovanou produkční změnu.
