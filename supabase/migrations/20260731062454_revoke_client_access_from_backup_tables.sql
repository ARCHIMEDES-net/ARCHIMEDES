do $$
declare
  t record;
begin
  for t in
    select tablename
    from pg_tables
    where schemaname = 'public'
      and tablename like 'backup_%'
  loop
    execute format(
      'revoke all privileges on table public.%I from anon, authenticated',
      t.tablename
    );
  end loop;
end
$$;
