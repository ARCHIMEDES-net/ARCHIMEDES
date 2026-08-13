# Klasifikace autentizovaných `SECURITY DEFINER` funkcí

Stav po issue #106. `EXECUTE` pro `anon` a `PUBLIC` zůstává odebrané u všech
živých autentizovaných RPC a helperů.

| Funkce | Klasifikace | Rozhodnutí |
| --- | --- | --- |
| `activate_customer_with_admin_v2(...)` | nutné administrační RPC | Zachovat `SECURITY DEFINER`; volá se s JWT platformového admina, uvnitř ověřuje `is_admin()`, prázdný `search_path`. |
| `onboard_customer_v3(...)` | nutné administrační RPC | Nový jednotný onboarding: ověřuje `auth.uid()` a `is_platform_admin()`, používá prázdný `search_path`, transakčně zapisuje profil, členství, licenci a audit; podle skutečného serverového volajícího má `EXECUTE` pouze `authenticated`. |
| `claim_onboarding_email_attempt(...)` | nutné administrační RPC | Pod řádkovým zámkem vytváří jediný `sending` pokus a audit návaznosti; vyžaduje aktuální `is_platform_admin()`. |
| `complete_onboarding_email_attempt(...)` | nutné administrační RPC | Atomicky uzavírá právě claimnutý pokus jako `sent`, `failed` nebo `delivery_unknown`; vyžaduje aktuální `is_platform_admin()`. |
| `mark_stale_onboarding_email_attempt(...)` | nutné administrační RPC | Staré `sending` pouze převede do ručního `delivery_unknown`, nikdy neodesílá; vyžaduje aktuální `is_platform_admin()`. |
| `resolve_onboarding_email_without_resend(...)` | nutné administrační RPC | Auditované ruční uzavření bez další zprávy; vyžaduje aktuální `is_platform_admin()`. |
| `get_my_organizations(uuid[])` | nutné uživatelské RPC | Zachovat; omezuje výsledek přes `auth.uid()`, prázdný `search_path`. |
| `get_portal_archive_events()` | existující uživatelské RPC | Zachovat produkční signaturu, návratový typ, členské chování, vlastníka i ACL (`authenticated`, `service_role`). Jeho vlastní platform-admin lookup musí delegovat na zpřísněný `is_platform_admin()`, jinak by neaktivní administrátor prošel. |
| `get_portal_broadcast_sessions(uuid[])` | existující uživatelské RPC | Zachovat produkční signaturu, návratový typ, členské chování, vlastníka i ACL (`authenticated`, `service_role`). Jeho vlastní platform-admin lookup musí delegovat na zpřísněný `is_platform_admin()`, jinak by prošlo osiřelé UUID nebo neaktivní administrátor. |
| `is_platform_admin()` | RLS helper | Zachovat `SECURITY DEFINER`, prázdný `search_path` i produkční ACL (`authenticated`, `service_role`). Nestačí JWT: UUID musí současně existovat v `auth.users`, mít povolenou roli v `platform_admins` a aktivní profil. |
| `is_org_admin_member(uuid)` | RLS helper | Zachovat `SECURITY DEFINER`; kontroluje aktivní přímé členství volajícího v jedné organizaci. |
| `is_school_admin()` | RLS helper | Zachovat `SECURITY DEFINER`, aby profily mohly bezpečně použít helper ve vlastních policies. |
| `my_school_id()` | RLS helper | Zachovat `SECURITY DEFINER`, aby profily mohly bezpečně použít helper ve vlastních policies. |
| `is_admin()` | kompatibilní RLS alias | Změnit na `SECURITY INVOKER`; deleguje na kanonický `is_platform_admin()`. |
| `set_featured_best_practice_post(uuid)` | zastaralé | Odstranit; žádná aplikace, policy, trigger ani jiná funkce ho nevolá. |

Současně se odstraňují staré `activate_customer_with_admin(...)` a
`activate_municipality_with_admin(...)`. Aplikace používá výhradně v2; staré
funkce již před odstraněním neměly `EXECUTE` pro `authenticated` ani `anon`.

Security Advisor může nadále hlásit živé autentizované `SECURITY DEFINER`
funkce. U výše uvedených nutných RPC/helperů jde o vědomě přijatý návrh:
jejich identity a autorizační podmínky se ověřují regresními testy a změny se
nasazují po skupinách, nikoli hromadným odebráním grantů.

Poslední onboardingová migrace navíc přepisuje platformní větve
`get_portal_broadcast_sessions(uuid[])` a `get_portal_archive_events()`, aby
nepoužívaly vlastní neúplný lookup `platform_admins`, ale stejný kanonický
helper. Členské větve obou RPC nadále vyžadují aktivní členství a licenci.
Read-only kontrola produkčního katalogu potvrdila, že obě portálová RPC mají
vlastní lookup pouze v `platform_admins`; samotné zpřísnění helperu by je proto
nezabezpečilo. Nejnovější migrace mění jen tuto privilegovanou větev na volání
`is_platform_admin()`. Dřívější nebo externí klienti si zachovávají stejné
signatury, návratové typy a produkční `EXECUTE` pro `authenticated` a
`service_role`; `PUBLIC` ani `anon` přístup nemají.

Všechna čtyři nová e-mailová RPC mají `EXECUTE` pouze pro `authenticated`. Volá je
serverový API handler klientem sestaveným z anon klíče a konkrétního
uživatelského JWT; výslednou databázovou rolí je proto `authenticated`, nikoli
`anon` ani `service_role`. Každé RPC navíc uvnitř znovu ověřuje živého
platformového správce přes `auth.users`, `platform_admins` a aktivní profil.

## Ověření před nasazením

Dne 9. srpna 2026 byla migrace aplikována na dočasnou Supabase větev vytvořenou
z produkčního schématu. Transakční integrační test ověřil, že:

- běžný autentizovaný správce organizace neprojde kontrolou platformního admina
  ani nemůže zavolat aktivační RPC;
- helpery pro přímé členství organizace a legacy školní roli vracejí pouze data
  svázaná s `auth.uid()`;
- platformní admin projde kontrolou a `activate_customer_with_admin_v2(...)`
  dokončí celý aktivační tok i s prázdným `search_path`;
- `anon` nemá `EXECUTE`, zatímco `authenticated` a `service_role` si zachovávají
  produkční přístup k existujícím helperům a portálovým RPC; nová onboardingová
  RPC jsou samostatně udělena pouze skutečnému volajícímu `authenticated`;
- test skončil `ROLLBACK` a následná kontrola potvrdila nula testovacích uživatelů,
  škol a organizací.

Relevantní varování Security Advisoru se na této větvi snížila z 10 na 8:
zmizela varování pro invoker alias `is_admin()` a odstraněnou funkci
`set_featured_best_practice_post(uuid)`. Zbývajících osm varování přesně odpovídá
výše zdokumentovaným nutným RPC/helperům. Dočasná větev byla po ověření smazána.
