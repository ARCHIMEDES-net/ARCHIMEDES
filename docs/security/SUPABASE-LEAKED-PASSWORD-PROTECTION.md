# Supabase leaked-password protection

Tento dokument popisuje bezpečné zapnutí kontroly uniklých hesel pro issue #75.
Kontrola používá databázi Have I Been Pwned prostřednictvím Supabase Auth.

## Neměnná podmínka

- Existující hesla, účty, relace ani identifikátory uživatelů se nemění.
- Existující uživatel se může nadále přihlásit svým současným heslem.
- Kontrola se uplatní při vytvoření nového hesla nebo při jeho změně.
- Zapnutí kontroly nesmí současně měnit minimální délku ani požadavky na typy
  znaků v Supabase Auth.

Supabase může při úspěšném přihlášení existujícího účtu vrátit pouze varování
`weakPassword`. Portál toto varování nesmí zaměnit za chybu přihlášení ani
vynutit reset hesla.

## Připravenost portálu

- Veřejná registrace i nastavení hesla vyžadují nejméně 8 znaků.
- Odmítnuté uniklé heslo se uživateli zobrazí česky:
  „Toto heslo bylo nalezeno v databázi dříve uniklých hesel. Z bezpečnostních
  důvodů zvolte jiné, jedinečné heslo.“
- Neznámé chyby poskytovatele se uživateli nezobrazují doslova.
- Přihlášení existujících účtů zůstává beze změny.

## Bezpečný postup zapnutí

1. Nasadit a ověřit přípravu portálu před změnou produkční konfigurace.
2. V Supabase Dashboardu ověřit, že projekt používá tarif Pro nebo vyšší.
3. V části Authentication zapnout pouze leaked-password protection.
4. Na jednorázových testovacích účtech ověřit:
   - odmítnutí známého uniklého hesla při veřejné registraci;
   - přijetí bezpečného hesla při veřejné registraci;
   - odmítnutí uniklého hesla při obnově a prvním nastavení z pozvánky;
   - přijetí bezpečného hesla při obnově a prvním nastavení z pozvánky;
   - úspěšné přihlášení existujícího účtu jeho původním heslem.
5. Zkontrolovat Auth logy a runtime logy portálu, potom testovací účty odstranit.

Při neočekávaném problému se vrací pouze přepínač leaked-password protection.
Nevracejí se migrace a nemanipuluje se s hesly existujících uživatelů.

Referenční dokumentace: https://supabase.com/docs/guides/auth/password-security
