import fs from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { describe, it, expect } from "vitest";
const previous = fs.readFileSync("supabase/migrations/20260911074127_exclude_platform_admin_attendance.sql", "utf8");
const migration = fs.readFileSync("supabase/migrations/20260915121542_personal_event_attendance.sql", "utf8");
const admin = '00000000-0000-4000-8000-000000000001';
const teacher = '00000000-0000-4000-8000-000000000002';
const other = '00000000-0000-4000-8000-000000000003';
const school = '00000000-0000-4000-8000-000000000004';
const school2 = '00000000-0000-4000-8000-000000000005';
describe('personal attendance', () => {
  it('restores historical people once and enforces self-only registration and private lists', async () => {
    const db = new PGlite();
    try {
      await db.exec(`
        create role authenticated;
        create schema auth;
        create function auth.uid() returns uuid language sql as $$ select current_setting('test.actor')::uuid $$;
        grant usage on schema auth to authenticated;
        create function is_admin() returns boolean language sql as $$ select auth.uid() = '${admin}'::uuid $$;
        create table platform_admins(user_id uuid, role text);
        insert into platform_admins values ('${admin}','super_admin');
        create table profiles(id uuid, is_active boolean);
        insert into profiles values ('${admin}',true),('${teacher}',true),('${other}',true);
        create table events(id text, is_published boolean);
        insert into events values ('old',true),('new',true),('draft',false);
        grant select on profiles,events to authenticated;
        create table event_attendees(id int primary key, event_id text, organization_id uuid not null,
          user_id uuid, created_at timestamptz default now(),
          constraint event_attendees_event_id_organization_id_key unique(event_id,organization_id));
        insert into event_attendees(id,event_id,organization_id,user_id) values
          (1,'old','${school}','${admin}'),(2,'old','${school2}','${admin}');
        alter table event_attendees enable row level security;
        grant select,insert on event_attendees to authenticated;
        create policy event_attendees_select on event_attendees for select to authenticated using(true);
        create policy existing_insert on event_attendees for insert to authenticated with check
          (user_id = auth.uid() and organization_id = '${school}'::uuid
           and current_setting('test.licensed') = 'true'
           and exists(select 1 from events e where e.id=event_id and e.is_published));
      `);
      await db.exec(previous);
      await db.exec(migration);
      const history = (await db.query('select id,organization_id,historical_organization_id,excluded_admin_context from event_attendees order by id')).rows;
      expect(history).toHaveLength(2);
      expect(history[0]).toMatchObject({ organization_id:null, historical_organization_id:school, excluded_admin_context:false });
      expect(history[1].excluded_admin_context).toBe(true);
      await db.exec(`set role authenticated; set test.actor='${admin}'; set test.licensed='true';`);
      expect((await db.query('select id from event_attendees')).rows).toHaveLength(1);
      await db.exec(`insert into event_attendees(id,event_id,user_id) values(3,'new','${admin}')`);
      await expect(db.exec(`insert into event_attendees(id,event_id,organization_id,user_id) values(4,'new','${school}','${admin}')`)).rejects.toThrow(/row-level security/);
      await expect(db.exec(`insert into event_attendees(id,event_id,user_id) values(4,'draft','${admin}')`)).rejects.toThrow(/row-level security/);
      await db.exec(`set test.actor='${teacher}'; insert into event_attendees(id,event_id,organization_id,user_id) values(4,'new','${school}','${teacher}')`);
      await db.exec(`set test.actor='${other}'; insert into event_attendees(id,event_id,organization_id,user_id) values(5,'new','${school}','${other}')`);
      expect((await db.query('select id from event_attendees')).rows).toEqual([{id:5}]);
      await expect(db.exec(`insert into event_attendees(id,event_id,organization_id,user_id) values(6,'new','${school}','${other}')`)).rejects.toThrow(/unique/);
      await expect(db.exec(`insert into event_attendees(id,event_id,organization_id,user_id) values(6,'old','${school}','${teacher}')`)).rejects.toThrow(/row-level security/);
      await expect(db.exec(`insert into event_attendees(id,event_id,user_id) values(6,'old','${other}')`)).rejects.toThrow(/row-level security/);
      await db.exec("set test.licensed='false'");
      await expect(db.exec(`insert into event_attendees(id,event_id,organization_id,user_id) values(6,'old','${school}','${other}')`)).rejects.toThrow(/row-level security/);
    } finally { await db.close(); }
  });
});
