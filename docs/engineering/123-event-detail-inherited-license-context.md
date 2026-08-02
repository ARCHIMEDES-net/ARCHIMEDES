# #123 – Detail události se zděděným licenčním kontextem

Tato větev navazuje na draft PR #115 a nesmí být sloučena před ním.

## Přesný rozsah

- změnit pouze vyhodnocení aktivní organizace na detailu události;
- použít `resolveActiveOrganizationContext()`;
- předat vrácenou organizaci do `resolveLicenseMode()`;
- zachovat `activeOrganizationId` pro docházku;
- zachovat načítání události, plakát, kalendář, pracovní list, WebMeeting a tlačítko vstupu.

## Výslovně mimo rozsah

- neměnit `stream_url`, `worksheet_url` ani veřejné sloupce – to patří do #118;
- neměnit časové okno ani serverové `broadcastAccess`;
- neměnit Storage plakátů ani stránku Vysílali jsme;
- neměnit Auth, hesla, členství ani produkční data.

## Povinné testy

- správce obce v podřízené škole získá správný licenční režim;
- přímý člen školy zůstane funkční;
- nedostupná nebo neaktivní organizace zůstane zamčená;
- docházka, plakát, kalendář, pracovní list a vstup do vysílání zůstanou beze změny.
