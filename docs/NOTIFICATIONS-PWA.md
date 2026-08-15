# PWA a notifikace ARCHIMEDES Live

## Cíl

Uživatel má na jednom místě vidět, co je nového, a může si zapnout připomenutí konkrétního vysílání. PWA později umožní instalaci webu na plochu telefonu a push oznámení; e-mail zůstane dostupným a spolehlivým kanálem.

## Bezpečné pořadí zavádění

1. **Datový základ (tato změna):** preference kanálů, odběr připomenutí události, push subscription, interní schránka, fronta doručení a trvalý výběr cílových skupin.
2. **Uživatelské rozhraní:** tlačítko „Připomenout“, centrum novinek a nastavení e-mail/push.
3. **Instalovatelná PWA:** manifest, ikony, service worker a řízené vyžádání oprávnění k oznámením.
4. **Generování oznámení:** idempotentní plánovač připraví novinky a připomínky; stále bez aktivního externího odesílání.
5. **Kontrolovaný pilot:** testovací adresy a zařízení, metriky doručení, odhlášení a zpracování chyb.
6. **Postupná aktivace:** nejprve interní schránka, poté e-mail a nakonec push. Každý kanál má samostatný vypínač.

## Pravidla této etapy

- Automatické notifikace jsou ve výchozím stavu vypnuté (`notifications_enabled = false`).
- Migrace nic neplánuje, neposílá a nezavádí cron.
- Každé budoucí doručení má jedinečný `dedupe_key`, aby se stejná zpráva neposlala dvakrát.
- Fronta a audit doručení jsou dostupné pouze serverové roli.
- Uživatel vidí a upravuje pouze vlastní preference, odběry a push zařízení.
- Administrátorem vybrané cílové skupiny se uloží k vysílání; po opětovném otevření se svévolně nepřepočítají.

## Co zatím záměrně chybí

- service worker, manifest a ikony PWA,
- poskytovatel push zpráv a e-mailové šablony,
- cron nebo jiný plánovač,
- zapnutí odesílání v produkci,
- automatické odeslání příjemců do WebMeetingu.

Tyto části patří do samostatných, snadno vratných kroků po kontrole datového základu.
