# #117 – Atomický onboarding školy a spolku

## Nepřekročitelná pravidla

- Existující obce, školy a spolky musí zůstat zachované včetně ID, vazeb, licencí, historie a registračních čísel.
- Existující Auth účty musí zůstat zachované.
- Nesmí se měnit ani resetovat hesla nebo e-maily existujících uživatelů.
- Nesmí se automaticky nahrazovat existující škola, spolek nebo uživatel novým záznamem.
- Při zjištěné duplicitě se onboarding zastaví a existující organizace se bezpečně propojí samostatným řízeným postupem.
- Žádná chyba onboardingu nesmí zanechat částečně vytvořenou organizaci, členství, činnost, změněný profil nebo spotřebovanou pozvánku.

## Potvrzený současný problém

Registrace školy a spolku dnes probíhá v několika samostatných databázových zápisech. Pozvánka je spotřebována až po vytvoření organizace, členství a změně profilu. Při chybě následuje kompenzační mazání, jehož případné selhání se potlačí.

Nový Auth účet navíc vzniká mimo PostgreSQL transakci. Jeho případný rollback proto musí být explicitní, sledovaný a ověřitelný.

## Bezpečný cílový model

### Fáze A – příprava registranta mimo databázovou transakci

1. Ověřit vstupy, rate limit a pozvánku bez změny jejího stavu.
2. Ověřit duplicity organizace a existující účet.
3. Použít existující přihlášený účet nebo existující profil beze změny hesla.
4. Jen pokud účet neexistuje, vytvořit nový Auth účet a zaznamenat jeho ID jako dočasně vytvořený účet.
5. Vygenerovat odkaz pro nastavení hesla pouze pro nový účet.

### Fáze B – jedna atomická databázová RPC operace

RPC musí v jedné PostgreSQL transakci:

1. zamknout konkrétní pozvánku `FOR UPDATE`;
2. znovu ověřit `pending`, typ organizace, e-mail, expiraci a aktivní licenci obce;
3. znovu ověřit duplicitu pod danou obcí;
4. vytvořit právě jednu organizaci;
5. u spolku vytvořit právě jednu vazbu v `organization_activities`;
6. vytvořit nebo bezpečně aktivovat právě jedno členství registranta jako `organization_admin`;
7. vytvořit nebo aktualizovat profil pouze v povolených polích;
8. u existujícího profilu zachovat účet, e-mail, heslo a ostatní členství;
9. nastavit `active_organization_id` na nově vytvořenou organizaci;
10. atomicky označit pozvánku jako `used` a uložit `used_organization_id`;
11. vrátit novou organizaci a původní hodnotu `active_organization_id` pro audit.

Při jakékoli chybě se celá databázová transakce vrátí zpět.

### Fáze C – bezpečné dokončení mimo transakci

1. Odeslat informační e-mail až po úspěšném commitu.
2. Selhání e-mailu nesmí rušit úspěšný onboarding.
3. Pokud databázová RPC selže a Auth účet byl právě vytvořen, provést explicitní smazání pouze tohoto nového Auth účtu.
4. Výsledek cleanupu nesmí být potlačen bez evidence; musí být zalogován s ID účtu a důvodem.
5. Existující Auth účet se při chybě nikdy nemaže ani neupravuje.

## Povinné ochrany

- Dvě souběžná odeslání stejné pozvánky: uspěje nejvýše jedno.
- Dvě souběžná odeslání stejné organizace: nevzniknou dvě organizace.
- Neplatná, expirovaná, použitá nebo cizí pozvánka neprovede žádný zápis.
- Neaktivní obec nebo neaktivní licence neprovede žádný zápis.
- Existující organizace se nikdy nepřepisuje ani nemaže.
- Existující uživatel si zachová heslo, Auth ID a všechna ostatní členství.
- Nový účet se smaže jen tehdy, když byl vytvořen právě tímto neúspěšným požadavkem.
- Cleanup nového Auth účtu musí mít ověřený výsledek a auditní záznam.
- RPC nesmí obsahovat hromadný `UPDATE`, `DELETE`, `TRUNCATE` ani změny existujících organizací.

## Povinné regresní testy

- úspěšná registrace školy;
- úspěšná registrace spolku včetně činnosti;
- existující přihlášený účet zůstane zachován;
- existující účet ve více organizacích neztratí žádné členství;
- souběžné použití stejné pozvánky;
- souběžná registrace stejného názvu pod jednou obcí;
- selhání při vytvoření organizace;
- selhání při vložení činnosti spolku;
- selhání při vytvoření členství;
- selhání při změně profilu;
- selhání při spotřebování pozvánky;
- selhání cleanupu nového Auth účtu musí být viditelné a auditovatelné;
- žádný test ani implementace nesmí resetovat heslo existujícího účtu;
- žádný test ani implementace nesmí mazat existující obec, školu, spolek nebo profil.

## Mimo rozsah

- automatické slučování duplicitních organizací;
- změna hesla nebo e-mailu existujícího účtu;
- migrace nebo přejmenování existujících škol a obcí;
- změna licencí;
- deaktivace uživatelů (#116);
- děděná oprávnění správce obce (#114/#115).

## Pořadí další práce

1. ověřit přesné schéma a constrainty pozvánek, organizací, členství, profilů a činností;
2. navrhnout jednu RPC funkci bez jejího nasazení;
3. přidat kontraktní testy zakazující destruktivní zásahy;
4. upravit školní a spolkový endpoint tak, aby databázovou část delegoval na RPC;
5. doplnit explicitní audit cleanupu nového Auth účtu;
6. CI, migrační historie a Preview;
7. připravit samostatný rollback a produkční checklist;
8. teprve po explicitním schválení případný merge a nasazení.
