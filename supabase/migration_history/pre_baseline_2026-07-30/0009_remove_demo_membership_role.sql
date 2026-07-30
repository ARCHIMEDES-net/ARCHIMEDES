-- Demo není součástí nového produktu. API starých demo cest vracejí 410
-- a živá kontrola před přípravou této migrace potvrdila 0 demo členství.
-- Migrace se přesto zastaví, pokud by se takový řádek mezitím objevil.
do $$
begin
  if exists (
    select 1
    from public.organization_members
    where role_in_org = 'demo_viewer'
  ) then
    raise exception 'Migraci nelze spustit: existuje členství demo_viewer.';
  end if;
end
$$;

-- V živém schématu jsou dva překrývající se CHECK constrainty role.
-- Odstraníme pouze ty, jejichž definice výslovně obsahuje demo_viewer.
do $$
declare
  constraint_row record;
begin
  for constraint_row in
    select conname
    from pg_constraint
    where conrelid = 'public.organization_members'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) like '%demo_viewer%'
  loop
    execute format(
      'alter table public.organization_members drop constraint %I',
      constraint_row.conname
    );
  end loop;
end
$$;

alter table public.organization_members
  drop constraint if exists organization_members_role_in_org_allowed;

alter table public.organization_members
  add constraint organization_members_role_in_org_allowed
  check (role_in_org = any (array['organization_admin'::text, 'member'::text]));
