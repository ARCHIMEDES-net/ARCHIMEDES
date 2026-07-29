-- Prevent a signed-in user from changing authorization-bearing columns on
-- their own profile. The existing profiles_update_own RLS policy correctly
-- limits the row to auth.uid(), but RLS cannot distinguish safe profile
-- preferences from role, school or account-status changes on that row.

create or replace function public.enforce_profile_self_update_security()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  -- Server-side service-role/database maintenance has no end-user auth.uid().
  -- Platform administrators retain their existing management permissions.
  if auth.uid() is null or public.is_platform_admin() then
    return new;
  end if;

  if old.id = auth.uid() then
    if new.id is distinct from old.id
       or new.email is distinct from old.email
       or new.role is distinct from old.role
       or new.school_id is distinct from old.school_id
       or new.is_active is distinct from old.is_active
       or new.user_type is distinct from old.user_type
       or new.created_at is distinct from old.created_at then
      raise exception using
        errcode = '42501',
        message = 'Authorization fields cannot be changed by the profile owner.';
    end if;

    if new.active_organization_id is distinct from old.active_organization_id
       and new.active_organization_id is not null
       and not exists (
         select 1
         from public.organization_members member
         where member.user_id = auth.uid()
           and member.organization_id = new.active_organization_id
           and member.status = 'active'
       ) then
      raise exception using
        errcode = '42501',
        message = 'The active organization must be an active membership.';
    end if;
  end if;

  return new;
end;
$$;

revoke all on function public.enforce_profile_self_update_security()
  from public, anon, authenticated;

drop trigger if exists enforce_profile_self_update_security
  on public.profiles;

create trigger enforce_profile_self_update_security
  before update on public.profiles
  for each row
  execute function public.enforce_profile_self_update_security();
