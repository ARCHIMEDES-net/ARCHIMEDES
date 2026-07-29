-- Bezpečnostní hardening SECURITY DEFINER funkcí bez změny dat nebo chování.

-- Trigger se spouští interně při založení Auth uživatele. Pevný search_path
-- brání nechtěnému rozlišení objektů mimo schéma public.
alter function public.handle_new_user()
  set search_path = public;

-- Trigger funkce nepotřebuje přímé volání klientskými rolemi.
revoke all on function public.handle_new_user()
  from public, anon, authenticated;

-- Výběr featured příspěvku smí volat jen přihlášený uživatel;
-- samotná funkce dál uvnitř vyžaduje public.is_admin().
revoke all on function public.set_featured_best_practice_post(uuid)
  from public, anon;

grant execute on function public.set_featured_best_practice_post(uuid)
  to authenticated;
