# Jednotný program pro obce, školy a spolky

## Neměnné produktové zásady

- ARCHIMEDES Live je jeden program za standardní cenu 1 990 Kč měsíčně.
- Zákazník může zvolit měsíční režim, dvanáct měsíců placených najednou
  nebo – pouze u ověřené obce s učebnou ARCHIMEDES – prvních 12 měsíců zdarma.
- Samostatným zákazníkem může být obec, škola nebo spolek.
- Škola a spolek se mohou alternativně zapojit pod aktivní obcí bez
  samostatného předplatného.
- Národní svaz nebo organizace je obsahový partner. Nejde o stejnou roli
  jako spolek, který program využívá.
- Odeslání objednávky nikdy samo neaktivuje přístup. Aktivace vyžaduje
  kontrolu smlouvy, fakturace, doby platnosti a správce zákazníka.

## Datový model

| Veřejné označení | `organizations.org_type` | Možný rodič |
|---|---|---|
| Obec | `municipality` | ne |
| Škola | `school` | obec nebo žádný |
| Spolek | `association` | obec nebo žádný |
| Národní svaz nebo organizace | `partner` | ne |

Po dobu prvního nasazení aplikace akceptuje i historické interní hodnoty
`obec` a `spolek`. Nové záznamy už vznikají jako `municipality` a
`association`; přepis starých dat proběhne až v samostatném následném
kroku, aby nevzniklo období, kdy stará nebo nová verze webu nerozpozná obce.

`parent_organization_id` určuje obec, jejíž program škola nebo spolek
využívá. Neuděluje správci obce administrátorská práva k osobním údajům,
profilům ani nastavení školy nebo spolku.

## Efektivní přístup

Organizace má přístup, pokud je sama aktivní a platí alespoň jedna možnost:

1. má vlastní aktivní a neexpirované předplatné; nebo
2. její aktivní nadřazená obec má aktivní a neexpirované předplatné.

Vlastní aktivní předplatné se nesmí zneplatnit jen proto, že nadřazená obec
své předplatné pozastavila. Administrativně zablokovaná organizace nemá
přístup bez ohledu na zdroj předplatného.

## Objednávka a aktivace

1. Objednávka založí neaktivního zákazníka s `pending_approval`, uloží
   požadovanou variantu, čas a verzi přijatých VOP.
2. Platformní správce ověří subjekt, kontaktní osobu, smlouvu a fakturaci.
3. U bezplatného roku samostatně potvrdí existenci učebny ARCHIMEDES.
4. Aktivace atomicky vytvoří nebo zachová účet správce, členství a přesnou
   platnost licence.
5. Kontaktní osoba obdrží onboardingový e-mail odpovídající typu zákazníka.

## Zapojení organizace pod obec

- Čtyřmístné registrační číslo identifikuje program obce, ale není
  autentizační tajemství a samo nesmí založit školu ani spolek.
- Správce aktivní obce vytvoří jednorázovou pozvánku pro školu nebo spolek.
- Token má 256 bitů náhodnosti, v databázi se ukládá pouze jeho SHA-256 hash,
  platí 14 dní a po použití nebo zrušení už není platný.
- Pozvánku lze volitelně svázat s konkrétní e-mailovou adresou.
- Škola nebo spolek se po kontrole duplicity připojí k obci a čerpá její
  aktivní licenci.
- Správce obce vidí název, typ a stav připojených organizací, nikoli jejich
  uživatelské profily ani osobní nastavení.

## Přechodové scénáře

### Samostatná škola nebo spolek se později připojí pod obec

1. Platformní správce ověří, že jde o stejný subjekt.
2. Přiřadí existující organizaci k obci; nevytváří kopii.
3. Zachová účty, členství, preference, historii a školní join code.
4. Samostatné předplatné ukončí až k dohodnutému datu tak, aby nevzniklo
   dvojí účtování ani přerušení přístupu.

### Obec ukončí nebo pozastaví program

- Podřízená škola nebo spolek bez vlastního předplatného ztratí přístup,
  ale jejich data se nemažou.
- Mohou požádat o vlastní předplatné a pokračovat se stejnou organizací.
- Mají-li už vlastní aktivní předplatné, přístup pokračuje.

### Škola slouží více obcím

Škola se v systému eviduje pouze jednou. Pro účely přístupu má nejvýše
jednu zastřešující obec, zpravidla smluvního partnera nebo zřizovatele.
Další obec nesmí založit duplicitní školu. Případné spolufinancování je
obchodní vztah, nikoli důvod vytvářet druhou organizaci.

### Jedna osoba působí ve více rolích

Uživatel může být například učitel, rodič a správce spolku. Má jeden účet,
více členství a v portálu si volí aktivní organizaci. Pozvánky se deduplikují
podle uživatele/e-mailu; oprávnění a účast se evidují v kontextu zvolené
organizace.

## Identita, duplicity a smluvní strana

- Samotný kontaktní e-mail není identifikátor organizace; jedna osoba může
  spravovat více subjektů.
- Kontroluje se kanonický typ a IČO, případně kombinace
  normalizovaného oficiálního názvu a adresy. Samotný název nestačí,
  protože stejný název mohou mít subjekty v různých obcích.
- IČO není povinné, protože některá školská pracoviště nebo organizační
  jednotky nemusí vystupovat jako samostatná fakturační osoba.
- Pokud škola nebo spolek nemají vlastní fakturační údaje, smlouvu uzavírá
  jejich zřizovatel či provozovatel. Uživatelská organizace v portálu však
  zůstává školou nebo spolkem.
- Sloučení nebo přiřazení existující organizace pod obec provádí pouze
  platformní správce po ověření; obec nesmí cizí subjekt převzít sama.

## Bezpečnost a provoz

- Objednávka vytváří pouze neaktivní organizaci s `pending_approval`.
- Aktivace zákazníka a přiřazení správce probíhají atomicky.
- Souběžné odeslání stejné žádosti je serializované databázovým advisory
  lockem a nesmí vytvořit dvě organizace.
- RLS a členství zůstávají zdrojem administrátorských oprávnění. Dědění
  předplatného nesmí rozšiřovat právo číst nebo měnit data dítěte.
- Veřejná objednávka a registrace organizace používají sdílený databázový
  rate limit; objednávka navíc obsahuje honeypot.
- WebMeeting a všechny další vstupní body musí používat stejné pravidlo
  efektivního přístupu: vlastní aktivní předplatné NEBO aktivní předplatné
  obce, vždy při aktivním stavu organizace.

## Kontrolní scénáře před nasazením

1. Samostatná obec čeká na schválení a před aktivací nemá přístup.
2. Samostatná škola po aktivaci získá přístup a její učitelé se připojí
   školním kódem.
3. Samostatný spolek po aktivaci získá přístup pro kontaktní osobu.
4. Škola a spolek pod aktivní obcí dědí přístup obce.
5. Vlastní aktivní předplatné školy funguje i při pozastavené obci.
6. Neaktivní nebo zablokovaná organizace nemá přístup ani přes aktivní obec.
7. Expirované předplatné se nepovažuje za aktivní.
8. Opakované a souběžné odeslání žádosti nevytvoří duplicitu.
9. Stejný uživatel může bezpečně přepínat mezi školou a spolkem.
10. Správce obce nevidí osobní data školy nebo spolku bez vlastního členství.
11. Registrační číslo obce samo nezaloží organizaci.
12. Neplatný, expirovaný, zrušený nebo již použitý token je odmítnut.
13. Pozvánka svázaná s e-mailem odmítne jinou adresu.
14. Roční a bezplatná licence nejde aktivovat bez data konce.
15. Bezplatná licence nejde aktivovat bez potvrzení učebny ARCHIMEDES.
