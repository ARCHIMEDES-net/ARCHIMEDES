-- Klientské role nepotřebují strukturální tabulková oprávnění. Běžné SELECT,
-- INSERT, UPDATE a DELETE zůstávají řízené jednotlivými RLS politikami.
-- Odebíráme pouze TRUNCATE, TRIGGER a REFERENCES, které webová aplikace
-- nepoužívá a zbytečně rozšiřují útokovou plochu.

do $$
declare
  target record;
begin
  for target in
    select format('%I.%I', table_schema, table_name) as qualified_name
    from information_schema.tables
    where table_schema = 'public'
      and table_type = 'BASE TABLE'
  loop
    execute format(
      'revoke truncate, trigger, references on table %s from anon, authenticated',
      target.qualified_name
    );
  end loop;
end
$$;
