import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";

const repositoryRoot = process.cwd();
const migrationArchive =
  "supabase/migration_history/pre_baseline_2026-07-30";

function read(relativePath) {
  return fs.readFileSync(path.join(repositoryRoot, relativePath), "utf8");
}

function normalized(relativePath) {
  return read(relativePath).replace(/\s+/g, " ").trim().toLowerCase();
}

function policyBlock(sql, policyName) {
  const escaped = policyName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return sql.match(
    new RegExp(`create policy "${escaped}"[\\s\\S]*?;`, "i")
  )?.[0];
}

function bucketUpdate(sql, bucketId) {
  const escaped = bucketId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return sql.match(
    new RegExp(`update storage\\.buckets[\\s\\S]*?where id = '${escaped}';`, "i")
  )?.[0];
}

describe("Supabase RLS and privileged-table assumptions", () => {
  const onboarding = normalized(
    `${migrationArchive}/0014_municipality_onboarding.sql`
  );
  const backups = normalized(
    `${migrationArchive}/0004_backup_tables_rls_lockdown.sql`
  );
  const broadcasts = normalized(
    `${migrationArchive}/0013_webmeeting_integration_foundation.sql`
  );

  it.each([
    "municipality_organization_invites",
    "api_rate_limits",
  ])("keeps the server-only %s table behind RLS and service_role grants", (table) => {
    expect(onboarding).toContain(
      `alter table public.${table} enable row level security`
    );
    expect(onboarding).toContain(
      `revoke all on public.${table} from public, anon, authenticated`
    );
    expect(onboarding).toMatch(
      new RegExp(
        `grant select, insert, update, delete on public\\.${table} to service_role`
      )
    );
  });

  it("keeps WebMeeting participant mappings inaccessible without an RLS policy", () => {
    expect(broadcasts).toContain(
      "alter table public.broadcast_participants enable row level security"
    );
    expect(broadcasts).not.toContain(
      "create policy"
    );
  });

  it("keeps all historical backup tables behind deny-by-default RLS", () => {
    const protectedTables = [
      "backup_orders_start_to_delete_orgs",
      "backup_orders_start_null_pending",
      "backup_organizations_to_delete",
      "backup_profiles_before_cleanup",
      "backup_organization_members_to_delete",
      "backup_organizations_final_cleanup",
      "backup_organization_members_final_cleanup",
      "backup_orders_start_final_cleanup",
      "backup_profiles_final_cleanup",
    ];

    for (const table of protectedTables) {
      expect(backups).toContain(
        `alter table public.${table} enable row level security`
      );
    }
    expect(backups).not.toContain("create policy");
  });

  it("removes direct organization reads and exposes the scoped membership RPC", () => {
    const organizations = normalized(
      `${migrationArchive}/0008_protect_organization_registration_codes.sql`
    );

    expect(organizations).toContain(
      "create policy organizations_direct_select_platform_admin on public.organizations as restrictive for select to authenticated using (is_admin())"
    );
    expect(organizations).toContain(
      "revoke all on function public.get_my_organizations(uuid[]) from public"
    );
    expect(organizations).toContain(
      "revoke all on function public.get_my_organizations(uuid[]) from anon"
    );
    expect(organizations).toContain(
      "grant execute on function public.get_my_organizations(uuid[]) to authenticated"
    );
    expect(organizations).toContain(
      "when member.role_in_org = 'organization_admin' or is_admin() then child.join_code else null"
    );
  });
});

describe("Supabase SECURITY DEFINER and authorization hardening", () => {
  const onboarding = normalized(
    `${migrationArchive}/0014_municipality_onboarding.sql`
  );
  const functionHardening = normalized(
    `${migrationArchive}/20260729144014_harden_database_function_permissions.sql`
  );
  const profileHardening = normalized(
    `${migrationArchive}/20260729141756_harden_profile_authorization.sql`
  );

  it("allows only service_role to execute the database rate limiter", () => {
    const signature =
      "public.consume_api_rate_limit(text, text, integer, integer)";

    expect(onboarding).toContain("security definer set search_path = public");
    expect(onboarding).toContain(
      `revoke all on function ${signature} from public, anon, authenticated`
    );
    expect(onboarding).toContain(
      `grant execute on function ${signature} to service_role`
    );
    expect(onboarding).toContain("perform pg_advisory_xact_lock");
    expect(onboarding).toContain("for update");
  });

  it.each([
    "public.is_admin()",
    "public.is_platform_admin()",
    "public.is_org_admin(uuid)",
    "public.is_org_admin_member(uuid)",
    "public.is_school_admin()",
    "public.my_school_id()",
  ])("removes the default PUBLIC grant from authorization helper %s", (signature) => {
    expect(functionHardening).toContain(
      `revoke execute on function ${signature} from public, anon, authenticated`
    );
    expect(functionHardening).toContain(
      `grant execute on function ${signature} to authenticated, service_role`
    );
  });

  it.each([
    "public.generate_join_code()",
    "public.generate_obec_registration_number()",
    "public.generate_spolek_registration_number()",
    "public.marketplace_posts_tsv_update()",
    "public.set_portal_posts_updated_at()",
    "public.set_updated_at()",
  ])("locks down internal trigger/helper function %s", (signature) => {
    expect(functionHardening).toContain(
      `alter function ${signature} set search_path = public`
    );
    expect(functionHardening).toContain(
      `revoke execute on function ${signature} from public, anon, authenticated`
    );
  });

  it("prevents profile owners from changing authorization-bearing fields", () => {
    for (const column of [
      "id",
      "email",
      "role",
      "school_id",
      "is_active",
      "user_type",
      "created_at",
    ]) {
      expect(profileHardening).toContain(
        `new.${column} is distinct from old.${column}`
      );
    }

    expect(profileHardening).toContain(
      "member.user_id = auth.uid() and member.organization_id = new.active_organization_id and member.status = 'active'"
    );
    expect(profileHardening).toContain(
      "revoke all on function public.enforce_profile_self_update_security() from public, anon, authenticated"
    );
    expect(profileHardening).toContain(
      "before update on public.profiles"
    );
  });
});

describe("retired public database write paths", () => {
  it("retires only the legacy leads-to-Make trigger", () => {
    const retired = normalized(
      `${migrationArchive}/20260729184710_retire_legacy_lead_make_webhook.sql`
    );

    expect(retired).toContain(
      "drop trigger if exists new_lead_notification on public.leads"
    );
    expect(retired).not.toContain(
      "drop function"
    );
    expect(retired).not.toContain(
      "delete from"
    );
  });

  it("revokes direct client inserts for active server-side forms", () => {
    const retired = normalized(
      `${migrationArchive}/0018_remove_legacy_public_insert_policies.sql`
    );

    for (const table of ["access_requests", "orders_start", "leads"]) {
      expect(retired).toContain(
        `revoke insert on table public.${table} from anon, authenticated`
      );
    }
    expect(retired).toContain(
      'drop policy if exists "allow insert for anyone" on public.access_requests'
    );
    expect(retired).toContain(
      'drop policy if exists "public_insert_leads" on public.leads'
    );
  });

  it("revokes the retired demo onboarding insert path", () => {
    const retired = normalized(
      `${migrationArchive}/20260729142528_retire_demo_request_inserts.sql`
    );

    expect(retired).toContain(
      'drop policy if exists "allow_insert_demo_requests" on public.demo_requests'
    );
    expect(retired).toContain(
      "revoke insert on table public.demo_requests from anon, authenticated"
    );
  });
});

describe("Supabase Storage and upload boundary assumptions", () => {
  const storage = read(
    "supabase/migrations/20260730123543_reapply_storage_authorization.sql"
  );

  it.each(["posters", "worksheets", "announcements"])(
    "requires platform-admin authorization for every %s object operation",
    (bucket) => {
      for (const operation of ["select", "insert", "update", "delete"]) {
        const block = policyBlock(storage, `${bucket}_admin_${operation}`);
        expect(block, `${bucket} ${operation} policy`).toBeTruthy();
        expect(block).toMatch(/to authenticated/i);
        expect(block).toContain(`bucket_id = '${bucket}'`);
        expect(block).toContain("public.is_admin()");
      }
    }
  );

  it.each([
    ["portal-posts", "portal_posts_admin_select"],
    ["schools", "schools_admin_select"],
    ["marketplace", "marketplace_admin_select"],
  ])("limits %s object listing to platform admins", (bucket, policy) => {
    const block = policyBlock(storage, policy);
    expect(block).toBeTruthy();
    expect(block).toContain(`bucket_id = '${bucket}'`);
    expect(block).toContain("public.is_admin()");
  });

  it("removes public listing and the unrestricted marketplace upload policy", () => {
    expect(storage).toContain(
      'drop policy if exists "storage_marketplace_insert" on storage.objects;'
    );
    expect(storage).toContain(
      'drop policy if exists "mp_storage_read_auth" on storage.objects;'
    );
    expect(storage).toContain(
      'drop policy if exists "portal_posts_public_read" on storage.objects;'
    );
    expect(storage).toContain(
      'drop policy if exists "schools_public_read" on storage.objects;'
    );
  });

  it("enforces poster MIME types and a 7 MiB limit at the bucket boundary", () => {
    const update = bucketUpdate(storage, "posters");
    expect(update).toContain("file_size_limit = 7340032");
    expect(update).toContain("'image/jpeg'");
    expect(update).toContain("'image/png'");
    expect(update).toContain("'image/webp'");
    expect(update).not.toContain("'image/svg+xml'");
  });

  it("enforces worksheet document types and a 15 MiB limit", () => {
    const update = bucketUpdate(storage, "worksheets");
    expect(update).toContain("file_size_limit = 15728640");
    for (const mime of [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ]) {
      expect(update).toContain(`'${mime}'`);
    }
  });

  it("enforces marketplace image types and a 7 MiB limit", () => {
    const update = bucketUpdate(storage, "marketplace");
    expect(update).toContain("file_size_limit = 7340032");
    for (const mime of ["image/jpeg", "image/png", "image/webp", "image/gif"]) {
      expect(update).toContain(`'${mime}'`);
    }
    expect(update).not.toContain("'image/svg+xml'");
  });

  it("keeps event upload UI limits aligned with storage enforcement", () => {
    const eventAdmin = read("pages/portal/admin/udalosti.js");

    expect(eventAdmin).toContain('file.type === "image/jpeg"');
    expect(eventAdmin).toContain('file.type === "image/png"');
    expect(eventAdmin).toContain('file.type === "image/webp"');
    expect(eventAdmin).toContain("file.size > 7 * 1024 * 1024");
    expect(eventAdmin).toContain("file.size > 15 * 1024 * 1024");
    expect(eventAdmin).toContain(
      'const allowedExts = ["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx"]'
    );
  });

  it("keeps marketplace upload paths scoped by authenticated user ID", () => {
    const createMarketplace = read("pages/portal/inzerce/novy.js");
    const editMarketplace = read("pages/portal/inzerce/edit/[id].js");

    expect(createMarketplace).toContain(
      "`${user.id}/${postId}/${Date.now()}-${safeName}`"
    );
    expect(editMarketplace).toContain(
      "`${currentUser.id}/${row.id}/${Date.now()}-${safeName}`"
    );
  });

  it("rejects absolute and traversal paths before server-side storage cleanup", () => {
    const deletePost = read("pages/api/portal-posts-delete.js");

    expect(deletePost).toContain('value.includes("\\0")');
    expect(deletePost).toContain('!value.startsWith("/")');
    expect(deletePost).toContain('!value.split("/").includes("..")');
    expect(deletePost).toContain(
      "[post.image_path, post.attachment_path].filter(isSafeStoragePath)"
    );
  });
});
