# Výherní licence pro jednu organizaci

Správa platformy → Všechny organizace → vyhledat výherce → Výherní licence.
Platí pro existující školu, senior klub či jinou nesystémovou organizaci, včetně organizace pod obcí. Nejprve vyhledat a používat její stávající kartu; změna nezakládá účty ani organizace.

Správce zadá začátek a nepovinnou poznámku. Databáze vypočítá jeden kalendářní rok v Europe/Prague, včetně posledního dne. Například 17. 9. 2026 až 16. 9. 2027. Bez fakturace a ověřování učebny, bez automatického obnovení. Přidělení nemění smluvní souhlas, license_activation_basis, uživatele ani členství. Audit používá existující municipality_card_changes.

Plan competition_prize_12m se nikdy nedědí. Ani když výhercem je obec nebo nadace, její děti nezískají přístup. Vlastní výhra dítěte funguje nezávisle na licenci obce. Po skončení výhry zůstává případný jiný platný zděděný nárok. Budoucí výhra neotevře přístup před začátkem.

Platnou nebo pozastavenou vlastní licenci nelze přepsat výhrou; administrace vysvětlí konflikt. Opakování stejného přidělení neprodlouží licenci a nevytvoří druhý audit. Budoucí výhru vedle jiné vlastní licence nyní neplánujeme; stávající datový model ukládá jednu vlastní licenci. Po expiraci lze přidělit novou výhru nebo ručně změnit na placený plán.

Výhru přiděluje oddělené admin-only RPC grant_organization_prize, SECURITY INVOKER + RLS. Není součástí veřejné žádosti ani obchodního onboardingu: preflight/onboard/activate a requested_license_plan záměrně nadále odmítají výhru. Tím nevznikají účty, objednávky ani e-maily jako vedlejší efekt přidělení. Tabulka licenses se nepoužívá. Školní pozvánky umějí využít vlastní výherní licenci a po expiraci znovu platnou obecní licenci.

Nasazení: migrace před aplikací. Žádné automatické přidělení existující organizaci.
Návrat: UI lze vrátit na předchozí verzi, ale databázová pravidla izolace výhry musí zůstat, pokud již byla výhra přidělena. Neobnovovat staré dědění, které by výhru obce rozšířilo na děti. Před případným odstraněním migrace ověřit nulový počet výherních licencí.
