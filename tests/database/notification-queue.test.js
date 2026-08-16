import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";

const migration = fs.readFileSync(
  path.join(
    process.cwd(),
    "supabase/migrations/20260815203000_add_notification_enqueue_rpc.sql"
  ),
  "utf8"
).toLowerCase();

describe("notification queue database contract", () => {
  it("defaults every session to internal-only delivery", () => {
    expect(migration).toContain("notification_delivery_policy text not null default 'in_app_only'");
    expect(migration).toContain("'in_app_and_push'");
    expect(migration).toContain("'archimedes_all'");
  });

  it("keeps the idempotent enqueue RPC server-only", () => {
    expect(migration).toContain("on conflict (dedupe_key) do nothing");
    expect(migration).toContain(
      "revoke all on function public.enqueue_notification_candidates(jsonb)\n  from public, anon, authenticated, service_role"
    );
    expect(migration).toContain(
      "grant execute on function public.enqueue_notification_candidates(jsonb)\n  to service_role"
    );
  });

  it("indexes the generator filters and joins", () => {
    expect(migration).toContain("broadcast_sessions_notification_generation_idx");
    expect(migration).toContain("notification_preferences_activity_code_idx");
    expect(migration).toContain("user_interests_interest_slug_idx");
  });

  it("only prepares queued delivery rows and contains no provider integration", () => {
    expect(migration).toContain("'queued'");
    expect(migration).not.toContain("http_post");
    expect(migration).not.toContain("send_mail");
  });
});
