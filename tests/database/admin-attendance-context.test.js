import fs from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { describe, it, expect } from "vitest";
const migration = fs.readFileSync("supabase/migrations/20260911074127_exclude_platform_admin_attendance.sql", "utf8");
describe("platform administrators cannot register school attendance", () => {
  it("excludes historical admin rows, blocks admin inserts, allows real school users and preserves uniqueness", async () => {
    const db = new PGlite();
    try {
      await db.exec(`
        create role authenticated;
        create table platform_admins(user_id text, role text);
        insert into platform_admins values ('admin','super_admin');
        create function is_admin() returns boolean language sql as $$ select current_setting('test.actor') = 'admin' $$;
        create table event_attendees (id int primary key, event_id text, organization_id text, user_id text,
          constraint event_attendees_event_id_organization_id_key unique(event_id, organization_id));
        insert into event_attendees values (1,'event','school','admin'),(2,'event','other','teacher');
        alter table event_attendees enable row level security;
        grant select,insert on event_attendees to authenticated;
        create policy existing_insert on event_attendees for insert to authenticated
          with check (user_id = current_setting('test.actor') and organization_id = current_setting('test.org'));
        create policy existing_select on event_attendees for select to authenticated using (true);
      `);
      await db.exec(migration);
      expect((await db.query('select count(*)::int as n from event_attendees')).rows[0].n).toBe(2);
      await db.exec("set role authenticated; set test.actor='admin'; set test.org='school';");
      expect((await db.query('select id from event_attendees')).rows).toEqual([{ id: 2 }]);
      await expect(db.exec("insert into event_attendees(id,event_id,organization_id,user_id) values(3,'new','school','admin')")).rejects.toThrow(/row-level security/);
      await db.exec("set test.actor='teacher'; insert into event_attendees(id,event_id,organization_id,user_id) values(3,'event','school','teacher');");
      await expect(db.exec("insert into event_attendees(id,event_id,organization_id,user_id) values(4,'event','school','teacher')")).rejects.toThrow(/unique/);
      await expect(db.exec("insert into event_attendees(id,event_id,organization_id,user_id,excluded_admin_context) values(5,'new','school','teacher',true)")).rejects.toThrow(/row-level security/);
      await expect(db.exec("insert into event_attendees(id,event_id,organization_id,user_id) values(6,'new','unrelated','teacher')")).rejects.toThrow(/row-level security/);
    } finally { await db.close(); }
  });
});
