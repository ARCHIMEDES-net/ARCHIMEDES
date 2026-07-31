-- Allow a profile owner to switch the active organization to any organization
-- that is visible through the centralized authorization model. This includes
-- direct active memberships and direct children administered through a
-- municipality. Platform administrators retain unrestricted access.

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
       and not public.can_view_organization(new.active_organization_id) then
      raise exception using
        errcode = '42501',
        message = 'The active organization must be accessible to the current user.';
    end if;
  end if;

  return new;
end;
$$;

revoke all on function public.enforce_profile_self_update_security()
  from public, anon, authenticated;
