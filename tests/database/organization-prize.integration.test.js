import fs from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { beforeAll, afterAll, describe, it, expect } from "vitest";
const db = new PGlite();
const ADMIN = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const MEMBER = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const baseline = fs.readFileSync("supabase/migrations/20260730080347_production_public_schema_baseline.sql", "utf8");
const migration = fs.readFileSync("supabase/migrations/20260917104706_organization_prize_license.sql", "utf8");
async function asUser(sql, args=[], user=ADMIN) {
 await db.query("select set_config('request.jwt.claim.sub',$1,false)",[user]);
 await db.exec("set role authenticated");
 try { return await db.query(sql,args); } finally { await db.exec("reset role"); }
}
async function org(type="school",parent=null) {
 return (await db.query("insert into organizations(name,org_type,status,license_status,parent_organization_id,join_code) values ('Test', $1, 'active','pending_approval',$2,gen_random_uuid()::text) returning id",[type,parent])).rows[0].id;
}
const grant = (id,start="2026-09-17",user=ADMIN)=>asUser("select * from grant_organization_prize($1,$2,'Test competition')",[id,start],user);
async function access(id) {
 await db.query("delete from organization_members where user_id=$1",[MEMBER]);
 await db.query("insert into organization_members values ($1,$2,'member','active')",[id,MEMBER]);
 await db.query("update profiles set active_organization_id=$1 where id=$2",[id,MEMBER]);
 return { mode:(await asUser("select license_status from get_my_organizations()",[],MEMBER)).rows[0]?.license_status,
   archive:(await asUser("select has_active_licensed_membership() allowed",[],MEMBER)).rows[0].allowed,
   events:(await asUser("select * from get_portal_archive_events()",[],MEMBER)).rows.length,
   sessions:(await asUser("select * from get_portal_broadcast_sessions(array['cccccccc-cccc-4ccc-8ccc-cccccccccccc'::uuid])",[],MEMBER)).rows.length };
}
beforeAll(async()=>{
 await db.exec(`create role authenticated; create role anon; create role service_role; create schema auth;
 create function auth.uid() returns uuid language sql as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
 create function public.is_platform_admin() returns boolean language sql as $$ select auth.uid()='${ADMIN}'::uuid $$;
 grant usage on schema auth to authenticated;
 create table public.organization_members(organization_id uuid,user_id uuid,role_in_org text,status text);
 create table public.profiles(id uuid,active_organization_id uuid,is_active boolean);
 insert into profiles values ('${MEMBER}',null,true);
 create table public.municipality_card_changes(id uuid default gen_random_uuid(),organization_id uuid,actor_id uuid,action text,previous_values jsonb,current_values jsonb);
 create table public.events(id uuid,title text,starts_at timestamptz,category text,audience_groups text[],audience text,worksheet_url text,is_published boolean,poster_url text,stream_url text);
 create table public.broadcast_sessions(id uuid,event_id uuid,status text,viewer_url text,recording_url text,recording_status text,starts_at timestamptz,ended_at timestamptz,access_mode text,is_published boolean,moderator_name text,guest_1_name text,guest_2_name text,guest_3_name text,guest_4_name text,guest_5_name text,external_meeting_id text,created_at timestamptz);
 insert into events(id,is_published,starts_at) values ('cccccccc-cccc-4ccc-8ccc-cccccccccccc',true,now()-interval '1 day');
 insert into broadcast_sessions(event_id,is_published,recording_status,recording_url) values ('cccccccc-cccc-4ccc-8ccc-cccccccccccc',true,'published','https://example.test/recording');`);
 await db.exec(baseline.match(/CREATE TABLE IF NOT EXISTS "public"\."organizations" \([\s\S]*?\n\);/)[0].replace('"extensions"."uuid_generate_v4"()', 'gen_random_uuid()'));
 await db.exec(`alter table organizations drop constraint organizations_org_type_check;
 alter table organizations drop constraint organizations_type_allowed;
 alter table organizations enable row level security;
 grant select,update on organizations to authenticated;
 grant insert on municipality_card_changes to authenticated;
 create policy admin_all on organizations for all to authenticated using (is_platform_admin()) with check(is_platform_admin());`);
 await db.exec(migration);
},30000);
afterAll(()=>db.close());
describe("organization-only competition prize",()=>{
 it("grants to a child school, preserves its parent, and does not license siblings",async()=>{
  const parent=await org("municipality"),school=await org("school",parent),sibling=await org("school",parent);
  const {rows:[saved]}=await grant(school);
  expect(saved).toMatchObject({parent_organization_id:parent,license_plan:"competition_prize_12m",billing_status:"not_applicable",contract_status:"pending"});
  expect(await access(school)).toEqual({mode:"active",archive:true,events:1,sessions:1});
  for(const id of [parent,sibling]) expect(await access(id)).toEqual({mode:"pending_approval",archive:false,events:0,sessions:0});
 });
 it("never inherits a prize from a municipality or foundation",async()=>{
  for(const type of ["municipality","foundation"]){const parent=await org(type), child=await org("school",parent);await grant(parent);
   expect((await access(parent)).archive).toBe(true);
   expect(await access(child)).toEqual({mode:"pending_approval",archive:false,events:0,sessions:0});}
 });
 it("blocks stale active child flags under a prize-only parent",async()=>{
  const parent=await org("municipality"),child=await org("school",parent);await grant(parent);
  await db.query("update organizations set license_status='active' where id=$1",[child]);
  expect(await access(child)).toEqual({mode:"inactive",archive:false,events:0,sessions:0});
 });
 it("supports senior clubs; future and expired prizes give no access",async()=>{
  for(const start of ["2098-01-01","2020-01-01"]){const id=await org("senior_club");await grant(id,start);expect(await access(id)).toEqual({mode:"inactive",archive:false,events:0,sessions:0});}
 });
 it("keeps normal inherited access after the child's prize expires",async()=>{
  const parent=await org("municipality"),child=await org("school",parent);await grant(child,"2020-01-01");
  await db.query("update organizations set license_plan='paid_annual',license_status='active',license_valid_until='2099-01-01' where id=$1",[parent]);
  expect(await access(child)).toEqual({mode:"active",archive:true,events:1,sessions:1});
 });
 it("rejects ordinary users, missing start, unknown plans and invalid prize terms",async()=>{
  const id=await org();await expect(grant(id,null)).rejects.toMatchObject({code:"22023"});
  await expect(grant(id,"2026-09-17",MEMBER)).rejects.toMatchObject({code:"42501"});
  await expect(db.query("update organizations set license_plan='unknown' where id=$1",[id])).rejects.toMatchObject({code:"23514"});
  await expect(db.query("update organizations set license_plan='competition_prize_12m' where id=$1",[id])).rejects.toMatchObject({code:"23514"});
  await db.exec("set role anon");try { await expect(db.query("select grant_organization_prize($1,'2026-09-17')",[id])).rejects.toMatchObject({code:"42501"}); }finally {await db.exec("reset role");}
 });
 it("preserves valid existing licences and makes retries idempotent",async()=>{
  const id=await org();await grant(id);const before=(await db.query("select * from organizations where id=$1",[id])).rows[0];
  await grant(id);expect((await db.query("select * from organizations where id=$1",[id])).rows[0]).toEqual(before);
  expect((await db.query("select count(*)::int n from municipality_card_changes where organization_id=$1",[id])).rows[0].n).toBe(1);
  await expect(grant(id,"2026-10-01")).rejects.toMatchObject({code:"23505"});
  for(const plan of ["paid_monthly","paid_annual","classroom_free_12m"]){const paid=await org();await db.query("update organizations set license_plan=$1,license_status='active',license_valid_until='2099-01-01' where id=$2",[plan,paid]);await expect(grant(paid)).rejects.toMatchObject({code:"23505"});expect((await access(paid)).archive).toBe(true);}
 });
 it("uses Prague calendar dates across DST and leap years",async()=>{
  const id=await org();await grant(id,"2024-02-29");
  expect((await db.query("select to_char(license_valid_until at time zone 'Europe/Prague','YYYY-MM-DD HH24:MI:SS.US') ends from organizations where id=$1",[id])).rows[0].ends).toBe("2025-02-27 23:59:59.999999");
 });
});
