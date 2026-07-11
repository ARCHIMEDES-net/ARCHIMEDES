-- Blok A — bezpečnostní/UX dofix: funkce pro detekci duplicitní obce.
--
-- Kontext: smoke test bloku A (11.7.2026) potvrdil, že opakované odeslání
-- /zadost se stejným e-mailem/názvem obce vytvoří DRUHOU samostatnou obec
-- (ověřeno v produkci, reg. čísla 2780 a 6781 pro tutéž "Obec SMOKETEST
-- BlokA"). /api/zadost-o-pristup.js teď před insertem zavolá tuhle funkci
-- a při shodě vrátí žadateli srozumitelnou chybu místo tichého duplicitního
-- insertu.
--
-- Normalizace názvu (lower + unaccent) řeší "Obec Křenov" vs "obec krenov"
-- vs "OBEC KŘENOV" apod. — unaccent už je v DB nainstalované (extension
-- v schématu public, viz advisor). Match jen na obce ve stavu
-- pending_approval/active — zamítnutá/zrušená obec (budoucí stav) by
-- novou žádost blokovat neměla.
create or replace function public.find_conflicting_obec(p_email text, p_name text)
returns table (id uuid, license_status text)
language sql
stable
set search_path = public
as $$
  select o.id, o.license_status
  from organizations o
  where o.org_type = 'obec'
    and o.license_status in ('pending_approval', 'active')
    and (
      (p_email is not null and lower(o.contact_email) = lower(p_email))
      or unaccent(lower(o.name)) = unaccent(lower(p_name))
    )
  limit 1;
$$;
