# #122 – Správa uživatelů se zděděným kontextem obce

Tato větev navazuje na draft PR #115 a nesmí být sloučena před ním.

## Přesný rozsah

- upravit pouze načtení aktivní organizace a role v `pages/portal/uzivatele.js`;
- použít centralizovaný `resolveActiveOrganizationContext()`;
- umožnit správci rodičovské obce spravovat přímou podřízenou školu;
- zachovat omezení správy uživatelů pouze na aktivní školu;
- nevytvářet přímé členství správce obce ve škole;
- zachovat načítání členů, profilů a pozvánkové UI.

## Výslovně mimo rozsah

- neměnit deaktivaci členství ani `profiles.is_active` – to patří do #116;
- neměnit onboarding nebo Auth účty – to patří do #117;
- neměnit serverové `invite-user`, které je řešené v #115;
- neměnit hesla ani produkční data Křenova a Žleb.

## Povinné testy

- správce rodičovské obce spravuje přímou podřízenou školu;
- správce školy spravuje jen vlastní školu;
- běžný člen je odmítnut;
- správce cizí obce je odmítnut;
- jiný typ aktivní organizace než škola nezpřístupní pozvánky;
- deaktivace uživatele zůstane beze změny a nadále je sledována v #116.
