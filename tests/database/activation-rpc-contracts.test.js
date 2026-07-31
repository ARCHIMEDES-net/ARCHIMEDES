import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";

const repositoryRoot = process.cwd();

function read(relativePath) {
  return fs.readFileSync(path.join(repositoryRoot, relativePath), "utf8");
}

function normalized(relativePath) {
  return read(relativePath).replace(/\s+/g, " ").trim().toLowerCase();
}

describe("customer activation RPC security contracts", () => {
  const activationApi = read("pages/api/admin/activate-municipality.js");
  const activationApiNormalized = activationApi.replace(/\s+/g, " ").toLowerCase();
  const retiredRpcGrants = normalized(
    "supabase/migrations/20260731061347_revoke_obsolete_activation_rpc_grants.sql"
  );
  const baseline = normalized(
    "supabase/migrations/20260730080347_production_public_schema_baseline.sql"
  );

  it("uses only the v2 activation RPC from the production admin API", () => {
    expect(activationApi).toContain('"activate_customer_with_admin_v2"');
    expect(activationApi).not.toMatch(/rpc\(\s*["']activate_customer_with_admin["']/);
    expect(activationApi).not.toMatch(/rpc\(\s*["']activate_municipality_with_admin["']/);
  });

  it("requires a platform-admin check before invoking the activation RPC", () => {
    const adminCheckIndex = activationApiNormalized.indexOf(
      "await requireplatformadmin(req, res, supabaseadmin)"
    );
    const rpcIndex = activationApiNormalized.indexOf(
      'rpc( "activate_customer_with_admin_v2"'
    );

    expect(adminCheckIndex).toBeGreaterThanOrEqual(0);
    expect(rpcIndex).toBeGreaterThan(adminCheckIndex);
  });

  it("keeps obsolete activation RPCs unavailable to anon and authenticated", () => {
    for (const signature of [
      "public.activate_customer_with_admin(uuid, uuid, text, text, boolean)",
      "public.activate_municipality_with_admin(uuid, uuid, text, text, boolean)",
    ]) {
      expect(retiredRpcGrants).toContain(
        `revoke execute on function ${signature} from anon, authenticated`
      );
      expect(retiredRpcGrants).toContain(
        `grant execute on function ${signature} to service_role`
      );
    }
  });

  it("keeps the v2 activation function protected by an internal admin assertion", () => {
    expect(baseline).toContain("activate_customer_with_admin_v2");
    expect(baseline).toMatch(
      /activate_customer_with_admin_v2[\s\S]*?if not public\.is_admin\(\) then[\s\S]*?raise exception/
    );
  });
});
