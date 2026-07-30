
-- Production public-schema baseline captured read-only on 2026-07-30.
-- Source project: gipikahmjlcynkqexxmz
-- GitHub Actions export run: 30524722147
-- This migration contains schema objects only; it contains no table rows.

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';

CREATE SCHEMA IF NOT EXISTS "extensions";

CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "unaccent" WITH SCHEMA "public";

ALTER EXTENSION "pgcrypto" SET SCHEMA "extensions";

ALTER EXTENSION "uuid-ossp" SET SCHEMA "extensions";

ALTER EXTENSION "unaccent" SET SCHEMA "public";



CREATE OR REPLACE FUNCTION "public"."activate_customer_with_admin"("p_organization_id" "uuid", "p_user_id" "uuid", "p_email" "text", "p_full_name" "text", "p_must_set_password" boolean DEFAULT false) RETURNS TABLE("organization_id" "uuid", "registration_number" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  customer public.organizations%rowtype;
begin
  if not public.is_admin() then
    raise exception 'Tuto akci může provést pouze správce platformy.';
  end if;

  select * into customer
  from public.organizations
  where id = p_organization_id
    and org_type in ('municipality', 'obec', 'school', 'association', 'spolek')
    and parent_organization_id is null
  for update;

  if not found then
    raise exception 'Zákazník nebyl nalezen.';
  end if;

  insert into public.profiles (
    id, email, full_name, is_active, must_set_password, active_organization_id
  ) values (
    p_user_id, lower(trim(p_email)), trim(p_full_name), true,
    p_must_set_password, customer.id
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = excluded.full_name,
    is_active = true,
    must_set_password = case
      when p_must_set_password then true else profiles.must_set_password
    end,
    active_organization_id = customer.id;

  insert into public.organization_members (
    organization_id, user_id, role_in_org, status
  ) values (
    customer.id, p_user_id, 'organization_admin', 'active'
  )
  on conflict (user_id, organization_id) do update set
    role_in_org = 'organization_admin',
    status = 'active';

  update public.organizations
  set license_status = 'active', status = 'active'
  where id = customer.id;

  return query select customer.id, customer.registration_number;
end;
$$;


ALTER FUNCTION "public"."activate_customer_with_admin"("p_organization_id" "uuid", "p_user_id" "uuid", "p_email" "text", "p_full_name" "text", "p_must_set_password" boolean) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."activate_customer_with_admin_v2"("p_organization_id" "uuid", "p_user_id" "uuid", "p_email" "text", "p_full_name" "text", "p_license_plan" "text", "p_license_started_at" timestamp with time zone, "p_license_valid_until" timestamp with time zone, "p_contract_status" "text", "p_billing_status" "text", "p_classroom_eligibility_verified" boolean DEFAULT false, "p_must_set_password" boolean DEFAULT false) RETURNS TABLE("organization_id" "uuid", "registration_number" "text", "license_plan" "text", "license_valid_until" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
#variable_conflict use_column
declare
  customer public.organizations%rowtype;
  effective_start timestamptz;
begin
  if not public.is_admin() then
    raise exception 'Tuto akci muze provest pouze spravce platformy.';
  end if;

  if p_license_plan not in ('paid_monthly', 'paid_annual', 'classroom_free_12m') then
    raise exception 'Vyberte platny rezim licence.';
  end if;

  if p_contract_status <> 'accepted' then
    raise exception 'Pred aktivaci musi byt potvrzena smlouva.';
  end if;

  if p_billing_status not in ('pending', 'paid', 'not_applicable') then
    raise exception 'Neplatny stav fakturace.';
  end if;

  if p_license_plan = 'classroom_free_12m'
     and p_billing_status <> 'not_applicable' then
    raise exception 'Bezplatna licence musi mit fakturaci bez uhrady.';
  end if;

  if p_license_plan = 'classroom_free_12m'
     and not p_classroom_eligibility_verified then
    raise exception 'Pred bezplatnou aktivaci overte ucebnu ARCHIMEDES.';
  end if;

  if p_license_plan in ('paid_annual', 'classroom_free_12m')
     and p_license_valid_until is null then
    raise exception 'U rocni a bezplatne licence je povinne datum konce.';
  end if;

  effective_start := coalesce(p_license_started_at, now());

  if p_license_valid_until is not null
     and p_license_valid_until <= effective_start then
    raise exception 'Datum konce licence musi byt pozdeji nez datum zacatku.';
  end if;

  select * into customer
  from public.organizations
  where id = p_organization_id
    and org_type in ('municipality', 'obec', 'school', 'association', 'spolek')
    and parent_organization_id is null
  for update;

  if not found then
    raise exception 'Zakaznik nebyl nalezen.';
  end if;

  insert into public.profiles (
    id, email, full_name, is_active, must_set_password, active_organization_id
  ) values (
    p_user_id, lower(trim(p_email)), trim(p_full_name), true,
    p_must_set_password, customer.id
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = excluded.full_name,
    is_active = true,
    must_set_password = case
      when p_must_set_password then true else profiles.must_set_password
    end,
    active_organization_id = customer.id;

  insert into public.organization_members (
    organization_id, user_id, role_in_org, status
  ) values (
    customer.id, p_user_id, 'organization_admin', 'active'
  )
  on conflict (user_id, organization_id) do update set
    role_in_org = 'organization_admin',
    status = 'active';

  update public.organizations
  set
    license_status = 'active',
    status = 'active',
    license_plan = p_license_plan,
    license_started_at = effective_start,
    license_valid_until = p_license_valid_until,
    contract_status = p_contract_status,
    billing_status = p_billing_status,
    activated_at = now(),
    activated_by = auth.uid(),
    classroom_eligibility_verified_at = case
      when p_license_plan = 'classroom_free_12m' then now() else null
    end,
    classroom_eligibility_verified_by = case
      when p_license_plan = 'classroom_free_12m' then auth.uid() else null
    end
  where id = customer.id;

  return query
  select
    customer.id,
    customer.registration_number,
    p_license_plan,
    p_license_valid_until;
end;
$$;


ALTER FUNCTION "public"."activate_customer_with_admin_v2"("p_organization_id" "uuid", "p_user_id" "uuid", "p_email" "text", "p_full_name" "text", "p_license_plan" "text", "p_license_started_at" timestamp with time zone, "p_license_valid_until" timestamp with time zone, "p_contract_status" "text", "p_billing_status" "text", "p_classroom_eligibility_verified" boolean, "p_must_set_password" boolean) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."activate_municipality_with_admin"("p_organization_id" "uuid", "p_user_id" "uuid", "p_email" "text", "p_full_name" "text", "p_must_set_password" boolean DEFAULT false) RETURNS TABLE("organization_id" "uuid", "registration_number" "text")
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select * from public.activate_customer_with_admin(
    p_organization_id,
    p_user_id,
    p_email,
    p_full_name,
    p_must_set_password
  );
$$;


ALTER FUNCTION "public"."activate_municipality_with_admin"("p_organization_id" "uuid", "p_user_id" "uuid", "p_email" "text", "p_full_name" "text", "p_must_set_password" boolean) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."consume_api_rate_limit"("p_route" "text", "p_key_hash" "text", "p_limit" integer, "p_window_seconds" integer) RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  current_row public.api_rate_limits%rowtype;
begin
  if p_route is null or btrim(p_route) = ''
     or p_key_hash is null or btrim(p_key_hash) = ''
     or p_limit < 1
     or p_window_seconds < 1 then
    raise exception 'Neplatne parametry rate limitu.';
  end if;

  perform pg_advisory_xact_lock(
    hashtextextended(p_route || ':' || p_key_hash, 0)
  );

  select * into current_row
  from public.api_rate_limits
  where route = p_route and key_hash = p_key_hash
  for update;

  if not found
     or current_row.window_started_at
       <= now() - make_interval(secs => p_window_seconds) then
    insert into public.api_rate_limits (
      route, key_hash, window_started_at, request_count
    ) values (
      p_route, p_key_hash, now(), 1
    )
    on conflict (route, key_hash) do update set
      window_started_at = excluded.window_started_at,
      request_count = 1;
    return true;
  end if;

  if current_row.request_count >= p_limit then
    return false;
  end if;

  update public.api_rate_limits
  set request_count = request_count + 1
  where route = p_route and key_hash = p_key_hash;

  return true;
end;
$$;


ALTER FUNCTION "public"."consume_api_rate_limit"("p_route" "text", "p_key_hash" "text", "p_limit" integer, "p_window_seconds" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_pending_customer"("p_name" "text", "p_org_type" "text", "p_legal_identifier" "text", "p_address" "text", "p_contact_name" "text", "p_contact_email" "text", "p_contact_phone" "text") RETURNS TABLE("id" "uuid", "registration_number" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  conflicting_id uuid;
begin
  if p_org_type not in ('municipality', 'school', 'association') then
    raise exception 'neplatný typ zákazníka';
  end if;

  perform pg_advisory_xact_lock(
    hashtextextended(
      p_org_type || ':' || unaccent(lower(btrim(p_name))),
      0
    )
  );

  select conflict.id into conflicting_id
  from public.find_conflicting_customer(
    p_org_type,
    p_contact_email,
    p_name,
    p_legal_identifier,
    p_address
  ) conflict
  limit 1;

  if conflicting_id is not null then
    raise exception using errcode = '23505', message = 'customer already exists';
  end if;

  return query
  insert into public.organizations (
    name,
    org_type,
    status,
    license_status,
    legal_identifier,
    registered_address,
    contact_name,
    contact_email,
    contact_phone
  ) values (
    btrim(p_name),
    p_org_type,
    'inactive',
    'pending_approval',
    nullif(btrim(p_legal_identifier), ''),
    btrim(p_address),
    btrim(p_contact_name),
    lower(btrim(p_contact_email)),
    nullif(btrim(p_contact_phone), '')
  )
  returning organizations.id, organizations.registration_number;
end;
$$;


ALTER FUNCTION "public"."create_pending_customer"("p_name" "text", "p_org_type" "text", "p_legal_identifier" "text", "p_address" "text", "p_contact_name" "text", "p_contact_email" "text", "p_contact_phone" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."enforce_profile_self_update_security"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
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


ALTER FUNCTION "public"."enforce_profile_self_update_security"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."find_conflicting_customer"("p_org_type" "text", "p_email" "text", "p_name" "text", "p_legal_identifier" "text" DEFAULT NULL::"text", "p_address" "text" DEFAULT NULL::"text") RETURNS TABLE("id" "uuid", "license_status" "text")
    LANGUAGE "sql" STABLE
    SET "search_path" TO 'public'
    AS $$
  select o.id, o.license_status
  from public.organizations o
  where (
      o.org_type = p_org_type
      or (p_org_type = 'municipality' and o.org_type = 'obec')
      or (p_org_type = 'association' and o.org_type = 'spolek')
    )
    and o.license_status in ('pending_approval', 'active', 'suspended')
    and (
      (
        p_legal_identifier is not null
        and btrim(p_legal_identifier) <> ''
        and regexp_replace(coalesce(o.legal_identifier, ''), '[^0-9]', '', 'g') =
            regexp_replace(p_legal_identifier, '[^0-9]', '', 'g')
        and (
          p_org_type <> 'school'
          or unaccent(lower(btrim(o.name))) = unaccent(lower(btrim(p_name)))
        )
      )
      or (
        unaccent(lower(btrim(o.name))) = unaccent(lower(btrim(p_name)))
        and p_address is not null
        and btrim(p_address) <> ''
        and (
          unaccent(lower(btrim(coalesce(o.registered_address, '')))) =
              unaccent(lower(btrim(p_address)))
          or exists (
            select 1
            from public.access_requests request
            where request.organization_id = o.id
              and unaccent(lower(btrim(request.address))) =
                  unaccent(lower(btrim(p_address)))
          )
        )
      )
    )
  limit 1;
$$;


ALTER FUNCTION "public"."find_conflicting_customer"("p_org_type" "text", "p_email" "text", "p_name" "text", "p_legal_identifier" "text", "p_address" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."find_conflicting_obec"("p_email" "text", "p_name" "text") RETURNS TABLE("id" "uuid", "license_status" "text")
    LANGUAGE "sql" STABLE
    SET "search_path" TO 'public'
    AS $$
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


ALTER FUNCTION "public"."find_conflicting_obec"("p_email" "text", "p_name" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_join_code"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
begin
  if new.join_code is null or btrim(new.join_code) = '' then
    new.join_code := 'ORG-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
  end if;
  return new;
end;
$$;


ALTER FUNCTION "public"."generate_join_code"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_obec_registration_number"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
begin
  if new.org_type in ('municipality', 'obec') and new.registration_number is null then
    new.registration_number :=
      lpad((((nextval('obec_registration_seq') * 4001 + 777) % 10000))::text, 4, '0');
  end if;
  return new;
end;
$$;


ALTER FUNCTION "public"."generate_obec_registration_number"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_spolek_registration_number"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
declare
  parent_reg text;
  activity_sort int;
  existing_count int;
begin
  if new.org_type in ('association', 'spolek')
     and new.parent_organization_id is not null
     and new.registration_number is null then
    if new.primary_activity_code is null then
      raise exception 'spolek zapojený pod obcí musí mít primary_activity_code';
    end if;

    select registration_number into parent_reg
    from public.organizations
    where id = new.parent_organization_id
      and org_type in ('municipality', 'obec');

    if parent_reg is null then
      raise exception 'nadřazená obec nemá platné registration_number';
    end if;

    select sort_order into activity_sort
    from public.activity_categories
    where code = new.primary_activity_code;

    if activity_sort is null then
      raise exception 'neznámý kód činnosti: %', new.primary_activity_code;
    end if;

    select count(*) into existing_count
    from public.organizations
    where parent_organization_id = new.parent_organization_id
      and primary_activity_code = new.primary_activity_code
      and org_type in ('association', 'spolek');

    new.registration_number :=
      parent_reg
      || '-' || lpad(activity_sort::text, 2, '0')
      || '-' || lpad((existing_count + 1)::text, 2, '0');
  end if;
  return new;
end;
$$;


ALTER FUNCTION "public"."generate_spolek_registration_number"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_my_organizations"("requested_ids" "uuid"[] DEFAULT NULL::"uuid"[]) RETURNS TABLE("id" "uuid", "name" "text", "org_type" "text", "status" "text", "parent_organization_id" "uuid", "license_status" "text", "license_valid_until" timestamp with time zone, "join_code" "text", "registration_number" "text", "is_system" boolean, "role_in_org" "text")
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select
    child.id,
    child.name,
    child.org_type,
    child.status,
    child.parent_organization_id,
    case
      when child.status <> 'active' then 'inactive'
      when child.license_status = 'active'
        and (child.license_valid_until is null or child.license_valid_until >= now())
        then 'active'
      when parent.status = 'active'
        and parent.org_type in ('municipality', 'obec')
        and parent.license_status = 'active'
        and (parent.license_valid_until is null or parent.license_valid_until >= now())
        then 'active'
      when child.license_status = 'suspended' or parent.license_status = 'suspended'
        then 'suspended'
      when child.license_status = 'pending_approval' or parent.license_status = 'pending_approval'
        then 'pending_approval'
      else 'inactive'
    end as license_status,
    case
      when child.license_status = 'active'
        and (child.license_valid_until is null or child.license_valid_until >= now())
        then child.license_valid_until
      when parent.status = 'active'
        and parent.org_type in ('municipality', 'obec')
        and parent.license_status = 'active'
        and (parent.license_valid_until is null or parent.license_valid_until >= now())
        then parent.license_valid_until
      else null
    end as license_valid_until,
    case
      when member.role_in_org = 'organization_admin' or is_admin()
        then child.join_code
      else null
    end as join_code,
    case
      when member.role_in_org = 'organization_admin' or is_admin()
        then child.registration_number
      else null
    end as registration_number,
    child.is_system,
    member.role_in_org
  from public.organization_members member
  join public.organizations child on child.id = member.organization_id
  left join public.organizations parent on parent.id = child.parent_organization_id
  where member.user_id = auth.uid()
    and member.status = 'active'
    and (requested_ids is null or child.id = any(requested_ids));
$$;


ALTER FUNCTION "public"."get_my_organizations"("requested_ids" "uuid"[]) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_admin"() RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select exists (
    select 1
    from public.platform_admins
    where user_id = auth.uid()
  );
$$;


ALTER FUNCTION "public"."is_admin"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_org_admin"("org_id" "uuid") RETURNS boolean
    LANGUAGE "sql" STABLE
    SET "search_path" TO 'public'
    AS $$
  select exists (
    select 1
    from public.organization_members om
    where om.organization_id = org_id
      and om.user_id = auth.uid()
      and om.role_in_org = 'organization_admin'
      and om.status = 'active'
  );
$$;


ALTER FUNCTION "public"."is_org_admin"("org_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_org_admin_member"("org_id" "uuid") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select exists (
    select 1
    from public.organization_members om
    where om.organization_id = org_id
      and om.user_id = auth.uid()
      and om.role_in_org = 'organization_admin'
      and om.status = 'active'
  );
$$;


ALTER FUNCTION "public"."is_org_admin_member"("org_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_platform_admin"() RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select exists (
    select 1
    from public.platform_admins pa
    where pa.user_id = auth.uid()
  );
$$;


ALTER FUNCTION "public"."is_platform_admin"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_school_admin"() RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'school_admin'
      and is_active = true
  );
$$;


ALTER FUNCTION "public"."is_school_admin"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."marketplace_posts_tsv_update"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
declare
  txt text;
begin
  txt :=
    coalesce(new.title,'') || ' ' ||
    coalesce(new.description,'') || ' ' ||
    coalesce(new.category,'') || ' ' ||
    coalesce(new.location,'');

  new.search_tsv :=
    to_tsvector('simple', txt) ||
    to_tsvector('simple', unaccent(txt));

  return new;
end
$$;


ALTER FUNCTION "public"."marketplace_posts_tsv_update"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."my_school_id"() RETURNS "uuid"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select school_id
  from public.profiles
  where id = auth.uid()
  limit 1;
$$;


ALTER FUNCTION "public"."my_school_id"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_featured_best_practice_post"("post_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  if not is_admin() then
    raise exception 'Jen správce portálu může vybrat featured příspěvek.';
  end if;

  if not exists (
    select 1 from best_practice_posts
    where id = post_id and status = 'approved'
  ) then
    raise exception 'Featured může být jen schválený příspěvek.';
  end if;

  update best_practice_posts set is_featured = false where is_featured;
  update best_practice_posts
    set is_featured = true, updated_at = now()
    where id = post_id;
end;
$$;


ALTER FUNCTION "public"."set_featured_best_practice_post"("post_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_portal_posts_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION "public"."set_portal_posts_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION "public"."set_updated_at"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."access_requests" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "license_type" "text" DEFAULT 'obec'::"text" NOT NULL,
    "contact_name" "text" NOT NULL,
    "organization" "text" NOT NULL,
    "address" "text" NOT NULL,
    "email" "text" NOT NULL,
    "phone" "text",
    "message" "text",
    "status" "text" DEFAULT 'new'::"text" NOT NULL,
    "organization_id" "uuid",
    "admin_invited_email" "text"
);


ALTER TABLE "public"."access_requests" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."activity_categories" (
    "code" "text" NOT NULL,
    "label" "text" NOT NULL,
    "sort_order" integer NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "section" "text" DEFAULT 'spolky'::"text" NOT NULL,
    CONSTRAINT "activity_categories_section_check" CHECK (("section" = ANY (ARRAY['skola'::"text", 'temata'::"text", 'kluby'::"text", 'spolky'::"text"])))
);


ALTER TABLE "public"."activity_categories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."admin_users" (
    "user_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."admin_users" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."announcements" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "starts_at" timestamp with time zone,
    "ends_at" timestamp with time zone,
    "url" "text",
    "description" "text",
    "is_published" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "image_path" "text",
    "image_caption" "text",
    "image_alt_text" "text"
);


ALTER TABLE "public"."announcements" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."api_rate_limits" (
    "route" "text" NOT NULL,
    "key_hash" "text" NOT NULL,
    "window_started_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "request_count" integer DEFAULT 0 NOT NULL,
    CONSTRAINT "api_rate_limits_request_count_check" CHECK (("request_count" >= 0))
);


ALTER TABLE "public"."api_rate_limits" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."archive_items" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "archive_url" "text" NOT NULL,
    "audience" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "visibility" "text" DEFAULT 'members'::"text" NOT NULL,
    "event_id" "uuid",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "archive_items_visibility_check" CHECK (("visibility" = ANY (ARRAY['public'::"text", 'members'::"text"])))
);


ALTER TABLE "public"."archive_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."audience_groups" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "sort" integer DEFAULT 100 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."audience_groups" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."backup_orders_start_final_cleanup" (
    "id" "uuid",
    "created_at" timestamp without time zone,
    "school_name" "text",
    "ico" "text",
    "street" "text",
    "city" "text",
    "zip" "text",
    "contact_name" "text",
    "role" "text",
    "email" "text",
    "phone" "text",
    "note" "text",
    "agree_vop" boolean,
    "agree_dpa" boolean,
    "agree_recordings" boolean,
    "agree_authority" boolean,
    "agree_contract" boolean,
    "legal_version" "text",
    "ip_address" "text",
    "user_agent" "text",
    "submitted_at" timestamp with time zone,
    "admin_email" "text",
    "organization_id" "uuid",
    "admin_user_id" "uuid",
    "onboarding_status" "text",
    "onboarding_error" "text",
    "to_delete" boolean
);


ALTER TABLE "public"."backup_orders_start_final_cleanup" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."backup_orders_start_null_pending" (
    "id" "uuid",
    "created_at" timestamp without time zone,
    "school_name" "text",
    "ico" "text",
    "street" "text",
    "city" "text",
    "zip" "text",
    "contact_name" "text",
    "role" "text",
    "email" "text",
    "phone" "text",
    "note" "text",
    "agree_vop" boolean,
    "agree_dpa" boolean,
    "agree_recordings" boolean,
    "agree_authority" boolean,
    "agree_contract" boolean,
    "legal_version" "text",
    "ip_address" "text",
    "user_agent" "text",
    "submitted_at" timestamp with time zone,
    "admin_email" "text",
    "organization_id" "uuid",
    "admin_user_id" "uuid",
    "onboarding_status" "text",
    "onboarding_error" "text",
    "to_delete" boolean
);


ALTER TABLE "public"."backup_orders_start_null_pending" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."backup_orders_start_to_delete_orgs" (
    "id" "uuid",
    "created_at" timestamp without time zone,
    "school_name" "text",
    "ico" "text",
    "street" "text",
    "city" "text",
    "zip" "text",
    "contact_name" "text",
    "role" "text",
    "email" "text",
    "phone" "text",
    "note" "text",
    "agree_vop" boolean,
    "agree_dpa" boolean,
    "agree_recordings" boolean,
    "agree_authority" boolean,
    "agree_contract" boolean,
    "legal_version" "text",
    "ip_address" "text",
    "user_agent" "text",
    "submitted_at" timestamp with time zone,
    "admin_email" "text",
    "organization_id" "uuid",
    "admin_user_id" "uuid",
    "onboarding_status" "text",
    "onboarding_error" "text",
    "to_delete" boolean
);


ALTER TABLE "public"."backup_orders_start_to_delete_orgs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."backup_organization_members_final_cleanup" (
    "id" "uuid",
    "organization_id" "uuid",
    "user_id" "uuid",
    "role_in_org" "text",
    "status" "text",
    "created_at" timestamp with time zone
);


ALTER TABLE "public"."backup_organization_members_final_cleanup" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."backup_organization_members_to_delete" (
    "id" "uuid",
    "organization_id" "uuid",
    "user_id" "uuid",
    "role_in_org" "text",
    "status" "text",
    "created_at" timestamp with time zone
);


ALTER TABLE "public"."backup_organization_members_to_delete" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."backup_organizations_final_cleanup" (
    "id" "uuid",
    "name" "text",
    "org_type" "text",
    "created_at" timestamp with time zone,
    "status" "text",
    "join_code" "text",
    "license_status" "text",
    "license_valid_until" timestamp with time zone,
    "ico" "text",
    "is_system" boolean,
    "to_delete" boolean
);


ALTER TABLE "public"."backup_organizations_final_cleanup" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."backup_organizations_to_delete" (
    "id" "uuid",
    "name" "text",
    "org_type" "text",
    "created_at" timestamp with time zone,
    "status" "text",
    "join_code" "text",
    "license_status" "text",
    "license_valid_until" timestamp with time zone,
    "ico" "text",
    "is_system" boolean,
    "to_delete" boolean
);


ALTER TABLE "public"."backup_organizations_to_delete" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."backup_profiles_before_cleanup" (
    "id" "uuid",
    "full_name" "text",
    "email" "text",
    "role" "text",
    "school_id" "uuid",
    "is_active" boolean,
    "created_at" timestamp with time zone,
    "must_set_password" boolean,
    "user_type" "text",
    "active_organization_id" "uuid"
);


ALTER TABLE "public"."backup_profiles_before_cleanup" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."backup_profiles_final_cleanup" (
    "id" "uuid",
    "full_name" "text",
    "email" "text",
    "role" "text",
    "school_id" "uuid",
    "is_active" boolean,
    "created_at" timestamp with time zone,
    "must_set_password" boolean,
    "user_type" "text",
    "active_organization_id" "uuid"
);


ALTER TABLE "public"."backup_profiles_final_cleanup" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."best_practice_categories" (
    "code" "text" NOT NULL,
    "label" "text" NOT NULL,
    "sort_order" integer NOT NULL
);


ALTER TABLE "public"."best_practice_categories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."best_practice_posts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "author_user_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "body" "text" NOT NULL,
    "photo_paths" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "category" "text" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "rejection_note" "text",
    "is_featured" boolean DEFAULT false NOT NULL,
    "approved_by" "uuid",
    "approved_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "best_practice_posts_body_len" CHECK (("char_length"("body") <= 2000)),
    CONSTRAINT "best_practice_posts_photo_count" CHECK ((("array_length"("photo_paths", 1) IS NULL) OR ("array_length"("photo_paths", 1) <= 5))),
    CONSTRAINT "best_practice_posts_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'approved'::"text", 'rejected'::"text"]))),
    CONSTRAINT "best_practice_posts_title_len" CHECK (("char_length"("title") <= 80))
);


ALTER TABLE "public"."best_practice_posts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."broadcast_participants" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "session_id" "uuid" NOT NULL,
    "user_id" "uuid",
    "organization_id" "uuid",
    "provider_participant_id" "text" NOT NULL,
    "join_requested_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "presence_data" "jsonb",
    "last_presence_sync_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."broadcast_participants" OWNER TO "postgres";


COMMENT ON TABLE "public"."broadcast_participants" IS 'Serverová vazba účastníka ARCHIMEDES Live na technické ID WebMeetingu pro docházku. Bez klientských RLS policies.';



CREATE TABLE IF NOT EXISTS "public"."broadcast_sessions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "event_id" "uuid" NOT NULL,
    "status" "text" DEFAULT 'draft'::"text" NOT NULL,
    "platform" "text" DEFAULT 'google_meet'::"text" NOT NULL,
    "host_name" "text",
    "moderator_name" "text",
    "host_join_url" "text",
    "moderator_join_url" "text",
    "viewer_url" "text",
    "recording_url" "text",
    "recording_status" "text" DEFAULT 'none'::"text" NOT NULL,
    "starts_at" timestamp with time zone,
    "ended_at" timestamp with time zone,
    "access_mode" "text" DEFAULT 'event_rules'::"text" NOT NULL,
    "is_published" boolean DEFAULT false NOT NULL,
    "notes_internal" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "guest_1_name" "text",
    "guest_2_name" "text",
    "guest_3_name" "text",
    "guest_4_name" "text",
    "guest_5_name" "text",
    "external_meeting_id" "text",
    "provider_status" "text",
    "last_synced_at" timestamp with time zone,
    "last_provider_error" "text"
);


ALTER TABLE "public"."broadcast_sessions" OWNER TO "postgres";


COMMENT ON COLUMN "public"."broadcast_sessions"."external_meeting_id" IS 'ID místnosti u poskytovatele vysílání; není to vstupní URL.';



COMMENT ON COLUMN "public"."broadcast_sessions"."last_provider_error" IS 'Poslední technická chyba synchronizace bez API tajemství a osobních údajů.';



CREATE TABLE IF NOT EXISTS "public"."categories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "sort" integer DEFAULT 100 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."categories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."demo_requests" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "school_name" "text" NOT NULL,
    "full_name" "text" NOT NULL,
    "email" "text" NOT NULL,
    "phone" "text",
    "note" "text",
    "status" "text" DEFAULT 'new'::"text",
    "handled_by" "uuid",
    "handled_at" timestamp with time zone
);


ALTER TABLE "public"."demo_requests" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."event_attendees" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "event_id" "uuid" NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."event_attendees" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."events" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "title" "text" NOT NULL,
    "short_description" "text",
    "full_description" "text",
    "audience" "text" DEFAULT '{}'::"text"[] NOT NULL,
    "starts_at" timestamp with time zone NOT NULL,
    "ends_at" timestamp with time zone,
    "visibility" "text" DEFAULT 'members'::"text" NOT NULL,
    "status" "text" DEFAULT 'planned'::"text" NOT NULL,
    "meeting_url" "text",
    "archive_url" "text",
    "poster_url" "text",
    "poster_alt_text" "text",
    "promo_short_text" "text",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "stream_url" "text",
    "worksheet_url" "text",
    "start_at" timestamp with time zone,
    "is_published" boolean DEFAULT false,
    "audience_groups" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "category" "text" DEFAULT 'Speciál'::"text" NOT NULL,
    "poster_path" "text",
    "poster_caption" "text",
    "description" "text",
    CONSTRAINT "events_audience_groups_nonempty" CHECK (("cardinality"("audience_groups") > 0)),
    CONSTRAINT "events_category_allowed" CHECK ((("category" IS NULL) OR ("category" = ANY (ARRAY['Vstup expertů – 1. stupeň'::"text", 'Vstup expertů – 2. stupeň'::"text", 'Kariérní poradenství jinak'::"text", 'Smart City klub'::"text", 'Generace Z'::"text", '13. komnata VIP'::"text", 'English Talk'::"text", 'Senior klub'::"text", 'Čtenářský klub – děti'::"text", 'Čtenářský klub – dospělí'::"text", 'Speciál'::"text", 'Wellbeing'::"text", 'Filmový klub'::"text"])))),
    CONSTRAINT "events_status_check" CHECK (("status" = ANY (ARRAY['planned'::"text", 'live'::"text", 'done'::"text"]))),
    CONSTRAINT "events_visibility_check" CHECK (("visibility" = ANY (ARRAY['public'::"text", 'members'::"text"])))
);


ALTER TABLE "public"."events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."leads" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "type" "text" NOT NULL,
    "organization" "text" NOT NULL,
    "contact_name" "text" NOT NULL,
    "email" "text" NOT NULL,
    "phone" "text",
    "note" "text",
    "source_path" "text",
    "status" "text" DEFAULT 'new'::"text" NOT NULL,
    "approve_token" "text",
    "approve_token_created_at" timestamp with time zone,
    "approved_at" timestamp with time zone,
    CONSTRAINT "leads_type_check" CHECK (("type" = ANY (ARRAY['obec'::"text", 'skola'::"text", 'senior'::"text", 'komunita'::"text", 'demo'::"text"])))
);


ALTER TABLE "public"."leads" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."licenses" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "plan" "text" NOT NULL,
    "status" "text" DEFAULT 'active'::"text" NOT NULL,
    "valid_from" "date" DEFAULT CURRENT_DATE NOT NULL,
    "valid_to" "date",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "licenses_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'expired'::"text", 'suspended'::"text"])))
);


ALTER TABLE "public"."licenses" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."marketplace_attachments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "post_id" "uuid" NOT NULL,
    "author_id" "uuid" NOT NULL,
    "file_path" "text" NOT NULL,
    "file_name" "text" NOT NULL,
    "mime_type" "text",
    "file_size" bigint,
    "is_image" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."marketplace_attachments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."marketplace_comments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "post_id" "uuid" NOT NULL,
    "author_id" "uuid" NOT NULL,
    "body" "text" NOT NULL,
    "is_deleted" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."marketplace_comments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."marketplace_posts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "type" "text" NOT NULL,
    "category" "text" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "location" "text",
    "contact_email" "text",
    "contact_phone" "text",
    "author_id" "uuid" NOT NULL,
    "is_archimedes" boolean DEFAULT false NOT NULL,
    "is_pinned" boolean DEFAULT false NOT NULL,
    "status" "text" DEFAULT 'active'::"text" NOT NULL,
    "expires_at" timestamp with time zone DEFAULT ("now"() + '90 days'::interval),
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "contact_name" "text",
    "org_name" "text",
    "search_tsv" "tsvector",
    "is_closed" boolean DEFAULT false NOT NULL,
    "kind" "text" DEFAULT 'nabidka'::"text",
    CONSTRAINT "marketplace_contact_email_format" CHECK (("contact_email" ~* '^[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}$'::"text")),
    CONSTRAINT "marketplace_contact_phone_nonempty" CHECK (("length"(TRIM(BOTH FROM "contact_phone")) >= 6)),
    CONSTRAINT "marketplace_posts_kind_allowed" CHECK (("kind" = ANY (ARRAY['nabidka'::"text", 'poptavka'::"text", 'sluzba'::"text", 'pozvanka'::"text", 'dobrovolnictvi'::"text", 'ztraty_a_nalezy'::"text"]))),
    CONSTRAINT "marketplace_posts_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'closed'::"text"]))),
    CONSTRAINT "marketplace_posts_type_check" CHECK (("type" = ANY (ARRAY['offer'::"text", 'demand'::"text", 'partnership'::"text"])))
);


ALTER TABLE "public"."marketplace_posts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."municipality_organization_invites" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "municipality_id" "uuid" NOT NULL,
    "organization_type" "text" NOT NULL,
    "invited_email" "text",
    "token_hash" "text" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "expires_at" timestamp with time zone NOT NULL,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "used_at" timestamp with time zone,
    "used_organization_id" "uuid",
    CONSTRAINT "municipality_organization_invites_organization_type_check" CHECK (("organization_type" = ANY (ARRAY['school'::"text", 'association'::"text"]))),
    CONSTRAINT "municipality_organization_invites_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'used'::"text", 'revoked'::"text", 'expired'::"text"])))
);


ALTER TABLE "public"."municipality_organization_invites" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notification_preferences" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "profile_id" "uuid" NOT NULL,
    "activity_code" "text" NOT NULL,
    "enabled" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."notification_preferences" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."obec_registration_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."obec_registration_seq" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."orders_start" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp without time zone DEFAULT "now"(),
    "school_name" "text",
    "ico" "text",
    "street" "text",
    "city" "text",
    "zip" "text",
    "contact_name" "text",
    "role" "text",
    "email" "text",
    "phone" "text",
    "note" "text",
    "agree_vop" boolean,
    "agree_dpa" boolean,
    "agree_recordings" boolean,
    "agree_authority" boolean,
    "agree_contract" boolean,
    "legal_version" "text",
    "ip_address" "text",
    "user_agent" "text",
    "submitted_at" timestamp with time zone,
    "admin_email" "text",
    "organization_id" "uuid",
    "admin_user_id" "uuid",
    "onboarding_status" "text" DEFAULT 'pending'::"text",
    "onboarding_error" "text",
    "to_delete" boolean DEFAULT false
);


ALTER TABLE "public"."orders_start" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."organization_activities" (
    "organization_id" "uuid" NOT NULL,
    "activity_code" "text" NOT NULL,
    "custom_text" "text"
);


ALTER TABLE "public"."organization_activities" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."organization_members" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "role_in_org" "text" DEFAULT 'member'::"text" NOT NULL,
    "status" "text" DEFAULT 'active'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "organization_members_role_in_org_allowed" CHECK (("role_in_org" = ANY (ARRAY['organization_admin'::"text", 'member'::"text"]))),
    CONSTRAINT "organization_members_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'inactive'::"text"])))
);


ALTER TABLE "public"."organization_members" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."organizations" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "org_type" "text" DEFAULT 'school'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "status" "text" DEFAULT 'active'::"text",
    "join_code" "text" NOT NULL,
    "license_status" "text" DEFAULT 'pending_approval'::"text",
    "license_valid_until" timestamp with time zone,
    "ico" "text",
    "is_system" boolean DEFAULT false,
    "to_delete" boolean DEFAULT false,
    "parent_organization_id" "uuid",
    "registration_number" "text",
    "primary_activity_code" "text",
    "primary_activity_custom_text" "text",
    "contact_name" "text",
    "contact_email" "text",
    "contact_phone" "text",
    "legal_identifier" "text",
    "registered_address" "text",
    "requested_license_plan" "text",
    "terms_accepted_at" timestamp with time zone,
    "terms_version" "text",
    "license_plan" "text",
    "license_started_at" timestamp with time zone,
    "contract_status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "billing_status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "activated_at" timestamp with time zone,
    "activated_by" "uuid",
    "classroom_eligibility_verified_at" timestamp with time zone,
    "classroom_eligibility_verified_by" "uuid",
    CONSTRAINT "organizations_billing_status_allowed" CHECK (("billing_status" = ANY (ARRAY['pending'::"text", 'paid'::"text", 'not_applicable'::"text", 'overdue'::"text"]))),
    CONSTRAINT "organizations_contract_status_allowed" CHECK (("contract_status" = ANY (ARRAY['pending'::"text", 'accepted'::"text", 'cancelled'::"text"]))),
    CONSTRAINT "organizations_license_plan_allowed" CHECK ((("license_plan" IS NULL) OR ("license_plan" = ANY (ARRAY['paid_monthly'::"text", 'paid_annual'::"text", 'classroom_free_12m'::"text"])))),
    CONSTRAINT "organizations_org_type_check" CHECK (("org_type" = ANY (ARRAY['municipality'::"text", 'school'::"text", 'senior_club'::"text", 'association'::"text", 'partner'::"text", 'community_center'::"text", 'obec'::"text", 'spolek'::"text"]))),
    CONSTRAINT "organizations_primary_activity_jine_requires_text" CHECK ((("primary_activity_code" IS DISTINCT FROM 'jine'::"text") OR (("primary_activity_custom_text" IS NOT NULL) AND ("btrim"("primary_activity_custom_text") <> ''::"text")))),
    CONSTRAINT "organizations_requested_license_plan_allowed" CHECK ((("requested_license_plan" IS NULL) OR ("requested_license_plan" = ANY (ARRAY['paid_monthly'::"text", 'paid_annual'::"text", 'classroom_free_12m'::"text"])))),
    CONSTRAINT "organizations_status_allowed" CHECK (("status" = ANY (ARRAY['active'::"text", 'trial'::"text", 'inactive'::"text"]))),
    CONSTRAINT "organizations_type_allowed" CHECK (("org_type" = ANY (ARRAY['school'::"text", 'municipality'::"text", 'senior_club'::"text", 'association'::"text", 'community_center'::"text", 'diaspora'::"text", 'partner'::"text", 'obec'::"text", 'spolek'::"text"])))
);


ALTER TABLE "public"."organizations" OWNER TO "postgres";


COMMENT ON COLUMN "public"."organizations"."parent_organization_id" IS 'Pokud vyplneno, jde o skolu/spolek pod obci - license_status/license_valid_until se pak cte z rodicovske organizace, ne z vlastniho zaznamu.';



COMMENT ON COLUMN "public"."organizations"."registration_number" IS 'Registracni cislo obce, pod kterym se sami registruji spolky/skoly (organization_activities flow).';



CREATE TABLE IF NOT EXISTS "public"."platform_admins" (
    "user_id" "uuid" NOT NULL,
    "role" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "platform_admins_role_check" CHECK (("role" = ANY (ARRAY['super_admin'::"text", 'admin'::"text"])))
);


ALTER TABLE "public"."platform_admins" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."portal_posts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "section" "text" NOT NULL,
    "title" "text" NOT NULL,
    "content" "text" DEFAULT ''::"text" NOT NULL,
    "image_path" "text",
    "attachment_path" "text",
    "attachment_name" "text",
    "is_published" boolean DEFAULT true NOT NULL,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "portal_posts_section_check" CHECK (("section" = ANY (ARRAY['community'::"text", 'contests'::"text"])))
);


ALTER TABLE "public"."portal_posts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "full_name" "text",
    "email" "text",
    "role" "text" DEFAULT 'teacher'::"text" NOT NULL,
    "school_id" "uuid",
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "must_set_password" boolean DEFAULT false NOT NULL,
    "user_type" "text",
    "active_organization_id" "uuid",
    "email_notifications_enabled" boolean DEFAULT true,
    CONSTRAINT "profiles_role_check" CHECK (("role" = ANY (ARRAY['school_admin'::"text", 'teacher'::"text"])))
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."public_program" WITH ("security_invoker"='true') AS
 SELECT "id",
    "title",
    "short_description",
    "full_description",
    "category",
    "audience_groups",
    "starts_at",
    "ends_at",
    "poster_url",
    "poster_alt_text",
    "promo_short_text"
   FROM "public"."events"
  WHERE ("is_published" = true);


ALTER VIEW "public"."public_program" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."resources" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "file_url" "text" NOT NULL,
    "visibility" "text" DEFAULT 'members'::"text" NOT NULL,
    "event_id" "uuid",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "resources_visibility_check" CHECK (("visibility" = ANY (ARRAY['public'::"text", 'members'::"text"])))
);


ALTER TABLE "public"."resources" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."schools" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "city" "text",
    "region" "text",
    "country" "text" DEFAULT 'CZ'::"text" NOT NULL,
    "school_type" "text",
    "website" "text",
    "contact_name" "text",
    "contact_email" "text",
    "contact_phone" "text",
    "has_archimedes_classroom" boolean DEFAULT true NOT NULL,
    "archimedes_since" "date",
    "classroom_variant" "text",
    "short_description" "text",
    "is_published" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "classroom_description" "text",
    "photo_path" "text",
    "address" "text",
    "latitude" numeric,
    "longitude" numeric,
    "lat" double precision,
    "lng" double precision
);


ALTER TABLE "public"."schools" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_audience_preferences" (
    "id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "audience_slug" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."user_audience_preferences" OWNER TO "postgres";


ALTER TABLE "public"."user_audience_preferences" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."user_audience_preferences_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."user_category_preferences" (
    "id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "category_slug" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."user_category_preferences" OWNER TO "postgres";


ALTER TABLE "public"."user_category_preferences" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."user_category_preferences_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."user_interests" (
    "user_id" "uuid" NOT NULL,
    "interest_slug" "text" NOT NULL
);


ALTER TABLE "public"."user_interests" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_roles" (
    "user_id" "uuid" NOT NULL,
    "role" "text" NOT NULL,
    CONSTRAINT "user_roles_role_check" CHECK (("role" = ANY (ARRAY['admin'::"text", 'editor'::"text"])))
);


ALTER TABLE "public"."user_roles" OWNER TO "postgres";


ALTER TABLE ONLY "public"."access_requests"
    ADD CONSTRAINT "access_requests_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."activity_categories"
    ADD CONSTRAINT "activity_categories_pkey" PRIMARY KEY ("code");



ALTER TABLE ONLY "public"."admin_users"
    ADD CONSTRAINT "admin_users_pkey" PRIMARY KEY ("user_id");



ALTER TABLE ONLY "public"."announcements"
    ADD CONSTRAINT "announcements_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."api_rate_limits"
    ADD CONSTRAINT "api_rate_limits_pkey" PRIMARY KEY ("route", "key_hash");



ALTER TABLE ONLY "public"."archive_items"
    ADD CONSTRAINT "archive_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."audience_groups"
    ADD CONSTRAINT "audience_groups_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."audience_groups"
    ADD CONSTRAINT "audience_groups_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."best_practice_categories"
    ADD CONSTRAINT "best_practice_categories_pkey" PRIMARY KEY ("code");



ALTER TABLE ONLY "public"."best_practice_posts"
    ADD CONSTRAINT "best_practice_posts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."broadcast_participants"
    ADD CONSTRAINT "broadcast_participants_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."broadcast_participants"
    ADD CONSTRAINT "broadcast_participants_session_id_provider_participant_id_key" UNIQUE ("session_id", "provider_participant_id");



ALTER TABLE ONLY "public"."broadcast_participants"
    ADD CONSTRAINT "broadcast_participants_session_id_user_id_key" UNIQUE ("session_id", "user_id");



ALTER TABLE ONLY "public"."broadcast_sessions"
    ADD CONSTRAINT "broadcast_sessions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."demo_requests"
    ADD CONSTRAINT "demo_requests_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."event_attendees"
    ADD CONSTRAINT "event_attendees_event_id_organization_id_key" UNIQUE ("event_id", "organization_id");



ALTER TABLE ONLY "public"."event_attendees"
    ADD CONSTRAINT "event_attendees_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."events"
    ADD CONSTRAINT "events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."leads"
    ADD CONSTRAINT "leads_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."licenses"
    ADD CONSTRAINT "licenses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."marketplace_attachments"
    ADD CONSTRAINT "marketplace_attachments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."marketplace_comments"
    ADD CONSTRAINT "marketplace_comments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."marketplace_posts"
    ADD CONSTRAINT "marketplace_posts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."municipality_organization_invites"
    ADD CONSTRAINT "municipality_organization_invites_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."municipality_organization_invites"
    ADD CONSTRAINT "municipality_organization_invites_token_hash_key" UNIQUE ("token_hash");



ALTER TABLE ONLY "public"."notification_preferences"
    ADD CONSTRAINT "notification_preferences_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notification_preferences"
    ADD CONSTRAINT "notification_preferences_profile_id_activity_code_key" UNIQUE ("profile_id", "activity_code");



ALTER TABLE ONLY "public"."orders_start"
    ADD CONSTRAINT "orders_start_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."organization_activities"
    ADD CONSTRAINT "organization_activities_one_per_org" UNIQUE ("organization_id");



ALTER TABLE ONLY "public"."organization_activities"
    ADD CONSTRAINT "organization_activities_pkey" PRIMARY KEY ("organization_id", "activity_code");



ALTER TABLE ONLY "public"."organization_members"
    ADD CONSTRAINT "organization_members_organization_id_user_id_key" UNIQUE ("organization_id", "user_id");



ALTER TABLE ONLY "public"."organization_members"
    ADD CONSTRAINT "organization_members_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."organization_members"
    ADD CONSTRAINT "organization_members_unique_user_org" UNIQUE ("user_id", "organization_id");



ALTER TABLE ONLY "public"."organizations"
    ADD CONSTRAINT "organizations_join_code_unique" UNIQUE ("join_code");



ALTER TABLE ONLY "public"."organizations"
    ADD CONSTRAINT "organizations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."organizations"
    ADD CONSTRAINT "organizations_registration_number_key" UNIQUE ("registration_number");



ALTER TABLE ONLY "public"."platform_admins"
    ADD CONSTRAINT "platform_admins_pkey" PRIMARY KEY ("user_id");



ALTER TABLE ONLY "public"."portal_posts"
    ADD CONSTRAINT "portal_posts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."resources"
    ADD CONSTRAINT "resources_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."schools"
    ADD CONSTRAINT "schools_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_audience_preferences"
    ADD CONSTRAINT "user_audience_preferences_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_audience_preferences"
    ADD CONSTRAINT "user_audience_preferences_user_id_audience_slug_key" UNIQUE ("user_id", "audience_slug");



ALTER TABLE ONLY "public"."user_category_preferences"
    ADD CONSTRAINT "user_category_preferences_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_category_preferences"
    ADD CONSTRAINT "user_category_preferences_user_id_category_slug_key" UNIQUE ("user_id", "category_slug");



ALTER TABLE ONLY "public"."user_interests"
    ADD CONSTRAINT "user_interests_pkey" PRIMARY KEY ("user_id", "interest_slug");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_pkey" PRIMARY KEY ("user_id");



CREATE INDEX "access_requests_created_at_idx" ON "public"."access_requests" USING "btree" ("created_at" DESC);



CREATE INDEX "access_requests_email_idx" ON "public"."access_requests" USING "btree" ("email");



CREATE INDEX "access_requests_status_idx" ON "public"."access_requests" USING "btree" ("status");



CREATE UNIQUE INDEX "best_practice_posts_one_featured" ON "public"."best_practice_posts" USING "btree" ("is_featured") WHERE "is_featured";



CREATE INDEX "best_practice_posts_org_idx" ON "public"."best_practice_posts" USING "btree" ("organization_id");



CREATE INDEX "best_practice_posts_status_idx" ON "public"."best_practice_posts" USING "btree" ("status");



CREATE UNIQUE INDEX "broadcast_sessions_platform_external_meeting_uidx" ON "public"."broadcast_sessions" USING "btree" ("platform", "external_meeting_id") WHERE ("external_meeting_id" IS NOT NULL);



CREATE INDEX "events_starts_at_idx" ON "public"."events" USING "btree" ("starts_at");



CREATE INDEX "idx_org_members_role" ON "public"."organization_members" USING "btree" ("role_in_org");



CREATE INDEX "idx_organizations_join_code" ON "public"."organizations" USING "btree" ("join_code");



CREATE INDEX "idx_organizations_type" ON "public"."organizations" USING "btree" ("org_type");



CREATE INDEX "idx_schools_archimedes" ON "public"."schools" USING "btree" ("has_archimedes_classroom");



CREATE INDEX "idx_schools_city" ON "public"."schools" USING "btree" ("city");



CREATE INDEX "idx_schools_published" ON "public"."schools" USING "btree" ("is_published");



CREATE INDEX "idx_schools_region" ON "public"."schools" USING "btree" ("region");



CREATE INDEX "idx_schools_type" ON "public"."schools" USING "btree" ("school_type");



CREATE INDEX "leads_created_at_idx" ON "public"."leads" USING "btree" ("created_at" DESC);



CREATE INDEX "leads_status_idx" ON "public"."leads" USING "btree" ("status");



CREATE INDEX "marketplace_posts_expires_at_idx" ON "public"."marketplace_posts" USING "btree" ("expires_at");



CREATE INDEX "marketplace_posts_is_closed_idx" ON "public"."marketplace_posts" USING "btree" ("is_closed");



CREATE INDEX "marketplace_posts_kind_idx" ON "public"."marketplace_posts" USING "btree" ("kind");



CREATE INDEX "marketplace_posts_search_idx" ON "public"."marketplace_posts" USING "gin" ("search_tsv");



CREATE INDEX "municipality_organization_invites_municipality_idx" ON "public"."municipality_organization_invites" USING "btree" ("municipality_id", "created_at" DESC);



CREATE INDEX "municipality_organization_invites_pending_idx" ON "public"."municipality_organization_invites" USING "btree" ("token_hash", "expires_at") WHERE ("status" = 'pending'::"text");



CREATE INDEX "organizations_ico_idx" ON "public"."organizations" USING "btree" ("ico");



CREATE INDEX "portal_posts_section_idx" ON "public"."portal_posts" USING "btree" ("section", "is_published", "created_at" DESC);



CREATE INDEX "profiles_role_idx" ON "public"."profiles" USING "btree" ("role");



CREATE INDEX "profiles_school_id_idx" ON "public"."profiles" USING "btree" ("school_id");



CREATE INDEX "schools_lat_lng_idx" ON "public"."schools" USING "btree" ("lat", "lng");



CREATE INDEX "user_audience_preferences_user_id_idx" ON "public"."user_audience_preferences" USING "btree" ("user_id");



CREATE INDEX "user_category_preferences_user_id_idx" ON "public"."user_category_preferences" USING "btree" ("user_id");



CREATE OR REPLACE TRIGGER "enforce_profile_self_update_security" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."enforce_profile_self_update_security"();



CREATE OR REPLACE TRIGGER "trg_announcements_updated_at" BEFORE UPDATE ON "public"."announcements" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_events_updated_at" BEFORE UPDATE ON "public"."events" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_generate_join_code" BEFORE INSERT ON "public"."organizations" FOR EACH ROW EXECUTE FUNCTION "public"."generate_join_code"();



CREATE OR REPLACE TRIGGER "trg_generate_obec_registration_number" BEFORE INSERT ON "public"."organizations" FOR EACH ROW EXECUTE FUNCTION "public"."generate_obec_registration_number"();



CREATE OR REPLACE TRIGGER "trg_generate_spolek_registration_number" BEFORE INSERT ON "public"."organizations" FOR EACH ROW EXECUTE FUNCTION "public"."generate_spolek_registration_number"();



CREATE OR REPLACE TRIGGER "trg_marketplace_posts_tsv" BEFORE INSERT OR UPDATE ON "public"."marketplace_posts" FOR EACH ROW EXECUTE FUNCTION "public"."marketplace_posts_tsv_update"();



CREATE OR REPLACE TRIGGER "trg_portal_posts_updated_at" BEFORE UPDATE ON "public"."portal_posts" FOR EACH ROW EXECUTE FUNCTION "public"."set_portal_posts_updated_at"();



CREATE OR REPLACE TRIGGER "trg_schools_updated_at" BEFORE UPDATE ON "public"."schools" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



ALTER TABLE ONLY "public"."access_requests"
    ADD CONSTRAINT "access_requests_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."admin_users"
    ADD CONSTRAINT "admin_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."archive_items"
    ADD CONSTRAINT "archive_items_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."best_practice_posts"
    ADD CONSTRAINT "best_practice_posts_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."best_practice_posts"
    ADD CONSTRAINT "best_practice_posts_author_user_id_fkey" FOREIGN KEY ("author_user_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."best_practice_posts"
    ADD CONSTRAINT "best_practice_posts_category_fkey" FOREIGN KEY ("category") REFERENCES "public"."best_practice_categories"("code");



ALTER TABLE ONLY "public"."best_practice_posts"
    ADD CONSTRAINT "best_practice_posts_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."broadcast_participants"
    ADD CONSTRAINT "broadcast_participants_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."broadcast_participants"
    ADD CONSTRAINT "broadcast_participants_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."broadcast_sessions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."broadcast_participants"
    ADD CONSTRAINT "broadcast_participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."broadcast_sessions"
    ADD CONSTRAINT "broadcast_sessions_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."event_attendees"
    ADD CONSTRAINT "event_attendees_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."event_attendees"
    ADD CONSTRAINT "event_attendees_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."event_attendees"
    ADD CONSTRAINT "event_attendees_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."licenses"
    ADD CONSTRAINT "licenses_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."marketplace_attachments"
    ADD CONSTRAINT "marketplace_attachments_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."marketplace_attachments"
    ADD CONSTRAINT "marketplace_attachments_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."marketplace_posts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."marketplace_comments"
    ADD CONSTRAINT "marketplace_comments_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."marketplace_comments"
    ADD CONSTRAINT "marketplace_comments_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."marketplace_posts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."marketplace_posts"
    ADD CONSTRAINT "marketplace_posts_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."municipality_organization_invites"
    ADD CONSTRAINT "municipality_organization_invites_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."municipality_organization_invites"
    ADD CONSTRAINT "municipality_organization_invites_municipality_id_fkey" FOREIGN KEY ("municipality_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."municipality_organization_invites"
    ADD CONSTRAINT "municipality_organization_invites_used_organization_id_fkey" FOREIGN KEY ("used_organization_id") REFERENCES "public"."organizations"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."notification_preferences"
    ADD CONSTRAINT "notification_preferences_activity_code_fkey" FOREIGN KEY ("activity_code") REFERENCES "public"."activity_categories"("code");



ALTER TABLE ONLY "public"."notification_preferences"
    ADD CONSTRAINT "notification_preferences_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."organization_activities"
    ADD CONSTRAINT "organization_activities_activity_code_fkey" FOREIGN KEY ("activity_code") REFERENCES "public"."activity_categories"("code");



ALTER TABLE ONLY "public"."organization_activities"
    ADD CONSTRAINT "organization_activities_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."organization_members"
    ADD CONSTRAINT "organization_members_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."organizations"
    ADD CONSTRAINT "organizations_activated_by_fkey" FOREIGN KEY ("activated_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."organizations"
    ADD CONSTRAINT "organizations_classroom_eligibility_verified_by_fkey" FOREIGN KEY ("classroom_eligibility_verified_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."organizations"
    ADD CONSTRAINT "organizations_parent_organization_id_fkey" FOREIGN KEY ("parent_organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."organizations"
    ADD CONSTRAINT "organizations_primary_activity_code_fkey" FOREIGN KEY ("primary_activity_code") REFERENCES "public"."activity_categories"("code");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_active_organization_id_fkey" FOREIGN KEY ("active_organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."resources"
    ADD CONSTRAINT "resources_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."user_audience_preferences"
    ADD CONSTRAINT "user_audience_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_category_preferences"
    ADD CONSTRAINT "user_category_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Admin full access" ON "public"."broadcast_sessions" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."platform_admins"
  WHERE ("platform_admins"."user_id" = "auth"."uid"())))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."platform_admins"
  WHERE ("platform_admins"."user_id" = "auth"."uid"()))));



CREATE POLICY "Allow read for admins" ON "public"."orders_start" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."platform_admins"
  WHERE ("platform_admins"."user_id" = "auth"."uid"()))));



ALTER TABLE "public"."access_requests" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."activity_categories" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "activity_categories_select_auth" ON "public"."activity_categories" FOR SELECT USING (true);



CREATE POLICY "activity_categories_write_admin" ON "public"."activity_categories" TO "authenticated" USING ("public"."is_platform_admin"()) WITH CHECK ("public"."is_platform_admin"());



ALTER TABLE "public"."admin_users" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "admin_users_select_admin" ON "public"."admin_users" FOR SELECT TO "authenticated" USING ("public"."is_admin"());



CREATE POLICY "admin_users_select_self" ON "public"."admin_users" FOR SELECT TO "authenticated" USING (("user_id" = "auth"."uid"()));



ALTER TABLE "public"."announcements" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "announcements_select_all_auth" ON "public"."announcements" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "announcements_select_public" ON "public"."announcements" FOR SELECT USING (("is_published" = true));



CREATE POLICY "announcements_write_admin" ON "public"."announcements" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



ALTER TABLE "public"."api_rate_limits" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."archive_items" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "archive_select" ON "public"."archive_items" FOR SELECT USING ((("visibility" = 'public'::"text") OR ("auth"."uid"() IS NOT NULL)));



CREATE POLICY "archive_write" ON "public"."archive_items" TO "authenticated" USING ("public"."is_platform_admin"()) WITH CHECK ("public"."is_platform_admin"());



ALTER TABLE "public"."audience_groups" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "audience_groups_select_auth" ON "public"."audience_groups" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "audience_groups_write_admin" ON "public"."audience_groups" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



ALTER TABLE "public"."backup_orders_start_final_cleanup" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."backup_orders_start_null_pending" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."backup_orders_start_to_delete_orgs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."backup_organization_members_final_cleanup" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."backup_organization_members_to_delete" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."backup_organizations_final_cleanup" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."backup_organizations_to_delete" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."backup_profiles_before_cleanup" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."backup_profiles_final_cleanup" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."best_practice_categories" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "best_practice_categories_select_authenticated" ON "public"."best_practice_categories" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "best_practice_categories_write_admin" ON "public"."best_practice_categories" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



ALTER TABLE "public"."best_practice_posts" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "best_practice_posts_delete_admin" ON "public"."best_practice_posts" FOR DELETE TO "authenticated" USING ("public"."is_admin"());



CREATE POLICY "best_practice_posts_delete_org_admin" ON "public"."best_practice_posts" FOR DELETE TO "authenticated" USING (("public"."is_org_admin"("organization_id") AND ("status" = 'pending'::"text")));



CREATE POLICY "best_practice_posts_insert_org_admin" ON "public"."best_practice_posts" FOR INSERT TO "authenticated" WITH CHECK (("public"."is_org_admin"("organization_id") AND ("status" = 'pending'::"text") AND ("is_featured" = false) AND ("author_user_id" = "auth"."uid"())));



CREATE POLICY "best_practice_posts_select_approved_authenticated" ON "public"."best_practice_posts" FOR SELECT TO "authenticated" USING (("status" = 'approved'::"text"));



CREATE POLICY "best_practice_posts_select_featured_public" ON "public"."best_practice_posts" FOR SELECT TO "anon" USING ((("status" = 'approved'::"text") AND "is_featured"));



CREATE POLICY "best_practice_posts_select_own_org" ON "public"."best_practice_posts" FOR SELECT TO "authenticated" USING (("public"."is_org_admin"("organization_id") OR "public"."is_admin"()));



CREATE POLICY "best_practice_posts_update_admin" ON "public"."best_practice_posts" FOR UPDATE TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "best_practice_posts_update_org_admin" ON "public"."best_practice_posts" FOR UPDATE TO "authenticated" USING (("public"."is_org_admin"("organization_id") AND ("status" = 'pending'::"text"))) WITH CHECK (("public"."is_org_admin"("organization_id") AND ("status" = 'pending'::"text") AND ("is_featured" = false)));



ALTER TABLE "public"."broadcast_participants" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."broadcast_sessions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "broadcast_sessions_select_published_or_admin" ON "public"."broadcast_sessions" FOR SELECT TO "authenticated" USING (("public"."is_admin"() OR (EXISTS ( SELECT 1
   FROM "public"."events" "event"
  WHERE (("event"."id" = "broadcast_sessions"."event_id") AND ("event"."is_published" = true))))));



ALTER TABLE "public"."categories" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "categories_select_auth" ON "public"."categories" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "categories_write_admin" ON "public"."categories" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "demo can read events" ON "public"."events" FOR SELECT TO "authenticated" USING (((EXISTS ( SELECT 1
   FROM "public"."organization_members" "om"
  WHERE (("om"."user_id" = "auth"."uid"()) AND ("om"."role_in_org" = 'demo_viewer'::"text") AND ("om"."status" = 'active'::"text")))) AND ("is_published" = true)));



CREATE POLICY "demo can read schools" ON "public"."schools" FOR SELECT TO "authenticated" USING (((EXISTS ( SELECT 1
   FROM "public"."organization_members" "om"
  WHERE (("om"."user_id" = "auth"."uid"()) AND ("om"."role_in_org" = 'demo_viewer'::"text") AND ("om"."status" = 'active'::"text")))) AND ("is_published" = true)));



ALTER TABLE "public"."demo_requests" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."event_attendees" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "event_attendees_delete" ON "public"."event_attendees" FOR DELETE TO "authenticated" USING (("public"."is_admin"() OR ("user_id" = "auth"."uid"())));



CREATE POLICY "event_attendees_insert" ON "public"."event_attendees" FOR INSERT TO "authenticated" WITH CHECK ((("user_id" = "auth"."uid"()) AND (EXISTS ( SELECT 1
   FROM ("public"."organization_members" "om"
     JOIN "public"."profiles" "p" ON (("p"."id" = "auth"."uid"())))
  WHERE (("om"."user_id" = "auth"."uid"()) AND ("om"."organization_id" = "p"."active_organization_id") AND ("om"."organization_id" = "event_attendees"."organization_id") AND ("om"."status" = 'active'::"text"))))));



CREATE POLICY "event_attendees_select" ON "public"."event_attendees" FOR SELECT TO "authenticated" USING (("public"."is_admin"() OR (EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."active_organization_id" = "event_attendees"."organization_id"))))));



ALTER TABLE "public"."events" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "events_delete_admin" ON "public"."events" FOR DELETE TO "authenticated" USING ("public"."is_platform_admin"());



CREATE POLICY "events_insert_platform_admin_only" ON "public"."events" FOR INSERT TO "authenticated" WITH CHECK (( SELECT "public"."is_platform_admin"() AS "is_platform_admin"));



CREATE POLICY "events_select_platform_admin" ON "public"."events" FOR SELECT TO "authenticated" USING (( SELECT "public"."is_platform_admin"() AS "is_platform_admin"));



CREATE POLICY "events_select_published_or_admin" ON "public"."events" FOR SELECT USING (("is_published" = true));



CREATE POLICY "events_update_admin" ON "public"."events" FOR UPDATE TO "authenticated" USING ("public"."is_platform_admin"()) WITH CHECK ("public"."is_platform_admin"());



ALTER TABLE "public"."leads" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "leads_delete_admin" ON "public"."leads" FOR DELETE TO "authenticated" USING ("public"."is_admin"());



CREATE POLICY "leads_select_admin" ON "public"."leads" FOR SELECT TO "authenticated" USING ("public"."is_admin"());



CREATE POLICY "leads_update_admin" ON "public"."leads" FOR UPDATE TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



ALTER TABLE "public"."licenses" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "licenses_select" ON "public"."licenses" FOR SELECT TO "authenticated" USING (("public"."is_platform_admin"() OR (EXISTS ( SELECT 1
   FROM "public"."organization_members" "om"
  WHERE (("om"."organization_id" = "licenses"."organization_id") AND ("om"."user_id" = "auth"."uid"()) AND ("om"."status" = 'active'::"text"))))));



CREATE POLICY "licenses_write" ON "public"."licenses" TO "authenticated" USING ("public"."is_platform_admin"()) WITH CHECK ("public"."is_platform_admin"());



ALTER TABLE "public"."marketplace_attachments" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "marketplace_attachments_insert_own" ON "public"."marketplace_attachments" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."marketplace_posts" "p"
  WHERE (("p"."id" = "marketplace_attachments"."post_id") AND ("p"."author_id" = "auth"."uid"())))));



ALTER TABLE "public"."marketplace_comments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."marketplace_posts" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "marketplace_posts_insert_own" ON "public"."marketplace_posts" FOR INSERT TO "authenticated" WITH CHECK (("author_id" = "auth"."uid"()));



CREATE POLICY "mp_att_delete_owner_or_admin" ON "public"."marketplace_attachments" FOR DELETE TO "authenticated" USING ((("author_id" = "auth"."uid"()) OR "public"."is_admin"()));



CREATE POLICY "mp_att_insert_owner" ON "public"."marketplace_attachments" FOR INSERT TO "authenticated" WITH CHECK (("author_id" = "auth"."uid"()));



CREATE POLICY "mp_att_select_auth" ON "public"."marketplace_attachments" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "mp_com_insert_owner" ON "public"."marketplace_comments" FOR INSERT TO "authenticated" WITH CHECK ((("author_id" = "auth"."uid"()) AND ("length"(TRIM(BOTH FROM "body")) >= 2)));



CREATE POLICY "mp_com_select_auth" ON "public"."marketplace_comments" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "mp_com_update_owner_or_admin" ON "public"."marketplace_comments" FOR UPDATE TO "authenticated" USING ((("author_id" = "auth"."uid"()) OR "public"."is_admin"())) WITH CHECK ((("author_id" = "auth"."uid"()) OR "public"."is_admin"()));



CREATE POLICY "mp_delete_owner_or_admin" ON "public"."marketplace_posts" FOR DELETE TO "authenticated" USING ((("author_id" = "auth"."uid"()) OR "public"."is_admin"()));



CREATE POLICY "mp_insert_auth" ON "public"."marketplace_posts" FOR INSERT TO "authenticated" WITH CHECK ((("author_id" = "auth"."uid"()) AND ("contact_email" IS NOT NULL) AND ("length"(TRIM(BOTH FROM "contact_email")) > 3)));



CREATE POLICY "mp_select_auth" ON "public"."marketplace_posts" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "mp_update_owner_or_admin" ON "public"."marketplace_posts" FOR UPDATE TO "authenticated" USING ((("author_id" = "auth"."uid"()) OR "public"."is_admin"())) WITH CHECK (((("author_id" = "auth"."uid"()) OR "public"."is_admin"()) AND ("contact_email" IS NOT NULL) AND ("length"(TRIM(BOTH FROM "contact_email")) > 3)));



ALTER TABLE "public"."municipality_organization_invites" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."notification_preferences" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "notification_preferences_insert" ON "public"."notification_preferences" FOR INSERT WITH CHECK (("profile_id" = "auth"."uid"()));



CREATE POLICY "notification_preferences_select" ON "public"."notification_preferences" FOR SELECT USING (("profile_id" = "auth"."uid"()));



CREATE POLICY "notification_preferences_update" ON "public"."notification_preferences" FOR UPDATE USING (("profile_id" = "auth"."uid"())) WITH CHECK (("profile_id" = "auth"."uid"()));



ALTER TABLE "public"."orders_start" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "org_members_delete" ON "public"."organization_members" FOR DELETE TO "authenticated" USING (("public"."is_platform_admin"() OR "public"."is_org_admin"("organization_id")));



CREATE POLICY "org_members_select" ON "public"."organization_members" FOR SELECT TO "authenticated" USING ((("user_id" = "auth"."uid"()) OR "public"."is_org_admin_member"("organization_id") OR "public"."is_admin"()));



CREATE POLICY "org_members_update" ON "public"."organization_members" FOR UPDATE TO "authenticated" USING (("public"."is_platform_admin"() OR "public"."is_org_admin"("organization_id"))) WITH CHECK (("public"."is_platform_admin"() OR "public"."is_org_admin"("organization_id")));



CREATE POLICY "org_members_write" ON "public"."organization_members" FOR INSERT TO "authenticated" WITH CHECK (("public"."is_platform_admin"() OR "public"."is_org_admin"("organization_id")));



ALTER TABLE "public"."organization_activities" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "organization_activities_delete" ON "public"."organization_activities" FOR DELETE TO "authenticated" USING (("public"."is_platform_admin"() OR "public"."is_org_admin"("organization_id")));



CREATE POLICY "organization_activities_select" ON "public"."organization_activities" FOR SELECT TO "authenticated" USING (("public"."is_platform_admin"() OR "public"."is_org_admin"("organization_id") OR "public"."is_org_admin_member"("organization_id")));



CREATE POLICY "organization_activities_update" ON "public"."organization_activities" FOR UPDATE TO "authenticated" USING (("public"."is_platform_admin"() OR "public"."is_org_admin"("organization_id"))) WITH CHECK (("public"."is_platform_admin"() OR "public"."is_org_admin"("organization_id")));



CREATE POLICY "organization_activities_write" ON "public"."organization_activities" FOR INSERT TO "authenticated" WITH CHECK (("public"."is_platform_admin"() OR "public"."is_org_admin"("organization_id")));



ALTER TABLE "public"."organization_members" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."organizations" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "organizations_direct_select_platform_admin" ON "public"."organizations" AS RESTRICTIVE FOR SELECT TO "authenticated" USING ("public"."is_admin"());



CREATE POLICY "orgs_select" ON "public"."organizations" FOR SELECT TO "authenticated" USING (("public"."is_platform_admin"() OR (EXISTS ( SELECT 1
   FROM "public"."organization_members" "om"
  WHERE (("om"."organization_id" = "organizations"."id") AND ("om"."user_id" = "auth"."uid"()) AND ("om"."status" = 'active'::"text"))))));



CREATE POLICY "orgs_write" ON "public"."organizations" TO "authenticated" USING ("public"."is_platform_admin"()) WITH CHECK ("public"."is_platform_admin"());



ALTER TABLE "public"."platform_admins" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "platform_admins_all" ON "public"."platform_admins" TO "authenticated" USING ("public"."is_platform_admin"()) WITH CHECK ("public"."is_platform_admin"());



ALTER TABLE "public"."portal_posts" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "portal_posts_admin_delete" ON "public"."portal_posts" FOR DELETE TO "authenticated" USING ("public"."is_admin"());



CREATE POLICY "portal_posts_admin_insert" ON "public"."portal_posts" FOR INSERT TO "authenticated" WITH CHECK ((("auth"."uid"() IS NOT NULL) AND "public"."is_admin"() AND ("created_by" = "auth"."uid"())));



CREATE POLICY "portal_posts_admin_select" ON "public"."portal_posts" FOR SELECT TO "authenticated" USING ("public"."is_admin"());



CREATE POLICY "portal_posts_admin_update" ON "public"."portal_posts" FOR UPDATE TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "portal_posts_read_published" ON "public"."portal_posts" FOR SELECT USING (("is_published" = true));



ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "profiles_insert_own" ON "public"."profiles" FOR INSERT TO "authenticated" WITH CHECK (("id" = "auth"."uid"()));



CREATE POLICY "profiles_select" ON "public"."profiles" FOR SELECT TO "authenticated" USING ((("id" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."organization_members" "om"
  WHERE (("om"."user_id" = "profiles"."id") AND ("om"."organization_id" IN ( SELECT "organization_members"."organization_id"
           FROM "public"."organization_members"
          WHERE ("organization_members"."user_id" = "auth"."uid"()))))))));



CREATE POLICY "profiles_update_own" ON "public"."profiles" FOR UPDATE TO "authenticated" USING (("id" = "auth"."uid"())) WITH CHECK (("id" = "auth"."uid"()));



CREATE POLICY "profiles_update_same_school_admin" ON "public"."profiles" FOR UPDATE TO "authenticated" USING (("public"."is_school_admin"() AND ("school_id" = "public"."my_school_id"()))) WITH CHECK (("school_id" = "public"."my_school_id"()));



ALTER TABLE "public"."resources" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "resources_select" ON "public"."resources" FOR SELECT USING ((("visibility" = 'public'::"text") OR ("auth"."uid"() IS NOT NULL)));



CREATE POLICY "resources_write" ON "public"."resources" TO "authenticated" USING ("public"."is_platform_admin"()) WITH CHECK ("public"."is_platform_admin"());



CREATE POLICY "roles_select_admin" ON "public"."user_roles" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."user_roles" "ur"
  WHERE (("ur"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'admin'::"text")))));



ALTER TABLE "public"."schools" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "schools_admin_all" ON "public"."schools" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "schools_public_read" ON "public"."schools" FOR SELECT TO "authenticated" USING (("is_published" = true));



CREATE POLICY "schools_public_select" ON "public"."schools" FOR SELECT TO "anon" USING (("is_published" = true));



CREATE POLICY "uap_delete_own" ON "public"."user_audience_preferences" FOR DELETE TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "uap_insert_own" ON "public"."user_audience_preferences" FOR INSERT TO "authenticated" WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "uap_manage_same_school_admin" ON "public"."user_audience_preferences" TO "authenticated" USING (("public"."is_school_admin"() AND (EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "user_audience_preferences"."user_id") AND ("p"."school_id" = "public"."my_school_id"())))))) WITH CHECK (("public"."is_school_admin"() AND (EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "user_audience_preferences"."user_id") AND ("p"."school_id" = "public"."my_school_id"()))))));



CREATE POLICY "uap_select_own_or_same_school" ON "public"."user_audience_preferences" FOR SELECT TO "authenticated" USING ((("user_id" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "user_audience_preferences"."user_id") AND ("p"."school_id" = "public"."my_school_id"()))))));



CREATE POLICY "ucp_delete_own" ON "public"."user_category_preferences" FOR DELETE TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "ucp_insert_own" ON "public"."user_category_preferences" FOR INSERT TO "authenticated" WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "ucp_manage_same_school_admin" ON "public"."user_category_preferences" TO "authenticated" USING (("public"."is_school_admin"() AND (EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "user_category_preferences"."user_id") AND ("p"."school_id" = "public"."my_school_id"())))))) WITH CHECK (("public"."is_school_admin"() AND (EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "user_category_preferences"."user_id") AND ("p"."school_id" = "public"."my_school_id"()))))));



CREATE POLICY "ucp_select_own_or_same_school" ON "public"."user_category_preferences" FOR SELECT TO "authenticated" USING ((("user_id" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "user_category_preferences"."user_id") AND ("p"."school_id" = "public"."my_school_id"()))))));



ALTER TABLE "public"."user_audience_preferences" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_category_preferences" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_interests" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "user_interests_delete" ON "public"."user_interests" FOR DELETE TO "authenticated" USING ((("user_id" = "auth"."uid"()) OR "public"."is_admin"()));



CREATE POLICY "user_interests_insert" ON "public"."user_interests" FOR INSERT WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "user_interests_select" ON "public"."user_interests" FOR SELECT TO "authenticated" USING ((("user_id" = "auth"."uid"()) OR "public"."is_admin"()));



ALTER TABLE "public"."user_roles" ENABLE ROW LEVEL SECURITY;


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



REVOKE ALL ON FUNCTION "public"."activate_customer_with_admin"("p_organization_id" "uuid", "p_user_id" "uuid", "p_email" "text", "p_full_name" "text", "p_must_set_password" boolean) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."activate_customer_with_admin"("p_organization_id" "uuid", "p_user_id" "uuid", "p_email" "text", "p_full_name" "text", "p_must_set_password" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."activate_customer_with_admin"("p_organization_id" "uuid", "p_user_id" "uuid", "p_email" "text", "p_full_name" "text", "p_must_set_password" boolean) TO "service_role";



REVOKE ALL ON FUNCTION "public"."activate_customer_with_admin_v2"("p_organization_id" "uuid", "p_user_id" "uuid", "p_email" "text", "p_full_name" "text", "p_license_plan" "text", "p_license_started_at" timestamp with time zone, "p_license_valid_until" timestamp with time zone, "p_contract_status" "text", "p_billing_status" "text", "p_classroom_eligibility_verified" boolean, "p_must_set_password" boolean) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."activate_customer_with_admin_v2"("p_organization_id" "uuid", "p_user_id" "uuid", "p_email" "text", "p_full_name" "text", "p_license_plan" "text", "p_license_started_at" timestamp with time zone, "p_license_valid_until" timestamp with time zone, "p_contract_status" "text", "p_billing_status" "text", "p_classroom_eligibility_verified" boolean, "p_must_set_password" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."activate_customer_with_admin_v2"("p_organization_id" "uuid", "p_user_id" "uuid", "p_email" "text", "p_full_name" "text", "p_license_plan" "text", "p_license_started_at" timestamp with time zone, "p_license_valid_until" timestamp with time zone, "p_contract_status" "text", "p_billing_status" "text", "p_classroom_eligibility_verified" boolean, "p_must_set_password" boolean) TO "service_role";



REVOKE ALL ON FUNCTION "public"."activate_municipality_with_admin"("p_organization_id" "uuid", "p_user_id" "uuid", "p_email" "text", "p_full_name" "text", "p_must_set_password" boolean) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."activate_municipality_with_admin"("p_organization_id" "uuid", "p_user_id" "uuid", "p_email" "text", "p_full_name" "text", "p_must_set_password" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."activate_municipality_with_admin"("p_organization_id" "uuid", "p_user_id" "uuid", "p_email" "text", "p_full_name" "text", "p_must_set_password" boolean) TO "service_role";



REVOKE ALL ON FUNCTION "public"."consume_api_rate_limit"("p_route" "text", "p_key_hash" "text", "p_limit" integer, "p_window_seconds" integer) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."consume_api_rate_limit"("p_route" "text", "p_key_hash" "text", "p_limit" integer, "p_window_seconds" integer) TO "service_role";



REVOKE ALL ON FUNCTION "public"."create_pending_customer"("p_name" "text", "p_org_type" "text", "p_legal_identifier" "text", "p_address" "text", "p_contact_name" "text", "p_contact_email" "text", "p_contact_phone" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."create_pending_customer"("p_name" "text", "p_org_type" "text", "p_legal_identifier" "text", "p_address" "text", "p_contact_name" "text", "p_contact_email" "text", "p_contact_phone" "text") TO "service_role";



REVOKE ALL ON FUNCTION "public"."enforce_profile_self_update_security"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."enforce_profile_self_update_security"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."find_conflicting_customer"("p_org_type" "text", "p_email" "text", "p_name" "text", "p_legal_identifier" "text", "p_address" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."find_conflicting_customer"("p_org_type" "text", "p_email" "text", "p_name" "text", "p_legal_identifier" "text", "p_address" "text") TO "service_role";



REVOKE ALL ON FUNCTION "public"."find_conflicting_obec"("p_email" "text", "p_name" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."find_conflicting_obec"("p_email" "text", "p_name" "text") TO "service_role";



REVOKE ALL ON FUNCTION "public"."generate_join_code"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."generate_join_code"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."generate_obec_registration_number"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."generate_obec_registration_number"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."generate_spolek_registration_number"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."generate_spolek_registration_number"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_my_organizations"("requested_ids" "uuid"[]) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_my_organizations"("requested_ids" "uuid"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_my_organizations"("requested_ids" "uuid"[]) TO "service_role";



REVOKE ALL ON FUNCTION "public"."handle_new_user"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."is_admin"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."is_admin"() TO "service_role";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "authenticated";



REVOKE ALL ON FUNCTION "public"."is_org_admin"("org_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."is_org_admin"("org_id" "uuid") TO "service_role";
GRANT ALL ON FUNCTION "public"."is_org_admin"("org_id" "uuid") TO "authenticated";



REVOKE ALL ON FUNCTION "public"."is_org_admin_member"("org_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."is_org_admin_member"("org_id" "uuid") TO "service_role";
GRANT ALL ON FUNCTION "public"."is_org_admin_member"("org_id" "uuid") TO "authenticated";



REVOKE ALL ON FUNCTION "public"."is_platform_admin"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."is_platform_admin"() TO "service_role";
GRANT ALL ON FUNCTION "public"."is_platform_admin"() TO "authenticated";



REVOKE ALL ON FUNCTION "public"."is_school_admin"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."is_school_admin"() TO "service_role";
GRANT ALL ON FUNCTION "public"."is_school_admin"() TO "authenticated";



REVOKE ALL ON FUNCTION "public"."marketplace_posts_tsv_update"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."marketplace_posts_tsv_update"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."my_school_id"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."my_school_id"() TO "service_role";
GRANT ALL ON FUNCTION "public"."my_school_id"() TO "authenticated";



REVOKE ALL ON FUNCTION "public"."set_featured_best_practice_post"("post_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."set_featured_best_practice_post"("post_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_featured_best_practice_post"("post_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."set_portal_posts_updated_at"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."set_portal_posts_updated_at"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."set_updated_at"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "service_role";



GRANT SELECT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."access_requests" TO "anon";
GRANT SELECT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."access_requests" TO "authenticated";
GRANT ALL ON TABLE "public"."access_requests" TO "service_role";



GRANT ALL ON TABLE "public"."activity_categories" TO "anon";
GRANT ALL ON TABLE "public"."activity_categories" TO "authenticated";
GRANT ALL ON TABLE "public"."activity_categories" TO "service_role";



GRANT ALL ON TABLE "public"."admin_users" TO "anon";
GRANT ALL ON TABLE "public"."admin_users" TO "authenticated";
GRANT ALL ON TABLE "public"."admin_users" TO "service_role";



GRANT ALL ON TABLE "public"."announcements" TO "anon";
GRANT ALL ON TABLE "public"."announcements" TO "authenticated";
GRANT ALL ON TABLE "public"."announcements" TO "service_role";



REVOKE ALL ON TABLE "public"."api_rate_limits" FROM "anon";
REVOKE ALL ON TABLE "public"."api_rate_limits" FROM "authenticated";
GRANT ALL ON TABLE "public"."api_rate_limits" TO "service_role";



GRANT ALL ON TABLE "public"."archive_items" TO "anon";
GRANT ALL ON TABLE "public"."archive_items" TO "authenticated";
GRANT ALL ON TABLE "public"."archive_items" TO "service_role";



GRANT ALL ON TABLE "public"."audience_groups" TO "anon";
GRANT ALL ON TABLE "public"."audience_groups" TO "authenticated";
GRANT ALL ON TABLE "public"."audience_groups" TO "service_role";



GRANT ALL ON TABLE "public"."backup_orders_start_final_cleanup" TO "anon";
GRANT ALL ON TABLE "public"."backup_orders_start_final_cleanup" TO "authenticated";
GRANT ALL ON TABLE "public"."backup_orders_start_final_cleanup" TO "service_role";



GRANT ALL ON TABLE "public"."backup_orders_start_null_pending" TO "anon";
GRANT ALL ON TABLE "public"."backup_orders_start_null_pending" TO "authenticated";
GRANT ALL ON TABLE "public"."backup_orders_start_null_pending" TO "service_role";



GRANT ALL ON TABLE "public"."backup_orders_start_to_delete_orgs" TO "anon";
GRANT ALL ON TABLE "public"."backup_orders_start_to_delete_orgs" TO "authenticated";
GRANT ALL ON TABLE "public"."backup_orders_start_to_delete_orgs" TO "service_role";



GRANT ALL ON TABLE "public"."backup_organization_members_final_cleanup" TO "anon";
GRANT ALL ON TABLE "public"."backup_organization_members_final_cleanup" TO "authenticated";
GRANT ALL ON TABLE "public"."backup_organization_members_final_cleanup" TO "service_role";



GRANT ALL ON TABLE "public"."backup_organization_members_to_delete" TO "anon";
GRANT ALL ON TABLE "public"."backup_organization_members_to_delete" TO "authenticated";
GRANT ALL ON TABLE "public"."backup_organization_members_to_delete" TO "service_role";



GRANT ALL ON TABLE "public"."backup_organizations_final_cleanup" TO "anon";
GRANT ALL ON TABLE "public"."backup_organizations_final_cleanup" TO "authenticated";
GRANT ALL ON TABLE "public"."backup_organizations_final_cleanup" TO "service_role";



GRANT ALL ON TABLE "public"."backup_organizations_to_delete" TO "anon";
GRANT ALL ON TABLE "public"."backup_organizations_to_delete" TO "authenticated";
GRANT ALL ON TABLE "public"."backup_organizations_to_delete" TO "service_role";



GRANT ALL ON TABLE "public"."backup_profiles_before_cleanup" TO "anon";
GRANT ALL ON TABLE "public"."backup_profiles_before_cleanup" TO "authenticated";
GRANT ALL ON TABLE "public"."backup_profiles_before_cleanup" TO "service_role";



GRANT ALL ON TABLE "public"."backup_profiles_final_cleanup" TO "anon";
GRANT ALL ON TABLE "public"."backup_profiles_final_cleanup" TO "authenticated";
GRANT ALL ON TABLE "public"."backup_profiles_final_cleanup" TO "service_role";



GRANT ALL ON TABLE "public"."best_practice_categories" TO "anon";
GRANT ALL ON TABLE "public"."best_practice_categories" TO "authenticated";
GRANT ALL ON TABLE "public"."best_practice_categories" TO "service_role";



GRANT ALL ON TABLE "public"."best_practice_posts" TO "anon";
GRANT ALL ON TABLE "public"."best_practice_posts" TO "authenticated";
GRANT ALL ON TABLE "public"."best_practice_posts" TO "service_role";



GRANT ALL ON TABLE "public"."broadcast_participants" TO "anon";
GRANT ALL ON TABLE "public"."broadcast_participants" TO "authenticated";
GRANT ALL ON TABLE "public"."broadcast_participants" TO "service_role";



GRANT ALL ON TABLE "public"."broadcast_sessions" TO "anon";
GRANT ALL ON TABLE "public"."broadcast_sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."broadcast_sessions" TO "service_role";



GRANT ALL ON TABLE "public"."categories" TO "anon";
GRANT ALL ON TABLE "public"."categories" TO "authenticated";
GRANT ALL ON TABLE "public"."categories" TO "service_role";



GRANT SELECT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."demo_requests" TO "anon";
GRANT SELECT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."demo_requests" TO "authenticated";
GRANT ALL ON TABLE "public"."demo_requests" TO "service_role";



GRANT ALL ON TABLE "public"."event_attendees" TO "anon";
GRANT ALL ON TABLE "public"."event_attendees" TO "authenticated";
GRANT ALL ON TABLE "public"."event_attendees" TO "service_role";



GRANT ALL ON TABLE "public"."events" TO "anon";
GRANT ALL ON TABLE "public"."events" TO "authenticated";
GRANT ALL ON TABLE "public"."events" TO "service_role";



GRANT SELECT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."leads" TO "anon";
GRANT SELECT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."leads" TO "authenticated";
GRANT ALL ON TABLE "public"."leads" TO "service_role";



GRANT ALL ON TABLE "public"."licenses" TO "anon";
GRANT ALL ON TABLE "public"."licenses" TO "authenticated";
GRANT ALL ON TABLE "public"."licenses" TO "service_role";



GRANT ALL ON TABLE "public"."marketplace_attachments" TO "anon";
GRANT ALL ON TABLE "public"."marketplace_attachments" TO "authenticated";
GRANT ALL ON TABLE "public"."marketplace_attachments" TO "service_role";



GRANT ALL ON TABLE "public"."marketplace_comments" TO "anon";
GRANT ALL ON TABLE "public"."marketplace_comments" TO "authenticated";
GRANT ALL ON TABLE "public"."marketplace_comments" TO "service_role";



GRANT ALL ON TABLE "public"."marketplace_posts" TO "anon";
GRANT ALL ON TABLE "public"."marketplace_posts" TO "authenticated";
GRANT ALL ON TABLE "public"."marketplace_posts" TO "service_role";



REVOKE ALL ON TABLE "public"."municipality_organization_invites" FROM "anon";
REVOKE ALL ON TABLE "public"."municipality_organization_invites" FROM "authenticated";
GRANT ALL ON TABLE "public"."municipality_organization_invites" TO "service_role";



GRANT ALL ON TABLE "public"."notification_preferences" TO "anon";
GRANT ALL ON TABLE "public"."notification_preferences" TO "authenticated";
GRANT ALL ON TABLE "public"."notification_preferences" TO "service_role";



GRANT ALL ON SEQUENCE "public"."obec_registration_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."obec_registration_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."obec_registration_seq" TO "service_role";



GRANT SELECT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."orders_start" TO "anon";
GRANT SELECT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."orders_start" TO "authenticated";
GRANT ALL ON TABLE "public"."orders_start" TO "service_role";



GRANT ALL ON TABLE "public"."organization_activities" TO "anon";
GRANT ALL ON TABLE "public"."organization_activities" TO "authenticated";
GRANT ALL ON TABLE "public"."organization_activities" TO "service_role";



GRANT ALL ON TABLE "public"."organization_members" TO "anon";
GRANT ALL ON TABLE "public"."organization_members" TO "authenticated";
GRANT ALL ON TABLE "public"."organization_members" TO "service_role";



GRANT ALL ON TABLE "public"."organizations" TO "anon";
GRANT ALL ON TABLE "public"."organizations" TO "authenticated";
GRANT ALL ON TABLE "public"."organizations" TO "service_role";



GRANT ALL ON TABLE "public"."platform_admins" TO "anon";
GRANT ALL ON TABLE "public"."platform_admins" TO "authenticated";
GRANT ALL ON TABLE "public"."platform_admins" TO "service_role";



GRANT ALL ON TABLE "public"."portal_posts" TO "anon";
GRANT ALL ON TABLE "public"."portal_posts" TO "authenticated";
GRANT ALL ON TABLE "public"."portal_posts" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."public_program" TO "anon";
GRANT ALL ON TABLE "public"."public_program" TO "authenticated";
GRANT ALL ON TABLE "public"."public_program" TO "service_role";



GRANT ALL ON TABLE "public"."resources" TO "anon";
GRANT ALL ON TABLE "public"."resources" TO "authenticated";
GRANT ALL ON TABLE "public"."resources" TO "service_role";



GRANT ALL ON TABLE "public"."schools" TO "anon";
GRANT ALL ON TABLE "public"."schools" TO "authenticated";
GRANT ALL ON TABLE "public"."schools" TO "service_role";



GRANT ALL ON TABLE "public"."user_audience_preferences" TO "anon";
GRANT ALL ON TABLE "public"."user_audience_preferences" TO "authenticated";
GRANT ALL ON TABLE "public"."user_audience_preferences" TO "service_role";



GRANT ALL ON SEQUENCE "public"."user_audience_preferences_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."user_audience_preferences_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."user_audience_preferences_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."user_category_preferences" TO "anon";
GRANT ALL ON TABLE "public"."user_category_preferences" TO "authenticated";
GRANT ALL ON TABLE "public"."user_category_preferences" TO "service_role";



GRANT ALL ON SEQUENCE "public"."user_category_preferences_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."user_category_preferences_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."user_category_preferences_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."user_interests" TO "anon";
GRANT ALL ON TABLE "public"."user_interests" TO "authenticated";
GRANT ALL ON TABLE "public"."user_interests" TO "service_role";



GRANT ALL ON TABLE "public"."user_roles" TO "anon";
GRANT ALL ON TABLE "public"."user_roles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_roles" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";





