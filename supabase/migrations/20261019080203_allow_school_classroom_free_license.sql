-- Permit standalone schools with verified classrooms; keep all other activation safeguards.

CREATE OR REPLACE FUNCTION public.onboard_customer_v3(p_idempotency_key uuid, p_organization_id uuid, p_local_admin_user_id uuid, p_local_admin_email text, p_local_admin_full_name text, p_central_admin_user_ids uuid[], p_license_plan text, p_license_started_at timestamp with time zone, p_license_valid_until timestamp with time zone, p_contract_status text, p_billing_status text, p_classroom_eligibility_verified boolean DEFAULT false, p_local_admin_must_set_password boolean DEFAULT false)
 RETURNS TABLE(onboarding_run_id uuid, organization_id uuid, registration_number text, replayed boolean, email_status text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
#variable_conflict use_column
declare
  customer public.organizations%rowtype;
  existing_run public.organization_onboarding_runs%rowtype;
  created_run public.organization_onboarding_runs%rowtype;
  clean_email text := lower(btrim(coalesce(p_local_admin_email, '')));
  clean_full_name text := btrim(coalesce(p_local_admin_full_name, ''));
  clean_identifier text;
  configured_admin_user_ids uuid[];
  admin_user_ids uuid[];
  effective_start timestamptz := p_license_started_at;
  effective_classroom_eligibility boolean :=
    coalesce(p_classroom_eligibility_verified, false);
begin
  if (select auth.uid()) is null or not public.is_platform_admin() then
    raise exception using errcode = '42501',
      message = 'Tuto akci může provést pouze platformový administrátor.';
  end if;

  if p_idempotency_key is null or p_organization_id is null
     or p_local_admin_user_id is null or p_license_started_at is null then
    raise exception 'Chybí povinná identita onboardingu.';
  end if;

  if char_length(clean_full_name) < 2 or char_length(clean_full_name) > 120
     or char_length(clean_email) > 254
     or clean_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then
    raise exception 'Lokální správce nemá platné jméno nebo e-mail.';
  end if;

  if p_license_plan not in ('paid_monthly', 'paid_annual', 'classroom_free_12m') then
    raise exception 'Vyberte platný režim licence.';
  end if;
  if p_contract_status <> 'accepted' then
    raise exception 'Před aktivací musí být potvrzena smlouva.';
  end if;
  if p_billing_status not in ('pending', 'paid', 'not_applicable') then
    raise exception 'Neplatný stav fakturace.';
  end if;
  if p_license_plan = 'classroom_free_12m'
     and (p_billing_status <> 'not_applicable'
          or not effective_classroom_eligibility) then
    raise exception 'Bezplatná licence vyžaduje ověřenou učebnu a fakturaci bez úhrady.';
  end if;
  if p_license_plan in ('paid_annual', 'classroom_free_12m')
     and p_license_valid_until is null then
    raise exception 'U roční a bezplatné licence je povinné datum konce.';
  end if;
  if p_license_valid_until is not null
     and p_license_valid_until <= effective_start then
    raise exception 'Datum konce licence musí být později než datum začátku.';
  end if;

  select coalesce(array_agg(distinct admin_id order by admin_id), '{}')
  into configured_admin_user_ids
  from unnest(coalesce(p_central_admin_user_ids, '{}')) admin_id;

  -- A repeated transport request with the same key is a read-only replay.
  select run.*
  into existing_run
  from public.organization_onboarding_runs run
  where run.idempotency_key = p_idempotency_key;

  if found then
    if existing_run.organization_id <> p_organization_id
       or existing_run.local_admin_user_id <> p_local_admin_user_id
       or lower(btrim(existing_run.local_admin_email)) <> clean_email
       or existing_run.local_admin_full_name <> clean_full_name
       or existing_run.central_admin_user_ids <> configured_admin_user_ids
       or existing_run.license_plan <> p_license_plan
       or existing_run.license_started_at <> effective_start
       or existing_run.license_valid_until is distinct from p_license_valid_until
       or existing_run.contract_status <> p_contract_status
       or existing_run.billing_status <> p_billing_status
       or existing_run.classroom_eligibility_verified <>
          effective_classroom_eligibility then
      raise exception using errcode = '23505',
        message = 'Idempotency key already belongs to different onboarding parameters.';
    end if;

    return query select
      existing_run.id,
      existing_run.organization_id,
      (
        select organization.registration_number
        from public.organizations organization
        where organization.id = existing_run.organization_id
      ),
      true,
      existing_run.email_status;
    return;
  end if;

  perform pg_advisory_xact_lock(hashtextextended('customer-onboarding:' || p_organization_id::text, 0));

  select organization.*
  into customer
  from public.organizations organization
  where organization.id = p_organization_id
    and organization.org_type in ('municipality', 'obec', 'school', 'association', 'spolek')
    and organization.parent_organization_id is null
  for update;

  if not found then
    raise exception 'Zákazník nebyl nalezen.';
  end if;

  -- A new request key can safely replay only the same completed onboarding.
  select run.*
  into existing_run
  from public.organization_onboarding_runs run
  where run.organization_id = customer.id;

  if found then
    if existing_run.local_admin_user_id <> p_local_admin_user_id
       or lower(btrim(existing_run.local_admin_email)) <> clean_email
       or existing_run.local_admin_full_name <> clean_full_name
       or existing_run.central_admin_user_ids <> configured_admin_user_ids
       or existing_run.license_plan <> p_license_plan
       or existing_run.license_started_at <> effective_start
       or existing_run.license_valid_until is distinct from p_license_valid_until
       or existing_run.contract_status <> p_contract_status
       or existing_run.billing_status <> p_billing_status
       or existing_run.classroom_eligibility_verified <>
          effective_classroom_eligibility then
      raise exception using errcode = '23505',
        message = 'Organization already onboarded with different parameters.';
    end if;

    return query select
      existing_run.id,
      existing_run.organization_id,
      customer.registration_number,
      true,
      existing_run.email_status;
    return;
  end if;

  if customer.status = 'active' or customer.license_status = 'active' then
    raise exception using errcode = '23505',
      message = 'Active legacy customer requires manual onboarding reconciliation.';
  end if;

  if p_license_plan = 'classroom_free_12m'
     and customer.org_type not in ('municipality', 'obec', 'school') then
    raise exception 'Bezplatná licence s učebnou je určena obci nebo samostatné škole.';
  end if;

  clean_identifier := nullif(
    regexp_replace(coalesce(customer.legal_identifier, customer.ico, ''), '[^0-9]', '', 'g'),
    ''
  );

  if clean_identifier is not null then
    perform pg_advisory_xact_lock(hashtextextended('customer-ico:' || clean_identifier, 0));
  end if;
  perform pg_advisory_xact_lock(
    hashtextextended(
      'customer-name-address:' || lower(btrim(customer.name)) || ':' ||
      lower(btrim(coalesce(customer.registered_address, ''))),
      0
    )
  );

  if exists (
    select 1
    from public.organizations conflict
    where conflict.id <> customer.id
      and conflict.parent_organization_id is null
      and (
        conflict.org_type = customer.org_type
        or (customer.org_type in ('municipality', 'obec') and conflict.org_type in ('municipality', 'obec'))
        or (customer.org_type in ('association', 'spolek') and conflict.org_type in ('association', 'spolek'))
      )
      and conflict.license_status in ('pending_approval', 'active', 'suspended')
      and (
        (
          clean_identifier is not null
          and regexp_replace(coalesce(conflict.legal_identifier, conflict.ico, ''), '[^0-9]', '', 'g') = clean_identifier
        )
        or (
          lower(btrim(conflict.name)) = lower(btrim(customer.name))
          and lower(btrim(coalesce(conflict.registered_address, ''))) =
              lower(btrim(coalesce(customer.registered_address, '')))
        )
      )
  ) then
    raise exception using errcode = '23505',
      message = 'Duplicate organization or legal identifier exists.';
  end if;

  if not exists (
    select 1
    from auth.users auth_user
    where auth_user.id = p_local_admin_user_id
      and lower(btrim(auth_user.email)) = clean_email
  ) then
    raise exception 'Lokální správce nemá odpovídající Auth účet.';
  end if;

  if exists (
    select 1
    from public.profiles profile
    where lower(btrim(profile.email)) = clean_email
      and profile.id <> p_local_admin_user_id
  ) then
    raise exception using errcode = '23505',
      message = 'Duplicate profile email exists.';
  end if;

  if exists (
    select 1
    from public.profiles profile
    where profile.id = p_local_admin_user_id
      and nullif(lower(btrim(profile.email)), '') is distinct from clean_email
  ) then
    raise exception using errcode = '23505',
      message = 'Local administrator profile belongs to another email.';
  end if;

  select coalesce(array_agg(distinct admin_id order by admin_id), '{}')
  into admin_user_ids
  from unnest(
    array_append(configured_admin_user_ids, p_local_admin_user_id)
  ) admin_id;

  if customer.org_type in ('municipality', 'obec') then
    if cardinality(configured_admin_user_ids) = 0 then
      raise exception 'Obec nemá nakonfigurované centrální správce.';
    end if;

    if (
      select count(distinct platform_admin.user_id)
      from public.platform_admins platform_admin
      join public.profiles profile
        on profile.id = platform_admin.user_id
       and profile.is_active = true
      join auth.users auth_user
        on auth_user.id = platform_admin.user_id
       and lower(btrim(auth_user.email)) = lower(btrim(profile.email))
      where platform_admin.user_id = any(configured_admin_user_ids)
    ) <> cardinality(configured_admin_user_ids) then
      raise exception 'Některý centrální správce nemá platný Auth účet, aktivní profil nebo platformové oprávnění.';
    end if;
  elsif cardinality(configured_admin_user_ids) <> 0 then
    raise exception 'Centrální obecní správce nelze přidat k jinému typu zákazníka.';
  end if;

  if exists (
    select 1
    from public.organization_members member
    where member.organization_id = customer.id
      and member.user_id = any(admin_user_ids)
      and (member.role_in_org <> 'organization_admin' or member.status <> 'active')
  ) then
    raise exception using errcode = '23505',
      message = 'Conflicting organization membership exists.';
  end if;

  insert into public.profiles (
    id,
    email,
    full_name,
    is_active,
    must_set_password,
    user_type,
    active_organization_id
  ) values (
    p_local_admin_user_id,
    clean_email,
    clean_full_name,
    true,
    coalesce(p_local_admin_must_set_password, false),
    'organization',
    customer.id
  )
  on conflict (id) do update set
    full_name = case
      when nullif(btrim(public.profiles.full_name), '') is null then excluded.full_name
      else public.profiles.full_name
    end,
    is_active = true,
    must_set_password = public.profiles.must_set_password or excluded.must_set_password,
    user_type = coalesce(public.profiles.user_type, excluded.user_type),
    active_organization_id = coalesce(public.profiles.active_organization_id, excluded.active_organization_id);

  insert into public.organization_members (
    organization_id,
    user_id,
    role_in_org,
    status
  )
  select customer.id, admin_id, 'organization_admin', 'active'
  from unnest(admin_user_ids) admin_id
  on conflict (organization_id, user_id) do nothing;

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
    activated_by = (select auth.uid()),
    classroom_eligibility_verified_at = case
      when p_license_plan = 'classroom_free_12m' then now() else null
    end,
    classroom_eligibility_verified_by = case
      when p_license_plan = 'classroom_free_12m' then (select auth.uid()) else null
    end
  where id = customer.id;

  insert into public.organization_onboarding_runs (
    idempotency_key,
    organization_id,
    performed_by,
    local_admin_user_id,
    local_admin_email,
    local_admin_full_name,
    contact_name,
    contact_email,
    central_admin_user_ids,
    license_plan,
    license_started_at,
    license_valid_until,
    contract_status,
    billing_status,
    classroom_eligibility_verified
  ) values (
    p_idempotency_key,
    customer.id,
    (select auth.uid()),
    p_local_admin_user_id,
    clean_email,
    clean_full_name,
    customer.contact_name,
    customer.contact_email,
    configured_admin_user_ids,
    p_license_plan,
    effective_start,
    p_license_valid_until,
    p_contract_status,
    p_billing_status,
    effective_classroom_eligibility
  )
  returning * into created_run;

  return query select
    created_run.id,
    customer.id,
    customer.registration_number,
    false,
    created_run.email_status;
end;
$function$;

CREATE OR REPLACE FUNCTION public.onboarding_preflight_v1(p_organization_id uuid, p_local_admin_user_id uuid, p_local_admin_email text, p_central_admin_user_ids uuid[], p_license_plan text, p_license_started_at timestamp with time zone, p_license_valid_until timestamp with time zone, p_contract_status text, p_billing_status text, p_classroom_eligibility_verified boolean DEFAULT false)
 RETURNS TABLE(overall_status text, check_code text, check_status text, message text, details jsonb)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  customer public.organizations%rowtype;
  clean_email text := lower(btrim(coalesce(p_local_admin_email, '')));
  clean_identifier text;
  configured_admin_user_ids uuid[];
  v_overall text := 'READY';
  v_status text;
  v_count int;
begin
  if (select auth.uid()) is null or not public.is_platform_admin() then
    raise exception using errcode='42501', message='Tuto kontrolu může provést pouze platformový administrátor.';
  end if;

  select organization.* into customer
  from public.organizations organization
  where organization.id = p_organization_id
    and organization.parent_organization_id is null;

  if not found then
    return query select 'STOP','organization_exists','STOP','Organizace nebyla nalezena nebo není kořenová organizace.',jsonb_build_object('organization_id',p_organization_id);
    return;
  end if;

  -- organization type
  v_status := case when customer.org_type in ('municipality','obec','school','association','spolek') then 'READY' else 'STOP' end;
  if v_status='STOP' then v_overall:='STOP'; end if;
  return query select v_overall,'organization_type',v_status,
    case when v_status='READY' then 'Typ organizace je podporovaný onboardingem.' else 'Typ organizace není podporovaný onboardingem.' end,
    jsonb_build_object('org_type',customer.org_type);

  -- duplicate organization / identifier
  clean_identifier := nullif(regexp_replace(coalesce(customer.legal_identifier, customer.ico, ''), '[^0-9]', '', 'g'),'');
  select count(*) into v_count
  from public.organizations conflict
  where conflict.id <> customer.id
    and conflict.parent_organization_id is null
    and (
      conflict.org_type = customer.org_type
      or (customer.org_type in ('municipality','obec') and conflict.org_type in ('municipality','obec'))
      or (customer.org_type in ('association','spolek') and conflict.org_type in ('association','spolek'))
    )
    and conflict.license_status in ('pending_approval','active','suspended')
    and (
      (clean_identifier is not null and regexp_replace(coalesce(conflict.legal_identifier, conflict.ico, ''), '[^0-9]', '', 'g') = clean_identifier)
      or (lower(btrim(conflict.name)) = lower(btrim(customer.name))
          and lower(btrim(coalesce(conflict.registered_address,''))) = lower(btrim(coalesce(customer.registered_address,''))))
    );
  v_status := case when v_count=0 then 'READY' else 'STOP' end;
  if v_status='STOP' then v_overall:='STOP'; end if;
  return query select v_overall,'duplicate_organization',v_status,
    case when v_status='READY' then 'Nebyla nalezena kolize organizace nebo IČO.' else 'Existuje možná duplicita organizace nebo IČO.' end,
    jsonb_build_object('conflict_count',v_count,'legal_identifier',clean_identifier,'name',customer.name,'address',customer.registered_address);

  -- already active / legacy state
  v_status := case when customer.status='active' or customer.license_status='active' then 'POZOR' else 'READY' end;
  if v_status='POZOR' and v_overall='READY' then v_overall:='POZOR'; end if;
  return query select v_overall,'legacy_active_state',v_status,
    case when v_status='READY' then 'Organizace není již aktivována.' else 'Organizace už je aktivní nebo má aktivní licenci; ostrý onboarding vyžaduje reconciliaci.' end,
    jsonb_build_object('status',customer.status,'license_status',customer.license_status);

  -- local admin auth match
  select count(*) into v_count from auth.users u where u.id=p_local_admin_user_id and lower(btrim(u.email))=clean_email;
  v_status := case when v_count=1 and clean_email <> '' then 'READY' else 'STOP' end;
  if v_status='STOP' then v_overall:='STOP'; end if;
  return query select v_overall,'local_admin_auth',v_status,
    case when v_status='READY' then 'Lokální správce má odpovídající Auth účet.' else 'Lokální správce nemá odpovídající Auth účet/e-mail.' end,
    jsonb_build_object('user_id',p_local_admin_user_id,'email',clean_email);

  -- duplicate/conflicting profile email
  select count(*) into v_count from public.profiles p where lower(btrim(p.email))=clean_email and p.id<>p_local_admin_user_id;
  v_status := case when v_count=0 then 'READY' else 'STOP' end;
  if v_status='STOP' then v_overall:='STOP'; end if;
  return query select v_overall,'local_admin_profile_email',v_status,
    case when v_status='READY' then 'E-mail lokálního správce není použit jiným profilem.' else 'Stejný e-mail používá jiný profil.' end,
    jsonb_build_object('conflict_count',v_count,'email',clean_email);

  -- central admins
  select coalesce(array_agg(distinct x order by x),'{}') into configured_admin_user_ids
  from unnest(coalesce(p_central_admin_user_ids,'{}')) x;
  if customer.org_type in ('municipality','obec') then
    select count(distinct pa.user_id) into v_count
    from public.platform_admins pa
    join public.profiles p on p.id=pa.user_id and p.is_active=true
    join auth.users u on u.id=pa.user_id and lower(btrim(u.email))=lower(btrim(p.email))
    where pa.user_id = any(configured_admin_user_ids)
      and pa.role in ('admin','super_admin');
    v_status := case when cardinality(configured_admin_user_ids)>0 and v_count=cardinality(configured_admin_user_ids) then 'READY' else 'STOP' end;
  else
    v_status := case when cardinality(configured_admin_user_ids)=0 then 'READY' else 'STOP' end;
  end if;
  if v_status='STOP' then v_overall:='STOP'; end if;
  return query select v_overall,'central_admins',v_status,
    case when v_status='READY' then 'Centrální správci odpovídají typu zákazníka a jsou platní.' else 'Centrální správci nejsou správně nakonfigurováni.' end,
    jsonb_build_object('configured_count',cardinality(configured_admin_user_ids),'valid_count',coalesce(v_count,0));

  -- license checks
  v_status := 'READY';
  if p_license_plan not in ('paid_monthly','paid_annual','classroom_free_12m') then v_status:='STOP'; end if;
  if p_contract_status <> 'accepted' then v_status:='STOP'; end if;
  if p_billing_status not in ('pending','paid','not_applicable') then v_status:='STOP'; end if;
  if p_license_plan='classroom_free_12m' and (p_billing_status<>'not_applicable' or not coalesce(p_classroom_eligibility_verified,false)) then v_status:='STOP'; end if;
  if p_license_plan in ('paid_annual','classroom_free_12m') and p_license_valid_until is null then v_status:='STOP'; end if;
  if p_license_valid_until is not null and p_license_started_at is not null and p_license_valid_until <= p_license_started_at then v_status:='STOP'; end if;
  if p_license_started_at is null then v_status:='STOP'; end if;
  if p_license_plan='classroom_free_12m' and customer.org_type not in ('municipality', 'obec', 'school') then v_status:='STOP'; end if;
  if v_status='STOP' then v_overall:='STOP'; end if;
  return query select v_overall,'license_configuration',v_status,
    case when v_status='READY' then 'Licence, smlouva, fakturace a ověření učebny jsou konzistentní.' else 'Konfigurace licence nesplňuje podmínky onboardingu.' end,
    jsonb_build_object('license_plan',p_license_plan,'started_at',p_license_started_at,'valid_until',p_license_valid_until,'contract_status',p_contract_status,'billing_status',p_billing_status,'classroom_eligibility_verified',coalesce(p_classroom_eligibility_verified,false));

  -- child school signal for municipality
  if customer.org_type in ('municipality','obec') then
    select count(*) into v_count from public.organizations c where c.parent_organization_id=customer.id and c.org_type='school' and coalesce(c.to_delete,false)=false;
    v_status := case when v_count>0 then 'READY' else 'POZOR' end;
    if v_status='POZOR' and v_overall='READY' then v_overall:='POZOR'; end if;
    return query select v_overall,'linked_school',v_status,
      case when v_status='READY' then 'K obci je připojena alespoň jedna škola.' else 'K obci není připojena škola; ověřte, zda je to záměr.' end,
      jsonb_build_object('school_count',v_count);
  end if;

  -- final summary row
  return query select v_overall,'summary',v_overall,
    case v_overall when 'READY' then 'Preflight prošel. Parametry jsou připravené pro ostrý onboarding.' when 'POZOR' then 'Preflight našel upozornění, která je nutné před onboardingem posoudit.' else 'Preflight našel blokující problém. Ostrý onboarding neprovádět.' end,
    jsonb_build_object('organization_id',customer.id,'organization_name',customer.name);
end;
$function$;


-- Preserve the existing RPC execution boundary, including on clean installations.
revoke all on function public.onboard_customer_v3(uuid,uuid,uuid,text,text,uuid[],text,timestamptz,timestamptz,text,text,boolean,boolean) from public, anon, authenticated, service_role;
grant execute on function public.onboard_customer_v3(uuid,uuid,uuid,text,text,uuid[],text,timestamptz,timestamptz,text,text,boolean,boolean) to authenticated;
revoke all on function public.onboarding_preflight_v1(uuid,uuid,text,uuid[],text,timestamptz,timestamptz,text,text,boolean) from public, anon, authenticated, service_role;
grant execute on function public.onboarding_preflight_v1(uuid,uuid,text,uuid[],text,timestamptz,timestamptz,text,text,boolean) to authenticated, service_role;
