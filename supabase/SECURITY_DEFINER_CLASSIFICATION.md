# Klasifikace autentizovaných `SECURITY DEFINER` funkcí

Stav po issue #106. `EXECUTE` pro `anon` a `PUBLIC` zůstává odebrané u všech
živých autentizovaných RPC a helperů.

| Funkce | Klasifikace | Rozhodnutí |
| --- | --- | --- |
| `activate_customer_with_admin_v2(...)` | nutné administrační RPC | Zachovat `SECURITY DEFINER`; volá se s JWT platformového admina, uvnitř ověřuje `is_admin()`, prázdný `search_path`. |
| `get_my_organizations(uuid[])` | nutné uživatelské RPC | Zachovat; omezuje výsledek přes `auth.uid()`, prázdný `search_path`. |
| `get_portal_archive_events()` | nutné uživatelské RPC | Zachovat; vyžaduje platform admina nebo aktivní licencované členství, prázdný `search_path`. |
| `get_portal_broadcast_sessions(uuid[])` | nutné uživatelské RPC | Zachovat; vyžaduje platform admina nebo aktivní licencované členství, prázdný `search_path`. |
| `is_platform_admin()` | RLS helper | Zachovat `SECURITY DEFINER`, aby nevznikla rekurze RLS nad `platform_admins`; výsledek je svázaný s `auth.uid()`. |
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
  přístup ke všem živým funkcím;
- test skončil `ROLLBACK` a následná kontrola potvrdila nula testovacích uživatelů,
  škol a organizací.

Relevantní varování Security Advisoru se na této větvi snížila z 10 na 8:
zmizela varování pro invoker alias `is_admin()` a odstraněnou funkci
`set_featured_best_practice_post(uuid)`. Zbývajících osm varování přesně odpovídá
výše zdokumentovaným nutným RPC/helperům. Dočasná větev byla po ověření smazána.
