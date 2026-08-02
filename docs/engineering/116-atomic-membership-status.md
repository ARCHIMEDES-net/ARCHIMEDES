# #116 – Atomická změna stavu členství bez zásahu do účtu

Tato větev navazuje na `fix/122-user-management-inherited-context` a nesmí být sloučena před dokončením závislého základu.

## Nepřekročitelná pravidla

- Existující obce a školy musí zůstat zachované včetně jejich ID, vazeb a licencí.
- Existující Auth účty musí zůstat zachované.
- Nesmí se měnit hesla, e-maily ani Auth identity.
- Nesmí se mazat záznamy z `auth.users`, `profiles`, `organizations` ani `organization_members`.
- Běžný správce organizace nesmí měnit globální `profiles.is_active`.
- Změna stavu v jedné organizaci nesmí ovlivnit přístupy uživatele v jiné organizaci.

## Přesný rozsah opravy

Připravit jednu serverovou/RPC operaci, která:

1. přijme `organization_id`, `user_id` a `new_status`;
2. povolí pouze stavy `active` a `inactive`;
3. ověří oprávnění přes `can_administer_organization(organization_id)`;
4. ověří existenci cílového členství;
5. změní právě jeden řádek v `organization_members`;
6. nikdy nemění `profiles.is_active`;
7. nikdy nemění `auth.users`, heslo ani e-mail;
8. při jakékoli chybě neprovede žádnou částečnou změnu;
9. vrátí aktualizovaný stav členství.

## Povinné ochrany

- Nelze deaktivovat posledního aktivního `organization_admin` v organizaci.
- Vlastní deaktivace administrátora musí být výslovně rozhodnutá a otestovaná; do té doby ji návrh zakazuje.
- Zděděný správce obce smí operaci provést pouze pro přímou podřízenou organizaci, kterou skutečně spravuje.
- Platform admin nezískává žádné nové pravomoci nad rámec již existujícího `can_administer_organization()`.

## Povinné regresní testy

- Uživatel se členstvím ve dvou organizacích je deaktivován pouze v jedné.
- `profiles.is_active` zůstane beze změny.
- Neoprávněný uživatel neprovede žádný zápis.
- Neexistující členství neprovede žádný zápis.
- Neplatný stav neprovede žádný zápis.
- Poslední aktivní administrátor nemůže být deaktivován.
- Vlastní účet administrátora nelze deaktivovat bez výslovně schváleného pravidla.
- Správce obce může změnit členství v přímé podřízené škole, nikoli v cizí organizaci.
- Žádný test ani implementace nesmí volat mazání Auth účtu, reset hesla nebo změnu e-mailu.

## Mimo rozsah

- onboarding organizací (#117),
- ochrana neveřejných URL a pracovních listů (#118),
- globální deaktivace účtu platform adminem,
- mazání uživatelů,
- změny hesel nebo e-mailů,
- úpravy existujících obcí, škol, licencí nebo registračních čísel.

## Pořadí práce

1. audit současných RLS a serverových helperů;
2. návrh SQL/RPC bez aplikace do produkce;
3. izolované testy migrace a kontraktu;
4. úprava klienta tak, aby volal pouze RPC;
5. CI a Preview;
6. samostatný produkční plán s rollbackem;
7. teprve po explicitním schválení případný merge a nasazení.
