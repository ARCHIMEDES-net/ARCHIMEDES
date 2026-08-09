-- #118: Keep anonymous programme access while preventing direct reads of
-- private broadcast and archive URLs from published event rows.

create or replace function public.get_public_events(
  p_reference_at timestamp with time zone,
  p_direction text,
  p_limit integer
)
returns table (
  id uuid,
  title text,
  category text,
  audience_groups text[],
  starts_at timestamp with time zone,
  is_published boolean,
  poster_path text,
  poster_url text
)
language plpgsql
stable
security invoker
set search_path = ''
as $$
begin
  if p_reference_at is null then
    raise exception 'Referenční čas je povinný.';
  end if;

  if p_direction not in ('upcoming', 'previous') then
    raise exception 'Neplatný směr veřejného programu.';
  end if;

  if p_limit is null or p_limit < 1 or p_limit > 100 then
    raise exception 'Limit veřejného programu musí být od 1 do 100.';
  end if;

  return query
  select
    event.id,
    event.title,
    event.category,
    event.audience_groups,
    event.starts_at,
    event.is_published,
    event.poster_path,
    event.poster_url
  from public.events event
  where event.is_published = true
    and (
      (p_direction = 'upcoming' and event.starts_at >= p_reference_at)
      or (p_direction = 'previous' and event.starts_at < p_reference_at)
    )
  order by
    case when p_direction = 'upcoming' then event.starts_at end asc,
    case when p_direction = 'previous' then event.starts_at end desc,
    event.id asc
  limit p_limit;
end;
$$;

comment on function public.get_public_events(timestamp with time zone, text, integer) is
  'Returns the explicit non-sensitive event fields used by the public programme.';

revoke all on function public.get_public_events(timestamp with time zone, text, integer)
  from public, anon, authenticated, service_role;
grant execute on function public.get_public_events(timestamp with time zone, text, integer)
  to anon, authenticated;

-- Keep legacy public clients working only for the same explicit safe fields.
-- Revoking the table-level grant also removes anonymous INSERT/UPDATE/DELETE.
revoke all on table public.events from anon;
grant select (
  id,
  title,
  category,
  audience_groups,
  starts_at,
  is_published,
  poster_path,
  poster_url
) on table public.events to anon;
