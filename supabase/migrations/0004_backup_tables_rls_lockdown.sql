-- Blok A — bezpečnostní dofix: zamknout backup_* tabulky.
--
-- Kontext: smoke test bloku A (11.7.2026) narazil na Supabase security
-- advisor nález rls_disabled_in_public (level ERROR) na 9 tabulkách
-- s prefixem backup_ — RLS na nich bylo vypnuté, tedy plně čitelné a
-- zapisovatelné přes anon klíč (PostgREST je vystavuje stejně jako
-- jakoukoli jinou tabulku ve schématu public).
--
-- Ověřeno před psaním téhle migrace (grep, ne odhadem): žádný soubor v
-- pages/, lib/, components/ ani supabase/ se na žádnou z těchto 9 tabulek
-- neodkazuje. Jde o pozůstatky ručních čistících/zálohovacích kroků
-- (name pattern _to_delete / _final_cleanup / _before_cleanup / _null_pending
-- napovídá jednorázové admin zásahy), ne o tabulky, na které by dnes sahala
-- aplikace. Proto zamykám všech 9 bez výjimky.
--
-- Řešení: zapnout RLS a nepřidávat žádnou policy. V Supabase má service_role
-- (server-side klíč, jediné, co dnes tyhle tabulky případně čte/píše) atribut
-- BYPASSRLS, takže RLS ho nijak neomezí. Role anon/authenticated (klientská
-- strana, PostgREST) bez jediné policy nemají k tabulce žádný přístup — to
-- je přesně žádaný výchozí stav "žádný přístup přes anon/authenticated, jen
-- service_role", bez nutnosti psát explicitní deny-all policy navíc.

alter table public.backup_orders_start_to_delete_orgs enable row level security;
alter table public.backup_orders_start_null_pending enable row level security;
alter table public.backup_organizations_to_delete enable row level security;
alter table public.backup_profiles_before_cleanup enable row level security;
alter table public.backup_organization_members_to_delete enable row level security;
alter table public.backup_organizations_final_cleanup enable row level security;
alter table public.backup_organization_members_final_cleanup enable row level security;
alter table public.backup_orders_start_final_cleanup enable row level security;
alter table public.backup_profiles_final_cleanup enable row level security;
