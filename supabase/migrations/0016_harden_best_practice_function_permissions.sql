-- Bezpečnostní hardening starší SECURITY DEFINER funkce Dobré praxe.
-- Funkce už uvnitř ověřuje platformového administrátora přes is_admin(),
-- ale původní migrace výslovně neodebrala PostgreSQL výchozí EXECUTE roli PUBLIC.
-- Tato změna nemění data ani logiku funkce, pouze zpřesňuje oprávnění.

revoke all on function public.set_featured_best_practice_post(uuid)
  from public, anon;

grant execute on function public.set_featured_best_practice_post(uuid)
  to authenticated;
