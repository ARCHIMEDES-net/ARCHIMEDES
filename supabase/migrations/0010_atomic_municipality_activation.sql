-- Aktivace obce musí atomicky spojit tři změny: profil kontaktní osoby,
-- její členství organization_admin a aktivní stav obce. Auth účet vzniká
-- mimo PostgreSQL přes Supabase Auth; existující účet se nikdy nemaže ani
-- znovu nevytváří.
create or replace function public.activate_municipality_with_admin(
  p_organization_id uuid,
  p_user_id uuid,
  p_email text,
  p_full_name text,
  p_must_set_password boolean default false
)
returns table (organization_id uuid, registration_number text)
language plpgsql
security definer
set search_path = public
as $$
declare
  municipality public.organizations%rowtype;
begin
  if not public.is_admin() then
    raise exception 'Tuto akci může provést pouze správce platformy.';
  end if;

  select *
  into municipality
  from public.organizations
  where id = p_organization_id
    and org_type = 'obec'
  for update;

  if not found then
    raise exception 'Obec nebyla nalezena.';
  end if;

  insert into public.profiles (
    id,
    email,
    full_name,
    is_active,
    must_set_password,
    active_organization_id
  )
  values (
    p_user_id,
    lower(trim(p_email)),
    trim(p_full_name),
    true,
    p_must_set_password,
    municipality.id
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = excluded.full_name,
    is_active = true,
    must_set_password = case
      when p_must_set_password then true
      else profiles.must_set_password
    end,
    active_organization_id = municipality.id;

  insert into public.organization_members (
    organization_id,
    user_id,
    role_in_org,
    status
  )
  values (
    municipality.id,
    p_user_id,
    'organization_admin',
    'active'
  )
  on conflict (user_id, organization_id) do update set
    role_in_org = 'organization_admin',
    status = 'active';

  update public.organizations
  set license_status = 'active', status = 'active'
  where id = municipality.id;

  return query
  select municipality.id, municipality.registration_number;
end;
$$;

revoke all on function public.activate_municipality_with_admin(uuid, uuid, text, text, boolean)
  from public, anon;
grant execute on function public.activate_municipality_with_admin(uuid, uuid, text, text, boolean)
  to authenticated;
