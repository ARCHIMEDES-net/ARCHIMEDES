# PWA a notifikace ARCHIMEDES Live

## Cíl

Uživatel má na jednom místě vidět, co je nového, a může si zapnout připomenutí konkrétního vysílání. PWA později umožní instalaci webu na plochu telefonu a push oznámení; e-mail zůstane dostupným a spolehlivým kanálem.

## Bezpečné pořadí zavádění

1. **Datový základ (tato změna):** preference kanálů, odběr připomenutí události, push subscription, interní schránka, fronta doručení a trvalý výběr cílových skupin.
2. **Uživatelské rozhraní (součást návrhu):** tlačítko „Připomenout“, centrum novinek a nastavení typů e-mailových upozornění. Push je viditelně označen jako dosud neaktivní.
3. **Instalovatelná PWA (součást návrhu):** manifest, značkové ikony, service worker bez cache uživatelských dat a registrace zařízení pouze po kliknutí uživatele. Push zůstává vypnutý bez VAPID konfigurace.
4. **Generování oznámení:** idempotentní plánovač připraví novinky a připomínky; stále bez aktivního externího odesílání.
5. **Kontrolovaný pilot:** testovací adresy a zařízení, metriky doručení, odhlášení a zpracování chyb.
6. **Postupná aktivace:** nejprve interní schránka, poté e-mail a nakonec push. Každý kanál má samostatný vypínač.

## Pravidla této etapy

- Automatické notifikace jsou ve výchozím stavu vypnuté (`notifications_enabled = false`).
- Výchozí politika doručení je pouze interní schránka (`in_app_only`). WebMeeting
  může rozesílat vlastní pozvánky a připomenutí, proto ARCHIMEDES nesmí vytvářet
  e-mailové ani push doručení, dokud správce výslovně nepotvrdí vlastnictví kanálu.
- Produkční účet WebMeetingu byl 15. 8. 2026 ověřen přímo v administraci:
  systémový přístupový e-mail se automaticky rozesílá 30 minut před setkáním.
  Vlastní šablona není nutná; při její absenci se použije systémová šablona.
  ARCHIMEDES proto drží 30minutové upozornění pouze v interním centru a nikdy
  pro něj nevytvoří e-mail ani push, a to ani při politice `archimedes_all`.
- WebMeeting rovněž používá systémovou šablonu pro potvrzení návštěvníkovi,
  který se sám zapíše k on-line setkání nebo k záznamu. ARCHIMEDES tento
  potvrzovací e-mail neduplikuje.
- Pro účet nejsou nastavené vlastní šablony pozvánek před setkáním, follow-upů
  ani automatické zprávy po zpracování záznamu. Případné budoucí změny těchto
  šablon vyžadují novou kontrolu vlastnictví kanálů.
- Jednotlivé nově publikované pořady se zobrazují pouze v centru novinek.
  Externí kanály se pro ně nepoužijí, dokud nevznikne souhrnný digest. Pokud
  současně připadne připomínka stejného pořadu, má přednost jediná připomínka.
- Vercel spouští idempotentní plánovač každých 10 minut. Zápis proběhne jen při
  `NOTIFICATION_GENERATION_ENABLED=true`; trasa je chráněná `CRON_SECRET`.
- iOS zobrazí počet nepřečtených novinek na ikoně PWA až po jednorázovém
  systémovém povolení oznámení. Centrum „Co je nového“ proto nabízí samostatné
  tlačítko pro toto povolení. Samotné povolení nevytvoří push subscription,
  nezapne e-mail ani nezačne odesílat push zprávy.
- Správce navíc musí u konkrétního připraveného vysílání výslovně zapnout
  „Aktivovat oznámení v aplikaci“. Aktuální politika se při uložení vždy nastaví
  na `in_app_only`, takže tato volba neodešle e-mail ani push.
- Každé budoucí doručení má jedinečný `dedupe_key`, aby se stejná zpráva neposlala dvakrát.
- Fronta a audit doručení jsou dostupné pouze serverové roli.
- Uživatel vidí a upravuje pouze vlastní preference, odběry a push zařízení.
- Administrátorem vybrané cílové skupiny se uloží k vysílání; po opětovném otevření se svévolně nepřepočítají.

## Co zatím záměrně chybí

- produkční VAPID klíč a serverové podepisování push zpráv,
- poskytovatel push zpráv a e-mailové šablony,
- zapnutí externího e-mailového nebo push odesílání v produkci,
- automatické odeslání příjemců do WebMeetingu.

Tyto části patří do samostatných, snadno vratných kroků po kontrole datového základu.

## Konfigurace připravená pro další etapu

- `NEXT_PUBLIC_VAPID_PUBLIC_KEY` – veřejná část VAPID klíče, kterou může obdržet prohlížeč. Bez ní zůstává tlačítko push vypnuté.
- Soukromý VAPID klíč se do klientského kódu ani repozitáře nesmí vložit. Bude uložen pouze jako serverové tajemství při zavedení odesílací služby.

Samotné doplnění veřejného klíče ještě nesmí zapnout plánovač ani hromadné odesílání. To patří až do kontrolovaného pilotu.
