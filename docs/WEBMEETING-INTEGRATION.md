# Integrace WebMeetingu

## Cílový model

ARCHIMEDES Live je zdroj pravdy pro události, uživatele, organizace, licence a
oprávnění. WebMeeting je pouze technický poskytovatel živé místnosti.

- místnost zakládá platformní administrátor z produkční karty události;
- pozvánka směřuje na detail události v ARCHIMEDES Live;
- divák se nejprve autentizuje v ARCHIMEDES Live;
- server ověří aktivní členství a efektivní licenci partnerské obce;
- unikátní vstupní URL se vygeneruje až po tomto ověření;
- divácké ani moderátorské URL se neukládají do klientsky čitelné databáze;
- technické ID účastníka se ukládá pro pozdější synchronizaci docházky.

## Serverové proměnné

Následující hodnoty patří pouze do Vercelu nebo lokálního `.env.local`. Nesmí
se používat s prefixem `NEXT_PUBLIC_` ani ukládat do Gitu.

```text
WEBMEETING_API_URL=https://admin.webmeeting.cz/api
WEBMEETING_API_LOGIN=
WEBMEETING_API_CLIENT=
WEBMEETING_API_REQUEST_SECRET=
WEBMEETING_API_RESPONSE_SECRET=
WEBMEETING_API_TIMEOUT_MS=10000
WEBMEETING_MEETING_TYPE=11
WEBMEETING_LOGOUT_URL=https://www.archimedeslive.com/portal/kalendar
```

`WEBMEETING_API_CLIENT` je volitelný; bez něj se použije API login. Typ
místnosti musí WebMeeting potvrdit pro sjednaný tarif a kapacitu.

## Nasazení

1. aplikovat migraci `0011_webmeeting_integration_foundation.sql`;
2. nastavit serverové proměnné ve Vercelu pro Preview;
3. v produkční kartě spustit **Ověřit WebMeeting API**;
4. vytvořit testovací neveřejnou událost a místnost;
5. ověřit moderátorský vstup;
6. ověřit divácký vstup s aktivní a neaktivní licencí;
7. po testu načíst záznam a docházku a záznam ručně publikovat;
8. teprve poté povolit ostré pořady.

## Bezpečnostní pravidla

- API odpověď bez platného HMAC podpisu se odmítne.
- Všechny integrační endpointy administrace vyžadují platformního správce.
- Divácký endpoint je `POST`, používá bearer token a vrací `Cache-Control: no-store`.
- Místnost není veřejná a jedna pozvánka nemá být použitelná více lidmi.
- Tabulka `broadcast_participants` má zapnuté RLS a nemá klientské policies.
- Do WebMeetingu se neposílají zájmy, role ani název organizace; pouze minimum
  nutné pro vstup: technické registrační číslo, jméno a e-mail.

## Zatím nezapojené části

- automatická synchronizace záznamu a docházky bez ručního tlačítka;
- automatické rozesílání pozvánek z ARCHIMEDES Live;
- aktualizace a rušení již vytvořené místnosti při změně události;
- webhooky (ve veřejném API nejsou doloženy);
- zátěžové testy, SLA a garantovaný souběh místností.
