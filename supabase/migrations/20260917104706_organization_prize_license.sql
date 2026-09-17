-- A prize is a direct entitlement, never inherited by another organization.
alter table public.organizations drop constraint organizations_license_plan_allowed;
alter table public.organizations add constraint organizations_license_plan_allowed check (
 license_plan is null or license_plan in ('paid_monthly','paid_annual','classroom_free_12m','competition_prize_12m'));
alter table public.organizations add constraint organizations_prize_terms check (
 license_plan is distinct from 'competition_prize_12m' or (
 billing_status = 'not_applicable' and license_started_at is not null and license_valid_until is not null
 and license_valid_until > license_started_at
 and license_valid_until = (((license_started_at at time zone 'Europe/Prague') + interval '1 year') at time zone 'Europe/Prague') - interval '1 microsecond'
 ));

-- Reuse the existing admin-only organization change journal; no proof-of-prize table.
create function public.grant_organization_prize(p_organization_id uuid, p_start date, p_reference text default null)
returns public.organizations
language plpgsql security invoker set search_path = ''
as $$
declare
 target public.organizations%rowtype;
 result public.organizations%rowtype;
 starts timestamptz;
 ends timestamptz;
begin
 if (select auth.uid()) is null or not public.is_platform_admin() then
   raise exception using errcode='42501', message='Výhru může přidělit pouze správce platformy.';
 end if;
 if p_start is null then raise exception using errcode='22023', message='Vyplňte začátek licence.'; end if;
 if char_length(coalesce(p_reference,'')) > 500 then raise exception using errcode='22023', message='Poznámka může mít nejvýše 500 znaků.'; end if;
 starts := p_start::timestamp at time zone 'Europe/Prague';
 ends := (p_start::timestamp + interval '1 year') at time zone 'Europe/Prague';
 ends := ends - interval '1 microsecond';
 select * into target from public.organizations where id=p_organization_id for update;
 if not found or coalesce(target.is_system,false) then
   raise exception using errcode='22023', message='Vyberte existující nesystémovou organizaci.';
 end if;
 -- An identical retry must not renew the licence or duplicate the audit.
 if target.license_plan='competition_prize_12m' and target.license_status='active'
   and target.license_started_at=starts and target.license_valid_until=ends then return target; end if;
 if (target.license_plan is not null or target.parent_organization_id is null) and target.license_status in ('active','suspended')
   and (target.license_valid_until is null or target.license_valid_until >= now()) then
   raise exception using errcode='23505', message='Organizace má dosud platnou vlastní licenci. Výhra ji nesmí přepsat. Přidělte ji až po skončení stávající licence.';
 end if;
 update public.organizations set license_plan='competition_prize_12m', license_status='active', status='active',
   license_started_at=starts, license_valid_until=ends, billing_status='not_applicable',
   activated_at=now(), activated_by=(select auth.uid())
 where id=target.id returning * into result;
 insert into public.municipality_card_changes(organization_id,actor_id,action,previous_values,current_values)
 values(target.id,(select auth.uid()),'activated',
   jsonb_build_object('license_plan',target.license_plan,'license_started_at',target.license_started_at,'license_valid_until',target.license_valid_until,'license_status',target.license_status,'status',target.status,'billing_status',target.billing_status),
   jsonb_build_object('license_plan',result.license_plan,'license_started_at',starts,'license_valid_until',ends,'scope','organization_only','reference',nullif(btrim(p_reference),'')));
 return result;
end;
$$;
revoke all on function public.grant_organization_prize(uuid,date,text) from public,anon,service_role;
grant execute on function public.grant_organization_prize(uuid,date,text) to authenticated;

CREATE OR REPLACE FUNCTION public.get_my_organizations(requested_ids uuid[] DEFAULT NULL::uuid[])
 RETURNS TABLE(id uuid, name text, org_type text, status text, parent_organization_id uuid, license_status text, license_valid_until timestamp with time zone, join_code text, registration_number text, is_system boolean, role_in_org text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  with accessible as (
    select member.organization_id, member.role_in_org, 1 as priority
    from public.organization_members member
    where member.user_id = auth.uid()
      and member.status = 'active'

    union all

    select child.id, 'organization_admin'::text, 2
    from public.organization_members parent_admin
    join public.organizations parent
      on parent.id = parent_admin.organization_id
    join public.organizations child
      on child.parent_organization_id = parent.id
    where parent_admin.user_id = auth.uid()
      and parent_admin.role_in_org = 'organization_admin'
      and parent_admin.status = 'active'
      and lower(parent.org_type) in ('municipality', 'obec', 'foundation')

    union all

    select organization.id, 'organization_admin'::text, 3
    from public.organizations organization
    where public.is_platform_admin()
  ), deduplicated as (
    select distinct on (accessible.organization_id)
      accessible.organization_id,
      accessible.role_in_org
    from accessible
    order by accessible.organization_id, accessible.priority
  )
  select
    child.id,
    child.name,
    child.org_type,
    child.status,
    child.parent_organization_id,
    case
      when child.status <> 'active' then 'inactive'
      when (parent.license_plan is distinct from 'competition_prize_12m' or child.license_plan is not null)
        and child.license_status = 'active' and (child.license_plan is distinct from 'competition_prize_12m' or child.license_started_at <= now())
        and (child.license_valid_until is null or child.license_valid_until >= now())
        then 'active'
      when parent.status = 'active'
        and lower(parent.org_type) in ('municipality', 'obec', 'foundation')
        and parent.license_status = 'active' and parent.license_plan is distinct from 'competition_prize_12m'
        and (parent.license_valid_until is null or parent.license_valid_until >= now())
        then 'active'
      when child.license_status = 'suspended' or parent.license_status = 'suspended'
        then 'suspended'
      when child.license_status = 'pending_approval' or parent.license_status = 'pending_approval'
        then 'pending_approval'
      else 'inactive'
    end,
    case
      when (parent.license_plan is distinct from 'competition_prize_12m' or child.license_plan is not null)
        and child.license_status = 'active' and (child.license_plan is distinct from 'competition_prize_12m' or child.license_started_at <= now())
        and (child.license_valid_until is null or child.license_valid_until >= now())
        then child.license_valid_until
      when parent.status = 'active'
        and lower(parent.org_type) in ('municipality', 'obec', 'foundation')
        and parent.license_status = 'active' and parent.license_plan is distinct from 'competition_prize_12m'
        and (parent.license_valid_until is null or parent.license_valid_until >= now())
        then parent.license_valid_until
      else null
    end,
    case when deduplicated.role_in_org = 'organization_admin' or public.is_platform_admin()
      then child.join_code else null end,
    case when deduplicated.role_in_org = 'organization_admin' or public.is_platform_admin()
      then child.registration_number else null end,
    child.is_system,
    deduplicated.role_in_org
  from deduplicated
  join public.organizations child on child.id = deduplicated.organization_id
  left join public.organizations parent on parent.id = child.parent_organization_id
  where requested_ids is null or child.id = any(requested_ids);
$function$;

CREATE OR REPLACE FUNCTION public.get_portal_archive_events()
 RETURNS TABLE(id uuid, title text, starts_at timestamp with time zone, category text, audience_groups text[], audience text, worksheet_url text, is_published boolean, poster_url text, stream_url text, recording_url text, recording_status text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  with identity as (
    select
      (select auth.uid()) as user_id,
      public.is_platform_admin() as is_platform_admin,
      profile.active_organization_id,
      coalesce(profile.is_active, true) as profile_active
    from public.profiles profile
    where profile.id = (select auth.uid())
  ), access as (
    select
      identity.user_id,
      (
        identity.is_platform_admin
        or (
          identity.profile_active
          and identity.active_organization_id is not null
          and exists (
            select 1
            from public.organization_members member
            join public.organizations organization
              on organization.id = member.organization_id
            where member.user_id = identity.user_id
              and member.organization_id = identity.active_organization_id
              and member.status = 'active'
              and organization.status = 'active'
              and (
                (
                  (organization.parent_organization_id is null or organization.license_plan is not null)
                  and organization.license_status = 'active' and (organization.license_plan is distinct from 'competition_prize_12m' or organization.license_started_at <= now())
                  and (organization.license_valid_until is null or organization.license_valid_until >= now())
                )
                or exists (
                  select 1
                  from public.organizations parent
                  where parent.id = organization.parent_organization_id
                    and lower(parent.org_type) in ('municipality', 'obec')
                    and parent.status = 'active'
                    and parent.license_status = 'active' and parent.license_plan is distinct from 'competition_prize_12m'
                    and (parent.license_valid_until is null or parent.license_valid_until >= now())
                )
              )
          )
        )
      ) as allowed
    from identity
  )
  select
    event.id,
    event.title,
    event.starts_at,
    event.category,
    event.audience_groups,
    event.audience,
    event.worksheet_url,
    event.is_published,
    event.poster_url,
    event.stream_url,
    case
      when session.recording_status = 'published' then session.recording_url
      else null
    end as recording_url,
    session.recording_status
  from public.events event
  cross join access
  left join lateral (
    select broadcast.recording_url, broadcast.recording_status
    from public.broadcast_sessions broadcast
    where broadcast.event_id = event.id
      and broadcast.is_published = true
    order by broadcast.created_at desc
    limit 1
  ) session on true
  where access.allowed = true
    and event.is_published = true
    and event.starts_at < now()
  order by event.starts_at desc;
$function$;

CREATE OR REPLACE FUNCTION public.get_portal_broadcast_sessions(p_event_ids uuid[])
 RETURNS TABLE(id uuid, event_id uuid, status text, viewer_url text, recording_url text, recording_status text, starts_at timestamp with time zone, ended_at timestamp with time zone, access_mode text, is_published boolean, moderator_name text, guest_1_name text, guest_2_name text, guest_3_name text, guest_4_name text, guest_5_name text, has_external_meeting boolean)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  with viewer_access as (
    select public.is_platform_admin() as is_platform_admin,
    exists (
      select 1
      from public.profiles profile
      join public.organization_members member
        on member.user_id = profile.id
       and member.organization_id = profile.active_organization_id
       and lower(coalesce(member.status, '')) = 'active'
      join public.organizations organization
        on organization.id = profile.active_organization_id
      left join public.organizations parent
        on parent.id = organization.parent_organization_id
      where profile.id = (select auth.uid())
        and coalesce(profile.is_active, true) = true
        and lower(coalesce(organization.status, '')) = 'active'
        and (
          (
            (organization.parent_organization_id is null or organization.license_plan is not null)
            and lower(coalesce(organization.license_status, '')) = 'active' and (organization.license_plan is distinct from 'competition_prize_12m' or organization.license_started_at <= now())
            and (organization.license_valid_until is null or organization.license_valid_until >= now())
          )
          or (
            lower(coalesce(parent.org_type, '')) in ('municipality', 'obec')
            and lower(coalesce(parent.status, '')) = 'active'
            and lower(coalesce(parent.license_status, '')) = 'active' and parent.license_plan is distinct from 'competition_prize_12m'
            and (parent.license_valid_until is null or parent.license_valid_until >= now())
          )
        )
    ) as has_program_access
  )
  select
    session.id,
    session.event_id,
    session.status,
    case when session.external_meeting_id is null then session.viewer_url else null end,
    case when session.recording_status = 'published' then session.recording_url else null end,
    session.recording_status,
    session.starts_at,
    session.ended_at,
    session.access_mode,
    session.is_published,
    session.moderator_name,
    session.guest_1_name,
    session.guest_2_name,
    session.guest_3_name,
    session.guest_4_name,
    session.guest_5_name,
    (session.external_meeting_id is not null)
  from public.broadcast_sessions session
  join public.events event on event.id = session.event_id
  cross join viewer_access access
  where (select auth.uid()) is not null
    and (access.is_platform_admin or access.has_program_access)
    and session.event_id = any(coalesce(p_event_ids, array[]::uuid[]))
    and session.is_published = true
    and event.is_published = true;
$function$;

CREATE OR REPLACE FUNCTION public.has_active_licensed_membership()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  select exists (
    select 1
    from public.organization_members member
    join public.organizations organization
      on organization.id = member.organization_id
    left join public.organizations parent
      on parent.id = organization.parent_organization_id
    where member.user_id = auth.uid()
      and member.status = 'active'
      and organization.status = 'active'
      and (
        (
          (
            organization.parent_organization_id is null
            or organization.license_plan is not null
          )
          and organization.license_status = 'active' and (organization.license_plan is distinct from 'competition_prize_12m' or organization.license_started_at <= now())
          and (
            organization.license_valid_until is null
            or organization.license_valid_until >= now()
          )
        )
        or (
          parent.status = 'active'
          and lower(parent.org_type) in ('municipality', 'obec')
          and parent.license_status = 'active' and parent.license_plan is distinct from 'competition_prize_12m'
          and (
            parent.license_valid_until is null
            or parent.license_valid_until >= now()
          )
        )
      )
  );
$function$;
