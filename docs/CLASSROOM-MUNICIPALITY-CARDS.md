# Obec s učebnou bez lokálního správce

Pro obce s doloženou učebnou ARCHIMEDES přibývá administrátorský postup:

1. Zákazníci → **Založit obec s učebnou**. Při psaní se nabídnou existující karty.
2. Vyplnit název, případně známé IČO/adresu/kontakty. Potvrdit realizaci a uvést
   konkrétní podklad (protokol, CRM záznam nebo odkaz). Bez podkladu aktivace neprojde.
3. Obec dostane registrační číslo a první roční licenci. Začíná v den založení
   podle Europe/Prague a končí před půlnocí výročí za rok. Přijetí smlouvy se
   nefalšuje: zůstává `pending`, titul je `internal_classroom_free_access_program`,
   fakturace `not_applicable`. Eviduje se autor, čas a podklad ověření.
4. Přidat školu pod touto obcí. Název a adresa jsou povinné, kontakty volitelné.
   IČO (8 číslic) a IZO (9 číslic) jsou volitelné, při zadání validované.
   Registrační číslo školy má formát `NNNN-SK-XX`.
5. **Pokračovat: správce školy a učitelé**. Jméno, pracovní e-mail a role se
   potvrzují zvlášť. Tlačítko výslovně říká, že připojí uživatele a odešle pozvánku.
6. Kontrolovat přímá členství a audit pozvánek. Organizační založení, připravený
   přístup, předání e-mailu providerovi a dokončený profil nejsou stejný stav.

Existující dosud neaktivovaná obec: použít **Doplnit údaje obce** a samostatně
zaškrtnout první bezplatnou licenci. Již aktivovanou nebo dříve používanou licenci
tato operace neobnovuje ani neprodlužuje. Běžná editace údajů licence nemění.

## Kontroly a oddělení přístupů

- API i databázové RPC vyžadují živého platformového administrátora.
- Založení obce nevytváří lokálního správce, Auth účet, členství ani e-mail.
- `K doplnění` se odvozuje z IČO, adresy, jména a e-mailu kontaktu; tento stav
  sám o sobě neblokuje aktivní obecní licenci ani školu.
- Duplicity obcí se kontrolují i podle historického `ico`, názvu bez diakritiky
  a bez omezení na aktivní záznamy. Shoda se automaticky neslučuje ani nepřepisuje.
- Školy se kontrolují podle IZO, názvu/adresy a IČO/názvu napříč obcemi. IZO má
  unikátní index. Při shodě samostatné školy se založení zastaví; její připojení
  vyžaduje samostatnou kontrolu, aby se nezměnil zřizovatel automaticky.
- Kontakt školy není automaticky jejím uživatelem. Školní správce/učitel získá
  přímé členství pouze ve vybrané škole; správce obce se nepřidává do školy.
- Existující účty řeší stávající `resolveLocalAdministrator`; profil, heslo
  a ostatní členství se zachovají. Nové účty používají auditovanou přípravu.
- Existující jiné členství se nepřepisuje automaticky na vyšší roli.
- Pozvánky mají vlastní idempotentní audit s cílovou rolí. Nejasné doručení
  se neopakuje automaticky. Při jistém odmítnutí se kompenzují pouze nové změny.
- Před odesláním se znovu čtou přímé členství a profil. Po databázových
  operacích se znovu čte organizace a ověřuje vazba/číslo.
- Auditní kopie pro centrální tým neobsahuje aktivační token.

## Migrace a nasazení

Migrace `20260909133121_classroom_municipality_cards.sql` přidává údaje podkladu,
titulu aktivace a IZO, dvě auditní tabulky a úzká administrátorská RPC. Zachovává
číslování škol, které bylo ověřeno přímo v produkci, ale chybělo v git baseline.
Opravuje i nejednoznačné escapování SQL regexu kontaktu školy použitím `[.]`.
Nevytváří ani neaktivuje žádné zákaznické záznamy při samotném nasazení.

Pořadí: databázová migrace → ověření grantů/RLS/triggerů → aplikace → ověření
v přihlášené administraci. Aplikaci nelze nasadit před migrací.

Pokud je nutný návrat, vrátit aplikaci na předchozí commit; nová data a auditní
tabulky zachovat. Nemaže se existující obec, škola ani uživatel.

## Provedené ověření při přípravě

- PGlite provádí skutečné SQL: obec pouze s názvem, roční interval, aktivace
  existující rozpracované obce, kontakty školy prázdné, číslo `NNNN-SK-01`,
  duplicity/IZO, odmítnutí neadmina a anonymního volání, stabilní licence při
  editaci a rollback při chybě auditu.
- API testy se simulovaným providerem: nový učitel, existující účet, přesná
  role/členství, idempotentní replay, konflikt role, nejasné doručení, bezpečná
  kompenzace a odmítnutí vypršené licence.
- Cílená regresní sada: 64 testů. Kontrola migrací, lint změněných souborů
  a produkční build prošly. Build má pouze dřívější upozornění mimo tuto změnu.
- Produkční kontrola byla pouze čtecí. Nebyly odeslány reálné pozvánky.
- Migrace a transakční test prošly také v samostatné Supabase větvi s úplným
  schématem produkce: založení obce bez kontaktu, škola bez kontaktu,
  NNNN-SK-01, duplicita, zachování licence, audit a odmítnutí neadmina.
  Všechny testovací zápisy skončily rollbackem.
- GitHub CI i kontrola historie migrací prošly; Vercel sestavil náhled úspěšně.
- Vizuální ověření v cloudovém prohlížeči nebylo dokončeno: lokální izolovaný
  server byl blokován chybou `ERR_BLOCKED_BY_CLIENT`. Přihlášený browser E2E
  zůstává posledním neověřeným krokem před produkcí.
