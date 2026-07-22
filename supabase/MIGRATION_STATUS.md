# Stav migrací ARCHIMEDES Live

Zdroj pravdy: živý projekt `ARCHIMEDESLive` (`gipikahmjlcynkqexxmz`) a
aktuální pracovní větev. Produkční databáze se nemění pouhým přidáním
souborů do tohoto adresáře.

## V produkci potvrzeno

- `0001` – hierarchie organizací a registrační číslo
- `0002` – číselník činností a osobní preference
- bezpečnost `user_interests` / `announcements`
- registrace obce a spolku
- `0004` – uzamčení backup tabulek
- `0005` – kontrola duplicit obce
- `0006` – sekce číselníku zájmů
- `0007` – Dobrá praxe; v repozitáři rekonstruováno ze
  `schema_migrations.statements`, v produkci již aplikováno
- `0008_protect_organization_registration_codes.sql`
  - v produkci aplikováno jako verze `20260715201159`
  - bezpečné RPC `get_my_organizations`
  - efektivní licence školy/spolku se čte z rodičovské obce
  - kódy vidí jen správce organizace nebo platformový admin
  - přímý klientský SELECT celé tabulky `organizations` je omezen na
    platformové adminy
- `0009_remove_demo_membership_role.sql`
  - v produkci aplikováno jako verze `20260715201218`
  - před změnou se zastaví, pokud existuje jakékoli demo členství
  - odstraní staré překrývající se CHECK constrainty s `demo_viewer`
  - povolí už jen role `organization_admin` a `member`
- `0010_atomic_municipality_activation.sql`
  - v produkci aplikováno jako verze `20260715201241`
  - profil, členství správce a stav obce mění v jedné DB transakci
  - kontroluje platformového admina uvnitř `SECURITY DEFINER` funkce
  - existující Auth účet, UUID a heslo nijak nemění

- `0014_municipality_onboarding.sql`
  - v produkci transakčně aplikováno 22. 7. 2026;
  - před aplikací potvrzen aktuální šifrovaný a obnovou prověřený bod obnovy;
  - po aplikaci read-only ověřeno všech 11 nových sloupců, 4 omezení,
    obě tabulky, RLS, obě funkce a přístupová práva;
  - kontrola proběhla v transakci `READ ONLY` zakončené `ROLLBACK`;
  - obchodní metadata licence, přesná platnost a audit aktivace;
  - samostatné ověření nároku obce s učebnou na 12 měsíců zdarma;
  - jednorázové hashované pozvánky školy/spolku pod obec;
  - databázový rate limit veřejné objednávky a registrací;
  - nová aktivační funkce `activate_customer_with_admin_v2`.
- Aplikační kód používající `0014` zatím nebyl sloučen ani nasazen.
- Následuje řízený test objednávka → aktivace → pozvánka → registrace
  a ověření negativních scénářů před produkčním nasazením aplikace.

## Stav nasazení

1. Předmigrační `supabase/preflight/legacy_migration_readiness.sql` byl
   spuštěn read-only a jeho výstup zkontrolován.
2. Databázové migrace `0008`, `0009` a `0010` byly aplikovány v tomto
   pořadí a po každé byly ověřeny vzniklé objekty.
3. Preflight byl po migracích zopakován; počty organizací, členství a
   příjemců zůstaly beze změny.
4. Migrace `0014` byla po potvrzení bodu obnovy aplikována v jediné
   transakci a následně samostatně ověřena read-only kontrolou.
5. Aplikační PR č. 39 zůstává nesloučený; před jeho nasazením následuje
   řízený test onboardingu a negativních scénářů.

## Neměnné migrační podmínky

- nemažou se ani znovu nevytvářejí Auth účty;
- zachovávají se UUID, e-maily a hesla všech existujících uživatelů;
- zachovává se všech 10 vazeb `orders_start.organization_id`;
- zůstává interní `Testovací škola ARCHIMEDES`, UUID
  `339612be-8577-4cce-8ef4-e77a4bc0b442`, `is_system = true`;
- Louny, Ostrava a Luže jsou obchodně potvrzené platící školy;
- placená/darovaná licence není runtime oprávnění a nesmí rozdělit uživatele;
- žádná preference zájmu nevytváří členství v organizaci;
- veřejný kód spolku nezakládá další osobní účty; správce spolku upravuje
  vlastní preference až ve svém přihlášeném profilu;
- samostatné připojení člena k organizaci zůstává výjimkou pouze pro učitele
  školy přes školní kód;
- nový uživatel se nemůže sám označit jako `individual`; existující legacy
  individuální profily se tím nemažou ani nemění;
- při více aktivních členstvích se organizace nikdy nevybírá náhodně;
- původní `/welcome` není produktový onboarding; pouze přesměruje na
  servisní `/nastaveni-pristupu` pro volbu organizace nebo řešení účtu bez
  členství;
- školní návod a školní kód se v portálu zobrazují jen správci školy, nikdy
  správci obce nebo spolku;
- Google Meet URL je odkaz pro živé vysílání, nikdy archivní záznam;
- ze starého `events.stream_url` lze do archivu převzít jen prokazatelný
  YouTube odkaz; ostatní záznamy se doplní ručně do `recording_url`;
- nový `broadcast_sessions.recording_url` se uživatelům ukáže až se stavem
  `recording_status = 'published'`;
- demo se neobnovuje.

Ruční přiřazení škol pod obce přijde až po schválení konkrétní mapy
`škola -> obec`. Bez této mapy se `parent_organization_id` hromadně nemění.

Před ručním převodem starých archivů se spustí pouze read-only report
`supabase/preflight/archive_recording_classification.sql`. Report nic
nepřepisuje; rozděluje odkazy na skutečné YouTube záznamy, Meet odkazy,
jiné odkazy k posouzení a chybějící záznamy.
