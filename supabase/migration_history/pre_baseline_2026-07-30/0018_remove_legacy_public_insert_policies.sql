-- Veřejné formuláře zapisují přes serverová API se service_role, validací,
-- honeypotem a databázovým rate limitem. Přímé anonymní INSERT politiky
-- obcházejí tyto ochrany a nejsou už potřeba.

drop policy if exists "Allow insert for anyone" on public.access_requests;

drop policy if exists "Allow insert for anyone" on public.orders_start;
drop policy if exists "orders_start_insert_public" on public.orders_start;

drop policy if exists "public_insert_leads" on public.leads;

-- Zároveň odebereme tabulková INSERT oprávnění klientským rolím. Service role
-- a vlastník databáze zůstávají nedotčeni.
revoke insert on table public.access_requests from anon, authenticated;
revoke insert on table public.orders_start from anon, authenticated;
revoke insert on table public.leads from anon, authenticated;
