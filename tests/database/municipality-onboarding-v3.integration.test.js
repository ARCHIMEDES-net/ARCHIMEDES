import fs from "fs";
import path from "path";
import { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const PERFORMER_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const CENTRAL_ADMIN_ID = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const LOCAL_ADMIN_ID = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
const SECOND_LOCAL_ADMIN_ID = "dddddddd-dddd-4ddd-8ddd-dddddddddddd";
const ORGANIZATION_ID = "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee";
const SECOND_ORGANIZATION_ID = "ffffffff-ffff-4fff-8fff-ffffffffffff";
const IDEMPOTENCY_KEY = "11111111-2222-4333-8444-555555555555";
const SECOND_IDEMPOTENCY_KEY = "66666666-7777-4888-8999-aaaaaaaaaaaa";
const ORPHAN_PLATFORM_ADMIN_ID = "99999999-9999-4999-8999-999999999999";
const INACTIVE_ADMIN_ID = "12121212-1212-4121-8121-121212121212";
const MEMBER_ID = "13131313-1313-4131-8131-131313131313";
const LICENSED_ORGANIZATION_ID = "14141414-1414-4141-8141-141414141414";
const EVENT_ID = "15151515-1515-4151-8151-151515151515";
const SESSION_ID = "16161616-1616-4161-8161-161616161616";

const migration = fs.readFileSync(
  path.join(
    process.cwd(),
    "supabase/migrations/20260813154650_harden_municipality_onboarding.sql"
  ),
  "utf8"
);
const serviceMigration = fs.readFileSync(
  path.join(
    process.cwd(),
    "supabase/migrations/20260814050346_add_service_onboarding_entrypoint.sql"
  ),
  "utf8"
);

const database = new PGlite();
let legacyFunctionCatalogBefore;
let legacyAuthorizedResultsBefore;
let legacyUnsafeResultsBefore;

async function queryAsAuthenticated(userId, sql, params = []) {
  await database.exec(`select set_config('request.jwt.claim.sub', '${userId}', false)`);
  await database.exec("set role authenticated");
  try {
    return await database.query(sql, params);
  } finally {
    await database.exec("reset role");
  }
}

async function callOnboarding({
  idempotencyKey = IDEMPOTENCY_KEY,
  organizationId = ORGANIZATION_ID,
  localAdminId = LOCAL_ADMIN_ID,
  localAdminEmail = "local@example.test",
  validUntil = "2027-08-12T23:59:59.999Z",
} = {}) {
  await database.exec("set role authenticated");
  try {
    return await database.query(
      `select * from public.onboard_customer_v3(
        $1::uuid, $2::uuid, $3::uuid, $4::text, 'Lokální Správce'::text,
        array[$5::uuid], 'paid_annual'::text,
        '2026-08-13T00:00:00.000Z'::timestamptz, $6::timestamptz,
        'accepted'::text, 'paid'::text, false, true
      )`,
      [
        idempotencyKey,
        organizationId,
        localAdminId,
        localAdminEmail,
        CENTRAL_ADMIN_ID,
        validUntil,
      ]
    );
  } finally {
    await database.exec("reset role");
  }
}

async function callServiceOnboarding({
  idempotencyKey = IDEMPOTENCY_KEY,
  organizationId = ORGANIZATION_ID,
  localAdminId = LOCAL_ADMIN_ID,
  localAdminEmail = "local@example.test",
  validUntil = "2027-08-12T23:59:59.999Z",
} = {}) {
  await database.exec(
    "select set_config('request.jwt.claim.role', 'service_role', false)"
  );
  await database.exec("set role service_role");
  try {
    return await database.query(
      `select * from public.onboard_customer_service_v1(
        $1::uuid, $2::uuid, $3::uuid, $4::uuid, $5::text,
        'Lokální Správce'::text, array[$6::uuid], 'paid_annual'::text,
        '2026-08-13T00:00:00.000Z'::timestamptz, $7::timestamptz,
        'accepted'::text, 'paid'::text, false, true
      )`,
      [
        PERFORMER_ID,
        idempotencyKey,
        organizationId,
        localAdminId,
        localAdminEmail,
        CENTRAL_ADMIN_ID,
        validUntil,
      ]
    );
  } finally {
    await database.exec("reset role");
    await database.exec("select set_config('request.jwt.claim.role', '', false)");
  }
}

beforeAll(async () => {
  await database.exec(`
    create role public_privilege_probe nologin;
    create role anon nologin;
    create role authenticated nologin;
    create role service_role nologin bypassrls;

    create schema auth;
    create table auth.users (
      id uuid primary key,
      email text
    );
    create function auth.uid()
    returns uuid
    language sql
    stable
    as $$
      select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
    $$;
    create function auth.jwt()
    returns jsonb
    language sql
    stable
    as $$
      select jsonb_build_object(
        'role', nullif(current_setting('request.jwt.claim.role', true), '')
      )
    $$;

    create table public.organizations (
      id uuid primary key,
      name text not null,
      org_type text not null,
      parent_organization_id uuid,
      status text,
      license_status text,
      license_plan text,
      license_started_at timestamptz,
      license_valid_until timestamptz,
      contract_status text,
      billing_status text,
      activated_at timestamptz,
      activated_by uuid,
      classroom_eligibility_verified_at timestamptz,
      classroom_eligibility_verified_by uuid,
      registration_number text,
      legal_identifier text,
      ico text,
      registered_address text,
      contact_name text,
      contact_email text
    );
    create table public.profiles (
      id uuid primary key references auth.users(id) on delete cascade,
      email text,
      full_name text,
      is_active boolean default true,
      must_set_password boolean default false,
      user_type text,
      active_organization_id uuid references public.organizations(id)
    );
    create table public.platform_admins (
      user_id uuid primary key,
      role text not null default 'admin'
    );
    create table public.organization_members (
      organization_id uuid references public.organizations(id),
      user_id uuid references auth.users(id),
      role_in_org text,
      status text,
      unique (organization_id, user_id)
    );
    create table public.events (
      id uuid primary key,
      title text,
      starts_at timestamptz,
      category text,
      audience_groups text[],
      audience text,
      worksheet_url text,
      poster_url text,
      stream_url text,
      is_published boolean default false
    );
    create table public.broadcast_sessions (
      id uuid primary key,
      event_id uuid references public.events(id),
      status text,
      viewer_url text,
      recording_url text,
      recording_status text,
      starts_at timestamptz,
      ended_at timestamptz,
      access_mode text,
      is_published boolean default false,
      moderator_name text,
      guest_1_name text,
      guest_2_name text,
      guest_3_name text,
      guest_4_name text,
      guest_5_name text,
      external_meeting_id text,
      created_at timestamptz default now()
    );
    create function public.is_platform_admin()
    returns boolean
    language sql
    stable
    security definer
    set search_path = ''
    as $$
      select exists (
        select 1 from public.platform_admins
        where user_id = (select auth.uid())
      )
    $$;

    create function public.get_portal_broadcast_sessions(p_event_ids uuid[])
    returns table(
      id uuid,
      event_id uuid,
      status text,
      viewer_url text,
      recording_url text,
      recording_status text,
      starts_at timestamptz,
      ended_at timestamptz,
      access_mode text,
      is_published boolean,
      moderator_name text,
      guest_1_name text,
      guest_2_name text,
      guest_3_name text,
      guest_4_name text,
      guest_5_name text,
      has_external_meeting boolean
    )
    language sql
    stable
    security definer
    set search_path = ''
    as $$
      with viewer_access as (
        select exists (
          select 1
          from public.platform_admins platform_admin
          where platform_admin.user_id = (select auth.uid())
        ) as is_platform_admin,
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
                and lower(coalesce(organization.license_status, '')) = 'active'
                and (organization.license_valid_until is null or organization.license_valid_until >= now())
              )
              or (
                lower(coalesce(parent.org_type, '')) in ('municipality', 'obec')
                and lower(coalesce(parent.status, '')) = 'active'
                and lower(coalesce(parent.license_status, '')) = 'active'
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
        and event.is_published = true
    $$;

    create function public.get_portal_archive_events()
    returns table (
      id uuid,
      title text,
      starts_at timestamptz,
      category text,
      audience_groups text[],
      audience text,
      worksheet_url text,
      is_published boolean,
      poster_url text,
      stream_url text,
      recording_url text,
      recording_status text
    )
    language sql
    stable
    security definer
    set search_path = ''
    as $$
      with identity as (
        select
          (select auth.uid()) as user_id,
          exists (
            select 1
            from public.platform_admins platform_admin
            where platform_admin.user_id = (select auth.uid())
          ) as is_platform_admin,
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
                      and organization.license_status = 'active'
                      and (organization.license_valid_until is null or organization.license_valid_until >= now())
                    )
                    or exists (
                      select 1
                      from public.organizations parent
                      where parent.id = organization.parent_organization_id
                        and lower(parent.org_type) in ('municipality', 'obec')
                        and parent.status = 'active'
                        and parent.license_status = 'active'
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
        case when session.recording_status = 'published' then session.recording_url else null end,
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
      order by event.starts_at desc
    $$;

    revoke all on function public.is_platform_admin()
      from public, anon, authenticated, service_role;
    revoke all on function public.get_portal_broadcast_sessions(uuid[])
      from public, anon, authenticated, service_role;
    revoke all on function public.get_portal_archive_events()
      from public, anon, authenticated, service_role;
    grant execute on function public.is_platform_admin()
      to authenticated, service_role;
    grant execute on function public.get_portal_broadcast_sessions(uuid[])
      to authenticated, service_role;
    grant execute on function public.get_portal_archive_events()
      to authenticated, service_role;

    insert into auth.users (id, email) values
      ('${PERFORMER_ID}', 'performer@example.test'),
      ('${CENTRAL_ADMIN_ID}', 'central@example.test'),
      ('${LOCAL_ADMIN_ID}', 'local@example.test'),
      ('${SECOND_LOCAL_ADMIN_ID}', 'second-local@example.test'),
      ('${INACTIVE_ADMIN_ID}', 'inactive@example.test'),
      ('${MEMBER_ID}', 'member@example.test');
    insert into public.profiles (
      id, email, full_name, is_active, active_organization_id
    ) values
      ('${PERFORMER_ID}', 'performer@example.test', 'Provádějící Správce', true, null),
      ('${CENTRAL_ADMIN_ID}', 'central@example.test', 'Centrální Správce', true, null),
      ('${INACTIVE_ADMIN_ID}', 'inactive@example.test', 'Neaktivní Správce', false, null),
      ('${MEMBER_ID}', 'member@example.test', 'Aktivní Člen', true, null);
    insert into public.platform_admins (user_id) values
      ('${PERFORMER_ID}'), ('${CENTRAL_ADMIN_ID}'),
      ('${INACTIVE_ADMIN_ID}'), ('${ORPHAN_PLATFORM_ADMIN_ID}');
    insert into public.organizations (
      id, name, org_type, status, license_status, registration_number,
      legal_identifier, registered_address, contact_name, contact_email
    ) values
      (
        '${ORGANIZATION_ID}', 'Obec Testov', 'municipality', 'pending',
        'pending_approval', '1001', '12345678', 'Testovní 1',
        'Kontaktní Osoba', 'kontakt@example.test'
      ),
      (
        '${SECOND_ORGANIZATION_ID}', 'Obec Druhá', 'municipality', 'pending',
        'pending_approval', '1002', '87654321', 'Druhá 2',
        'Jiná Kontaktní Osoba', 'kontakt2@example.test'
      ),
      (
        '${LICENSED_ORGANIZATION_ID}', 'Aktivní Organizace', 'school', 'active',
        'active', '1003', '11223344', 'Třetí 3',
        'Aktivní Kontakt', 'aktivni@example.test'
      );
    update public.organizations
    set license_plan = 'paid_annual',
        license_valid_until = now() + interval '1 year'
    where id = '${LICENSED_ORGANIZATION_ID}';
    update public.profiles
    set active_organization_id = '${LICENSED_ORGANIZATION_ID}'
    where id = '${MEMBER_ID}';
    insert into public.organization_members (
      organization_id, user_id, role_in_org, status
    ) values (
      '${LICENSED_ORGANIZATION_ID}', '${MEMBER_ID}', 'organization_admin', 'active'
    );
    insert into public.events (
      id, title, starts_at, category, audience_groups, audience,
      worksheet_url, poster_url, stream_url, is_published
    ) values (
      '${EVENT_ID}', 'Publikovaná událost', now() - interval '1 day',
      'test', array['member'], 'member', 'https://example.test/workbook',
      'https://example.test/poster', 'https://example.test/stream', true
    );
    insert into public.broadcast_sessions (
      id, event_id, status, viewer_url, recording_url, recording_status,
      starts_at, ended_at, access_mode, is_published, moderator_name
    ) values (
      '${SESSION_ID}', '${EVENT_ID}', 'ended', 'https://example.test/view',
      'https://example.test/recording', 'published', now() - interval '1 day',
      now() - interval '23 hours', 'authenticated', true, 'Moderátor'
    );
    select set_config('request.jwt.claim.sub', '${PERFORMER_ID}', false);
  `);

  legacyFunctionCatalogBefore = await database.query(`
    select
      p.proname,
      pg_get_function_identity_arguments(p.oid) as identity_arguments,
      pg_get_function_result(p.oid) as result_type,
      pg_get_userbyid(p.proowner) as owner,
      p.prosecdef as security_definer,
      p.provolatile as volatility,
      p.proconfig as configuration,
      p.proacl::text as acl
    from pg_proc p
    where p.oid in (
      'public.is_platform_admin()'::regprocedure,
      'public.get_portal_broadcast_sessions(uuid[])'::regprocedure,
      'public.get_portal_archive_events()'::regprocedure
    )
    order by p.proname
  `);
  legacyAuthorizedResultsBefore = {
    adminBroadcast: (
      await queryAsAuthenticated(
        PERFORMER_ID,
        "select * from public.get_portal_broadcast_sessions(array[$1::uuid])",
        [EVENT_ID]
      )
    ).rows,
    adminArchive: (
      await queryAsAuthenticated(
        PERFORMER_ID,
        "select * from public.get_portal_archive_events()"
      )
    ).rows,
    memberBroadcast: (
      await queryAsAuthenticated(
        MEMBER_ID,
        "select * from public.get_portal_broadcast_sessions(array[$1::uuid])",
        [EVENT_ID]
      )
    ).rows,
    memberArchive: (
      await queryAsAuthenticated(
        MEMBER_ID,
        "select * from public.get_portal_archive_events()"
      )
    ).rows,
  };
  legacyUnsafeResultsBefore = {
    orphanBroadcast: (
      await queryAsAuthenticated(
        ORPHAN_PLATFORM_ADMIN_ID,
        "select * from public.get_portal_broadcast_sessions(array[$1::uuid])",
        [EVENT_ID]
      )
    ).rows,
    inactiveBroadcast: (
      await queryAsAuthenticated(
        INACTIVE_ADMIN_ID,
        "select * from public.get_portal_broadcast_sessions(array[$1::uuid])",
        [EVENT_ID]
      )
    ).rows,
    inactiveArchive: (
      await queryAsAuthenticated(
        INACTIVE_ADMIN_ID,
        "select * from public.get_portal_archive_events()"
      )
    ).rows,
  };

  await database.exec(migration);
  await database.exec(serviceMigration);
});

afterAll(async () => {
  await database.close();
});

describe("municipality onboarding v3 PostgreSQL integration", () => {
  it("preserves existing portal signatures, owners, ACL and authorized behavior", async () => {
    const catalogAfter = await database.query(`
      select
        p.proname,
        pg_get_function_identity_arguments(p.oid) as identity_arguments,
        pg_get_function_result(p.oid) as result_type,
        pg_get_userbyid(p.proowner) as owner,
        p.prosecdef as security_definer,
        p.provolatile as volatility,
        p.proconfig as configuration,
        p.proacl::text as acl
      from pg_proc p
      where p.oid in (
        'public.is_platform_admin()'::regprocedure,
        'public.get_portal_broadcast_sessions(uuid[])'::regprocedure,
        'public.get_portal_archive_events()'::regprocedure
      )
      order by p.proname
    `);
    expect(catalogAfter.rows).toEqual(legacyFunctionCatalogBefore.rows);

    const authorizedAfter = {
      adminBroadcast: (
        await queryAsAuthenticated(
          PERFORMER_ID,
          "select * from public.get_portal_broadcast_sessions(array[$1::uuid])",
          [EVENT_ID]
        )
      ).rows,
      adminArchive: (
        await queryAsAuthenticated(
          PERFORMER_ID,
          "select * from public.get_portal_archive_events()"
        )
      ).rows,
      memberBroadcast: (
        await queryAsAuthenticated(
          MEMBER_ID,
          "select * from public.get_portal_broadcast_sessions(array[$1::uuid])",
          [EVENT_ID]
        )
      ).rows,
      memberArchive: (
        await queryAsAuthenticated(
          MEMBER_ID,
          "select * from public.get_portal_archive_events()"
        )
      ).rows,
    };
    expect(authorizedAfter).toEqual(legacyAuthorizedResultsBefore);
    expect(authorizedAfter.adminBroadcast).toHaveLength(1);
    expect(authorizedAfter.adminArchive).toHaveLength(1);
    expect(authorizedAfter.memberBroadcast).toHaveLength(1);
    expect(authorizedAfter.memberArchive).toHaveLength(1);
  });

  it("hardens only the platform-admin branch of existing portal RPCs", async () => {
    expect(legacyUnsafeResultsBefore.orphanBroadcast).toHaveLength(1);
    expect(legacyUnsafeResultsBefore.inactiveBroadcast).toHaveLength(1);
    expect(legacyUnsafeResultsBefore.inactiveArchive).toHaveLength(1);

    const orphanBroadcast = await queryAsAuthenticated(
      ORPHAN_PLATFORM_ADMIN_ID,
      "select * from public.get_portal_broadcast_sessions(array[$1::uuid])",
      [EVENT_ID]
    );
    const inactiveBroadcast = await queryAsAuthenticated(
      INACTIVE_ADMIN_ID,
      "select * from public.get_portal_broadcast_sessions(array[$1::uuid])",
      [EVENT_ID]
    );
    const inactiveArchive = await queryAsAuthenticated(
      INACTIVE_ADMIN_ID,
      "select * from public.get_portal_archive_events()"
    );

    expect(orphanBroadcast.rows).toHaveLength(0);
    expect(inactiveBroadcast.rows).toHaveLength(0);
    expect(inactiveArchive.rows).toHaveLength(0);
  });

  it("grants only the traced table privileges", async () => {
    const privileges = [
      "SELECT",
      "INSERT",
      "UPDATE",
      "DELETE",
      "TRUNCATE",
      "REFERENCES",
      "TRIGGER",
    ];
    const expectedByRole = {
      public_privilege_probe: {
        organization_onboarding_runs: [],
        organization_onboarding_email_attempts: [],
        organization_onboarding_auth_preparations: [],
      },
      anon: {
        organization_onboarding_runs: [],
        organization_onboarding_email_attempts: [],
        organization_onboarding_auth_preparations: [],
      },
      authenticated: {
        organization_onboarding_runs: [],
        organization_onboarding_email_attempts: [],
        organization_onboarding_auth_preparations: [],
      },
      service_role: {
        organization_onboarding_runs: ["SELECT"],
        organization_onboarding_email_attempts: ["SELECT"],
        organization_onboarding_auth_preparations: [
          "SELECT",
          "INSERT",
          "UPDATE",
        ],
      },
    };

    for (const [role, expectedTables] of Object.entries(expectedByRole)) {
      for (const [table, allowedPrivileges] of Object.entries(expectedTables)) {
        for (const privilege of privileges) {
          const result = await database.query(
            "select has_table_privilege($1, $2, $3) as allowed",
            [role, `public.${table}`, privilege]
          );
          expect(result.rows[0].allowed, `${role} ${table} ${privilege}`).toBe(
            allowedPrivileges.includes(privilege)
          );
        }
      }
    }
  });

  it("grants each RPC only to its traced database role", async () => {
    const signatures = [
      "public.is_platform_admin()",
      "public.get_portal_broadcast_sessions(uuid[])",
      "public.get_portal_archive_events()",
      "public.onboard_customer_v3(uuid,uuid,uuid,text,text,uuid[],text,timestamptz,timestamptz,text,text,boolean,boolean)",
      "public.claim_onboarding_email_attempt(uuid,text,text)",
      "public.complete_onboarding_email_attempt(uuid,text,text)",
      "public.mark_stale_onboarding_email_attempt(uuid)",
      "public.resolve_onboarding_email_without_resend(uuid,text)",
      "public.onboard_customer_service_v1(uuid,uuid,uuid,uuid,text,text,uuid[],text,timestamptz,timestamptz,text,text,boolean,boolean)",
      "public.claim_onboarding_email_attempt_service_v1(uuid,uuid,text,text)",
      "public.complete_onboarding_email_attempt_service_v1(uuid,uuid,text,text)",
    ];
    const authenticatedFunctions = new Set([
      "public.is_platform_admin()",
      "public.get_portal_broadcast_sessions(uuid[])",
      "public.get_portal_archive_events()",
      "public.onboard_customer_v3(uuid,uuid,uuid,text,text,uuid[],text,timestamptz,timestamptz,text,text,boolean,boolean)",
      "public.claim_onboarding_email_attempt(uuid,text,text)",
      "public.complete_onboarding_email_attempt(uuid,text,text)",
      "public.mark_stale_onboarding_email_attempt(uuid)",
      "public.resolve_onboarding_email_without_resend(uuid,text)",
    ]);
    const serviceRoleFunctions = new Set([
      "public.is_platform_admin()",
      "public.get_portal_broadcast_sessions(uuid[])",
      "public.get_portal_archive_events()",
      "public.onboard_customer_service_v1(uuid,uuid,uuid,uuid,text,text,uuid[],text,timestamptz,timestamptz,text,text,boolean,boolean)",
      "public.claim_onboarding_email_attempt_service_v1(uuid,uuid,text,text)",
      "public.complete_onboarding_email_attempt_service_v1(uuid,uuid,text,text)",
    ]);

    for (const role of [
      "public_privilege_probe",
      "anon",
      "authenticated",
      "service_role",
    ]) {
      for (const signature of signatures) {
        const result = await database.query(
          "select has_function_privilege($1, $2, 'EXECUTE') as allowed",
          [role, signature]
        );
        expect(result.rows[0].allowed, `${role} ${signature}`).toBe(
          (role === "authenticated" && authenticatedFunctions.has(signature)) ||
            (role === "service_role" && serviceRoleFunctions.has(signature))
        );
      }
    }
  });

  it("rejects direct audit access and RPC execution by the wrong roles", async () => {
    await database.exec("set role authenticated");
    try {
      await expect(
        database.query("select * from public.organization_onboarding_runs")
      ).rejects.toThrow(/permission denied/i);
      await expect(
        database.query(
          `insert into public.organization_onboarding_auth_preparations (
            idempotency_key, organization_id, local_admin_email,
            local_admin_full_name, created_by
          ) values ($1::uuid, $2::uuid, 'blocked@example.test', 'Blocked', $3::uuid)`,
          [IDEMPOTENCY_KEY, ORGANIZATION_ID, PERFORMER_ID]
        )
      ).rejects.toThrow(/permission denied/i);
    } finally {
      await database.exec("reset role");
    }

    await database.exec("set role anon");
    try {
      await expect(
        database.query(
          "select * from public.mark_stale_onboarding_email_attempt($1::uuid)",
          [ORGANIZATION_ID]
        )
      ).rejects.toThrow(/permission denied/i);
    } finally {
      await database.exec("reset role");
    }

    await database.exec("set role service_role");
    try {
      await expect(
        database.query(
          "select * from public.claim_onboarding_email_attempt($1::uuid, 'retry_failed', 'Zakázaná service role')",
          [ORGANIZATION_ID]
        )
      ).rejects.toThrow(/permission denied/i);
    } finally {
      await database.exec("reset role");
    }
  });

  it("rejects a direct privileged RPC call from an orphaned stale JWT subject", async () => {
    await database.exec(
      `select set_config('request.jwt.claim.sub', '${ORPHAN_PLATFORM_ADMIN_ID}', false)`
    );
    await expect(
      callOnboarding({
        idempotencyKey: SECOND_IDEMPOTENCY_KEY,
        organizationId: SECOND_ORGANIZATION_ID,
        localAdminId: SECOND_LOCAL_ADMIN_ID,
        localAdminEmail: "second-local@example.test",
      })
    ).rejects.toThrow(/platný aktivní správce|platformov/i);
    await database.exec(
      `select set_config('request.jwt.claim.sub', '${PERFORMER_ID}', false)`
    );
  });

  it("keeps historical orphans but prevents new platform-admin orphans", async () => {
    const orphanRows = await database.query(
      `select user_id from public.platform_admins where user_id = $1::uuid`,
      [ORPHAN_PLATFORM_ADMIN_ID]
    );
    expect(orphanRows.rows).toHaveLength(1);

    await expect(
      database.query(
        `insert into public.platform_admins (user_id) values ($1::uuid)`,
        ["88888888-8888-4888-8888-888888888888"]
      )
    ).rejects.toThrow(/platform_admins_user_id_auth_fkey|foreign key/i);
  });

  it("executes the migration, commits once, rejects changed replay and rolls back partial writes", async () => {
    const first = await callServiceOnboarding();
    expect(first.rows[0]).toMatchObject({
      organization_id: ORGANIZATION_ID,
      replayed: false,
      email_status: "pending",
    });

    const replay = await callOnboarding();
    expect(replay.rows[0]).toMatchObject({
      onboarding_run_id: first.rows[0].onboarding_run_id,
      replayed: true,
    });

    const state = await database.query(`
      select
        (select count(*)::int from public.organization_onboarding_runs) as runs,
        (select count(*)::int from public.organization_members
          where organization_id = '${ORGANIZATION_ID}') as memberships,
        (select performed_by from public.organization_onboarding_runs
          where organization_id = '${ORGANIZATION_ID}') as performed_by,
        (select contact_email from public.organization_onboarding_runs
          where organization_id = '${ORGANIZATION_ID}') as contact_email,
        (select license_status from public.organizations
          where id = '${ORGANIZATION_ID}') as license_status
    `);
    expect(state.rows[0]).toEqual({
      runs: 1,
      memberships: 2,
      performed_by: PERFORMER_ID,
      contact_email: "kontakt@example.test",
      license_status: "active",
    });

    await database.exec("set role authenticated");
    try {
      const claimed = await database.query(
        `select * from public.claim_onboarding_email_attempt(
          $1::uuid, 'initial_delivery'::text, 'První auditovaný pokus'::text
        )`,
        [first.rows[0].onboarding_run_id]
      );
      expect(claimed.rows[0]).toMatchObject({
        attempt_number: 1,
        claimed: true,
        email_status: "sending",
      });

      const doubleClick = await database.query(
        `select * from public.claim_onboarding_email_attempt(
          $1::uuid, 'initial_delivery'::text, 'Souběžný dvojklik'::text
        )`,
        [first.rows[0].onboarding_run_id]
      );
      expect(doubleClick.rows[0]).toMatchObject({
        attempt_number: 1,
        claimed: false,
        email_status: "sending",
      });

      await database.exec("reset role");
      await database.query(
        `update public.organization_onboarding_runs
         set email_attempted_at = now() - interval '20 minutes'
         where id = $1::uuid`,
        [first.rows[0].onboarding_run_id]
      );
      await database.exec("set role authenticated");
      const stale = await database.query(
        `select * from public.mark_stale_onboarding_email_attempt($1::uuid)`,
        [first.rows[0].onboarding_run_id]
      );
      expect(stale.rows[0]).toMatchObject({
        email_status: "delivery_unknown",
        transitioned: true,
      });

      const confirmedRetry = await database.query(
        `select * from public.claim_onboarding_email_attempt(
          $1::uuid,
          'confirm_not_delivered_and_retry'::text,
          'Příjemce telefonicky potvrdil nedoručení'::text
        )`,
        [first.rows[0].onboarding_run_id]
      );
      expect(confirmedRetry.rows[0]).toMatchObject({
        attempt_number: 2,
        claimed: true,
      });

      await database.query(
        `select * from public.complete_onboarding_email_attempt(
          $1::uuid, 'failed'::text, 'smtp_configuration_missing'::text
        )`,
        [confirmedRetry.rows[0].attempt_id]
      );
      const failedRetry = await database.query(
        `select * from public.claim_onboarding_email_attempt(
          $1::uuid, 'retry_failed'::text, 'SMTP konfigurace byla opravena'::text
        )`,
        [first.rows[0].onboarding_run_id]
      );
      expect(failedRetry.rows[0]).toMatchObject({
        attempt_number: 3,
        claimed: true,
      });
      await database.query(
        `select * from public.complete_onboarding_email_attempt(
          $1::uuid, 'sent'::text, null::text
        )`,
        [failedRetry.rows[0].attempt_id]
      );

      await database.exec("reset role");
      const attemptAudit = await database.query(
        `select attempt_number, previous_attempt_id, status, initiated_by,
                resolution_action, resolved_by
         from public.organization_onboarding_email_attempts
         where onboarding_run_id = $1::uuid
         order by attempt_number`,
        [first.rows[0].onboarding_run_id]
      );
      expect(attemptAudit.rows).toHaveLength(3);
      expect(attemptAudit.rows[0]).toMatchObject({
        attempt_number: 1,
        status: "delivery_unknown",
        initiated_by: PERFORMER_ID,
        resolution_action: "confirmed_not_delivered",
        resolved_by: PERFORMER_ID,
      });
      expect(attemptAudit.rows[1].previous_attempt_id).toBe(
        claimed.rows[0].attempt_id
      );
      expect(attemptAudit.rows[2].previous_attempt_id).toBe(
        confirmedRetry.rows[0].attempt_id
      );
    } finally {
      await database.exec("reset role");
    }

    await expect(
      callOnboarding({ validUntil: "2028-08-12T23:59:59.999Z" })
    ).rejects.toThrow(/different onboarding parameters/i);

    await database.exec(`
      update public.organizations
      set legal_identifier = '12345678'
      where id = '${SECOND_ORGANIZATION_ID}'
    `);
    await expect(
      callOnboarding({
        idempotencyKey: SECOND_IDEMPOTENCY_KEY,
        organizationId: SECOND_ORGANIZATION_ID,
        localAdminId: SECOND_LOCAL_ADMIN_ID,
        localAdminEmail: "second-local@example.test",
      })
    ).rejects.toThrow(/duplicate organization or legal identifier/i);
    await database.exec(`
      update public.organizations
      set legal_identifier = '87654321'
      where id = '${SECOND_ORGANIZATION_ID}'
    `);

    await database.exec(`
      create function public.reject_second_onboarding()
      returns trigger
      language plpgsql
      as $$
      begin
        if new.organization_id = '${SECOND_ORGANIZATION_ID}'::uuid then
          raise exception 'forced audit failure';
        end if;
        return new;
      end;
      $$;
      create trigger reject_second_onboarding
      before insert on public.organization_onboarding_runs
      for each row execute function public.reject_second_onboarding();
    `);

    await expect(
      callOnboarding({
        idempotencyKey: SECOND_IDEMPOTENCY_KEY,
        organizationId: SECOND_ORGANIZATION_ID,
        localAdminId: SECOND_LOCAL_ADMIN_ID,
        localAdminEmail: "second-local@example.test",
      })
    ).rejects.toThrow(/forced audit failure/i);

    const rolledBack = await database.query(`
      select
        (select count(*)::int from public.profiles
          where id = '${SECOND_LOCAL_ADMIN_ID}') as profiles,
        (select count(*)::int from public.organization_members
          where organization_id = '${SECOND_ORGANIZATION_ID}') as memberships,
        (select count(*)::int from public.organization_onboarding_runs
          where organization_id = '${SECOND_ORGANIZATION_ID}') as runs,
        (select license_status from public.organizations
          where id = '${SECOND_ORGANIZATION_ID}') as license_status
    `);
    expect(rolledBack.rows[0]).toEqual({
      profiles: 0,
      memberships: 0,
      runs: 0,
      license_status: "pending_approval",
    });

    await database.exec(
      "drop trigger reject_second_onboarding on public.organization_onboarding_runs"
    );
    const secondOnboarding = await callOnboarding({
      idempotencyKey: SECOND_IDEMPOTENCY_KEY,
      organizationId: SECOND_ORGANIZATION_ID,
      localAdminId: SECOND_LOCAL_ADMIN_ID,
      localAdminEmail: "second-local@example.test",
    });
    await database.exec("set role authenticated");
    try {
      const secondClaim = await database.query(
        `select * from public.claim_onboarding_email_attempt(
          $1::uuid, 'initial_delivery'::text, 'První pokus druhé obce'::text
        )`,
        [secondOnboarding.rows[0].onboarding_run_id]
      );
      await database.query(
        `select * from public.complete_onboarding_email_attempt(
          $1::uuid, 'delivery_unknown'::text, 'smtp_delivery_unknown'::text
        )`,
        [secondClaim.rows[0].attempt_id]
      );
      const resolution = await database.query(
        `select * from public.resolve_onboarding_email_without_resend(
          $1::uuid, 'Příjemce potvrdil doručení jiným kanálem'::text
        )`,
        [secondOnboarding.rows[0].onboarding_run_id]
      );
      expect(resolution.rows[0]).toMatchObject({
        email_status: "delivery_unknown",
        resolved: true,
      });
      const noResend = await database.query(
        `select * from public.claim_onboarding_email_attempt(
          $1::uuid,
          'confirm_not_delivered_and_retry'::text,
          'Tato pozdní akce už nesmí vytvořit další pokus'::text
        )`,
        [secondOnboarding.rows[0].onboarding_run_id]
      );
      expect(noResend.rows[0]).toMatchObject({ claimed: false });
    } finally {
      await database.exec("reset role");
    }
  });
});
