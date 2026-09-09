import fs from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { beforeAll, afterAll, describe, it, expect } from "vitest";

const sql = fs.readFileSync("supabase/migrations/20260909133121_classroom_municipality_cards.sql", "utf8");
const baseline = fs.readFileSync("supabase/migrations/20260730080347_production_public_schema_baseline.sql", "utf8");
const db = new PGlite();
const ADMIN = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const MEMBER = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
let municipality;

async function asUser(query, params = [], user = ADMIN) {
  await db.query("select set_config('request.jwt.claim.sub', $1, false)", [user]);
  await db.exec("set role authenticated");
  try { return await db.query(query, params); }
  finally { await db.exec("reset role"); }
}
const save = (name, { id = null, ico = null, address = null, contact = null, email = null, verified = true, user = ADMIN } = {}) =>
  asUser("select * from public.save_classroom_municipality_card($1,$2,$3,$4,$5,$6,null,$7,$8)", [id,name,ico,address,contact,email,verified,"Předávací protokol TEST"], user);

beforeAll(async () => {
  await db.exec(`create role authenticated; create role anon; create role service_role;
    create schema auth; create table auth.users(id uuid primary key);
    insert into auth.users values ('${ADMIN}'), ('${MEMBER}');
    create function auth.uid() returns uuid language sql as $$ select nullif(current_setting('request.jwt.claim.sub', true),'')::uuid $$;
    create function public.is_platform_admin() returns boolean language sql as $$ select auth.uid() = '${ADMIN}'::uuid $$;
    create function public.unaccent(text) returns text language sql immutable as $$ select translate($1,'áčďéěíňóřšťúůýž','acdeeinorstuuyz') $$;
    grant usage on schema auth to authenticated;
    grant select on auth.users to authenticated;
    create sequence public.obec_registration_seq;
  `);
  const table = baseline.match(/CREATE TABLE IF NOT EXISTS "public"\."organizations" \([\s\S]*?\n\);/)[0]
    .replace('"extensions"."uuid_generate_v4"()', 'gen_random_uuid()');
  await db.exec(table);
  await db.exec(`alter table public.organizations add primary key(id);
    alter table public.organizations add unique(registration_number);
    alter table public.organizations add unique(join_code);
    alter table public.organizations enable row level security;
    grant select,insert,update on public.organizations to authenticated;
    grant usage,select on public.obec_registration_seq to authenticated;
    create policy admin_all on public.organizations for all to authenticated using(public.is_platform_admin()) with check(public.is_platform_admin());
    create table public.organization_members(id uuid primary key default gen_random_uuid(),organization_id uuid,user_id uuid,role_in_org text,status text);
    create table public.activity_categories(code text primary key, section text, is_active boolean, sort_order integer);
    create table public.organization_activities(organization_id uuid,activity_code text,custom_text text);
    grant select on public.activity_categories to authenticated;
    grant select,insert on public.organization_activities to authenticated;
  `);
  for (const name of ["generate_join_code", "generate_obec_registration_number", "generate_spolek_registration_number"]) {
    const start = baseline.indexOf(`CREATE OR REPLACE FUNCTION "public"."${name}"()`);
    const end = baseline.indexOf("$$;", start) + 3;
    await db.exec(baseline.slice(start, end));
    await db.exec(`create trigger ${name} before insert on public.organizations for each row execute function public.${name}()`);
  }
  await db.exec(sql);
}, 30000);
afterAll(async () => { await db.close(); });

describe("classroom municipality card with real SQL", () => {
  it("creates from name only, assigns a number and one calendar year without invented contacts", async () => {
    const result = await save("Testovací obec");
    municipality = result.rows[0];
    expect(municipality.registration_number).toMatch(/^\d{4}$/);
    const { rows: [row] } = await db.query(`select *,
      ((license_valid_until + interval '1 microsecond') at time zone 'Europe/Prague') =
      ((license_started_at at time zone 'Europe/Prague') + interval '1 year') as correct_year
      from organizations where id=$1`, [municipality.id]);
    expect(row).toMatchObject({ license_plan: "classroom_free_12m", license_status: "active", status: "active",
      contact_email: null, legal_identifier: null, contract_status: "pending", billing_status: "not_applicable", correct_year: true });
    expect((await db.query("select count(*)::int n from municipality_card_changes where organization_id=$1",[municipality.id])).rows[0].n).toBe(1);
  });
  it("rejects duplicates, including accent/case variations, without renewing the licence", async () => {
    await expect(save("  TESTOVACI OBEC  ")).rejects.toMatchObject({ code: "23505" });
    expect((await db.query("select count(*)::int n from organizations")).rows[0].n).toBe(1);
  });
  it("requires explicit eligibility and rejects ordinary members and anonymous calls", async () => {
    await expect(save("Unverified", { verified: false })).rejects.toMatchObject({ code: "22023" });
    await expect(save("Unauthorized", { user: MEMBER })).rejects.toMatchObject({ code: "42501" });
    await db.exec("set role anon");
    try { await expect(db.query("select * from save_classroom_municipality_card(null,'Anonymous',null,null,null,null,null,true,'protokol test')")).rejects.toMatchObject({ code: "42501" }); }
    finally { await db.exec("reset role"); }
  });
  it("allows immediate school creation with a normal email and keeps it under the municipality", async () => {
    const result = await asUser("select * from prepare_classroom_school($1,'Základní škola','12345678','123456789','Školní 1',null,null,null)", [municipality.id]);
    expect(result.rows[0].parent_organization_id).toBe(municipality.id);
    expect(result.rows[0].registration_number).toBe(`${municipality.registration_number}-SK-01`);
    expect((await db.query("select status,license_plan,join_code from organizations where id=$1",[result.rows[0].organization_id])).rows[0]).toMatchObject({ status: "active", license_plan: null });
    await expect(asUser("select * from prepare_classroom_school($1,'Základní škola','12345678','123456789','Školní 1',null,null,null)", [municipality.id])).rejects.toMatchObject({ code: "23505" });
  });
  it("updates incomplete details without changing licence, registration number or children", async () => {
    const before = (await db.query("select * from organizations where id=$1",[municipality.id])).rows[0];
    await save("Testovací obec", {id: municipality.id,ico:"00293199",address:"Obecní 1",contact:"Jana Nová",email:"JANA@example.test"});
    const after = (await db.query("select * from organizations where id=$1",[municipality.id])).rows[0];
    for (const field of ["registration_number","license_status","license_plan","license_started_at","license_valid_until","activated_at","activated_by"])
      expect(after[field]).toEqual(before[field]);
    expect(after.contact_email).toBe("jana@example.test");
    expect((await db.query("select count(*)::int n from organizations where parent_organization_id=$1",[municipality.id])).rows[0].n).toBe(1);
    await expect(save("Different name", {ico:"00293199"})).rejects.toMatchObject({ code: "23505" });
  });
  it("rolls back the municipality if audit insertion fails", async () => {
    await db.exec("create function reject_card_audit() returns trigger language plpgsql as $$ begin raise exception 'forced audit failure'; end $$; create trigger reject_audit before insert on municipality_card_changes for each row execute function reject_card_audit()");
    try { await expect(save("Rollback municipality")).rejects.toThrow("forced audit failure"); }
    finally { await db.exec("drop trigger reject_audit on municipality_card_changes"); }
    expect((await db.query("select count(*)::int n from organizations where name='Rollback municipality'")).rows[0].n).toBe(0);
  });
  it("activates an existing never-activated card without a local administrator or accepted contract", async () => {
    const { rows: [existing] } = await db.query("insert into organizations(name,org_type,status,license_status) values ('Existing draft','municipality','inactive','pending_approval') returning id,registration_number");
    const { rows: [result] } = await asUser("select * from save_classroom_municipality_card($1,'Existing draft',null,null,null,null,null,true,'Protokol realizace TEST',true)",[existing.id]);
    expect(result).toEqual(existing);
    expect((await db.query("select license_status,contract_status,license_activation_basis from organizations where id=$1",[existing.id])).rows[0]).toMatchObject({license_status:"active",contract_status:"pending",license_activation_basis:"internal_classroom_free_access_program"});
    await expect(asUser("select * from save_classroom_municipality_card($1,'Existing draft',null,null,null,null,null,true,'Protokol realizace TEST',true)",[existing.id])).rejects.toMatchObject({code:"22023"});
  });
  it("rejects duplicate IZO across municipalities even with a different school name", async () => {
    const { rows: [other] } = await save("Other municipality");
    await expect(asUser("select * from prepare_classroom_school($1,'Different school','87654321','123456789','Other address',null,null,null)",[other.id])).rejects.toMatchObject({code:"23505"});
  });
});
